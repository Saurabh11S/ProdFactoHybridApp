import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchCourseById, Course } from '../api/courses';
import { API_BASE_URL } from '../config/apiConfig';
import axios from 'axios';
import { Storage } from '../utils/storage';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { UserInfoModal } from './UserInfoModal';
import { initializeRazorpayPayment } from '../utils/razorpay';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile' | 'course-payment';

interface CoursePaymentPageProps {
  onNavigate: (page: PageType) => void;
  courseId?: string;
}

export function CoursePaymentPage({ onNavigate, courseId }: CoursePaymentPageProps) {
  const { isAuthenticated, user, token, refreshUser, isLoading } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [missingFields, setMissingFields] = useState<{
    phoneNumber?: boolean;
    email?: boolean;
    fullName?: boolean;
  }>({});

  // Fetch course details
  useEffect(() => {
    const loadCourseDetails = async () => {
      if (!courseId) {
        setError('Course ID is required');
        setLoading(false);
        return;
      }

      // Don't load if not authenticated (will show login prompt)
      if (!isAuthenticated || !token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Get fresh token from storage to ensure it's current
        const authToken = await Storage.get('authToken');
        if (!authToken) {
          setError('Please log in to view course details');
          setLoading(false);
          return;
        }
        
        const courseData = await fetchCourseById(courseId, authToken);
        setCourse(courseData);
      } catch (err: any) {
        console.error('Error loading course details:', err);
        
        // Show actual error message from API if available
        const errorMessage = err.response?.data?.message || 
                           err.response?.data?.error?.message ||
                           err.message ||
                           'Failed to load course details. Please try again.';
        
        // Check if it's an authentication error
        if (err.response?.status === 401 || errorMessage.toLowerCase().includes('token') || errorMessage.toLowerCase().includes('unauthorized')) {
          setError('Your session has expired. Please log in again.');
        } else {
          setError(errorMessage);
        }
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && token) {
      loadCourseDetails();
    }
  }, [courseId, isAuthenticated, token]);

  // Check for missing user information
  const checkMissingInfo = () => {
    if (!user) return {};

    const missing: {
      phoneNumber?: boolean;
      email?: boolean;
      fullName?: boolean;
    } = {};

    // If user has email but no phone number (logged in with email/password)
    if (user.email && !user.phoneNumber) {
      missing.phoneNumber = true;
    }

    // If user has phone number but no email or name (logged in with phone/OTP)
    if (user.phoneNumber && (!user.email || !user.fullName)) {
      if (!user.email) missing.email = true;
      if (!user.fullName) missing.fullName = true;
    }

    return missing;
  };

  // Handle payment
  const handlePayment = async () => {
    if (!isAuthenticated || !user || !course) {
      onNavigate('login');
      return;
    }

    // Check for missing information
    const missing = checkMissingInfo();
    if (Object.keys(missing).length > 0) {
      setMissingFields(missing);
      setShowUserInfoModal(true);
      return;
    }

    // Proceed with payment if all info is present
    proceedWithPayment();
  };

  // Proceed with payment after user info is complete
  const proceedWithPayment = async () => {
    if (!isAuthenticated || !user || !course) {
      setPaymentError('Please log in to proceed with payment');
      return;
    }

    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      // Get fresh token from storage to ensure it's current
      const authToken = await Storage.get('authToken');
      if (!authToken) {
        setPaymentError('Your session has expired. Please log in again.');
        setIsProcessingPayment(false);
        onNavigate('login');
        return;
      }

      const paymentOrderData = {
        userId: user._id,
        items: [{
          itemType: 'course',
          itemId: course._id,
          price: course.price,
          billingPeriod: 'one-time',
          selectedFeatures: []
        }]
      };

      const paymentOrderResponse = await axios.post(`${API_BASE_URL}/payment/initiate-payment`, paymentOrderData, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      const { orderId, amount, currency, razorpayKeyId } = paymentOrderResponse.data.data;
      
      // Get Razorpay key from API response or fallback to environment variable or hardcoded test key
      const razorpayKey = razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_RH6v2Ap0TDGOmM';
      
      if (!razorpayKey) {
        setPaymentError('Razorpay is not configured. Please contact support.');
        setIsProcessingPayment(false);
        return;
      }
      
      if (Capacitor.isNativePlatform()) {
        // Mobile: Open Razorpay in in-app browser
        const paymentUrl = `https://razorpay.com/payment-button/pl_${orderId}`;
        await Browser.open({ 
          url: paymentUrl,
          toolbarColor: '#007AFF'
        });
        
        setPaymentError('Payment opened in browser. Please complete the payment and return to the app.');
        setIsProcessingPayment(false);
      } else {
        // Web: Use Razorpay utility for proper script loading
        try {
          await initializeRazorpayPayment({
            key: razorpayKey,
            amount: amount * 100, // Convert to paise
            currency: currency,
            name: 'FACTO',
            description: `Payment for ${course.title}`,
            order_id: orderId,
            prefill: {
              name: user.fullName || '',
              email: user.email || '',
              contact: user.phoneNumber || ''
            },
            handler: async function (response: any) {
              try {
                const token = await Storage.get('authToken');
                await axios.post(`${API_BASE_URL}/payment/verify-payment`, {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                }, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });

                setShowSuccessPopup(true);
                setIsProcessingPayment(false);
              } catch (error) {
                console.error('Payment verification failed:', error);
                setPaymentError('Payment successful, but verification failed. Please contact support.');
                setIsProcessingPayment(false);
              }
            },
            onDismiss: function() {
              setIsProcessingPayment(false);
            }
          });
        } catch (error: any) {
          console.error('Razorpay initialization error:', error);
          setPaymentError(error.message || 'Failed to initialize payment gateway. Please refresh the page and try again.');
          setIsProcessingPayment(false);
        }
      }
    } catch (error: any) {
      console.error('Payment initiation failed:', error);
      
      // Show actual error message from API if available
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error?.message ||
                          error.message ||
                          'Payment initiation failed. Please try again.';
      
      // Check if it's an authentication error
      if (error.response?.status === 401 || errorMessage.toLowerCase().includes('token') || errorMessage.toLowerCase().includes('unauthorized')) {
        setPaymentError('Your session has expired. Please log in again.');
        // Redirect to login after a short delay
        setTimeout(() => {
          onNavigate('login');
        }, 2000);
      } else {
        setPaymentError(errorMessage);
      }
      
      setIsProcessingPayment(false);
    }
  };

  // Handle user info modal completion
  const handleUserInfoComplete = async () => {
    setShowUserInfoModal(false);
    
    // Refresh user data from backend
    try {
      await refreshUser();
      // Small delay to ensure user state is updated
      setTimeout(() => {
        proceedWithPayment();
      }, 100);
    } catch (error) {
      console.error('Error refreshing user data:', error);
      proceedWithPayment();
    }
  };

  const formatDuration = (duration: { value: number; unit: string }) => {
    return `${duration.value} ${duration.unit}`;
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      onNavigate('login');
    }
  }, [isLoading, isAuthenticated, onNavigate]);

  // Loading state
  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-white dark:from-gray-900 dark:to-gray-800 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#007AFF]"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading course details...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-white dark:from-gray-900 dark:to-gray-800 pt-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="text-red-500 text-lg mb-4">Please log in to purchase this course</div>
          <button 
            onClick={() => onNavigate('login')}
            className="bg-[#007AFF] text-white px-6 py-2 rounded-lg hover:bg-[#0056CC] transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Error state
  if (error || (!loading && !course)) {
    const isAuthError = error?.toLowerCase().includes('token') || 
                       error?.toLowerCase().includes('session') || 
                       error?.toLowerCase().includes('unauthorized') ||
                       error?.toLowerCase().includes('log in');
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-white dark:from-gray-900 dark:to-gray-800 pt-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="text-red-500 text-lg mb-4">{error || 'Course not found'}</div>
          <div className="flex gap-3 justify-center">
            {isAuthError ? (
              <button 
                onClick={() => onNavigate('login')}
                className="bg-[#007AFF] text-white px-6 py-2 rounded-lg hover:bg-[#0056CC] transition-colors"
              >
                Go to Login
              </button>
            ) : (
              <>
                <button 
                  onClick={async () => {
                    setError(null);
                    setLoading(true);
                    try {
                      const authToken = await Storage.get('authToken');
                      if (authToken && courseId) {
                        const courseData = await fetchCourseById(courseId, authToken);
                        setCourse(courseData);
                      }
                    } catch (err: any) {
                      console.error('Error loading course:', err);
                      setError(err.response?.data?.message || 'Failed to load course');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="bg-[#007AFF] text-white px-6 py-2 rounded-lg hover:bg-[#0056CC] transition-colors"
                >
                  Retry
                </button>
                <button 
                  onClick={() => onNavigate('learning')}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Back to Courses
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Success popup
  if (showSuccessPopup) {
    if (!course) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-white dark:from-gray-900 dark:to-gray-800 pt-16 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Loading course information...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-white dark:from-gray-900 dark:to-gray-800 pt-16 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Payment Successful! 🎉
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Thank you for your purchase. You now have full access to "{course.title}".
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Amount Paid:</span>
                <span className="text-sm font-semibold">₹{course.price.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => onNavigate('learning')}
                className="w-full bg-gradient-to-r from-[#007AFF] to-[#0056CC] text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
              >
                Go to My Courses
              </button>
              <button
                onClick={() => onNavigate('home')}
                className="w-full border border-[#007AFF] dark:border-blue-400 text-[#007AFF] dark:text-blue-400 py-3 px-4 rounded-lg font-medium hover:bg-[#007AFF] hover:text-white dark:hover:bg-blue-500 dark:hover:text-white transition-all"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Ensure course is not null before rendering
  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-white dark:from-gray-900 dark:to-gray-800 pt-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Course not found</p>
          <button 
            onClick={() => onNavigate('learning')}
            className="mt-4 bg-[#007AFF] text-white px-6 py-2 rounded-lg hover:bg-[#0056CC] transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  // Filter out string IDs and ensure we have Lecture objects
  const lectures = (course.lectures || []).filter(
    (lecture): lecture is any => 
      typeof lecture === 'object' && 'videoUrl' in lecture
  );

  const availableLectures = lectures?.filter(
    (lecture: any) => lecture.videoUrl
  ).length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-white dark:from-gray-900 dark:to-gray-800 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#1F2937] dark:text-white mb-4">
            Complete Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AFF] to-[#00C897]">Purchase</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Secure payment gateway with 256-bit SSL encryption
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                {course.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                {course.description}
              </p>

              {/* Course Inclusions */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">
                  This course includes:
                </h4>
                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 text-sm space-y-2">
                  <li>
                    {formatDuration(course.duration)} on-demand videos
                  </li>
                  <li>Total Lectures: {course.totalLectures}</li>
                  <li>Available Lectures: {availableLectures}</li>
                  <li>Language: {course.language}</li>
                  <li>Category: {course.category}</li>
                </ul>
              </div>

              {/* Payment Error */}
              {paymentError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-4">
                  <p className="text-red-600 dark:text-red-400 text-sm">{paymentError}</p>
                </div>
              )}

              {/* Buy Now Button */}
              <div className="flex gap-3">
                <button
                  onClick={handlePayment}
                  disabled={isProcessingPayment}
                  className="flex-1 bg-gradient-to-r from-[#007AFF] to-[#00C897] text-white rounded-full px-6 py-3 font-medium hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessingPayment ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    'Buy Now'
                  )}
                </button>
                <button 
                  onClick={() => onNavigate('learning')}
                  className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 rounded-full px-6 py-3 font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Course Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Order Summary</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-[#007AFF]/10 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-[#007AFF] dark:text-blue-400 text-xl">📚</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 dark:text-white">{course.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {course.category} Course
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Price Breakdown</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-800 dark:text-white">Course Price</span>
                  <span className="font-medium text-gray-800 dark:text-white">₹{course.price.toLocaleString()}</span>
                </div>
                
                <hr className="border-gray-200 dark:border-gray-600" />
                
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-800 dark:text-white">Total</span>
                  <span className="text-red-500 text-2xl">₹{course.price.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="text-center space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Secure 256-bit SSL encrypted payment</span>
                </div>
                <p>Money back guarantee within 7 days</p>
              </div>
            </div>

            {/* Help */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 p-6">
              <h4 className="font-medium text-gray-800 dark:text-white mb-3">Need Help?</h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-[#007AFF] dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+91-800-123-4567</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-[#007AFF] dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>payment@facto.in</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Info Modal */}
      <UserInfoModal
        isOpen={showUserInfoModal}
        onClose={() => setShowUserInfoModal(false)}
        onComplete={handleUserInfoComplete}
        missingFields={missingFields}
        currentUser={{
          email: user?.email || '',
          fullName: user?.fullName || '',
          phoneNumber: user?.phoneNumber || ''
        }}
      />
    </div>
  );
}

