'use client'

import { Chemistry, TCM } from '@/types'
import { Plus } from 'lucide-react'

interface CategoricalBarProps {
  title: string
  data: Array<{ name: string, value: number, color: string }>
  onAddClick?: () => void
  className?: string
}

export function CategoricalBar({ title, data, onAddClick, className = '' }: CategoricalBarProps) {
  const maxValue = Math.max(...data.map(item => item.value), 1) // Prevent division by zero
  
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        {onAddClick && (
          <button
            onClick={onAddClick}
            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>
      
      <div className="space-y-1">
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? Math.round((item.value / maxValue) * 100) : 0
          return (
            <div key={index} className="flex items-center gap-2">
              <span className="text-xs text-gray-600 min-w-[60px] truncate" title={item.name}>
                {item.name}
              </span>
              <span className="text-xs text-gray-500 min-w-[35px]">{percentage}%</span>
              <div className="flex-1 h-4 bg-gray-100 rounded overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: item.color || '#D1D1D1'
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface TCMBarsProps {
  tcm: TCM
  distributions?: {
    four_qi?: Record<string, number>
    five_flavors?: Record<string, number>
    meridians?: Record<string, number>
  }
  onQiAddClick?: () => void
  onFlavorAddClick?: () => void
  onMeridianAddClick?: () => void
  className?: string
}

export function TCMBars({ tcm, distributions, onQiAddClick, onFlavorAddClick, onMeridianAddClick, className = '' }: TCMBarsProps) {
  const qiColors: Record<string, string> = {
    'Cold': '#6FB7E8',
    'Cool': '#9BB9E8', 
    'Neutral': '#D1D1D1',
    'Warm': '#E8B4CB',
    'Hot': '#E89BB9',
    'Slightly Warm': '#E8B4CB',
    'Slightly Cold': '#9BB9E8',
    'Variable': '#D1D1D1'
  }

  const flavorColors: Record<string, string> = {
    'Bitter': '#C8E6C9',
    'Sour': '#FFF9C4', 
    'Salty': '#E1E1E1',
    'Sweet': '#F8BBD9',
    'Pungent': '#FFAB91',
    'Bland': '#F5F5F5'
  }

  const normaliseFlavor = (label: string) => {
    if (label.toLowerCase() === 'spicy') return 'Pungent'
    return label
  }

  const buildSegments = (
    values: string[],
    colors: Record<string, string>,
    distribution?: Record<string, number>,
    normalise?: (label: string) => string
  ) => {
    const entries = distribution && Object.keys(distribution).length > 0
      ? Object.entries(distribution)
      : Array.from(new Set(values)).map(label => [label, 1])

    if (entries.length === 0) {
      return []
    }

    const total = entries.reduce((sum, [, value]) => sum + Number(value), 0) || 1
    const sorted = entries
      .map(([label, value]) => ({ label, value: Number(value) }))
      .sort((a, b) => b.value - a.value)

    let remainder = 100
    const segments = sorted.map((entry, index) => {
      const rawPercent = (entry.value / total) * 100
      const rounded = index === sorted.length - 1
        ? Math.max(0, remainder)
        : Math.round(rawPercent * 10) / 10
      remainder = Math.max(0, remainder - rounded)
      const displayLabel = normalise ? normalise(entry.label) : entry.label
      return {
        name: displayLabel,
        originalName: entry.label,
        value: rounded,
        color: colors[displayLabel] || '#D1D1D1'
      }
    }).filter(segment => segment.value > 0)

    const correction = 100 - segments.reduce((sum, segment) => sum + segment.value, 0)
    if (segments.length > 0 && Math.abs(correction) >= 0.1) {
      segments[segments.length - 1].value = Math.max(0, segments[segments.length - 1].value + correction)
    }

    return segments
  }

  const qiSegments = buildSegments(tcm.four_qi, qiColors, distributions?.four_qi)
  const flavorSegments = buildSegments(tcm.five_flavors, flavorColors, distributions?.five_flavors, normaliseFlavor)

  const meridianEntries = (() => {
    if (distributions?.meridians && Object.keys(distributions.meridians).length > 0) {
      const total = Object.values(distributions.meridians).reduce((sum, value) => sum + value, 0) || 1
      return Object.entries(distributions.meridians)
        .filter(([, value]) => value > 0)
        .map(([label, value]) => ({ label, value: Math.round((value / total) * 100) }))
        .sort((a, b) => b.value - a.value)
    }
    if (tcm.meridians.length === 0) return []
    const equalShare = 100 / tcm.meridians.length
    return Array.from(new Set(tcm.meridians)).map(label => ({ label, value: Math.round(equalShare) }))
  })()

  const renderStackedBar = (
    title: string,
    description: string,
    segments: Array<{ name: string, value: number, color: string }>,
    onAdd?: () => void
  ) => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        {onAdd && (
          <button
            onClick={onAdd}
            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>
      <div className="h-5 bg-gray-100 rounded overflow-hidden flex">
        {segments.map(segment => (
          <div
            key={segment.name}
            className="h-full"
            style={{
              width: `${segment.value}%`,
              backgroundColor: segment.color
            }}
            title={`${segment.name} ${segment.value.toFixed(0)}%`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-600">
        {segments.map(segment => (
          <span key={segment.name} className="flex items-center gap-1">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            {segment.name} {segment.value.toFixed(0)}%
          </span>
        ))}
      </div>
    </div>
  )

  const meridianText = meridianEntries.length > 0
    ? meridianEntries.map(entry => `${entry.label} ${entry.value}%`).join(' · ')
    : 'Not specified'

  return (
    <div className={`space-y-4 ${className}`}>
      {qiSegments.length > 0 && renderStackedBar(
        'Four Natures',
        'Thermal energy balance across ingredients',
        qiSegments,
        onQiAddClick
      )}

      {flavorSegments.length > 0 && renderStackedBar(
        'Five Tastes',
        'Flavor-energy interaction for organ targeting',
        flavorSegments,
        onFlavorAddClick
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Meridian Tropism</h3>
            <p className="text-xs text-gray-500">Energy pathways to specific organ systems</p>
          </div>
          {onMeridianAddClick && (
            <button
              onClick={onMeridianAddClick}
              className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
        <p className="text-xs text-gray-600">{meridianText}</p>
      </div>
    </div>
  )
}

interface UmamiChartProps {
  chemistry: Chemistry
  onAddClick?: () => void
  className?: string
  showIndividual?: boolean
}

export function UmamiChart({ chemistry, onAddClick, className = '', showIndividual = true }: UmamiChartProps) {
  // Safely parse chemistry values
  const aaValue = parseFloat(chemistry.umami_aa?.toString() || '0')
  const nucValue = parseFloat(chemistry.umami_nuc?.toString() || '0')
  const synergyValue = parseFloat(chemistry.umami_synergy?.toString() || '0')
  const maxValue = Math.max(aaValue, nucValue, synergyValue, 1)

  const isEnhanced = (() => {
    if (nucValue <= 0) return false
    const ratio = aaValue / nucValue
    return ratio >= 0.7 && ratio <= 1.5
  })()

  const synergyLabel = isEnhanced ? 'Enhanced' : 'Baseline'
  
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Umami Profile</h3>
          <p className="text-xs text-gray-500">AA + Nuc = Exponential Synergy (up to 8x enhancement)</p>
        </div>
        {onAddClick && (
          <button
            onClick={onAddClick}
            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>
      
      <div className="space-y-1.5">
        {[{
          label: showIndividual ? 'Amino Acids' : 'AA',
          value: aaValue,
          color: 'bg-orange-500',
          text: showIndividual ? 'Glu, Asp' : '',
          emphasis: false
        }, {
          label: showIndividual ? 'Nucleotides' : 'Nuc',
          value: nucValue,
          color: 'bg-yellow-600',
          text: showIndividual ? 'IMP, GMP, AMP' : '',
          emphasis: false
        }, {
          label: 'Synergy',
          value: synergyValue,
          color: 'bg-purple-400',
          text: synergyLabel,
          emphasis: true
        }].map(row => (
          <div key={row.label} className="grid grid-cols-[90px_48px_minmax(0,1fr)] items-center gap-2">
            <span className="text-xs text-gray-600">{row.label}</span>
            <span className="text-xs text-gray-500 text-right">{row.value.toFixed(1)}</span>
            <div className="h-6 bg-gray-200 rounded overflow-hidden">
              <div
                className={`h-full transition-all duration-300 px-2 flex items-center ${row.color}`}
                style={{ width: `${maxValue > 0 ? (row.value / maxValue) * 100 : 0}%` }}
              >
                {row.value > 0 && row.text && (
                  <span
                    className={`text-xs font-medium whitespace-nowrap ${
                      row.emphasis ? (isEnhanced ? 'text-gray-700' : 'text-purple-900/70') : 'text-white'
                    }`}
                  >
                    {row.text}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface MiniBarsProps {
  chemistry: Chemistry
  className?: string
}

export function MiniBars({ chemistry, className = '' }: MiniBarsProps) {
  const maxValue = Math.max(chemistry.umami_aa, chemistry.umami_nuc, chemistry.umami_synergy, 1)

  const rows = [
    { label: 'AA', value: chemistry.umami_aa, color: 'bg-umami-aa' },
    { label: 'Nuc', value: chemistry.umami_nuc, color: 'bg-umami-nuc' },
    { label: 'Syn', value: chemistry.umami_synergy, color: 'bg-umami-synergy' }
  ]

  return (
    <div className={`space-y-1 ${className}`}>
      {rows.map(row => (
        <div key={row.label} className="grid grid-cols-[32px_minmax(0,1fr)] items-center gap-1 text-xs text-gray-500">
          <span className="text-right">{row.label}</span>
          <div className="h-2 bg-gray-200 rounded overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${row.color}`}
              style={{ width: `${(row.value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// Allergen and Dietary Restrictions Chart
interface AllergenDietaryChartProps {
  flags?: {
    allergens?: string[]
    dietary_restrictions?: string[]
  }
  onAddClick?: () => void
  className?: string
}

export function AllergenDietaryChart({ flags, onAddClick, className = '' }: AllergenDietaryChartProps) {
  if (!flags || (!flags.allergens?.length && !flags.dietary_restrictions?.length)) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Allergens & Dietary</h3>
          {onAddClick && (
            <button onClick={onAddClick} className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500">No allergen or dietary information available</p>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Allergens & Dietary</h3>
        {onAddClick && (
          <button onClick={onAddClick} className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>
      
      {flags.allergens && flags.allergens.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-600 mb-1">Allergens</h4>
          <div className="flex flex-wrap gap-1">
            {flags.allergens.map((allergen, idx) => (
              <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                {allergen}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {flags.dietary_restrictions && flags.dietary_restrictions.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-600 mb-1">Dietary</h4>
          <div className="flex flex-wrap gap-1">
            {flags.dietary_restrictions.map((dietary, idx) => (
              <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                {dietary}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// New compact vertical bars for cards
interface CompactVerticalBarsProps {
  chemistry: Chemistry
  className?: string
}

export function CompactVerticalBars({ chemistry, className = '' }: CompactVerticalBarsProps) {
  const maxValue = Math.max(
    parseFloat(chemistry.umami_aa || '0'), 
    parseFloat(chemistry.umami_nuc || '0'), 
    parseFloat(chemistry.umami_synergy || '0')
  )
  
  const aaValue = parseFloat(chemistry.umami_aa || '0')
  const nucValue = parseFloat(chemistry.umami_nuc || '0')
  const synValue = parseFloat(chemistry.umami_synergy || '0')
  
  return (
    <div className={`flex flex-col gap-0.5 items-center ${className}`}>
      {/* Umami AA bar */}
      <div 
        className="w-6 h-2 rounded-sm transition-all duration-300"
        style={{ 
          backgroundColor: '#D2691E',
          opacity: maxValue > 0 ? Math.max(0.3, (aaValue / maxValue)) : 0.3,
          width: maxValue > 0 ? `${Math.max(12, (aaValue / maxValue) * 24)}px` : '12px'
        }}
        title={`AA: ${aaValue.toFixed(1)}`}
      />
      
      {/* Umami Nuc bar */}
      <div 
        className="w-6 h-2 rounded-sm transition-all duration-300"
        style={{ 
          backgroundColor: '#8B7355',
          opacity: maxValue > 0 ? Math.max(0.3, (nucValue / maxValue)) : 0.3,
          width: maxValue > 0 ? `${Math.max(12, (nucValue / maxValue) * 24)}px` : '12px'
        }}
        title={`Nuc: ${nucValue.toFixed(1)}`}
      />
      
      {/* Synergy bar */}
      <div 
        className="w-6 h-2 rounded-sm transition-all duration-300"
        style={{ 
          backgroundColor: '#DDA0DD',
          opacity: maxValue > 0 ? Math.max(0.3, (synValue / maxValue)) : 0.3,
          width: maxValue > 0 ? `${Math.max(12, (synValue / maxValue) * 24)}px` : '12px'
        }}
        title={`Syn: ${synValue.toFixed(1)}`}
      />
    </div>
  )
}
