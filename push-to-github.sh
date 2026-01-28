#!/bin/bash

echo "🚀 Brochbot GitHub Setup"
echo ""

# Check if remote exists
if git remote | grep -q origin; then
    echo "✓ Remote 'origin' already configured"
else
    echo "Enter your GitHub repository URL:"
    echo "Example: https://github.com/YOUR_USERNAME/brochbot-dashboard.git"
    read -p "URL: " REPO_URL
    
    git remote add origin "$REPO_URL"
    echo "✓ Remote added"
fi

# Configure SSH if using deploy key
if [ -f ~/.ssh/brochbot_github ]; then
    echo "✓ Using deploy key for authentication"
    git config core.sshCommand "ssh -i ~/.ssh/brochbot_github"
fi

# Push to GitHub
echo ""
echo "Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Success! Your code is now on GitHub"
echo ""
echo "Next steps:"
echo "1. Go to https://vercel.com/new"
echo "2. Import your GitHub repository" 
echo "3. Deploy with one click!"
echo ""
echo "After that, every push will auto-deploy!"