'use client'

interface TriangleChartProps {
  euc: number // Chemical intensity in mg/100g
  pui: number // Perceived intensity 0-100
  aa: number // Amino acids mg/100g
  nuc: number // Nucleotides mg/100g
  className?: string
}

export default function TriangleChart({ euc, pui, aa, nuc, className = '' }: TriangleChartProps) {
  // Calculate ratio for needle position
  const ratio = nuc > 0 ? aa / nuc : 100
  const ratioText = `${aa.toFixed(0)}:${nuc.toFixed(0)}`
  
  // Calculate needle rotation: ratio <1 = left, ratio >1 = right, ratio=1 = center
  // Map ratio to angle: 0.1 -> -45deg, 1 -> 0deg, 10 -> +45deg
  const getNeedleRotation = (r: number): number => {
    const logRatio = Math.log10(Math.max(0.1, Math.min(10, r)))
    return logRatio * 45 // -45 to +45 degrees
  }
  
  const needleRotation = getNeedleRotation(ratio)
  
  // Determine colors based on values
  const getEucColor = () => {
    if (euc >= 2600) return 'text-fuchsia-950'
    if (euc >= 500) return 'text-fuchsia-900'
    if (euc >= 300) return 'text-fuchsia-800'
    if (euc >= 80) return 'text-fuchsia-700'
    if (euc >= 10) return 'text-fuchsia-600'
    return 'text-gray-500'
  }
  
  const getPuiColor = () => {
    if (pui >= 90) return 'text-fuchsia-700'
    if (pui >= 70) return 'text-fuchsia-600'
    if (pui >= 50) return 'text-fuchsia-500'
    return 'text-fuchsia-400'
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Triangle SVG */}
      <div className="relative w-full max-w-md aspect-[2/1]">
        <svg className="w-full h-full" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
          {/* Triangle base layers */}
          {/* Bottom layer - beige/cream */}
          <path
            d="M 50 180 L 350 180 L 200 20 Z"
            fill="#F5E6D3"
            opacity="0.6"
          />
          
          {/* Middle layer - light blue */}
          <path
            d="M 80 180 L 320 180 L 200 60 Z"
            fill="#B3D4E8"
            opacity="0.5"
          />
          
          {/* Top layer - purple (size based on PUI) */}
          <path
            d={`M ${120 + (1 - pui/100) * 80} 180 L ${280 - (1 - pui/100) * 80} 180 L 200 ${100 - pui*0.6} Z`}
            fill="#D8B4FE"
            opacity="0.7"
          />
          
          {/* Needle - vertical black line */}
          <g transform={`rotate(${needleRotation} 200 180)`}>
            <line
              x1="200"
              y1="180"
              x2="200"
              y2="40"
              stroke="black"
              strokeWidth="3"
            />
            <circle cx="200" cy="180" r="5" fill="black" />
          </g>
        </svg>
        
        {/* EUC label - top left */}
        <div className="absolute top-4 left-8 bg-white/90 backdrop-blur-sm px-3 py-2 rounded shadow-sm border border-gray-200">
          <div className="text-xs text-gray-600">Chemical (EUC)</div>
          <div className={`text-xl font-light ${getEucColor()}`}>
            {euc.toFixed(1)} <span className="text-xs">mg/100g</span>
          </div>
          <div className="text-xs text-gray-500">Theoretical Maximum</div>
        </div>
        
        {/* PUI label - top right */}
        <div className="absolute top-4 right-8 bg-white/90 backdrop-blur-sm px-3 py-2 rounded shadow-sm border border-gray-200">
          <div className="text-xs text-gray-600">Perceived (PUI)</div>
          <div className={`text-xl font-light ${getPuiColor()}`}>
            {pui.toFixed(1)} <span className="text-xs">/ 100</span>
          </div>
          <div className="text-xs text-gray-500">Sensory intensity</div>
        </div>
        
        {/* PUI value - bottom center (alternative position) */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded shadow-sm border border-gray-200">
          <div className="text-xs text-gray-600 text-center">Perceived (PUI)</div>
          <div className={`text-base font-light ${getPuiColor()} text-center`}>
            {pui.toFixed(1)} <span className="text-xs">/ 100</span>
          </div>
          <div className="text-xs text-gray-500 text-center">Sensory intensity</div>
        </div>
      </div>
      
      {/* Synergy ratio at bottom */}
      <div className="mt-4 text-center">
        <div className="text-2xl font-light">Synergy ratio {ratioText}</div>
      </div>
    </div>
  )
}
