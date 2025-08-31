#!/bin/bash

set -e

echo "🚀 Starting Stock Management App for local development..."

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose >/dev/null 2>&1; then
    echo "❌ docker-compose is not installed. Please install Docker Desktop which includes docker-compose."
    exit 1
fi

echo "🧹 Cleaning up any existing containers..."
docker-compose down --remove-orphans

echo "🏗️  Building and starting services..."
docker-compose up --build -d

echo "⏳ Waiting for services to be ready..."

# Wait for API Gateway to be healthy
echo "   Waiting for API Gateway..."
timeout=60
counter=0
while ! curl -f http://localhost:3001/health >/dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        echo "❌ API Gateway failed to start within $timeout seconds"
        echo "📋 Service logs:"
        docker-compose logs api-gateway
        exit 1
    fi
    sleep 2
    counter=$((counter + 2))
    echo -n "."
done

echo ""
echo "✅ All services are ready!"

echo ""
echo "🌐 Application URLs:"
echo "   • Frontend:     http://localhost:3000"
echo "   • API Gateway:  http://localhost:3001"
echo "   • Health Check: http://localhost:3001/health"

echo ""
echo "🔍 Service Status:"
docker-compose ps

echo ""
echo "📊 Quick API Tests:"
echo "   • Inventory: curl http://localhost:3001/api/inventory"
echo "   • Users:     curl http://localhost:3001/api/users/current"
echo "   • Orders:    curl http://localhost:3001/api/orders"
echo "   • Reviews:   curl http://localhost:3001/api/reviews"
echo "   • Ratings:   curl http://localhost:3001/api/ratings"

echo ""
echo "📝 To view logs:"
echo "   docker-compose logs -f [service-name]"
echo ""
echo "🛑 To stop all services:"
echo "   docker-compose down"

echo ""
echo "🎉 Local development environment is ready!"
echo "   Open http://localhost:3000 in your browser to start using the application."