'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, Plus } from 'lucide-react'
import { Ingredient } from '@/types'
import { getIngredient } from '@/lib/api'
import { UmamiChart, TCMBars } from './Charts'

interface IngredientDetailModalProps {
  ingredientId: number | null
  onClose: () => void
  onAddToComposition?: (ingredient: Ingredient) => void
  className?: string
}

export function IngredientDetailModal({ 
  ingredientId, 
  onClose, 
  onAddToComposition,
  className = '' 
}: IngredientDetailModalProps) {
  const [ingredient, setIngredient] = useState<Ingredient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ingredientId) {
      setIngredient(null)
      setLoading(false)
      return
    }

    const fetchIngredient = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getIngredient(ingredientId)
        setIngredient(data)
      } catch (err: any) {
        setError(err?.message || 'Failed to load ingredient details')
        console.error('Error fetching ingredient:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchIngredient()
  }, [ingredientId])

  if (!ingredientId) return null

  const handleAddToComposition = () => {
    if (ingredient && onAddToComposition) {
      onAddToComposition(ingredient)
      onClose()
      // Navigate back to Home Page
      window.location.href = '/'
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative paper-texture-light max-w-5xl w-full max-h-[95vh] overflow-hidden border border-gray-300">
          {/* Close button - flat design */}
          <button
            onClick={onClose}
            className="btn-circular absolute top-4 right-4 z-10 bg-gray-100 hover:bg-gray-200 transition-all border border-gray-300"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Content - Scrollable */}
          <div className="max-h-[95vh] overflow-y-auto scrollbar-hide">
            {loading && (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-600 text-lg">Loading ingredient details...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-20">
                <p className="text-red-600 text-lg">{error}</p>
              </div>
            )}

            {ingredient && !loading && (
              <>
                {/* Hero Section */}
                <div className="relative bg-blue-50 border-b border-blue-200 px-8 pt-12 pb-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Main Info */}
                    <div className="lg:col-span-2">
                      <div className="mb-4">
                        {ingredient.category && (
                          <span className="tag-element inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm uppercase tracking-wide font-medium mb-3">
                            {ingredient.category}
                          </span>
                        )}
                        <h1 className="text-3xl font-bold text-gray-900 mb-3">
                          {ingredient.display_name || ingredient.base_name}
                        </h1>
                        <p className="text-gray-600 text-lg leading-relaxed">
                          {ingredient.tcm?.overview || 
                           `${ingredient.display_name || ingredient.base_name} is a versatile ingredient prized for its unique flavor profile and nutritional benefits.`}
                        </p>
                      </div>
                      
                      {/* Tags */}
                      <div className="space-y-3">
                        {/* Dietary restrictions */}
                        {ingredient.flags?.dietary_restrictions && ingredient.flags.dietary_restrictions.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {ingredient.flags.dietary_restrictions.map((restriction, idx) => (
                              <span key={idx} className="tag-element px-3 py-1 bg-green-100 text-green-700 text-sm font-medium">
                                {restriction}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* Allergens */}
                        {ingredient.flags?.allergens && ingredient.flags.allergens.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {ingredient.flags.allergens.map((allergen, idx) => (
                              <span key={idx} className="tag-element px-3 py-1 bg-red-100 text-red-700 text-sm font-medium">
                                Contains {allergen}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* TCM Properties */}
                        {ingredient.tcm && (ingredient.tcm.five_flavors.length > 0 || ingredient.tcm.four_qi.length > 0) && (
                          <div className="flex flex-wrap gap-2">
                            {ingredient.tcm.five_flavors.slice(0, 3).map((flavor, idx) => (
                              <span key={idx} className="tag-element px-3 py-1 bg-green-50 text-green-700 text-sm border border-green-200">
                                {flavor}
                              </span>
                            ))}
                            {ingredient.tcm.four_qi.slice(0, 2).map((qi, idx) => (
                              <span key={idx} className="tag-element px-3 py-1 bg-blue-50 text-blue-700 text-sm border border-blue-200">
                                {qi}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Card */}
                    <div className="paper-texture-light p-6 border border-gray-200">
                      <div className="text-center mb-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Add to Composition</h3>
                        <p className="text-sm text-gray-600">Build your umami blend</p>
                      </div>
                      {onAddToComposition && (
                        <button
                          onClick={handleAddToComposition}
                          className="paper-texture-btn w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                          Add Ingredient
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Data Section */}
                <div className="px-8 py-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Umami Profile */}
                    {ingredient.chemistry && (
                      <div className="bg-orange-50 border border-orange-200 p-6">
                        <div className="mb-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Umami Profile</h3>
                          <p className="text-sm text-orange-600 font-medium">AA + Nuc = 8x Synergy</p>
                        </div>
                        <div className="space-y-4">
                          {/* AA */}
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700">Amino Acids (Glu, Asp)</span>
                              <span className="text-lg font-bold text-orange-600">{parseFloat(ingredient.chemistry.umami_aa || '0').toFixed(1)}</span>
                            </div>
                            <div className="chart-element h-3 bg-gray-200 overflow-hidden">
                              <div
                                className="h-full bg-orange-500 transition-all duration-500"
                                style={{ width: `${Math.min(100, (parseFloat(ingredient.chemistry.umami_aa || '0') / 2000) * 100)}%` }}
                              />
                            </div>
                          </div>
                          
                          {/* Nuc */}
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700">Nucleotides (IMP, GMP, AMP)</span>
                              <span className="text-lg font-bold text-yellow-600">{parseFloat(ingredient.chemistry.umami_nuc || '0').toFixed(1)}</span>
                            </div>
                            <div className="chart-element h-3 bg-gray-200 overflow-hidden">
                              <div
                                className="h-full bg-yellow-500 transition-all duration-500"
                                style={{ width: `${Math.min(100, (parseFloat(ingredient.chemistry.umami_nuc || '0') / 500) * 100)}%` }}
                              />
                            </div>
                          </div>
                          
                          {/* Synergy */}
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700">Synergy Potential</span>
                              <span className="text-lg font-bold text-purple-600">{parseFloat(ingredient.chemistry.umami_synergy || '0').toFixed(1)}</span>
                            </div>
                            <div className="chart-element h-3 bg-gray-200 overflow-hidden">
                              <div
                                className="h-full bg-purple-500 transition-all duration-500"
                                style={{ width: `${Math.min(100, (parseFloat(ingredient.chemistry.umami_synergy || '0') / 3000) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TCM Properties */}
                    {ingredient.tcm && (ingredient.tcm.four_qi.length > 0 || ingredient.tcm.five_flavors.length > 0) && (
                      <div className="bg-green-50 border border-green-200 p-6">
                        <div className="mb-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">TCM Properties</h3>
                          <p className="text-sm text-green-600 font-medium">Traditional Medicine Profile</p>
                        </div>
                        
                        <div className="space-y-6">
                          {/* Four Natures */}
                          {ingredient.tcm.four_qi.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-3">Four Natures (四氣)</h4>
                              <div className="flex gap-2">
                                {['Cold', 'Cool', 'Neutral', 'Warm', 'Hot'].map((qi) => {
                                  const isActive = ingredient.tcm!.four_qi.includes(qi)
                                  const colors = {
                                    'Cold': 'bg-blue-400',
                                    'Cool': 'bg-blue-300', 
                                    'Neutral': 'bg-gray-300',
                                    'Warm': 'bg-orange-300',
                                    'Hot': 'bg-red-400'
                                  }
                                  return (
                                    <div key={qi} className="flex-1 text-center">
                                      <div className={`chart-element h-8 ${isActive ? colors[qi as keyof typeof colors] : 'bg-gray-100'} transition-all duration-300`} />
                                      <span className={`text-xs mt-1 block ${isActive ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                                        {qi}
                                      </span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                          
                          {/* Five Tastes */}
                          {ingredient.tcm.five_flavors.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-3">TCM Five Tastes (五味)</h4>
                              <div className="flex gap-2">
                                {['Bitter', 'Sour', 'Salty', 'Sweet', 'Spicy'].map((flavor) => {
                                  const isActive = ingredient.tcm!.five_flavors.includes(flavor) || 
                                                  (flavor === 'Spicy' && ingredient.tcm!.five_flavors.includes('Pungent'))
                                  const colors = {
                                    'Bitter': 'bg-green-300',
                                    'Sour': 'bg-yellow-300',
                                    'Salty': 'bg-gray-400',
                                    'Sweet': 'bg-pink-300',
                                    'Spicy': 'bg-red-300'
                                  }
                                  return (
                                    <div key={flavor} className="flex-1 text-center">
                                      <div className={`chart-element h-8 ${isActive ? colors[flavor as keyof typeof colors] : 'bg-gray-100'} transition-all duration-300`} />
                                      <span className={`text-xs mt-1 block ${isActive ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                                        {flavor}
                                      </span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                          
                          {/* Meridians */}
                          {ingredient.tcm.meridians.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-3">Meridian Tropism (歸經)</h4>
                              <div className="flex flex-wrap gap-2">
                                {ingredient.tcm.meridians.map((meridian, idx) => (
                                  <span key={idx} className="tag-element px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium">
                                    {meridian}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Bottom Section - Usage Tips */}
                  <div className="mt-8 bg-gray-50 border border-gray-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Culinary Applications
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {ingredient.cooking_overview || 
                          `Perfect for enhancing umami depth in broths, marinades, and seasonings. 
                          Pairs exceptionally well with other high-nucleotide ingredients for maximum synergy effect.`}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Preparation Notes
                        </h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          {ingredient.extraction_temp && (
                            <p><span className="font-medium">Optimal Temperature:</span> {ingredient.extraction_temp}°C</p>
                          )}
                          {ingredient.extraction_time && (
                            <p><span className="font-medium">Extraction Time:</span> {ingredient.extraction_time} minutes</p>
                          )}
                          {(!ingredient.extraction_temp && !ingredient.extraction_time) && (
                            <p>Gentle heating recommended to preserve umami compounds. Avoid prolonged high-temperature cooking.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description section - Now inside scrollable area */}
                  <div className="mt-8 px-8 grid lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
                      <p className="text-gray-600 leading-relaxed">
                        {ingredient.tcm?.overview || 
                         `${ingredient.display_name || ingredient.base_name} are edible mushrooms native to East Asia, prized for their rich, savory taste and diverse health benefits. They are one of the most popular mushrooms worldwide.`}
                      </p>
                    </div>

                    <div>
                      <div className="paper-texture-light bg-gray-50 border border-gray-200 p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Find Combinations</h3>
                        <p className="text-gray-600 mb-4">
                          Discover ingredients that create umami synergy with {ingredient.display_name || ingredient.base_name}.
                        </p>
                        <button className="paper-texture-btn w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 transition-colors flex items-center justify-center gap-2">
                          Explore Pairings →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Preparation section - Now inside scrollable area */}
                  <div className="mt-8 px-8 pb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Preparation</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <span className="font-semibold text-gray-900">Methods:</span>
                        <span className="ml-2 text-gray-600">
                          Soak in water to extract umami. Use fresh or dried.
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">Extraction:</span>
                        <span className="ml-2 text-gray-600">
                          Gentle simmering enhances flavor. Avoid boiling.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook for URL-based modal management
export function useIngredientModal() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const ingredientId = searchParams.get('ingredient')

  const openModal = (id: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('ingredient', id.toString())
    router.push(`?${params.toString()}`)
  }

  const closeModal = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('ingredient')
    router.push(`?${params.toString()}`)
  }

  return {
    ingredientId: ingredientId ? parseInt(ingredientId, 10) : null,
    openModal,
    closeModal
  }
}