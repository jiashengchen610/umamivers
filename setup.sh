#!/bin/bash

# Umami Builder Setup Script
echo "🍄 Setting up Umami Builder..."

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting." >&2; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "❌ Python 3 is required but not installed. Aborting." >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }

echo "✅ Prerequisites check passed"

# Start database services
echo "🐘 Starting PostgreSQL and Redis..."
docker-compose up -d postgres redis
sleep 10

# Setup Python virtual environment for data processing
echo "🐍 Setting up Python environment for data processing..."
cd data
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Setup Django backend
echo "🦄 Setting up Django backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until docker exec $(docker-compose ps -q postgres) pg_isready -h localhost -p 5432 > /dev/null 2>&1; do
    echo "Waiting for PostgreSQL..."
    sleep 2
done

# Run Django migrations
echo "🔄 Running Django migrations..."
python manage.py migrate

echo "✅ Django backend setup complete"
cd ..

# Process Excel data
echo "📊 Processing Excel data..."
cd data
source venv/bin/activate
python process_excel.py
cd ..

# Setup Node.js frontend
echo "⚛️ Setting up React frontend..."
cd frontend
npm install

echo "✅ Frontend setup complete"
cd ..

echo "🎉 Setup complete!"
echo ""
echo "To start the development servers:"
echo "1. Backend:  cd backend && source venv/bin/activate && python manage.py runserver"
echo "2. Frontend: cd frontend && npm run dev"
echo ""
echo "Or use the start script: ./start-dev.sh"