import React, { useState } from 'react';
import { ShoppingCart, X, Package } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  stock: number;
  price: number;
}

interface OrderModalProps {
  product: Product;
  onClose: () => void;
  onSubmit: (productId: string, quantity: number) => Promise<void>;
}

export const OrderModal: React.FC<OrderModalProps> = ({ product, onClose, onSubmit }) => {
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity < 1 || quantity > product.stock) return;

    setSubmitting(true);
    try {
      await onSubmit(product.id, quantity);
      onClose();
    } catch (error) {
      console.error('Failed to place order:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const total = product.price * quantity;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-scale-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Place Order</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <Package className="h-5 w-5 text-gray-600" />
              <h4 className="font-medium text-gray-900">{product.name}</h4>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Price per item:</span>
              <span className="font-medium">${product.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Available stock:</span>
              <span className="font-medium">{product.stock} units</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-blue-700 font-medium">Order Total:</span>
                  <span className="text-xl font-bold text-blue-900">${total.toFixed(2)}</span>
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  {quantity} × ${product.price.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={quantity < 1 || quantity > product.stock || submitting}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>{submitting ? 'Placing Order...' : 'Place Order'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};