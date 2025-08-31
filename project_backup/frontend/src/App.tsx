import React, { useState, useEffect } from 'react';
import { RefreshCw, Server, Users, Package, ShoppingCart, AlertCircle, CheckCircle, MessageSquare, Star } from 'lucide-react';

interface ServiceResponse {
  service: string;
  version: string;
  data: any;
  timestamp: string;
  status: 'success' | 'error';
  responseTime?: number;
}

interface ServiceState {
  orders: ServiceResponse | null;
  inventory: ServiceResponse | null;
  users: ServiceResponse | null;
  reviews: ServiceResponse | null;
  ratings: ServiceResponse | null;
  loading: boolean;
  error: string | null;
}

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3001/api';

function App() {
  const [serviceState, setServiceState] = useState<ServiceState>({
    orders: null,
    inventory: null,
    users: null,
    reviews: null,
    ratings: null,
    loading: false,
    error: null
  });

  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchServiceData = async (service: string): Promise<ServiceResponse> => {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${API_BASE_URL}/${service}`, {
        headers: {
          'x-user': 'allowed-user',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const responseTime = Date.now() - startTime;
      
      return {
        service,
        version: data.version || 'unknown',
        data,
        timestamp: new Date().toISOString(),
        status: 'success',
        responseTime
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        service,
        version: 'error',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date().toISOString(),
        status: 'error',
        responseTime
      };
    }
  };

  const fetchAllServices = async () => {
    setServiceState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const [orders, inventory, users, reviews, ratings] = await Promise.all([
        fetchServiceData('orders'),
        fetchServiceData('inventory'),
        fetchServiceData('users'),
        fetchServiceData('reviews'),
        fetchServiceData('ratings')
      ]);
      
      setServiceState({
        orders,
        inventory,
        users,
        reviews,
        ratings,
        loading: false,
        error: null
      });
    } catch (error) {
      setServiceState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch services'
      }));
    }
  };

  useEffect(() => {
    fetchAllServices();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchAllServices, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

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
      case 'v2': return 'bg-green-100 text-green-800 border-green-200';
      case 'v3': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatResponseTime = (time?: number) => {
    if (!time) return 'N/A';
    return `${time}ms`;
  };

  const ServiceCard: React.FC<{ serviceResponse: ServiceResponse | null }> = ({ serviceResponse }) => {
    if (!serviceResponse) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Server className="h-6 w-6 text-gray-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Loading...</h3>
                <p className="text-sm text-gray-500">Fetching data...</p>
              </div>
            </div>
            <div className="animate-spin">
              <RefreshCw className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      );
    }

    const { service, version, data, timestamp, status, responseTime } = serviceResponse;
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${status === 'success' ? 'bg-blue-50' : 'bg-red-50'}`}>
              {getServiceIcon(service)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 capitalize">{service} Service</h3>
              <p className="text-sm text-gray-500">{formatResponseTime(responseTime)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getVersionColor(version)}`}>
              {version.toUpperCase()}
            </span>
            {status === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Response Data:</h4>
          <pre className="text-xs text-gray-600 overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
        
        <div className="mt-4 text-xs text-gray-400">
          Last updated: {new Date(timestamp).toLocaleString()}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Istio Microservices Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A production-ready microservices application demonstrating Istio traffic management, 
            security features, and service mesh capabilities with real-time monitoring.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
          <button
            onClick={fetchAllServices}
            disabled={serviceState.loading}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <RefreshCw className={`h-5 w-5 ${serviceState.loading ? 'animate-spin' : ''}`} />
            <span>Refresh Services</span>
          </button>
          
          <label className="flex items-center space-x-2 text-gray-700">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Auto-refresh (5s)</span>
          </label>
        </div>

        {/* Error Banner */}
        {serviceState.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-800">{serviceState.error}</p>
            </div>
          </div>
        )}

        {/* Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <ServiceCard serviceResponse={serviceState.orders} />
          <ServiceCard serviceResponse={serviceState.inventory} />
          <ServiceCard serviceResponse={serviceState.users} />
          <ServiceCard serviceResponse={serviceState.reviews} />
          <ServiceCard serviceResponse={serviceState.ratings} />
        </div>

        {/* Architecture Overview */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Architecture Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Services</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span><strong>Orders Service:</strong> Manages order data and processing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Package className="h-4 w-4" />
                  <span><strong>Inventory Service:</strong> Tracks product stock and availability</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span><strong>Users Service:</strong> Handles user profiles and authentication</span>
                </li>
                <li className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span><strong>Reviews Service:</strong> Manages product reviews and feedback</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Star className="h-4 w-4" />
                  <span><strong>Ratings Service:</strong> Aggregates ratings and analytics</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Server className="h-4 w-4" />
                  <span><strong>API Gateway:</strong> Routes and orchestrates service calls</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Istio Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Traffic splitting (v1/v2/v3) for A/B testing</li>
                <li>• Circuit breaking and outlier detection</li>
                <li>• Fault injection (delays and aborts)</li>
                <li>• Timeout and retry policies</li>
                <li>• mTLS with strict peer authentication</li>
                <li>• Authorization policies with header validation</li>
                <li>• Canary deployments and progressive rollouts</li>
                <li>• Multi-version routing with weighted distribution</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Built for demonstrating Istio service mesh capabilities in a production environment
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;