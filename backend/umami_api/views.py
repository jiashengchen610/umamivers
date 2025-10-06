from django.db import connection
from django.db.models import Q, F
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.core.cache import cache
import json
from decimal import Decimal

from .models import Ingredient, Alias, Chemistry, TCM, Flags
from .serializers import (
    IngredientListSerializer, 
    IngredientDetailSerializer,
    CompositionIngredientSerializer,
    CompositionResultSerializer
)


class CustomPagination(PageNumberPagination):
    page_size = 24
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data,
            'page': self.page.number,
            'total_pages': self.page.paginator.num_pages,
        })


def convert_to_grams(quantity: float, unit: str) -> float:
    """Convert quantity to grams based on unit"""
    unit_conversions = {
        'g': 1.0,
        'oz': 28.35,
        'tsp': 5.0,  # assuming water density
        'tbsp': 15.0,  # assuming water density
        'cup': 240.0,  # assuming water density
    }
    return quantity * unit_conversions.get(unit.lower(), 1.0)


class IngredientViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Ingredient.objects.select_related('chemistry', 'tcm', 'flags').prefetch_related('aliases')
    pagination_class = CustomPagination

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return IngredientDetailSerializer
        return IngredientListSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Get filter parameters
        query = self.request.query_params.get('q', '')
        sort_by = self.request.query_params.get('sort', 'synergy')
        
        # Umami filters
        umami_filters = self.request.query_params.getlist('umami[]')
        
        # Flavor role filters  
        flavor_filters = self.request.query_params.getlist('flavor[]')
        
        # TCM filters
        qi_filters = self.request.query_params.getlist('qi[]')
        flavor_tcm_filters = self.request.query_params.getlist('flavors[]')  # TCM Five Tastes
        meridian_filters = self.request.query_params.getlist('meridians[]')
        
        # Allergen filters
        allergens_include = self.request.query_params.getlist('allergens_include[]')
        allergens_exclude = self.request.query_params.getlist('allergens_exclude[]')
        
        # Dietary filters
        dietary_filters = self.request.query_params.getlist('dietary[]')
        
        # Category filters
        category_filters = self.request.query_params.getlist('category[]')
        
        # Range filters
        aa_min = self.request.query_params.get('aa_min')
        aa_max = self.request.query_params.get('aa_max')
        nuc_min = self.request.query_params.get('nuc_min')
        nuc_max = self.request.query_params.get('nuc_max')
        syn_min = self.request.query_params.get('syn_min')
        syn_max = self.request.query_params.get('syn_max')

        # Apply fuzzy search if query provided
        if query.strip():
            queryset = self._apply_fuzzy_search(queryset, query)

        # Apply filters
        if umami_filters:
            queryset = self._apply_umami_filters(queryset, umami_filters)
        
        if flavor_filters:
            queryset = self._apply_flavor_filters(queryset, flavor_filters)
        
        if qi_filters:
            queryset = self._apply_qi_filters(queryset, qi_filters)
            
        if flavor_tcm_filters:
            queryset = self._apply_tcm_flavor_filters(queryset, flavor_tcm_filters)
            
        if meridian_filters:
            queryset = self._apply_meridian_filters(queryset, meridian_filters)
        
        if allergens_include:
            queryset = self._apply_allergen_include_filters(queryset, allergens_include)
            
        if allergens_exclude:
            queryset = self._apply_allergen_exclude_filters(queryset, allergens_exclude)
        
        if dietary_filters:
            queryset = self._apply_dietary_filters(queryset, dietary_filters)
            
        if category_filters:
            queryset = self._apply_category_filters(queryset, category_filters)

        # Apply range filters
        if aa_min is not None:
            queryset = queryset.filter(chemistry__umami_aa__gte=aa_min)
        if aa_max is not None:
            queryset = queryset.filter(chemistry__umami_aa__lte=aa_max)
        if nuc_min is not None:
            queryset = queryset.filter(chemistry__umami_nuc__gte=nuc_min)
        if nuc_max is not None:
            queryset = queryset.filter(chemistry__umami_nuc__lte=nuc_max)
        if syn_min is not None:
            queryset = queryset.filter(chemistry__umami_synergy__gte=syn_min)
        if syn_max is not None:
            queryset = queryset.filter(chemistry__umami_synergy__lte=syn_max)

        # Apply sorting
        queryset = self._apply_sorting(queryset, sort_by)

        return queryset.distinct()

    def _apply_fuzzy_search(self, queryset, query):
        """Apply fuzzy search using PostgreSQL trigram similarity"""
        # Search in ingredient names and aliases
        search_query = Q()
        
        # Direct name search with similarity
        search_query |= Q(base_name__icontains=query)
        search_query |= Q(display_name__icontains=query)
        
        # Alias search
        search_query |= Q(aliases__name__icontains=query)
        
        # Use raw SQL for trigram search for better performance
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT DISTINCT i.id, 
                       GREATEST(
                           similarity(i.base_name, %s),
                           similarity(i.display_name, %s),
                           COALESCE(MAX(similarity(a.name, %s)), 0)
                       ) as search_score
                FROM ingredient i
                LEFT JOIN alias a ON i.id = a.ingredient_id
                WHERE similarity(i.base_name, %s) > 0.1 
                   OR similarity(i.display_name, %s) > 0.1
                   OR similarity(a.name, %s) > 0.1
                GROUP BY i.id, i.base_name, i.display_name
                ORDER BY search_score DESC
            """, [query, query, query, query, query, query])
            
            ingredient_ids = [row[0] for row in cursor.fetchall()]
            
        if ingredient_ids:
            # Preserve order from the similarity search
            ordering = 'FIELD(`id`, %s)' % ','.join(str(id) for id in ingredient_ids)
            queryset = queryset.filter(id__in=ingredient_ids)
        else:
            # Fallback to basic search
            queryset = queryset.filter(search_query)
            
        return queryset

    def _apply_umami_filters(self, queryset, umami_filters):
        """Apply umami-related filters (OR within group)"""
        umami_query = Q()
        for filter_type in umami_filters:
            if filter_type == 'umami_aa':
                umami_query |= Q(chemistry__umami_aa__gt=0)
            elif filter_type == 'umami_nuc':
                umami_query |= Q(chemistry__umami_nuc__gt=0)
            elif filter_type == 'umami_synergy':
                umami_query |= Q(chemistry__umami_synergy__gt=0)
        
        return queryset.filter(umami_query)

    def _apply_flavor_filters(self, queryset, flavor_filters):
        """Apply flavor role filters"""
        flavor_query = Q()
        for filter_type in flavor_filters:
            if filter_type == 'flavor_supporting':
                flavor_query |= Q(flags__flavor_tags__contains=[filter_type])
            elif filter_type == 'flavor_carrier':
                flavor_query |= Q(flags__flavor_tags__contains=[filter_type])
        
        return queryset.filter(flavor_query)

    def _apply_qi_filters(self, queryset, qi_filters):
        """Apply TCM Four Qi filters (OR within group)"""
        qi_query = Q()
        for qi in qi_filters:
            qi_query |= Q(tcm__four_qi__contains=[qi])
        
        return queryset.filter(qi_query)

    def _apply_tcm_flavor_filters(self, queryset, flavor_filters):
        """Apply TCM Five Tastes filters (OR within group)"""
        flavor_query = Q()
        for flavor in flavor_filters:
            flavor_query |= Q(tcm__five_flavors__contains=[flavor])
        
        return queryset.filter(flavor_query)

    def _apply_meridian_filters(self, queryset, meridian_filters):
        """Apply TCM Meridian filters (OR within group)"""
        meridian_query = Q()
        for meridian in meridian_filters:
            meridian_query |= Q(tcm__meridians__contains=[meridian])
        
        return queryset.filter(meridian_query)

    def _apply_allergen_include_filters(self, queryset, allergen_filters):
        """Include ingredients with specific allergens"""
        allergen_query = Q()
        for allergen in allergen_filters:
            allergen_query |= Q(flags__allergens__contains=[allergen])
        
        return queryset.filter(allergen_query)

    def _apply_allergen_exclude_filters(self, queryset, allergen_filters):
        """Exclude ingredients with specific allergens"""
        for allergen in allergen_filters:
            queryset = queryset.exclude(flags__allergens__contains=[allergen])
        
        return queryset

    def _apply_dietary_filters(self, queryset, dietary_filters):
        """Apply dietary restriction filters (OR within group)"""
        dietary_query = Q()
        for dietary in dietary_filters:
            dietary_query |= Q(flags__dietary_restrictions__contains=[dietary])
        
        return queryset.filter(dietary_query)

    def _apply_category_filters(self, queryset, category_filters):
        """Apply category filters (OR within group)"""
        return queryset.filter(category__in=category_filters)

    def _apply_sorting(self, queryset, sort_by):
        """Apply sorting based on sort parameter"""
        if sort_by == 'relevance':
            # For relevance sorting, maintain the order from fuzzy search if there's a query
            query = self.request.query_params.get('q', '')
            if query.strip():
                # Return queryset as-is since _apply_fuzzy_search already ordered by relevance
                return queryset
            else:
                # If no query, fall back to synergy sorting
                return queryset.order_by('-chemistry__umami_synergy', '-chemistry__umami_aa')
        elif sort_by == 'synergy':
            return queryset.order_by('-chemistry__umami_synergy', '-chemistry__umami_aa')
        elif sort_by == 'aa':
            return queryset.order_by('-chemistry__umami_aa', '-chemistry__umami_synergy')
        elif sort_by == 'nuc':
            return queryset.order_by('-chemistry__umami_nuc', '-chemistry__umami_synergy')
        elif sort_by == 'alpha':
            return queryset.order_by('display_name')
        elif sort_by == 'tcm':
            # TCM match sorting would need more complex logic based on selected filters
            return queryset.order_by('-chemistry__umami_synergy')
        else:
            return queryset.order_by('-chemistry__umami_synergy')

    @action(detail=False, methods=['post'])
    def compose_preview(self, request):
        """Calculate composition preview for given ingredients and quantities"""
        serializer = CompositionIngredientSerializer(data=request.data, many=True)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        composition_data = serializer.validated_data
        
        # Calculate totals
        total_glu = Decimal('0')
        total_asp = Decimal('0')
        total_imp = Decimal('0')
        total_gmp = Decimal('0')
        total_amp = Decimal('0')
        
        ingredients_data = []
        
        for item in composition_data:
            ingredient_id = item['ingredient_id']
            quantity = item['quantity']
            unit = item['unit']
            
            try:
                ingredient = Ingredient.objects.select_related('chemistry').get(id=ingredient_id)
                chemistry = ingredient.chemistry
                
                # Convert to grams
                quantity_grams = convert_to_grams(float(quantity), unit)
                
                # Calculate contribution (assuming chemistry values are per 100g)
                factor = Decimal(str(quantity_grams / 100.0))
                
                contrib_glu = chemistry.glu * factor
                contrib_asp = chemistry.asp * factor
                contrib_imp = chemistry.imp * factor
                contrib_gmp = chemistry.gmp * factor
                contrib_amp = chemistry.amp * factor
                
                total_glu += contrib_glu
                total_asp += contrib_asp
                total_imp += contrib_imp
                total_gmp += contrib_gmp
                total_amp += contrib_amp
                
                ingredients_data.append({
                    'id': ingredient.id,
                    'name': ingredient.display_name or ingredient.base_name,
                    'quantity': quantity,
                    'unit': unit,
                    'quantity_grams': quantity_grams,
                    'contributions': {
                        'glu': float(contrib_glu),
                        'asp': float(contrib_asp),
                        'imp': float(contrib_imp),
                        'gmp': float(contrib_gmp),
                        'amp': float(contrib_amp),
                    }
                })
                
            except Ingredient.DoesNotExist:
                return Response(
                    {'error': f'Ingredient with id {ingredient_id} not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        
        # Calculate derived values using EUC formula
        # EUC = Σ(ai·bi) + 1218 × (Σ(ai·bi)) × (Σ(aj·bj))
        # where ai = amino acid concentrations (g/100g)
        #       aj = nucleotide concentrations (g/100g)
        #       bi = relative umami weights for amino acids (Glu=1, Asp=0.077)
        #       bj = relative umami weights for nucleotides (IMP=1, GMP=2.3, AMP=0.18)
        #       1218 = synergistic constant
        
        # Convert to g/100g (current values should already be in this unit)
        def to_grams(value: Decimal) -> float:
            return float(value) / 1000.0

        glu_conc = to_grams(total_glu)
        asp_conc = to_grams(total_asp)
        imp_conc = to_grams(total_imp)
        gmp_conc = to_grams(total_gmp)
        amp_conc = to_grams(total_amp)

        # Apply relative umami weights using concentrations in g/100g
        weighted_aa = (glu_conc * 1.0) + (asp_conc * 0.077)  # Glu=1, Asp=0.077
        weighted_nuc = (imp_conc * 1.0) + (gmp_conc * 2.3) + (amp_conc * 0.18)  # IMP=1, GMP=2.3, AMP=0.18

        # Calculate EUC (Equivalent Umami Concentration)
        total_euc = weighted_aa + (1218 * weighted_aa * weighted_nuc if weighted_nuc > 0 else 0)

        # For backward compatibility, also calculate traditional values
        total_aa = total_glu + total_asp
        total_nuc = total_imp + total_gmp + total_amp
        total_synergy = Decimal(str(total_euc))
        
        # Prepare chart data
        chart_data = {
            'umami_aa': {
                'glu': float(total_glu),
                'asp': float(total_asp)
            },
            'umami_nuc': {
                'imp': float(total_imp),
                'gmp': float(total_gmp),
                'amp': float(total_amp)
            },
            'breakdown': {
                'total_aa': float(total_aa),
                'total_nuc': float(total_nuc),
                'total_synergy': float(total_synergy)
            }
        }
        
        result = {
            'total_aa': total_aa,
            'total_nuc': total_nuc,
            'total_synergy': total_synergy,
            'total_glu': total_glu,
            'total_asp': total_asp,
            'total_imp': total_imp,
            'total_gmp': total_gmp,
            'total_amp': total_amp,
            'ingredients': ingredients_data,
            'chart_data': chart_data
        }
        
        result_serializer = CompositionResultSerializer(result)
        return Response(result_serializer.data)
