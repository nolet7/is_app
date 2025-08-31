import React, { useState, useEffect, useCallback } from 'react';
import { 
  RefreshCw, Server, Users, Package, ShoppingCart, MessageSquare, Star, 
  AlertCircle, CheckCircle, Clock, Globe, Settings, Zap, Shield, 
  BarChart3, Activity, TrendingUp, Play, Pause, Target, AlertTriangle
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

interface ServiceState {
  [key: string]: ServiceResponse | null;
}

interface TestConfig {
  trafficSplit: { v1: number; v2: number };
  retryEnabled: boolean;
  faultInjection: boolean;
  circuitBreakerTest: boolean;
  timeoutTest: boolean;
}

interface MetricPoint {
  timestamp: number;
  responseTime: number;
  success: boolean;
  service: string;
}

const SERVICES = ['orders', 'inventory', 'users', 'reviews', 'ratings'];

// Mock API Gateway URL - in production this would be your actual gateway
const API_BASE_URL = '/api';

function App() {
  const [services, setServices] = useState<ServiceState>({});
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<MetricPoint[]>([]);
  const [testConfig, setTestConfig] = useState<TestConfig>({
    trafficSplit: { v1: 70, v2: 30 },
    retryEnabled: true,
    faultInjection: false,
    circuitBreakerTest: false,
    timeoutTest: false
  });

  // Simulate realistic service responses for demo
  const generateServiceResponse = useCallback((serviceName: string): ServiceResponse => {
    const versions = serviceName === 'reviews' ? ['v1', 'v2', 'v3'] : ['v1', 'v2'];
    const version = Math.random() < (testConfig.trafficSplit.v1 / 100) ? 'v1' : 'v2';
    
    // Simulate different response times and occasional errors
    let responseTime = Math.floor(Math.random() * 200) + 50;
    let status: 'healthy' | 'error' | 'timeout' = 'healthy';
    
    if (testConfig.faultInjection && Math.random() < 0.15) {
      status = Math.random() < 0.7 ? 'timeout' : 'error';
      responseTime = status === 'timeout' ? 5000 : responseTime;
    }
    
    if (testConfig.timeoutTest && serviceName === 'orders') {
      status = 'timeout';
      responseTime = 8000;
    }

    const mockData = {
      orders: {
        total_orders: 1247 + Math.floor(Math.random() * 100),
        pending: 23 + Math.floor(Math.random() * 10),
        processing: 45 + Math.floor(Math.random() * 20),
        completed: 1179 + Math.floor(Math.random() * 50),
        revenue: `$${(124750 + Math.random() * 10000).toFixed(2)}`,
        avg_order_value: `$${(99.80 + Math.random() * 20).toFixed(2)}`,
        recent_orders: [
          { id: 'ORD-001', customer: 'john@example.com', amount: 299.99, status: 'confirmed' },
          { id: 'ORD-002', customer: 'jane@example.com', amount: 149.50, status: 'processing' }
        ]
      },
      inventory: {
        total_items: 2847,
        in_stock: 2654 - Math.floor(Math.random() * 100),
        low_stock: 143 + Math.floor(Math.random() * 20),
        out_of_stock: 50 + Math.floor(Math.random() * 10),
        categories: 12,
        total_value: `$${(2847392 + Math.random() * 100000).toFixed(2)}`,
        products: [
          { sku: 'LAP-001', name: 'Gaming Laptop', stock: 15, price: 1299.99 },
          { sku: 'PHN-002', name: 'Smartphone', stock: 42, price: 899.00 },
          { sku: 'HDH-003', name: 'Wireless Headphones', stock: 28, price: 199.99 }
        ]
      },
      users: {
        total_users: 15847 + Math.floor(Math.random() * 100),
        active_users: 12654 + Math.floor(Math.random() * 50),
        new_signups: 234 + Math.floor(Math.random() * 20),
        premium_users: 3421 + Math.floor(Math.random() * 30),
        retention_rate: `${(87.3 + Math.random() * 5).toFixed(1)}%`,
        avg_session: `${(24 + Math.random() * 10).toFixed(0)}m`,
        recent_users: [
          { id: 'USR-001', email: 'john.doe@example.com', role: 'customer', active: true },
          { id: 'USR-002', email: 'jane.smith@example.com', role: 'premium', active: true }
        ]
      },
      reviews: {
        total_reviews: 8934 + Math.floor(Math.random() * 100),
        avg_rating: (4.3 + Math.random() * 0.4).toFixed(1),
        pending_moderation: 12 + Math.floor(Math.random() * 5),
        verified_reviews: 7821 + Math.floor(Math.random() * 50),
        sentiment_positive: `${(78.5 + Math.random() * 10).toFixed(1)}%`,
        response_rate: `${(94.2 + Math.random() * 3).toFixed(1)}%`,
        recent_reviews: [
          { id: 'REV-001', product: 'Gaming Laptop', rating: 5, comment: 'Excellent performance!' },
          { id: 'REV-002', product: 'Smartphone', rating: 4, comment: 'Great camera quality' }
        ]
      },
      ratings: {
        overall_rating: (4.3 + Math.random() * 0.3).toFixed(1),
        total_ratings: 12847 + Math.floor(Math.random() * 100),
        five_star: 7234 + Math.floor(Math.random() * 50),
        four_star: 3421 + Math.floor(Math.random() * 30),
        three_star: 1456 + Math.floor(Math.random() * 20),
        two_star: 456 + Math.floor(Math.random() * 10),
        one_star: 280 + Math.floor(Math.random() * 5),
        trending: Math.random() > 0.5 ? 'up' : 'down',
        categories: {
          electronics: 4.5,
          accessories: 4.2,
          audio: 4.7
        }
      }
    };

    return {
      service: serviceName,
      version,
      status,
      responseTime,
      timestamp: new Date().toISOString(),
      data: {
        service: serviceName,
        version,
        ...mockData[serviceName as keyof typeof mockData],
        timestamp: Date.now()
      },
      region: ['us-east-1', 'us-west-2', 'eu-west-1'][Math.floor(Math.random() * 3)]
    };
  }, [testConfig]);

  const fetchService = useCallback(async (serviceName: string): Promise<ServiceResponse> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 300));
    
    // Add metric point
    const response = generateServiceResponse(serviceName);
    const metricPoint: MetricPoint = {
      timestamp: Date.now(),
      responseTime: response.responseTime,
      success: response.status === 'healthy',
      service: serviceName
    };
    
    setMetrics(prev => [...prev.slice(-50), metricPoint]);
    
    return response;
  }, [generateServiceResponse]);

  const fetchAllServices = useCallback(async () => {
    setLoading(true);
    try {
      const responses = await Promise.all(
        SERVICES.map(service => fetchService(service))
      );
      
      const newState: ServiceState = {};
      responses.forEach(response => {
        newState[response.service] = response;
      });
      
      setServices(newState);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchService]);

  const testCircuitBreaker = async () => {
    setTestConfig(prev => ({ ...prev, circuitBreakerTest: true }));
    
    // Simulate burst of requests
    const promises = Array(20).fill(null).map(() => fetchService('orders'));
    await Promise.all(promises);
    
    setTimeout(() => {
      setTestConfig(prev => ({ ...prev, circuitBreakerTest: false }));
    }, 3000);
  };

  const testTimeout = async () => {
    setTestConfig(prev => ({ ...prev, timeoutTest: true }));
    await fetchService('orders');
    setTimeout(() => {
      setTestConfig(prev => ({ ...prev, timeoutTest: false }));
    }, 2000);
  };

  useEffect(() => {
    fetchAllServices();
  }, [fetchAllServices]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchAllServices, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchAllServices]);

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

  const ServiceCard: React.FC<{ service: ServiceResponse | null; onTest: () => void }> = ({ service, onTest }) => {
    if (!service) {
      return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gray-100 rounded-xl">
                <div className="h-6 w-6 bg-gray-200 rounded"></div>
              </div>
              <div>
                <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const truncatedData = JSON.stringify(service.data, null, 2).slice(0, 200) + '...';

    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-lg transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
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
              <h3 className="text-lg font-semibold text-gray-900 capitalize">{service.service}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{service.responseTime}ms</span>
                {service.region && (
                  <>
                    <span>•</span>
                    <Globe className="h-3 w-3" />
                    <span>{service.region}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getVersionColor(service.version)}`}>
              {service.version.toUpperCase()}
            </span>
            {service.status === 'healthy' ? (
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            ) : service.status === 'timeout' ? (
              <Clock className="h-5 w-5 text-amber-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
        </div>

        <div className="mb-4">
          <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
            service.status === 'healthy' ? 'bg-emerald-50 text-emerald-700' :
            service.status === 'timeout' ? 'bg-amber-50 text-amber-700' :
            'bg-red-50 text-red-700'
          }`}>
            Status: {service.status === 'healthy' ? 'Healthy' : service.status === 'timeout' ? 'Timeout' : 'Error'}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Sample Response:</h4>
          <pre className="text-xs text-gray-600 overflow-hidden">
            {truncatedData}
          </pre>
        </div>

        <button
          onClick={onTest}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Play className="h-4 w-4" />
          <span>Test Service</span>
        </button>

        <div className="mt-3 text-xs text-gray-400">
          Last updated: {new Date(service.timestamp).toLocaleString()}
        </div>
      </div>
    );
  };

  const ControlPanel: React.FC = () => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-purple-50 rounded-xl">
          <Settings className="h-6 w-6 text-purple-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Istio Testing Controls</h2>
      </div>

      <div className="space-y-6">
        {/* Traffic Split Control */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Traffic Split (A/B Testing)
          </label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Version 1</span>
              <span className="text-sm font-semibold text-blue-600">{testConfig.trafficSplit.v1}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={testConfig.trafficSplit.v1}
              onChange={(e) => {
                const v1 = parseInt(e.target.value);
                setTestConfig(prev => ({
                  ...prev,
                  trafficSplit: { v1, v2: 100 - v1 }
                }));
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Version 2</span>
              <span className="text-sm font-semibold text-emerald-600">{testConfig.trafficSplit.v2}%</span>
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={testConfig.retryEnabled}
              onChange={(e) => setTestConfig(prev => ({ ...prev, retryEnabled: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Enable Retries</span>
              <p className="text-xs text-gray-500">Automatic retry on failures</p>
            </div>
          </label>

          <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={testConfig.faultInjection}
              onChange={(e) => setTestConfig(prev => ({ ...prev, faultInjection: e.target.checked }))}
              className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Fault Injection</span>
              <p className="text-xs text-gray-500">Simulate delays and errors</p>
            </div>
          </label>
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={testCircuitBreaker}
            disabled={testConfig.circuitBreakerTest}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <Target className="h-4 w-4" />
            <span>{testConfig.circuitBreakerTest ? 'Testing...' : 'Test Circuit Breaker'}</span>
          </button>

          <button
            onClick={testTimeout}
            disabled={testConfig.timeoutTest}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <Clock className="h-4 w-4" />
            <span>{testConfig.timeoutTest ? 'Testing...' : 'Test Timeout'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  const MetricsChart: React.FC = () => {
    const recentMetrics = metrics.slice(-20);
    const maxResponseTime = Math.max(...recentMetrics.map(m => m.responseTime), 100);
    
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-blue-50 rounded-xl">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Real-Time Metrics</h2>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {((recentMetrics.filter(m => m.success).length / Math.max(recentMetrics.length, 1)) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {recentMetrics.length > 0 ? Math.round(recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length) : 0}ms
            </div>
            <div className="text-sm text-gray-500">Avg Response</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{recentMetrics.length}</div>
            <div className="text-sm text-gray-500">Recent Requests</div>
          </div>
        </div>

        <div className="h-32 flex items-end space-x-1">
          {recentMetrics.map((metric, index) => (
            <div
              key={index}
              className={`flex-1 rounded-t ${metric.success ? 'bg-emerald-500' : 'bg-red-500'} opacity-70 hover:opacity-100 transition-opacity`}
              style={{ height: `${(metric.responseTime / maxResponseTime) * 100}%` }}
              title={`${metric.service}: ${metric.responseTime}ms - ${metric.success ? 'Success' : 'Failed'}`}
            />
          ))}
        </div>
      </div>
    );
  };

  const ServiceModal: React.FC<{ service: ServiceResponse; onClose: () => void }> = ({ service, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
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
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getVersionColor(service.version)}`}>
                    {service.version.toUpperCase()}
                  </span>
                  <span>{service.responseTime}ms</span>
                  {service.region && <span>{service.region}</span>}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <pre className="text-sm text-gray-600 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(service.data, null, 2)}
                </pre>
              </div>
            </div>
            
            {service.service === 'inventory' && service.data.products && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Inventory</h3>
                <div className="space-y-3">
                  {service.data.products.map((product: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">${product.price}</div>
                        <div className={`text-sm ${product.stock > 20 ? 'text-emerald-600' : product.stock > 5 ? 'text-amber-600' : 'text-red-600'}`}>
                          {product.stock} in stock
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <Server className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Istio Microservices Demo – Production App
                </h1>
                <p className="text-gray-600">Real-time service mesh monitoring and testing</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-gray-700">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium">Auto-refresh</span>
              </label>
              
              <button
                onClick={fetchAllServices}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">5</div>
                <div className="text-sm text-gray-500">Active Services</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Server className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-emerald-600">
                  {((metrics.filter(m => m.success).length / Math.max(metrics.length, 1)) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Success Rate</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {metrics.length > 0 ? Math.round(metrics.slice(-10).reduce((sum, m) => sum + m.responseTime, 0) / Math.min(metrics.length, 10)) : 0}ms
                </div>
                <div className="text-sm text-gray-500">Avg Response</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-amber-600">{metrics.length}</div>
                <div className="text-sm text-gray-500">Total Requests</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl">
                <Activity className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Control Panel */}
          <div className="lg:col-span-1">
            <ControlPanel />
          </div>
          
          {/* Metrics Chart */}
          <div className="lg:col-span-2">
            <MetricsChart />
          </div>
        </div>

        {/* Service Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Service Status Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {SERVICES.map(serviceName => (
              <ServiceCard
                key={serviceName}
                service={services[serviceName]}
                onTest={() => fetchService(serviceName)}
              />
            ))}
          </div>
        </div>

        {/* Istio Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Traffic Management</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• A/B testing with traffic splitting</li>
              <li>• Canary deployments</li>
              <li>• Blue-green deployments</li>
              <li>• Request routing and load balancing</li>
              <li>• Traffic mirroring</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <Shield className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Security</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Mutual TLS (mTLS) encryption</li>
              <li>• Authorization policies</li>
              <li>• JWT token validation</li>
              <li>• Rate limiting and throttling</li>
              <li>• Zero-trust networking</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-purple-50 rounded-xl">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Resilience</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Circuit breaking</li>
              <li>• Automatic retries</li>
              <li>• Timeout policies</li>
              <li>• Fault injection testing</li>
              <li>• Outlier detection</li>
            </ul>
          </div>
        </div>

        {/* Architecture Diagram */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Microservices Architecture</h2>
          
          <div className="flex flex-col items-center space-y-8">
            {/* Frontend Layer */}
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
              <Server className="h-8 w-8 text-blue-600" />
              <div>
                <div className="font-bold text-blue-900">React Frontend</div>
                <div className="text-sm text-blue-700">User Interface & Dashboard</div>
              </div>
            </div>

            {/* Arrow */}
            <div className="text-gray-400">
              ↓
            </div>

            {/* API Gateway */}
            <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
              <Shield className="h-8 w-8 text-purple-600" />
              <div>
                <div className="font-bold text-purple-900">Istio Gateway + API Gateway</div>
                <div className="text-sm text-purple-700">Traffic Management & Security</div>
              </div>
            </div>

            {/* Arrow */}
            <div className="text-gray-400">
              ↓
            </div>

            {/* Microservices */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {SERVICES.map(serviceName => (
                <div key={serviceName} className="flex flex-col items-center space-y-2 p-4 bg-emerald-50 rounded-xl border-2 border-emerald-200">
                  {getServiceIcon(serviceName)}
                  <div className="text-sm font-medium text-emerald-900 capitalize">{serviceName}</div>
                  <div className="text-xs text-emerald-700">v1 / v2</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Server className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-700">Powered by Istio Service Mesh</span>
          </div>
          <p className="text-gray-500 max-w-3xl mx-auto">
            This production-ready application demonstrates enterprise-grade microservices architecture 
            with advanced traffic management, security policies, and observability features. 
            Use the testing controls to experiment with Istio's powerful capabilities.
          </p>
        </div>
      </div>

      {/* Service Detail Modal */}
      {selectedService && services[selectedService] && (
        <ServiceModal
          service={services[selectedService] as ServiceResponse}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
}

export default App;