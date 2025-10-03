export interface Chemistry {
  glu: number
  asp: number
  imp: number
  gmp: number
  amp: number
  umami_aa: number
  umami_nuc: number
  umami_synergy: number
}

export interface TCM {
  four_qi: string[]
  five_flavors: string[] // TCM Five Tastes
  meridians: string[]
  overview?: string
  confidence: number
}

export interface Flags {
  allergens: string[]
  dietary_restrictions: string[]
  umami_tags: string[]
  flavor_tags: string[]
}

export interface Alias {
  name: string
  language: string
}

export interface Ingredient {
  id: number
  base_name: string
  display_name?: string
  category?: string
  extraction_temp?: number
  extraction_time?: number
  cooking_overview?: string
  chemistry?: Chemistry
  tcm?: TCM
  flags?: Flags
  aliases?: Alias[]
  similar?: SimilarIngredient[]
  complementary?: ComplementaryIngredient[]
}

export interface SimilarIngredient {
  id: number
  base_name: string
  display_name?: string
  similarity: number
}

export interface ComplementaryIngredient {
  id: number
  base_name: string
  display_name?: string
  umami_value: number
  synergy: number
}

export interface IngredientListResponse {
  count: number
  next?: string
  previous?: string
  results: Ingredient[]
  page: number
  total_pages: number
}

export interface CompositionIngredient {
  ingredient_id: number
  quantity: number
  unit: string
}

export interface CompositionResult {
  total_aa: number
  total_nuc: number
  total_synergy: number
  total_glu: number
  total_asp: number
  total_imp: number
  total_gmp: number
  total_amp: number
  ingredients: Array<{
    id: number
    name: string
    quantity: number
    unit: string
    quantity_grams: number
    contributions: {
      glu: number
      asp: number
      imp: number
      gmp: number
      amp: number
    }
  }>
  chart_data: {
    umami_aa: {
      glu: number
      asp: number
    }
    umami_nuc: {
      imp: number
      gmp: number
      amp: number
    }
    breakdown: {
      total_aa: number
      total_nuc: number
      total_synergy: number
    }
  }
}

export interface FilterState {
  query: string
  umami: string[]
  flavor: string[]
  qi: string[]
  flavors: string[] // TCM Five Tastes
  meridians: string[]
  allergens_include: string[]
  allergens_exclude: string[]
  dietary: string[]
  category: string[]
  ranges: {
    aa_min?: number
    aa_max?: number
    nuc_min?: number
    nuc_max?: number
    syn_min?: number
    syn_max?: number
  }
  sort: 'relevance' | 'synergy' | 'aa' | 'nuc' | 'tcm' | 'alpha'
}

export interface CompositionState {
  ingredients: Array<{
    ingredient: Ingredient
    quantity: number
    unit: string
  }>
  result?: CompositionResult
}