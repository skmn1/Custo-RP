#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# start-all.sh — Start both backend and frontend concurrently
# ─────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colour helpers
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m' # No Colour

echo -e "${CYAN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     Staff Scheduler Pro  —  Full Stack      ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
echo ""

BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  echo ""
  echo -e "${CYAN}🛑  Shutting down...${NC}"
  [[ -n "$BACKEND_PID" ]]  && kill "$BACKEND_PID"  2>/dev/null
  [[ -n "$FRONTEND_PID" ]] && kill "$FRONTEND_PID" 2>/dev/null
  wait 2>/dev/null
  echo -e "${GREEN}✔  All processes stopped.${NC}"
}
trap cleanup EXIT INT TERM

# ── Resolve Spring profile (default: dev) ──
PROFILE="${1:-dev}"
echo -e "${GREEN}[1/2]${NC} Starting backend API (Spring Boot — profile: ${CYAN}${PROFILE}${NC})..."
"$SCRIPT_DIR/start-backend.sh" "$PROFILE" &
BACKEND_PID=$!

# ── Wait for backend to be ready ──
echo -n "      Waiting for backend on :8080 "
for i in $(seq 1 60); do
  if curl -sf http://localhost:8080/api/employees >/dev/null 2>&1; then
    echo -e " ${GREEN}✔${NC}"
    break
  fi
  echo -n "."
  sleep 2
done

if ! curl -sf http://localhost:8080/api/employees >/dev/null 2>&1; then
  echo -e " ${RED}✖  Backend did not start within 120s${NC}"
  exit 1
fi

# ── Start frontend ──
echo -e "${GREEN}[2/2]${NC} Starting frontend (Vite)..."
"$SCRIPT_DIR/start-frontend.sh" &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "  Frontend  : ${CYAN}http://localhost:5173${NC}"
echo -e "  Backend   : ${CYAN}http://localhost:8080${NC}"
echo -e "  Swagger   : ${CYAN}http://localhost:8080/swagger-ui.html${NC}"
echo -e "  Profile   : ${CYAN}${PROFILE}${NC}"
if [[ "$PROFILE" == "dev" || "$PROFILE" == "prod" ]]; then
  echo -e "  Database  : ${CYAN}PostgreSQL (staff_scheduler)${NC}"
else
  echo -e "  Database  : ${CYAN}H2 in-memory${NC}"
  echo -e "  H2 Console: ${CYAN}http://localhost:8080/h2-console${NC}"
fi
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo ""
echo "Press Ctrl+C to stop all services."

# ── Wait for either process to exit ──
wait -n "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
