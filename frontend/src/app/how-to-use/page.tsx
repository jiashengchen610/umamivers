'use client'

import { Navigation } from '@/components/Navigation'
import { LevelBars } from '@/components/LevelBars'
import { BalanceSlider } from '@/components/BalanceSlider'

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
              When combined, these create <strong>synergy</strong>—up to 1218× umami enhancement. That&apos;s why mushrooms + tomatoes = magic.
            </p>
          </div>
          
          <div id="level-system" className="bg-white border border-gray-200 p-4 sm:p-6 rounded-lg mb-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">6-Level Classification System</h3>
            <p className="text-sm text-gray-700 mb-6">
              We use a 0–6 level system to classify umami intensity based on scientific ranges.
            </p>
            
            {/* Sample Visual Chart */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Example: Tomato (Level 3)</h4>
              <LevelBars 
                aa={60}
                nuc={25}
                synergy={650}
                size="large"
                showValues={true}
              />
            </div>
            
            {/* Mobile-optimized tables */}
            <div className="space-y-6">
              {/* AA */}
              <div>
                <div className="bg-green-50 border-l-4 border-green-600 p-3 rounded mb-3">
                  <h4 className="font-bold text-gray-900 text-sm">Amino Acids (AA)</h4>
                  <p className="text-xs text-gray-600 mt-1">Green gradient • mg/100g</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-2 font-semibold text-gray-700">Level</th>
                        <th className="text-left py-2 px-2 font-semibold text-gray-700">Range</th>
                        <th className="text-left py-2 px-2 font-semibold text-gray-700">Intensity</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs sm:text-sm">
                      <tr className="border-b border-gray-100"><td className="py-2 px-2 text-gray-500">0</td><td className="py-2 px-2">0</td><td className="py-2 px-2 text-gray-600">No umami</td></tr>
                      <tr className="border-b border-gray-100 bg-gray-50"><td className="py-2 px-2 text-gray-500">1</td><td className="py-2 px-2">≤ 10</td><td className="py-2 px-2 text-gray-600">Very Low</td></tr>
                      <tr className="border-b border-gray-100"><td className="py-2 px-2 font-medium">2</td><td className="py-2 px-2">10–30</td><td className="py-2 px-2 text-gray-600">Low</td></tr>
                      <tr className="border-b border-gray-100 bg-green-50"><td className="py-2 px-2 font-medium">3</td><td className="py-2 px-2 font-medium">30–80</td><td className="py-2 px-2 font-medium text-green-700">Moderate</td></tr>
                      <tr className="border-b border-gray-100"><td className="py-2 px-2 font-medium">4</td><td className="py-2 px-2">80–150</td><td className="py-2 px-2 text-gray-600">High</td></tr>
                      <tr className="border-b border-gray-100 bg-gray-50"><td className="py-2 px-2 font-medium">5</td><td className="py-2 px-2">150–300</td><td className="py-2 px-2 text-gray-600">Very High</td></tr>
                      <tr><td className="py-2 px-2 font-medium">6</td><td className="py-2 px-2">&gt; 300</td><td className="py-2 px-2 text-gray-600">Exceptional</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Nuc */}
              <div>
                <div className="bg-amber-50 border-l-4 border-amber-700 p-3 rounded mb-3">
                  <h4 className="font-bold text-gray-900 text-sm">Nucleotides (Nuc)</h4>
                  <p className="text-xs text-gray-600 mt-1">Beige to brown gradient • mg/100g</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-2 font-semibold text-gray-700">Level</th>
                        <th className="text-left py-2 px-2 font-semibold text-gray-700">Range</th>
                        <th className="text-left py-2 px-2 font-semibold text-gray-700">Intensity</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs sm:text-sm">
                      <tr className="border-b border-gray-100"><td className="py-2 px-2 text-gray-500">0</td><td className="py-2 px-2">0</td><td className="py-2 px-2 text-gray-600">No umami</td></tr>
                      <tr className="border-b border-gray-100 bg-gray-50"><td className="py-2 px-2 text-gray-500">1</td><td className="py-2 px-2">≤ 5</td><td className="py-2 px-2 text-gray-600">Very Low</td></tr>
                      <tr className="border-b border-gray-100"><td className="py-2 px-2 font-medium">2</td><td className="py-2 px-2">5–15</td><td className="py-2 px-2 text-gray-600">Low</td></tr>
                      <tr className="border-b border-gray-100 bg-amber-50"><td className="py-2 px-2 font-medium">3</td><td className="py-2 px-2 font-medium">15–40</td><td className="py-2 px-2 font-medium text-amber-800">Moderate</td></tr>
                      <tr className="border-b border-gray-100"><td className="py-2 px-2 font-medium">4</td><td className="py-2 px-2">40–80</td><td className="py-2 px-2 text-gray-600">High</td></tr>
                      <tr className="border-b border-gray-100 bg-gray-50"><td className="py-2 px-2 font-medium">5</td><td className="py-2 px-2">80–150</td><td className="py-2 px-2 text-gray-600">Very High</td></tr>
                      <tr><td className="py-2 px-2 font-medium">6</td><td className="py-2 px-2">&gt; 150</td><td className="py-2 px-2 text-gray-600">Exceptional</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Synergy */}
              <div>
                <div className="bg-purple-50 border-l-4 border-purple-600 p-3 rounded mb-3">
                  <h4 className="font-bold text-gray-900 text-sm">Synergy (Total EUC)</h4>
                  <p className="text-xs text-gray-600 mt-1">Lavender to purple gradient • mg/100g</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-2 font-semibold text-gray-700">Level</th>
                        <th className="text-left py-2 px-2 font-semibold text-gray-700">Range</th>
                        <th className="text-left py-2 px-2 font-semibold text-gray-700">Intensity</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs sm:text-sm">
                      <tr className="border-b border-gray-100"><td className="py-2 px-2 text-gray-500">0</td><td className="py-2 px-2">0</td><td className="py-2 px-2 text-gray-600">No umami</td></tr>
                      <tr className="border-b border-gray-100 bg-gray-50"><td className="py-2 px-2 text-gray-500">1</td><td className="py-2 px-2">≤ 100</td><td className="py-2 px-2 text-gray-600">Very Low</td></tr>
                      <tr className="border-b border-gray-100"><td className="py-2 px-2 font-medium">2</td><td className="py-2 px-2">100–400</td><td className="py-2 px-2 text-gray-600">Low</td></tr>
                      <tr className="border-b border-gray-100 bg-purple-50"><td className="py-2 px-2 font-medium">3</td><td className="py-2 px-2 font-medium">400–1000</td><td className="py-2 px-2 font-medium text-purple-700">Moderate</td></tr>
                      <tr className="border-b border-gray-100"><td className="py-2 px-2 font-medium">4</td><td className="py-2 px-2">1000–3000</td><td className="py-2 px-2 text-gray-600">High</td></tr>
                      <tr className="border-b border-gray-100 bg-gray-50"><td className="py-2 px-2 font-medium">5</td><td className="py-2 px-2">3000–8000</td><td className="py-2 px-2 text-gray-600">Very High</td></tr>
                      <tr><td className="py-2 px-2 font-medium">6</td><td className="py-2 px-2">&gt; 8000</td><td className="py-2 px-2 text-gray-600">Exceptional</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          
          <div id="balance-calculation" className="bg-white border border-gray-200 p-4 sm:p-6 rounded-lg mb-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Balance Calculation</h3>
            <p className="text-sm text-gray-700 mb-4">
              The AA:Nuc balance shows the ratio between amino acids and nucleotides in your composition.
            </p>
            
            {/* Sample Balance Chart */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Example: 70% AA : 30% Nuc</h4>
              <BalanceSlider 
                aa={70}
                nuc={30}
              />
            </div>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
              <h4 className="text-sm font-bold text-gray-900 mb-2">Formula</h4>
              <code className="text-xs sm:text-sm font-mono text-gray-800 block">
                AA% = (AA_total / (AA_total + Nuc_total)) × 100<br />
                Nuc% = 100 - AA%
              </code>
            </div>
            
            <p className="text-sm text-gray-700">
              <strong className="text-gray-900">Peak synergy occurs at a 50:50 balance</strong>, maximizing the 1218× multiplier effect. The gradient visualization darkens toward the center (50%) to show the optimal balance point.
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-4 sm:p-6 rounded-lg">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Umami Levels (mg/100g)</h3>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex items-start gap-2">
                <span className="text-gray-500 font-mono">&lt; 10</span>
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
                <span className="text-red-600 font-mono">2600+</span>
                <span className="text-gray-600">Theoretical Max – deep umami saturation</span>
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
