#!/bin/bash

echo "🚀 Starting Umamivers with backend and frontend..."

# Kill any existing processes on the ports
echo "🧹 Cleaning up existing processes..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start backend
echo "🦄 Starting Django backend..."
cd backend
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    python manage.py migrate
else
    source venv/bin/activate
fi

# Start backend server
python manage.py runserver 127.0.0.1:8000 &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"
cd ..

# Wait for backend
echo "⏳ Waiting for backend to be ready..."
sleep 5

# Test backend
echo "🧪 Testing backend API..."
curl -s http://127.0.0.1:8000/api/ingredients/ > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend API is responding"
else
    echo "❌ Backend API is not responding"
fi

# Start frontend
echo "⚛️ Starting Next.js frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi

npm run dev &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"
cd ..

echo ""
echo "✅ Both servers are running!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://127.0.0.1:8000"
echo "📋 API Test: http://127.0.0.1:8000/api/ingredients/"
echo ""
echo "Press Ctrl+C to stop both servers"

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo "✅ Servers stopped"
    exit 0
}

trap cleanup INT
wait