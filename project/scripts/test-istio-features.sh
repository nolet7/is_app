#!/bin/bash

set -e

GATEWAY_URL=${1:-"http://localhost"}
NAMESPACE=${2:-"default"}

echo "Testing Istio features..."

echo "1. Testing basic connectivity..."
curl -s "$GATEWAY_URL/api/orders" -H "x-user: allowed-user" | jq .

echo ""
echo "2. Testing A/B routing (multiple requests to see different versions)..."
for i in {1..10}; do
    echo "Request $i:"
    curl -s "$GATEWAY_URL/api/inventory" -H "x-user: allowed-user" | jq -r '.version'
done

echo ""
echo "3. Testing canary deployment (with canary header)..."
curl -s "$GATEWAY_URL/api/orders" -H "x-user: allowed-user" -H "canary: true" | jq -r '.version'

echo ""
echo "4. Testing authorization (should fail without proper header)..."
curl -s -w "HTTP Status: %{http_code}\n" "$GATEWAY_URL/api/users" | head -1

echo ""
echo "5. Testing authorization (should succeed with proper header)..."
curl -s "$GATEWAY_URL/api/users" -H "x-user: allowed-user" | jq -r '.version'

echo ""
echo "6. Testing multi-version routing (reviews service with v1/v2/v3)..."
for i in {1..15}; do
    echo "Request $i:"
    curl -s "$GATEWAY_URL/api/reviews" -H "x-user: allowed-user" | jq -r '.version'
done

echo ""
echo "7. Testing feature flag routing (reviews v3 with special header)..."
curl -s "$GATEWAY_URL/api/reviews" -H "x-user: allowed-user" -H "feature-flag: v3-enabled" | jq -r '.version'

echo ""
echo "8. Testing ratings service..."
curl -s "$GATEWAY_URL/api/ratings" -H "x-user: allowed-user" | jq -r '.version'

echo ""
echo "9. Testing fault injection (some requests may fail or be delayed)..."
for i in {1..5}; do
    echo "Request $i (may have artificial delay/failure):"
    timeout 10s curl -s -w "Time: %{time_total}s, Status: %{http_code}\n" \
        "$GATEWAY_URL/api/reviews" -H "x-user: allowed-user" | tail -1
done

echo ""
echo "Testing complete! Check the frontend UI for real-time monitoring."