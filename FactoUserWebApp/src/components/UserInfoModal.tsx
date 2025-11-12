import { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';
import { Storage } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  missingFields: {
    phoneNumber?: boolean;
    email?: boolean;
    fullName?: boolean;
  };
  currentUser: {
    email?: string;
    fullName?: string;
    phoneNumber?: string;
  };
}

export function UserInfoModal({
  isOpen,
  onClose,
  onComplete,
  missingFields,
  currentUser
}: UserInfoModalProps) {
  const { refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    phoneNumber: currentUser.phoneNumber || '',
    email: currentUser.email || '',
    fullName: currentUser.fullName || ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (missingFields.phoneNumber) {
      if (!formData.phoneNumber) {
        newErrors.phoneNumber = 'Phone number is required';
      } else {
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(formData.phoneNumber)) {
          newErrors.phoneNumber = 'Please enter a valid 10-digit Indian mobile number';
        }
      }
    }

    if (missingFields.email) {
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
      }
    }

    if (missingFields.fullName) {
      if (!formData.fullName) {
        newErrors.fullName = 'Full name is required';
      } else if (formData.fullName.length < 2) {
        newErrors.fullName = 'Name must be at least 2 characters';
      } else if (!/^[a-zA-Z ]+$/.test(formData.fullName)) {
        newErrors.fullName = 'Name should only contain letters and spaces';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const authToken = await Storage.get('authToken');
      
      const updateData: any = {};
      if (missingFields.phoneNumber && formData.phoneNumber) {
        updateData.phoneNumber = formData.phoneNumber;
      }
      if (missingFields.email && formData.email) {
        updateData.email = formData.email.toLowerCase();
      }
      if (missingFields.fullName && formData.fullName) {
        updateData.fullName = formData.fullName.trim();
      }

      const response = await axios.put(
        `${API_BASE_URL}/user/profile`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Refresh user data in AuthContext
        await refreshUser();
        
        // Call onComplete callback to proceed with payment
        onComplete();
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      setSubmitError(
        error.response?.data?.message || 
        error.message || 
        'Failed to update profile. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    if (missingFields.phoneNumber) {
      return 'Mobile Number Required';
    }
    if (missingFields.email || missingFields.fullName) {
      return 'Additional Information Required';
    }
    return 'Complete Your Profile';
  };

  const getDescription = () => {
    if (missingFields.phoneNumber) {
      return 'Please provide your mobile number to proceed with the purchase.';
    }
    if (missingFields.email && missingFields.fullName) {
      return 'Please provide your name and email address to proceed with the purchase.';
    }
    if (missingFields.email) {
      return 'Please provide your email address to proceed with the purchase.';
    }
    if (missingFields.fullName) {
      return 'Please provide your full name to proceed with the purchase.';
    }
    return 'Please complete your profile to proceed.';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {getTitle()}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {getDescription()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {missingFields.phoneNumber && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setFormData({ ...formData, phoneNumber: value });
                  if (errors.phoneNumber) {
                    setErrors({ ...errors, phoneNumber: '' });
                  }
                }}
                placeholder="Enter 10-digit mobile number"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={10}
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
              )}
            </div>
          )}

          {missingFields.fullName && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, fullName: value });
                  if (errors.fullName) {
                    setErrors({ ...errors, fullName: '' });
                  }
                }}
                placeholder="Enter your full name"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
              )}
            </div>
          )}

          {missingFields.email && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) {
                    setErrors({ ...errors, email: '' });
                  }
                }}
                placeholder="Enter your email address"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>
          )}

          {submitError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#007AFF] to-[#00C897] text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                'Continue'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

