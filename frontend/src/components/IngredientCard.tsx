'use client'

import { Ingredient } from '@/types'
import { CompactVerticalBars } from '@/components/Charts'
import { Plus, Info } from 'lucide-react'

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
  
  // Determine card role type based on tags
  const roleType = flags?.flavor_tags?.includes('flavor_supporting') 
    ? 'Flavor Supporting'
    : flags?.flavor_tags?.includes('flavor_carrier')
    ? 'Flavor Carrier' 
    : flags?.umami_tags?.includes('umami_carrier')
    ? 'Umami Carrier'
    : chemistry?.umami_aa && chemistry?.umami_nuc 
    ? `High Umami (AA+Nuc)`
    : chemistry?.umami_aa && chemistry.umami_aa > (chemistry?.umami_nuc || 0)
    ? 'High Umami(AA)'
    : 'Ingredient'

  return (
    <div className={`paper-texture-light border border-gray-200 hover:border-gray-300 transition-all ${compact ? 'p-2 sm:p-3' : 'p-3 sm:p-4'} ${className}`}>
      {/* Header with chart */}
      <div className="space-y-2 sm:space-y-3">
        {/* Title and Role */}
        <div>
          <div className="text-xs text-gray-500 mb-1">{roleType}</div>
          <h3 className="font-medium text-gray-900 text-sm leading-tight" title={displayName}>
            {displayName}
          </h3>
        </div>
        
        {/* Umami Chart - Mobile optimized */}
        {chemistry && (
          <div className="w-full">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <div className="chart-element w-2 h-2 bg-orange-500 flex-shrink-0"></div>
                <div className="chart-element flex-1 h-1.5 bg-gray-200 overflow-hidden min-w-0">
                  <div
                    className="h-full bg-orange-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, (parseFloat(chemistry.umami_aa?.toString() || '0') / 1000) * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 tabular-nums w-8 text-right">
                  {parseFloat(chemistry.umami_aa?.toString() || '0').toFixed(0)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="chart-element w-2 h-2 bg-yellow-600 flex-shrink-0"></div>
                <div className="chart-element flex-1 h-1.5 bg-gray-200 overflow-hidden min-w-0">
                  <div
                    className="h-full bg-yellow-600 transition-all duration-300"
                    style={{ width: `${Math.min(100, (parseFloat(chemistry.umami_nuc?.toString() || '0') / 500) * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 tabular-nums w-8 text-right">
                  {parseFloat(chemistry.umami_nuc?.toString() || '0').toFixed(0)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="chart-element w-2 h-2 bg-purple-400 flex-shrink-0"></div>
                <div className="chart-element flex-1 h-1.5 bg-gray-200 overflow-hidden min-w-0">
                  <div
                    className="h-full bg-purple-400 transition-all duration-300"
                    style={{ width: `${Math.min(100, (parseFloat(chemistry.umami_synergy?.toString() || '0') / 1500) * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 tabular-nums w-8 text-right">
                  {parseFloat(chemistry.umami_synergy?.toString() || '0').toFixed(0)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TCM Info - Mobile optimized */}
      {tcm && (tcm.five_flavors.length > 0 || tcm.four_qi.length > 0) && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1 text-xs">
            {tcm.five_flavors.slice(0, 2).map((flavor, idx) => (
              <span key={idx} className="tag-element px-2 py-1 bg-green-100 text-green-700 text-xs font-medium">
                {flavor}
              </span>
            ))}
            {tcm.four_qi.slice(0, 1).map((qi, idx) => (
              <span key={idx} className="tag-element px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium">
                {qi}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons - Mobile optimized */}
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        {onAddToComposition && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onAddToComposition(ingredient)
              // Navigate to home page (which is now the composition builder)
              window.location.href = '/'
            }}
            className="paper-texture-btn flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add to combo</span>
            <span className="sm:hidden">Add</span>
          </button>
        )}
        {onOpenDetails && (
          <button
            onClick={() => onOpenDetails(ingredient)}
            className="paper-texture-btn px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium transition-colors"
          >
            <span className="hidden sm:inline">Open details</span>
            <span className="sm:hidden">Details</span>
          </button>
        )}
      </div>
    </div>
  )
}