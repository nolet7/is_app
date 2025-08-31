#!/bin/bash

set -e

# Script to deploy the stock-app using Helm with environment-specific configurations
# Usage: ./scripts/deploy-helm.sh <environment> <namespace> [image-tag]
# Example: ./scripts/deploy-helm.sh prod production v1.2.3

ENVIRONMENT=${1:-"dev"}
NAMESPACE=${2:-"stock-app-$ENVIRONMENT"}
IMAGE_TAG=${3:-"latest"}

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|stage|prod)$ ]]; then
    echo "Error: Environment must be one of: dev, stage, prod"
    echo "Usage: $0 <environment> <namespace> [image-tag]"
    exit 1
fi

echo "🚀 Deploying Stock Management App to $ENVIRONMENT environment"
echo "   Namespace: $NAMESPACE"
echo "   Image Tag: $IMAGE_TAG"
echo "   Environment: $ENVIRONMENT"

# Create namespace if it doesn't exist
echo "📦 Creating namespace: $NAMESPACE"
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Label namespace for Istio injection (except dev)
if [[ "$ENVIRONMENT" != "dev" ]]; then
    echo "🔧 Enabling Istio sidecar injection for namespace: $NAMESPACE"
    kubectl label namespace $NAMESPACE istio-injection=enabled --overwrite
fi

# Determine values file
VALUES_FILE="charts/stock-app/values.yaml"
if [[ "$ENVIRONMENT" == "stage" ]]; then
    VALUES_FILE="charts/stock-app/values-stage.yaml"
elif [[ "$ENVIRONMENT" == "prod" ]]; then
    VALUES_FILE="charts/stock-app/values-prod.yaml"
elif [[ "$ENVIRONMENT" == "dev" ]]; then
    VALUES_FILE="charts/stock-app/values-dev.yaml"
fi

echo "📋 Using values file: $VALUES_FILE"

# Deploy with Helm
echo "🎯 Deploying Helm chart..."
helm upgrade --install stock-app ./charts/stock-app \
    -f $VALUES_FILE \
    --set global.imageTag=$IMAGE_TAG \
    --set global.env=$ENVIRONMENT \
    --namespace $NAMESPACE \
    --timeout 10m \
    --wait

echo "✅ Deployment completed successfully!"

# Show deployment status
echo ""
echo "📊 Deployment Status:"
kubectl get pods -n $NAMESPACE -l app.kubernetes.io/name=stock-app
echo ""
kubectl get services -n $NAMESPACE -l app.kubernetes.io/name=stock-app
echo ""

# Show ingress information if enabled
if kubectl get ingress -n $NAMESPACE &>/dev/null; then
    echo "🌐 Ingress Information:"
    kubectl get ingress -n $NAMESPACE
    echo ""
fi

# Environment-specific post-deployment instructions
case $ENVIRONMENT in
    "dev")
        echo "🔧 Development Environment Ready!"
        echo "   • Port forward to access locally:"
        echo "     kubectl port-forward svc/stock-app-frontend-service 8080:80 -n $NAMESPACE"
        echo "   • Access at: http://localhost:8080"
        ;;
    "stage")
        echo "🧪 Staging Environment Ready!"
        echo "   • Istio features enabled for testing"
        echo "   • Monitoring and observability active"
        echo "   • Access at: https://stock-app-staging.yourcompany.com"
        ;;
    "prod")
        echo "🚀 Production Environment Ready!"
        echo "   • High availability configuration active"
        echo "   • Auto-scaling enabled"
        echo "   • Full monitoring and alerting active"
        echo "   • Access at: https://stock-app.yourcompany.com"
        ;;
esac

echo ""
echo "🔍 To check deployment status:"
echo "   helm status stock-app -n $NAMESPACE"
echo ""
echo "🗑️  To uninstall:"
echo "   helm uninstall stock-app -n $NAMESPACE"