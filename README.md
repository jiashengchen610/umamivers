## Umami Builder ##

A scientific tool that blends modern food chemistry with Traditional Chinese Medicine (TCM) principles.

Umami Builder helps you design balanced ingredient combinations by analyzing umami synergy and energetic balance.
This project applies scientific data and traditional wisdom to make flavor design measurable and intuitive.
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

The system classifies umami intensity based on the total concentration of amino acids (AA), nucleotides (Nuc), and their combined synergy (EUC, mg/100g).

**Amino Acids (AA)**

| Level | Range (mg/100g) | Description  |
|-------|-----------------|---------------|
| 0     | 0               | No umami      |
| 1     | ≤ 10            | Very Low      |
| 2     | 10–30           | Low           |
| 3     | 30–80           | Moderate      |
| 4     | 80–150          | High          |
| 5     | 150–300         | Very High     |
| 6     | > 300           | Exceptional   |

---

**Nucleotides (Nuc)**

| Level | Range (mg/100g) | Description  |
|-------|-----------------|---------------|
| 0     | 0               | No umami      |
| 1     | ≤ 5             | Very Low      |
| 2     | 5–15            | Low           |
| 3     | 15–40           | Moderate      |
| 4     | 40–80           | High          |
| 5     | 80–150          | Very High     |
| 6     | > 150           | Exceptional   |

---

**Synergy (EUC)**

| Level | Range (mg/100g) | Description  |
|-------|-----------------|---------------|
| 0     | 0               | No umami      |
| 1     | ≤ 100           | Very Low      |
| 2     | 100–400         | Low           |
| 3     | 400–1000        | Moderate      |
| 4     | 1000–3000       | High          |
| 5     | 3000–8000       | Very High     |
| 6     | > 8000          | Exceptional   |

Each ingredient and composition is visualized on this 6-level scale, showing **AA (green)**, **Nuc (beige)**, and **Synergy (purple)** for clear comparison.

---

**Weighting of Amino Acids and Nucleotides**

To calculate the *Equivalent Umami Concentration (EUC)*, amino acids and nucleotides are weighted according to their relative taste intensity.  
These weights represent how strongly each compound contributes to perceived umami taste.

| Compound        | Type         | Symbol | Relative Weight (b) |
|-----------------|--------------|---------|----------------------|
| Glutamic acid   | Amino acid   | Glu     | 1.0                  |
| Aspartic acid   | Amino acid   | Asp     | 0.077                |
| IMP (Inosinate) | Nucleotide   | IMP     | 1.0                  |
| GMP (Guanylate) | Nucleotide   | GMP     | 2.3                  |
| AMP (Adenylate) | Nucleotide   | AMP     | 0.18                 |

The weighted concentrations are then summed and combined using the synergy constant **1218**, modeling the exponential flavor enhancement when amino acids and nucleotides are present together.

**Formula:**

```
EUC = Σ(aᵢ·bᵢ) + 1218 × Σ(aᵢ·bᵢ) × Σ(aⱼ·bⱼ)
```

Where:  
- `aᵢ` = Amino acid concentration (Glu, Asp)  
- `aⱼ` = Nucleotide concentration (IMP, GMP, AMP)  
- `bᵢ`, `bⱼ` = Relative umami weights above  

Peak synergy typically occurs at a **50:50 ratio of AA:Nuc**, which maximizes the perceived umami intensity up to the theoretical upper limit.

---

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
