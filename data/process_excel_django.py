#!/usr/bin/env python3
"""
Process umami_warp_ready.xlsx and populate PostgreSQL database using Django ORM
"""
import os
import sys
import pandas as pd
import json
from decimal import Decimal
from typing import Dict, List, Any, Optional
import re

# Add the backend directory to the Python path
sys.path.append('../backend')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'umami_project.settings')

import django
django.setup()

from umami_api.models import Ingredient, Alias, Chemistry, TCM, Flags

def clean_numeric(value: Any) -> Optional[float]:
    """Clean and convert numeric values, handling various formats"""
    if pd.isna(value) or value == '' or value is None:
        return None
    
    if isinstance(value, (int, float)):
        return float(value)
    
    # Handle string values
    str_val = str(value).strip()
    if not str_val or str_val.lower() in ['nan', 'na', 'n/a', '-']:
        return None
    
    # Remove any non-numeric characters except decimal point and negative sign
    cleaned = re.sub(r'[^\d.-]', '', str_val)
    try:
        return float(cleaned) if cleaned else None
    except ValueError:
        return None

def parse_list(value: Any, lower: bool = False) -> List[str]:
    """Parse comma/semicolon separated strings into a clean list."""
    if pd.isna(value) or value is None:
        return []

    str_val = str(value).strip()
    if not str_val or str_val.lower() in ['nan', 'na', 'n/a', '-']:
        return []

    normalised = str_val.replace(';', ',').replace('\n', ',')
    items: List[str] = []
    for item in normalised.split(','):
        cleaned = item.strip()
        if not cleaned or cleaned.lower() == 'none':
            continue
        items.append(cleaned.lower() if lower else cleaned)
    return items


def extract_aliases(ingredient_name: str, variety: Any) -> List[tuple]:
    """Extract aliases including Chinese names and variations"""
    aliases = []
    
    # Extract Chinese characters from ingredient name if present
    chinese_match = re.search(r'[\u4e00-\u9fff]+', ingredient_name)
    if chinese_match:
        chinese_name = chinese_match.group()
        aliases.append((chinese_name, 'zh'))
    
    # Extract parenthetical information as aliases
    paren_matches = re.findall(r'\(([^)]+)\)', ingredient_name)
    for match in paren_matches:
        # Skip location information
        if any(location in match.lower() for location in ['japan', 'china', 'korea', 'usa', 'uk', 'france', 'italy', 'spain']):
            continue
        lang = 'zh' if re.search(r'[\u4e00-\u9fff]', match) else 'en'
        aliases.append((match, lang))
    
    # Include any explicit variety/origin values
    for entry in parse_list(variety):
        aliases.append((entry, 'en'))

    return aliases

def process_excel_file(excel_path: str) -> None:
    """Process the Excel file and populate the database"""
    print(f"Loading Excel file: {excel_path}")
    
    try:
        # Load Excel file
        df = pd.read_excel(excel_path, sheet_name='Processed_Data')
        print(f"Loaded {len(df)} rows from Excel")
        
        # Display columns for debugging
        print("Available columns:", list(df.columns))
        
        # Clear existing data
        print("Clearing existing data...")
        Ingredient.objects.all().delete()
        
        processed_count = 0
        
        for index, row in df.iterrows():
            try:
                # Extract basic ingredient info
                ingredient_name = str(row.get('Ingredient', '')).strip()
                base_name = str(row.get('Base_Name', '')).strip() or ingredient_name
                
                if not base_name:
                    print(f"Skipping row {index}: no base name")
                    continue
                
                # Prefer the processed-sheet label for display
                display_name = ingredient_name or base_name
                category = str(row.get('Category', '')).strip() or None
                cooking_overview = str(row.get('Cooking_Overview', '')).strip() or None
                extraction_overview = str(row.get('Umami_Extract_Overview', '')).strip() or None
                if extraction_overview:
                    cooking_overview = f"{extraction_overview}\n{cooking_overview}" if cooking_overview else extraction_overview
                
                # Create ingredient
                ingredient = Ingredient.objects.create(
                    base_name=base_name,
                    display_name=display_name,
                    category=category,
                    cooking_overview=cooking_overview
                )

                # Create aliases
                aliases = extract_aliases(ingredient_name, row.get('Variety'))
                for alias_name, lang in aliases:
                    Alias.objects.create(
                        ingredient=ingredient,
                        name=alias_name,
                        language=lang
                    )
                
                # Create chemistry data
                glu = clean_numeric(row.get('Glu'))
                asp = clean_numeric(row.get('Asp'))
                imp = clean_numeric(row.get('IMP'))
                gmp = clean_numeric(row.get('GMP'))
                amp = clean_numeric(row.get('AMP'))
                umami_aa = clean_numeric(row.get('Umami_AA'))
                umami_nuc = clean_numeric(row.get('Umami_Nuc'))
                umami_synergy = clean_numeric(row.get('Umami_Synergy'))

                if umami_aa is None:
                    umami_aa = (glu or 0) + (asp or 0) if (glu or asp) else 0
                if umami_nuc is None:
                    umami_nuc = (imp or 0) + (gmp or 0) + (amp or 0) if (imp or gmp or amp) else 0
                if umami_synergy is None:
                    weighted_aa = ((glu or 0) * 1.0) + ((asp or 0) * 0.077)
                    weighted_nuc = ((imp or 0) * 1.0) + ((gmp or 0) * 2.3) + ((amp or 0) * 0.18)
                    umami_synergy = weighted_aa + (1218 * weighted_aa * weighted_nuc) if (weighted_aa and weighted_nuc) else 0
                
                Chemistry.objects.create(
                    ingredient=ingredient,
                    glu=glu or 0,
                    asp=asp or 0,
                    imp=imp or 0,
                    gmp=gmp or 0,
                    amp=amp or 0,
                    umami_aa=umami_aa,
                    umami_nuc=umami_nuc,
                    umami_synergy=umami_synergy
                )
                
                four_qi = parse_list(row.get('TCM_Four_Qi')) or ['Neutral']
                five_flavors = parse_list(row.get('TCM_Five_Flavors')) or ['Sweet']
                meridians = parse_list(row.get('TCM_Meridians')) or ['Spleen', 'Stomach']
                tcm_overview = str(row.get('TCM_Overview', '')).strip() or None
                tcm_confidence = clean_numeric(row.get('TCM_Data_Confidence')) or 0.7

                TCM.objects.create(
                    ingredient=ingredient,
                    four_qi=four_qi,
                    five_flavors=five_flavors,
                    meridians=meridians,
                    overview=tcm_overview,
                    confidence=tcm_confidence
                )

                # Create flags
                allergens = parse_list(row.get('Allergen'), lower=True)
                dietary = parse_list(row.get('Dietary_Restrictions'), lower=True)
                umami_tags = parse_list(row.get('Umami_Tags'), lower=True)
                flavor_tags = parse_list(row.get('Flavor_Tags'), lower=True)
                
                Flags.objects.create(
                    ingredient=ingredient,
                    allergens=allergens,
                    dietary_restrictions=dietary,
                    umami_tags=umami_tags,
                    flavor_tags=flavor_tags
                )
                
                processed_count += 1
                if processed_count % 50 == 0:
                    print(f"Processed {processed_count} ingredients...")
                    
            except Exception as e:
                print(f"Error processing row {index} ({base_name}): {e}")
                continue
        
        print(f"Successfully processed {processed_count} ingredients")
        
        # Show some statistics
        total_ingredients = Ingredient.objects.count()
        total_aliases = Alias.objects.count()
        ingredients_with_synergy = Chemistry.objects.filter(umami_synergy__gt=0).count()
        
        print(f"\nDatabase statistics:")
        print(f"- Total ingredients: {total_ingredients}")
        print(f"- Total aliases: {total_aliases}")
        print(f"- Ingredients with synergy data: {ingredients_with_synergy}")
        
    except Exception as e:
        print(f"Error processing Excel file: {e}")
        raise

def main():
    excel_path = "../umami_warp_ready.xlsx"
    
    if not os.path.exists(excel_path):
        print(f"Excel file not found: {excel_path}")
        print("Please ensure umami_warp_ready.xlsx is in the project root directory")
        sys.exit(1)
    
    print("Starting Excel data processing with Django ORM...")
    process_excel_file(excel_path)
    print("Data processing complete!")

if __name__ == "__main__":
    main()
