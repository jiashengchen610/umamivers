# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Umamivers is a scientific umami composition tool that bridges modern food science with Traditional Chinese Medicine. It consists of a Django REST backend with PostgreSQL and a Next.js 14 frontend with TypeScript.

**Core Science**: Uses the Equivalent Umami Concentration (EUC) formula to calculate synergistic umami enhancement when amino acids (Glutamate, Aspartate) combine with nucleotides (IMP, GMP, AMP). The formula includes a 1218 synergistic constant that models exponential enhancement.

## Development Commands

### Initial Setup
```bash
# Complete setup (run once)
./setup-local.sh

# Prerequisites check
# - PostgreSQL must be installed and running
# - Python 3.12+ and Node.js 18+ required
# - Creates database 'umami_db' with user 'umami_user'
```

### Running Development Servers

```bash
# Start both servers (recommended)
./start-dev.sh

# Or start individually:
./start-backend.sh   # Django on http://localhost:8000
./start-frontend.sh  # Next.js on http://localhost:3000

# Alternative using npm script (from root):
npm run dev
```

### Backend Commands

```bash
cd backend
source venv/bin/activate

# Run Django development server
python manage.py runserver 127.0.0.1:8000

# Database operations
python manage.py migrate
python manage.py makemigrations
python manage.py createsuperuser

# Load ingredient data from Excel
python process_excel_django.py  # Requires umami_warp_ready.xlsx in backend/

# Django shell for debugging
python manage.py shell

# Check database connection
python manage.py check --database default
```

### Frontend Commands

```bash
cd frontend

# Development server
npm run dev

# Production build
npm run build
npm start

# Linting
npm run lint
```

### Database Management

```bash
# Access PostgreSQL
psql -U umami_user -d umami_db

# Reset database (if needed)
dropdb umami_db
createdb umami_db
psql -d umami_db -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
psql -d umami_db -c "CREATE EXTENSION IF NOT EXISTS unaccent;"
cd backend && source venv/bin/activate && python manage.py migrate
```

## Architecture

### Backend Structure

```
backend/
├── umami_api/              # Main Django app
│   ├── models.py          # Core models: Ingredient, Chemistry, TCM, Flags, Alias
│   ├── views.py           # IngredientViewSet with EUC calculations
│   ├── serializers.py     # DRF serializers
│   └── urls.py            # API routing
├── umami_project/         # Django project settings
├── process_excel_django.py # Data import script
└── requirements.txt
```

**Key Models**:
- `Ingredient`: Base ingredient with name, category, cooking info
- `Chemistry`: Umami compounds (glu, asp, imp, gmp, amp) and calculated EUC values
- `TCM`: Traditional Chinese Medicine properties (four_qi, five_flavors, meridians)
- `Flags`: Allergens, dietary restrictions, usage tags (JSON fields)
- `Alias`: Multi-language names for ingredients

### Frontend Structure

```
frontend/src/
├── app/                   # Next.js 14 app router
│   ├── page.tsx          # Home page with hero search
│   ├── composition/      # Composition builder
│   └── how-to-use/       # Documentation pages
├── components/
│   ├── Charts.tsx        # Recharts visualizations for umami data
│   ├── CompositionWorkbench.tsx  # Real-time composition builder
│   ├── IngredientCard.tsx        # Search result display
│   ├── SearchAndFilter.tsx       # Advanced filtering UI
│   └── IngredientDetailModal.tsx # Full ingredient details
├── lib/
│   └── api.ts            # API client functions, state encoding
└── types/
    └── index.ts          # TypeScript type definitions
```

### API Endpoints

```
GET  /api/ingredients/              # Search with filters, pagination
GET  /api/ingredients/{id}/         # Single ingredient details
POST /api/ingredients/compose_preview/  # Calculate composition EUC
```

**Query Parameters for Search**:
- `q`: fuzzy search (uses PostgreSQL trigram similarity)
- `sort`: synergy|aa|nuc|alpha|relevance|tcm
- Array filters: `umami[]`, `flavor[]`, `qi[]`, `flavors[]`, `meridians[]`, `allergens_include[]`, `allergens_exclude[]`, `dietary[]`, `category[]`
- Range filters: `aa_min`, `aa_max`, `nuc_min`, `nuc_max`, `syn_min`, `syn_max`

### EUC Calculation Logic

The core formula is implemented in both `backend/umami_api/views.py` (compose_preview) and `process_excel_django.py`:

```python
# Apply relative umami weights
weighted_aa = (glu * 1.0) + (asp * 0.077)  # Glu=1, Asp=0.077
weighted_nuc = (imp * 1.0) + (gmp * 2.3) + (amp * 0.18)  # IMP=1, GMP=2.3, AMP=0.18

# Calculate EUC (Equivalent Umami Concentration) in g MSG/100g
euc_base = weighted_aa
euc_synergy = 1218 * weighted_aa * weighted_nuc
total_euc = euc_base + euc_synergy
```

All chemistry values are stored per 100g. When composing, quantities are converted to grams using `convert_to_grams()` utility.

## Important Code Patterns

### Database Access
- Use `select_related('chemistry', 'tcm', 'flags')` and `prefetch_related('aliases')` to optimize queries
- PostgreSQL ArrayFields used for TCM properties (four_qi, five_flavors, meridians)
- JSON fields used for Flags to allow flexible tagging

### Search Implementation
- Fuzzy search uses PostgreSQL's `pg_trgm` extension for trigram similarity
- Searches across ingredient base_name, display_name, and aliases
- Raw SQL query in `_apply_fuzzy_search()` with similarity threshold of 0.1

### Frontend State Management
- Composition state encoded in URL using base64 encoding (`encodeState`/`decodeState` in api.ts)
- LocalStorage used for persistent state: `saveToLocalStorage`/`loadFromLocalStorage`
- Debounced search with 300ms delay to reduce API calls

### Unit Conversions
Supported units in `convert_to_grams()`:
- g (grams): 1.0
- oz (ounces): 28.35
- tsp (teaspoon): 5.0 (assumes water density)
- tbsp (tablespoon): 15.0
- cup: 240.0

## Data Import Process

1. Place `umami_warp_ready.xlsx` in `backend/` directory
2. Excel must have columns: Description, Category, Food group, Glu, Asp, IMP, GMP, AMP
3. Run: `cd backend && source venv/bin/activate && python process_excel_django.py`
4. Script extracts aliases (including Chinese characters), calculates EUC values, and maps TCM properties based on food categories

TCM properties are mapped by food category with default confidence of 1.0. Customize mappings in `process_excel_django.py` dictionaries: `qi_mapping`, `flavor_mapping`, `meridian_mapping`.

## Troubleshooting

### PostgreSQL Extension Issues
If migrations fail with "extension does not exist":
```bash
psql -U umami_user -d umami_db -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
psql -U umami_user -d umami_db -c "CREATE EXTENSION IF NOT EXISTS unaccent;"
```

### Port Already in Use
```bash
# Kill processes on port 8000 or 3000
lsof -ti:8000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

### Virtual Environment Issues
```bash
# Backend
rm -rf backend/venv
cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt

# Frontend
rm -rf frontend/node_modules
cd frontend && npm install
```

## Design Principles

- **Terminology**: Use "TCM Five Tastes" not "TCM Flavors" to distinguish from flavor roles
- **Aroma Profile**: Use common scent categories inferred from chemistry rather than direct chemical compound names
- **No Chemistry Highlights**: Don't display chemistry highlights section in UI
- **Flat Design**: Minimalist interface with paper texture aesthetic
- **Data Visualization**: Colors reserved only for charts; buttons use circular icon-only design
- **Noto Sans Typography**: Thin, scientific aesthetic with excellent readability

## Testing

Currently no automated tests. When adding tests:
- Backend: Use Django's TestCase with factory patterns for models
- Frontend: Would need Jest + React Testing Library (not currently configured)
- Test EUC calculations with known ingredient combinations
- Test fuzzy search accuracy with various queries

## Tech Stack

- **Backend**: Django 5.2, Django REST Framework, PostgreSQL 13+, Redis (for caching)
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Recharts (charts), html2canvas (export)
- **Database**: PostgreSQL with pg_trgm and unaccent extensions
- **Key Libraries**: pandas (data import), openpyxl (Excel), lucide-react (icons)
