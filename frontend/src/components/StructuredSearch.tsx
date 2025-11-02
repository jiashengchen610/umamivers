'use client'

import { useState, useEffect, useCallback, useMemo, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent } from 'react'
import { Search, X, Edit3 } from 'lucide-react'
import { FilterRow, SortSelect } from '@/components/SearchAndFilter'
import { IngredientCard } from '@/components/IngredientCard'
import { UmamiChart, TCMBars, MiniBars } from '@/components/Charts'
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

const INTERACTIVE_SELECTOR = 'button, input, select, textarea, a, [role="button"]'

const UNITS = [
  { value: 'g', label: 'g' },
  { value: 'oz', label: 'oz' },
  { value: 'tsp', label: 'tsp' },
  { value: 'tbsp', label: 'tbsp' },
  { value: 'cup', label: 'cup' }
]

const UNIT_TO_GRAMS: Record<string, number> = {
  g: 1,
  oz: 28.35,
  tsp: 5,
  tbsp: 15,
  cup: 240
}

const convertToGrams = (quantity: number, unit: string) => {
  const multiplier = UNIT_TO_GRAMS[unit?.toLowerCase?.() || 'g'] || 1
  return quantity * multiplier
}

const normalizeFlavorLabel = (label: string) => (label.toLowerCase() === 'spicy' ? 'Pungent' : label)

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
  const [userEditedTitle, setUserEditedTitle] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [totalIngredientCount, setTotalIngredientCount] = useState<number | null>(null)

  const resultQuantityMap = useMemo(() => {
    const map = new Map<number, number>()
    composition.result?.ingredients?.forEach(item => {
      map.set(item.id, item.quantity_grams)
    })
    return map
  }, [composition.result])

  const {
    aggregatedQi,
    aggregatedFlavors,
    aggregatedMeridians,
    qiDistribution,
    flavorDistribution,
    meridianDistribution
  } = useMemo(() => {
    const qiWeights = new Map<string, number>()
    const flavorWeights = new Map<string, number>()
    const meridianWeights = new Map<string, number>()

    composition.ingredients.forEach(item => {
      const tcm = item.ingredient.tcm
      if (!tcm) return

      const weight = resultQuantityMap.get(item.ingredient.id) ?? convertToGrams(item.quantity, item.unit)
      if (!weight || weight <= 0) return

      const distribute = (values: string[] | undefined, target: Map<string, number>, transform?: (value: string) => string) => {
        if (!values || values.length === 0) return
        const uniqueValues = Array.from(new Set(values))
        const share = weight / uniqueValues.length
        uniqueValues.forEach(value => {
          const key = transform ? transform(value) : value
          target.set(key, (target.get(key) || 0) + share)
        })
      }

      distribute(tcm.four_qi, qiWeights)
      distribute(tcm.five_flavors, flavorWeights, normalizeFlavorLabel)
      distribute(tcm.meridians, meridianWeights)
    })

    const toDistribution = (map: Map<string, number>) => {
      if (map.size === 0) return undefined
      const total = Array.from(map.values()).reduce((sum, value) => sum + value, 0)
      if (total === 0) return undefined
      const entries = Array.from(map.entries()).map(([label, value]) => [label, (value / total) * 100] as [string, number])
      entries.sort((a, b) => b[1] - a[1])
      return {
        distribution: Object.fromEntries(entries),
        order: entries.map(([label]) => label)
      }
    }

    const fallback = (selector: (tcm: Ingredient['tcm']) => string[] | undefined, transform?: (value: string) => string) => (
      Array.from(new Set(
        composition.ingredients.flatMap(item => {
          const values = selector(item.ingredient.tcm)
          if (!values) return []
          return values.map(value => (transform ? transform(value) : value))
        })
      ))
    )

    const qiResult = toDistribution(qiWeights)
    const flavorResult = toDistribution(flavorWeights)
    const meridianResult = toDistribution(meridianWeights)

    return {
      aggregatedQi: qiResult?.order ?? fallback(tcm => tcm?.four_qi),
      aggregatedFlavors: flavorResult?.order ?? fallback(tcm => tcm?.five_flavors, normalizeFlavorLabel),
      aggregatedMeridians: meridianResult?.order ?? fallback(tcm => tcm?.meridians),
      qiDistribution: qiResult?.distribution,
      flavorDistribution: flavorResult?.distribution,
      meridianDistribution: meridianResult?.distribution
    }
  }, [composition.ingredients, resultQuantityMap])

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

  useEffect(() => {
    const fetchTotalCount = async () => {
      try {
        const response = await searchIngredients(initialFilters, 1, 1)
        const total = response.count || 0
        setTotalIngredientCount(total)
        if (!shouldShowResults) {
          setResultCount(total)
        }
      } catch (error) {
        console.error('Error fetching ingredient count:', error)
      }
    }
    fetchTotalCount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (filters.sort !== 'relevance') return
    if (filters.query.trim()) return

    const mapping: Record<string, FilterState['sort']> = {
      umami_aa: 'aa',
      umami_nuc: 'nuc',
      umami_synergy: 'synergy'
    }

    const targetSort = filters.umami.find(tag => mapping[tag])
      ? mapping[filters.umami.find(tag => mapping[tag]) as keyof typeof mapping]
      : undefined

    if (targetSort && targetSort !== filters.sort) {
      setFilters(prev => ({ ...prev, sort: targetSort }))
    }
  }, [filters.umami, filters.query, filters.sort])

  // Update composition when ingredients or quantities change
  useEffect(() => {
    updateComposition()
  }, [composition.ingredients])

  const updateComposition = async () => {
    if (composition.ingredients.length === 0) {
      onChange({ ...composition, result: undefined })
      if (!userEditedTitle) {
        setComboTitle('Combo title')
      }
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
      setResultCount(totalIngredientCount ?? 0)
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
      setResultCount(totalIngredientCount ?? 0)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [hasActiveFilters, totalIngredientCount])

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

  const handleClearComposition = () => {
    setIngredients([])
    setShowResults(false)
    onChange({ ...composition, ingredients: [], result: undefined })
  }

const handleClearFilters = () => {
  setFilters(initialFilters)
  setIngredients([])
  setResultCount(totalIngredientCount ?? 0)
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

const isInteractiveTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement && target.closest(INTERACTIVE_SELECTOR)

const handleComboCardClick = (event: ReactMouseEvent<HTMLDivElement>, ingredient: Ingredient) => {
  if (!onOpenDetails || isInteractiveTarget(event.target)) {
    return
  }
  onOpenDetails(ingredient)
}

const handleComboCardKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>, ingredient: Ingredient) => {
  if (!onOpenDetails) return
  if (event.key !== 'Enter' && event.key !== ' ') return
  if (isInteractiveTarget(event.target)) return
  event.preventDefault()
  onOpenDetails(ingredient)
}

  const handleTitleSave = () => {
    setIsEditingTitle(false)
    setUserEditedTitle(comboTitle.trim().length > 0)
  }

  useEffect(() => {
    if (userEditedTitle) return
    if (composition.ingredients.length === 0) {
      setComboTitle('Combo title')
      return
    }

    const weighted = composition.ingredients.map(item => {
      const quantity = Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 1
      return {
        name: item.ingredient.display_name || item.ingredient.base_name,
        weight: quantity
      }
    })

    weighted.sort((a, b) => {
      if (b.weight !== a.weight) {
        return b.weight - a.weight
      }
      return a.name.localeCompare(b.name)
    })

    const title = weighted.map(item => item.name).join(' & ')
    if (title) {
      setComboTitle(title)
    }
  }, [composition.ingredients, userEditedTitle])

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
            onClick={handleClearFilters}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* 4. Filters */}
      <div className="flex items-start gap-3">
        <div className="flex-1 overflow-x-auto">
          <FilterRow
            filters={filters}
            onChange={handleFilterChange}
            resultCount={resultCount}
            compact={true}
            onClearFilters={handleClearFilters}
            showResultCount={false}
          />
        </div>
        <SortSelect
          value={filters.sort}
          onChange={(value) => handleFilterChange({ ...filters, sort: value })}
          className="flex-shrink-0"
        />
      </div>

      {/* 5. Result Count */}
      <div>
        <p className="text-sm text-gray-600">
          {shouldShowResults
            ? (loading ? 'Searching...' : `${resultCount} ingredients found${hasActiveQuery ? ` for "${filters.query}"` : ''}`)
            : totalIngredientCount != null
              ? `${totalIngredientCount.toLocaleString()} ingredients available`
              : 'Loading ingredient catalog…'}
        </p>
      </div>

      {/* 6. Combo Title */}
      <div className="flex items-center gap-3">
        {isEditingTitle ? (
          <input
            type="text"
            value={comboTitle}
            onChange={(e) => setComboTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
            className="flex-1 text-xl font-semibold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none"
            autoFocus
          />
        ) : (
          <>
            <button
              onClick={() => setIsEditingTitle(true)}
              className="p-1 mr-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Edit combo title"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900 flex-1">{comboTitle}</h2>
          </>
        )}
        {composition.ingredients.length > 0 && (
          <button
            onClick={handleClearComposition}
            className="px-3 py-2 text-sm text-red-500 hover:text-red-600"
          >
            Clear all
          </button>
        )}
      </div>

      {composition.ingredients.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {composition.ingredients.map(item => (
            <button
              type="button"
              key={`chip-${item.ingredient.id}`}
              onClick={() => removeIngredient(item.ingredient.id)}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-xs font-medium text-gray-700 border border-gray-300 transition-colors"
            >
              {item.ingredient.display_name || item.ingredient.base_name}
              <span className="ml-2 text-gray-500">×</span>
            </button>
          ))}
        </div>
      )}

      {/* 7. Composition Analytics */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
        {composition.ingredients.length > 0 && composition.result ? (
          <>
            <UmamiChart
              chemistry={{
                glu: parseFloat(String(composition.result.total_glu)),
                asp: parseFloat(String(composition.result.total_asp)),
                imp: parseFloat(String(composition.result.total_imp)),
                gmp: parseFloat(String(composition.result.total_gmp)),
                amp: parseFloat(String(composition.result.total_amp)),
                umami_aa: parseFloat(String(composition.result.total_aa)),
                umami_nuc: parseFloat(String(composition.result.total_nuc)),
                umami_synergy: parseFloat(String(composition.result.total_synergy))
              }}
              showIndividual={false}
            />
            <TCMBars
              tcm={{
                four_qi: aggregatedQi,
                five_flavors: aggregatedFlavors,
                meridians: aggregatedMeridians,
                overview: '',
                confidence: 1
              }}
              distributions={{
                four_qi: qiDistribution,
                five_flavors: flavorDistribution,
                meridians: meridianDistribution
              }}
            />
          </>
        ) : (
          <div className="flex flex-col items-center text-sm text-gray-500 gap-3">
            {isUpdating ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span>Calculating composition…</span>
              </>
            ) : (
              <span>Add ingredients to preview umami and TCM analytics.</span>
            )}
          </div>
        )}

        {isUpdating && composition.result && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* 8. Added Ingredient List */}
      <div className="space-y-3">
        {composition.ingredients.length === 0 ? (
          <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-xl">
            No ingredients selected yet. Search and add ingredients above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex gap-3 pb-2">
              {composition.ingredients.map(item => (
                <div
                  key={item.ingredient.id}
                  className={`paper-texture-light border border-gray-200 p-4 flex flex-col gap-3 min-w-[260px] max-w-[260px] flex-shrink-0 transition-colors ${onOpenDetails ? 'cursor-pointer hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300' : ''}`}
                  onClick={(event) => handleComboCardClick(event, item.ingredient)}
                  onKeyDown={(event) => handleComboCardKeyDown(event, item.ingredient)}
                  role={onOpenDetails ? 'button' : undefined}
                  tabIndex={onOpenDetails ? 0 : undefined}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="text-base font-medium text-gray-900 leading-snug min-h-[2.75rem] overflow-hidden" title={item.ingredient.display_name || item.ingredient.base_name}>
                        {item.ingredient.display_name || item.ingredient.base_name}
                      </h4>
                      <div className="text-xs text-gray-600 mt-1 truncate">
                        {(item.ingredient.tcm?.five_flavors || ['Sweet']).map(normalizeFlavorLabel).join(', ')} • {(item.ingredient.tcm?.four_qi || ['Neutral']).join(', ')}
                      </div>
                    </div>
                    <button
                      onClick={(event) => {
                        event.stopPropagation()
                        removeIngredient(item.ingredient.id)
                      }}
                      className="btn-circular-sm text-gray-400 hover:text-red-500 hover:bg-red-50"
                      aria-label={`Remove ${item.ingredient.display_name || item.ingredient.base_name}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.ingredient.id, parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 text-sm"
                      min="0"
                      step="0.1"
                      onClick={(event) => event.stopPropagation()}
                    />
                    <select
                      value={item.unit}
                      onChange={(e) => updateUnit(item.ingredient.id, e.target.value)}
                      className="w-20 px-2 py-1 border border-gray-300 text-sm"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {UNITS.map(unit => (
                        <option key={unit.value} value={unit.value}>{unit.label}</option>
                      ))}
                    </select>
                  </div>

                  {item.ingredient.chemistry && (
                    <MiniBars chemistry={item.ingredient.chemistry} />
                  )}

                  <div className="text-xs text-gray-600 space-y-1">
                    <div>
                      <span className="font-medium">Allergens:</span>{' '}
                      {item.ingredient.flags?.allergens?.length
                        ? item.ingredient.flags.allergens.join(', ')
                        : 'None reported'}
                    </div>
                    <div>
                      <span className="font-medium">TCM:</span>{' '}
                      {(item.ingredient.tcm?.five_flavors || ['Sweet']).map(normalizeFlavorLabel).join(', ')} • {(item.ingredient.tcm?.four_qi || ['Neutral']).join(', ')}
                    </div>
                    {(item.ingredient.flags?.dietary_restrictions?.length ?? 0) > 0 && (
                      <div>
                        <span className="font-medium">Dietary:</span>{' '}
                        {item.ingredient.flags?.dietary_restrictions?.slice(0, 4).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 9. Composition Summary */}
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
              <div className="flex items-start gap-3">
                <div className="flex-1 overflow-x-auto">
                  <FilterRow
                    filters={filters}
                    onChange={handleFilterChange}
                    resultCount={resultCount}
                    compact={true}
                    onClearFilters={handleClearFilters}
                    showResultCount={false}
                  />
                </div>
                <SortSelect
                  value={filters.sort}
                  onChange={(value) => handleFilterChange({ ...filters, sort: value })}
                  className="flex-shrink-0"
                />
              </div>
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 mb-6">
                  {ingredients.map((ingredient) => (
                    <div key={ingredient.id} className="paper-texture-light border border-gray-300 h-full">
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
