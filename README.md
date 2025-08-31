# Stock Management & Reviews App

A production-ready microservices application for managing product inventory, orders, user profiles, reviews, and ratings. Built with modern technologies and designed for deployment with Docker Compose or Kubernetes.

## Architecture Overview

This application demonstrates a complete microservices architecture with:

- **Frontend**: React + Tailwind CSS served by NGINX
- **API Gateway**: Node.js/Express gateway for service orchestration  
- **Microservices**: Five independent services with v1/v2 versions
- **Service Mesh Ready**: Designed for Istio traffic management and security

## Services

### Frontend
- **Technology**: React 18 + TypeScript + Tailwind CSS
- **Features**: Product catalog, order placement, review submission, user dashboard
- **Deployment**: NGINX container serving static assets

### API Gateway
- **Technology**: Node.js + Express
- **Purpose**: Central routing and request orchestration
- **Features**: CORS handling, request logging, error handling
- **Port**: 3001

### Microservices

#### 1. Inventory Service
- **Purpose**: Manages product catalog and stock levels
- **Technology**: Python + Flask
- **Port**: 5002
- **Endpoints**:
  - `GET /inventory` - List all products
  - `GET /inventory/{id}` - Get specific product
- **v1 vs v2**: v2 includes warehouse location and reserved stock info

#### 2. Orders Service  
- **Purpose**: Handles order creation and management
- **Technology**: Python + Flask
- **Port**: 5001
- **Endpoints**:
  - `POST /orders` - Create new order
  - `GET /orders` - List orders
  - `GET /orders/{id}` - Get specific order
- **v1 vs v2**: v2 includes priority, tracking, and shipping method

#### 3. Users Service
- **Purpose**: Manages user profiles and authentication data
- **Technology**: Python + Flask  
- **Port**: 5003
- **Endpoints**:
  - `GET /users/current` - Get current user profile
  - `GET /users/{id}` - Get specific user
- **v1 vs v2**: v2 includes preferences, loyalty points, and addresses

#### 4. Reviews Service
- **Purpose**: Handles product reviews and feedback
- **Technology**: Python + Flask
- **Port**: 5004  
- **Endpoints**:
  - `GET /reviews/{productId}` - Get product reviews
  - `POST /reviews` - Submit new review
  - `GET /reviews` - Get all reviews
- **Versions**: 
  - v1: Basic reviews with rating and comment
  - v2: Adds helpful votes and sentiment analysis
  - v3: Includes AI summaries and moderation features

#### 5. Ratings Service
- **Purpose**: Aggregates ratings and provides analytics
- **Technology**: Python + Flask
- **Port**: 5005
- **Endpoints**:
  - `GET /ratings/{productId}` - Get product rating data
  - `GET /ratings` - Get all ratings overview
- **v1 vs v2**: v2 includes sentiment analysis and trending data

## Quick Start

### Option 1: Docker Compose (Recommended for Development)

1. **Clone and navigate to the project**:
   ```bash
   git clone <repository-url>
   cd stock-management-app
   ```

2. **Build and start all services**:
   ```bash
   docker-compose up --build
   ```

3. **Access the application**:
   - **Frontend**: http://localhost:3000
   - **API Gateway**: http://localhost:3001
   - **Health Check**: http://localhost:3001/health

4. **Test the application**:
   - Browse products in the web interface
   - Place orders by clicking "Order" buttons
   - Submit reviews using the "+" button on product cards
   - View real-time stock updates and ratings

### Option 2: Local Development

1. **Start the API Gateway**:
   ```bash
   cd api-gateway
   npm install
   npm start
   ```

2. **Start each microservice** (in separate terminals):
   ```bash
   # Inventory Service
   cd services/inventory
   pip install -r requirements.txt
   python app.py

   # Orders Service  
   cd services/orders
   pip install -r requirements.txt
   python app.py

   # Users Service
   cd services/users
   pip install -r requirements.txt
   python app.py

   # Reviews Service
   cd services/reviews
   pip install -r requirements.txt
   python app.py

   # Ratings Service
   cd services/ratings
   pip install -r requirements.txt
   python app.py
   ```

3. **Start the frontend**:
   ```bash
   npm install
   npm run dev
   ```

## API Testing

### Test Individual Services

**Inventory Service**:
```bash
# Get all products
curl http://localhost:3001/api/inventory

# Get specific product
curl http://localhost:3001/api/inventory/LAP-001
```

**Orders Service**:
```bash
# Create an order
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{"productId": "LAP-001", "quantity": 1, "userId": "usr-001"}'

# Get all orders
curl http://localhost:3001/api/orders
```

**Users Service**:
```bash
# Get current user
curl http://localhost:3001/api/users/current

# Get specific user
curl http://localhost:3001/api/users/usr-001
```

**Reviews Service**:
```bash
# Get product reviews
curl http://localhost:3001/api/reviews/LAP-001

# Submit a review
curl -X POST http://localhost:3001/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"productId": "LAP-001", "rating": 5, "comment": "Great product!", "userId": "usr-001"}'
```

**Ratings Service**:
```bash
# Get product ratings
curl http://localhost:3001/api/ratings/LAP-001

# Get all ratings overview
curl http://localhost:3001/api/ratings
```

### Test Version Routing

Each service supports multiple versions. You can test version routing by observing the `version` field in responses:

```bash
# Multiple calls will show different versions (v1/v2 distribution)
for i in {1..10}; do
  curl -s http://localhost:3001/api/inventory | jq -r '.version'
done
```

## Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (1.24+)
- kubectl configured
- Docker registry access

### Deployment Steps

1. **Build and push images**:
   ```bash
   # Build all images
   docker-compose build

   # Tag for your registry
   docker tag stock-management-app_frontend your-registry.com/stock-frontend:latest
   docker tag stock-management-app_api-gateway your-registry.com/stock-api-gateway:latest
   docker tag stock-management-app_inventory-v1 your-registry.com/stock-inventory:latest
   docker tag stock-management-app_orders-v1 your-registry.com/stock-orders:latest
   docker tag stock-management-app_users-v1 your-registry.com/stock-users:latest
   docker tag stock-management-app_reviews-v1 your-registry.com/stock-reviews:latest
   docker tag stock-management-app_ratings-v1 your-registry.com/stock-ratings:latest

   # Push to registry
   docker push your-registry.com/stock-frontend:latest
   docker push your-registry.com/stock-api-gateway:latest
   docker push your-registry.com/stock-inventory:latest
   docker push your-registry.com/stock-orders:latest
   docker push your-registry.com/stock-users:latest
   docker push your-registry.com/stock-reviews:latest
   docker push your-registry.com/stock-ratings:latest
   ```

2. **Update image references** in `k8s/deployments/*.yaml` files to use your registry.

3. **Deploy to Kubernetes**:
   ```bash
   # Create namespace
   kubectl create namespace stock-app

   # Deploy services
   kubectl apply -f k8s/deployments/ -n stock-app

   # Wait for deployments
   kubectl wait --for=condition=available --timeout=300s deployment --all -n stock-app
   ```

4. **Access the application**:
   ```bash
   # Port forward for testing
   kubectl port-forward svc/frontend-service 8080:80 -n stock-app
   
   # Access at http://localhost:8080
   ```

## Production Features

### Frontend Features
- **Product Catalog**: Browse products with search and filtering
- **Order Management**: Place orders with quantity selection
- **Review System**: Submit and view product reviews with star ratings
- **User Dashboard**: View user profile and statistics
- **Real-time Updates**: Live stock updates and notifications
- **Responsive Design**: Optimized for desktop and mobile

### Backend Features
- **Service Versioning**: Each service supports v1/v2 (reviews also has v3)
- **Health Checks**: All services provide health endpoints
- **Error Handling**: Comprehensive error responses
- **Request Logging**: Detailed request/response logging
- **CORS Support**: Proper cross-origin resource sharing

### Production Considerations
- **Security**: Ready for mTLS and authorization policies
- **Monitoring**: Structured logging and health endpoints
- **Scalability**: Stateless services with horizontal scaling support
- **Resilience**: Error handling and graceful degradation
- **Performance**: Optimized Docker images and NGINX configuration

## Istio Integration

This application is designed to work seamlessly with Istio service mesh:

### Traffic Management
- **A/B Testing**: Route traffic between service versions
- **Canary Deployments**: Gradual rollout of new versions
- **Feature Flags**: Route to specific versions based on headers
- **Load Balancing**: Distribute traffic across service instances

### Security
- **mTLS**: Automatic mutual TLS between services
- **Authorization**: Policy-based access control
- **Authentication**: JWT token validation
- **Network Policies**: Zero-trust networking

### Observability  
- **Distributed Tracing**: Request flow across services
- **Metrics Collection**: Performance and business metrics
- **Service Topology**: Visual service dependency mapping
- **Health Monitoring**: Automated health checks and alerting

## Development

### Adding New Features
1. Update the relevant service in `services/`
2. Modify the API gateway routing in `api-gateway/app.js`
3. Update the frontend components in `src/`
4. Test with Docker Compose
5. Update Kubernetes manifests if needed

### Testing Service Versions
- Modify the traffic split logic in the API gateway
- Use headers like `x-canary: true` to test specific versions
- Observe version responses in the frontend dashboard

### Debugging
- Check service logs: `docker-compose logs <service-name>`
- Test individual services: Use curl commands from the API Testing section
- Monitor health endpoints: `curl http://localhost:3001/health`

## Monitoring and Observability

### Application Metrics
- Product catalog performance
- Order completion rates  
- Review submission success
- User engagement metrics
- Service response times

### Technical Metrics
- Service health status
- API gateway throughput
- Database connection pools
- Memory and CPU usage
- Network latency between services

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is provided as-is for demonstration and educational purposes.