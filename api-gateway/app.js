const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Service URLs
const SERVICES = {
  inventory: process.env.INVENTORY_SERVICE_URL || 'http://inventory-v1:5002',
  orders: process.env.ORDERS_SERVICE_URL || 'http://orders-v1:5001',
  users: process.env.USERS_SERVICE_URL || 'http://users-v1:5003',
  reviews: process.env.REVIEWS_SERVICE_URL || 'http://reviews-v1:5004',
  ratings: process.env.RATINGS_SERVICE_URL || 'http://ratings-v1:5005'
};

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://frontend:80'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user', 'x-canary', 'x-feature-flag']
}));

app.use(express.json());

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'api-gateway',
    version: 'v1',
    timestamp: Date.now()
  });
});

// Helper function to make service requests
const callService = async (serviceUrl, path, method = 'GET', data = null) => {
  try {
    const config = {
      method,
      url: `${serviceUrl}${path}`,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      // Service responded with error status
      throw {
        status: error.response.status,
        message: error.response.data?.error || error.response.statusText,
        service: error.response.data?.service || 'unknown'
      };
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      // Service unavailable
      throw {
        status: 503,
        message: 'Service unavailable',
        service: serviceUrl.split('//')[1]?.split(':')[0] || 'unknown'
      };
    } else {
      // Other errors (timeout, etc.)
      throw {
        status: 500,
        message: error.message || 'Internal server error',
        service: 'api-gateway'
      };
    }
  }
};

// Inventory Service Routes
app.get('/api/inventory', async (req, res) => {
  try {
    const data = await callService(SERVICES.inventory, '/inventory');
    res.json(data);
  } catch (error) {
    console.error('Inventory service error:', error);
    res.status(error.status || 500).json({
      error: error.message,
      service: 'inventory',
      timestamp: Date.now()
    });
  }
});

app.get('/api/inventory/:productId', async (req, res) => {
  try {
    const data = await callService(SERVICES.inventory, `/inventory/${req.params.productId}`);
    res.json(data);
  } catch (error) {
    console.error('Inventory service error:', error);
    res.status(error.status || 500).json({
      error: error.message,
      service: 'inventory',
      timestamp: Date.now()
    });
  }
});

// Orders Service Routes
app.post('/api/orders', async (req, res) => {
  try {
    const data = await callService(SERVICES.orders, '/orders', 'POST', req.body);
    res.status(201).json(data);
  } catch (error) {
    console.error('Orders service error:', error);
    res.status(error.status || 500).json({
      error: error.message,
      service: 'orders',
      timestamp: Date.now()
    });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const data = await callService(SERVICES.orders, '/orders');
    res.json(data);
  } catch (error) {
    console.error('Orders service error:', error);
    res.status(error.status || 500).json({
      error: error.message,
      service: 'orders',
      timestamp: Date.now()
    });
  }
});

app.get('/api/orders/:orderId', async (req, res) => {
  try {
    const data = await callService(SERVICES.orders, `/orders/${req.params.orderId}`);
    res.json(data);
  } catch (error) {
    console.error('Orders service error:', error);
    res.status(error.status || 500).json({
      error: error.message,
      service: 'orders',
      timestamp: Date.now()
    });
  }
});

// Users Service Routes
app.get('/api/users/current', async (req, res) => {
  try {
    const data = await callService(SERVICES.users, '/users/current');
    res.json(data);
  } catch (error) {
    console.error('Users service error:', error);
    res.status(error.status || 500).json({
      error: error.message,
      service: 'users',
      timestamp: Date.now()
    });
  }
});

app.get('/api/users/:userId', async (req, res) => {
  try {
    const data = await callService(SERVICES.users, `/users/${req.params.userId}`);
    res.json(data);
  } catch (error) {
    console.error('Users service error:', error);
    res.status(error.status || 500).json({
      error: error.message,
      service: 'users',
      timestamp: Date.now()
    });
  }
});

// Reviews Service Routes
app.get('/api/reviews/:productId', async (req, res) => {
  try {
    const data = await callService(SERVICES.reviews, `/reviews/${req.params.productId}`);
    res.json(data);
  } catch (error) {
    console.error('Reviews service error:', error);
    res.status(error.status || 500).json({
      error: error.message,
      service: 'reviews',
      timestamp: Date.now()
    });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const data = await callService(SERVICES.reviews, '/reviews', 'POST', req.body);
    res.status(201).json(data);
  } catch (error) {
    console.error('Reviews service error:', error);
    res.status(error.status || 500).json({
      error: error.message,
      service: 'reviews',
      timestamp: Date.now()
    });
  }
});

app.get('/api/reviews', async (req, res) => {
  try {
    const data = await callService(SERVICES.reviews, '/reviews');
    res.json(data);
  } catch (error) {
    console.error('Reviews service error:', error);
    res.status(error.status || 500).json({
      error: error.message,
      service: 'reviews',
      timestamp: Date.now()
    });
  }
});

// Ratings Service Routes
app.get('/api/ratings/:productId', async (req, res) => {
  try {
    const data = await callService(SERVICES.ratings, `/ratings/${req.params.productId}`);
    res.json(data);
  } catch (error) {
    console.error('Ratings service error:', error);
    res.status(error.status || 500).json({
      error: error.message,
      service: 'ratings',
      timestamp: Date.now()
    });
  }
});

app.get('/api/ratings', async (req, res) => {
  try {
    const data = await callService(SERVICES.ratings, '/ratings');
    res.json(data);
  } catch (error) {
    console.error('Ratings service error:', error);
    res.status(error.status || 500).json({
      error: error.message,
      service: 'ratings',
      timestamp: Date.now()
    });
  }
});

// Aggregate endpoint for dashboard
app.get('/api/dashboard', async (req, res) => {
  try {
    // Fetch data from multiple services in parallel
    const [inventoryData, ratingsData] = await Promise.allSettled([
      callService(SERVICES.inventory, '/inventory'),
      callService(SERVICES.ratings, '/ratings')
    ]);

    const dashboard = {
      service: 'api-gateway',
      version: 'v1',
      timestamp: Date.now()
    };

    // Add inventory data if available
    if (inventoryData.status === 'fulfilled') {
      dashboard.inventory = {
        total_products: inventoryData.value.total_items || 0,
        total_stock: inventoryData.value.total_stock || 0
      };
    }

    // Add ratings data if available
    if (ratingsData.status === 'fulfilled') {
      dashboard.ratings = {
        average_rating: ratingsData.value.overall_stats?.average_rating || 0,
        total_reviews: ratingsData.value.overall_stats?.total_reviews || 0
      };
    }

    res.json(dashboard);
  } catch (error) {
    console.error('Dashboard aggregation error:', error);
    res.status(500).json({
      error: 'Failed to aggregate dashboard data',
      service: 'api-gateway',
      timestamp: Date.now()
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    service: 'api-gateway',
    message: err.message,
    timestamp: Date.now()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    service: 'api-gateway',
    path: req.originalUrl,
    timestamp: Date.now()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log('Service URLs:');
  Object.entries(SERVICES).forEach(([name, url]) => {
    console.log(`  ${name}: ${url}`);
  });
  console.log('Available endpoints:');
  console.log('  GET  /health');
  console.log('  GET  /api/inventory');
  console.log('  GET  /api/inventory/:productId');
  console.log('  POST /api/orders');
  console.log('  GET  /api/orders');
  console.log('  GET  /api/orders/:orderId');
  console.log('  GET  /api/users/current');
  console.log('  GET  /api/users/:userId');
  console.log('  GET  /api/reviews/:productId');
  console.log('  POST /api/reviews');
  console.log('  GET  /api/reviews');
  console.log('  GET  /api/ratings/:productId');
  console.log('  GET  /api/ratings');
  console.log('  GET  /api/dashboard');
});