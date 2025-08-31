import React from 'react';
import { Package, User } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface HeaderProps {
  user: User | null;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onRefresh }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Stock Management & Reviews App
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>Welcome, {user.name}</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {user.role}
                </span>
              </div>
            )}
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};