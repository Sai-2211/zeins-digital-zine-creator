#!/bin/bash

echo "🔄 ZEINS Update & Redeploy Script"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "app.py" ]; then
    echo "❌ Error: app.py not found. Please run this script from the zeins-app directory."
    exit 1
fi

# Check if git remote exists
if ! git remote get-url origin &> /dev/null; then
    echo "❌ Error: No Git remote configured. Please deploy first using ./deploy.sh"
    exit 1
fi

REPO_URL=$(git remote get-url origin)
echo -e "${BLUE}📋 Current repository: ${NC}$REPO_URL"
echo ""

# Get commit message
echo -e "${YELLOW}📝 Describe your changes:${NC}"
read -p "Commit message: " COMMIT_MSG

if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Update: Modified ZEINS app"
fi

echo ""
echo -e "${BLUE}🔄 Updating your live app...${NC}"

# Add all changes
git add .

# Commit changes
git commit -m "$COMMIT_MSG"

# Push to GitHub (this triggers Render redeploy)
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Successfully pushed changes to GitHub!${NC}"
    echo ""
    echo -e "${BLUE}🚀 Render will automatically redeploy your app:${NC}"
    echo "• Check your Render dashboard: https://dashboard.render.com"
    echo "• Deployment usually takes 2-3 minutes"
    echo "• Your app will be updated at the same URL"
    echo ""
    echo -e "${YELLOW}💡 Pro tip:${NC} Bookmark your Render dashboard to monitor deployments!"
else
    echo "❌ Failed to push changes. Please check your Git credentials."
    exit 1
fi
