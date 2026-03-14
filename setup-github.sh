#!/bin/bash
# setup-github.sh
# Run this once to create the GitHub repo and push everything.
# Requires: gh (GitHub CLI) — install with `brew install gh` then `gh auth login`

set -e

REPO_NAME="wobbly"
DESCRIPTION="A daily physics puzzle game — land five stones on a castle ruin without knocking it down"

echo "Creating GitHub repository: $REPO_NAME"

gh repo create "$REPO_NAME" \
  --public \
  --description "$DESCRIPTION" \
  --source=. \
  --remote=origin \
  --push

echo ""
echo "✓ Done. Your repo is live at:"
gh repo view --json url -q .url

echo ""
echo "Next steps:"
echo "  1. Go to Settings → Pages → deploy from main branch (for GitHub Pages)"
echo "     This will make tools/builder.html available at:"
echo "     https://YOUR_USERNAME.github.io/wobbly/tools/builder.html"
echo ""
echo "  2. Invite collaborators at:"
echo "     https://github.com/YOUR_USERNAME/wobbly/settings/access"
echo ""
echo "  3. Create a 'puzzles/' directory and add your first puzzle JSON files"
