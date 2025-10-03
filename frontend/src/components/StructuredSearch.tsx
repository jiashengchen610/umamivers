'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, X, Edit3, Plus } from 'lucide-react'
import { FilterRow } from '@/components/SearchAndFilter'
import { IngredientCard } from '@/components/IngredientCard'
import { UmamiChart } from '@/components/Charts'
import { Ingredient, FilterState, IngredientListResponse, CompositionState } from '@/types'
import { searchIngredients, composePreview } from '@/lib/api'

interface StructuredSearchProps {
  onAddToComposition?: (ingredient: Ingredient) => void
  onOpenDetails?: (ingredient: Ingredient) => void
  composition: CompositionState
  onChange: (composition: CompositionState) => void
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

const UNITS = [
  { value: 'g', label: 'g' },
  { value: 'oz', label: 'oz' },
  { value: 'tsp', label: 'tsp' },
  { value: 'tbsp', label: 'tbsp' },
  { value: 'cup', label: 'cup' }
]

export function StructuredSearch({
  onAddToComposition,
  onOpenDetails,
  composition,
  onChange,
  className = ''
}: StructuredSearchProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(false)
  const [resultCount, setResultCount] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [showResults, setShowResults] = useState(false)
  const [comboTitle, setComboTitle] = useState('Combo title')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

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

  // Update composition when ingredients or quantities change
  useEffect(() => {
    updateComposition()
  }, [composition.ingredients])

  const updateComposition = async () => {
    if (composition.ingredients.length === 0) {
      onChange({ ...composition, result: undefined })
      return
    }

    setIsUpdating(true)
    try {
      const compositionData = composition.ingredients.map(item => ({
        ingredient_id: item.ingredient.id,
        quantity: item.quantity,
        unit: item.unit
      }))

      const result = await composePreview(compositionData)
      onChange({ ...composition, result })
    } catch (error) {
      console.error('Error updating composition:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  // Search function
  const handleSearch = useCallback(async (
    searchFilters: FilterState, 
    newPage: number = 1, 
    reset: boolean = false
  ) => {
    if (!searchFilters.query.trim() && !hasActiveFilters) {
      setIngredients([])
      setResultCount(0)
      setShowResults(false)
      return
    }

    setLoading(true)
    setShowResults(true)

    try {
      const response: IngredientListResponse = await searchIngredients(searchFilters, newPage)
      
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
    }, 300)
    return () => clearTimeout(searchTimer)
  }, [filters, handleSearch])

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  const handleAddIngredient = (ingredient: Ingredient) => {
    if (onAddToComposition) {
      onAddToComposition(ingredient)
    }
    setShowResults(false) // Close overlay when ingredient is added
  }

  const handleClear = () => {
    setFilters(initialFilters)
    setIngredients([])
    setResultCount(0)
    setShowResults(false)
  }

  const removeIngredient = (ingredientId: number) => {
    const newIngredients = composition.ingredients.filter(
      item => item.ingredient.id !== ingredientId
    )
    onChange({ ...composition, ingredients: newIngredients })
  }

  const updateQuantity = (ingredientId: number, quantity: number) => {
    const newIngredients = composition.ingredients.map(item =>
      item.ingredient.id === ingredientId
        ? { ...item, quantity }
        : item
    )
    onChange({ ...composition, ingredients: newIngredients })
  }

  const updateUnit = (ingredientId: number, unit: string) => {
    const newIngredients = composition.ingredients.map(item =>
      item.ingredient.id === ingredientId
        ? { ...item, unit }
        : item
    )
    onChange({ ...composition, ingredients: newIngredients })
  }

  const handleTitleSave = () => {
    setIsEditingTitle(false)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 3. Search Bar - 44px height */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={filters.query}
          onChange={(e) => handleFilterChange({ ...filters, query: e.target.value })}
          placeholder="Search ingredients by name, umami properties, or TCM attributes..."
          className="block w-full pl-12 pr-12 py-3 h-11 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg transition-all"
        />
        {(hasActiveQuery || hasActiveFilters) && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* 4. Filters */}
      <div>
        <FilterRow
          filters={filters}
          onChange={handleFilterChange}
          resultCount={resultCount}
          compact={true}
        />
      </div>

      {/* 5. Result Count */}
      {shouldShowResults && (
        <div>
          <p className="text-sm text-gray-600">
            {loading ? 'Searching...' : `${resultCount} ingredients found`}
            {hasActiveQuery && ` for "${filters.query}"`}
          </p>
        </div>
      )}

      {/* 6. Combo Title and Edit Button */}
      <div className="flex items-center gap-3">
        {isEditingTitle ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={comboTitle}
              onChange={(e) => setComboTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
              className="text-xl font-semibold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none flex-1"
              autoFocus
            />
          </div>
        ) : (
          <div className="flex items-center gap-3 flex-1">
            <h2 className="text-xl font-semibold text-gray-900">{comboTitle}</h2>
            <button
              onClick={() => setIsEditingTitle(true)}
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 7. Added Ingredient List */}
      <div className="space-y-3">
        {composition.ingredients.length === 0 ? (
          <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-xl">
            No ingredients selected yet. Search and add ingredients above.
          </p>
        ) : (
          composition.ingredients.map(item => (
            <div
              key={item.ingredient.id}
              className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-4"
            >
              {/* Ingredient Info */}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">
                  {item.ingredient.display_name || item.ingredient.base_name}
                </h4>
                <div className="text-xs text-gray-500 mb-2">
                  {item.ingredient.tcm?.five_flavors.join(', ')} • {item.ingredient.tcm?.four_qi.join(', ')}
                </div>
              </div>

              {/* Quantity Input */}
              <div className="flex items-center gap-2 min-w-[120px]">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.ingredient.id, parseFloat(e.target.value) || 0)}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                  min="0"
                  step="0.1"
                />
                <select
                  value={item.unit}
                  onChange={(e) => updateUnit(item.ingredient.id, e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  {UNITS.map(unit => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Small Umami Chart */}
              {item.ingredient.chemistry && (
                <div className="min-w-[80px]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                      <div className="flex-1 h-1 bg-gray-200 rounded overflow-hidden">
                        <div
                          className="h-full bg-orange-500 transition-all duration-300"
                          style={{ width: `${Math.min(100, (parseFloat(item.ingredient.chemistry.umami_aa?.toString() || '0') / 1000) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></div>
                      <div className="flex-1 h-1 bg-gray-200 rounded overflow-hidden">
                        <div
                          className="h-full bg-yellow-600 transition-all duration-300"
                          style={{ width: `${Math.min(100, (parseFloat(item.ingredient.chemistry.umami_nuc?.toString() || '0') / 500) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                      <div className="flex-1 h-1 bg-gray-200 rounded overflow-hidden">
                        <div
                          className="h-full bg-purple-400 transition-all duration-300"
                          style={{ width: `${Math.min(100, (parseFloat(item.ingredient.chemistry.umami_synergy?.toString() || '0') / 1500) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Remove Button */}
              <button
                onClick={() => removeIngredient(item.ingredient.id)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* 8. Aggregated Chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        {composition.result ? (
          <>
            <UmamiChart
              chemistry={{
                glu: parseFloat(composition.result.total_glu),
                asp: parseFloat(composition.result.total_asp),
                imp: parseFloat(composition.result.total_imp),
                gmp: parseFloat(composition.result.total_gmp),
                amp: parseFloat(composition.result.total_amp),
                umami_aa: parseFloat(composition.result.total_aa),
                umami_nuc: parseFloat(composition.result.total_nuc),
                umami_synergy: parseFloat(composition.result.total_synergy)
              }}
              showIndividual={false}
            />
            {isUpdating && (
              <div className="flex items-center justify-center mt-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              </div>
            )}
            
            {/* Export Options */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                <span>💾</span>
                Save
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors">
                <span>📤</span>
                Share
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition-colors">
                <span>📊</span>
                PNG
              </button>
            </div>
          </>
        ) : (
          /* Empty State Template */
          <div className="text-center py-12">
            <div className="mb-6">
              <div className="inline-block p-4 bg-gray-100 rounded-2xl mb-4">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Your Umami Profile Awaits</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Add ingredients above to see their combined umami synergy, TCM balance, and flavor profile analysis.
              </p>
              
              {/* Preview Template */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 max-w-md mx-auto">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 min-w-[80px] text-left">Amino Acids</span>
                    <div className="flex-1 h-4 bg-gray-200 rounded overflow-hidden">
                      <div className="h-full bg-orange-300 opacity-50" style={{width: '0%'}} />
                    </div>
                    <span className="text-sm text-gray-400 min-w-[35px]">0.0</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 min-w-[80px] text-left">Nucleotides</span>
                    <div className="flex-1 h-4 bg-gray-200 rounded overflow-hidden">
                      <div className="h-full bg-yellow-400 opacity-50" style={{width: '0%'}} />
                    </div>
                    <span className="text-sm text-gray-400 min-w-[35px]">0.0</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 min-w-[80px] text-left">Synergy</span>
                    <div className="flex-1 h-4 bg-gray-200 rounded overflow-hidden">
                      <div className="h-full bg-purple-400 opacity-50" style={{width: '0%'}} />
                    </div>
                    <span className="text-sm text-gray-400 min-w-[35px]">0.0</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-3">Ready to export as:</p>
                  <div className="flex justify-center gap-2">
                    <div className="tag-element px-3 py-1 bg-gray-200 text-gray-500 text-xs">
                      Save
                    </div>
                    <div className="tag-element px-3 py-1 bg-gray-200 text-gray-500 text-xs">
                      Share
                    </div>
                    <div className="tag-element px-3 py-1 bg-gray-200 text-gray-500 text-xs">
                      PNG
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-500 mt-6">
              <strong>Tip:</strong> Combine ingredients with high amino acids and nucleotides for maximum umami synergy!
            </div>
          </div>
        )}
      </div>


      {/* Enhanced Results Overlay with Search/Filters */}
      {shouldShowResults && showResults && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{
          background: 'rgba(255, 255, 255, 0.95)', // Increased opacity
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)'
        }}>
          {/* Search and Filters in Overlay */}
          <div className="bg-white/95 backdrop-blur-sm border-b border-white/40 p-4">
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={filters.query}
                  onChange={(e) => handleFilterChange({ ...filters, query: e.target.value })}
                  placeholder="Search ingredients..."
                  className="block w-full pl-12 pr-12 py-3 h-11 text-base border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => setShowResults(false)}
                  className="btn-circular-sm absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Filters */}
              <FilterRow
                filters={filters}
                onChange={handleFilterChange}
                resultCount={resultCount}
                compact={true}
              />
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-6xl mx-auto">
              {/* Results Header */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {loading ? 'Searching...' : `${resultCount} ingredients found`}
                </h3>
                {hasActiveQuery && (
                  <p className="text-sm text-gray-600 mt-1">
                    Results for "{filters.query}"
                  </p>
                )}
              </div>

              {/* Results Grid - Mobile optimized */}
              {ingredients.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  {ingredients.map((ingredient) => (
                    <div key={ingredient.id} className="paper-texture-light border border-gray-300">
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

              {/* Loading/Empty States */}
              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="mt-4 text-gray-600">Loading ingredients...</p>
                </div>
              )}

              {!loading && ingredients.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No ingredients found</h3>
                  <p className="text-gray-600">Try adjusting your search terms or filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}