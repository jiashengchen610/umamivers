from django.core.management.base import BaseCommand
from umami_api.models import Ingredient, Chemistry, TCM, Flags


class Command(BaseCommand):
    help = 'Initialize water ingredient in the database'

    def handle(self, *args, **options):
        # Check if water already exists
        existing = Ingredient.objects.filter(base_name__iexact='water').first()
        if existing:
            self.stdout.write(self.style.SUCCESS(f'Water ingredient already exists with ID: {existing.id}'))
            return

        # Create Chemistry record with all umami values = 0
        chemistry = Chemistry.objects.create(
            glu=0.0,
            asp=0.0,
            imp=0.0,
            gmp=0.0,
            amp=0.0,
            umami_aa=0.0,
            umami_nuc=0.0,
            umami_synergy=0.0
        )

        # Create TCM record with Four Qi = Neutral
        tcm = TCM.objects.create(
            four_qi=['Neutral'],
            five_flavors=['Bland'],
            meridians=['Stomach', 'Kidney'],
            overview='Water is neutral in nature and essential for all bodily functions.',
            confidence=1.0
        )

        # Create Flags record
        flags = Flags.objects.create(
            allergens=[],
            dietary_restrictions=['vegan', 'vegetarian'],
            flavor_tags=[]
        )

        # Create Ingredient
        ingredient = Ingredient.objects.create(
            base_name='water',
            display_name='Water',
            category='Beverage',
            food_group='Liquid',
            chemistry=chemistry,
            tcm=tcm,
            flags=flags,
            cooking_overview='Water is the universal solvent and dilution medium.'
        )

        self.stdout.write(self.style.SUCCESS(f'Successfully created water ingredient with ID: {ingredient.id}'))
