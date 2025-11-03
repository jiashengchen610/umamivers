'use client'

import { getAALevel, getNucLevel, getSynergyLevel, formatValue } from '@/lib/umamiLevels6'

interface LevelBarsProps {
  aa: number // mg/100g
  nuc: number // mg/100g
  synergy: number // EUC value
  size?: 'small' | 'large'
  showValues?: boolean
  className?: string
}

// Level-specific colors for each metric
const AA_COLORS = ['#EEF4EB', '#D4E5CF', '#B0D1A7', '#8AB87F', '#73A36A', '#5E8756']
const NUC_COLORS = ['#FAF3E8', '#EFD9BA', '#DBBB8A', '#C69D5E', '#B8863A', '#A86D1C']
const SYN_COLORS = ['#F9F3FC', '#EBD9F4', '#D5B5ED', '#C091E7', '#B67BE5', '#A865E4']

export function LevelBars({ aa, nuc, synergy, size = 'small', showValues = false, className = '' }: LevelBarsProps) {
  const aaLevel = getAALevel(aa)
  const nucLevel = getNucLevel(nuc)
  const synLevel = getSynergyLevel(synergy)
  
  const isSmall = size === 'small'
  const barHeight = isSmall ? 'h-2' : 'h-4'
  const fontSize = isSmall ? 'text-[10px]' : 'text-xs'
  const gapSize = isSmall ? 'gap-1' : 'gap-2'
  
  const renderLevelBar = (value: number, level: number, colors: string[], label: string) => {
    // If value is 0 or very close to 0, don't show any filled cells
    const isEmpty = value === 0 || level === 0
    
    return (
      <div>
        {showValues && (
          <div className="flex items-center justify-between mb-1">
            <span className={`${fontSize} text-gray-600`}>{label}</span>
            <span className={`${fontSize} text-gray-900 font-medium`}>
              {isEmpty ? '0' : formatValue(value)} mg
            </span>
          </div>
        )}
        {!showValues ? (
          <div className="grid grid-cols-[32px_16px_1fr] items-center gap-2">
            <span className={`${fontSize} text-gray-600 text-right`}>{label}</span>
            <span className={`${fontSize} text-gray-500 font-medium`}>{isEmpty ? '0' : level}</span>
            <div className="flex gap-0.5">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`flex-1 ${barHeight} transition-all`}
                  style={{
                    backgroundColor: isEmpty ? '#F3F4F6' : (i < level ? colors[i] : '#E5E7EB'),
                    opacity: isEmpty ? 0.5 : (i < level ? 1 : 0.3),
                    borderRadius: i === 0 ? '4px 0 0 4px' : i === 5 ? '0 4px 4px 0' : '0'
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex gap-0.5">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`flex-1 ${barHeight} transition-all`}
                style={{
                  backgroundColor: isEmpty ? '#F3F4F6' : (i < level ? colors[i] : '#E5E7EB'),
                  opacity: isEmpty ? 0.5 : (i < level ? 1 : 0.3),
                  borderRadius: i === 0 ? '4px 0 0 4px' : i === 5 ? '0 4px 4px 0' : '0'
                }}
              />
            ))}
          </div>
        )}
      </div>
    )
  }
  
  return (
    <div className={`space-y-1 ${className}`}>
      {renderLevelBar(aa, aaLevel.level, AA_COLORS, 'AA')}
      {renderLevelBar(nuc, nucLevel.level, NUC_COLORS, 'Nuc')}
      {renderLevelBar(synergy, synLevel.level, SYN_COLORS, 'Syn')}
    </div>
  )
}
