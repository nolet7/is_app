import React from 'react';
import { Settings, Target, Clock, Zap, AlertTriangle } from 'lucide-react';

interface TestConfig {
  trafficSplit: { v1: number; v2: number };
  retryEnabled: boolean;
  faultInjection: boolean;
  circuitBreakerTest: boolean;
  timeoutTest: boolean;
}

interface ControlPanelProps {
  testConfig: TestConfig;
  setTestConfig: React.Dispatch<React.SetStateAction<TestConfig>>;
  onCircuitBreakerTest: () => void;
  onTimeoutTest: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  testConfig,
  setTestConfig,
  onCircuitBreakerTest,
  onTimeoutTest
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-purple-50 rounded-xl">
          <Settings className="h-6 w-6 text-purple-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Istio Testing Controls</h2>
      </div>

      <div className="space-y-6">
        {/* Traffic Split Control */}
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <label className="block text-sm font-semibold text-blue-900 mb-3">
            Traffic Split (A/B Testing)
          </label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">Version 1 (Stable)</span>
              <span className="text-sm font-bold text-blue-800">{testConfig.trafficSplit.v1}%</span>
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
              className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-emerald-700">Version 2 (Canary)</span>
              <span className="text-sm font-bold text-emerald-800">{testConfig.trafficSplit.v2}%</span>
            </div>
            <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
              💡 Adjust slider to test canary deployments and A/B traffic routing
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center space-x-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200 cursor-pointer hover:bg-emerald-100 transition-colors">
            <input
              type="checkbox"
              checked={testConfig.retryEnabled}
              onChange={(e) => setTestConfig(prev => ({ ...prev, retryEnabled: e.target.checked }))}
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <div>
              <span className="text-sm font-semibold text-emerald-900">Enable Retries</span>
              <p className="text-xs text-emerald-700">Automatic retry on failures</p>
            </div>
          </label>

          <label className="flex items-center space-x-3 p-4 bg-amber-50 rounded-xl border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors">
            <input
              type="checkbox"
              checked={testConfig.faultInjection}
              onChange={(e) => setTestConfig(prev => ({ ...prev, faultInjection: e.target.checked }))}
              className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <div>
              <span className="text-sm font-semibold text-amber-900">Fault Injection</span>
              <p className="text-xs text-amber-700">Simulate delays and errors</p>
            </div>
          </label>
        </div>

        {/* Test Buttons */}
        <div className="space-y-3">
          <button
            onClick={onCircuitBreakerTest}
            disabled={testConfig.circuitBreakerTest}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Target className="h-4 w-4" />
            <span>{testConfig.circuitBreakerTest ? 'Testing Circuit Breaker...' : 'Test Circuit Breaker'}</span>
          </button>

          <button
            onClick={onTimeoutTest}
            disabled={testConfig.timeoutTest}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Clock className="h-4 w-4" />
            <span>{testConfig.timeoutTest ? 'Testing Timeout...' : 'Test Timeout Policy'}</span>
          </button>
        </div>

        {/* Info Panel */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 text-gray-600 mt-0.5" />
            <div className="text-xs text-gray-600">
              <p className="font-medium mb-1">Testing Features:</p>
              <ul className="space-y-1">
                <li>• Traffic split demonstrates canary deployments</li>
                <li>• Fault injection simulates network issues</li>
                <li>• Circuit breaker prevents cascade failures</li>
                <li>• Timeout policies ensure responsiveness</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};