#!/bin/bash
input=$(cat)
MODEL=$(echo "$input" | jq -r '.model.display_name')
CWD=$(echo "$input" | jq -r '.workspace.current_dir')
DIR=$(basename "$CWD")
PERCENT=$(echo "$input" | jq -r '.context_window.used_percentage // 0' | cut -d. -f1)

# Git branch + pending changes (empty outside a repo)
GIT_SEGMENT=""
BRANCH=$(git -C "$CWD" branch --show-current 2>/dev/null)
if [ -n "$BRANCH" ]; then
  CHANGES=$(git -C "$CWD" status --porcelain 2>/dev/null | wc -l | tr -d ' ')
  GIT_SEGMENT=" 🌿 $BRANCH"
  [ "$CHANGES" -gt 0 ] && GIT_SEGMENT="$GIT_SEGMENT ✚$CHANGES"
  GIT_SEGMENT="$GIT_SEGMENT |"
fi

# Dev mode from project root
MODE_FILE=".catalyst-dev-mode"
if [ -f "$MODE_FILE" ]; then
  MODE=$(tr -d '[:space:]' < "$MODE_FILE")
else
  MODE="Solution"
fi

echo "[$MODEL] 📁 $DIR |$GIT_SEGMENT 🧠 ${PERCENT}% | ⚙️ $MODE"
