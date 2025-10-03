#!/bin/bash

# Start development servers
echo "🚀 Starting Umami Builder development servers..."

# Start backend in background
echo "🦄 Starting Django backend on http://localhost:8000"
cd backend
if [ ! -d "venv" ]; then
    echo "Python virtual environment not found. Creating and installing dependencies..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi
python manage.py runserver &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "⚛️ Starting Next.js frontend on http://localhost:3000"
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Node modules not found. Running npm install..."
    npm install
fi
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Both servers are starting!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:8000"
echo "📊 Admin:    http://localhost:8000/admin"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

# Trap cleanup function on script exit
trap cleanup INT

# Wait for processes
wait