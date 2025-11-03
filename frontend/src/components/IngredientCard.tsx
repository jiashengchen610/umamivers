'use client'

import type { KeyboardEvent } from 'react'
import { Ingredient } from '@/types'
import { LevelBars } from './LevelBars'
import { getAALevel, getNucLevel, getSynergyLevel } from '@/lib/umamiLevels6'

type LabelMap = Record<string, string>

const MAX_TAG_DISPLAY = 3
const RELIGIOUS_DIETARY_KEYS = new Set(['halal', 'kosher'])

const ALLERGEN_LABELS: LabelMap = {
  dairy: 'Dairy',
  milk: 'Milk',
  lactose: 'Lactose',
  egg: 'Eggs',
  eggs: 'Eggs',
  fish: 'Fish',
  shellfish: 'Shellfish',
  crustacean: 'Crustaceans',
  crustaceans: 'Crustaceans',
  mollusk: 'Molluscs',
  molluscs: 'Molluscs',
  soy: 'Soy',
  soya: 'Soy',
  peanut: 'Peanuts',
  peanuts: 'Peanuts',
  tree_nut: 'Tree nuts',
  tree_nuts: 'Tree nuts',
  nuts: 'Nuts',
  sesame: 'Sesame',
  gluten: 'Gluten',
  wheat: 'Wheat',
  barley: 'Barley',
  rye: 'Rye',
  oats: 'Oats',
  mustard: 'Mustard',
  celery: 'Celery',
  lupin: 'Lupin',
  sulphite: 'Sulphites',
  sulphites: 'Sulphites',
  sulphur_dioxide: 'Sulphur dioxide',
}

const DIETARY_LABELS: LabelMap = {
  vegan: 'Vegan',
  vegetarian: 'Vegetarian',
  pescatarian: 'Pescatarian',
  gluten_free: 'Gluten free',
  dairy_free: 'Dairy free',
  nut_free: 'Nut free',
  soy_free: 'Soy free',
  egg_free: 'Egg free',
  halal: 'Halal',
  kosher: 'Kosher',
  keto: 'Keto',
  paleo: 'Paleo',
  low_fodmap: 'Low FODMAP',
}

const humanize = (value: string) =>
  value
    .replace(/[\s_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, char => char.toUpperCase())

const formatTag = (item: string, map: LabelMap) => {
  const normalized = item.toLowerCase().replace(/[\s-]+/g, '_')
  return map[normalized] ?? humanize(item)
}

function TagRow({
  items,
  label,
  map,
}: {
  items?: string[] | null
  label: string
  map: LabelMap
}) {
  if (!items || items.length === 0) {
    return null
  }

  const cleaned = items.map(item => item?.trim()).filter(Boolean) as string[]
  if (cleaned.length === 0) {
    return null
  }

  const visible = cleaned.slice(0, MAX_TAG_DISPLAY)
  const remaining = cleaned.length - visible.length

  return (
    <div className="flex flex-wrap items-center gap-1 text-xs" aria-label={label} role="list">
      <span className="sr-only">{label}</span>
      {visible.map(item => {
        const title = formatTag(item, map)

        return (
          <span
            key={`${label}-${item}`}
            role="listitem"
            className="tag-element px-2 py-1 bg-gray-100 text-gray-700 border border-gray-300 whitespace-nowrap"
            title={title}
          >
            {title}
          </span>
        )
      })}
      {remaining > 0 && (
        <span
          role="listitem"
          className="tag-element px-2 py-1 bg-gray-100 text-gray-700 border border-gray-300 whitespace-nowrap"
          title={`${remaining} more ${label.toLowerCase()}`}
        >
          +{remaining}
        </span>
      )}
    </div>
  )
}

interface IngredientCardProps {
  ingredient: Ingredient
  onAddToComposition?: (ingredient: Ingredient) => void
  onOpenDetails?: (ingredient: Ingredient) => void
  compact?: boolean
  className?: string
}

export function IngredientCard({ 
  ingredient, 
  onAddToComposition, 
  onOpenDetails, 
  compact = false,
  className = '' 
}: IngredientCardProps) {
  const displayName = ingredient.display_name || ingredient.base_name
  const chemistry = ingredient.chemistry
  const tcm = ingredient.tcm
  const flags = ingredient.flags
  const showAddAction = Boolean(onAddToComposition)
  const flavors = tcm?.five_flavors ?? []
  const qi = tcm?.four_qi ?? []
  const hasTcmInfo = flavors.length > 0 || qi.length > 0
  const allergenItems = flags?.allergens ?? []
  const dietaryItems = flags?.dietary_restrictions ?? []
  const religiousDietary = dietaryItems.filter(item => {
    const normalized = item.toLowerCase().replace(/[\s-]+/g, '_')
    return RELIGIOUS_DIETARY_KEYS.has(normalized)
  })
  const formattedReligiousDietary = religiousDietary.map(item => formatTag(item, DIETARY_LABELS))
  const dietaryLineOne = formattedReligiousDietary.slice(0, 2).join(', ')
  const dietarySecondSlice = formattedReligiousDietary.slice(2, 4)
  const remainingDietary = Math.max(0, formattedReligiousDietary.length - 4)
  let dietaryLineTwo = dietarySecondSlice.join(', ')
  if (remainingDietary > 0) {
    dietaryLineTwo = dietaryLineTwo ? `${dietaryLineTwo} +${remainingDietary}` : `+${remainingDietary}`
  }

  // Determine card role type based on chart levels
  const aa = parseFloat(chemistry?.umami_aa?.toString() || '0')
  const nuc = parseFloat(chemistry?.umami_nuc?.toString() || '0')
  const synergy = parseFloat(chemistry?.umami_synergy?.toString() || '0')
  
  const aaLevel = getAALevel(aa).level
  const nucLevel = getNucLevel(nuc).level
  const synLevel = getSynergyLevel(synergy).level
  
  // Staple foods that carry flavor
  const flavorCarriers = ['rice', 'bread', 'noodle', 'pasta', 'flour', 'wheat', 'grain']
  const isFlavorCarrier = flavorCarriers.some(term => 
    displayName.toLowerCase().includes(term) || 
    ingredient.base_name.toLowerCase().includes(term) ||
    ingredient.category?.toLowerCase().includes(term)
  )
  
  // High Umami: at least one metric reaches level 4+
  const isHighUmami = aaLevel >= 4 || nucLevel >= 4 || synLevel >= 4
  
  const roleType = isHighUmami
    ? 'High Umami'
    : isFlavorCarrier
    ? 'Flavor Carrier'
    : 'Flavor Supporting'

  const handleCardClick = () => {
    if (!onOpenDetails) return
    onOpenDetails(ingredient)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onOpenDetails) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onOpenDetails(ingredient)
    }
  }

  return (
    <div
      className={`paper-texture-light border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all ${compact ? 'p-2 sm:p-3' : 'p-3 sm:p-4'} ${className} flex flex-col h-full ${onOpenDetails ? 'cursor-pointer' : ''}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role={onOpenDetails ? 'button' : undefined}
      tabIndex={onOpenDetails ? 0 : undefined}
    >
      {/* Header with chart */}
      <div className="space-y-2 sm:space-y-3">
        {/* Title and Role */}
        <div>
          <div className="text-xs text-gray-500 mb-1">{roleType}</div>
          <h3 className="font-medium text-gray-900 text-sm leading-tight min-h-[2.5rem] overflow-hidden text-ellipsis" title={displayName}>
            {displayName}
          </h3>
        </div>
        
        {/* Umami Level Bars */}
        {chemistry && (
          <LevelBars 
            aa={parseFloat(chemistry.umami_aa?.toString() || '0')}
            nuc={parseFloat(chemistry.umami_nuc?.toString() || '0')}
            synergy={parseFloat(chemistry.umami_synergy?.toString() || '0')}
            size="small"
          />
        )}
      </div>

      {/* TCM info */}
      {hasTcmInfo && (
        <div className="mb-2 text-xs text-gray-600 space-y-1">
          <div className="font-medium">TCM</div>
          <div className="flex items-center gap-1">
            {flavors.length > 0 && (
              <span>{flavors.slice(0, 3).join(', ')}{flavors.length > 3 ? '…' : ''}</span>
            )}
            {flavors.length > 0 && qi.length > 0 && <span>•</span>}
            {qi.length > 0 && <span>{qi.join(', ')}</span>}
          </div>
        </div>
      )}

      {/* Add action */}
      {showAddAction && (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onAddToComposition?.(ingredient)
            window.location.href = '/'
          }}
          className="mt-auto w-full flex items-center justify-center bg-gray-900 text-white text-xs font-medium py-2 hover:bg-gray-800 transition-colors"
          title="Add to combo"
          aria-label="Add to combo"
        >
          + Add to combo
        </button>
      )}
    </div>
  )
}
