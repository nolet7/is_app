import React from 'react';
import { BarChart3, TrendingUp, Activity, Zap } from 'lucide-react';

interface MetricPoint {
  timestamp: number;
  responseTime: number;
  success: boolean;
  service: string;
}

interface MetricsChartProps {
  metrics: MetricPoint[];
}

export const MetricsChart: React.FC<MetricsChartProps> = ({ metrics }) => {
  const recentMetrics = metrics.slice(-30);
  const maxResponseTime = Math.max(...recentMetrics.map(m => m.responseTime), 100);
  
  const successRate = recentMetrics.length > 0 
    ? ((recentMetrics.filter(m => m.success).length / recentMetrics.length) * 100).toFixed(1)
    : '0.0';
    
  const avgResponseTime = recentMetrics.length > 0
    ? Math.round(recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length)
    : 0;

  const errorCount = recentMetrics.filter(m => !m.success).length;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-blue-50 rounded-xl">
          <BarChart3 className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Real-Time Metrics</h2>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{successRate}%</div>
          <div className="text-sm text-emerald-700">Success Rate</div>
        </div>
        
        <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-center mb-2">
            <Zap className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{avgResponseTime}ms</div>
          <div className="text-sm text-blue-700">Avg Response</div>
        </div>
        
        <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
          <div className="flex items-center justify-center mb-2">
            <Activity className="h-5 w-5 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600">{errorCount}</div>
          <div className="text-sm text-red-700">Errors</div>
        </div>
      </div>

      {/* Response Time Chart */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Response Time Timeline</h3>
        <div className="h-32 flex items-end space-x-1 bg-gray-50 rounded-lg p-3">
          {recentMetrics.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <span className="text-sm">No data yet - start testing services</span>
            </div>
          ) : (
            recentMetrics.map((metric, index) => (
              <div
                key={index}
                className={`flex-1 rounded-t metric-bar ${
                  metric.success ? 'bg-emerald-500' : 'bg-red-500'
                } opacity-70 hover:opacity-100 transition-all duration-200`}
                style={{ 
                  height: `${Math.max((metric.responseTime / maxResponseTime) * 100, 5)}%`,
                  minHeight: '4px'
                }}
                title={`${metric.service}: ${metric.responseTime}ms - ${metric.success ? 'Success' : 'Failed'} at ${new Date(metric.timestamp).toLocaleTimeString()}`}
              />
            ))
          )}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Oldest</span>
          <span>Latest</span>
        </div>
      </div>

      {/* Service Breakdown */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Service Performance</h3>
        <div className="space-y-2">
          {['orders', 'inventory', 'users', 'reviews', 'ratings'].map(serviceName => {
            const serviceMetrics = recentMetrics.filter(m => m.service === serviceName);
            const serviceSuccessRate = serviceMetrics.length > 0 
              ? ((serviceMetrics.filter(m => m.success).length / serviceMetrics.length) * 100).toFixed(0)
              : '0';
            
            return (
              <div key={serviceName} className="flex items-center justify-between text-sm">
                <span className="capitalize text-gray-700">{serviceName}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${serviceSuccessRate}%` }}
                    />
                  </div>
                  <span className="text-gray-600 w-8">{serviceSuccessRate}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};