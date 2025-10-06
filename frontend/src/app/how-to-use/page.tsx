'use client'

import { Navigation } from '@/components/Navigation'

export default function HowToUsePage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold text-gray-900 mb-4">How to Use Umamivers</h1>
          <p className="text-lg text-gray-600">
            Your comprehensive guide to understanding umami science and Traditional Chinese Medicine principles
          </p>
        </div>

        {/* Getting Started Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6">Getting Started</h2>
          
          <div className="paper-texture-light border border-gray-200 p-8 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">How to Build Your Umami Profile</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">1</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Search for Ingredients</h4>
                  <p className="text-gray-600">Use the search bar to find ingredients by name, or apply filters to discover ingredients by their umami properties, TCM characteristics, or dietary restrictions.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">2</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Add to Your Composition</h4>
                  <p className="text-gray-600">Click "Add to combo" on any ingredient card to add it to your composition. You can adjust quantities and units for precise measurements.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">3</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Analyze Your Blend</h4>
                  <p className="text-gray-600">Watch as your umami profile updates in real-time, showing the synergistic effects and TCM balance of your ingredient combination.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">4</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Export and Share</h4>
                  <p className="text-gray-600">Save your composition, share it with others, or export it as a PNG for your recipe collection.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Umami Science Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6">Understanding Umami Science</h2>
          
          <div className="paper-texture-light border border-gray-200 p-8 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">What is Umami?</h3>
            <p className="text-gray-600 mb-4">
              Umami, discovered by Japanese scientist Kikunae Ikeda in 1908, is the fifth basic taste alongside sweet, sour, salty, and bitter. 
              It's often described as savory, meaty, or brothy—the taste that makes foods deeply satisfying and moreish.
            </p>
            <p className="text-gray-600">
              Umami taste is primarily triggered by glutamate (an amino acid) and enhanced by nucleotides like IMP, GMP, and AMP. 
              When these compounds combine, they create a synergistic effect that can increase umami intensity up to 8 times.
            </p>
          </div>

          <div className="paper-texture-light border border-gray-200 p-8 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">How We Calculate Umami: The EUC Formula</h3>
            <p className="text-gray-600 mb-4">
              We use the scientifically validated <strong>Equivalent Umami Concentration (EUC)</strong> formula, 
              which provides accurate umami intensity measurements in g MSG/100g:
            </p>
            
            <div className="bg-gray-50 border border-gray-200 p-4 mb-4 font-mono text-sm">
              <strong>EUC = Σ(aᵢ·bᵢ) + 1218 × (Σ(aᵢ·bᵢ)) × (Σ(aⱼ·bⱼ))</strong>
            </div>
            
            <div className="space-y-3">
              <div>
                <strong className="text-gray-900">Where:</strong>
                <ul className="mt-2 space-y-1 text-gray-600">
                  <li>• <strong>aᵢ</strong> = Amino acid concentrations (Glutamate, Aspartate) in g/100g</li>
                  <li>• <strong>aⱼ</strong> = Nucleotide concentrations (IMP, GMP, AMP) in g/100g</li>
                  <li>• <strong>bᵢ</strong> = Relative umami weights for amino acids (Glu = 1.0, Asp = 0.077)</li>
                  <li>• <strong>bⱼ</strong> = Relative umami weights for nucleotides (IMP = 1.0, GMP = 2.3, AMP = 0.18)</li>
                  <li>• <strong>1218</strong> = Synergistic constant based on concentration</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">Key Insight: Synergy</h4>
              <p className="text-orange-700 text-sm">
                The magic happens when amino acids and nucleotides work together. A small amount of nucleotides 
                can dramatically amplify the umami effect of amino acids—this is why ingredients like mushrooms 
                (high in nucleotides) pair so well with tomatoes or aged cheeses (high in glutamate).
              </p>
            </div>
          </div>

          <div className="paper-texture-light border border-gray-200 p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">The Three Components</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 border border-orange-200 flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-orange-500"></div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Amino Acids</h4>
                <p className="text-sm text-gray-600">
                  <strong>Glutamate</strong> and <strong>Aspartate</strong> provide the base umami taste. 
                  Found abundantly in aged cheeses, tomatoes, soy sauce, and fish sauce.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 border border-yellow-200 flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-yellow-500"></div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Nucleotides</h4>
                <p className="text-sm text-gray-600">
                  <strong>IMP, GMP, AMP</strong> amplify umami when combined with amino acids. 
                  Concentrated in mushrooms, seafood, and aged meats.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 border border-purple-200 flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-purple-500"></div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Synergy</h4>
                <p className="text-sm text-gray-600">
                  The <strong>exponential enhancement</strong> when amino acids and nucleotides combine, 
                  creating rich, complex flavors greater than the sum of their parts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TCM Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6">Traditional Chinese Medicine (TCM)</h2>
          
          <div className="paper-texture-light border border-gray-200 p-8 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">What is TCM?</h3>
            <p className="text-gray-600 mb-4">
              Traditional Chinese Medicine is an ancient medical system that views food as medicine. 
              In TCM, every ingredient has energetic properties that affect the body's balance and health. 
              Rather than just focusing on nutrients, TCM considers how foods influence your body's energy (Qi), 
              temperature regulation, and organ systems.
            </p>
            <p className="text-gray-600">
              TCM food theory helps create harmonious, balanced meals that not only taste good but also 
              support your body's natural healing processes and maintain optimal health.
            </p>
          </div>

          <div className="space-y-8">
            {/* Four Qi (Natures) */}
            <div className="paper-texture-light border border-gray-200 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Four Natures - Thermal Properties</h3>
              <p className="text-gray-600 mb-4">
                The Four Natures describe how foods affect your body's internal temperature and energy circulation:
              </p>
              
              <div className="grid md:grid-cols-5 gap-4 mb-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-400 mx-auto mb-2"></div>
                  <h4 className="font-semibold text-blue-800 text-sm">Cold</h4>
                  <p className="text-xs text-gray-600">Strongly cooling</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-300 mx-auto mb-2"></div>
                  <h4 className="font-semibold text-blue-700 text-sm">Cool</h4>
                  <p className="text-xs text-gray-600">Mildly cooling</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-300 mx-auto mb-2"></div>
                  <h4 className="font-semibold text-gray-700 text-sm">Neutral</h4>
                  <p className="text-xs text-gray-600">Balanced</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-300 mx-auto mb-2"></div>
                  <h4 className="font-semibold text-orange-700 text-sm">Warm</h4>
                  <p className="text-xs text-gray-600">Mildly warming</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-400 mx-auto mb-2"></div>
                  <h4 className="font-semibold text-red-800 text-sm">Hot</h4>
                  <p className="text-xs text-gray-600">Strongly warming</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Cooling Foods (Cold/Cool)</h4>
                  <p className="text-gray-600">Clear heat, reduce inflammation, calm the mind. Good for hot conditions, fever, hypertension. Examples: cucumber, watermelon, green tea, mint.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Warming Foods (Warm/Hot)</h4>
                  <p className="text-gray-600">Boost circulation, strengthen digestion, warm the body. Good for cold conditions, poor circulation, weak digestion. Examples: ginger, cinnamon, lamb, chili.</p>
                </div>
              </div>
            </div>

            {/* Five Flavors */}
            <div className="paper-texture-light border border-gray-200 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Five Tastes - Organ-Flavor Medicine</h3>
              <p className="text-gray-600 mb-4">
                Each taste corresponds to and nourishes specific organ systems in the body:
              </p>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-5 gap-4 mb-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-300 mx-auto mb-2"></div>
                    <h4 className="font-semibold text-green-700 text-sm">Bitter</h4>
                    <p className="text-xs text-gray-600">Heart/Small Intestine</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-300 mx-auto mb-2"></div>
                    <h4 className="font-semibold text-yellow-700 text-sm">Sour</h4>
                    <p className="text-xs text-gray-600">Liver/Gallbladder</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-pink-300 mx-auto mb-2"></div>
                    <h4 className="font-semibold text-pink-700 text-sm">Sweet</h4>
                    <p className="text-xs text-gray-600">Spleen/Stomach</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-red-300 mx-auto mb-2"></div>
                    <h4 className="font-semibold text-red-700 text-sm">Spicy</h4>
                    <p className="text-xs text-gray-600">Lungs/Large Intestine</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-400 mx-auto mb-2"></div>
                    <h4 className="font-semibold text-gray-700 text-sm">Salty</h4>
                    <p className="text-xs text-gray-600">Kidneys/Bladder</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Functions of Each Taste:</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li><strong>Bitter:</strong> Clears heat, dries dampness, calms the heart</li>
                      <li><strong>Sour:</strong> Astringes, prevents loss of fluids, supports liver detox</li>
                      <li><strong>Sweet:</strong> Tonifies, harmonizes, strengthens digestion</li>
                      <li><strong>Spicy:</strong> Disperses, promotes circulation, opens the lungs</li>
                      <li><strong>Salty:</strong> Softens, moistens, strengthens the kidneys</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Balancing Your Plate:</h4>
                    <p className="text-gray-600">
                      A well-balanced TCM meal includes multiple tastes to nourish all organ systems. 
                      Too much of one taste can create imbalance, while missing tastes can lead to deficiencies. 
                      The goal is harmonious diversity.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Meridians */}
            <div className="paper-texture-light border border-gray-200 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Meridian Tropism - Energy Pathways</h3>
              <p className="text-gray-600 mb-4">
                Meridian Tropism describes the specific energy pathways through which foods deliver their therapeutic effects. 
                Each ingredient has an affinity for particular organ systems and their associated meridian channels.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Understanding Meridians</h4>
                  <p className="text-gray-600 mb-3">
                    In TCM, meridians are energetic pathways that connect organs and distribute Qi (life energy) throughout the body. 
                    When you eat foods with specific meridian affinities, you're directing therapeutic effects to those organ systems.
                  </p>
                  <p className="text-gray-600">
                    For example, foods that enter the Lung meridian help with respiratory function, skin health, and immune system, 
                    while foods entering the Kidney meridian support reproductive health, bone strength, and water metabolism.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Common Meridian Systems</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li><strong>Heart:</strong> Circulation, mental clarity, emotional balance</li>
                    <li><strong>Liver:</strong> Detoxification, emotional flow, eye health</li>
                    <li><strong>Spleen:</strong> Digestion, energy production, muscle strength</li>
                    <li><strong>Lung:</strong> Respiratory function, immunity, skin health</li>
                    <li><strong>Kidney:</strong> Reproduction, bones, water balance, aging</li>
                    <li><strong>Stomach:</strong> Food processing, nutrient absorption</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Practical Application Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6">Putting It All Together</h2>
          
          <div className="paper-texture-light border border-gray-200 p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Creating Balanced, Delicious Combinations</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">For Maximum Umami</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Combine high-glutamate ingredients (aged cheese, tomatoes) with high-nucleotide ingredients (mushrooms, seafood)</li>
                  <li>• Look for ingredients with complementary umami profiles</li>
                  <li>• Use the synergy score to guide your combinations</li>
                  <li>• Remember: a little nucleotide goes a long way!</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">For TCM Balance</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Include multiple tastes to nourish different organ systems</li>
                  <li>• Balance thermal properties based on your constitution and the season</li>
                  <li>• Consider meridian affinities for targeted therapeutic effects</li>
                  <li>• Adjust ratios based on your individual health needs</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Pro Tip</h4>
              <p className="text-blue-700 text-sm">
                Use the filters to explore ingredients by their properties. Try searching for "high umami" ingredients, 
                then filter by TCM properties to find ingredients that match your health goals. 
                The best combinations are both scientifically optimized for umami and TCM-balanced for health.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Ready to start building your perfect umami composition? 
            <a href="/" className="text-blue-600 hover:text-blue-700 ml-1">Return to the main application</a>
          </p>
        </div>
      </main>
    </div>
  )
}
