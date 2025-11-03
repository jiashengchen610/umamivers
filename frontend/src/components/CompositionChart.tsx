'use client'

import { LevelBars } from './LevelBars'
import { BalanceSlider } from './BalanceSlider'
import { formatValue, getUmamiDescription } from '@/lib/umamiLevels6'
import { Info } from 'lucide-react'

interface CompositionChartProps {
  aa: number // mg/100g
  nuc: number // mg/100g
  synergy: number // EUC value
  pui?: number // Perceived Umami Index
  className?: string
}

export function CompositionChart({ 
  aa, 
  nuc, 
  synergy, 
  pui,
  className = '' 
}: CompositionChartProps) {
  
  const umamiDescription = getUmamiDescription(synergy)
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Section: EUC + PUI */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600">Total Umami (EUC)</div>
            <div className="text-2xl font-light text-gray-900">{formatValue(synergy)} <span className="text-sm text-gray-500">mg/100g</span></div>
          </div>
          {pui !== undefined && pui > 0 && (
            <div className="text-right">
              <div className="text-sm text-gray-600">Perceived Intensity (PUI)</div>
              <div className="text-2xl font-light text-fuchsia-700">{pui.toFixed(1)}<span className="text-sm text-gray-500"> / 100</span></div>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 italic">{umamiDescription}</p>
      </div>
      
      {/* Divider */}
      <div className="border-t border-gray-200" />
      
      {/* Umami Profile with values above bars */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Umami Profile</h3>
          <a
            href="/how-to-use#level-system"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Learn about the 6-level system"
          >
            <Info className="w-4 h-4" />
          </a>
        </div>
        <LevelBars 
          aa={aa} 
          nuc={nuc} 
          synergy={synergy} 
          size="large"
          showValues={true}
        />
      </div>
      
      {/* Balance Analysis */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Balance Analysis</h3>
          <a
            href="/how-to-use#balance-calculation"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Learn about balance calculation"
          >
            <Info className="w-4 h-4" />
          </a>
        </div>
        <BalanceSlider 
          aa={aa} 
          nuc={nuc}
        />
      </div>
    </div>
  )
}
