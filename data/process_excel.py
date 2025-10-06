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

def parse_list(value: Any, lower: bool = False) -> List[str]:
    """Parse comma or semicolon separated values into list"""
    if pd.isna(value) or value is None:
        return []

    str_val = str(value).strip()
    if not str_val or str_val.lower() in ['nan', 'na', 'n/a', '-']:
        return []

    # Normalise delimiters to comma then split
    str_val = str_val.replace(';', ',').replace('\n', ',')
    items: List[str] = []
    for item in str_val.split(','):
        cleaned = item.strip()
        if not cleaned:
            continue
        if cleaned.lower() == 'none':
            continue
        items.append(cleaned.lower() if lower else cleaned)
    return items


def parse_array_field(value: Any) -> List[str]:
    """Backwards compatible wrapper for existing calls"""
    return parse_list(value)

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
        df = pd.read_excel(excel_path, sheet_name='Processed_Data')
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
                ingredient_name = str(row.get('Ingredient', '')).strip()
                base_name = str(row.get('Base_Name', '')).strip() or ingredient_name

                if not base_name:
                    print(f"Skipping row {index}: no base name")
                    continue

                # Prefer the ingredient label (which includes variety metadata)
                display_name = ingredient_name or base_name
                category = str(row.get('Category', '')).strip() or None
                cooking_overview = str(row.get('Cooking_Overview', '')).strip() or None
                extraction_overview = str(row.get('Umami_Extract_Overview', '')).strip() or None
                # Merge extraction notes into cooking overview when both exist
                if extraction_overview:
                    combined = extraction_overview
                    if cooking_overview:
                        combined = f"{extraction_overview}\n{cooking_overview}"
                    cooking_overview = combined

                # Insert ingredient
                cur.execute("""
                    INSERT INTO ingredient (base_name, display_name, category, cooking_overview)
                    VALUES (%s, %s, %s, %s) RETURNING id
                """, (base_name, display_name, category, cooking_overview))

                ingredient_id = cur.fetchone()[0]

                # Insert aliases
                aliases = extract_aliases(ingredient_name, row.get('Variety'))
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
                umami_aa = clean_numeric(row.get('Umami_AA'))
                umami_nuc = clean_numeric(row.get('Umami_Nuc'))

                def to_grams(value: Optional[float]) -> float:
                    return (value or 0) / 1000.0

                # Calculate derived values if not provided
                if umami_aa is None:
                    umami_aa = (glu or 0) + (asp or 0) if (glu or asp) else 0
                if umami_nuc is None:
                    umami_nuc = (imp or 0) + (gmp or 0) + (amp or 0) if (imp or gmp or amp) else 0

                weighted_aa = to_grams(glu) * 1.0 + to_grams(asp) * 0.077
                weighted_nuc = (
                    to_grams(imp) * 1.0 +
                    to_grams(gmp) * 2.3 +
                    to_grams(amp) * 0.18
                )

                if weighted_aa > 0 and weighted_nuc > 0:
                    umami_synergy = weighted_aa + 1218 * weighted_aa * weighted_nuc
                else:
                    umami_synergy = weighted_aa if weighted_aa > 0 else 0

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

                # Insert TCM data from processed sheet
                four_qi = parse_list(row.get('TCM_Four_Qi')) or ['Neutral']
                five_flavors = parse_list(row.get('TCM_Five_Flavors')) or ['Sweet']
                meridians = parse_list(row.get('TCM_Meridians')) or ['Spleen', 'Stomach']
                tcm_overview = str(row.get('TCM_Overview', '')).strip() or None
                tcm_confidence = clean_numeric(row.get('TCM_Data_Confidence'))
                if tcm_confidence is None:
                    tcm_confidence = 0.7

                cur.execute("""
                    INSERT INTO tcm (ingredient_id, four_qi, five_flavors, meridians, overview, confidence)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (ingredient_id, four_qi, five_flavors, meridians, tcm_overview, tcm_confidence))

                # Insert flags from processed sheet
                allergens = parse_list(row.get('Allergen'), lower=True)
                dietary = parse_list(row.get('Dietary_Restrictions'), lower=True)
                umami_tags = parse_list(row.get('Umami_Tags'), lower=True)
                flavor_tags = parse_list(row.get('Flavor_Tags'), lower=True)

                cur.execute("""
                    INSERT INTO flags (ingredient_id, allergens, dietary_restrictions, umami_tags, flavor_tags)
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    ingredient_id,
                    json.dumps(allergens),
                    json.dumps(dietary),
                    json.dumps(umami_tags),
                    json.dumps(flavor_tags)
                ))
                
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
