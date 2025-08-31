const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://frontend:80'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user']
}));

app.use(express.json());

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'api-gateway',
    timestamp: new Date().toISOString()
  });
});

// Service endpoints configuration
const services = {
  orders: process.env.ORDERS_SERVICE_URL || 'http://orders-service:5001',
  inventory: process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:5002',
  users: process.env.USERS_SERVICE_URL || 'http://users-service:5003',
  reviews: process.env.REVIEWS_SERVICE_URL || 'http://reviews-service:5004',
  ratings: process.env.RATINGS_SERVICE_URL || 'http://ratings-service:5005'
};

// Create proxy middleware for each service
Object.keys(services).forEach(serviceName => {
  app.use(`/api/${serviceName}`, createProxyMiddleware({
    target: services[serviceName],
    changeOrigin: true,
    pathRewrite: {
      [`^/api/${serviceName}`]: `/${serviceName}`
    },
    onProxyReq: (proxyReq, req, res) => {
      // Forward the x-user header for Istio authorization
      if (req.headers['x-user']) {
        proxyReq.setHeader('x-user', req.headers['x-user']);
      }
    },
    onError: (err, req, res) => {
      console.error(`Proxy error for ${serviceName}:`, err.message);
      res.status(500).json({
        error: 'Service unavailable',
        service: serviceName,
        message: err.message
      });
    }
  }));
});

// Aggregate endpoint that calls all services
app.get('/api/all', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    
    const promises = Object.keys(services).map(async (serviceName) => {
      try {
        const response = await fetch(`${services[serviceName]}/${serviceName}`, {
          headers: {
            'x-user': req.headers['x-user'] || 'default-user',
            'Content-Type': 'application/json'
          },
          timeout: 5000
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        return {
          service: serviceName,
          error: error.message,
          version: 'error'
        };
      }
    });
    
    const results = await Promise.all(promises);
    
    res.json({
      gateway: 'api-gateway',
      timestamp: new Date().toISOString(),
      services: results
    });
  } catch (error) {
    console.error('Error in aggregate endpoint:', error);
    res.status(500).json({
      error: 'Failed to fetch services',
      message: error.message
    });
  }
});

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log('Service endpoints:', services);
});