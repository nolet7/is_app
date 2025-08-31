const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

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

// Simulate microservice responses with version routing
const simulateServiceCall = (serviceName, version = null) => {
  // Simulate version selection based on headers or random distribution
  let selectedVersion = version;
  if (!selectedVersion) {
    if (req.headers['x-canary'] === 'true') {
      selectedVersion = 'v2';
    } else {
      // Default traffic split: 70% v1, 30% v2
      selectedVersion = Math.random() < 0.7 ? 'v1' : 'v2';
    }
  }

  // Simulate response time
  const responseTime = Math.floor(Math.random() * 200) + 50;
  
  // Simulate occasional errors for testing
  if (Math.random() < 0.05) { // 5% error rate
    throw new Error('Service temporarily unavailable');
  }

  return {
    service: serviceName,
    version: selectedVersion,
    timestamp: Date.now(),
    responseTime
  };
};

// Inventory Service Endpoint
app.get('/api/inventory', (req, res) => {
  try {
    const serviceInfo = simulateServiceCall('inventory');
    
    const products = [
      {
        id: 'LAP-001',
        name: 'Gaming Laptop Pro',
        stock: 15,
        price: 1299.99,
        category: 'Electronics',
        description: 'High-performance gaming laptop with RTX 4070 and 32GB RAM'
      },
      {
        id: 'PHN-002',
        name: 'Smartphone X1',
        stock: 42,
        price: 899.00,
        category: 'Electronics',
        description: 'Latest flagship smartphone with advanced camera system'
      },
      {
        id: 'HDH-003',
        name: 'Wireless Headphones',
        stock: 28,
        price: 199.99,
        category: 'Audio',
        description: 'Premium noise-canceling wireless headphones'
      },
      {
        id: 'CHR-004',
        name: 'USB-C Fast Charger',
        stock: 67,
        price: 29.99,
        category: 'Accessories',
        description: '65W fast charging adapter with multiple ports'
      },
      {
        id: 'TAB-005',
        name: 'Tablet Pro',
        stock: 23,
        price: 649.99,
        category: 'Electronics',
        description: '12.9-inch tablet with Apple M2 chip and 5G connectivity'
      },
      {
        id: 'SPK-006',
        name: 'Smart Speaker',
        stock: 35,
        price: 149.99,
        category: 'Audio',
        description: 'Voice-controlled smart speaker with premium sound'
      }
    ];

    // v2 includes additional fields
    if (serviceInfo.version === 'v2') {
      products.forEach(product => {
        product.warehouse_location = ['North', 'South', 'East', 'West'][Math.floor(Math.random() * 4)];
        product.reserved = Math.floor(Math.random() * 5);
        product.available = product.stock - product.reserved;
      });
    }

    res.json({
      ...serviceInfo,
      products,
      total_items: products.length,
      total_stock: products.reduce((sum, p) => sum + p.stock, 0)
    });
  } catch (error) {
    res.status(500).json({
      service: 'inventory',
      error: error.message,
      timestamp: Date.now()
    });
  }
});

// Orders Service Endpoint
app.post('/api/orders', (req, res) => {
  try {
    const serviceInfo = simulateServiceCall('orders');
    const { productId, quantity, userId } = req.body;

    const order = {
      id: `ORD-${Date.now()}`,
      userId: userId || 'usr-001',
      productId,
      quantity,
      total: quantity * 299.99, // Simplified calculation
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    // v2 includes additional fields
    if (serviceInfo.version === 'v2') {
      order.priority = ['high', 'medium', 'low'][Math.floor(Math.random() * 3)];
      order.estimated_delivery = '2-3 business days';
      order.tracking_number = `TRK-${Date.now()}`;
    }

    res.json({
      ...serviceInfo,
      order
    });
  } catch (error) {
    res.status(500).json({
      service: 'orders',
      error: error.message,
      timestamp: Date.now()
    });
  }
});

// Users Service Endpoint
app.get('/api/users/current', (req, res) => {
  try {
    const serviceInfo = simulateServiceCall('users');

    const user = {
      id: 'usr-001',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      role: 'Premium Customer',
      joinedAt: '2023-06-15',
      active: true
    };

    // v2 includes additional profile fields
    if (serviceInfo.version === 'v2') {
      user.last_login = new Date().toISOString();
      user.preferences = {
        notifications: true,
        newsletter: true,
        theme: 'light'
      };
      user.membership_tier = 'gold';
      user.loyalty_points = 2450;
    }

    res.json({
      ...serviceInfo,
      user
    });
  } catch (error) {
    res.status(500).json({
      service: 'users',
      error: error.message,
      timestamp: Date.now()
    });
  }
});

// Reviews Service Endpoint
app.get('/api/reviews/:productId', (req, res) => {
  try {
    const serviceInfo = simulateServiceCall('reviews');
    const { productId } = req.params;

    const reviews = [
      {
        id: 'rev-001',
        productId,
        userId: 'usr-002',
        userName: 'John Doe',
        rating: 5,
        comment: 'Excellent product! Exceeded my expectations.',
        createdAt: '2025-01-07T10:30:00Z',
        verified: true
      },
      {
        id: 'rev-002',
        productId,
        userId: 'usr-003',
        userName: 'Jane Smith',
        rating: 4,
        comment: 'Good quality, fast shipping. Would recommend.',
        createdAt: '2025-01-06T15:45:00Z',
        verified: true
      }
    ];

    // v2 includes additional fields
    if (serviceInfo.version === 'v2') {
      reviews.forEach(review => {
        review.helpful_votes = Math.floor(Math.random() * 25) + 5;
        review.sentiment = ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)];
      });
    }

    // v3 includes AI features
    if (serviceInfo.version === 'v3') {
      reviews.forEach(review => {
        review.helpful_votes = Math.floor(Math.random() * 50) + 10;
        review.sentiment = ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)];
        review.ai_summary = `AI Summary: ${review.comment.substring(0, 30)}...`;
        review.moderation_status = 'approved';
      });
    }

    res.json({
      ...serviceInfo,
      reviews,
      total_reviews: reviews.length
    });
  } catch (error) {
    res.status(500).json({
      service: 'reviews',
      error: error.message,
      timestamp: Date.now()
    });
  }
});

app.post('/api/reviews', (req, res) => {
  try {
    const serviceInfo = simulateServiceCall('reviews');
    const { productId, rating, comment, userId } = req.body;

    const review = {
      id: `rev-${Date.now()}`,
      productId,
      userId: userId || 'usr-001',
      userName: 'Sarah Johnson',
      rating,
      comment,
      createdAt: new Date().toISOString(),
      verified: true
    };

    // v2 includes additional fields
    if (serviceInfo.version === 'v2') {
      review.helpful_votes = 0;
      review.sentiment = rating >= 4 ? 'positive' : rating >= 3 ? 'neutral' : 'negative';
    }

    res.json({
      ...serviceInfo,
      review
    });
  } catch (error) {
    res.status(500).json({
      service: 'reviews',
      error: error.message,
      timestamp: Date.now()
    });
  }
});

// Ratings Service Endpoint
app.get('/api/ratings/:productId', (req, res) => {
  try {
    const serviceInfo = simulateServiceCall('ratings');
    const { productId } = req.params;

    const rating = {
      productId,
      averageRating: 3.5 + Math.random() * 1.5,
      totalReviews: Math.floor(Math.random() * 200) + 10,
      distribution: {
        5: Math.floor(Math.random() * 50) + 20,
        4: Math.floor(Math.random() * 30) + 15,
        3: Math.floor(Math.random() * 20) + 5,
        2: Math.floor(Math.random() * 10) + 2,
        1: Math.floor(Math.random() * 5) + 1
      }
    };

    // v2 includes enhanced analytics
    if (serviceInfo.version === 'v2') {
      rating.sentiment_analysis = {
        positive: 78.5 + Math.random() * 10,
        neutral: 15.2 + Math.random() * 5,
        negative: 6.3 + Math.random() * 3
      };
      rating.trending = Math.random() > 0.5 ? 'up' : 'down';
      rating.verified_purchase_percentage = 85 + Math.random() * 10;
    }

    res.json({
      ...serviceInfo,
      rating
    });
  } catch (error) {
    res.status(500).json({
      service: 'ratings',
      error: error.message,
      timestamp: Date.now()
    });
  }
});

// Aggregate endpoint for dashboard
app.get('/api/dashboard', (req, res) => {
  try {
    const dashboardData = {
      total_products: 6,
      total_stock: 210,
      total_orders: 1247,
      total_reviews: 3421,
      average_rating: 4.2,
      active_users: 15847,
      revenue: 124750.50,
      timestamp: Date.now()
    };

    res.json({
      service: 'api-gateway',
      version: 'v1',
      dashboard: dashboardData,
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      service: 'api-gateway',
      error: error.message,
      timestamp: Date.now()
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    timestamp: Date.now()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    timestamp: Date.now()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET  /health');
  console.log('  GET  /api/inventory');
  console.log('  POST /api/orders');
  console.log('  GET  /api/users/current');
  console.log('  GET  /api/reviews/:productId');
  console.log('  POST /api/reviews');
  console.log('  GET  /api/ratings/:productId');
  console.log('  GET  /api/dashboard');
});