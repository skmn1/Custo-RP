#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# start-frontend.sh — Start the Vite React dev server
# ─────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# ── Verify Node.js ──
if ! command -v node &>/dev/null; then
  echo "❌  Node.js not found. Install Node.js 16+ from https://nodejs.org"
  exit 1
fi

NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
if (( NODE_VER < 16 )); then
  echo "❌  Node.js 16+ required (found v$(node -v))"
  exit 1
fi

cd "$PROJECT_ROOT"

# ── Install dependencies if needed ──
if [[ ! -d "node_modules" ]]; then
  echo "📦  Installing npm dependencies..."
  npm install
fi

echo "🚀  Starting frontend dev server (port 5173)..."
echo "    API proxy → http://localhost:8080/api"
exec npm run dev
