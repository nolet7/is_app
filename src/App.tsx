import React, { useState, useEffect } from 'react';
import { 
  Package, TrendingUp, MessageSquare, Star, Search, Filter, RefreshCw
} from 'lucide-react';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { OrderModal } from './components/OrderModal';
import { ReviewModal } from './components/ReviewModal';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Notification } from './components/Notification';

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
    const response = await fetch(`${API_BASE_URL}/inventory`);
    if (!response.ok) throw new Error('Failed to fetch products');
    const data = await response.json();
    return data.products || [];
  };

  const fetchUser = async (): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/current`);
    if (!response.ok) throw new Error('Failed to fetch user');
    const data = await response.json();
    return data.user;
  };

  const fetchRatings = async (productId: string): Promise<Rating> => {
    const response = await fetch(`${API_BASE_URL}/ratings/${productId}`);
    if (!response.ok) throw new Error('Failed to fetch ratings');
    const data = await response.json();
    return data.rating;
  };

  const fetchReviews = async (productId: string): Promise<Review[]> => {
    const response = await fetch(`${API_BASE_URL}/reviews/${productId}`);
    if (!response.ok) throw new Error('Failed to fetch reviews');
    const data = await response.json();
    return data.reviews || [];
  };

  const createOrder = async (productId: string, quantity: number): Promise<Order> => {
    const product = products.find(p => p.id === productId);
    const response = await fetch(`${API_BASE_URL}/orders`, {
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
    
    if (!response.ok) throw new Error('Failed to create order');
    const data = await response.json();
    return data.order;
  };

  const submitReview = async (productId: string, rating: number, comment: string): Promise<Review> => {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId,
        rating,
        comment,
        userId: user?.id || 'usr-001',
        userName: user?.name || 'Anonymous'
      })
    });
    
    if (!response.ok) throw new Error('Failed to submit review');
    const data = await response.json();
    return data.review;
  };

  // Load all data
  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch products and user data in parallel
      const [productsData, userData] = await Promise.all([
        fetchProducts(),
        fetchUser()
      ]);

      setProducts(productsData);
      setUser(userData);

      // Load ratings and reviews for all products
      const ratingsPromises = productsData.map(async (product) => {
        try {
          const rating = await fetchRatings(product.id);
          return { [product.id]: rating };
        } catch (error) {
          console.error(`Failed to fetch ratings for ${product.id}:`, error);
          return { [product.id]: { productId: product.id, averageRating: 0, totalReviews: 0, distribution: {} } };
        }
      });

      const reviewsPromises = productsData.map(async (product) => {
        try {
          const productReviews = await fetchReviews(product.id);
          return { [product.id]: productReviews };
        } catch (error) {
          console.error(`Failed to fetch reviews for ${product.id}:`, error);
          return { [product.id]: [] };
        }
      });

      const ratingsResults = await Promise.all(ratingsPromises);
      const reviewsResults = await Promise.all(reviewsPromises);

      const ratingsMap = ratingsResults.reduce((acc, rating) => ({ ...acc, ...rating }), {});
      const reviewsMap = reviewsResults.reduce((acc, review) => ({ ...acc, ...review }), {});

      setRatings(ratingsMap);
      setReviews(reviewsMap);

    } catch (error) {
      console.error('Failed to load data:', error);
      addNotification('Failed to load application data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle order placement
  const handlePlaceOrder = async (productId: string, quantity: number) => {
    try {
      const order = await createOrder(productId, quantity);
      addNotification(`Order ${order.id} placed successfully! Total: $${order.total.toFixed(2)}`);
      
      // Update stock locally
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
      
      // Update reviews locally
      setReviews(prev => ({
        ...prev,
        [productId]: [review, ...(prev[productId] || [])]
      }));

      // Update ratings count
      setRatings(prev => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          totalReviews: (prev[productId]?.totalReviews || 0) + 1
        }
      }));
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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onRefresh={loadData} />

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
            <button
              onClick={loadData}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'No products available at the moment.'
              }
            </p>
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
          <div className="mt-12 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">User Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Total Orders</p>
                <p className="text-2xl font-bold text-blue-900">{user.orders_count}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Total Spent</p>
                <p className="text-2xl font-bold text-green-900">${user.total_spent.toFixed(2)}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Member Since</p>
                <p className="text-lg font-bold text-purple-900">{user.joinedAt}</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Built with modern microservices architecture for scalability and reliability
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;