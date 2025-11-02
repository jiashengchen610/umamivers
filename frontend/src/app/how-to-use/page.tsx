'use client'

import { Navigation } from '@/components/Navigation'

export default function HowToUsePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">How to Use</h1>
          <p className="text-sm sm:text-lg text-gray-600">
            Build umami-rich compositions with science and TCM balance
          </p>
        </div>

        {/* Getting Started Section */}
        <section className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Getting Started</h2>
          
          <div className="bg-white border border-gray-200 p-4 sm:p-6 rounded-lg space-y-3 sm:space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-black text-white flex items-center justify-center text-xs sm:text-sm font-bold rounded flex-shrink-0">1</div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Search Ingredients</h4>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Find ingredients by name or filter by umami properties and TCM attributes.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-black text-white flex items-center justify-center text-xs sm:text-sm font-bold rounded flex-shrink-0">2</div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Build Composition</h4>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Add ingredients and adjust quantities. Watch real-time umami synergy calculations.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-black text-white flex items-center justify-center text-xs sm:text-sm font-bold rounded flex-shrink-0">3</div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Check Balance</h4>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Get flavor-balance suggestions based on umami levels (10-3300 mg/100g range).</p>
              </div>
            </div>
          </div>
        </section>

        {/* Umami Science Section */}
        <section className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Umami Science</h2>
          
          <div className="bg-white border border-gray-200 p-4 sm:p-6 rounded-lg mb-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">What is Umami?</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3">
              The fifth basic taste—savory, satisfying, and deeply flavorful. Triggered by glutamate (amino acids) and enhanced by nucleotides (IMP, GMP, AMP).
            </p>
            <p className="text-xs sm:text-sm text-gray-600">
              When combined, these create <strong>synergy</strong>—up to 8x umami enhancement. That's why mushrooms + tomatoes = magic.
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-4 sm:p-6 rounded-lg">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Umami Levels (mg/100g)</h3>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex items-start gap-2">
                <span className="text-gray-500 font-mono">< 10</span>
                <span className="text-gray-600">Sub-threshold – barely perceptible</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gray-900 font-mono">10-80</span>
                <span className="text-gray-600">Biological Range – natural perception</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gray-900 font-mono">80-300</span>
                <span className="text-gray-600">Culinary Optimal – balanced flavor zone</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-mono">300-500</span>
                <span className="text-gray-600">Strong – very rich, near upper limit</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-mono">500-2600</span>
                <span className="text-gray-600">Overlimit – exceeds normal range</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-black font-mono">2600+</span>
                <span className="text-gray-600">Theoretical Max – receptor saturation</span>
              </div>
            </div>
          </div>
        </section>

        {/* TCM Section */}
        <section className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">TCM Balance</h2>
          
          <div className="bg-white border border-gray-200 p-4 sm:p-6 rounded-lg mb-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">Food as Medicine</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              TCM views ingredients as having energetic properties that balance your body. Each food affects thermal energy, organ systems, and overall health.
            </p>
          </div>

          <div className="space-y-4">
            {/* Four Qi (Natures) */}
            <div className="bg-white border border-gray-200 p-4 sm:p-6 rounded-lg">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Four Natures (Thermal Properties)</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3">
                Cold/Cool → Warm/Hot spectrum affects body temperature and energy circulation.
              </p>
              <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                <div>• <strong>Cooling:</strong> Clear heat, reduce inflammation (cucumber, green tea)</div>
                <div>• <strong>Warming:</strong> Boost circulation, strengthen digestion (ginger, cinnamon)</div>
              </div>
            </div>

            {/* Five Flavors */}
            <div className="bg-white border border-gray-200 p-4 sm:p-6 rounded-lg">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Five Tastes (Organ Medicine)</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3">
                Each taste nourishes specific organ systems. Balance all five for optimal health.
              </p>
              <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                <div>• <strong>Sweet:</strong> Spleen/Stomach – Digestion, energy</div>
                <div>• <strong>Salty:</strong> Kidneys/Bladder – Water balance</div>
                <div>• <strong>Sour:</strong> Liver/Gallbladder – Detoxification</div>
                <div>• <strong>Bitter:</strong> Heart – Clear heat, calm mind</div>
                <div>• <strong>Pungent:</strong> Lungs – Circulation, immunity</div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center pt-6 sm:pt-8 border-t border-gray-200">
          <a href="/" className="text-sm sm:text-base text-black hover:text-gray-700 underline">
            Start Building →
          </a>
        </div>
      </main>
    </div>
  )
}
