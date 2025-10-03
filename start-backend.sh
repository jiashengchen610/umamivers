#!/bin/bash

echo "🦄 Starting Django backend..."

cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Python virtual environment not found. Creating and installing dependencies..."
    python3 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

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
    echo "❌ Database connection failed. Please run ./setup-local.sh first."
    exit 1
}

echo "🚀 Starting Django server on http://localhost:8000"
echo "📊 Admin interface: http://localhost:8000/admin"
echo "🔧 API endpoints: http://localhost:8000/api/"
echo ""
echo "Press Ctrl+C to stop"

python manage.py runserver