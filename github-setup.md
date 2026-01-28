# 🔗 GitHub + Vercel Setup Guide

## Step 1: Create GitHub Repository

### Option A: Create via GitHub.com
1. Go to https://github.com/new
2. Name it: `brochbot-dashboard`
3. Keep it private
4. Don't initialize with README (we already have code)
5. Copy the repository URL

### Option B: Use GitHub CLI
```bash
gh repo create brochbot-dashboard --private --source=.
```

## Step 2: Connect Brochbot to Your Repo

### If you created the repo manually:
```bash
cd brochbot-vercel
git remote add origin https://github.com/YOUR_USERNAME/brochbot-dashboard.git
git branch -M main
git push -u origin main
```

### Give Brochbot Access:

**Option 1: Deploy Key (Most Secure)**
```bash
# Generate key
ssh-keygen -t ed25519 -f ~/.ssh/brochbot_github -N ""

# Show public key
cat ~/.ssh/brochbot_github.pub
```
Then add this public key to:
Settings → Deploy keys → Add deploy key (with write access)

**Option 2: Personal Access Token**
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token with `repo` scope
3. Share the token with me securely

**Option 3: Add as Collaborator**
Settings → Manage access → Add people → Add "brochbot" or share username

## Step 3: Connect Vercel to GitHub

1. Go to https://vercel.com/new
2. Import Git Repository
3. Select your `brochbot-dashboard` repo
4. Deploy!

## Step 4: Auto-Deploy Setup

Once connected, every push to `main` will auto-deploy!

## Brochbot Will Then:
- Push updates directly to GitHub
- Vercel auto-deploys within seconds
- Your dashboard stays updated at brochbot.vercel.app

---

## Quick Command Reference

After setup, I can:
```bash
# Make changes
cd brochbot-vercel
# ... edit files ...
git add -A
git commit -m "Update tasks"
git push

# Vercel deploys automatically!
```

## Current Status:
✅ Code is ready and committed locally
⏳ Waiting for GitHub repo creation
⏳ Waiting for access method (deploy key, token, or collaborator)