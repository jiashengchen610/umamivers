#!/usr/bin/env bash
# exit on error
set -o errexit

cd backend

pip install --upgrade pip
pip install -r requirements.txt

# Run migrations
python manage.py migrate --noinput

# Create PostgreSQL extensions (ignore errors if they exist)
python manage.py shell << EOF
from django.db import connection
with connection.cursor() as cursor:
    try:
        cursor.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")
        cursor.execute("CREATE EXTENSION IF NOT EXISTS unaccent;")
    except Exception as e:
        print(f"Extension creation: {e}")
EOF

# Load fixtures
python manage.py loaddata fixtures_ingredients.json

# Collect static files
python manage.py collectstatic --noinput
