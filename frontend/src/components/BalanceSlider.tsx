'use client'

import { useState } from 'react'
import { calculateRatio, COLORS } from '@/lib/umamiLevels6'

interface BalanceSliderProps {
  aa: number
  nuc: number
  onRatioChange?: (aaPercent: number, nucPercent: number) => void
  className?: string
}

export function BalanceSlider({ aa, nuc, onRatioChange, className = '' }: BalanceSliderProps) {
  const ratio = calculateRatio(aa, nuc)
  const [sliderValue, setSliderValue] = useState(ratio.aa)
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const aaPercent = parseInt(e.target.value)
    const nucPercent = 100 - aaPercent
    setSliderValue(aaPercent)
    
    if (onRatioChange) {
      onRatioChange(aaPercent, nucPercent)
    }
  }
  
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>AA:Nuc Balance</span>
        <span className="font-medium">{sliderValue}:{100 - sliderValue}</span>
      </div>
      
      {/* Balance Bar */}
      <div className="relative h-10 rounded overflow-hidden flex">
        {/* AA side (green) */}
        <div 
          className="transition-all duration-300 flex items-center justify-center text-white font-medium text-sm"
          style={{ 
            width: `${sliderValue}%`,
            backgroundColor: COLORS.AA
          }}
        >
          {sliderValue > 15 && `AA ${sliderValue}`}
        </div>
        
        {/* Triangle indicator at center */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[10px] border-l-transparent border-r-transparent border-t-black" />
        
        {/* Nuc side (orange) */}
        <div 
          className="transition-all duration-300 flex items-center justify-center text-white font-medium text-sm"
          style={{ 
            width: `${100 - sliderValue}%`,
            backgroundColor: COLORS.NUC
          }}
        >
          {(100 - sliderValue) > 15 && `Nuc ${100 - sliderValue}`}
        </div>
      </div>
      
      {/* Slider */}
      <input
        type="range"
        min="0"
        max="100"
        value={sliderValue}
        onChange={handleSliderChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        style={{
          background: `linear-gradient(to right, ${COLORS.AA} 0%, ${COLORS.AA} ${sliderValue}%, ${COLORS.NUC} ${sliderValue}%, ${COLORS.NUC} 100%)`
        }}
      />
      
      <div className="flex justify-between text-[10px] text-gray-500">
        <span>More AA</span>
        <span>Balanced</span>
        <span>More Nuc</span>
      </div>
    </div>
  )
}
