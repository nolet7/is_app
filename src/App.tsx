import React, { useState, useEffect } from 'react';
import { RefreshCw, Server, Users, Package, ShoppingCart, AlertCircle, CheckCircle, MessageSquare, Star, Network, Shield, Zap, BarChart3, Globe, Clock, TrendingUp, Activity } from 'lucide-react';

interface ServiceResponse {
  service: string;
  version: string;
  data: any;
  timestamp: string;
  status: 'success' | 'error' | 'warning';
  responseTime: number;
  region?: string;
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

// Simulated service data for demo purposes
const generateMockServiceData = (service: string): ServiceResponse => {
  const versions = service === 'reviews' ? ['v1', 'v2', 'v3'] : ['v1', 'v2'];
  const version = versions[Math.floor(Math.random() * versions.length)];
  const responseTime = Math.floor(Math.random() * 200) + 50;
  const status = Math.random() > 0.1 ? 'success' : (Math.random() > 0.5 ? 'warning' : 'error');
  const regions = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'];
  
  const mockData = {
    orders: {
      total_orders: 1247,
      pending: 23,
      processing: 45,
      completed: 1179,
      revenue: '$124,750.00',
      avg_order_value: '$99.80'
    },
    inventory: {
      total_items: 2847,
      in_stock: 2654,
      low_stock: 143,
      out_of_stock: 50,
      categories: 12,
      total_value: '$2,847,392.00'
    },
    users: {
      total_users: 15847,
      active_users: 12654,
      new_signups: 234,
      premium_users: 3421,
      retention_rate: '87.3%',
      avg_session: '24m'
    },
    reviews: {
      total_reviews: 8934,
      avg_rating: 4.3,
      pending_moderation: 12,
      verified_reviews: 7821,
      sentiment_positive: '78.5%',
      response_rate: '94.2%'
    },
    ratings: {
      overall_rating: 4.3,
      total_ratings: 12847,
      five_star: 7234,
      four_star: 3421,
      three_star: 1456,
      two_star: 456,
      one_star: 280
    }
  };

  return {
    service,
    version,
    data: {
      service,
      version,
      ...mockData[service as keyof typeof mockData],
      timestamp: Date.now()
    },
    timestamp: new Date().toISOString(),
    status,
    responseTime,
    region: regions[Math.floor(Math.random() * regions.length)]
  };
};

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
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const fetchAllServices = async () => {
    setServiceState(prev => ({ ...prev, loading: true, error: null }));
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    try {
      const services = ['orders', 'inventory', 'users', 'reviews', 'ratings'];
      const responses = services.map(service => generateMockServiceData(service));
      
      setServiceState({
        orders: responses[0],
        inventory: responses[1],
        users: responses[2],
        reviews: responses[3],
        ratings: responses[4],
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
      case 'v2': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'v3': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-emerald-500';
      case 'warning': return 'text-amber-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const formatResponseTime = (time: number) => {
    if (time < 100) return `${time}ms`;
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(1)}s`;
  };

  const ServiceCard: React.FC<{ serviceResponse: ServiceResponse | null; onClick: () => void }> = ({ serviceResponse, onClick }) => {
    if (!serviceResponse) {
      return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse">
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
            <div className="animate-spin">
              <RefreshCw className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      );
    }

    const { service, version, data, timestamp, status, responseTime, region } = serviceResponse;
    
    return (
      <div 
        className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer group"
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl transition-colors duration-200 ${
              status === 'success' ? 'bg-blue-50 group-hover:bg-blue-100' : 
              status === 'warning' ? 'bg-amber-50 group-hover:bg-amber-100' :
              'bg-red-50 group-hover:bg-red-100'
            }`}>
              <div className={getStatusColor(status)}>
                {getServiceIcon(service)}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 capitalize group-hover:text-blue-600 transition-colors">
                {service}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{formatResponseTime(responseTime)}</span>
                {region && (
                  <>
                    <span>•</span>
                    <Globe className="h-3 w-3" />
                    <span>{region}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getVersionColor(version)}`}>
              {version.toUpperCase()}
            </span>
            {status === 'success' ? (
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            ) : status === 'warning' ? (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          {service === 'orders' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-gray-900">{data.total_orders}</div>
                <div className="text-xs text-gray-500">Total Orders</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-emerald-600">{data.revenue}</div>
                <div className="text-xs text-gray-500">Revenue</div>
              </div>
            </div>
          )}
          
          {service === 'inventory' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-gray-900">{data.total_items}</div>
                <div className="text-xs text-gray-500">Total Items</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-600">{data.in_stock}</div>
                <div className="text-xs text-gray-500">In Stock</div>
              </div>
            </div>
          )}
          
          {service === 'users' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-gray-900">{data.total_users}</div>
                <div className="text-xs text-gray-500">Total Users</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-emerald-600">{data.retention_rate}</div>
                <div className="text-xs text-gray-500">Retention</div>
              </div>
            </div>
          )}
          
          {service === 'reviews' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-gray-900">{data.total_reviews}</div>
                <div className="text-xs text-gray-500">Total Reviews</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-amber-600">{data.avg_rating}</div>
                <div className="text-xs text-gray-500">Avg Rating</div>
              </div>
            </div>
          )}
          
          {service === 'ratings' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-gray-900">{data.total_ratings}</div>
                <div className="text-xs text-gray-500">Total Ratings</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-amber-600">{data.overall_rating}</div>
                <div className="text-xs text-gray-500">Overall</div>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-xs text-gray-400">
          Last updated: {new Date(timestamp).toLocaleString()}
        </div>
      </div>
    );
  };

  const ServiceModal: React.FC<{ service: ServiceResponse; onClose: () => void }> = ({ service, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-xl ${
                  service.status === 'success' ? 'bg-blue-50' : 
                  service.status === 'warning' ? 'bg-amber-50' :
                  'bg-red-50'
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
                    <span>{formatResponseTime(service.responseTime)}</span>
                    {service.region && <span>{service.region}</span>}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <AlertCircle className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <pre className="text-sm text-gray-600 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(service.data, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const MetricCard: React.FC<{ title: string; value: string; change: string; icon: React.ReactNode; trend: 'up' | 'down' }> = ({ title, value, change, icon, trend }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          <div className={`flex items-center mt-2 text-sm ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
            <TrendingUp className={`h-4 w-4 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
            <span>{change}</span>
          </div>
        </div>
        <div className="p-3 bg-blue-50 rounded-xl">
          <div className="text-blue-600">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                <Network className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Istio Microservices Demo
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A production-ready microservices application demonstrating Istio traffic management, 
              security features, and service mesh capabilities with real-time monitoring.
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <MetricCard
              title="Total Requests"
              value="2.4M"
              change="+12.5%"
              icon={<Activity className="h-6 w-6" />}
              trend="up"
            />
            <MetricCard
              title="Success Rate"
              value="99.8%"
              change="+0.2%"
              icon={<CheckCircle className="h-6 w-6" />}
              trend="up"
            />
            <MetricCard
              title="Avg Response"
              value="127ms"
              change="-8ms"
              icon={<Zap className="h-6 w-6" />}
              trend="up"
            />
            <MetricCard
              title="Active Services"
              value="5"
              change="100%"
              icon={<Server className="h-6 w-6" />}
              trend="up"
            />
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
            <button
              onClick={fetchAllServices}
              disabled={serviceState.loading}
              className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <RefreshCw className={`h-5 w-5 ${serviceState.loading ? 'animate-spin' : ''}`} />
              <span className="font-semibold">Refresh Services</span>
            </button>
            
            <label className="flex items-center space-x-3 text-gray-700 bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
              />
              <span className="font-medium">Auto-refresh (5s)</span>
            </label>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        {/* Error Banner */}
        {serviceState.error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 shadow-sm">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Service Error</h3>
                <p className="text-red-700">{serviceState.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
          <ServiceCard 
            serviceResponse={serviceState.orders} 
            onClick={() => serviceState.orders && setSelectedService('orders')}
          />
          <ServiceCard 
            serviceResponse={serviceState.inventory} 
            onClick={() => serviceState.inventory && setSelectedService('inventory')}
          />
          <ServiceCard 
            serviceResponse={serviceState.users} 
            onClick={() => serviceState.users && setSelectedService('users')}
          />
          <ServiceCard 
            serviceResponse={serviceState.reviews} 
            onClick={() => serviceState.reviews && setSelectedService('reviews')}
          />
          <ServiceCard 
            serviceResponse={serviceState.ratings} 
            onClick={() => serviceState.ratings && setSelectedService('ratings')}
          />
        </div>

        {/* Architecture Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Server className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Microservices Architecture</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Orders Service</h4>
                  <p className="text-sm text-gray-600">Manages order processing, payment validation, and order lifecycle management</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <Package className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Inventory Service</h4>
                  <p className="text-sm text-gray-600">Real-time stock tracking, warehouse management, and availability checks</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Users Service</h4>
                  <p className="text-sm text-gray-600">User authentication, profile management, and preference handling</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <MessageSquare className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Reviews Service</h4>
                  <p className="text-sm text-gray-600">Product reviews, sentiment analysis, and content moderation</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <Star className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Ratings Service</h4>
                  <p className="text-sm text-gray-600">Rating aggregation, analytics, and recommendation algorithms</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-purple-50 rounded-xl">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Istio Service Mesh</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Traffic Management</h4>
                  <p className="text-sm text-blue-700">A/B testing, canary deployments, and intelligent load balancing</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
                <Shield className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-emerald-900">Security</h4>
                  <p className="text-sm text-emerald-700">mTLS encryption, authorization policies, and zero-trust networking</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                <Zap className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-purple-900">Resilience</h4>
                  <p className="text-sm text-purple-700">Circuit breaking, fault injection, and automatic retries</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border border-amber-200">
                <Activity className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-900">Observability</h4>
                  <p className="text-sm text-amber-700">Distributed tracing, metrics collection, and real-time monitoring</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Traffic Routing Visualization */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
              <Network className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Traffic Routing Strategy</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl p-6 mb-4">
                <h3 className="text-lg font-bold text-blue-900 mb-2">A/B Testing</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Version 1</span>
                    <span className="font-semibold text-blue-900">70%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Version 2</span>
                    <span className="font-semibold text-blue-900">30%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">Gradual rollout of new features with traffic splitting</p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-emerald-100 to-emerald-200 rounded-xl p-6 mb-4">
                <h3 className="text-lg font-bold text-emerald-900 mb-2">Canary Deployment</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-700">Stable</span>
                    <span className="font-semibold text-emerald-900">95%</span>
                  </div>
                  <div className="w-full bg-emerald-200 rounded-full h-2">
                    <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-700">Canary</span>
                    <span className="font-semibold text-emerald-900">5%</span>
                  </div>
                  <div className="w-full bg-emerald-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '5%' }}></div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">Safe deployment with minimal risk exposure</p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl p-6 mb-4">
                <h3 className="text-lg font-bold text-purple-900 mb-2">Feature Flags</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-700">Default</span>
                    <span className="font-semibold text-purple-900">90%</span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-700">Beta Features</span>
                    <span className="font-semibold text-purple-900">10%</span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div className="bg-amber-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">Header-based routing for feature experimentation</p>
            </div>
          </div>
        </div>

        {/* Service Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Service Status Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <ServiceCard 
              serviceResponse={serviceState.orders} 
              onClick={() => serviceState.orders && setSelectedService('orders')}
            />
            <ServiceCard 
              serviceResponse={serviceState.inventory} 
              onClick={() => serviceState.inventory && setSelectedService('inventory')}
            />
            <ServiceCard 
              serviceResponse={serviceState.users} 
              onClick={() => serviceState.users && setSelectedService('users')}
            />
            <ServiceCard 
              serviceResponse={serviceState.reviews} 
              onClick={() => serviceState.reviews && setSelectedService('reviews')}
            />
            <ServiceCard 
              serviceResponse={serviceState.ratings} 
              onClick={() => serviceState.ratings && setSelectedService('ratings')}
            />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Traffic Management</h3>
            </div>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Intelligent load balancing</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Canary deployments</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Blue-green deployments</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Traffic mirroring</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <Shield className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Security Features</h3>
            </div>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Mutual TLS (mTLS)</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Authorization policies</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>JWT validation</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Rate limiting</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-purple-50 rounded-xl">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Observability</h3>
            </div>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Distributed tracing</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Metrics collection</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Access logging</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Performance monitoring</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-12 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Network className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-700">Powered by Istio Service Mesh</span>
          </div>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Built for demonstrating enterprise-grade microservices architecture with advanced traffic management, 
            security, and observability features in a production environment.
          </p>
        </div>
      </div>

      {/* Service Detail Modal */}
      {selectedService && serviceState[selectedService as keyof ServiceState] && (
        <ServiceModal
          service={serviceState[selectedService as keyof ServiceState] as ServiceResponse}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
}

export default App;