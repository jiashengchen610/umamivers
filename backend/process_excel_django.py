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

def extract_aliases(ingredient_name: str) -> List[tuple]:
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
    
    return aliases

def process_excel_file(excel_path: str) -> None:
    """Process the Excel file and populate the database"""
    print(f"Loading Excel file: {excel_path}")
    
    try:
        # Load Excel file
        df = pd.read_excel(excel_path)
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
                ingredient_name = str(row.get('Description', '')).strip()
                base_name = ingredient_name
                
                if not base_name:
                    print(f"Skipping row {index}: no base name")
                    continue
                
                # Clean base name (remove parenthetical info for display)
                display_name = re.sub(r'\s*\([^)]*\)', '', base_name).strip()
                category = str(row.get('Category', '')).strip() or None
                food_group = str(row.get('Food group', '')).strip() or None
                
                # Create ingredient
                ingredient = Ingredient.objects.create(
                    base_name=base_name,
                    display_name=display_name,
                    category=category or food_group,
                    cooking_overview=f"Traditional preparation methods for {food_group.lower()}" if food_group else None
                )
                
                # Create aliases
                aliases = extract_aliases(ingredient_name)
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
                
                # Calculate derived values using EUC formula
                # Traditional totals
                umami_aa = (glu or 0) + (asp or 0) if glu or asp else 0
                umami_nuc = (imp or 0) + (gmp or 0) + (amp or 0) if imp or gmp or amp else 0
                
                # EUC calculation: Y = Σ(ai·bi) + 1218 × (Σ(ai·bi)) × (Σ(aj·bj))
                # Apply relative umami weights
                weighted_aa = ((glu or 0) * 1.0) + ((asp or 0) * 0.077)  # Glu=1, Asp=0.077
                weighted_nuc = ((imp or 0) * 1.0) + ((gmp or 0) * 2.3) + ((amp or 0) * 0.18)  # IMP=1, GMP=2.3, AMP=0.18
                
                # Calculate EUC (Equivalent Umami Concentration) in g MSG/100g
                euc_base = weighted_aa
                euc_synergy = 1218 * weighted_aa * weighted_nuc
                umami_synergy = euc_base + euc_synergy if weighted_aa and weighted_nuc else 0
                
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
                
                # Create TCM data - simplified mapping based on food category
                qi_mapping = {
                    'Potatoes and Starches': ['Neutral'],
                    'Vegetables': ['Cool', 'Neutral'],
                    'Meat': ['Warm'],
                    'Seafood': ['Cool'],
                    'Dairy': ['Cool'],
                    'Grains': ['Neutral'],
                    'Fruits': ['Cool'],
                    'Mushrooms': ['Neutral'],
                    'Algae': ['Cold'],
                    'Beverages': ['Neutral'],
                    'Seasonings and Spices': ['Warm']
                }
                
                flavor_mapping = {
                    'Potatoes and Starches': ['Sweet'],
                    'Vegetables': ['Sweet', 'Bitter'],
                    'Meat': ['Sweet'],
                    'Seafood': ['Salty'],
                    'Dairy': ['Sweet'],
                    'Grains': ['Sweet'],
                    'Fruits': ['Sweet', 'Sour'],
                    'Mushrooms': ['Sweet'],
                    'Algae': ['Salty'],
                    'Beverages': ['Bitter'],
                    'Seasonings and Spices': ['Pungent', 'Salty']
                }
                
                meridian_mapping = {
                    'Potatoes and Starches': ['Spleen', 'Stomach'],
                    'Vegetables': ['Spleen', 'Liver'],
                    'Meat': ['Kidney', 'Spleen'],
                    'Seafood': ['Kidney'],
                    'Dairy': ['Lung', 'Stomach'],
                    'Grains': ['Spleen'],
                    'Fruits': ['Spleen', 'Lung'],
                    'Mushrooms': ['Spleen', 'Lung'],
                    'Algae': ['Kidney'],
                    'Beverages': ['Heart', 'Kidney'],
                    'Seasonings and Spices': ['Lung', 'Spleen']
                }
                
                # Get appropriate TCM values
                four_qi = qi_mapping.get(food_group, ['Neutral'])
                five_flavors = flavor_mapping.get(food_group, ['Sweet'])
                meridians = meridian_mapping.get(food_group, ['Spleen', 'Stomach'])
                
                TCM.objects.create(
                    ingredient=ingredient,
                    four_qi=four_qi,
                    five_flavors=five_flavors,
                    meridians=meridians,
                    overview=f"Traditional Chinese Medicine properties for {food_group.lower()}" if food_group else None,
                    confidence=0.7  # Simplified mapping has lower confidence
                )
                
                # Create flags
                allergens = []  # Would need more sophisticated mapping
                dietary = []   # Would need more sophisticated mapping
                
                # Generate umami tags based on values
                umami_tags = []
                if umami_aa > umami_nuc and umami_aa > 10:
                    umami_tags.append('umami_aa')
                elif umami_nuc > umami_aa and umami_nuc > 10:
                    umami_tags.append('umami_nuc')
                if umami_synergy > 50:
                    umami_tags.append('high_synergy')
                    
                # Generate flavor tags based on food group
                flavor_tags = []
                if food_group in ['Meat', 'Seafood', 'Seasonings and Spices']:
                    flavor_tags.append('flavor_carrier')
                else:
                    flavor_tags.append('flavor_supporting')
                    
                # Add umami carrier tag for high umami ingredients
                if umami_synergy > 100 or umami_aa > 50 or umami_nuc > 50:
                    umami_tags.append('umami_carrier')
                
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