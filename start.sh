#!/bin/bash

echo "🚀 Starting ZEINS - Digital Zine Creator"
echo "======================================="

# Check if Python is available
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ Python not found. Please install Python 3.7+ to continue."
    exit 1
fi

echo "✅ Python found: $PYTHON_CMD"

# Check if Flask is installed
if $PYTHON_CMD -c "import flask" 2>/dev/null; then
    echo "✅ Flask is already installed"
else
    echo "📦 Installing Flask..."
    pip install flask gunicorn
fi

echo "🌟 Starting the application..."
echo "📍 Access the app at: http://localhost:5000"
echo "📍 View zines at: http://localhost:5000/view"
echo "⚠️  Press Ctrl+C to stop the server"
echo ""

$PYTHON_CMD app.py
