'use client'

import { calculateRatio } from '@/lib/umamiLevels6'

interface BalanceSliderProps {
  aa: number
  nuc: number
  className?: string
}

export function BalanceSlider({ aa, nuc, className = '' }: BalanceSliderProps) {
  const ratio = calculateRatio(aa, nuc)
  
  // Generate gradient that shows proportion with darkest color at 50% midpoint
  const generateGradient = () => {
    const aaPercent = ratio.aa
    const nucPercent = ratio.nuc
    
    // AA colors: lightest to darkest
    const aaLight = '#EEF4EB'
    const aaDark = '#5E8756'
    
    // Nuc colors: lightest to darkest  
    const nucLight = '#FAF3E8'
    const nucDark = '#A86D1C'
    
    if (aaPercent >= 50) {
      // AA dominant: show AA gradient from light to dark at 50%, then transition to Nuc
      return `linear-gradient(to right, 
        ${aaLight} 0%, 
        ${aaDark} 50%, 
        ${nucLight} ${aaPercent}%, 
        ${nucLight} 100%
      )`
    } else {
      // Nuc dominant: show AA area, then Nuc gradient with dark at 50%
      return `linear-gradient(to right, 
        ${aaLight} 0%, 
        ${aaLight} ${aaPercent}%, 
        ${nucDark} 50%, 
        ${nucLight} 100%
      )`
    }
  }
  
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span className="font-medium">AA:Nuc Balance</span>
        <span className="font-medium text-gray-900">{ratio.text}</span>
      </div>
      
      {/* Static Balance Bar with Gradient */}
      <div className="relative h-10 rounded-lg overflow-hidden">
        {/* Gradient background: proportional with darkest at 50% */}
        <div 
          className="absolute inset-0"
          style={{
            background: generateGradient()
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
        <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-medium text-black">
          <span>AA {ratio.aa}%</span>
          <span>Nuc {ratio.nuc}%</span>
        </div>
      </div>
      
      {/* Educational note */}
      <p className="text-xs text-gray-600 leading-relaxed">
        Peak synergy occurs at a <span className="font-medium">50:50 balance</span>, maximizing the 1218× multiplier effect.
      </p>
    </div>
  )
}
