'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { FilterRow } from '@/components/SearchAndFilter'
import { IngredientCard } from '@/components/IngredientCard'
import { Ingredient, FilterState, IngredientListResponse } from '@/types'
import { searchIngredients } from '@/lib/api'

interface HeroSearchProps {
  onAddToComposition?: (ingredient: Ingredient) => void
  onOpenDetails?: (ingredient: Ingredient) => void
  className?: string
}

const initialFilters: FilterState = {
  query: '',
  umami: [],
  flavor: [],
  qi: [],
  flavors: [],
  meridians: [],
  allergens_include: [],
  allergens_exclude: [],
  dietary: [],
  category: [],
  ranges: {},
  sort: 'relevance'
}

export function HeroSearch({
  onAddToComposition,
  onOpenDetails,
  className = ''
}: HeroSearchProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(false)
  const [resultCount, setResultCount] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [showResults, setShowResults] = useState(false)

  // Determine if filters are active
  const hasActiveQuery = filters.query.trim().length > 0
  const hasActiveFilters = filters.umami.length > 0 || 
                          filters.flavor.length > 0 || 
                          filters.qi.length > 0 || 
                          filters.flavors.length > 0 || 
                          filters.meridians.length > 0 || 
                          filters.allergens_exclude.length > 0 || 
                          filters.dietary.length > 0 || 
                          filters.category.length > 0

  const shouldShowResults = hasActiveQuery || hasActiveFilters

  // Search function
  const handleSearch = useCallback(async (
    searchFilters: FilterState, 
    newPage: number = 1, 
    reset: boolean = false
  ) => {
    // Don't search if no query or filters
    if (!searchFilters.query.trim() && !hasActiveFilters) {
      setIngredients([])
      setResultCount(0)
      setShowResults(false)
      return
    }

    setLoading(true)
    setShowResults(true)

    try {
      console.log('🔍 Searching with filters:', searchFilters)
      console.log('📡 Making API request to backend...')
      
      const response: IngredientListResponse = await searchIngredients(searchFilters, newPage)
      
      console.log('✅ API Response received:', {
        count: response.count,
        resultsLength: response.results?.length,
        totalPages: response.total_pages
      })
      
      if (reset || newPage === 1) {
        setIngredients(response.results || [])
      } else {
        setIngredients(prev => [...prev, ...(response.results || [])])
      }
      
      setResultCount(response.count || 0)
      setPage(newPage)
      setHasMore(newPage < (response.total_pages || 1))
    } catch (error) {
      console.error('❌ API Error:', error)
      console.log('🔧 Backend might not be running on http://127.0.0.1:8000')
      setIngredients([])
      setResultCount(0)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [hasActiveFilters])

  // Search when filters change
  useEffect(() => {
    const searchTimer = setTimeout(() => {
      handleSearch(filters, 1, true)
    }, 300) // Debounce search

    return () => clearTimeout(searchTimer)
  }, [filters, handleSearch])

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      handleSearch(filters, page + 1, false)
    }
  }

  const handleAddIngredient = (ingredient: Ingredient) => {
    if (onAddToComposition) {
      onAddToComposition(ingredient)
    }
  }

  const handleClear = () => {
    setFilters(initialFilters)
    setIngredients([])
    setResultCount(0)
    setShowResults(false)
  }

  return (
    <div className={`relative ${className}`}>
      {/* Hero Search Bar */}
      <div className="max-w-4xl mx-auto">
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <input
            type="text"
            value={filters.query}
            onChange={(e) => handleFilterChange({ ...filters, query: e.target.value })}
            placeholder="Search ingredients by name, umami properties, or TCM attributes..."
            className="block w-full pl-12 pr-12 py-6 text-lg border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-xl transition-all"
          />
          {(hasActiveQuery || hasActiveFilters) && (
            <button
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
            >
              <X className="h-6 w-6 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6">
          <FilterRow
            filters={filters}
            onChange={handleFilterChange}
            resultCount={resultCount}
            compact={true}
          />
        </div>
      </div>

      {/* Results Overlay with Frosted Glass Effect */}
      {shouldShowResults && showResults && (
        <div className="fixed inset-0 z-40 flex items-start justify-center pt-20" style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)'
        }}>
          <div className="max-w-6xl mx-auto px-4 w-full max-h-[80vh] overflow-y-auto">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {loading ? 'Searching...' : `${resultCount} ingredients found`}
                </h3>
                {hasActiveQuery && (
                  <p className="text-sm text-gray-600 mt-1">
                    Results for "{filters.query}"
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowResults(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results Grid */}
            {ingredients.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {ingredients.map((ingredient) => (
                  <div key={ingredient.id} className="bg-white rounded-xl shadow-sm border border-white/20">
                    <IngredientCard
                      ingredient={ingredient}
                      onAddToComposition={handleAddIngredient}
                      onOpenDetails={onOpenDetails}
                      compact={true}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12 bg-white/90 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-600">Loading ingredients...</p>
              </div>
            )}

            {/* Load More */}
            {hasMore && !loading && ingredients.length > 0 && (
              <div className="text-center mb-8">
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg"
                >
                  Load More Ingredients
                </button>
              </div>
            )}

            {/* No Results */}
            {!loading && ingredients.length === 0 && shouldShowResults && (
              <div className="text-center py-12 bg-white/90 backdrop-blur-sm rounded-xl border border-white/20">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No ingredients found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search terms or filters to find more ingredients.
                </p>
                <button
                  onClick={() => handleSearch(filters, 1, true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Understanding the Science - Show when no search active and no overlay */}
      {!shouldShowResults && !showResults && (
        <div className="max-w-6xl mx-auto mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-8">Understanding the Science</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Umami Calculation */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚙️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Umami Synergy Formula</h3>
                <p className="text-sm font-medium text-orange-600 mb-3">
                  AA + Nuc = Exponential Enhancement
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  When amino acids (Glutamate, Aspartate) combine with nucleotides (IMP, GMP, AMP), 
                  they create exponential umami enhancement through molecular synergy - up to 8x stronger taste.
                </p>
              </div>
              
              {/* Four Natures (四氣) */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌡️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Four Natures (四氣)</h3>
                <p className="text-sm font-medium text-blue-600 mb-3">
                  Thermal Energy Balance
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Cold ❄️ Cool 🌊 Neutral ⚖️ Warm ☀️ Hot 🔥 - Each ingredient affects your body's 
                  internal temperature and energy flow, guiding metabolic balance.
                </p>
              </div>
              
              {/* TCM Five Tastes (五味) */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🍃</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">TCM Five Tastes (五味)</h3>
                <p className="text-sm font-medium text-green-600 mb-3">
                  Taste-Organ Medicine
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Bitter→Heart ❤️ Sour→Liver 🟢 Sweet→Spleen 🟡 Spicy→Lungs 🫑 Salty→Kidneys 🔵 
                  Each taste specifically nourishes corresponding organ systems.
                </p>
              </div>
            </div>
            
            <div className="mt-12 max-w-4xl mx-auto">
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🧠</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Meridian Tropism (歸經)</h3>
                <p className="text-sm font-medium text-purple-600 mb-3">
                  Energy Pathway Guidance
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  The specific channels through which food's energetic properties 
                  flow to influence particular organ systems and their associated meridian pathways, creating targeted therapeutic effects.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}