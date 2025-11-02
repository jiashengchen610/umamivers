# 🍲 Umamivers

**A scientific umami composition tool that bridges modern food science with Traditional Chinese Medicine**

Umamivers helps you create perfectly balanced, delicious food combinations by analyzing umami synergy and TCM properties. Using peer-reviewed scientific formulas and ancient wisdom, build compositions that are both flavorful and health-conscious.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Python](https://img.shields.io/badge/python-3.12-blue.svg)
![Next.js](https://img.shields.io/badge/next.js-14-black.svg)

## 🌟 Features

### 🧪 Scientific Umami Calculations
- **Equivalent Umami Concentration (EUC) Formula**: Peer-reviewed scientific accuracy
- **Synergy Analysis**: Real-time calculation of amino acid and nucleotide interactions
- **8x Amplification Modeling**: Proper modeling of umami compound synergistic effects

### 🍃 Traditional Chinese Medicine Integration
- **Four Qi (四氣)**: Thermal property analysis (Cold, Cool, Neutral, Warm, Hot)
- **Five Tastes (五味)**: Taste-organ correspondence system
- **Meridian Tropism (歸經)**: Energy pathway targeting for therapeutic effects
- **TCM Balance Scoring**: Harmonious composition recommendations

### 💻 Modern Web Interface
- **Real-time Composition Builder**: Interactive ingredient mixing with instant feedback
- **Advanced Filtering**: Search by umami properties, TCM characteristics, dietary restrictions
- **Mobile-Optimized**: Responsive design with paper texture aesthetic
- **Export Functionality**: PNG charts, JSON data, shareable URLs

### 📊 Visual Analytics
- **Interactive Charts**: Umami profile visualization with synergy indicators
- **TCM Bar Charts**: Visual representation of thermal and taste properties
- **Comparison Tools**: Side-by-side ingredient analysis
- **Progress Tracking**: Real-time composition balance monitoring

## 🏗️ Architecture

### Backend (Django + PostgreSQL)
```
backend/
├── umami_api/           # Django REST API
│   ├── models.py       # Ingredient, Chemistry, TCM data models
│   ├── views.py        # API endpoints with EUC calculations
│   ├── serializers.py  # Data serialization
│   └── urls.py         # API routing
├── requirements.txt     # Python dependencies
└── manage.py           # Django management
```

### Frontend (Next.js + TypeScript)
```
frontend/
├── src/
│   ├── app/             # Next.js 14 app router
│   ├── components/      # React components
│   ├── lib/            # API utilities and helpers
│   └── types/          # TypeScript type definitions
├── public/             # Static assets
└── package.json        # Node.js dependencies
```

### Database Schema
- **Ingredients**: Base ingredient data with aliases and categories
- **Chemistry**: Umami compounds (Glu, Asp, IMP, GMP, AMP) with EUC calculations
- **TCM**: Traditional medicine properties (Qi, tastes, meridians)
- **Flags**: Dietary restrictions, allergens, usage tags

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL 13+

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Database setup
createdb umamivers
python manage.py migrate
python process_excel_django.py  # Load ingredient data

# Start server
python manage.py runserver 127.0.0.1:8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to start building compositions!

## 🧮 The EUC Formula

Umamivers uses the scientifically validated **Equivalent Umami Concentration** formula:

```
EUC = Σ(aᵢ·bᵢ) + 1218 × (Σ(aᵢ·bᵢ)) × (Σ(aⱼ·bⱼ))
```

**Where:**
- `aᵢ` = Amino acid concentrations (Glutamate, Aspartate) in g/100g
- `aⱼ` = Nucleotide concentrations (IMP, GMP, AMP) in g/100g  
- `bᵢ` = Relative umami weights (Glu=1.0, Asp=0.077)
- `bⱼ` = Relative umami weights (IMP=1.0, GMP=2.3, AMP=0.18)
- `1218` = Synergistic constant based on concentration

This formula accurately models the exponential umami enhancement when amino acids and nucleotides combine, providing precise measurements in g MSG/100g equivalent.

## 🍃 TCM Theory Integration

### Four Natures (四氣)
- **Cold/Cool**: Clear heat, reduce inflammation
- **Neutral**: Balanced, harmonizing
- **Warm/Hot**: Boost circulation, strengthen yang

### Five Tastes (五味)
- **Bitter** → Heart/Small Intestine
- **Sour** → Liver/Gallbladder  
- **Sweet** → Spleen/Stomach
- **Spicy** → Lungs/Large Intestine
- **Salty** → Kidneys/Bladder

### Meridian Tropism (歸經)
Target specific organ systems through energetic pathways for therapeutic cooking.

## 📱 Usage Examples

### Building a Perfect Umami Broth
1. **High Glutamate Base**: Aged Parmesan, soy sauce, fish sauce
2. **Nucleotide Amplifiers**: Shiitake mushrooms, bonito flakes, anchovies  
3. **TCM Balance**: Add warming ginger for circulation, cooling seaweed for balance
4. **Result**: Exponential umami enhancement with therapeutic benefits

### Balanced TCM Meal Planning
1. **Search by Season**: Filter cooling foods for summer, warming for winter
2. **Organ Support**: Target specific meridians based on health goals
3. **Taste Harmony**: Include multiple tastes for comprehensive nourishment
4. **Export Recipe**: Save balanced compositions for meal planning

## 🎨 Design Philosophy

- **Flat Design**: Clean, minimalist interface focusing on functionality
- **Paper Texture**: Subtle textures evoke traditional recipe notebooks  
- **Noto Sans Typography**: Thin, scientific aesthetic with excellent readability
- **Color Restriction**: Colors reserved only for charts and data visualization
- **Circular Icons**: Icon-only buttons use circular design for intuitive interaction

## 📊 Data Sources

- **Umami Compounds**: Peer-reviewed food science databases
- **TCM Properties**: Traditional Chinese Medicine texts and modern interpretations
- **Ingredient Database**: Comprehensive coverage of global ingredients
- **Scientific References**: EUC formula based on Yang et al. (2022) research

## 🛠️ Development

### Tech Stack
- **Backend**: Django 5.2, Django REST Framework, PostgreSQL
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Database**: PostgreSQL with JSON fields for flexible TCM data
- **Deployment**: Optimized for cloud platforms (Vercel, Railway, etc.)

### Key Components
- **EUC Calculator**: Scientific umami intensity calculations
- **TCM Analyzer**: Traditional medicine property evaluation  
- **Composition Builder**: Real-time ingredient mixing interface
- **Export System**: Multiple format support (PNG, JSON, URL sharing)

### API Endpoints
```
GET  /api/ingredients/           # Search and filter ingredients
POST /api/ingredients/compose/   # Calculate composition preview
GET  /api/ingredients/{id}/      # Individual ingredient details
```

## 📈 Roadmap

- [ ] **Recipe Integration**: Full recipe creation with cooking instructions
- [ ] **Seasonal Recommendations**: Ingredient suggestions based on TCM seasonal theory
- [ ] **User Profiles**: Personal health constitution analysis
- [ ] **Advanced Analytics**: Historical composition tracking and optimization
- [ ] **Community Features**: Share and discover compositions
- [ ] **Mobile App**: Native iOS/Android applications
- [ ] **API Extensions**: Third-party integrations for recipe platforms

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Yang et al. (2022)**: EUC formula research and validation
- **Traditional Chinese Medicine**: Millennia of food-as-medicine wisdom
- **Food Science Community**: Umami research and compound databases
- **Open Source Community**: Frameworks and tools that make this possible

## 📧 Contact

- **Author**: Chen Jiashe
- **Email**: jiashengchen610@gmail.com
- **Project**: [https://github.com/jiashengchen610/umamivers](https://github.com/jiashengchen610/umamivers)

---

*Bridging ancient wisdom with modern science, one perfectly balanced bite at a time.* 🍲✨# Build trigger - Mon Nov  3 00:03:18 CST 2025
