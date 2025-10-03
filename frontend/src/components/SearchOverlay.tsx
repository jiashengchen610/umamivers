'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Plus } from 'lucide-react'
import { SearchBar, FilterRow } from '@/components/SearchAndFilter'
import { IngredientCard } from '@/components/IngredientCard'
import { Ingredient, FilterState, IngredientListResponse } from '@/types'
import { searchIngredients } from '@/lib/api'

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
  onAddToComposition?: (ingredient: Ingredient) => void
  onOpenDetails?: (ingredient: Ingredient) => void
  initialQuery?: string
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

export function SearchOverlay({
  isOpen,
  onClose,
  onAddToComposition,
  onOpenDetails,
  initialQuery = '',
  className = ''
}: SearchOverlayProps) {
  const [filters, setFilters] = useState<FilterState>({ ...initialFilters, query: initialQuery })
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(false)
  const [resultCount, setResultCount] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Reset when overlay opens with new query
  useEffect(() => {
    if (isOpen && initialQuery !== filters.query) {
      setFilters({ ...initialFilters, query: initialQuery, sort: 'relevance' })
    }
  }, [isOpen, initialQuery])

  // Search when overlay opens or filters change
  useEffect(() => {
    if (isOpen) {
      // Load initial results even with empty query
      handleSearch(filters, 1, true)
    }
  }, [isOpen]) // Only trigger on isOpen change
  
  // Separate effect for filter changes
  useEffect(() => {
    if (isOpen) {
      handleSearch(filters, 1, true)
    }
  }, [filters])

  const handleSearch = useCallback(async (
    searchFilters: FilterState, 
    newPage: number = 1, 
    reset: boolean = false
  ) => {
    // Show results even with empty query to display all ingredients initially
    setLoading(true)
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
      // Set some fallback state on error
      setIngredients([])
      setResultCount(0)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [])

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
      onClose() // Close search overlay after adding
    }
  }

  if (!isOpen) return null

  const hasFilters = filters.umami.length > 0 || 
                    filters.flavor.length > 0 || 
                    filters.qi.length > 0 || 
                    filters.flavors.length > 0 || 
                    filters.meridians.length > 0 || 
                    filters.allergens_exclude.length > 0 || 
                    filters.dietary.length > 0 || 
                    filters.category.length > 0

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Overlay Panel - Full Screen */}
      <div className="fixed inset-0 bg-white overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Search Ingredients</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Content */}
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Search Bar */}
          <SearchBar
            value={filters.query}
            onChange={(query) => handleFilterChange({ ...filters, query })}
            placeholder="Search ingredients by name, umami properties, or TCM attributes..."
          />

          {/* Filters */}
          <FilterRow
            filters={filters}
            onChange={handleFilterChange}
            resultCount={resultCount}
          />

          {/* Results - Always show when open */}
          <div className="space-y-4">
            {/* Results Grid */}
            {ingredients.length > 0 && (
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    {resultCount > 0 ? `${resultCount} ingredients found` : 'Loading ingredients...'}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ingredients.map((ingredient) => (
                    <IngredientCard
                      key={ingredient.id}
                      ingredient={ingredient}
                      onAddToComposition={handleAddIngredient}
                      onOpenDetails={onOpenDetails}
                      compact={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-600 text-sm">Loading ingredients...</p>
              </div>
            )}

            {/* Load More */}
            {hasMore && !loading && ingredients.length > 0 && (
              <div className="text-center">
                <button
                  onClick={handleLoadMore}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                >
                  Load More Ingredients
                </button>
              </div>
            )}

            {/* No Results */}
            {!loading && ingredients.length === 0 && (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No ingredients found</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {filters.query.trim() || hasFilters 
                    ? 'Try adjusting your search terms or filters to find more ingredients.'
                    : 'Unable to load ingredients. Please check your backend connection.'
                  }
                </p>
                {(!filters.query.trim() && !hasFilters) && (
                  <button
                    onClick={() => handleSearch(filters, 1, true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                  >
                    Retry Loading
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}