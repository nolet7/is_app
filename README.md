# Istio Microservices Demo Application

A comprehensive microservices demonstration application designed to showcase Istio's traffic management and security features in a production-ready environment.

## Architecture Overview

This application consists of:

- **Frontend**: React-based dashboard served by NGINX
- **API Gateway**: Node.js/Express gateway for service orchestration
- **Backend Services**: Three microservices (orders, inventory, users) with v1/v2 versions
- **Istio Service Mesh**: Complete traffic management and security configuration

## Features

### Microservices
- **Orders Service**: Manages order data and processing (v1 & v2)
- **Inventory Service**: Tracks product stock and availability (v1 & v2)
- **Users Service**: Handles user profiles and data (v1 & v2)
- **Reviews Service**: Manages product reviews and feedback (v1, v2 & v3)
- **Ratings Service**: Aggregates ratings and analytics (v1 & v2)
- **API Gateway**: Routes frontend calls to backend services

### Istio Capabilities Demonstrated
- **Traffic Management**:
  - A/B testing with multiple versions (including v3 for reviews)
  - Canary deployments with header-based routing
  - Feature flag routing (`feature-flag: v3-enabled` for reviews v3)
  - Timeout policies (3s)
  - Retry mechanisms with per-try timeouts
  - Fault injection (delays and aborts)
  - Circuit breaking with outlier detection

- **Security**:
  - mTLS in STRICT mode for service-to-service communication
  - Authorization policies requiring `x-user: allowed-user` header
  - Peer authentication with service accounts

### New Service Features
- **Reviews Service**: Three versions (v1, v2, v3) demonstrating progressive feature rollouts
  - v1: Basic reviews with rating and content
  - v2: Enhanced with verification status, helpful votes, and sentiment analysis
  - v3: AI-powered features with summaries and moderation
- **Ratings Service**: Analytics and aggregated rating data with geographic breakdown

## Quick Start

### Option 1: Docker Compose (Local Development)

1. **Build and start all services**:
   ```bash
   docker-compose up --build
   ```

2. **Access the application**:
   - Frontend: http://localhost:3000
   - API Gateway: http://localhost:3001

3. **Test the services**:
   ```bash
   # Test with proper authorization header
   curl -H "x-user: allowed-user" http://localhost:3001/api/orders
   
   # Test without header (should work in Docker Compose)
   curl http://localhost:3001/api/inventory
   ```

4. **Test new services**:
   ```bash
   # Test reviews service (observe v1/v2/v3 routing)
   curl -H "x-user: allowed-user" http://localhost:3001/api/reviews
   
   # Test feature flag routing for reviews v3
   curl -H "x-user: allowed-user" -H "feature-flag: v3-enabled" http://localhost:3001/api/reviews
   
   # Test ratings service
   curl -H "x-user: allowed-user" http://localhost:3001/api/ratings
   ```

### Option 2: Kubernetes with Istio

#### Prerequisites
- Kubernetes cluster (1.24+)
- Istio installed and configured
- `kubectl` configured to access your cluster

#### Deployment Steps

1. **Build Docker images**:
   ```bash
   chmod +x scripts/build-images.sh
   ./scripts/build-images.sh
   ```

2. **Push images to your registry** (update with your registry):
   ```bash
   ./scripts/build-images.sh tag your-registry.com
   docker push your-registry.com/istio-demo-frontend:latest
   docker push your-registry.com/istio-demo-api-gateway:latest
   docker push your-registry.com/istio-demo-orders:latest
   docker push your-registry.com/istio-demo-inventory:latest
   docker push your-registry.com/istio-demo-users:latest
  docker push your-registry.com/istio-demo-reviews:latest
  docker push your-registry.com/istio-demo-ratings:latest
   ```

3. **Update image references** in `k8s/deployments/*.yaml` to use your registry.

4. **Deploy to Kubernetes**:
   ```bash
   chmod +x scripts/deploy-k8s.sh
   ./scripts/deploy-k8s.sh default
   ```

5. **Get the ingress gateway external IP**:
   ```bash
   kubectl get svc istio-ingressgateway -n istio-system
   ```

6. **Access the application**:
   ```
   http://<EXTERNAL-IP>/
   ```

## Testing Istio Features

### 1. Basic Traffic Management

**Test A/B routing** (observe different service versions):
```bash
# Multiple requests will show traffic split between v1 and v2
for i in {1..10}; do
  curl -s -H "x-user: allowed-user" http://<GATEWAY-URL>/api/inventory | jq -r '.version'
done
```

**Test canary deployment** (orders service):
```bash
# Normal request (goes to v1/v2 based on weight)
curl -H "x-user: allowed-user" http://<GATEWAY-URL>/api/orders

# Canary request (always goes to v2)
curl -H "x-user: allowed-user" -H "canary: true" http://<GATEWAY-URL>/api/orders
```

**Test multi-version routing** (reviews service):
```bash
# Normal requests (distributed across v1/v2/v3: 50%/40%/10%)
for i in {1..20}; do
  curl -s -H "x-user: allowed-user" http://<GATEWAY-URL>/api/reviews | jq -r '.version'
done

# Feature flag routing (always goes to v3)
curl -H "x-user: allowed-user" -H "feature-flag: v3-enabled" http://<GATEWAY-URL>/api/reviews
```

### 2. Fault Injection

The configuration includes:
- **Delays**: 10% of inventory requests delayed by 2s, 20% of reviews requests delayed by 1.5s
- **Aborts**: 5% of gateway requests return 503 errors
- **Timeouts**: Most services have 3s timeouts, ratings service has 2s timeout

**Test fault injection**:
```bash
# Run multiple requests to observe delays and failures
chmod +x scripts/test-istio-features.sh
./scripts/test-istio-features.sh http://<GATEWAY-URL>
```

### 3. Security Features

**Test authorization policies**:
```bash
# Should fail without proper header
curl http://<GATEWAY-URL>/api/users

# Should succeed with proper header
curl -H "x-user: allowed-user" http://<GATEWAY-URL>/api/users
```
# Test new services
curl -H "x-user: allowed-user" http://<GATEWAY-URL>/api/reviews
curl -H "x-user: allowed-user" http://<GATEWAY-URL>/api/ratings

**Verify mTLS**:
```bash
# Check if mTLS is working
kubectl exec -n default deployment/orders-v1 -- curl -s http://inventory-service:5002/health
```

### 4. Circuit Breaking

To test circuit breaking, you can simulate failures:

```bash
# Generate load to trigger circuit breaker
for i in {1..100}; do
  curl -H "x-user: allowed-user" http://<GATEWAY-URL>/api/orders &
done
```

## Monitoring and Observability

### View Istio Configurations
```bash
# Check virtual services
kubectl get vs -n default

# Check destination rules
kubectl get dr -n default

# Check authorization policies
kubectl get authorizationpolicy -n default

# Check peer authentication
kubectl get peerauthentication -n default
```

### Access Istio Dashboard
If you have Kiali installed:
```bash
kubectl port-forward svc/kiali 20001:20001 -n istio-system
# Access: http://localhost:20001
```

### Metrics and Tracing
If you have Grafana and Jaeger:
```bash
# Grafana
kubectl port-forward svc/grafana 3000:3000 -n istio-system

# Jaeger
kubectl port-forward svc/jaeger 16686:16686 -n istio-system
```

## Advanced Istio Scenarios

### Multi-Version Progressive Rollout (Reviews Service)

1. **Start with v1 only**:
   ```bash
   kubectl apply -f - <<EOF
   apiVersion: networking.istio.io/v1beta1
   kind: VirtualService
   metadata:
     name: reviews-vs
     namespace: default
   spec:
     hosts:
     - reviews-service
     http:
     - route:
       - destination:
           host: reviews-service
           subset: v1
         weight: 100
   EOF
   ```

2. **Gradually introduce v2**:
   ```bash
   # 20% v2
   kubectl patch vs reviews-vs -p '{"spec":{"http":[{"route":[{"destination":{"host":"reviews-service","subset":"v1"},"weight":80},{"destination":{"host":"reviews-service","subset":"v2"},"weight":20}]}]}}'
   
   # 50% v2
   kubectl patch vs reviews-vs -p '{"spec":{"http":[{"route":[{"destination":{"host":"reviews-service","subset":"v1"},"weight":50},{"destination":{"host":"reviews-service","subset":"v2"},"weight":50}]}]}}'
   ```

3. **Introduce v3 with feature flag**:
   ```bash
   kubectl apply -f - <<EOF
   apiVersion: networking.istio.io/v1beta1
   kind: VirtualService
   metadata:
     name: reviews-vs
     namespace: default
   spec:
     hosts:
     - reviews-service
     http:
     - match:
       - headers:
           feature-flag:
             exact: "v3-enabled"
       route:
       - destination:
           host: reviews-service
           subset: v3
     - route:
       - destination:
           host: reviews-service
           subset: v1
         weight: 40
       - destination:
           host: reviews-service
           subset: v2
         weight: 50
       - destination:
           host: reviews-service
           subset: v3
         weight: 10
   EOF
   ```

### Progressive Canary Rollout

1. **Start with 100% v1**:
   ```bash
   kubectl apply -f - <<EOF
   apiVersion: networking.istio.io/v1beta1
   kind: VirtualService
   metadata:
     name: orders-vs
     namespace: default
   spec:
     hosts:
     - orders-service
     http:
     - route:
       - destination:
           host: orders-service
           subset: v1
         weight: 100
   EOF
   ```

2. **Gradually increase v2 traffic**:
   ```bash
   # 10% v2
   kubectl patch vs orders-vs -p '{"spec":{"http":[{"route":[{"destination":{"host":"orders-service","subset":"v1"},"weight":90},{"destination":{"host":"orders-service","subset":"v2"},"weight":10}]}]}}'
   
   # 50% v2
   kubectl patch vs orders-vs -p '{"spec":{"http":[{"route":[{"destination":{"host":"orders-service","subset":"v1"},"weight":50},{"destination":{"host":"orders-service","subset":"v2"},"weight":50}]}]}}'
   
   # 100% v2
   kubectl patch vs orders-vs -p '{"spec":{"http":[{"route":[{"destination":{"host":"orders-service","subset":"v2"},"weight":100}]}]}}'
   ```

### Testing Circuit Breaker

1. **Generate load to trigger circuit breaker**:
   ```bash
   # Install hey load testing tool
   kubectl run hey --image=williamyeh/hey --rm -it --restart=Never -- \
     -z 60s -c 10 -H "x-user: allowed-user" \
     http://api-gateway-service:3001/api/orders
   ```

2. **Monitor circuit breaker status**:
   ```bash
   kubectl logs -l app=orders -c istio-proxy | grep "circuit_breakers"
   ```

## Customization

### Modify Traffic Splitting
Edit the `weight` values in `k8s/istio/virtualservice.yaml` to change traffic distribution.

### Adjust Circuit Breaker Settings
Modify the `circuitBreaker` section in `k8s/istio/destinationrule.yaml`.

### Change Fault Injection
Update the `fault` section in the VirtualService configurations.

### Add New Services
1. Create a new service directory under `services/`
2. Add Dockerfile and application code
3. Create Kubernetes deployment and service manifests
4. Add Istio VirtualService and DestinationRule
5. Update the API gateway routing
6. Add authorization policies for security
7. Update the frontend to display the new service data

## Troubleshooting

### Common Issues

1. **Services not accessible**:
   - Check if Istio sidecar injection is enabled: `kubectl get namespace -L istio-injection`
   - Verify all pods are running: `kubectl get pods`

2. **Authorization failures**:
   - Ensure the `x-user: allowed-user` header is included in requests
   - Check authorization policies: `kubectl get authorizationpolicy`

3. **mTLS issues**:
   - Verify peer authentication: `kubectl get peerauthentication`
   - Check if certificates are properly configured

4. **Circuit breaker not triggering**:
   - Increase load or reduce circuit breaker thresholds in DestinationRules

### Debugging Commands

```bash
# Check Istio proxy logs
kubectl logs -l app=orders -c istio-proxy

# Verify mTLS status
istioctl authn tls-check orders-v1.default.svc.cluster.local

# Check proxy configuration
istioctl proxy-config route <pod-name>

# View service mesh topology
istioctl proxy-config cluster <pod-name>
```

## Development

### Local Development
```bash
# Start services individually for development
cd frontend && npm run dev &
cd api-gateway && npm run dev &
cd services/orders && python app.py &
cd services/inventory && python app.py &
cd services/users && python app.py &
```

### Testing Changes
```bash
# Rebuild specific service
docker-compose up --build <service-name>

# Update Kubernetes deployment
kubectl rollout restart deployment/<deployment-name> -n default
```

## Production Considerations

- **Monitoring**: Integrate with Prometheus and Grafana for comprehensive metrics
- **Logging**: Configure centralized logging with ELK stack or similar
- **Security**: Review and harden authorization policies for production use
- **Scaling**: Adjust replica counts based on load requirements
- **Resource Limits**: Fine-tune CPU and memory limits based on actual usage
- **TLS Certificates**: Configure proper TLS certificates for production domains

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with both Docker Compose and Kubernetes
5. Submit a pull request

## License

This project is provided as-is for demonstration purposes. Use at your own discretion in production environments.