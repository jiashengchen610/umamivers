**Umami Builder**

A scientific tool that blends modern food chemistry with Traditional Chinese Medicine (TCM) principles.

Umami Builder helps you design balanced ingredient combinations by analyzing umami synergy and energetic balance.
Built using Warp, Cursor, and Codex, this project applies scientific data and traditional wisdom to make flavor design measurable and intuitive.
The ingredient data originates from the [Umami Information Center](https://www.umamiinfo.com/umamidb/).

⸻

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
