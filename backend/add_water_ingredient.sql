-- Add water ingredient to production database
-- Run with: render psql dpg-d43hsp3e5dus738simf0-a < add_water_ingredient.sql

BEGIN;

-- Check if water already exists
DO $$
DECLARE
    water_exists INTEGER;
    chemistry_id INTEGER;
    tcm_id INTEGER;
    flags_id INTEGER;
    ingredient_id INTEGER;
BEGIN
    SELECT COUNT(*) INTO water_exists 
    FROM umami_api_ingredient 
    WHERE LOWER(base_name) = 'water';
    
    IF water_exists > 0 THEN
        RAISE NOTICE 'Water ingredient already exists';
    ELSE
        -- Insert Chemistry record
        INSERT INTO umami_api_chemistry (glu, asp, imp, gmp, amp, umami_aa, umami_nuc, umami_synergy)
        VALUES (0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0)
        RETURNING id INTO chemistry_id;
        
        RAISE NOTICE 'Created chemistry record with ID: %', chemistry_id;
        
        -- Insert TCM record
        INSERT INTO umami_api_tcm (four_qi, five_flavors, meridians, overview, confidence)
        VALUES (
            ARRAY['Neutral']::varchar[],
            ARRAY['Bland']::varchar[],
            ARRAY['Stomach', 'Kidney']::varchar[],
            'Water is neutral in nature and essential for all bodily functions.',
            1.0
        )
        RETURNING id INTO tcm_id;
        
        RAISE NOTICE 'Created TCM record with ID: %', tcm_id;
        
        -- Insert Flags record
        INSERT INTO umami_api_flags (allergens, dietary_restrictions, flavor_tags)
        VALUES (
            ARRAY[]::varchar[],
            ARRAY['vegan', 'vegetarian']::varchar[],
            ARRAY[]::varchar[]
        )
        RETURNING id INTO flags_id;
        
        RAISE NOTICE 'Created flags record with ID: %', flags_id;
        
        -- Insert Ingredient record
        INSERT INTO umami_api_ingredient (
            base_name, 
            display_name, 
            category, 
            food_group, 
            chemistry_id, 
            tcm_id, 
            flags_id,
            cooking_overview
        )
        VALUES (
            'water',
            'Water',
            'Beverage',
            'Liquid',
            chemistry_id,
            tcm_id,
            flags_id,
            'Water is the universal solvent and dilution medium.'
        )
        RETURNING id INTO ingredient_id;
        
        RAISE NOTICE 'Created water ingredient with ID: %', ingredient_id;
    END IF;
END $$;

COMMIT;
