const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
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

// Mock data
const mockInventory = [
  {
    id: 'prod-001',
    name: 'Wireless Headphones',
    price: 99.99,
    stock: 25,
    category: 'Electronics',
    description: 'High-quality wireless headphones with noise cancellation'
  },
  {
    id: 'prod-002',
    name: 'Smart Watch',
    price: 199.99,
    stock: 15,
    category: 'Electronics',
    description: 'Feature-rich smartwatch with health monitoring'
  },
  {
    id: 'prod-003',
    name: 'Coffee Maker',
    price: 79.99,
    stock: 8,
    category: 'Appliances',
    description: 'Programmable coffee maker with thermal carafe'
  }
];

const mockUser = {
  id: 'user-001',
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'customer',
  preferences: {
    notifications: true,
    theme: 'light'
  }
};

const mockOrders = [
  {
    id: 'order-001',
    userId: 'user-001',
    items: [
      { productId: 'prod-001', quantity: 1, price: 99.99 }
    ],
    total: 99.99,
    status: 'delivered',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'order-002',
    userId: 'user-001',
    items: [
      { productId: 'prod-002', quantity: 1, price: 199.99 }
    ],
    total: 199.99,
    status: 'processing',
    createdAt: '2024-01-20T14:15:00Z'
  }
];

const mockReviews = [
  {
    id: 'review-001',
    productId: 'prod-001',
    userId: 'user-001',
    rating: 5,
    comment: 'Excellent sound quality and comfortable fit!',
    createdAt: '2024-01-16T09:00:00Z'
  },
  {
    id: 'review-002',
    productId: 'prod-002',
    userId: 'user-001',
    rating: 4,
    comment: 'Great features but battery could last longer.',
    createdAt: '2024-01-18T16:30:00Z'
  }
];

const mockRatings = {
  overall_stats: {
    average_rating: 4.5,
    total_reviews: 2
  },
  products: {
    'prod-001': { average: 5.0, count: 1 },
    'prod-002': { average: 4.0, count: 1 },
    'prod-003': { average: 0, count: 0 }
  }
};

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'mock-api-gateway',
    version: 'v1',
    timestamp: Date.now()
  });
});

// Inventory Service Routes
app.get('/api/inventory', (req, res) => {
  res.json({
    service: 'inventory',
    version: 'v1',
    products: mockInventory,
    total_items: mockInventory.length,
    total_stock: mockInventory.reduce((sum, item) => sum + item.stock, 0),
    timestamp: Date.now()
  });
});

app.get('/api/inventory/:productId', (req, res) => {
  const product = mockInventory.find(p => p.id === req.params.productId);
  if (!product) {
    return res.status(404).json({
      error: 'Product not found',
      service: 'inventory',
      timestamp: Date.now()
    });
  }
  res.json({
    service: 'inventory',
    version: 'v1',
    product,
    timestamp: Date.now()
  });
});

// Orders Service Routes
app.post('/api/orders', (req, res) => {
  const newOrder = {
    id: `order-${Date.now()}`,
    userId: req.body.userId || 'user-001',
    items: req.body.items || [],
    total: req.body.total || 0,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  mockOrders.push(newOrder);
  
  res.status(201).json({
    service: 'orders',
    version: 'v1',
    order: newOrder,
    timestamp: Date.now()
  });
});

app.get('/api/orders', (req, res) => {
  res.json({
    service: 'orders',
    version: 'v1',
    orders: mockOrders,
    total_orders: mockOrders.length,
    timestamp: Date.now()
  });
});

app.get('/api/orders/:orderId', (req, res) => {
  const order = mockOrders.find(o => o.id === req.params.orderId);
  if (!order) {
    return res.status(404).json({
      error: 'Order not found',
      service: 'orders',
      timestamp: Date.now()
    });
  }
  res.json({
    service: 'orders',
    version: 'v1',
    order,
    timestamp: Date.now()
  });
});

// Users Service Routes
app.get('/api/users/current', (req, res) => {
  res.json({
    service: 'users',
    version: 'v1',
    user: mockUser,
    timestamp: Date.now()
  });
});

app.get('/api/users/:userId', (req, res) => {
  if (req.params.userId !== mockUser.id) {
    return res.status(404).json({
      error: 'User not found',
      service: 'users',
      timestamp: Date.now()
    });
  }
  res.json({
    service: 'users',
    version: 'v1',
    user: mockUser,
    timestamp: Date.now()
  });
});

// Reviews Service Routes
app.get('/api/reviews/:productId', (req, res) => {
  const productReviews = mockReviews.filter(r => r.productId === req.params.productId);
  res.json({
    service: 'reviews',
    version: 'v1',
    reviews: productReviews,
    product_id: req.params.productId,
    total_reviews: productReviews.length,
    timestamp: Date.now()
  });
});

app.post('/api/reviews', (req, res) => {
  const newReview = {
    id: `review-${Date.now()}`,
    productId: req.body.productId,
    userId: req.body.userId || 'user-001',
    rating: req.body.rating,
    comment: req.body.comment,
    createdAt: new Date().toISOString()
  };
  
  mockReviews.push(newReview);
  
  res.status(201).json({
    service: 'reviews',
    version: 'v1',
    review: newReview,
    timestamp: Date.now()
  });
});

app.get('/api/reviews', (req, res) => {
  res.json({
    service: 'reviews',
    version: 'v1',
    reviews: mockReviews,
    total_reviews: mockReviews.length,
    timestamp: Date.now()
  });
});

// Ratings Service Routes
app.get('/api/ratings/:productId', (req, res) => {
  const productRating = mockRatings.products[req.params.productId] || { average: 0, count: 0 };
  res.json({
    service: 'ratings',
    version: 'v1',
    product_id: req.params.productId,
    rating: productRating,
    timestamp: Date.now()
  });
});

app.get('/api/ratings', (req, res) => {
  res.json({
    service: 'ratings',
    version: 'v1',
    overall_stats: mockRatings.overall_stats,
    products: mockRatings.products,
    timestamp: Date.now()
  });
});

// Aggregate endpoint for dashboard
app.get('/api/dashboard', (req, res) => {
  const dashboard = {
    service: 'mock-api-gateway',
    version: 'v1',
    inventory: {
      total_products: mockInventory.length,
      total_stock: mockInventory.reduce((sum, item) => sum + item.stock, 0)
    },
    ratings: mockRatings.overall_stats,
    orders: {
      total_orders: mockOrders.length,
      pending_orders: mockOrders.filter(o => o.status === 'pending').length
    },
    timestamp: Date.now()
  };

  res.json(dashboard);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    service: 'mock-api-gateway',
    message: err.message,
    timestamp: Date.now()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    service: 'mock-api-gateway',
    path: req.originalUrl,
    timestamp: Date.now()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Mock API Gateway running on port ${PORT}`);
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