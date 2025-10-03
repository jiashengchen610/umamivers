#!/bin/bash

# Start both development servers locally
echo "🚀 Starting Umami Builder development servers (Local PostgreSQL)..."

# Start backend in background
echo "🦄 Starting Django backend on http://localhost:8000"
./start-backend.sh &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 5

# Start frontend
echo "⚛️ Starting Next.js frontend on http://localhost:3000"
./start-frontend.sh &
FRONTEND_PID=$!

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