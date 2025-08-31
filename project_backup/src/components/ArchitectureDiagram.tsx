import React from 'react';
import { Server, Shield, BarChart3, Activity, ArrowDown, ArrowRight } from 'lucide-react';

export const ArchitectureDiagram: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
        Istio Service Mesh Architecture
      </h2>
      
      <div className="space-y-8">
        {/* User Layer */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Server className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <div className="font-bold text-blue-900">User Requests</div>
              <div className="text-sm text-blue-700">External Traffic</div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <ArrowDown className="h-6 w-6 text-gray-400" />
        </div>

        {/* Istio Gateway */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <div className="font-bold text-purple-900">Istio Gateway</div>
              <div className="text-sm text-purple-700">TLS Termination & Routing</div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <ArrowDown className="h-6 w-6 text-gray-400" />
        </div>

        {/* Frontend */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200">
            <div className="p-2 bg-emerald-600 rounded-lg">
              <Server className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <div className="font-bold text-emerald-900">React Frontend</div>
              <div className="text-sm text-emerald-700">NGINX + Static Assets</div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <ArrowDown className="h-6 w-6 text-gray-400" />
        </div>

        {/* API Gateway */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
            <div className="p-2 bg-amber-600 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <div className="font-bold text-amber-900">API Gateway</div>
              <div className="text-sm text-amber-700">Request Orchestration</div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <ArrowDown className="h-6 w-6 text-gray-400" />
        </div>

        {/* Microservices Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { name: 'orders', color: 'blue' },
            { name: 'inventory', color: 'emerald' },
            { name: 'users', color: 'purple' },
            { name: 'reviews', color: 'amber' },
            { name: 'ratings', color: 'red' }
          ].map(({ name, color }) => (
            <div key={name} className="text-center">
              <div className={`p-4 bg-${color}-50 rounded-xl border-2 border-${color}-200 mb-2`}>
                <div className={`p-2 bg-${color}-600 rounded-lg inline-block mb-2`}>
                  <div className="text-white">
                    {name === 'orders' && <Server className="h-5 w-5" />}
                    {name === 'inventory' && <Package className="h-5 w-5" />}
                    {name === 'users' && <Users className="h-5 w-5" />}
                    {name === 'reviews' && <MessageSquare className="h-5 w-5" />}
                    {name === 'ratings' && <Star className="h-5 w-5" />}
                  </div>
                </div>
                <div className={`font-bold text-${color}-900 capitalize`}>{name}</div>
                <div className={`text-xs text-${color}-700`}>v1 • v2 {name === 'reviews' ? '• v3' : ''}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Istio Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <div className="p-3 bg-blue-600 rounded-xl inline-block mb-4">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-blue-900 mb-2">Traffic Management</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Load balancing</li>
              <li>• A/B testing</li>
              <li>• Canary deployments</li>
              <li>• Traffic splitting</li>
            </ul>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
            <div className="p-3 bg-emerald-600 rounded-xl inline-block mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-emerald-900 mb-2">Security</h3>
            <ul className="text-sm text-emerald-700 space-y-1">
              <li>• mTLS encryption</li>
              <li>• Authorization policies</li>
              <li>• JWT validation</li>
              <li>• Zero-trust networking</li>
            </ul>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
            <div className="p-3 bg-purple-600 rounded-xl inline-block mb-4">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-purple-900 mb-2">Resilience</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Circuit breaking</li>
              <li>• Automatic retries</li>
              <li>• Timeout policies</li>
              <li>• Fault injection</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};