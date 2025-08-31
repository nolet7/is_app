import React from 'react';
import { 
  Clock, Globe, CheckCircle, AlertCircle,
  ShoppingCart, Package, Users, MessageSquare, Star, Server, X
} from 'lucide-react';

interface ServiceResponse {
  service: string;
  version: string;
  status: 'healthy' | 'error' | 'timeout';
  responseTime: number;
  timestamp: string;
  data: any;
  region?: string;
}

interface ServiceModalProps {
  service: ServiceResponse;
  onClose: () => void;
}

const getServiceIcon = (service: string) => {
  switch (service) {
    case 'orders': return <ShoppingCart className="h-6 w-6" />;
    case 'inventory': return <Package className="h-6 w-6" />;
    case 'users': return <Users className="h-6 w-6" />;
    case 'reviews': return <MessageSquare className="h-6 w-6" />;
    case 'ratings': return <Star className="h-6 w-6" />;
    default: return <Server className="h-6 w-6" />;
  }
};

const getVersionColor = (version: string) => {
  switch (version) {
    case 'v1': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'v2': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'v3': return 'bg-purple-100 text-purple-800 border-purple-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy': return 'text-emerald-500';
    case 'timeout': return 'text-amber-500';
    case 'error': return 'text-red-500';
    default: return 'text-gray-500';
  }
};

export const ServiceModal: React.FC<ServiceModalProps> = ({ service, onClose }) => {
  const renderServiceSpecificData = () => {
    switch (service.service) {
      case 'inventory':
        return service.data.products && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Inventory</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {service.data.products.map((product: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">${product.price}</div>
                    <div className={`text-sm font-medium ${
                      product.stock > 20 ? 'text-emerald-600' : 
                      product.stock > 5 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {product.stock} in stock
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'orders':
        return service.data.recent_orders && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
            <div className="space-y-3">
              {service.data.recent_orders.map((order: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <div className="font-medium text-gray-900">{order.id}</div>
                    <div className="text-sm text-gray-500">{order.customer}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">${order.amount}</div>
                    <div className={`text-sm font-medium px-2 py-1 rounded ${
                      order.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {order.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'reviews':
        return service.data.recent_reviews && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h3>
            <div className="space-y-3">
              {service.data.recent_reviews.map((review: any, index: number) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">{review.product}</div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto animate-scale-in">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-xl ${
                service.status === 'healthy' ? 'bg-emerald-50' : 
                service.status === 'timeout' ? 'bg-amber-50' : 'bg-red-50'
              }`}>
                <div className={getStatusColor(service.status)}>
                  {getServiceIcon(service.service)}
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 capitalize">{service.service} Service</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getVersionColor(service.version)}`}>
                    {service.version.toUpperCase()}
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{service.responseTime}ms</span>
                  </span>
                  {service.region && (
                    <span className="flex items-center space-x-1">
                      <Globe className="h-3 w-3" />
                      <span>{service.region}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Response Data</h3>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <pre className="text-sm text-gray-600 overflow-x-auto whitespace-pre-wrap font-mono">
                  {JSON.stringify(service.data, null, 2)}
                </pre>
              </div>
            </div>
            
            <div>
              {renderServiceSpecificData()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};