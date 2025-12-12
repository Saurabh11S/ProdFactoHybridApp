import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile';

interface MobileLoginPageProps {
  onNavigate: (page: PageType) => void;
}

export function MobileLoginPage({ onNavigate }: MobileLoginPageProps) {
  // Dark mode is handled via CSS dark: classes
  // const { isDarkMode } = useDarkMode();
  const { login, loginWithOTP, sendOTP, isLoading, error, clearError } = useAuth();
  
  const [loginMethod, setLoginMethod] = useState<'email' | 'otp'>('email');
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phoneNumber: '',
    otp: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    phoneNumber?: string;
    otp?: string;
  }>({});

  useEffect(() => {
    clearError();
    setLocalError(null);
  }, [loginMethod, clearError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearError();
    setLocalError(null);
    // Clear field error when user starts typing
    setFieldErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);
      setFormData(prev => ({ ...prev, otp: newOtpValues.join('') }));
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleSendOTP = async () => {
    clearError();
    setLocalError(null);
    setFieldErrors({});
    
    const errors: { phoneNumber?: string } = {};
    
    if (!formData.phoneNumber) {
      errors.phoneNumber = 'Phone number is required';
    } else {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(formData.phoneNumber)) {
        errors.phoneNumber = 'Please enter a valid 10-digit mobile number starting with 6-9';
      }
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      await sendOTP(formData.phoneNumber);
      setShowOTPInput(true);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send OTP. Please try again.';
      setLocalError(errorMessage);
      setTimeout(() => {
        setLocalError(null);
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);
    setFieldErrors({});
    
    // Validation
    const errors: { email?: string; password?: string } = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Attempting login with:', { email: formData.email });
      await login(formData.email.trim(), formData.password);
      console.log('Login successful, navigating to home');
      onNavigate('home');
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Login failed. Please check your credentials.';
      setLocalError(errorMessage);
      // Show error for 5 seconds then clear
      setTimeout(() => {
        setLocalError(null);
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);
    setFieldErrors({});
    
    const errors: { otp?: string } = {};
    
    if (!formData.otp) {
      errors.otp = 'OTP is required';
    } else if (formData.otp.length !== 6) {
      errors.otp = 'Please enter complete 6-digit OTP';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Attempting OTP login with:', { phoneNumber: formData.phoneNumber });
      await loginWithOTP(formData.phoneNumber, formData.otp);
      console.log('OTP login successful, navigating to home');
      onNavigate('home');
    } catch (error: any) {
      console.error('OTP login error:', error);
      const errorMessage = error.message || 'Login failed. Please check your OTP.';
      setLocalError(errorMessage);
      setTimeout(() => {
        setLocalError(null);
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = error || localError;

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-8"
      style={{
        paddingTop: 'calc(4rem + max(env(safe-area-inset-top, 24px), 24px) + 2rem)' // Header height + safe area + extra space
      }}
    >
      <div className="w-full max-w-md relative">
        {/* Logo and Title */}
        <div className="text-center mb-8 animate-in" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h1>
          <p className="text-gray-600 dark:text-gray-400">Sign in to continue</p>
        </div>

        {/* Login Method Toggle */}
        <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-1 mb-6 flex animate-in" style={{ animationDelay: '0.2s' }}>
          <button
            onClick={() => {
              setLoginMethod('email');
              setShowOTPInput(false);
              clearError();
            }}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              loginMethod === 'email'
                ? 'bg-white dark:bg-gray-600 text-[#007AFF] shadow-sm'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            Email
          </button>
          <button
            onClick={() => {
              setLoginMethod('otp');
              setShowOTPInput(false);
              clearError();
            }}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              loginMethod === 'otp'
                ? 'bg-white dark:bg-gray-600 text-[#007AFF] shadow-sm'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            Phone
          </button>
        </div>

        {/* Error Message */}
        {displayError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4 mb-6 text-red-800 dark:text-red-200 text-sm animate-in">
            {displayError}
          </div>
        )}

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 animate-in" style={{ animationDelay: '0.3s' }}>
          {loginMethod === 'email' ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-gray-900 dark:text-gray-300 text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className={`w-full px-4 py-4 bg-white dark:bg-gray-700 border rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 ${
                    fieldErrors.email 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-[#007AFF] focus:border-transparent'
                  }`}
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-900 dark:text-gray-300 text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className={`w-full px-4 py-4 bg-white dark:bg-gray-700 border rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 ${
                    fieldErrors.password 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-[#007AFF] focus:border-transparent'
                  }`}
                />
                {fieldErrors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.password}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full bg-[#007AFF] text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting || isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={showOTPInput ? handleOTPLogin : (e) => { e.preventDefault(); handleSendOTP(); }} className="space-y-4">
              {!showOTPInput ? (
                <>
                  <div>
                    <label className="block text-gray-900 dark:text-gray-300 text-sm font-medium mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
                      className={`w-full px-4 py-4 bg-white dark:bg-gray-700 border rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 ${
                        fieldErrors.phoneNumber 
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 dark:border-gray-600 focus:ring-[#007AFF] focus:border-transparent'
                      }`}
                    />
                    {fieldErrors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.phoneNumber}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="w-full bg-[#007AFF] text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Sending...' : 'Send OTP'}
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-gray-900 dark:text-gray-300 text-sm font-medium mb-3 text-center">
                      Enter OTP sent to {formData.phoneNumber}
                    </label>
                    <div className="flex justify-center gap-2">
                      {otpValues.map((value, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={value}
                          onChange={(e) => handleOTPChange(index, e.target.value)}
                          className={`w-12 h-14 text-center text-2xl font-bold bg-white dark:bg-gray-700 border rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                            fieldErrors.otp 
                              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300 dark:border-gray-600 focus:ring-[#007AFF] focus:border-transparent'
                          }`}
                        />
                      ))}
                    </div>
                    {fieldErrors.otp && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 text-center">{fieldErrors.otp}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="w-full bg-[#007AFF] text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting || isLoading ? 'Verifying...' : 'Verify & Sign In'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={isSubmitting}
                    className="w-full text-[#007AFF] text-sm py-2 active:opacity-70"
                  >
                    Resend OTP
                  </button>
                </>
              )}
            </form>
          )}
        </div>

        {/* Sign Up Link */}
        <div className="text-center mt-6 animate-in" style={{ animationDelay: '0.4s' }}>
          <p className="text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('signup')}
              className="text-[#007AFF] font-semibold underline active:opacity-70"
            >
              Sign Up
            </button>
          </p>
        </div>

        {/* Back to Home Button - Positioned at bottom with clear visibility */}
        <div className="text-center mt-6 mb-4 animate-in" style={{ animationDelay: '0.5s' }}>
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center justify-center gap-2 bg-[#007AFF] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-[#0056CC] active:scale-95 transition-all mx-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-base font-medium">Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}

