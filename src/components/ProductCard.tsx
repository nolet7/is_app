import React from 'react';
import { Package, Star, ShoppingCart, Plus } from 'lucide-react';

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
  distribution: { [key: number]: number };
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

interface ProductCardProps {
  product: Product;
  rating: Rating | null;
  reviews: Review[];
  onOrder: (product: Product) => void;
  onAddReview: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  rating, 
  reviews, 
  onOrder, 
  onAddReview 
}) => {
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

  const getStockStatus = (stock: number) => {
    if (stock > 20) return { color: 'bg-green-100 text-green-800', text: `${stock} in stock` };
    if (stock > 5) return { color: 'bg-yellow-100 text-yellow-800', text: `${stock} in stock` };
    if (stock > 0) return { color: 'bg-red-100 text-red-800', text: `Only ${stock} left` };
    return { color: 'bg-gray-100 text-gray-800', text: 'Out of stock' };
  };

  const stockStatus = getStockStatus(product.stock);
  const latestReview = reviews.length > 0 ? reviews[0] : null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Product Image Placeholder */}
      <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Package className="h-16 w-16 text-blue-400" />
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
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
          <div className={`text-sm font-medium px-2 py-1 rounded ${stockStatus.color}`}>
            {stockStatus.text}
          </div>
        </div>

        {/* Rating Display */}
        {rating && (
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex items-center">
              {renderStars(rating.averageRating)}
            </div>
            <span className="text-sm text-gray-600">
              {rating.averageRating.toFixed(1)} ({rating.totalReviews} reviews)
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => onOrder(product)}
            disabled={product.stock === 0}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Order</span>
          </button>
          
          <button
            onClick={() => onAddReview(product)}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Recent Review Preview */}
        {latestReview ? (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Latest Review:</h4>
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
            <p className="text-sm text-gray-500 text-center">No reviews yet</p>
          </div>
        )}
      </div>
    </div>
  );
};