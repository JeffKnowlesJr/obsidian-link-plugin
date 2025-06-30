#!/bin/bash

# Deploy to GitHub Script
# This script handles the complete process of pushing your code to replace the GitHub repository

set -e  # Exit on any error

echo "🚀 Starting GitHub deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not in a git repository. Please run 'git init' first."
    exit 1
fi

print_status "Checking current git status..."

# Get current branch name
CURRENT_BRANCH=$(git branch --show-current)
print_status "Current branch: $CURRENT_BRANCH"

# Check if remote origin exists
if ! git remote get-url origin >/dev/null 2>&1; then
    print_status "Adding remote origin..."
    git remote add origin https://github.com/JeffKnowlesJr/obsidian-link-plugin-v.01.git
    print_success "Remote origin added successfully"
else
    print_status "Remote origin already exists"
fi

# Fetch remote information to check what branches exist
print_status "Fetching remote repository information..."
git fetch origin --quiet || {
    print_warning "Could not fetch from remote (this is normal for a new repository)"
}

# Check what branches exist on remote
REMOTE_BRANCHES=$(git branch -r 2>/dev/null | grep -v HEAD | sed 's/origin\///' | tr -d ' ' || echo "")

print_status "Checking remote branches..."
if [ -n "$REMOTE_BRANCHES" ]; then
    echo "Remote branches found: $REMOTE_BRANCHES"
else
    echo "No remote branches found (new repository)"
fi

# Determine target branch
TARGET_BRANCH=""
if echo "$REMOTE_BRANCHES" | grep -q "main"; then
    TARGET_BRANCH="main"
    print_status "Target branch: main (found on remote)"
elif echo "$REMOTE_BRANCHES" | grep -q "master"; then
    TARGET_BRANCH="master"
    print_status "Target branch: master (found on remote)"
else
    # No remote branches, use current branch
    TARGET_BRANCH="$CURRENT_BRANCH"
    print_status "Target branch: $TARGET_BRANCH (using current branch, no remote branches found)"
fi

# If current branch doesn't match target, create/switch to target branch
if [ "$CURRENT_BRANCH" != "$TARGET_BRANCH" ]; then
    print_status "Switching from $CURRENT_BRANCH to $TARGET_BRANCH..."
    
    # Check if target branch exists locally
    if git show-ref --verify --quiet refs/heads/$TARGET_BRANCH; then
        print_status "Switching to existing local branch: $TARGET_BRANCH"
        git checkout $TARGET_BRANCH
    else
        print_status "Creating new branch: $TARGET_BRANCH"
        git checkout -b $TARGET_BRANCH
    fi
    print_success "Now on branch: $TARGET_BRANCH"
fi

# Check if there are any changes to commit
if git diff --cached --quiet && git diff --quiet; then
    print_status "No changes detected, checking if we need to add files..."
    
    # Check if there are untracked files
    if [ -n "$(git ls-files --others --exclude-standard)" ]; then
        print_status "Found untracked files, adding them..."
        git add .
    else
        print_warning "No changes to commit"
    fi
fi

# Check again if there are staged changes
if ! git diff --cached --quiet; then
    print_status "Committing changes..."
    git commit -m "Deploy updated plugin code to GitHub - $(date '+%Y-%m-%d %H:%M:%S')"
    print_success "Changes committed successfully"
else
    print_status "No staged changes to commit"
fi

# Push to remote
print_status "Pushing to remote repository..."
print_warning "This will FORCE PUSH and replace all content in the remote repository!"

read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Force pushing to origin/$TARGET_BRANCH..."
    
    # Try to push
    if git push -u origin $TARGET_BRANCH --force; then
        print_success "Successfully pushed to GitHub!"
        print_success "Repository URL: https://github.com/JeffKnowlesJr/obsidian-link-plugin-v.01"
    else
        print_error "Failed to push to GitHub"
        print_status "You may need to check your GitHub credentials or repository permissions"
        exit 1
    fi
else
    print_warning "Push cancelled by user"
    exit 0
fi

print_success "🎉 Deployment completed successfully!"
print_status "Your code has been pushed to: https://github.com/JeffKnowlesJr/obsidian-link-plugin-v.01"

# Show final status
print_status "Final repository status:"
git status --short
git log --oneline -3

echo
print_success "✅ All done! Your repository has been updated." 