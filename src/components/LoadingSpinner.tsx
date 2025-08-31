import React from 'react';
import { Package } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <p className="text-gray-600 font-medium">Loading Stock Management & Reviews App...</p>
        <p className="text-sm text-gray-500 mt-1">Fetching products, ratings, and reviews</p>
      </div>
    </div>
  );
};