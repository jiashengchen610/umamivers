'use client'

import { useState, useEffect } from 'react'
import { Ingredient, CompositionState, CompositionResult } from '@/types'
import { TCMBars, UmamiChart } from '@/components/Charts'
import { SearchBar } from '@/components/SearchAndFilter'
import { Plus, X, Download, Share2, Save } from 'lucide-react'
import { composePreview } from '@/lib/api'

interface CompositionWorkbenchProps {
  composition: CompositionState
  onChange: (composition: CompositionState) => void
  onSearchIngredients?: (query: string) => void
  className?: string
}

const UNITS = [
  { value: 'g', label: 'g' },
  { value: 'oz', label: 'oz' },
  { value: 'tsp', label: 'tsp' },
  { value: 'tbsp', label: 'tbsp' },
  { value: 'cup', label: 'cup' }
]

export function CompositionWorkbench({ 
  composition, 
  onChange, 
  onSearchIngredients,
  className = '' 
}: CompositionWorkbenchProps) {
  const [isUpdating, setIsUpdating] = useState(false)

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
              composition.ingredients.map(item => (
                <div
                  key={item.ingredient.id}
                  className="paper-texture-light border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {item.ingredient.display_name || item.ingredient.base_name}
                      </h4>
                      <div className="text-xs text-gray-600 mt-1">
                        {item.ingredient.tcm?.five_flavors.join(', ')} • {item.ingredient.tcm?.four_qi.join(', ')}
                      </div>
                    </div>
                    <button
                      onClick={() => removeIngredient(item.ingredient.id)}
                      className="btn-circular-sm text-gray-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.ingredient.id, parseFloat(e.target.value) || 0)}
                      className="flex-1 px-2 py-1 border border-gray-300 text-sm"
                      min="0"
                      step="0.1"
                    />
                    <select
                      value={item.unit}
                      onChange={(e) => updateUnit(item.ingredient.id, e.target.value)}
                      className="px-2 py-1 border border-gray-300 text-sm"
                    >
                      {UNITS.map(unit => (
                        <option key={unit.value} value={unit.value}>
                          {unit.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Badges for Umami/TCM properties */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.ingredient.flags?.umami_tags.map((tag, idx) => (
                      <span key={idx} className="tag-element px-2 py-1 bg-orange-100 text-orange-800 text-xs">
                        {tag}
                      </span>
                    ))}
                    {item.ingredient.tcm?.meridians.map((meridian, idx) => (
                      <span key={idx} className="tag-element px-2 py-1 bg-blue-100 text-blue-800 text-xs">
                        {meridian}
                      </span>
                    ))}
                  </div>
                </div>
              ))
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
                    four_qi: [...new Set(composition.ingredients.flatMap(item => 
                      item.ingredient.tcm?.four_qi || []
                    ))],
                    five_flavors: [...new Set(composition.ingredients.flatMap(item => 
                      item.ingredient.tcm?.five_flavors || []
                    ))],
                    meridians: [...new Set(composition.ingredients.flatMap(item => 
                      item.ingredient.tcm?.meridians || []
                    ))],
                    overview: '',
                    confidence: 1.0
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