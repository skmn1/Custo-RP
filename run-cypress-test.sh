#!/bin/bash

# Script to find available Vite server and run Cypress tests

echo "🔍 Checking for running Vite development server..."

# Array of common ports Vite uses
PORTS=(5173 5174 5175 5176 3000 8080)
FOUND_PORT=""

# Check each port
for PORT in "${PORTS[@]}"; do
    echo "Checking port $PORT..."
    if curl -s "http://localhost:$PORT" > /dev/null 2>&1; then
        echo "✅ Found server running on port $PORT"
        FOUND_PORT=$PORT
        break
    fi
done

if [ -z "$FOUND_PORT" ]; then
    echo "❌ No development server found. Starting one..."
    echo "Run 'npm run dev' in another terminal first"
    exit 1
fi

echo "🚀 Running Cypress tests against http://localhost:$FOUND_PORT"

# Update Cypress config with found port
sed -i.bak "s/baseUrl: 'http:\/\/localhost:[0-9]*'/baseUrl: 'http:\/\/localhost:$FOUND_PORT'/" cypress.config.js

# Run the specific workflow test
npx cypress run --spec "cypress/e2e/scheduler-workflow.cy.js"

# Restore original config
mv cypress.config.js.bak cypress.config.js 2>/dev/null || true

echo "✅ Test completed!"
