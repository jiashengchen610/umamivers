'use client'

import { LevelBars } from './LevelBars'
import { BalanceSlider } from './BalanceSlider'
import { formatValue } from '@/lib/umamiLevels6'

interface CompositionChartProps {
  aa: number // mg/100g
  nuc: number // mg/100g
  synergy: number // EUC value
  pui?: number // Perceived Umami Index
  onRatioChange?: (aaPercent: number, nucPercent: number) => void
  className?: string
}

export function CompositionChart({ 
  aa, 
  nuc, 
  synergy, 
  pui,
  onRatioChange,
  className = '' 
}: CompositionChartProps) {
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Level Bars */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Umami Profile</h3>
        <LevelBars 
          aa={aa} 
          nuc={nuc} 
          synergy={synergy} 
          size="large"
        />
        
        {/* Values display */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="text-gray-500">AA</div>
            <div className="font-medium">{formatValue(aa)} mg</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">Nuc</div>
            <div className="font-medium">{formatValue(nuc)} mg</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">Synergy</div>
            <div className="font-medium">{formatValue(synergy)} mg</div>
          </div>
        </div>
      </div>
      
      {/* Balance Slider */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Adjust Balance</h3>
        <BalanceSlider 
          aa={aa} 
          nuc={nuc} 
          onRatioChange={onRatioChange}
        />
      </div>
      
      {/* PUI Display (if available) */}
      {pui !== undefined && pui > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Perceived Intensity (PUI)</span>
            <span className="text-2xl font-light text-fuchsia-700">{pui.toFixed(1)}<span className="text-sm text-gray-500"> / 100</span></span>
          </div>
        </div>
      )}
    </div>
  )
}
