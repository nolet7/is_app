#!/bin/bash

set -e

# Script to build and push Docker images for all services
# Usage: ./scripts/build-and-push.sh [tag] [registry]
# Example: ./scripts/build-and-push.sh v1.2.3 docker.io/noletengine

TAG=${1:-"latest"}
REGISTRY=${2:-"docker.io/noletengine"}

echo "🏗️  Building and pushing Docker images..."
echo "   Registry: $REGISTRY"
echo "   Tag: $TAG"

# Services to build
SERVICES=(
    "frontend:Dockerfile.frontend"
    "stock-api-gateway:api-gateway/Dockerfile"
    "stock-orders:services/orders/Dockerfile"
    "stock-inventory:services/inventory/Dockerfile"
    "stock-users:services/users/Dockerfile"
    "stock-reviews:services/reviews/Dockerfile"
    "stock-ratings:services/ratings/Dockerfile"
)

# Build and push each service
for service_info in "${SERVICES[@]}"; do
    IFS=':' read -r service_name dockerfile_path <<< "$service_info"
    
    echo ""
    echo "📦 Building $service_name..."
    
    # Determine build context
    if [[ "$service_name" == "frontend" ]]; then
        build_context="."
    elif [[ "$service_name" == "stock-api-gateway" ]]; then
        build_context="./api-gateway"
    else
        build_context="./services/${service_name#stock-}"
    fi
    
    # Build image
    docker build -t "$REGISTRY/$service_name:$TAG" -f "$dockerfile_path" "$build_context"
    
    # Also tag as latest if not already latest
    if [[ "$TAG" != "latest" ]]; then
        docker tag "$REGISTRY/$service_name:$TAG" "$REGISTRY/$service_name:latest"
    fi
    
    echo "✅ Built $service_name"
done

echo ""
echo "🚀 Pushing images to registry..."

# Push all images
for service_info in "${SERVICES[@]}"; do
    IFS=':' read -r service_name dockerfile_path <<< "$service_info"
    
    echo "📤 Pushing $REGISTRY/$service_name:$TAG..."
    docker push "$REGISTRY/$service_name:$TAG"
    
    if [[ "$TAG" != "latest" ]]; then
        echo "📤 Pushing $REGISTRY/$service_name:latest..."
        docker push "$REGISTRY/$service_name:latest"
    fi
    
    echo "✅ Pushed $service_name"
done

echo ""
echo "🎉 All images built and pushed successfully!"
echo ""
echo "📋 Built images:"
for service_info in "${SERVICES[@]}"; do
    IFS=':' read -r service_name dockerfile_path <<< "$service_info"
    echo "   • $REGISTRY/$service_name:$TAG"
done

echo ""
echo "🔄 Next steps:"
echo "   1. Deploy to development:"
echo "      ./scripts/deploy-helm.sh dev dev-namespace $TAG"
echo ""
echo "   2. Deploy to staging:"
echo "      ./scripts/deploy-helm.sh stage staging $TAG"
echo ""
echo "   3. Deploy to production:"
echo "      ./scripts/deploy-helm.sh prod production $TAG"