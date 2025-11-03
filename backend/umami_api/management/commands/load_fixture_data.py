#!/usr/bin/env python3
"""Django management command to load ingredient data from fixture"""
from django.core.management.base import BaseCommand
from django.core import management
import os
import gzip
import shutil


class Command(BaseCommand):
    help = 'Load ingredient data from fixture file (supports .json or .json.gz)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            default='fixture_data.json.gz',
            help='Path to the fixture file (default: fixture_data.json.gz)',
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before loading',
        )

    def handle(self, *args, **options):
        fixture_path = options['file']
        clear_first = options['clear']
        should_cleanup = False
        
        # Handle .gz files
        if fixture_path.endswith('.gz'):
            if not os.path.exists(fixture_path):
                self.stdout.write(self.style.ERROR(f'Fixture file not found: {fixture_path}'))
                return
            
            self.stdout.write(f'Decompressing {fixture_path}...')
            # Use a temporary filename to avoid conflicts
            uncompressed_path = fixture_path[:-3] + '.tmp.json'
            
            with gzip.open(fixture_path, 'rb') as f_in:
                with open(uncompressed_path, 'wb') as f_out:
                    shutil.copyfileobj(f_in, f_out)
            
            fixture_path = uncompressed_path
            should_cleanup = True
            self.stdout.write(self.style.SUCCESS(f'Decompressed to {fixture_path}'))
        
        if not os.path.exists(fixture_path):
            self.stdout.write(self.style.ERROR(f'Fixture file not found: {fixture_path}'))
            return
        
        if clear_first:
            self.stdout.write('Clearing existing data...')
            from umami_api.models import Ingredient
            Ingredient.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Cleared existing data'))
        
        self.stdout.write(f'Loading fixture from: {fixture_path}')
        
        try:
            management.call_command('loaddata', fixture_path, verbosity=2)
            self.stdout.write(self.style.SUCCESS('Successfully loaded fixture data!'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Load failed: {e}'))
            raise
        finally:
            # Clean up temporary decompressed file
            if should_cleanup and os.path.exists(fixture_path):
                os.remove(fixture_path)
                self.stdout.write('Cleaned up temporary file')
