#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# start-backend.sh — Start the Spring Boot backend API
# ─────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
API_DIR="$PROJECT_ROOT/staff-scheduler-api"

# ── Load SDKMAN (provides Java 17) ──
if [[ -f "$HOME/.sdkman/bin/sdkman-init.sh" ]]; then
  set +u  # SDKMAN init references ZSH_VERSION which may be unset
  source "$HOME/.sdkman/bin/sdkman-init.sh"
  set -u
fi

# ── Verify Java ──
if ! command -v java &>/dev/null; then
  echo "❌  Java not found. Install Java 17+ via SDKMAN:"
  echo "    curl -s https://get.sdkman.io | bash"
  echo "    sdk install java 17.0.13-tem"
  exit 1
fi

JAVA_VER=$(java -version 2>&1 | head -1 | awk -F\" '{print $2}' | cut -d. -f1)
if (( JAVA_VER < 17 )); then
  echo "❌  Java 17+ required (found Java $JAVA_VER)"
  exit 1
fi

# ── Free port 8080 if already in use ──
free_port() {
  local port="$1"
  local pids
  pids=$(lsof -ti tcp:"$port" 2>/dev/null || true)
  if [[ -n "$pids" ]]; then
    echo "⚠️   Port $port in use (PID $pids). Stopping..."
    # Graceful first, then force
    kill $pids 2>/dev/null || true
    sleep 2
    # Force-kill any survivors
    pids=$(lsof -ti tcp:"$port" 2>/dev/null || true)
    [[ -n "$pids" ]] && kill -9 $pids 2>/dev/null || true
    # Wait until port is actually free (max 10s)
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
free_port 8080

# ── Parse profile (default: dev) ──
PROFILE="${1:-dev}"
echo "🔧  Using Spring profile: $PROFILE"

echo "🚀  Starting Staff Scheduler API (port 8080)..."
cd "$API_DIR"
exec mvn spring-boot:run -Dspring-boot.run.profiles="$PROFILE" -q
