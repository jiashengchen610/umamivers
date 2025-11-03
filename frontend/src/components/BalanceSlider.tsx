'use client'

import { calculateRatio } from '@/lib/umamiLevels6'

interface BalanceSliderProps {
  aa: number
  nuc: number
  className?: string
}

export function BalanceSlider({ aa, nuc, className = '' }: BalanceSliderProps) {
  const ratio = calculateRatio(aa, nuc)
  
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span className="font-medium">AA:Nuc Balance</span>
        <span className="font-medium text-gray-900">{ratio.text}</span>
      </div>
      
      {/* Static Balance Bar with Gradient */}
      <div className="relative h-10 rounded-lg overflow-hidden">
        {/* Gradient background: light to dark in center */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, #EEF4EB 0%, #5E8756 50%, #A86D1C 50%, #FAF3E8 100%)`
          }}
        />
        
        {/* Current ratio indicator */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-black"
          style={{ left: `${ratio.aa}%` }}
        />
        
        {/* Triangle indicator */}
        <div 
          className="absolute top-0 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[10px] border-l-transparent border-r-transparent border-t-black transform -translate-x-1/2"
          style={{ left: `${ratio.aa}%` }}
        />
        
        {/* Labels */}
        <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-medium text-white">
          <span>AA {ratio.aa}%</span>
          <span>Nuc {ratio.nuc}%</span>
        </div>
      </div>
      
      {/* Educational note */}
      <p className="text-xs text-gray-600 leading-relaxed">
        Theoretically, the strongest umami synergy occurs around a <span className="font-medium">50:50 balance</span> between amino acids and nucleotides, where the 1218× multiplier effect is maximized.
      </p>
    </div>
  )
}
