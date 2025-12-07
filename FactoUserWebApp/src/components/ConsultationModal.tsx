import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';
import { useAuth } from '../contexts/AuthContext';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  category?: string; // service, course, updated, general
  itemName?: string; // Optional: name of the specific service/course/item for better tracking
}

export function ConsultationModal({ isOpen, onClose, onSuccess, category = 'service', itemName }: ConsultationModalProps) {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.fullName || '',
    email: user?.email || '',
    phoneNo: user?.phoneNumber || '',
    query: '',
    category: category,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Update form data when user changes
  useEffect(() => {
    if (user && isAuthenticated) {
      setFormData(prev => ({
        ...prev,
        name: user.fullName || prev.name,
        email: user.email || prev.email,
        phoneNo: user.phoneNumber || prev.phoneNo,
      }));
    }
  }, [user, isAuthenticated]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // At least one contact method is required
    if (!formData.email.trim() && !formData.phoneNo.trim()) {
      newErrors.contact = 'Either email or phone number is required';
    }

    // Validate email format if provided
    if (formData.email.trim() && !/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate phone number format if provided (10-digit Indian number)
    if (formData.phoneNo.trim() && !/^[6-9]\d{9}$/.test(formData.phoneNo.trim())) {
      newErrors.phoneNo = 'Please enter a valid 10-digit Indian mobile number';
    }

    if (!formData.query.trim()) {
      newErrors.query = 'Please describe your consultation need';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Build query with item name if provided
      let queryText = formData.query.trim();
      if (itemName) {
        queryText = `Regarding: ${itemName}\n\n${queryText}`;
      }

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phoneNo: formData.phoneNo.trim() || undefined,
        query: queryText,
        category: formData.category,
      };

      // Remove undefined fields
      Object.keys(payload).forEach(key => {
        if (payload[key as keyof typeof payload] === undefined) {
          delete payload[key as keyof typeof payload];
        }
      });

      const response = await axios.post(
        `${API_BASE_URL}/query/consultation`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
          // Reset form
          setFormData({
            name: user?.fullName || '',
            email: user?.email || '',
            phoneNo: user?.phoneNumber || '',
            query: '',
            category: category,
          });
          setSubmitSuccess(false);
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error submitting consultation request:', error);
      setErrors({
        submit: error.response?.data?.message || 'Failed to submit consultation request. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#007AFF] to-[#00C897] text-white p-6 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-2xl font-bold">Schedule Free Consultation</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white/20"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Request Submitted!</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We have received your consultation request. Our team will contact you within 24-48 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category (hidden, set automatically) */}
              <input type="hidden" name="category" value={formData.category} />

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                  required
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address {!formData.phoneNo && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email address"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phoneNo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number {!formData.email && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="tel"
                  id="phoneNo"
                  value={formData.phoneNo}
                  onChange={(e) => handleChange('phoneNo', e.target.value.replace(/\D/g, ''))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    errors.phoneNo ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your 10-digit mobile number"
                  maxLength={10}
                />
                {errors.phoneNo && <p className="text-red-500 text-sm mt-1">{errors.phoneNo}</p>}
                {errors.contact && <p className="text-red-500 text-sm mt-1">{errors.contact}</p>}
              </div>

              {/* Query/Message */}
              <div>
                <label htmlFor="query" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Consultation Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="query"
                  value={formData.query}
                  onChange={(e) => handleChange('query', e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    errors.query ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Please describe what you need help with..."
                  required
                />
                {errors.query && <p className="text-red-500 text-sm mt-1">{errors.query}</p>}
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-red-600 dark:text-red-400 text-sm">{errors.submit}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#007AFF] to-[#00C897] text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

