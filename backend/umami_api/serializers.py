from rest_framework import serializers
from .models import Ingredient, Alias, Chemistry, TCM, Flags


class AliasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alias
        fields = ['name', 'language']


class ChemistrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Chemistry
        fields = ['glu', 'asp', 'imp', 'gmp', 'amp', 'umami_aa', 'umami_nuc', 'umami_synergy']


class TCMSerializer(serializers.ModelSerializer):
    class Meta:
        model = TCM
        fields = ['four_qi', 'five_flavors', 'meridians', 'overview', 'confidence']


class FlagsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flags
        fields = ['allergens', 'dietary_restrictions', 'umami_tags', 'flavor_tags']


class IngredientListSerializer(serializers.ModelSerializer):
    """Serializer for ingredient list view with essential data"""
    chemistry = ChemistrySerializer(read_only=True)
    tcm = TCMSerializer(read_only=True)
    flags = FlagsSerializer(read_only=True)

    class Meta:
        model = Ingredient
        fields = [
            'id', 'base_name', 'display_name', 'category',
            'chemistry', 'tcm', 'flags'
        ]


class IngredientDetailSerializer(serializers.ModelSerializer):
    """Serializer for ingredient detail view with all data"""
    aliases = AliasSerializer(many=True, read_only=True)
    chemistry = ChemistrySerializer(read_only=True)
    tcm = TCMSerializer(read_only=True)
    flags = FlagsSerializer(read_only=True)
    similar = serializers.SerializerMethodField()
    complementary = serializers.SerializerMethodField()

    class Meta:
        model = Ingredient
        fields = [
            'id', 'base_name', 'display_name', 'category',
            'extraction_temp', 'extraction_time', 'cooking_overview',
            'aliases', 'chemistry', 'tcm', 'flags',
            'similar', 'complementary'
        ]

    def get_similar(self, obj):
        """Get similar ingredients based on chemistry similarity"""
        if not hasattr(obj, 'chemistry') or not obj.chemistry:
            return []
            
        # Simple similarity based on same category and similar umami profiles
        similar_ingredients = Ingredient.objects.filter(
            category=obj.category
        ).exclude(
            id=obj.id
        ).select_related('chemistry')[:5]
        
        results = []
        for ingredient in similar_ingredients:
            if ingredient.chemistry:
                results.append({
                    'id': ingredient.id,
                    'base_name': ingredient.base_name,
                    'display_name': ingredient.display_name,
                    'similarity': 0.8  # Placeholder similarity score
                })
        
        return results

    def get_complementary(self, obj):
        """Get complementary ingredients (high AA with high Nuc, TCM balance)"""
        from django.db import connection
        
        # Simple complementary logic: if this ingredient is high AA, find high Nuc
        # and vice versa, with some TCM balance considerations
        if not hasattr(obj, 'chemistry'):
            return []
            
        chemistry = obj.chemistry
        
        with connection.cursor() as cursor:
            if chemistry.umami_aa > chemistry.umami_nuc:
                # This is AA-heavy, find Nuc-heavy
                cursor.execute("""
                    SELECT i2.id, i2.base_name, i2.display_name,
                           c2.umami_nuc, c2.umami_synergy
                    FROM ingredient i2
                    JOIN chemistry c2 ON i2.id = c2.ingredient_id
                    WHERE i2.id != %s 
                      AND c2.umami_nuc > c2.umami_aa
                      AND c2.umami_nuc > 0
                    ORDER BY c2.umami_nuc DESC, c2.umami_synergy DESC
                    LIMIT 5
                """, [obj.id])
            else:
                # This is Nuc-heavy or balanced, find AA-heavy
                cursor.execute("""
                    SELECT i2.id, i2.base_name, i2.display_name,
                           c2.umami_aa, c2.umami_synergy
                    FROM ingredient i2
                    JOIN chemistry c2 ON i2.id = c2.ingredient_id
                    WHERE i2.id != %s 
                      AND c2.umami_aa > c2.umami_nuc
                      AND c2.umami_aa > 0
                    ORDER BY c2.umami_aa DESC, c2.umami_synergy DESC
                    LIMIT 5
                """, [obj.id])
            
            results = []
            for row in cursor.fetchall():
                results.append({
                    'id': row[0],
                    'base_name': row[1],
                    'display_name': row[2],
                    'umami_value': float(row[3]) if row[3] else 0,
                    'synergy': float(row[4]) if row[4] else 0
                })
            return results


class CompositionIngredientSerializer(serializers.Serializer):
    """Serializer for composition ingredient input"""
    ingredient_id = serializers.IntegerField()
    quantity = serializers.DecimalField(max_digits=8, decimal_places=3)
    unit = serializers.CharField(max_length=10)


class CompositionResultSerializer(serializers.Serializer):
    """Serializer for composition calculation results"""
    total_aa = serializers.DecimalField(max_digits=10, decimal_places=3)
    total_nuc = serializers.DecimalField(max_digits=10, decimal_places=3)
    total_synergy = serializers.DecimalField(max_digits=10, decimal_places=3)
    total_glu = serializers.DecimalField(max_digits=10, decimal_places=3)
    total_asp = serializers.DecimalField(max_digits=10, decimal_places=3)
    total_imp = serializers.DecimalField(max_digits=10, decimal_places=3)
    total_gmp = serializers.DecimalField(max_digits=10, decimal_places=3)
    total_amp = serializers.DecimalField(max_digits=10, decimal_places=3)
    ingredients = serializers.ListField()
    chart_data = serializers.DictField()