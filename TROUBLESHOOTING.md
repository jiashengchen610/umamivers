# Troubleshooting Guide

## Common Issues and Solutions

### 1. PostgreSQL Connection Issues

**Error**: `FATAL: role "umami_user" does not exist`

**Solution**:
```bash
# Create the user manually
psql -d postgres -c "CREATE USER umami_user WITH PASSWORD 'umami_pass';"
psql -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE umami_db TO umami_user;"
```

**Error**: `psql: command not found`

**Solution**: Install PostgreSQL first. See [INSTALL_POSTGRES.md](INSTALL_POSTGRES.md)

### 2. Frontend Issues

**Error**: `next: command not found`

**Solution**:
```bash
cd frontend
npm install
```

**Error**: `No matching version found for canvas2svg`

**Solution**: This dependency has been removed from package.json. Re-run:
```bash
./setup-local.sh
```

### 3. Python/Django Issues

**Error**: `ModuleNotFoundError: No module named 'django'`

**Solution**:
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

**Error**: `command not found: python`

**Solution**: Use `python3` instead, or create an alias:
```bash
alias python=python3
```

### 4. Excel Data Processing Issues

**Error**: `umami_warp_ready.xlsx not found`

**Solution**: Place the Excel file in the project root directory, then:
```bash
cd data
source venv/bin/activate
python process_excel.py
```

### 5. Port Already in Use

**Error**: `Port 8000 is already in use`

**Solution**:
```bash
# Find and kill the process using port 8000
lsof -ti:8000 | xargs kill -9

# Or use a different port
python manage.py runserver 8001
```

### 6. Permission Issues

**Error**: `Permission denied: ./setup-local.sh`

**Solution**:
```bash
chmod +x setup-local.sh start-local.sh start-backend.sh start-frontend.sh
```

### 7. Database Migration Issues

**Error**: `You have unapplied migrations`

**Solution**:
```bash
cd backend
source venv/bin/activate
python manage.py migrate
```

## Getting Help

1. **Check logs**: Look at the terminal output for specific error messages
2. **Verify prerequisites**: Ensure PostgreSQL, Python 3, and Node.js are installed
3. **Clean restart**: Stop all processes and run `./setup-local.sh` again
4. **Check ports**: Make sure ports 3000 and 8000 are available

## Manual Reset

If everything breaks, you can manually reset:

```bash
# Stop all processes
pkill -f "python manage.py runserver"
pkill -f "next dev"

# Remove virtual environments
rm -rf backend/venv data/venv frontend/node_modules

# Drop and recreate database
dropdb umami_db
createdb umami_db

# Run setup again
./setup-local.sh
```