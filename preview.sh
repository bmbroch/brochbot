#!/bin/bash

echo "🚀 Starting Brochbot preview server..."
echo ""
echo "Opening at http://localhost:3000"
echo ""

# Simple Python HTTP server (works on most systems)
if command -v python3 &> /dev/null; then
    python3 -m http.server 3000
elif command -v python &> /dev/null; then
    python -m SimpleHTTPServer 3000
else
    echo "Python not found. Install Python or use 'npx serve' instead."
fi