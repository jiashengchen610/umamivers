#!/bin/bash

echo "⚛️ Starting Next.js frontend..."

cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Node modules not found. Running npm install..."
    npm install
fi

# Check if next is available
if ! npm list next > /dev/null 2>&1; then
    echo "Next.js not found. Installing dependencies..."
    npm install
fi

echo "🚀 Starting Next.js server on http://localhost:3000"
echo "🌐 Open http://localhost:3000 in your browser"
echo ""
echo "Press Ctrl+C to stop"

npm run dev