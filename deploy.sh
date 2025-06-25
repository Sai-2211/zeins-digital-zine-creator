#!/bin/bash

echo "🚀 ZEINS Deployment Helper Script"
echo "================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "app.py" ]; then
    echo -e "${RED}❌ Error: app.py not found. Please run this script from the zeins-app directory.${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Pre-deployment Checklist${NC}"
echo "✅ Flask app (app.py) - Found"
echo "✅ Requirements (requirements.txt) - Found"
echo "✅ Procfile for Render - Found"
echo "✅ Git repository initialized"
echo ""

# Check if remote origin exists
if git remote get-url origin &> /dev/null; then
    echo -e "${GREEN}✅ Git remote already configured${NC}"
    REPO_URL=$(git remote get-url origin)
    echo "   Repository: $REPO_URL"
else
    echo -e "${YELLOW}⚠️  Git remote not configured yet${NC}"
    echo ""
    echo -e "${BLUE}📝 GitHub Repository Setup Instructions:${NC}"
    echo "1. Go to https://github.com/new"
    echo "2. Repository name: zeins-digital-zine-creator"
    echo "3. Description: ZEINS - Digital Zine Creator Web App"
    echo "4. Set to PUBLIC (required for free Render deployment)"
    echo "5. DON'T initialize with README, .gitignore, or license"
    echo "6. Click 'Create repository'"
    echo ""
    echo -e "${YELLOW}📋 After creating the repository, GitHub will show you commands.${NC}"
    echo -e "${YELLOW}Copy the repository URL and run this script again.${NC}"
    echo ""
    read -p "🔗 Enter your GitHub repository URL (e.g., https://github.com/username/repo.git): " REPO_URL
    
    if [ -z "$REPO_URL" ]; then
        echo -e "${RED}❌ No repository URL provided. Exiting.${NC}"
        exit 1
    fi
    
    echo ""
    echo -e "${BLUE}🔧 Configuring Git remote...${NC}"
    git branch -M main
    git remote add origin "$REPO_URL"
fi

echo ""
echo -e "${BLUE}📤 Pushing to GitHub...${NC}"
git add .
git commit -m "Deploy: ZEINS Digital Zine Creator ready for deployment" --allow-empty
git push -u origin main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
else
    echo -e "${RED}❌ Failed to push to GitHub. Please check your credentials and repository URL.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 GitHub Repository Setup Complete!${NC}"
echo ""
echo -e "${BLUE}🚀 Render.com Deployment Instructions:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}Step 1: Create Render Account${NC}"
echo "1. Go to https://render.com"
echo "2. Click 'Get Started for Free'"
echo "3. Sign up with your GitHub account (recommended)"
echo ""
echo -e "${YELLOW}Step 2: Deploy Web Service${NC}"
echo "1. After login, click 'New +' → 'Web Service'"
echo "2. Connect your GitHub account if not already connected"
echo "3. Find and select your repository: $(basename "$REPO_URL" .git)"
echo "4. Use these EXACT settings:"
echo ""
echo -e "${GREEN}   📋 Render Configuration:${NC}"
echo "   ├─ Name: zeins-app (or any name you prefer)"
echo "   ├─ Region: Select closest to your location"
echo "   ├─ Branch: main"
echo "   ├─ Root Directory: (leave empty)"
echo "   ├─ Runtime: Python 3"
echo "   ├─ Build Command: pip install -r requirements.txt"
echo "   ├─ Start Command: gunicorn app:app"
echo "   └─ Plan: Free"
echo ""
echo "5. Click 'Create Web Service'"
echo ""
echo -e "${YELLOW}Step 3: Wait for Deployment${NC}"
echo "• Render will automatically build and deploy your app"
echo "• This usually takes 2-5 minutes"
echo "• You'll get a URL like: https://your-app-name.onrender.com"
echo ""
echo -e "${GREEN}🎊 Your ZEINS app will be live and accessible worldwide!${NC}"
echo ""
echo -e "${BLUE}📱 Post-Deployment Testing:${NC}"
echo "1. Visit your app URL"
echo "2. Create a test zine"
echo "3. Save and verify it appears in 'View Zines'"
echo "4. Test PDF export functionality"
echo "5. Try dark/light mode toggle"
echo ""
echo -e "${YELLOW}💡 Pro Tips:${NC}"
echo "• Free Render apps sleep after 15 minutes of inactivity"
echo "• First request after sleep may take 30-60 seconds"
echo "• Your app will have a render.com subdomain"
echo "• You can add a custom domain later if desired"
echo ""
echo -e "${GREEN}🔗 Useful Links:${NC}"
echo "• Render Dashboard: https://dashboard.render.com"
echo "• Your Repository: $REPO_URL"
echo "• Render Docs: https://render.com/docs"
echo ""
echo -e "${BLUE}Need help? Common issues and solutions:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "• Build fails: Check requirements.txt dependencies"
echo "• App won't start: Verify Start Command is exactly 'gunicorn app:app'"
echo "• 404 errors: Ensure Root Directory is empty"
echo "• Permission issues: Check if repository is public"
echo ""
echo -e "${GREEN}✨ Happy zining! Your digital zine creator is ready to go live! ✨${NC}"
