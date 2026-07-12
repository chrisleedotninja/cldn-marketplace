#!/usr/bin/env bash
#
# new-project — spin up a project in one shot:
#   1. create a matching Todoist project (so the note's #<slug> filter resolves)
#   2. create the Obsidian project note in 800-Projects from the template shape
#
# Usage:  new-project "Camper Solar Build" [topic]
#   arg 1  project display name (becomes the note title & Todoist project slug)
#   arg 2  optional topic/area to link (e.g. Overlanding)
#
# Overridable via env (defaults preserve the original personal setup):
#   VAULT   path to the Obsidian vault        (default: ~/Documents/TheVault)
#   TD      path to the Todoist `td` CLI       (default: first `td` on PATH)
#   PARENT  Todoist project to nest under      (default: none — flat)

set -euo pipefail

VAULT="${VAULT:-$HOME/Documents/TheVault}"
PROJECTS_DIR="$VAULT/800-Projects"
TD="${TD:-$(command -v td || echo /opt/homebrew/bin/td)}"
PARENT="${PARENT:-}"

name="${1:-}"
topic="${2:-}"
if [ -z "$name" ]; then
  echo "Usage: new-project \"Project Name\" [topic]" >&2
  exit 1
fi

# slug: lowercase, runs of non-alphanumerics -> single hyphen, trimmed
slug="$(printf '%s' "$name" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//')"

# 1) Todoist project (only if it doesn't already exist)
if "$TD" project view "$slug" >/dev/null 2>&1; then
  echo "Todoist project '#$slug' already exists — skipping create"
else
  if [ -n "$PARENT" ]; then
    "$TD" project create --name "$slug" --parent "$PARENT" -q
  else
    "$TD" project create --name "$slug" -q
  fi
  echo "Created Todoist project '#$slug'"
fi

# 2) Obsidian note (don't clobber an existing one)
note="$PROJECTS_DIR/$name.md"
if [ -e "$note" ]; then
  echo "Note already exists: $note — leaving it untouched"
  exit 0
fi

created="$(date '+%Y-%m-%d %H:%M')"
day="$(date +%-d)"
case "$day" in
  1|21|31) suf=st ;;
  2|22)    suf=nd ;;
  3|23)    suf=rd ;;
  *)       suf=th ;;
esac
modified="$(date "+%A $day$suf %B %y %H:%M")"
log_date="$(date '+%-m/%-d/%y')"

if [ -n "$topic" ]; then
  topics_block=$'topics:\n  - '"$topic"
else
  topics_block="topics: []"
fi

mkdir -p "$PROJECTS_DIR"
cat > "$note" <<EOF
---
created: $created
modified: $modified
tags:
  - project
$topics_block
---
# $name

## Overview
-

## Tasks
\`\`\`todoist
name: Tasks
filter: "#$slug"
\`\`\`

## Notes
-

## Reference
-

## Log
- $log_date - Created project
EOF

echo "Created note: $note"
echo "  -> Todoist filter: #$slug"
