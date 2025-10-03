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
  onQiAddClick?: () => void
  onFlavorAddClick?: () => void
  onMeridianAddClick?: () => void
  className?: string
}

export function TCMBars({ tcm, onQiAddClick, onFlavorAddClick, onMeridianAddClick, className = '' }: TCMBarsProps) {
  // Color mapping for TCM attributes
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
    'Spicy': '#FFAB91',
    'Pungent': '#FFAB91',
    'Astringent': '#E8E8E8',
    'Bland': '#F5F5F5'
  }
  
  // Create data for bars with proper value calculation
  const qiData = tcm.four_qi.map(qi => ({
    name: qi,
    value: Math.round(100 / tcm.four_qi.length), // Equal distribution based on actual count
    color: qiColors[qi] || '#D1D1D1'
  }))
  
  const flavorData = tcm.five_flavors.map(flavor => ({
    name: flavor, 
    value: Math.round(100 / tcm.five_flavors.length), // Equal distribution based on actual count
    color: flavorColors[flavor] || '#F5F5F5'
  }))
  
  // Meridians display (different format)
  const meridianText = tcm.meridians.length > 0 
    ? tcm.meridians.map((meridian, index) => {
        const percentage = Math.floor(100 / tcm.meridians.length)
        return `${meridian} ${percentage}%`
      }).join(' , ')
    : 'Not specified'
  
  return (
    <div className={`space-y-4 ${className}`}>
      {qiData.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Four Natures (四氣)</h3>
              <p className="text-xs text-gray-500">Thermal energy effects: Cold ❄️ Cool 🌊 Neutral ⚖️ Warm ☀️ Hot 🔥</p>
            </div>
            {onQiAddClick && (
              <button
                onClick={onQiAddClick}
                className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </div>
          <div className="space-y-1">
            {qiData.map((item, index) => {
              const percentage = Math.max(...qiData.map(d => d.value)) > 0 ? Math.round((item.value / Math.max(...qiData.map(d => d.value))) * 100) : 0
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
      )}
      
      {flavorData.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-medium text-gray-700">TCM Five Tastes (五味)</h3>
              <p className="text-xs text-gray-500">Organ connection: Bitter→Heart Sour→Liver Sweet→Spleen Spicy→Lungs Salty→Kidneys</p>
            </div>
            {onFlavorAddClick && (
              <button
                onClick={onFlavorAddClick}
                className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </div>
          <div className="space-y-1">
            {flavorData.map((item, index) => {
              const maxFlavorValue = Math.max(...flavorData.map(d => d.value), 1)
              const percentage = maxFlavorValue > 0 ? Math.round((item.value / maxFlavorValue) * 100) : 0
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
      )}
      
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Meridian Tropism (歸經)</h3>
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
      
      <div className="space-y-2">
        {/* Amino Acids */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 min-w-[80px]">
            {showIndividual ? 'Amino Acids' : 'AA'}
          </span>
          <span className="text-xs text-gray-500 min-w-[35px]">{aaValue.toFixed(1)}</span>
          <div className="flex-1 h-6 bg-gray-200 rounded overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all duration-300 flex items-center px-2"
              style={{ width: `${maxValue > 0 ? (aaValue / maxValue) * 100 : 0}%` }}
            >
              {aaValue > 0 && (
                <span className="text-xs font-medium text-white whitespace-nowrap">
                  {showIndividual ? 'Glu, Asp' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Nucleotides */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 min-w-[80px]">
            {showIndividual ? 'Nucleotides' : 'Nuc'}
          </span>
          <span className="text-xs text-gray-500 min-w-[35px]">{nucValue.toFixed(1)}</span>
          <div className="flex-1 h-6 bg-gray-200 rounded overflow-hidden">
            <div
              className="h-full bg-yellow-600 transition-all duration-300 flex items-center px-2"
              style={{ width: `${maxValue > 0 ? (nucValue / maxValue) * 100 : 0}%` }}
            >
              {nucValue > 0 && (
                <span className="text-xs font-medium text-white whitespace-nowrap">
                  {showIndividual ? 'IMP, GMP, AMP' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Synergy */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 min-w-[80px]">Synergy</span>
          <span className="text-xs text-gray-500 min-w-[35px]">{synergyValue.toFixed(1)}</span>
          <div className="flex-1 h-6 bg-gray-200 rounded overflow-hidden">
            <div
              className="h-full bg-purple-400 transition-all duration-300 flex items-center px-2"
              style={{ width: `${maxValue > 0 ? (synergyValue / maxValue) * 100 : 0}%` }}
            >
              {synergyValue > 0 && (
                <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                  Enhanced
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface MiniBarsProps {
  chemistry: Chemistry
  className?: string
}

export function MiniBars({ chemistry, className = '' }: MiniBarsProps) {
  const maxValue = Math.max(chemistry.umami_aa, chemistry.umami_nuc, chemistry.umami_synergy)
  
  return (
    <div className={`flex gap-1 ${className}`}>
      {/* Umami AA bar */}
      <div className="flex-1 space-y-1">
        <div className="h-2 bg-gray-200 rounded overflow-hidden">
          <div
            className="h-full bg-umami-aa transition-all duration-300"
            style={{ 
              width: maxValue > 0 ? `${(chemistry.umami_aa / maxValue) * 100}%` : '0%' 
            }}
          />
        </div>
        <div className="text-xs text-gray-500 text-center">AA</div>
      </div>
      
      {/* Umami Nuc bar */}
      <div className="flex-1 space-y-1">
        <div className="h-2 bg-gray-200 rounded overflow-hidden">
          <div
            className="h-full bg-umami-nuc transition-all duration-300"
            style={{ 
              width: maxValue > 0 ? `${(chemistry.umami_nuc / maxValue) * 100}%` : '0%' 
            }}
          />
        </div>
        <div className="text-xs text-gray-500 text-center">Nuc</div>
      </div>
      
      
      {/* Synergy bar */}
      <div className="flex-1 space-y-1">
        <div className="h-2 bg-gray-200 rounded overflow-hidden">
          <div
            className="h-full bg-umami-synergy transition-all duration-300"
            style={{ 
              width: maxValue > 0 ? `${(chemistry.umami_synergy / maxValue) * 100}%` : '0%' 
            }}
          />
        </div>
        <div className="text-xs text-gray-500 text-center">Syn</div>
      </div>
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
