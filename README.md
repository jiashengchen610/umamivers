# Umami Builder

A platform for searching and combining ingredients by Umami and TCM attributes.

## Architecture

- **Frontend**: Next.js (App Router, TypeScript)
- **Backend**: Django + Django REST Framework  
- **Database**: PostgreSQL
- **Data**: Excel processing with fuzzy search support

## Project Structure

```
├── frontend/          # Next.js application
├── backend/          # Django REST API
├── data/            # Excel processing scripts
├── docker-compose.yml # Local development setup
└── README.md
```

## Quick Start

### Prerequisites

**For Docker users:**
- Docker and Docker Compose

**For local PostgreSQL users:**
- PostgreSQL (see [INSTALL_POSTGRES.md](INSTALL_POSTGRES.md))
- Python 3.8+
- Node.js 16+

### Quick Setup (Local PostgreSQL - Recommended)

```bash
./setup-local.sh
./start-local.sh
```

### Docker Setup (if you have Docker)

```bash
./setup.sh
./start-dev.sh
```

### Manual Setup
1. Start services: `docker-compose up -d` (Docker) or install PostgreSQL locally
2. Setup environments and process data:
   ```bash
   # Data processing
   cd data && python3 -m venv venv && source venv/bin/activate
   pip install -r requirements.txt && python process_excel.py && cd ..
   
   # Backend setup
   cd backend && python3 -m venv venv && source venv/bin/activate
   pip install -r requirements.txt && python manage.py migrate && cd ..
   
   # Frontend setup
   cd frontend && npm install
   ```
3. Start servers:
   - Backend: `cd backend && source venv/bin/activate && python manage.py runserver`
   - Frontend: `cd frontend && npm run dev`

### Access Points
- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000/api/
- **Admin**: http://localhost:8000/admin/

## Key Features

- Fuzzy search across English/Chinese/aliases
- Advanced filtering (Umami, TCM attributes, allergens, dietary)
- Visual composition builder with chart components
- Export capabilities (PNG/SVG/JSON)
- Shareable URLs and localStorage