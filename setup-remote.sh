#!/bin/bash

echo "🚀 Setting up GitHub remote..."
echo ""

# Function to configure with token
setup_with_token() {
    echo "Enter your GitHub username:"
    read GITHUB_USER
    echo "Enter your personal access token:"
    read -s GITHUB_TOKEN
    echo ""
    
    REPO_URL="https://${GITHUB_TOKEN}@github.com/${GITHUB_USER}/brochbot-dashboard.git"
    git remote add origin "$REPO_URL"
    echo "✓ Remote configured with token"
}

# Function to configure with SSH
setup_with_ssh() {
    echo "Enter your GitHub username:"
    read GITHUB_USER
    
    REPO_URL="git@github.com:${GITHUB_USER}/brochbot-dashboard.git"
    git remote add origin "$REPO_URL"
    
    # Use our deploy key
    git config core.sshCommand "ssh -i ~/.ssh/brochbot_github"
    echo "✓ Remote configured with SSH deploy key"
}

# Check if remote already exists
if git remote | grep -q origin; then
    echo "Remote 'origin' already exists. Updating..."
    git remote remove origin
fi

echo "How are you providing access?"
echo "1) Personal Access Token (Fine-grained)"
echo "2) Deploy Key (SSH)"
echo ""
echo -n "Choose [1-2]: "
read CHOICE

case $CHOICE in
    1)
        setup_with_token
        ;;
    2)
        setup_with_ssh
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Success! Your code is on GitHub!"
echo ""
echo "Next steps:"
echo "1. Go to https://vercel.com/new"
echo "2. Import your GitHub repository"
echo "3. Deploy with one click!"
echo ""
echo "Your dashboard will auto-deploy on every push!"