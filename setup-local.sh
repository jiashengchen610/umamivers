#!/bin/bash

# Umami Builder Local Setup Script (without Docker)
echo "🍄 Setting up Umami Builder (Local PostgreSQL)..."

# Check prerequisites
command -v python3 >/dev/null 2>&1 || { echo "❌ Python 3 is required but not installed. Aborting." >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v psql >/dev/null 2>&1 || { echo "❌ PostgreSQL is required but not installed. Please install PostgreSQL first." >&2; exit 1; }

echo "✅ Prerequisites check passed"

# Setup PostgreSQL database and user
echo "🐘 Setting up PostgreSQL database..."
echo "Creating database and user (you may be prompted for your PostgreSQL password)..."

# Create database and user
createdb umami_db 2>/dev/null || echo "Database umami_db may already exist"
psql -d postgres -c "CREATE USER umami_user WITH PASSWORD 'umami_pass';" 2>/dev/null || echo "User umami_user may already exist"
psql -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE umami_db TO umami_user;" 2>/dev/null
psql -d umami_db -c "GRANT ALL ON SCHEMA public TO umami_user;" 2>/dev/null
psql -d umami_db -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;" 2>/dev/null
psql -d umami_db -c "CREATE EXTENSION IF NOT EXISTS unaccent;" 2>/dev/null

echo "✅ PostgreSQL setup complete"

# Setup Python virtual environment for data processing
echo "🐍 Setting up Python environment for data processing..."
cd data
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cd ..

# Setup Django backend
echo "🦄 Setting up Django backend..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Test database connection
echo "🔗 Testing database connection..."
python -c "
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'umami_project.settings')
import django
django.setup()
from django.db import connection
cursor = connection.cursor()
print('✅ Database connection successful')
" || {
    echo "❌ Database connection failed. Please check your PostgreSQL installation and try again."
    exit 1
}

# Run Django migrations
echo "🔄 Running Django migrations..."
python manage.py migrate

echo "✅ Django backend setup complete"
cd ..

# Process Excel data
echo "📊 Processing Excel data..."
if [ -f "umami_warp_ready.xlsx" ]; then
    cd data
    source venv/bin/activate
    python process_excel.py
    cd ..
else
    echo "⚠️  umami_warp_ready.xlsx not found. Skipping data processing."
    echo "   Place the Excel file in the project root and run: cd data && source venv/bin/activate && python process_excel.py"
fi

# Fix frontend package.json
echo "🔧 Fixing frontend dependencies..."
cd frontend

# Create a corrected package.json
cat > package.json << 'EOF'
{
  "name": "umami-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "react": "^18",
    "react-dom": "^18",
    "next": "14.0.1",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.0.1",
    "postcss": "^8",
    "eslint": "^8",
    "eslint-config-next": "14.0.1",
    "lucide-react": "^0.292.0",
    "recharts": "^2.8.0",
    "html2canvas": "^1.4.1",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  }
}
EOF

# Setup Node.js frontend
echo "⚛️ Setting up React frontend..."
npm install

echo "✅ Frontend setup complete"
cd ..

echo "🎉 Setup complete!"
echo ""
echo "To start the development servers:"
echo "1. Backend:  ./start-backend.sh"
echo "2. Frontend: ./start-frontend.sh"
echo ""
echo "Or start both: ./start-local.sh"