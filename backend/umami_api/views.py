from django.db import connection
from django.db.models import Q, F
from django.contrib.postgres.search import TrigramSimilarity
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
        dietary_filters = self.request.query_params.getlist('dietary[]') or self.request.query_params.getlist('dietary')
        
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
        """Apply trigram similarity across names and aliases with weighted score"""
        # Compute trigram similarity for base/display names
        qs = queryset.annotate(
            sim_base=TrigramSimilarity('base_name', query),
            sim_display=TrigramSimilarity('display_name', query),
        )
        # Best name similarity
        qs = qs.annotate(sim_name=F('sim_base') + F('sim_display'))

        # Approximate alias similarity using EXISTS filter; we can't aggregate easily without GROUP BY, so
        # we boost items that have any alias containing the query, and otherwise rely on name similarity.
        alias_match = Q(aliases__name__icontains=query)
        qs = qs.annotate(
            sim_alias=F('sim_name')  # placeholder to keep types
        )
        # Filter low-similarity quickly
        qs = qs.filter(Q(sim_name__gt=0.05) | alias_match | Q(base_name__icontains=query) | Q(display_name__icontains=query))

        # Weighted score: names weighted higher than alias presence
        qs = qs.annotate(
            score=F('sim_name') * 0.9 + F('sim_base') * 0.1
        ).order_by('-score')

        return qs

    def _apply_umami_filters(self, queryset, umami_filters):
        """Apply umami-related filters based on chart levels (level 4+ = High)
        Level 4 thresholds based on weighted values at ~P90:
        - AA: 740 mg/100g (weighted)
        - Nuc: 650 mg/100g (weighted) 
        - Synergy: 1900 mg/100g (EUC)
        """
        umami_query = Q()
        for filter_type in umami_filters:
            if filter_type == 'umami_aa':
                # Level 4+ for AA: >= 740 mg/100g (weighted)
                umami_query |= Q(chemistry__umami_aa__gte=740)
            elif filter_type == 'umami_nuc':
                # Level 4+ for Nuc: >= 650 mg/100g (weighted)
                umami_query |= Q(chemistry__umami_nuc__gte=650)
            elif filter_type == 'umami_synergy':
                # Level 4+ for Synergy: >= 1900 mg/100g (EUC)
                umami_query |= Q(chemistry__umami_synergy__gte=1900)
        
        return queryset.filter(umami_query)

    def _apply_flavor_filters(self, queryset, flavor_filters):
        """Apply flavor role filters based on ingredient type and umami levels
        - High Umami: AA >= 740 OR Nuc >= 650 OR Synergy >= 1900 (level 4+)
        - Flavor Carrier: Staple foods (rice, bread, noodles, pasta, flour, wheat, grain)
        - Flavor Supporting: Everything else
        """
        flavor_query = Q()
        
        for filter_type in flavor_filters:
            if filter_type == 'high_umami':
                # Level 4+ on any metric (weighted values)
                flavor_query |= (
                    Q(chemistry__umami_aa__gte=740) |
                    Q(chemistry__umami_nuc__gte=650) |
                    Q(chemistry__umami_synergy__gte=1900)
                )
            elif filter_type == 'flavor_carrier':
                # Staple foods - search in name and category
                staples_query = Q()
                staple_terms = ['rice', 'bread', 'noodle', 'pasta', 'flour', 'wheat', 'grain']
                for term in staple_terms:
                    staples_query |= (
                        Q(base_name__icontains=term) |
                        Q(display_name__icontains=term) |
                        Q(category__icontains=term)
                    )
                # Exclude high umami items
                staples_query &= ~(
                    Q(chemistry__umami_aa__gte=740) |
                    Q(chemistry__umami_nuc__gte=650) |
                    Q(chemistry__umami_synergy__gte=1900)
                )
                flavor_query |= staples_query
                
            elif filter_type == 'flavor_supporting':
                # Everything that's not high umami and not a carrier
                high_umami = (
                    Q(chemistry__umami_aa__gte=740) |
                    Q(chemistry__umami_nuc__gte=650) |
                    Q(chemistry__umami_synergy__gte=1900)
                )
                staples = Q()
                staple_terms = ['rice', 'bread', 'noodle', 'pasta', 'flour', 'wheat', 'grain']
                for term in staple_terms:
                    staples |= (
                        Q(base_name__icontains=term) |
                        Q(display_name__icontains=term) |
                        Q(category__icontains=term)
                    )
                # Not high umami AND not carrier
                flavor_query |= (~high_umami & ~staples)
        
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
        """Apply dietary restriction filters with inclusive logic
        vegan -> vegan
        vegetarian -> vegetarian OR vegan
        pescatarian -> pescatarian OR vegetarian OR vegan
        non_vegetarian -> pescatarian OR (not vegan AND not vegetarian AND not pescatarian)
        """
        if not dietary_filters:
            return queryset

        # Special-case when only Non-vegetarian is selected to avoid OR-inflation
        normalized = { (f or '').lower() for f in dietary_filters }
        if normalized == {'non_vegetarian'}:
            return (
                queryset
                .exclude(flags__dietary_restrictions__contains=['vegan'])
                .exclude(flags__dietary_restrictions__contains=['vegetarian'])
                .filter(
                    Q(flags__dietary_restrictions__contains=['pescatarian']) |
                    Q(flags__dietary_restrictions__contains=['non_vegetarian'])
                )
            )

        combined_query = Q()

        def contains_any(values):
            q = Q()
            for v in values:
                q |= Q(flags__dietary_restrictions__contains=[v])
            return q

        for flt in dietary_filters:
            key = (flt or '').lower()
            vegan = ['vegan', 'Vegan', 'VEGAN']
            vegetarian = ['vegetarian', 'Vegetarian', 'VEGETARIAN']
            pescatarian = ['pescatarian', 'Pescatarian', 'PESCATARIAN']

            if key == 'vegan':
                combined_query |= contains_any(vegan)
            elif key == 'vegetarian':
                combined_query |= (contains_any(vegetarian) | contains_any(vegan))
            elif key == 'pescatarian':
                combined_query |= (contains_any(pescatarian) | contains_any(vegetarian) | contains_any(vegan))
            elif key == 'non_vegetarian':
                combined_query |= (
                    # include pescatarian explicitly
                    contains_any(pescatarian) |
                    # include items that have dietary info and are not vegan/vegetarian/pescatarian
                    (
                        ~contains_any(vegan) &
                        ~contains_any(vegetarian) &
                        ~contains_any(pescatarian) &
                        Q(flags__dietary_restrictions__isnull=False) &
                        ~Q(flags__dietary_restrictions=[])  # exclude unknown/unspecified
                    )
                )
            else:
                # Fallback to exact contains for any unknown tag
                combined_query |= Q(flags__dietary_restrictions__contains=[flt])

        return queryset.filter(combined_query)

    def _apply_category_filters(self, queryset, category_filters):
        """Apply category filters (OR within group)"""
        return queryset.filter(category__in=category_filters)

    def _apply_sorting(self, queryset, sort_by):
        """Apply sorting based on sort parameter and umami filters
        If multiple umami filters active, always sort by synergy descending
        """
        # Check if multiple umami filters are active
        umami_filters = self.request.query_params.getlist('umami[]')
        
        # If multiple umami filters, always sort by synergy
        if len(umami_filters) > 1:
            return queryset.order_by('-chemistry__umami_synergy', '-chemistry__umami_aa')
        
        # Single umami filter - sort by that metric
        if len(umami_filters) == 1:
            filter_type = umami_filters[0]
            if filter_type == 'umami_aa':
                return queryset.order_by('-chemistry__umami_aa', '-chemistry__umami_synergy')
            elif filter_type == 'umami_nuc':
                return queryset.order_by('-chemistry__umami_nuc', '-chemistry__umami_synergy')
            elif filter_type == 'umami_synergy':
                return queryset.order_by('-chemistry__umami_synergy', '-chemistry__umami_aa')
        
        # Default sorting behavior
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
        total_weight = Decimal('0')
        
        ingredients_data = []
        
        for item in composition_data:
            ingredient_id = item['ingredient_id']
            quantity = item['quantity']
            unit = item['unit']

            try:
                ingredient = Ingredient.objects.select_related('chemistry').get(id=ingredient_id)
                chemistry = ingredient.chemistry

                # Convert to grams
                quantity_grams = Decimal(str(convert_to_grams(float(quantity), unit)))
                total_weight += quantity_grams

                # Calculate contribution (assuming chemistry values are per 100g)
                factor = quantity_grams / Decimal('100')

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
                    'quantity_grams': float(quantity_grams),
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
        
        if total_weight == 0:
            return Response(
                {'error': 'Total weight must be greater than zero'},
                status=status.HTTP_400_BAD_REQUEST
            )

        def mg_per_100g(total_mg: Decimal) -> Decimal:
            return (total_mg / total_weight) * Decimal('100')

        glu_mg_per_100g = mg_per_100g(total_glu)
        asp_mg_per_100g = mg_per_100g(total_asp)
        imp_mg_per_100g = mg_per_100g(total_imp)
        gmp_mg_per_100g = mg_per_100g(total_gmp)
        amp_mg_per_100g = mg_per_100g(total_amp)

        glu_g_per_100g = glu_mg_per_100g / Decimal('1000')
        asp_g_per_100g = asp_mg_per_100g / Decimal('1000')
        imp_g_per_100g = imp_mg_per_100g / Decimal('1000')
        gmp_g_per_100g = gmp_mg_per_100g / Decimal('1000')
        amp_g_per_100g = amp_mg_per_100g / Decimal('1000')

        # Apply relative weights to each compound for umami-equivalent calculations
        # Relative umami intensity: Glu=1.0, Asp=0.077, IMP=1.0, GMP=2.3, AMP=0.18
        weighted_aa_g = glu_g_per_100g * Decimal('1.0') + asp_g_per_100g * Decimal('0.077')
        weighted_nuc_g = (
            imp_g_per_100g * Decimal('1.0') +
            gmp_g_per_100g * Decimal('2.3') +
            amp_g_per_100g * Decimal('0.18')
        )
        
        # Convert weighted values to mg/100g for display
        weighted_aa_mg = weighted_aa_g * Decimal('1000')
        weighted_nuc_mg = weighted_nuc_g * Decimal('1000')
        
        # Calculate EUC (Equivalent Umami Concentration)
        # Formula: EUC = weighted_AA + 1218 × weighted_AA × weighted_Nuc
        if weighted_aa_g > 0 and weighted_nuc_g > 0:
            euc_g = weighted_aa_g + Decimal('1218') * weighted_aa_g * weighted_nuc_g
        else:
            # If no nucleotides, synergy = just the amino acids
            euc_g = weighted_aa_g if weighted_aa_g > 0 else Decimal('0')
        
        euc_mg = euc_g * Decimal('1000')

        # Calculate PUI (Perceived Umami Index)
        # P_AA = 1 / (1 + (K_AA / AA_weighted_mg)^n)  where K_AA=80, n=1.4
        # B_Nuc = 1 + α * (Nuc_weighted_mg / (Nuc_weighted_mg + K_Nuc))  where α=1.5, K_Nuc=30
        # PUI = min(P_AA * B_Nuc, 1) * 100
        # Using float for pow operation for better compatibility
        
        if weighted_aa_mg > 0:
            ratio = float(Decimal('80') / weighted_aa_mg)
            p_aa = Decimal(str(1.0 / (1.0 + pow(ratio, 1.4))))
        else:
            p_aa = Decimal('0')
        
        if weighted_nuc_mg > 0:
            b_nuc = Decimal('1') + Decimal('1.5') * (weighted_nuc_mg / (weighted_nuc_mg + Decimal('30')))
        else:
            b_nuc = Decimal('1')
        
        pui_raw = p_aa * b_nuc
        pui = min(float(pui_raw), 1.0) * 100
        
        # Calculate AA:Nuc ratio for synergy dial (using weighted values)
        epsilon = Decimal('0.001')
        aa_nuc_ratio = weighted_aa_mg / max(weighted_nuc_mg, epsilon)
        
        # Determine synergy zone
        if aa_nuc_ratio < Decimal('0.6'):
            synergy_zone = 'needs_aa'
            synergy_suggestion = 'Add amino-rich ingredient (tomato, cheese, soy sauce).'
        elif aa_nuc_ratio <= Decimal('1.6'):
            synergy_zone = 'optimal'
            synergy_suggestion = 'Optimal synergy ratio achieved.'
        else:
            synergy_zone = 'needs_nuc'
            synergy_suggestion = 'Add nucleotide-rich ingredient (mushrooms, seafood, seaweed).'

        # Return weighted values in mg/100g for frontend display
        total_aa = weighted_aa_mg
        total_nuc = weighted_nuc_mg
        total_synergy = euc_mg

        # Prepare chart data
        chart_data = {
            'umami_aa': {
                'glu': float(glu_mg_per_100g),
                'asp': float(asp_mg_per_100g)
            },
            'umami_nuc': {
                'imp': float(imp_mg_per_100g),
                'gmp': float(gmp_mg_per_100g),
                'amp': float(amp_mg_per_100g)
            },
            'breakdown': {
                'total_aa': float(weighted_aa_mg),
                'total_nuc': float(weighted_nuc_mg),
                'total_synergy': float(euc_mg)
            }
        }

        result = {
            'total_weight': float(total_weight),
            'total_aa': float(total_aa),
            'total_nuc': float(total_nuc),
            'total_synergy': float(total_synergy),
            'total_glu': float(total_glu),
            'total_asp': float(total_asp),
            'total_imp': float(total_imp),
            'total_gmp': float(total_gmp),
            'total_amp': float(total_amp),
            'ingredients': ingredients_data,
            'chart_data': chart_data,
            'concentrations': {
                'aa_mg_per_100g': float(weighted_aa_mg),
                'nuc_mg_per_100g': float(weighted_nuc_mg),
                'aa_g_per_100g': float(weighted_aa_g),
                'nuc_g_per_100g': float(weighted_nuc_g),
                'synergy_mg_per_100g': float(euc_mg)
            },
            'pui': float(pui),
            'aa_nuc_ratio': float(aa_nuc_ratio),
            'synergy_zone': synergy_zone,
            'synergy_suggestion': synergy_suggestion
        }

        result_serializer = CompositionResultSerializer(result)
        return Response(result_serializer.data)
