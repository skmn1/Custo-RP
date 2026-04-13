#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# start-dev.sh — Setup WSL port forwarding and start dev servers
# ─────────────────────────────────────────────────────────────

# Get WSL IP
WSL_IP=$(hostname -I | awk '{print $1}')
echo "🔍 WSL IP: $WSL_IP"

# Get Windows WiFi IP
#WIFI_IP=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}')
WIFI_IP=$(ip route | grep default | awk '{print $3}')
echo "🔍 Windows IP: $WIFI_IP"

# Update .env.local with current WiFi IP
ENV_FILE="/home/kamnis/ReactWS/scheduler/.env.local"
echo "VITE_API_TARGET=http://$WIFI_IP:8080" > "$ENV_FILE"
echo "✔  Updated .env.local with API target: http://$WIFI_IP:8080"

# Setup port forwarding via PowerShell
echo "🔧 Setting up port forwarding..."
powershell.exe -Command "
  netsh interface portproxy delete v4tov4 listenaddress=0.0.0.0 listenport=5173 2>null;
  netsh interface portproxy delete v4tov4 listenaddress=0.0.0.0 listenport=8080 2>null;
  netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=5173 connectaddress=$WSL_IP connectport=5173;
  netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=8080 connectaddress=$WSL_IP connectport=8080;
  netsh advfirewall firewall add rule name='WSL React' dir=in action=allow protocol=TCP localport=5173;
  netsh advfirewall firewall add rule name='WSL Spring Boot' dir=in action=allow protocol=TCP localport=8080;
"
echo "✔  Port forwarding set up"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅  All done!"
echo "📱  Open on your phone: http://$WIFI_IP:5173"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
