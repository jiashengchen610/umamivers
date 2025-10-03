-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Main ingredient table
CREATE TABLE ingredient (
    id SERIAL PRIMARY KEY,
    base_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    category VARCHAR(100),
    extraction_temp DECIMAL(5,2),
    extraction_time INTEGER,
    cooking_overview TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Aliases for multilingual support
CREATE TABLE alias (
    id SERIAL PRIMARY KEY,
    ingredient_id INTEGER REFERENCES ingredient(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chemistry data for umami compounds
CREATE TABLE chemistry (
    ingredient_id INTEGER PRIMARY KEY REFERENCES ingredient(id) ON DELETE CASCADE,
    glu DECIMAL(8,3) DEFAULT 0,
    asp DECIMAL(8,3) DEFAULT 0,
    imp DECIMAL(8,3) DEFAULT 0,
    gmp DECIMAL(8,3) DEFAULT 0,
    amp DECIMAL(8,3) DEFAULT 0,
    umami_aa DECIMAL(8,3) DEFAULT 0,
    umami_nuc DECIMAL(8,3) DEFAULT 0,
    umami_synergy DECIMAL(8,3) DEFAULT 0
);

-- TCM properties
CREATE TABLE tcm (
    ingredient_id INTEGER PRIMARY KEY REFERENCES ingredient(id) ON DELETE CASCADE,
    four_qi VARCHAR(50)[],  -- Array of qi properties
    five_flavors VARCHAR(50)[], -- Array of flavor properties (now called "five tastes")
    meridians VARCHAR(50)[], -- Array of meridians
    overview TEXT,
    confidence DECIMAL(3,2) DEFAULT 1.0
);

-- Flags for allergens, dietary restrictions, tags
CREATE TABLE flags (
    ingredient_id INTEGER PRIMARY KEY REFERENCES ingredient(id) ON DELETE CASCADE,
    allergens JSONB DEFAULT '[]',
    dietary_restrictions JSONB DEFAULT '[]',
    umami_tags JSONB DEFAULT '[]',
    flavor_tags JSONB DEFAULT '[]'
);

-- Indexes for performance
-- Fuzzy search indexes
CREATE INDEX idx_ingredient_base_name_trgm ON ingredient USING GIN (base_name gin_trgm_ops);
CREATE INDEX idx_alias_name_trgm ON alias USING GIN (name gin_trgm_ops);

-- Chemistry indexes for sorting
CREATE INDEX idx_chemistry_synergy ON chemistry (umami_synergy DESC);
CREATE INDEX idx_chemistry_aa ON chemistry (umami_aa DESC);
CREATE INDEX idx_chemistry_nuc ON chemistry (umami_nuc DESC);

-- TCM indexes
CREATE INDEX idx_tcm_four_qi ON tcm USING GIN (four_qi);
CREATE INDEX idx_tcm_five_flavors ON tcm USING GIN (five_flavors);
CREATE INDEX idx_tcm_meridians ON tcm USING GIN (meridians);

-- Flag indexes
CREATE INDEX idx_flags_allergens ON flags USING GIN (allergens);
CREATE INDEX idx_flags_dietary ON flags USING GIN (dietary_restrictions);
CREATE INDEX idx_flags_umami_tags ON flags USING GIN (umami_tags);
CREATE INDEX idx_flags_flavor_tags ON flags USING GIN (flavor_tags);

-- Category index
CREATE INDEX idx_ingredient_category ON ingredient (category);

-- Composite indexes for common queries
CREATE INDEX idx_chemistry_composite ON chemistry (umami_synergy DESC, umami_aa DESC, umami_nuc DESC);

-- Function for calculating similarity
CREATE OR REPLACE FUNCTION calculate_similarity(
    ingredient1_id INTEGER,
    ingredient2_id INTEGER
) RETURNS DECIMAL AS $$
DECLARE
    result DECIMAL;
BEGIN
    -- Simplified similarity calculation based on chemistry values
    SELECT 
        1.0 / (1.0 + 
               ABS(c1.umami_aa - c2.umami_aa) + 
               ABS(c1.umami_nuc - c2.umami_nuc) + 
               ABS(c1.umami_synergy - c2.umami_synergy))
    INTO result
    FROM chemistry c1, chemistry c2
    WHERE c1.ingredient_id = ingredient1_id 
      AND c2.ingredient_id = ingredient2_id;
    
    RETURN COALESCE(result, 0);
END;
$$ LANGUAGE plpgsql;

-- View for combined ingredient data
CREATE VIEW ingredient_full AS
SELECT 
    i.id,
    i.base_name,
    i.display_name,
    i.category,
    i.extraction_temp,
    i.extraction_time,
    i.cooking_overview,
    c.glu, c.asp, c.imp, c.gmp, c.amp,
    c.umami_aa, c.umami_nuc, c.umami_synergy,
    t.four_qi, t.five_flavors, t.meridians, t.overview as tcm_overview,
    f.allergens, f.dietary_restrictions, f.umami_tags, f.flavor_tags
FROM ingredient i
LEFT JOIN chemistry c ON i.id = c.ingredient_id
LEFT JOIN tcm t ON i.id = t.ingredient_id  
LEFT JOIN flags f ON i.id = f.ingredient_id;