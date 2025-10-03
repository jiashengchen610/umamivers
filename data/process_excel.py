#!/usr/bin/env python3
"""
Process umami_warp_ready.xlsx and populate PostgreSQL database
"""
import os
import sys
import pandas as pd
import psycopg2
import json
from decimal import Decimal
from typing import Dict, List, Any, Optional
import re

# Database connection parameters
DB_CONFIG = {
    'host': 'localhost',
    'port': '5432',
    'database': 'umami_db',
    'user': 'umami_user',
    'password': 'umami_pass'
}

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

def parse_array_field(value: Any) -> List[str]:
    """Parse comma-separated values into array"""
    if pd.isna(value) or not value:
        return []
    
    str_val = str(value).strip()
    if not str_val or str_val.lower() in ['nan', 'na', 'n/a', '-']:
        return []
    
    # Split by comma and clean each item
    items = [item.strip() for item in str_val.split(',')]
    return [item for item in items if item]

def parse_json_field(value: Any) -> List[str]:
    """Parse JSON-like field or comma-separated values"""
    if pd.isna(value) or not value:
        return []
    
    str_val = str(value).strip()
    if not str_val or str_val.lower() in ['nan', 'na', 'n/a', '-']:
        return []
    
    # Try to parse as JSON first
    if str_val.startswith('[') and str_val.endswith(']'):
        try:
            return json.loads(str_val)
        except json.JSONDecodeError:
            pass
    
    # Fall back to comma-separated parsing
    return parse_array_field(str_val)

def extract_aliases(ingredient_name: str, aliases_field: Any) -> List[tuple]:
    """Extract aliases including Chinese names and variations"""
    aliases = []
    
    # Add aliases from the Aliases field
    alias_list = parse_array_field(aliases_field)
    for alias in alias_list:
        # Detect language (simple heuristic for Chinese characters)
        lang = 'zh' if re.search(r'[\u4e00-\u9fff]', alias) else 'en'
        aliases.append((alias, lang))
    
    # Extract Chinese characters from ingredient name if present
    chinese_match = re.search(r'[\u4e00-\u9fff]+', ingredient_name)
    if chinese_match:
        chinese_name = chinese_match.group()
        if chinese_name not in [a[0] for a in aliases]:
            aliases.append((chinese_name, 'zh'))
    
    # Extract parenthetical information as aliases
    paren_matches = re.findall(r'\(([^)]+)\)', ingredient_name)
    for match in paren_matches:
        if match not in [a[0] for a in aliases]:
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
        
        # Connect to database
        print("Connecting to database...")
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        # Clear existing data (for development)
        print("Clearing existing data...")
        cur.execute("TRUNCATE ingredient CASCADE")
        
        processed_count = 0
        
        for index, row in df.iterrows():
            try:
                # Extract basic ingredient info
                ingredient_name = str(row.get('Description', '')).strip()
                base_name = ingredient_name  # Use Description as base name
                
                if not base_name:
                    print(f"Skipping row {index}: no base name")
                    continue
                
                # Clean base name (remove parenthetical info for display)
                display_name = re.sub(r'\s*\([^)]*\)', '', base_name).strip()
                category = str(row.get('Category', '')).strip() or None
                
                # Insert ingredient
                cur.execute("""
                    INSERT INTO ingredient (base_name, display_name, category, cooking_overview)
                    VALUES (%s, %s, %s, %s) RETURNING id
                """, (base_name, display_name, category, str(row.get('TCM_Overview', '')).strip() or None))
                
                ingredient_id = cur.fetchone()[0]
                
                # Insert aliases
                aliases = extract_aliases(ingredient_name, row.get('Aliases?'))
                for alias_name, lang in aliases:
                    cur.execute("""
                        INSERT INTO alias (ingredient_id, name, language)
                        VALUES (%s, %s, %s)
                    """, (ingredient_id, alias_name, lang))
                
                # Insert chemistry data
                glu = clean_numeric(row.get('Glu'))
                asp = clean_numeric(row.get('Asp'))
                imp = clean_numeric(row.get('IMP'))
                gmp = clean_numeric(row.get('GMP'))
                amp = clean_numeric(row.get('AMP'))
                
                # Calculate derived values if not provided
                umami_aa = (glu or 0) + (asp or 0) if glu or asp else 0
                umami_nuc = (imp or 0) + (gmp or 0) + (amp or 0) if imp or gmp or amp else 0
                umami_synergy = umami_aa * umami_nuc / 100 if umami_aa and umami_nuc else 0
                
                chemistry_data = {
                    'glu': glu or 0,
                    'asp': asp or 0,
                    'imp': imp or 0,
                    'gmp': gmp or 0,
                    'amp': amp or 0,
                    'umami_aa': umami_aa,
                    'umami_nuc': umami_nuc,
                    'umami_synergy': umami_synergy
                }
                
                cur.execute("""
                    INSERT INTO chemistry (ingredient_id, glu, asp, imp, gmp, amp, umami_aa, umami_nuc, umami_synergy)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (ingredient_id, *chemistry_data.values()))
                
                # Insert TCM data - generate basic data since not in Excel
                food_group = str(row.get('Food group', '')).strip()
                
                # Basic TCM mapping based on food category (simplified)
                qi_mapping = {
                    'Potatoes and Starches': ['Neutral'],
                    'Vegetables': ['Cool', 'Neutral'],
                    'Meat': ['Warm'],
                    'Seafood': ['Cool'],
                    'Dairy': ['Cool'],
                    'Grains': ['Neutral'],
                    'Fruits': ['Cool'],
                    'Mushrooms': ['Neutral'],
                    'Algae': ['Cold']
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
                    'Algae': ['Salty']
                }
                
                # Get default values based on category
                four_qi = qi_mapping.get(food_group, ['Neutral'])
                five_flavors = flavor_mapping.get(food_group, ['Sweet'])
                meridians = ['Spleen', 'Stomach']  # Default digestive meridians
                tcm_overview = f"Traditional properties for {food_group.lower()}" if food_group else None
                
                cur.execute("""
                    INSERT INTO tcm (ingredient_id, four_qi, five_flavors, meridians, overview)
                    VALUES (%s, %s, %s, %s, %s)
                """, (ingredient_id, four_qi, five_flavors, meridians, tcm_overview))
                
                # Insert flags - generate basic data
                allergens = []  # Would need allergen mapping
                dietary = []   # Would need dietary mapping
                
                # Generate umami tags based on values
                umami_tags = []
                if umami_aa > umami_nuc:
                    umami_tags.append('umami_aa')
                elif umami_nuc > umami_aa:
                    umami_tags.append('umami_nuc')
                if umami_synergy > 50:
                    umami_tags.append('high_synergy')
                    
                # Generate flavor tags based on food group
                flavor_tags = []
                if 'Meat' in food_group or 'Seafood' in food_group:
                    flavor_tags.append('flavor_carrier')
                else:
                    flavor_tags.append('flavor_supporting')
                
                cur.execute("""
                    INSERT INTO flags (ingredient_id, allergens, dietary_restrictions, umami_tags, flavor_tags)
                    VALUES (%s, %s, %s, %s, %s)
                """, (ingredient_id, json.dumps(allergens), json.dumps(dietary), 
                     json.dumps(umami_tags), json.dumps(flavor_tags)))
                
                processed_count += 1
                if processed_count % 50 == 0:
                    print(f"Processed {processed_count} ingredients...")
                    
            except Exception as e:
                print(f"Error processing row {index} ({base_name}): {e}")
                continue
        
        # Commit transaction
        conn.commit()
        print(f"Successfully processed {processed_count} ingredients")
        
        # Show some statistics
        cur.execute("SELECT COUNT(*) FROM ingredient")
        total_ingredients = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM alias")
        total_aliases = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM chemistry WHERE umami_synergy > 0")
        ingredients_with_synergy = cur.fetchone()[0]
        
        print(f"\nDatabase statistics:")
        print(f"- Total ingredients: {total_ingredients}")
        print(f"- Total aliases: {total_aliases}")
        print(f"- Ingredients with synergy data: {ingredients_with_synergy}")
        
    except Exception as e:
        print(f"Error processing Excel file: {e}")
        if 'conn' in locals():
            conn.rollback()
        raise
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

def main():
    excel_path = "../umami_warp_ready.xlsx"
    
    if not os.path.exists(excel_path):
        print(f"Excel file not found: {excel_path}")
        print("Please ensure umami_warp_ready.xlsx is in the project root directory")
        sys.exit(1)
    
    print("Starting Excel data processing...")
    process_excel_file(excel_path)
    print("Data processing complete!")

if __name__ == "__main__":
    main()