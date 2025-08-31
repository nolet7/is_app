#!/bin/bash

set -e

echo "Building Docker images for Istio microservices demo..."

# Build frontend
echo "Building frontend..."
docker build -t istio-demo/frontend:latest ./frontend

# Build API gateway
echo "Building API gateway..."
docker build -t istio-demo/api-gateway:latest ./api-gateway

# Build orders service
echo "Building orders service..."
docker build -t istio-demo/orders:latest ./services/orders

# Build inventory service
echo "Building inventory service..."
docker build -t istio-demo/inventory:latest ./services/inventory

# Build users service
echo "Building users service..."
docker build -t istio-demo/users:latest ./services/users

# Build reviews service
echo "Building reviews service..."
docker build -t istio-demo/reviews:latest ./services/reviews

# Build ratings service
echo "Building ratings service..."
docker build -t istio-demo/ratings:latest ./services/ratings

echo "All images built successfully!"

# Optional: Tag for registry push
if [ "$1" = "tag" ]; then
    REGISTRY=${2:-"your-registry.com"}
    echo "Tagging images for registry: $REGISTRY"
    
    docker tag istio-demo/frontend:latest $REGISTRY/istio-demo-frontend:latest
    docker tag istio-demo/api-gateway:latest $REGISTRY/istio-demo-api-gateway:latest
    docker tag istio-demo/orders:latest $REGISTRY/istio-demo-orders:latest
    docker tag istio-demo/inventory:latest $REGISTRY/istio-demo-inventory:latest
    docker tag istio-demo/users:latest $REGISTRY/istio-demo-users:latest
    docker tag istio-demo/reviews:latest $REGISTRY/istio-demo-reviews:latest
    docker tag istio-demo/ratings:latest $REGISTRY/istio-demo-ratings:latest
    
    echo "Images tagged for registry push!"
fi