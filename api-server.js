const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Mock data
const mockInventory = [
  { id: 1, name: 'Laptop', stock: 50, price: 999.99, category: 'Electronics' },
  { id: 2, name: 'Mouse', stock: 100, price: 29.99, category: 'Electronics' },
  { id: 3, name: 'Keyboard', stock: 75, price: 79.99, category: 'Electronics' }
];

const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin'
};

const mockOrders = [
  { id: 1, userId: 1, productId: 1, quantity: 2, status: 'completed', total: 1999.98 },
  { id: 2, userId: 1, productId: 2, quantity: 1, status: 'pending', total: 29.99 }
];

const mockReviews = [
  { id: 1, productId: 1, userId: 1, rating: 5, comment: 'Great laptop!', date: '2024-01-15' },
  { id: 2, productId: 2, userId: 1, rating: 4, comment: 'Good mouse', date: '2024-01-16' }
];

const mockRatings = [
  { productId: 1, averageRating: 4.5, totalReviews: 10 },
  { productId: 2, averageRating: 4.2, totalReviews: 8 },
  { productId: 3, averageRating: 4.8, totalReviews: 15 }
];

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'api-server', timestamp: Date.now() });
});

// Inventory endpoints
app.get('/api/inventory', (req, res) => {
  res.json({
    items: mockInventory,
    total_items: mockInventory.length,
    total_stock: mockInventory.reduce((sum, item) => sum + item.stock, 0)
  });
});

app.get('/api/inventory/:productId', (req, res) => {
  const product = mockInventory.find(p => p.id === parseInt(req.params.productId));
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Users endpoints
app.get('/api/users/current', (req, res) => {
  res.json(mockUser);
});

app.get('/api/users/:userId', (req, res) => {
  if (req.params.userId === '1') {
    res.json(mockUser);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Orders endpoints
app.get('/api/orders', (req, res) => {
  res.json({ orders: mockOrders });
});

app.get('/api/orders/:orderId', (req, res) => {
  const order = mockOrders.find(o => o.id === parseInt(req.params.orderId));
  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

app.post('/api/orders', (req, res) => {
  const newOrder = {
    id: mockOrders.length + 1,
    ...req.body,
    status: 'pending'
  };
  mockOrders.push(newOrder);
  res.status(201).json(newOrder);
});

// Reviews endpoints
app.get('/api/reviews', (req, res) => {
  res.json({ reviews: mockReviews });
});

app.get('/api/reviews/:productId', (req, res) => {
  const productReviews = mockReviews.filter(r => r.productId === parseInt(req.params.productId));
  res.json({ reviews: productReviews });
});

app.post('/api/reviews', (req, res) => {
  const newReview = {
    id: mockReviews.length + 1,
    ...req.body,
    date: new Date().toISOString().split('T')[0]
  };
  mockReviews.push(newReview);
  res.status(201).json(newReview);
});

// Ratings endpoints
app.get('/api/ratings', (req, res) => {
  res.json({
    ratings: mockRatings,
    overall_stats: {
      average_rating: 4.5,
      total_reviews: 33
    }
  });
});

app.get('/api/ratings/:productId', (req, res) => {
  const rating = mockRatings.find(r => r.productId === parseInt(req.params.productId));
  if (rating) {
    res.json(rating);
  } else {
    res.status(404).json({ error: 'Rating not found' });
  }
});

// Dashboard endpoint
app.get('/api/dashboard', (req, res) => {
  res.json({
    service: 'api-server',
    version: 'v1',
    timestamp: Date.now(),
    inventory: {
      total_products: mockInventory.length,
      total_stock: mockInventory.reduce((sum, item) => sum + item.stock, 0)
    },
    ratings: {
      average_rating: 4.5,
      total_reviews: 33
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET  /health');
  console.log('  GET  /api/inventory');
  console.log('  GET  /api/inventory/:productId');
  console.log('  GET  /api/users/current');
  console.log('  GET  /api/users/:userId');
  console.log('  GET  /api/orders');
  console.log('  GET  /api/orders/:orderId');
  console.log('  POST /api/orders');
  console.log('  GET  /api/reviews');
  console.log('  GET  /api/reviews/:productId');
  console.log('  POST /api/reviews');
  console.log('  GET  /api/ratings');
  console.log('  GET  /api/ratings/:productId');
  console.log('  GET  /api/dashboard');
});