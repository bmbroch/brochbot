#!/bin/bash

echo "🚀 Deploying Brochbot to Vercel..."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm i -g vercel
fi

# Deploy
echo "Starting deployment..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Your dashboard should be live at your Vercel URL."
echo "You can also add a custom domain in Vercel settings."
echo ""
echo "To update tasks, edit app.js and redeploy with: vercel --prod"