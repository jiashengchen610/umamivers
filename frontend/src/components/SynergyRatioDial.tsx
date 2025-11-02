'use client'

interface SynergyRatioDialProps {
  ratio: number
  zone: 'needs_aa' | 'optimal' | 'needs_nuc'
  suggestion: string
}

export default function SynergyRatioDial({ ratio, zone, suggestion }: SynergyRatioDialProps) {
  // Calculate needle rotation: ratio 0.1 -> -60deg, 1.0 -> 0deg, 10 -> +60deg (log scale)
  const getRotation = (r: number): number => {
    const logRatio = Math.log10(Math.max(0.01, Math.min(100, r)))
    // Map log scale: log(0.1)=-1 to -60deg, log(1)=0 to 0deg, log(10)=1 to +60deg
    return logRatio * 60
  }

  const rotation = getRotation(ratio)

  // Zone colors
  const getZoneColor = () => {
    switch (zone) {
      case 'needs_aa':
        return 'text-amber-600'
      case 'optimal':
        return 'text-fuchsia-700'
      case 'needs_nuc':
        return 'text-blue-600'
      default:
        return 'text-gray-500'
    }
  }

  const zoneColor = getZoneColor()

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg border border-gray-200">
      <h3 className="text-sm font-medium text-gray-700">Synergy Ratio Dial</h3>
      
      {/* Dial visualization */}
      <div className="relative w-48 h-24">
        {/* Background arc zones */}
        <svg className="w-full h-full" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
          {/* Left zone: needs nucleotides (<0.6) */}
          <path
            d="M 20 90 A 80 80 0 0 1 65 25"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="20"
            strokeLinecap="round"
            opacity="0.3"
          />
          
          {/* Center zone: optimal (0.6-1.6) */}
          <path
            d="M 65 25 A 80 80 0 0 1 135 25"
            fill="none"
            stroke="#d946ef"
            strokeWidth="20"
            strokeLinecap="round"
            opacity="0.5"
          />
          
          {/* Right zone: needs amino acids (>1.6) */}
          <path
            d="M 135 25 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="#2563eb"
            strokeWidth="20"
            strokeLinecap="round"
            opacity="0.3"
          />
          
          {/* Needle */}
          <g transform={`rotate(${rotation} 100 90)`}>
            <line
              x1="100"
              y1="90"
              x2="100"
              y2="30"
              stroke="currentColor"
              strokeWidth="2"
              className={zoneColor}
            />
            <circle cx="100" cy="90" r="4" fill="currentColor" className={zoneColor} />
          </g>
          
          {/* Tick marks */}
          <text x="20" y="95" fontSize="10" fill="#6b7280" textAnchor="middle">0.1</text>
          <text x="65" y="20" fontSize="10" fill="#6b7280" textAnchor="middle">0.6</text>
          <text x="100" y="10" fontSize="10" fill="#6b7280" textAnchor="middle">1:1</text>
          <text x="135" y="20" fontSize="10" fill="#6b7280" textAnchor="middle">1.6</text>
          <text x="180" y="95" fontSize="10" fill="#6b7280" textAnchor="middle">10</text>
        </svg>
      </div>

      {/* Ratio value */}
      <div className="text-center">
        <p className="text-xs text-gray-500">AA : Nuc</p>
        <p className={`text-2xl font-light ${zoneColor}`}>
          {ratio < 0.01 ? '<0.01' : ratio > 100 ? '>100' : ratio.toFixed(2)}
        </p>
      </div>

      {/* Suggestion */}
      <div className={`text-xs text-center px-4 py-2 rounded ${
        zone === 'optimal' 
          ? 'bg-fuchsia-50 text-fuchsia-800' 
          : 'bg-gray-50 text-gray-700'
      }`}>
        {suggestion}
      </div>
    </div>
  )
}
