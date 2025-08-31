#!/bin/bash

set -e

# Script to test deployments across different environments
# Usage: ./scripts/test-environments.sh

echo "🧪 Testing Stock Management App across environments..."

# Test functions
test_api_endpoint() {
    local url=$1
    local endpoint=$2
    local expected_status=${3:-200}
    
    echo "   Testing: $url$endpoint"
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" "$url$endpoint" -H "x-user: allowed-user" || echo "HTTPSTATUS:000")
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    
    if [ "$http_code" -eq "$expected_status" ]; then
        echo "   ✅ $endpoint - Status: $http_code"
        return 0
    else
        echo "   ❌ $endpoint - Expected: $expected_status, Got: $http_code"
        return 1
    fi
}

test_environment() {
    local env_name=$1
    local base_url=$2
    
    echo ""
    echo "🔍 Testing $env_name environment: $base_url"
    
    local failed=0
    
    # Test health endpoint
    test_api_endpoint "$base_url" "/api/health" || failed=1
    
    # Test microservices
    test_api_endpoint "$base_url" "/api/inventory" || failed=1
    test_api_endpoint "$base_url" "/api/users/current" || failed=1
    test_api_endpoint "$base_url" "/api/orders" || failed=1
    test_api_endpoint "$base_url" "/api/reviews" || failed=1
    test_api_endpoint "$base_url" "/api/ratings" || failed=1
    
    # Test dashboard aggregation
    test_api_endpoint "$base_url" "/api/dashboard" || failed=1
    
    if [ $failed -eq 0 ]; then
        echo "   ✅ All tests passed for $env_name"
    else
        echo "   ❌ Some tests failed for $env_name"
    fi
    
    return $failed
}

# Test different environments
echo "🏁 Starting environment tests..."

# Development (local)
if curl -f http://localhost:3001/health >/dev/null 2>&1; then
    test_environment "Development" "http://localhost:3001"
else
    echo "⚠️  Development environment not running locally"
    echo "   Start with: ./scripts/local-dev.sh"
fi

# Staging (if accessible)
if [ -n "$STAGING_URL" ]; then
    test_environment "Staging" "$STAGING_URL"
else
    echo "⚠️  Staging URL not provided (set STAGING_URL environment variable)"
fi

# Production (if accessible)
if [ -n "$PRODUCTION_URL" ]; then
    test_environment "Production" "$PRODUCTION_URL"
else
    echo "⚠️  Production URL not provided (set PRODUCTION_URL environment variable)"
fi

echo ""
echo "🎯 Load Testing (if wrk is available)..."
if command -v wrk >/dev/null 2>&1; then
    if curl -f http://localhost:3001/health >/dev/null 2>&1; then
        echo "   Running 30-second load test on inventory endpoint..."
        wrk -t4 -c10 -d30s --header "x-user: allowed-user" http://localhost:3001/api/inventory
    fi
else
    echo "   wrk not available - skipping load tests"
    echo "   Install wrk for load testing: https://github.com/wg/wrk"
fi

echo ""
echo "🏆 Environment testing completed!"
echo ""
echo "📋 Summary:"
echo "   • Development: Local Docker Compose"
echo "   • Staging: Kubernetes with Istio (canary deployments)"
echo "   • Production: Kubernetes with Istio (high availability)"
echo ""
echo "🔧 Troubleshooting:"
echo "   • Check service logs: docker-compose logs [service-name]"
echo "   • Check Kubernetes pods: kubectl get pods -n [namespace]"
echo "   • Check Helm status: helm status stock-app -n [namespace]"