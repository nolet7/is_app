import React from 'react';
import { 
  Clock, Globe, CheckCircle, AlertCircle, Play,
  ShoppingCart, Package, Users, MessageSquare, Star, Server
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

interface ServiceCardProps {
  service: ServiceResponse | null;
  onTest: () => void;
  onClick?: () => void;
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

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onTest, onClick }) => {
  if (!service) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gray-100 rounded-xl">
              <div className="h-6 w-6 bg-gray-200 rounded shimmer"></div>
            </div>
            <div>
              <div className="h-4 w-24 bg-gray-200 rounded mb-2 shimmer"></div>
              <div className="h-3 w-16 bg-gray-200 rounded shimmer"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const truncatedData = JSON.stringify(service.data, null, 2).slice(0, 150) + '...';

  return (
    <div 
      className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all duration-200 cursor-pointer group animate-fade-in"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-xl transition-colors duration-200 ${
            service.status === 'healthy' ? 'bg-emerald-50 group-hover:bg-emerald-100' : 
            service.status === 'timeout' ? 'bg-amber-50 group-hover:bg-amber-100' : 
            'bg-red-50 group-hover:bg-red-100'
          }`}>
            <div className={getStatusColor(service.status)}>
              {getServiceIcon(service.service)}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 capitalize group-hover:text-blue-600 transition-colors">
              {service.service}
            </h3>
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
          service.status === 'healthy' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
          service.status === 'timeout' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
          'bg-red-50 text-red-700 border border-red-200'
        }`}>
          Status: {service.status === 'healthy' ? 'Healthy' : service.status === 'timeout' ? 'Timeout' : 'Error'}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <h4 className="text-xs font-medium text-gray-700 mb-2">Sample Response:</h4>
        <pre className="text-xs text-gray-600 overflow-hidden font-mono">
          {truncatedData}
        </pre>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onTest();
        }}
        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200 shadow-sm hover:shadow-md"
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