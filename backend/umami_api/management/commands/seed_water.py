from django.core.management.base import BaseCommand
from umami_api.models import Ingredient, Chemistry, TCM, Flags


class Command(BaseCommand):
    help = 'Create a zero-umami Water ingredient if not exists'

    def handle(self, *args, **options):
        water, created = Ingredient.objects.get_or_create(
            base_name='water',
            defaults={
                'display_name': 'Water',
                'category': 'Base',
            }
        )

        Chemistry.objects.update_or_create(
            ingredient=water,
            defaults={
                'glu': 0,
                'asp': 0,
                'imp': 0,
                'gmp': 0,
                'amp': 0,
                'umami_aa': 0,
                'umami_nuc': 0,
                'umami_synergy': 0,
            }
        )

        TCM.objects.update_or_create(
            ingredient=water,
            defaults={
                'four_qi': ['Neutral'],
                'five_flavors': ['None'],
                'meridians': [],
                'overview': 'Neutral energy; used to dilute concentration.',
                'confidence': 1.0,
            }
        )

        Flags.objects.update_or_create(
            ingredient=water,
            defaults={
                'allergens': [],
                'dietary_restrictions': ['vegan', 'vegetarian', 'pescatarian'],
                'umami_tags': [],
                'flavor_tags': [],
            }
        )

        self.stdout.write(self.style.SUCCESS(f"Water ingredient {'created' if created else 'updated'}"))


