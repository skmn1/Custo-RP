#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# run-tests.sh — Run all test suites (backend + frontend lint)
# ─────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
API_DIR="$PROJECT_ROOT/staff-scheduler-api"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}Running all tests...${NC}"
echo ""

# ── Backend Tests ──
echo -e "${GREEN}[1/2]${NC} Backend unit tests (Maven)..."
if [[ -f "$HOME/.sdkman/bin/sdkman-init.sh" ]]; then
  set +u  # SDKMAN init references ZSH_VERSION which may be unset
  source "$HOME/.sdkman/bin/sdkman-init.sh"
  set -u
fi
cd "$API_DIR"
mvn test -q
echo ""

# ── Frontend Lint ──
echo -e "${GREEN}[2/2]${NC} Frontend lint (ESLint)..."
cd "$PROJECT_ROOT"
npm run lint
echo ""

echo -e "${GREEN}✔  All tests passed!${NC}"
