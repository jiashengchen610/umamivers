#!/usr/bin/env bash
# Render build script for Umamivers backend

set -o errexit  # Exit on error

echo "===== Installing Backend Dependencies ====="
cd backend
pip install -r requirements.txt

echo "===== Running Database Migrations ====="
python manage.py migrate --noinput

echo "===== Loading Fixture Data ====="
# Load the pre-calculated ingredient data
python manage.py load_fixture_data --file ../fixture_data.json.gz --clear

echo "===== Collecting Static Files ====="
python manage.py collectstatic --noinput

echo "===== Build Complete ====="
