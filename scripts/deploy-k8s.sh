#!/bin/bash

set -e

NAMESPACE=${1:-"default"}

echo "Deploying Istio microservices demo to Kubernetes namespace: $NAMESPACE"

# Create namespace if it doesn't exist
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Enable Istio sidecar injection
kubectl label namespace $NAMESPACE istio-injection=enabled --overwrite

echo "Deploying services..."
kubectl apply -n $NAMESPACE -f k8s/deployments/

echo "Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment --all -n $NAMESPACE

echo "Deploying Istio configurations..."
kubectl apply -n $NAMESPACE -f k8s/istio/

echo "Deployment complete!"

echo "Getting service information..."
kubectl get pods -n $NAMESPACE
kubectl get services -n $NAMESPACE

echo ""
echo "To access the application:"
echo "1. Get the ingress gateway external IP:"
echo "   kubectl get svc istio-ingressgateway -n istio-system"
echo ""
echo "2. Access the frontend at: http://<EXTERNAL-IP>/"
echo ""
echo "3. To test Istio features, check the README.md for detailed instructions"