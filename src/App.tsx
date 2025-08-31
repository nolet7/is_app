import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Package, Star, User, Plus, RefreshCw, 
  DollarSign, TrendingUp, Users, MessageSquare, AlertCircle,
  CheckCircle, Clock, Search, Filter, Heart
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  stock: number;
  price: number;
  category: string;
  image?: string;
  description?: string;
}

interface Order {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  total: number;
  status: string;
  createdAt: string;
}

interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  verified?: boolean;
}

interface Rating {
  productId: string;
  averageRating: number;
  totalReviews: number;
  distribution: { [key: number]: number };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
}

interface ServiceResponse<T> {
  data: T;
  service: string;
  version: string;
  timestamp: number;
  responseTime: number;
}

const API_BASE_URL = '/api';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [ratings, setRatings] = useState<{ [key: string]: Rating }>({});
  const [reviews, setReviews] = useState<{ [key: string]: Review[] }>({});
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [notifications, setNotifications] = useState<string[]>([]);

  // Simulate API calls with realistic data
  const fetchProducts = async (): Promise<ServiceResponse<Product[]>> => {
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
    
    const mockProducts: Product[] = [
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

    return {
      data: mockProducts,
      service: 'inventory',
      version: Math.random() > 0.3 ? 'v1' : 'v2',
      timestamp: Date.now(),
      responseTime: Math.floor(Math.random() * 200) + 50
    };
  };

  const fetchUser = async (): Promise<ServiceResponse<User>> => {
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    const mockUser: User = {
      id: 'usr-001',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      role: 'Premium Customer',
      joinedAt: '2023-06-15'
    };

    return {
      data: mockUser,
      service: 'users',
      version: Math.random() > 0.4 ? 'v1' : 'v2',
      timestamp: Date.now(),
      responseTime: Math.floor(Math.random() * 150) + 30
    };
  };

  const fetchRatings = async (productId: string): Promise<ServiceResponse<Rating>> => {
    await new Promise(resolve => setTimeout(resolve, 80 + Math.random() * 120));
    
    const mockRating: Rating = {
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

    return {
      data: mockRating,
      service: 'ratings',
      version: Math.random() > 0.25 ? 'v1' : 'v2',
      timestamp: Date.now(),
      responseTime: Math.floor(Math.random() * 100) + 40
    };
  };

  const fetchReviews = async (productId: string): Promise<ServiceResponse<Review[]>> => {
    await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 250));
    
    const mockReviews: Review[] = [
      {
        id: 'rev-001',
        productId,
        userId: 'usr-002',
        rating: 5,
        comment: 'Excellent product! Exceeded my expectations.',
        createdAt: '2025-01-07T10:30:00Z',
        verified: true
      },
      {
        id: 'rev-002',
        productId,
        userId: 'usr-003',
        rating: 4,
        comment: 'Good quality, fast shipping. Would recommend.',
        createdAt: '2025-01-06T15:45:00Z',
        verified: true
      }
    ];

    return {
      data: mockReviews,
      service: 'reviews',
      version: Math.random() > 0.2 ? 'v1' : Math.random() > 0.5 ? 'v2' : 'v3',
      timestamp: Date.now(),
      responseTime: Math.floor(Math.random() * 180) + 60
    };
  };

  const createOrder = async (productId: string, quantity: number): Promise<ServiceResponse<Order>> => {
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));
    
    const product = products.find(p => p.id === productId);
    const mockOrder: Order = {
      id: `ORD-${Date.now()}`,
      userId: user?.id || 'usr-001',
      productId,
      quantity,
      total: (product?.price || 0) * quantity,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    return {
      data: mockOrder,
      service: 'orders',
      version: Math.random() > 0.3 ? 'v1' : 'v2',
      timestamp: Date.now(),
      responseTime: Math.floor(Math.random() * 300) + 100
    };
  };

  const submitReview = async (productId: string, rating: number, comment: string): Promise<ServiceResponse<Review>> => {
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
    
    const mockReview: Review = {
      id: `rev-${Date.now()}`,
      productId,
      userId: user?.id || 'usr-001',
      rating,
      comment,
      createdAt: new Date().toISOString(),
      verified: true
    };

    return {
      data: mockReview,
      service: 'reviews',
      version: Math.random() > 0.2 ? 'v1' : Math.random() > 0.5 ? 'v2' : 'v3',
      timestamp: Date.now(),
      responseTime: Math.floor(Math.random() * 250) + 80
    };
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsResponse, userResponse] = await Promise.all([
        fetchProducts(),
        fetchUser()
      ]);

      setProducts(productsResponse.data);
      setUser(userResponse.data);

      // Load ratings for all products
      const ratingsPromises = productsResponse.data.map(product => 
        fetchRatings(product.id).then(response => ({ [product.id]: response.data }))
      );
      const ratingsResults = await Promise.all(ratingsPromises);
      const ratingsMap = ratingsResults.reduce((acc, rating) => ({ ...acc, ...rating }), {});
      setRatings(ratingsMap);

      // Load reviews for all products
      const reviewsPromises = productsResponse.data.map(product => 
        fetchReviews(product.id).then(response => ({ [product.id]: response.data }))
      );
      const reviewsResults = await Promise.all(reviewsPromises);
      const reviewsMap = reviewsResults.reduce((acc, review) => ({ ...acc, ...review }), {});
      setReviews(reviewsMap);

    } catch (error) {
      console.error('Failed to load data:', error);
      addNotification('Failed to load application data');
    } finally {
      setLoading(false);
    }
  };

  const addNotification = (message: string) => {
    setNotifications(prev => [...prev, message]);
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 5000);
  };

  const handlePlaceOrder = async () => {
    if (!selectedProduct) return;
    
    try {
      const response = await createOrder(selectedProduct.id, orderQuantity);
      addNotification(`Order ${response.data.id} placed successfully! Total: $${response.data.total.toFixed(2)}`);
      setShowOrderModal(false);
      setOrderQuantity(1);
      
      // Update stock locally
      setProducts(prev => prev.map(p => 
        p.id === selectedProduct.id 
          ? { ...p, stock: Math.max(0, p.stock - orderQuantity) }
          : p
      ));
    } catch (error) {
      addNotification('Failed to place order. Please try again.');
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedProduct) return;
    
    try {
      const response = await submitReview(selectedProduct.id, reviewForm.rating, reviewForm.comment);
      addNotification('Review submitted successfully!');
      setShowReviewModal(false);
      setReviewForm({ rating: 5, comment: '' });
      
      // Update reviews locally
      setReviews(prev => ({
        ...prev,
        [selectedProduct.id]: [...(prev[selectedProduct.id] || []), response.data]
      }));
    } catch (error) {
      addNotification('Failed to submit review. Please try again.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : i < rating 
            ? 'text-yellow-400 fill-current opacity-50' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Stock Management & Reviews App
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>Welcome, {user.name}</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {user.role}
                  </span>
                </div>
              )}
              <button
                onClick={loadData}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification, index) => (
          <div
            key={index}
            className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-in"
          >
            {notification}
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.reduce((sum, p) => sum + p.stock, 0)}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.values(ratings).length > 0 
                    ? (Object.values(ratings).reduce((sum, r) => sum + r.averageRating, 0) / Object.values(ratings).length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.values(ratings).reduce((sum, r) => sum + r.totalReviews, 0)}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => {
            const productRating = ratings[product.id];
            const productReviews = reviews[product.id] || [];
            
            return (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                {/* Product Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Package className="h-16 w-16 text-gray-400" />
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {product.category}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{product.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-gray-900">
                      ${product.price.toFixed(2)}
                    </div>
                    <div className={`text-sm font-medium px-2 py-1 rounded ${
                      product.stock > 20 ? 'bg-green-100 text-green-800' :
                      product.stock > 5 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {product.stock} in stock
                    </div>
                  </div>

                  {/* Rating Display */}
                  {productRating && (
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="flex items-center">
                        {renderStars(productRating.averageRating)}
                      </div>
                      <span className="text-sm text-gray-600">
                        {productRating.averageRating.toFixed(1)} ({productRating.totalReviews} reviews)
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowOrderModal(true);
                      }}
                      disabled={product.stock === 0}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Order</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowReviewModal(true);
                      }}
                      className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Recent Reviews Preview */}
                  {productReviews.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Review:</h4>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-1 mb-1">
                          {renderStars(productReviews[0].rating)}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          "{productReviews[0].comment}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Modal */}
        {showOrderModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Place Order</h3>
                
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">{selectedProduct.name}</h4>
                  <p className="text-sm text-gray-600">${selectedProduct.price.toFixed(2)} each</p>
                  <p className="text-sm text-gray-500">{selectedProduct.stock} available</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct.stock}
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Total: ${(selectedProduct.price * orderQuantity).toFixed(2)}
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Place Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
                
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">{selectedProduct.name}</h4>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                        className="p-1"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= reviewForm.rating 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          } hover:text-yellow-400 transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment
                  </label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Share your experience with this product..."
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReview}
                    disabled={!reviewForm.comment.trim()}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;