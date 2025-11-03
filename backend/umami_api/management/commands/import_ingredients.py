#!/usr/bin/env python3
"""Django management command to import ingredient data from Excel"""
from django.core.management.base import BaseCommand
import os
import sys

# Add parent directory to path to import the process script
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))

from process_excel_django import process_excel_file


class Command(BaseCommand):
    help = 'Import ingredient data from umami_warp_ready.xlsx'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            default='../umami_warp_ready.xlsx',
            help='Path to the Excel file (default: ../umami_warp_ready.xlsx)',
        )

    def handle(self, *args, **options):
        excel_path = options['file']
        
        if not os.path.exists(excel_path):
            self.stdout.write(self.style.ERROR(f'Excel file not found: {excel_path}'))
            self.stdout.write('Please ensure umami_warp_ready.xlsx is accessible')
            return
        
        self.stdout.write(f'Starting import from: {excel_path}')
        
        try:
            process_excel_file(excel_path)
            self.stdout.write(self.style.SUCCESS('Successfully imported ingredient data!'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Import failed: {e}'))
            raise
