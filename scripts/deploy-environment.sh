#!/bin/bash

set -e

# Environment-specific deployment script
# Usage: ./scripts/deploy-environment.sh <environment> [namespace] [image-tag]
# Example: ./scripts/deploy-environment.sh dev
# Example: ./scripts/deploy-environment.sh stage staging v1.2.3
# Example: ./scripts/deploy-environment.sh prod production v1.2.3

ENVIRONMENT=${1:-"dev"}
NAMESPACE=${2:-"stock-app-$ENVIRONMENT"}
IMAGE_TAG=${3:-"latest"}

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|stage|prod)$ ]]; then
    echo "Error: Environment must be one of: dev, stage, prod"
    echo "Usage: $0 <environment> [namespace] [image-tag]"
    exit 1
fi

echo "🚀 Deploying Stock Management App to $ENVIRONMENT environment"
echo "   Namespace: $NAMESPACE"
echo "   Image Tag: $IMAGE_TAG"

# Create namespace if it doesn't exist
echo "📦 Creating namespace: $NAMESPACE"
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Label namespace for Istio injection (except dev)
if [[ "$ENVIRONMENT" != "dev" ]]; then
    echo "🔧 Enabling Istio sidecar injection for namespace: $NAMESPACE"
    kubectl label namespace $NAMESPACE istio-injection=enabled --overwrite
fi

# Set environment-specific variables
case $ENVIRONMENT in
    "dev")
        export IMAGE_REGISTRY="docker.io/noletengine"
        export NODE_ENV="development"
        export FRONTEND_REPLICAS=1
        export API_GATEWAY_REPLICAS=1
        export SERVICE_REPLICAS=1
        export FRONTEND_MEMORY_REQUEST="64Mi"
        export FRONTEND_CPU_REQUEST="50m"
        export FRONTEND_MEMORY_LIMIT="128Mi"
        export FRONTEND_CPU_LIMIT="100m"
        export API_GATEWAY_MEMORY_REQUEST="128Mi"
        export API_GATEWAY_CPU_REQUEST="100m"
        export API_GATEWAY_MEMORY_LIMIT="256Mi"
        export API_GATEWAY_CPU_LIMIT="200m"
        export SERVICE_MEMORY_REQUEST="64Mi"
        export SERVICE_CPU_REQUEST="50m"
        export SERVICE_MEMORY_LIMIT="128Mi"
        export SERVICE_CPU_LIMIT="100m"
        export LIVENESS_DELAY=15
        export READINESS_DELAY=5
        ;;
    "stage")
        export IMAGE_REGISTRY="docker.io/noletengine"
        export NODE_ENV="staging"
        export FRONTEND_REPLICAS=2
        export API_GATEWAY_REPLICAS=2
        export SERVICE_REPLICAS=2
        export FRONTEND_MEMORY_REQUEST="128Mi"
        export FRONTEND_CPU_REQUEST="100m"
        export FRONTEND_MEMORY_LIMIT="256Mi"
        export FRONTEND_CPU_LIMIT="200m"
        export API_GATEWAY_MEMORY_REQUEST="256Mi"
        export API_GATEWAY_CPU_REQUEST="200m"
        export API_GATEWAY_MEMORY_LIMIT="512Mi"
        export API_GATEWAY_CPU_LIMIT="400m"
        export SERVICE_MEMORY_REQUEST="128Mi"
        export SERVICE_CPU_REQUEST="100m"
        export SERVICE_MEMORY_LIMIT="256Mi"
        export SERVICE_CPU_LIMIT="200m"
        export LIVENESS_DELAY=30
        export READINESS_DELAY=10
        ;;
    "prod")
        export IMAGE_REGISTRY="docker.io/noletengine"
        export NODE_ENV="production"
        export FRONTEND_REPLICAS=3
        export API_GATEWAY_REPLICAS=3
        export SERVICE_REPLICAS=3
        export FRONTEND_MEMORY_REQUEST="256Mi"
        export FRONTEND_CPU_REQUEST="200m"
        export FRONTEND_MEMORY_LIMIT="512Mi"
        export FRONTEND_CPU_LIMIT="500m"
        export API_GATEWAY_MEMORY_REQUEST="512Mi"
        export API_GATEWAY_CPU_REQUEST="500m"
        export API_GATEWAY_MEMORY_LIMIT="1Gi"
        export API_GATEWAY_CPU_LIMIT="1000m"
        export SERVICE_MEMORY_REQUEST="256Mi"
        export SERVICE_CPU_REQUEST="200m"
        export SERVICE_MEMORY_LIMIT="512Mi"
        export SERVICE_CPU_LIMIT="500m"
        export LIVENESS_DELAY=30
        export READINESS_DELAY=10
        ;;
esac

# Set common variables
export NAMESPACE
export ENVIRONMENT
export IMAGE_TAG

# Deploy services
echo "🔧 Deploying services..."
envsubst < k8s/deployments/services.yaml | kubectl apply -f -
envsubst < k8s/deployments/frontend.yaml | kubectl apply -f -
envsubst < k8s/deployments/api-gateway.yaml | kubectl apply -f -

# Deploy microservices with environment-specific configurations
for service in orders inventory users reviews ratings; do
    echo "   Deploying $service service..."
    envsubst < k8s/deployments/$service.yaml | kubectl apply -f -
done

# Deploy Istio configurations (only for stage and prod)
if [[ "$ENVIRONMENT" != "dev" ]]; then
    echo "🌐 Deploying Istio configurations..."
    envsubst < k8s/istio/gateway.yaml | kubectl apply -f -
    envsubst < k8s/istio/virtualservice.yaml | kubectl apply -f -
    envsubst < k8s/istio/destinationrule.yaml | kubectl apply -f -
    envsubst < k8s/istio/peerauthentication.yaml | kubectl apply -f -
    envsubst < k8s/istio/authorizationpolicy.yaml | kubectl apply -f -
fi

echo "⏳ Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment --all -n $NAMESPACE

echo "✅ Deployment completed successfully!"

# Show deployment status
echo ""
echo "📊 Deployment Status:"
kubectl get pods -n $NAMESPACE
echo ""
kubectl get services -n $NAMESPACE

# Environment-specific post-deployment instructions
case $ENVIRONMENT in
    "dev")
        echo ""
        echo "🔧 Development Environment Ready!"
        echo "   • Port forward to access locally:"
        echo "     kubectl port-forward svc/frontend-service 8080:80 -n $NAMESPACE"
        echo "   • Access at: http://localhost:8080"
        ;;
    "stage")
        echo ""
        echo "🧪 Staging Environment Ready!"
        echo "   • Istio features enabled for testing"
        echo "   • Multiple service versions deployed"
        echo "   • Get ingress IP: kubectl get svc istio-ingressgateway -n istio-system"
        ;;
    "prod")
        echo ""
        echo "🚀 Production Environment Ready!"
        echo "   • High availability configuration active"
        echo "   • Istio security policies enabled"
        echo "   • Get ingress IP: kubectl get svc istio-ingressgateway -n istio-system"
        ;;
esac

echo ""
echo "🔍 To check status:"
echo "   kubectl get all -n $NAMESPACE"
echo ""
echo "🗑️  To cleanup:"
echo "   kubectl delete namespace $NAMESPACE"