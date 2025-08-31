import React from 'react';
import { Package, Star, ShoppingCart, MessageSquare, Plus, AlertTriangle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  stock: number;
  price: number;
  category: string;
  description?: string;
}

interface Rating {
  productId: string;
  averageRating: number;
  totalReviews: number;
}

interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ProductCardProps {
  product: Product;
  rating: Rating | null;
  reviews: Review[];
  onOrder: (product: Product) => void;
  onAddReview: (product: Product) => void;
  onComplaint?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  rating, 
  reviews, 
  onOrder, 
  onAddReview,
  onComplaint
}) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getStockStatus = (stock: number) => {
    if (stock > 20) return { color: 'bg-green-100 text-green-800', text: `${stock} in stock` };
    if (stock > 5) return { color: 'bg-yellow-100 text-yellow-800', text: `${stock} in stock` };
    if (stock > 0) return { color: 'bg-red-100 text-red-800', text: `Only ${stock} left` };
    return { color: 'bg-gray-100 text-gray-800', text: 'Out of stock' };
  };

  const stockStatus = getStockStatus(product.stock);
  const latestReview = reviews.length > 0 ? reviews[0] : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200">
      {/* Product Image Placeholder */}
      <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Package className="h-16 w-16 text-blue-400" />
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">{product.name}</h3>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded ml-2 whitespace-nowrap">
            {product.category}
          </span>
        </div>

        {product.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </div>
          <div className={`text-sm font-medium px-3 py-1 rounded-full ${stockStatus.color}`}>
            {stockStatus.text}
          </div>
        </div>

        {/* Rating Display */}
        {rating && rating.totalReviews > 0 ? (
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex items-center">
              {renderStars(rating.averageRating)}
            </div>
            <span className="text-sm text-gray-600">
              {rating.averageRating.toFixed(1)} ({rating.totalReviews} reviews)
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex items-center">
              {renderStars(0)}
            </div>
            <span className="text-sm text-gray-500">No reviews yet</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={() => onOrder(product)}
            disabled={product.stock === 0}
            className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Order</span>
          </button>
          
          <button
            onClick={() => onAddReview(product)}
            className="flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            title="Add Review"
          >
            <Plus className="h-4 w-4" />
          </button>
          
          {onComplaint && (
            <button
              onClick={() => onComplaint(product)}
              className="flex items-center justify-center px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm"
              title="Report Issue"
            >
              <AlertTriangle className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Recent Review Preview */}
        {latestReview ? (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <MessageSquare className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Latest Review:</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-1 mb-1">
                {renderStars(latestReview.rating)}
                <span className="text-xs text-gray-500 ml-2">by {latestReview.userName}</span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">
                "{latestReview.comment}"
              </p>
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center text-sm text-gray-500 py-2">
              <MessageSquare className="h-4 w-4 mr-2" />
              No reviews yet
            </div>
          </div>
        )}
      </div>
    </div>
  );
};