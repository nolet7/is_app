const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
const mockProducts = [
  {
    id: 'prod-001',
    name: 'Premium Wireless Headphones',
    stock: 25,
    price: 199.99,
    category: 'Electronics',
    description: 'High-quality wireless headphones with noise cancellation'
  },
  {
    id: 'prod-002',
    name: 'Smart Fitness Watch',
    stock: 15,
    price: 299.99,
    category: 'Electronics',
    description: 'Advanced fitness tracking with heart rate monitoring'
  },
  {
    id: 'prod-003',
    name: 'Organic Coffee Beans',
    stock: 50,
    price: 24.99,
    category: 'Food',
    description: 'Premium organic coffee beans from sustainable farms'
  },
  {
    id: 'prod-004',
    name: 'Yoga Mat Pro',
    stock: 30,
    price: 79.99,
    category: 'Sports',
    description: 'Professional-grade yoga mat with superior grip'
  },
  {
    id: 'prod-005',
    name: 'Bluetooth Speaker',
    stock: 20,
    price: 89.99,
    category: 'Electronics',
    description: 'Portable wireless speaker with premium sound quality'
  }
];

const mockUser = {
  id: 'usr-001',
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'Premium Customer',
  joinedAt: '2023-01-15',
  active: true,
  orders_count: 12,
  total_spent: 1247.89
};

const mockRatings = {
  'prod-001': {
    productId: 'prod-001',
    averageRating: 4.5,
    totalReviews: 23,
    distribution: { 5: 15, 4: 6, 3: 2, 2: 0, 1: 0 }
  },
  'prod-002': {
    productId: 'prod-002',
    averageRating: 4.2,
    totalReviews: 18,
    distribution: { 5: 8, 4: 7, 3: 3, 2: 0, 1: 0 }
  },
  'prod-003': {
    productId: 'prod-003',
    averageRating: 4.8,
    totalReviews: 31,
    distribution: { 5: 25, 4: 5, 3: 1, 2: 0, 1: 0 }
  },
  'prod-004': {
    productId: 'prod-004',
    averageRating: 4.3,
    totalReviews: 14,
    distribution: { 5: 7, 4: 5, 3: 2, 2: 0, 1: 0 }
  },
  'prod-005': {
    productId: 'prod-005',
    averageRating: 4.1,
    totalReviews: 9,
    distribution: { 5: 4, 4: 3, 3: 2, 2: 0, 1: 0 }
  }
};

const mockReviews = {
  'prod-001': [
    {
      id: 'rev-001',
      productId: 'prod-001',
      userId: 'usr-002',
      userName: 'Sarah Wilson',
      rating: 5,
      comment: 'Amazing sound quality and comfort. Worth every penny!',
      createdAt: '2024-01-15T10:30:00Z',
      verified: true
    },
    {
      id: 'rev-002',
      productId: 'prod-001',
      userId: 'usr-003',
      userName: 'Mike Johnson',
      rating: 4,
      comment: 'Great headphones, battery life could be better.',
      createdAt: '2024-01-10T14:20:00Z',
      verified: true
    }
  ],
  'prod-002': [
    {
      id: 'rev-003',
      productId: 'prod-002',
      userId: 'usr-004',
      userName: 'Emily Chen',
      rating: 4,
      comment: 'Excellent fitness tracking features. Very accurate.',
      createdAt: '2024-01-12T09:15:00Z',
      verified: true
    }
  ],
  'prod-003': [
    {
      id: 'rev-004',
      productId: 'prod-003',
      userId: 'usr-005',
      userName: 'David Brown',
      rating: 5,
      comment: 'Best coffee I\'ve ever had! Rich flavor and aroma.',
      createdAt: '2024-01-14T16:45:00Z',
      verified: true
    }
  ]
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Inventory endpoints
app.get('/api/inventory', (req, res) => {
  res.json({ products: mockProducts });
});

app.get('/api/inventory/:id', (req, res) => {
  const product = mockProducts.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ product });
});

// Users endpoints
app.get('/api/users/current', (req, res) => {
  res.json({ user: mockUser });
});

app.get('/api/users/:id', (req, res) => {
  if (req.params.id === mockUser.id) {
    res.json({ user: mockUser });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Orders endpoints
app.post('/api/orders', (req, res) => {
  const { productId, quantity, userId, total } = req.body;
  
  const product = mockProducts.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  if (quantity > product.stock) {
    return res.status(400).json({ error: 'Insufficient stock' });
  }
  
  const order = {
    id: `ord-${Date.now()}`,
    userId,
    productId,
    quantity,
    total,
    status: 'confirmed',
    createdAt: Date.now()
  };
  
  // Update stock
  product.stock -= quantity;
  
  res.json({ order });
});

app.get('/api/orders/:userId', (req, res) => {
  res.json({ orders: [] }); // Mock empty orders for now
});

// Reviews endpoints
app.get('/api/reviews/:productId', (req, res) => {
  const reviews = mockReviews[req.params.productId] || [];
  res.json({ reviews });
});

app.post('/api/reviews', (req, res) => {
  const { productId, rating, comment, userId, userName } = req.body;
  
  const review = {
    id: `rev-${Date.now()}`,
    productId,
    userId,
    userName,
    rating,
    comment,
    createdAt: new Date().toISOString(),
    verified: true
  };
  
  // Add to mock reviews
  if (!mockReviews[productId]) {
    mockReviews[productId] = [];
  }
  mockReviews[productId].unshift(review);
  
  // Update ratings
  const currentRating = mockRatings[productId];
  if (currentRating) {
    const newTotal = currentRating.totalReviews + 1;
    const newAverage = ((currentRating.averageRating * currentRating.totalReviews) + rating) / newTotal;
    
    mockRatings[productId] = {
      ...currentRating,
      averageRating: newAverage,
      totalReviews: newTotal
    };
  }
  
  res.json({ review });
});

// Ratings endpoints
app.get('/api/ratings/:productId', (req, res) => {
  const rating = mockRatings[req.params.productId] || {
    productId: req.params.productId,
    averageRating: 0,
    totalReviews: 0,
    distribution: {}
  };
  res.json({ rating });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Mock API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});