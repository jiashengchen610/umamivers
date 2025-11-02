'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, Plus } from 'lucide-react'
import { Ingredient } from '@/types'
import { getIngredient } from '@/lib/api'
import { UmamiChart, TCMBars } from './Charts'

const RELIGIOUS_DIETARY_KEYS = new Set(['halal', 'kosher'])

const normaliseKey = (value: string) => value.toLowerCase().replace(/[\s-]+/g, '_')

const formatLabel = (value: string) =>
  value
    .replace(/[\s_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, char => char.toUpperCase())

const splitDietaryRestrictions = (items: string[] = []) => {
  const religious: string[] = []
  const other: string[] = []

  items.forEach(item => {
    const key = normaliseKey(item)
    if (RELIGIOUS_DIETARY_KEYS.has(key)) {
      religious.push(formatLabel(item))
    } else {
      other.push(formatLabel(item))
    }
  })

  return { religious, other }
}

const formatAlias = (name: string, language: string) =>
  language ? `${name} (${formatLabel(language)})` : name

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
      window.location.href = '/'
    }
  }

  const name = ingredient?.display_name || ingredient?.base_name
  const summaryText = ingredient?.tcm?.overview || ingredient?.cooking_overview
  const fallbackSummary = name
    ? `${name} is a versatile ingredient valued for its culinary applications and balanced umami profile.`
    : 'This ingredient offers a balanced umami contribution and flexible pairing options.'
  const allergens = ingredient?.flags?.allergens ?? []
  const formattedAllergens = allergens.map(formatLabel)
  const dietarySplit = ingredient ? splitDietaryRestrictions(ingredient.flags?.dietary_restrictions ?? []) : { religious: [], other: [] }
  const tcmFlavors = ingredient?.tcm?.five_flavors ?? []
  const tcmQi = ingredient?.tcm?.four_qi ?? []
  const tcmMeridians = ingredient?.tcm?.meridians ?? []
  const aliasSummary = ingredient?.aliases?.map(alias => formatAlias(alias.name, alias.language)).join(', ')

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${className}`}>
      <div 
        className="fixed inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div className="relative paper-texture-light w-full max-w-5xl max-h-[95vh] overflow-hidden border border-gray-300">
          <button
            onClick={onClose}
            className="btn-circular absolute top-4 right-4 z-10 bg-gray-100 hover:bg-gray-200 transition-all border border-gray-300"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          <div className="max-h-[95vh] overflow-y-auto scrollbar-hide">
            {loading && (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500"></div>
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
                <section className="px-4 sm:px-8 pt-12 pb-8 bg-white border-b border-gray-200">
                  <div className="grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,2fr)_1fr] items-start">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        {ingredient.category && (
                          <span className="text-xs uppercase tracking-wide text-gray-500">{ingredient.category}</span>
                        )}
                        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">{name}</h1>
                        <p className="text-sm leading-relaxed text-gray-600">
                          {summaryText || fallbackSummary}
                        </p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 text-sm text-gray-700">
                        {(tcmFlavors.length > 0 || tcmQi.length > 0) && (
                          <div className="space-y-1">
                            <div className="text-xs font-medium uppercase text-gray-500">TCM focus</div>
                            <p className="leading-relaxed">
                              {[tcmFlavors.slice(0, 3).join(', '), tcmQi.join(', ')].filter(Boolean).join(' • ') || 'Balanced profile'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 rounded border border-gray-200 bg-white p-4 sm:p-6">
                      <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900">Composition</h2>
                        <p className="mt-2 text-sm text-gray-600">
                          Add {name} directly to your composition workspace.
                        </p>
                      </div>
                      {onAddToComposition && (
                        <button
                          onClick={handleAddToComposition}
                          className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-medium py-2 hover:bg-gray-800 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>+ Add to combo</span>
                        </button>
                      )}
                      <div className="pt-3 border-t border-gray-200 text-xs text-gray-500 space-y-1">
                        <div>Base name: {ingredient.base_name}</div>
                        {aliasSummary && <div>Aliases: {aliasSummary}</div>}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="px-4 sm:px-8 py-8 bg-white space-y-8">
                  <div className="grid gap-6 lg:grid-cols-2">
                    {ingredient.chemistry && (
                      <div className="paper-texture-light border border-gray-200 p-4 sm:p-6">
                        <UmamiChart chemistry={ingredient.chemistry} />
                      </div>
                    )}
                    {ingredient.tcm && (
                      <div className="paper-texture-light border border-gray-200 p-4 sm:p-6">
                        <TCMBars tcm={ingredient.tcm} />
                      </div>
                    )}
                  </div>

                  {(tcmMeridians.length > 0 || ingredient.similar?.length || ingredient.complementary?.length) && (
                    <div className="grid gap-6 lg:grid-cols-2">
                      {tcmMeridians.length > 0 && (
                        <div className="paper-texture-light border border-gray-200 p-4 sm:p-6 space-y-3">
                          <h3 className="text-lg font-semibold text-gray-900">Meridian Guidance</h3>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {name} interacts with the following meridians:
                          </p>
                          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                            {tcmMeridians.map(item => (
                              <li key={item}>{formatLabel(item)}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {(ingredient.similar?.length || ingredient.complementary?.length) && (
                        <div className="paper-texture-light border border-gray-200 p-4 sm:p-6 space-y-3">
                          <h3 className="text-lg font-semibold text-gray-900">Pairing Notes</h3>
                          {ingredient.complementary?.length ? (
                            <div className="text-sm text-gray-700">
                              <div className="text-xs font-medium uppercase text-gray-500 mb-1">Synergistic partners</div>
                              <ul className="space-y-1 list-disc list-inside text-gray-600">
                                {ingredient.complementary.slice(0, 4).map(item => (
                                  <li key={item.id}>{item.display_name || item.base_name}</li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                          {ingredient.similar?.length ? (
                            <div className="text-sm text-gray-700">
                              <div className="text-xs font-medium uppercase text-gray-500 mb-1">Similar profile</div>
                              <ul className="space-y-1 list-disc list-inside text-gray-600">
                                {ingredient.similar.slice(0, 4).map(item => (
                                  <li key={item.id}>{item.display_name || item.base_name}</li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="paper-texture-light border border-gray-200 p-4 sm:p-6 space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900">Overview</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {summaryText || fallbackSummary}
                      </p>
                    </div>
                    <div className="paper-texture-light border border-gray-200 p-4 sm:p-6 space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900">Preparation</h3>
                      <ul className="text-sm text-gray-700 space-y-2">
                        {ingredient.extraction_temp && (
                          <li><span className="font-medium text-gray-900">Extraction temperature:</span> {ingredient.extraction_temp}°C</li>
                        )}
                        {ingredient.extraction_time && (
                          <li><span className="font-medium text-gray-900">Extraction time:</span> {ingredient.extraction_time} minutes</li>
                        )}
                        {(!ingredient.extraction_temp && !ingredient.extraction_time) && (
                          <li>Gentle heating preserves umami compounds; avoid prolonged high-temperature cooking.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

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
    closeModal,
  }
}
