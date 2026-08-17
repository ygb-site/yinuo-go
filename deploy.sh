#!/usr/bin/env bash
set -e

MSG="${1:-feat: update yinuo-go at $(date +'%Y-%m-%d %H:%M:%S')}"

echo "=========================================="
echo "Preparing to commit and push to GitHub..."
echo "Commit message: $MSG"
echo "=========================================="

git add .

if git diff-index --quiet HEAD --; then
  echo "No new local changes to commit, pushing existing commits..."
else
  git commit -m "$MSG"
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Pushing to origin/$BRANCH..."
git push origin "$BRANCH"

echo "=========================================="
echo "Success! Pushed to GitHub. GitHub Actions will auto-deploy to GitHub Pages."
echo "=========================================="
