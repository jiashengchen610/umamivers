**Umami Builder**

A scientific tool that blends modern food chemistry with Traditional Chinese Medicine (TCM) principles.

Umami Builder helps you design balanced ingredient combinations by analyzing umami synergy and energetic balance.
Built using Warp, Cursor, and Codex, this project applies scientific data and traditional wisdom to make flavor design measurable and intuitive.
The ingredient data originates from the [Umami Information Center](https://www.umamiinfo.com/umamidb/).

⸻

**How to Use**
	1.	Search Ingredients
Find ingredients by name or filter by umami properties and TCM attributes.
	2.	Build Composition
Add ingredients and adjust quantities. Watch real-time umami synergy calculations update as you mix.
	3.	Check Balance
View umami intensity levels (0–6 scale) and see flavor-balance suggestions based on amino acid to nucleotide ratios.
Peak synergy occurs at a 50:50 balance, where the 1218× multiplier effect reaches its maximum.

⸻

**Umami Level System (0–6 Scale)**

The system classifies umami intensity based on the total concentration of amino acids and nucleotides (mg/100g):

| Level | Range (mg/100g) | Description  |
|-------|-----------------|---------------|
| 0     | 0               | No umami      |
| 1     | ≤ 10            | Very Low      |
| 2     | 10–30           | Low           |
| 3     | 30–80           | Moderate      |
| 4     | 80–150          | High          |
| 5     | 150–300         | Very High     |
| 6     | > 300           | Exceptional   |

Each ingredient and composition is visualized on this 6-level scale, showing amino acids (green), nucleotides (beige), and synergy (purple) for clear comparison.


**Overview**
	•	Data-driven Umami Analysis: Calculates Equivalent Umami Concentration (EUC) using amino acid and nucleotide data.
	•	Real-time Synergy Visualization: Displays how ingredients amplify each other’s savory depth.
	•	TCM Integration: Each ingredient includes thermal nature and five-flavor classification for balanced food design.
	•	Interactive Interface: Search, filter, and build compositions with instant feedback.

⸻

**Core Formula (EUC)**

The model follows the scientific equation:

*EUC = Σ(aᵢ·bᵢ) + 1218 × Σ(aᵢ·bᵢ) × Σ(aⱼ·bⱼ)*

Where:
	•	aᵢ = Amino acid concentration (Glu, Asp)
	•	aⱼ = Nucleotide concentration (IMP, GMP, AMP)
	•	bᵢ, bⱼ = Relative umami weights
	•	1218 = Synergistic constant

⸻

**Tech Stack**
	•	Frontend: Next.js, TypeScript, Tailwind CSS
	•	Backend: Django REST Framework, PostgreSQL
	•	Development Tools: Warp, Cursor, Codex

⸻

**Data Source**

Ingredient data [Umami Information Center](https://www.umamiinfo.com/umamidb/).
