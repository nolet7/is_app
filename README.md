# Stock Management & Reviews App

A production-ready microservices application for managing product inventory, orders, user profiles, reviews, and ratings. Built with modern technologies and designed for deployment with Docker Compose or Kubernetes.

## Architecture Overview

This application follows a microservices architecture pattern with clear separation of concerns and service boundaries. The system is designed for scalability, maintainability, and cloud-native deployment.

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Browser   │───▶│  Load Balancer  │───▶│   NGINX Proxy   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React)                             │
│  • Product Catalog  • Order Management  • Review System        │
│  • User Dashboard   • Search & Filter   • Real-time Updates    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   API Gateway (Node.js)                        │
│  • Request Routing    • Response Aggregation                   │
│  • Authentication    • Rate Limiting                           │
│  • CORS Handling     • Error Management                        │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
    │ Inventory (v1/v2)│ │  Orders (v1/v2) │ │  Users (v1/v2)  │
    │ Python + Flask  │ │ Python + Flask  │ │ Python + Flask  │
    │ Port: 5002      │ │ Port: 5001      │ │ Port: 5003      │
    └─────────────────┘ └─────────────────┘ └─────────────────┘
                ▼               ▼
    ┌─────────────────┐ ┌─────────────────┐
    │Reviews (v1/v2/v3)│ │Ratings (v1/v2)  │
    │ Python + Flask  │ │ Python + Flask  │
    │ Port: 5004      │ │ Port: 5005      │
    └─────────────────┘ └─────────────────┘
```

### Service Responsibilities

#### Frontend Layer
- **Technology**: React 18 + TypeScript + Tailwind CSS
- **Deployment**: NGINX container serving static assets
- **Responsibilities**:
  - User interface and experience
  - Client-side routing and state management
  - API consumption and data presentation
  - Real-time updates and notifications

#### API Gateway
- **Technology**: Node.js + Express
- **Port**: 3001
- **Responsibilities**:
  - Central entry point for all API requests
  - Request routing to appropriate microservices
  - Response aggregation and transformation
  - Cross-cutting concerns (CORS, logging, authentication)
  - Load balancing and failover logic

#### Microservices

**Inventory Service**
- **Technology**: Python + Flask
- **Port**: 5002
- **Database**: In-memory (production would use PostgreSQL/MongoDB)
- **Responsibilities**:
  - Product catalog management
  - Stock level tracking
  - Inventory updates and reservations
  - Product search and filtering
- **Versions**:
  - v1: Basic product data
  - v2: Enhanced with warehouse location and reserved stock

**Orders Service**
- **Technology**: Python + Flask
- **Port**: 5001
- **Database**: In-memory (production would use PostgreSQL)
- **Responsibilities**:
  - Order creation and processing
  - Order status tracking
  - Payment processing integration
  - Order history management
- **Versions**:
  - v1: Basic order functionality
  - v2: Enhanced with priority, tracking, and shipping options

**Users Service**
- **Technology**: Python + Flask
- **Port**: 5003
- **Database**: In-memory (production would use PostgreSQL)
- **Responsibilities**:
  - User profile management
  - Authentication and authorization
  - User preferences and settings
  - Loyalty program management
- **Versions**:
  - v1: Basic user profile
  - v2: Enhanced with preferences, loyalty points, and addresses

**Reviews Service**
- **Technology**: Python + Flask
- **Port**: 5004
- **Database**: In-memory (production would use PostgreSQL)
- **Responsibilities**:
  - Product review management
  - Review moderation and validation
  - Sentiment analysis
  - Review aggregation
- **Versions**:
  - v1: Basic reviews with rating and comment
  - v2: Enhanced with helpful votes and sentiment analysis
  - v3: AI-powered features with summaries and moderation

**Ratings Service**
- **Technology**: Python + Flask
- **Port**: 5005
- **Database**: In-memory (production would use PostgreSQL)
- **Responsibilities**:
  - Rating calculation and aggregation
  - Statistical analysis of ratings
  - Trending and analytics
  - Rating distribution tracking
- **Versions**:
  - v1: Basic rating aggregation
  - v2: Enhanced analytics with sentiment and trending data

### Data Flow

1. **User Interaction**: User interacts with React frontend
2. **API Request**: Frontend sends request to API Gateway
3. **Service Routing**: Gateway routes request to appropriate microservice
4. **Service Processing**: Microservice processes request and returns data
5. **Response Aggregation**: Gateway aggregates responses if needed
6. **Frontend Update**: Frontend receives data and updates UI

### Communication Patterns

- **Synchronous**: HTTP/REST for real-time operations
- **Request/Response**: All service interactions use request/response pattern
- **Gateway Pattern**: Centralized API gateway for external communication
- **Service Discovery**: Services communicate via container names in Docker/K8s

### Scalability Considerations

- **Horizontal Scaling**: Each service can be scaled independently
- **Load Balancing**: API Gateway distributes load across service instances
- **Caching**: Frontend implements client-side caching for performance
- **Database Separation**: Each service has its own data store (simulated)

### Security Architecture

- **API Gateway Security**: Central point for authentication and authorization
- **Service-to-Service**: Internal communication secured via network policies
- **Input Validation**: Each service validates incoming requests
- **Error Handling**: Comprehensive error responses without sensitive data exposure

### Deployment Architecture

#### Docker Compose (Development)
- Single-host deployment with container networking
- Shared network for service communication
- Volume mounts for development hot-reloading
- Environment-based configuration

#### Kubernetes (Production)
- Multi-node deployment with pod distribution
- Service discovery via Kubernetes DNS
- ConfigMaps and Secrets for configuration
- Ingress controllers for external access
- Health checks and readiness probes

### Monitoring and Observability

- **Health Checks**: All services provide `/health` endpoints
- **Logging**: Structured logging with request correlation
- **Metrics**: Response time and error rate tracking
- **Tracing**: Request flow tracking across services (ready for distributed tracing)

### Future Enhancements (Istio Integration)

This architecture is designed to seamlessly integrate with Istio service mesh:

- **Traffic Management**: A/B testing, canary deployments, traffic splitting
- **Security**: mTLS, authorization policies, JWT validation
- **Observability**: Distributed tracing, metrics collection, service topology
- **Resilience**: Circuit breaking, retries, timeout policies, fault injection

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