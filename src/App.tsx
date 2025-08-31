import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { OrderModal } from './components/OrderModal';
import { ReviewModal } from './components/ReviewModal';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Notification } from './components/Notification';
import { Package, TrendingUp, MessageSquare, Star, Search, Filter } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  stock: number;
  price: number;
  category: string;
  description?: string;
}

interface Order {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  total: number;
  status: string;
  createdAt: number;
}

interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
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
  active: boolean;
  orders_count: number;
  total_spent: number;
}

interface NotificationItem {
  id: string;
  message: string;
  type: 'success' | 'error';
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [ratings, setRatings] = useState<{ [key: string]: Rating }>({});
  const [reviews, setReviews] = useState<{ [key: string]: Review[] }>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Utility function to add notifications
  const addNotification = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // API functions
  const fetchProducts = async (): Promise<Product[]> => {
    try {
      const response = await fetch('/api/inventory');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Backend services unavailable - received HTML instead of JSON');
      }
      
      const data = await response.json();
      return data.products || [];
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  };

  const fetchUser = async (): Promise<User> => {
    try {
      const response = await fetch('/api/users/current');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Backend services unavailable - received HTML instead of JSON');
      }
      
      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw error;
    }
  };

  const fetchRatings = async (productId: string): Promise<Rating> => {
    try {
      const response = await fetch(`/api/ratings/${productId}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.rating;
    } catch (error) {
      console.error(`Failed to fetch ratings for ${productId}:`, error);
      // Return default rating if fetch fails
      return {
        productId,
        averageRating: 0,
        totalReviews: 0,
        distribution: {}
      };
    }
  };

  const fetchReviews = async (productId: string): Promise<Review[]> => {
    try {
      const response = await fetch(`/api/reviews/${productId}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.reviews || [];
    } catch (error) {
      console.error(`Failed to fetch reviews for ${productId}:`, error);
      return [];
    }
  };

  const createOrder = async (productId: string, quantity: number): Promise<Order> => {
    const product = products.find(p => p.id === productId);
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId,
        quantity,
        userId: 'usr-001',
        total: (product?.price || 0) * quantity
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return data.order;
  };

  const submitReview = async (productId: string, rating: number, comment: string): Promise<Review> => {
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId,
        rating,
        comment,
        userId: user?.id || 'usr-001',
        userName: user?.name || 'Anonymous User'
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return data.review;
  };

  // Load all data
  const loadData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Fetch products and user data in parallel
      const [productsData, userData] = await Promise.all([
        fetchProducts(),
        fetchUser().catch(() => null) // User data is optional
      ]);

      setProducts(productsData);
      setUser(userData);

      // Load ratings and reviews for all products in parallel
      const ratingsPromises = productsData.map(product => fetchRatings(product.id));
      const reviewsPromises = productsData.map(product => fetchReviews(product.id));

      const [ratingsResults, reviewsResults] = await Promise.all([
        Promise.all(ratingsPromises),
        Promise.all(reviewsPromises)
      ]);

      // Create maps for ratings and reviews
      const ratingsMap: { [key: string]: Rating } = {};
      const reviewsMap: { [key: string]: Review[] } = {};

      productsData.forEach((product, index) => {
        ratingsMap[product.id] = ratingsResults[index];
        reviewsMap[product.id] = reviewsResults[index];
      });

      setRatings(ratingsMap);
      setReviews(reviewsMap);

      if (isRefresh) {
        addNotification('Data refreshed successfully!');
      }

    } catch (error) {
      console.error('Failed to load data:', error);
      addNotification('Failed to load application data. Please try again.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle order placement
  const handlePlaceOrder = async (productId: string, quantity: number) => {
    try {
      const order = await createOrder(productId, quantity);
      addNotification(`Order ${order.id} placed successfully! Total: $${order.total.toFixed(2)}`);
      
      // Update stock locally for immediate UI feedback
      setProducts(prev => prev.map(p => 
        p.id === productId 
          ? { ...p, stock: Math.max(0, p.stock - quantity) }
          : p
      ));
    } catch (error) {
      console.error('Order error:', error);
      addNotification('Failed to place order. Please try again.', 'error');
    }
  };

  // Handle review submission
  const handleSubmitReview = async (productId: string, rating: number, comment: string) => {
    try {
      const review = await submitReview(productId, rating, comment);
      addNotification('Review submitted successfully!');
      
      // Update reviews locally for immediate UI feedback
      setReviews(prev => ({
        ...prev,
        [productId]: [review, ...(prev[productId] || [])]
      }));

      // Update ratings count locally
      const currentRating = ratings[productId];
      if (currentRating) {
        const newTotalReviews = currentRating.totalReviews + 1;
        const newAverageRating = ((currentRating.averageRating * currentRating.totalReviews) + rating) / newTotalReviews;
        
        setRatings(prev => ({
          ...prev,
          [productId]: {
            ...currentRating,
            averageRating: newAverageRating,
            totalReviews: newTotalReviews
          }
        }));
      }
    } catch (error) {
      console.error('Review error:', error);
      addNotification('Failed to submit review. Please try again.', 'error');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  // Calculate dashboard stats
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const averageRating = Object.values(ratings).length > 0 
    ? Object.values(ratings).reduce((sum, r) => sum + r.averageRating, 0) / Object.values(ratings).length
    : 0;
  const totalReviews = Object.values(ratings).reduce((sum, r) => sum + r.totalReviews, 0);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={user} 
        onRefresh={() => loadData(true)} 
        isRefreshing={refreshing}
      />

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{products.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Stock</p>
                <p className="text-3xl font-bold text-gray-900">{totalStock.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-3xl font-bold text-gray-900">
                  {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-xl">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-3xl font-bold text-gray-900">{totalReviews}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name, category, or description..."
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
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-40"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {searchTerm && (
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
              {selectedCategory !== 'all' && ` in ${selectedCategory}`}
            </div>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-4 bg-gray-100 rounded-full inline-block mb-4">
              <Package className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {products.length === 0 ? 'No products available' : 'No products found'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {products.length === 0 
                ? 'The inventory is currently empty. Please check back later or contact support.'
                : 'Try adjusting your search terms or filter criteria to find what you\'re looking for.'
              }
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                rating={ratings[product.id] || null}
                reviews={reviews[product.id] || []}
                onOrder={(product) => {
                  setSelectedProduct(product);
                  setShowOrderModal(true);
                }}
                onAddReview={(product) => {
                  setSelectedProduct(product);
                  setShowReviewModal(true);
                }}
              />
            ))}
          </div>
        )}

        {/* Order Modal */}
        {showOrderModal && selectedProduct && (
          <OrderModal
            product={selectedProduct}
            onClose={() => {
              setShowOrderModal(false);
              setSelectedProduct(null);
            }}
            onSubmit={handlePlaceOrder}
          />
        )}

        {/* Review Modal */}
        {showReviewModal && selectedProduct && (
          <ReviewModal
            product={selectedProduct}
            onClose={() => {
              setShowReviewModal(false);
              setSelectedProduct(null);
            }}
            onSubmit={handleSubmitReview}
          />
        )}

        {/* User Dashboard Section */}
        {user && (
          <div className="mt-12 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">User Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-600 font-medium">Total Orders</p>
                <p className="text-2xl font-bold text-blue-900">{user.orders_count}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <p className="text-sm text-green-600 font-medium">Total Spent</p>
                <p className="text-2xl font-bold text-green-900">${user.total_spent.toFixed(2)}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <p className="text-sm text-purple-600 font-medium">Member Since</p>
                <p className="text-lg font-bold text-purple-900">{user.joinedAt}</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-xl">
                <p className="text-sm text-amber-600 font-medium">Account Status</p>
                <p className="text-lg font-bold text-amber-900">{user.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Built with modern microservices architecture • Real-time data from {products.length} products
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;