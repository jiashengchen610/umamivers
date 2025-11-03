'use client'

import { getAALevel, getNucLevel, getSynergyLevel, COLORS } from '@/lib/umamiLevels6'

interface LevelBarsProps {
  aa: number // mg/100g
  nuc: number // mg/100g
  synergy: number // EUC value
  size?: 'small' | 'large'
  className?: string
}

export function LevelBars({ aa, nuc, synergy, size = 'small', className = '' }: LevelBarsProps) {
  const aaLevel = getAALevel(aa)
  const nucLevel = getNucLevel(nuc)
  const synLevel = getSynergyLevel(synergy)
  
  const isSmall = size === 'small'
  const barHeight = isSmall ? 'h-2' : 'h-4'
  const fontSize = isSmall ? 'text-[10px]' : 'text-xs'
  const gapSize = isSmall ? 'gap-1' : 'gap-2'
  
  const renderLevelBar = (level: number, color: string, label: string) => {
    return (
      <div className={`grid grid-cols-[32px_16px_1fr] items-center ${gapSize}`}>
        <span className={`${fontSize} text-gray-600 text-right`}>{label}</span>
        <span className={`${fontSize} text-gray-500 font-medium`}>{level}</span>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={`flex-1 ${barHeight} rounded-sm transition-all`}
              style={{
                backgroundColor: i <= level ? color : '#E5E7EB',
                opacity: i <= level ? 1 : 0.3
              }}
            />
          ))}
        </div>
      </div>
    )
  }
  
  return (
    <div className={`space-y-1 ${className}`}>
      {renderLevelBar(aaLevel.level, COLORS.AA, 'AA')}
      {renderLevelBar(nucLevel.level, COLORS.NUC, 'Nuc')}
      {renderLevelBar(synLevel.level, COLORS.SYN, 'Syn')}
    </div>
  )
}
