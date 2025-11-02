'use client'

import { useState, useEffect, useMemo, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent } from 'react'
import { Ingredient, CompositionState } from '@/types'
import { TCMBars, UmamiChart, MiniBars } from '@/components/Charts'
import { SearchBar } from '@/components/SearchAndFilter'
import { X, Download, Share2, Save } from 'lucide-react'
import { composePreview } from '@/lib/api'

interface CompositionWorkbenchProps {
  composition: CompositionState
  onChange: (composition: CompositionState) => void
  onSearchIngredients?: (query: string) => void
  onOpenDetails?: (ingredient: Ingredient) => void
  className?: string
}

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
const INTERACTIVE_SELECTOR = 'button, input, select, textarea, a, [role="button"]'

export function CompositionWorkbench({ 
  composition, 
  onChange, 
  onSearchIngredients,
  onOpenDetails,
  className = '' 
}: CompositionWorkbenchProps) {
  const [isUpdating, setIsUpdating] = useState(false)

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
        if (uniqueValues.length === 0) return
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

    const fallbackFromIngredients = (selector: (tcm: Ingredient['tcm']) => string[] | undefined, transform?: (value: string) => string) => (
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
      aggregatedQi: qiResult?.order ?? fallbackFromIngredients(tcm => tcm?.four_qi),
      aggregatedFlavors: flavorResult?.order ?? fallbackFromIngredients(tcm => tcm?.five_flavors, normalizeFlavorLabel),
      aggregatedMeridians: meridianResult?.order ?? fallbackFromIngredients(tcm => tcm?.meridians),
      qiDistribution: qiResult?.distribution,
      flavorDistribution: flavorResult?.distribution,
      meridianDistribution: meridianResult?.distribution
    }
  }, [composition.ingredients, resultQuantityMap])

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

  const addIngredient = (ingredient: Ingredient) => {
    const exists = composition.ingredients.some(
      item => item.ingredient.id === ingredient.id
    )
    
    if (!exists) {
      const newIngredients = [
        ...composition.ingredients,
        { ingredient, quantity: 100, unit: 'g' }
      ]
      onChange({ ...composition, ingredients: newIngredients })
    }
  }

  const handleExportPNG = async () => {
    const html2canvas = (await import('html2canvas')).default
    const element = document.getElementById('composition-chart')
    if (element) {
      const canvas = await html2canvas(element)
      const link = document.createElement('a')
      link.download = 'umami-composition.png'
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  const handleExportJSON = () => {
    const data = {
      ingredients: composition.ingredients,
      result: composition.result,
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = 'umami-composition.json'
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleSave = () => {
    const key = `umami-composition-${Date.now()}`
    localStorage.setItem(key, JSON.stringify(composition))
    alert('Composition saved to localStorage!')
  }

  const handleShare = () => {
    const stateString = btoa(JSON.stringify(composition))
    const shareUrl = `${window.location.origin}${window.location.pathname}#state=${stateString}`
    navigator.clipboard.writeText(shareUrl)
    alert('Share URL copied to clipboard!')
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Umami Builder</h2>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="paper-texture-btn flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-sm border border-gray-300"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          <button
            onClick={handleShare}
            className="paper-texture-btn flex items-center gap-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm border border-blue-300"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button
            onClick={handleExportPNG}
            className="paper-texture-btn flex items-center gap-1 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 text-sm border border-green-300"
          >
            <Download className="w-4 h-4" />
            PNG
          </button>
          <button
            onClick={handleExportJSON}
            className="paper-texture-btn flex items-center gap-1 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm border border-purple-300"
          >
            <Download className="w-4 h-4" />
            JSON
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left side - Ingredient List & Search */}
        <div className="space-y-4">
          {/* Search */}
          <SearchBar
            value=""
            onChange={(query) => onSearchIngredients?.(query)}
            placeholder="Add ingredients..."
          />

          {/* Selected Ingredients */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Selected Ingredients</h3>
            {composition.ingredients.length === 0 ? (
              <p className="text-gray-500 text-sm">No ingredients selected yet.</p>
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
                          <h4 className="font-medium text-gray-900 leading-snug min-h-[2.75rem] overflow-hidden" title={item.ingredient.display_name || item.ingredient.base_name}>
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
                            <option key={unit.value} value={unit.value}>
                              {unit.label}
                            </option>
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
        </div>

        {/* Right side - Composition Results */}
        <div className="space-y-6" id="composition-chart">
          {/* Umami Chart - Show always */}
          <div className="paper-texture-light border border-gray-200 p-6">
            <UmamiChart
              chemistry={composition.result ? {
                glu: parseFloat(composition.result.total_glu),
                asp: parseFloat(composition.result.total_asp),
                imp: parseFloat(composition.result.total_imp),
                gmp: parseFloat(composition.result.total_gmp),
                amp: parseFloat(composition.result.total_amp),
                umami_aa: parseFloat(composition.result.total_aa),
                umami_nuc: parseFloat(composition.result.total_nuc),
                umami_synergy: parseFloat(composition.result.total_synergy)
              } : {
                glu: 0,
                asp: 0,
                imp: 0,
                gmp: 0,
                amp: 0,
                umami_aa: 0,
                umami_nuc: 0,
                umami_synergy: 0
              }}
              showIndividual={false}
              onAddClick={() => onSearchIngredients?.('')}
            />
          </div>

          {/* TCM Combined Analysis - placeholder for now */}
          {composition.result && composition.ingredients.length > 0 && (
            <div className="paper-texture-light border border-gray-200 p-6">
              <h3 className="text-lg font-medium mb-4">TCM Analysis</h3>
              <div className="space-y-4">
                {/* TCM Qi combined visualization */}
                <TCMBars 
                  tcm={{
                    four_qi: aggregatedQi,
                    five_flavors: aggregatedFlavors,
                    meridians: aggregatedMeridians,
                    overview: '',
                    confidence: 1.0
                  }}
                  distributions={{
                    four_qi: qiDistribution,
                    five_flavors: flavorDistribution,
                    meridians: meridianDistribution
                  }}
                />
              </div>
            </div>
          )}

          {/* Composition Summary */}
          {composition.result && (
            <div className="bg-gray-50 border border-gray-200 p-4">
              <h4 className="font-medium mb-2">Composition Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Total Glu: {parseFloat(composition.result.total_glu).toFixed(1)}</div>
                <div>Total Asp: {parseFloat(composition.result.total_asp).toFixed(1)}</div>
                <div>Total IMP: {parseFloat(composition.result.total_imp).toFixed(1)}</div>
                <div>Total GMP: {parseFloat(composition.result.total_gmp).toFixed(1)}</div>
                <div>Total AMP: {parseFloat(composition.result.total_amp).toFixed(1)}</div>
                <div className="font-medium">Synergy: {parseFloat(composition.result.total_synergy).toFixed(1)}</div>
              </div>
            </div>
          )}

          {isUpdating && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
