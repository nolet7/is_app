import React, { useState } from 'react';
import { AlertTriangle, X, Send, Package, ShoppingCart, Truck, CreditCard } from 'lucide-react';

interface ComplaintModalProps {
  onClose: () => void;
  onSubmit: (complaint: ComplaintData) => Promise<void>;
}

interface ComplaintData {
  category: string;
  orderId?: string;
  productId?: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  contactMethod: 'email' | 'phone';
}

const complaintCategories = [
  { id: 'product-quality', label: 'Product Quality Issues', icon: Package },
  { id: 'shipping-delivery', label: 'Shipping & Delivery', icon: Truck },
  { id: 'order-processing', label: 'Order Processing', icon: ShoppingCart },
  { id: 'payment-billing', label: 'Payment & Billing', icon: CreditCard },
  { id: 'customer-service', label: 'Customer Service', icon: AlertTriangle },
  { id: 'website-technical', label: 'Website Technical Issues', icon: AlertTriangle },
  { id: 'other', label: 'Other', icon: AlertTriangle }
];

export const ComplaintModal: React.FC<ComplaintModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<ComplaintData>({
    category: '',
    orderId: '',
    productId: '',
    subject: '',
    description: '',
    priority: 'medium',
    contactMethod: 'email'
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.category) newErrors.category = 'Please select a complaint category';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.description.length < 20) newErrors.description = 'Please provide more details (minimum 20 characters)';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Failed to submit complaint:', error);
      setErrors({ submit: 'Failed to submit complaint. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategory = complaintCategories.find(cat => cat.id === formData.category);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Submit a Complaint</h3>
                <p className="text-sm text-gray-600">We're here to help resolve your shopping experience issues</p>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Complaint Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What type of issue are you experiencing? *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {complaintCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <label
                    key={category.id}
                    className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${
                      formData.category === category.id
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={category.id}
                      checked={formData.category === category.id}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="sr-only"
                    />
                    <IconComponent className={`h-5 w-5 ${
                      formData.category === category.id ? 'text-red-600' : 'text-gray-500'
                    }`} />
                    <span className={`text-sm font-medium ${
                      formData.category === category.id ? 'text-red-900' : 'text-gray-700'
                    }`}>
                      {category.label}
                    </span>
                  </label>
                );
              })}
            </div>
            {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category}</p>}
          </div>

          {/* Order/Product Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order ID (if applicable)
              </label>
              <input
                type="text"
                value={formData.orderId}
                onChange={(e) => setFormData(prev => ({ ...prev, orderId: e.target.value }))}
                placeholder="ORD-123456"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product ID (if applicable)
              </label>
              <input
                type="text"
                value={formData.productId}
                onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
                placeholder="LAP-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Brief description of your issue"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            {errors.subject && <p className="text-red-600 text-sm mt-1">{errors.subject}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={5}
              placeholder="Please provide detailed information about your issue, including what happened, when it occurred, and how it affected your shopping experience..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
            <div className="flex justify-between items-center mt-1">
              {errors.description && <p className="text-red-600 text-sm">{errors.description}</p>}
              <p className="text-xs text-gray-500 ml-auto">
                {formData.description.length}/1000 characters
              </p>
            </div>
          </div>

          {/* Priority and Contact Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="low">Low - General feedback</option>
                <option value="medium">Medium - Issue affecting experience</option>
                <option value="high">High - Urgent issue requiring immediate attention</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Contact Method
              </label>
              <select
                value={formData.contactMethod}
                onChange={(e) => setFormData(prev => ({ ...prev, contactMethod: e.target.value as 'email' | 'phone' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
              </select>
            </div>
          </div>

          {/* Selected Category Info */}
          {selectedCategory && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <selectedCategory.icon className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Selected: {selectedCategory.label}</span>
              </div>
              <p className="text-sm text-blue-700">
                {formData.category === 'product-quality' && 'Issues with product defects, damage, or not meeting expectations.'}
                {formData.category === 'shipping-delivery' && 'Problems with delivery times, shipping damage, or lost packages.'}
                {formData.category === 'order-processing' && 'Issues with order placement, modifications, or cancellations.'}
                {formData.category === 'payment-billing' && 'Problems with charges, refunds, or payment processing.'}
                {formData.category === 'customer-service' && 'Issues with support interactions or service quality.'}
                {formData.category === 'website-technical' && 'Technical problems with the website or app functionality.'}
                {formData.category === 'other' && 'Any other issues not covered by the above categories.'}
              </p>
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !formData.category || !formData.subject.trim() || !formData.description.trim()}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
              <span>{submitting ? 'Submitting...' : 'Submit Complaint'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};