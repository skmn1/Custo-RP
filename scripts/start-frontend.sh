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

# ── Free port 5173 if already in use ──
free_port() {
  local port="$1"
  local pids
  pids=$(lsof -ti tcp:"$port" 2>/dev/null || true)
  if [[ -n "$pids" ]]; then
    echo "⚠️   Port $port in use (PID $pids). Stopping..."
    kill $pids 2>/dev/null || true
    sleep 2
    pids=$(lsof -ti tcp:"$port" 2>/dev/null || true)
    [[ -n "$pids" ]] && kill -9 $pids 2>/dev/null || true
    for i in $(seq 1 10); do
      lsof -ti tcp:"$port" >/dev/null 2>&1 || break
      sleep 1
    done
    if lsof -ti tcp:"$port" >/dev/null 2>&1; then
      echo "❌  Could not free port $port after 10s"
      exit 1
    fi
    echo "✔   Port $port is now free."
  fi
}
free_port 5173

echo "🚀  Starting frontend dev server (port 5173)..."
echo "    API proxy → http://localhost:8080/api"
exec npm run dev
