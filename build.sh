#!/usr/bin/env bash
# exit on error
set -o errexit

echo "==> Installing dependencies..."
cd backend
pip install --upgrade pip
pip install -r requirements.txt

echo "==> Running migrations..."
python manage.py migrate --noinput

echo "==> Creating PostgreSQL extensions..."
python manage.py shell -c "
from django.db import connection
try:
    with connection.cursor() as cursor:
        cursor.execute('CREATE EXTENSION IF NOT EXISTS pg_trgm;')
        cursor.execute('CREATE EXTENSION IF NOT EXISTS unaccent;')
    print('Extensions created successfully')
except Exception as e:
    print(f'Extension warning (may already exist): {e}')
" || echo "Extensions may already exist, continuing..."

echo "==> Loading fixtures..."
python manage.py loaddata fixtures_ingredients.json

echo "==> Collecting static files..."
python manage.py collectstatic --noinput

echo "==> Build complete!"
