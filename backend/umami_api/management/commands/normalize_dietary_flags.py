from django.core.management.base import BaseCommand
from umami_api.models import Flags


def normalize_token(s: str) -> str:
    return (s or '').strip().lower().replace(' ', '_').replace('-', '_')


class Command(BaseCommand):
    help = 'Normalize dietary flags to lowercase snake_case and backfill non_vegetarian where appropriate.'

    def handle(self, *args, **options):
        updated = 0
        for flags in Flags.objects.all().iterator():
            original = flags.dietary_restrictions or []
            norm = []
            for item in original:
                token = normalize_token(item)
                if token:
                    norm.append(token)
            norm = list(dict.fromkeys(norm))  # dedupe, preserve order

            is_vegan = 'vegan' in norm
            is_vegetarian = 'vegetarian' in norm
            is_pescatarian = 'pescatarian' in norm

            # Backfill non_vegetarian unless vegan/vegetarian
            if not is_vegan and not is_vegetarian and 'non_vegetarian' not in norm:
                norm.append('non_vegetarian')

            if norm != original:
                flags.dietary_restrictions = norm
                flags.save(update_fields=['dietary_restrictions'])
                updated += 1

        self.stdout.write(self.style.SUCCESS(f'Normalized dietary flags for {updated} items.'))


