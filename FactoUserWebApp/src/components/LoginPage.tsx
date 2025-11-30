import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { loadGoogleScript, loadFacebookScript, handleGoogleLogin, handleFacebookLogin } from '../utils/socialLogin';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile' | 'course-payment' | 'course-details' | 'terms' | 'privacy';

interface LoginPageProps {
  onNavigate: (page: PageType, serviceId?: string, courseId?: string, filter?: string) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const { login, loginWithOTP, sendOTP, isLoading, error, clearError } = useAuth();
  
  const [loginMethod, setLoginMethod] = useState<'email' | 'otp'>('email');
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phoneNumber: '',
    otp: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Clear error when component mounts or method changes
  useEffect(() => {
    clearError();
    setLocalError(null);
    loadGoogleScript();
    loadFacebookScript();
  }, [loginMethod, clearError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    clearError();
    setLocalError(null);
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);

      // Update form data with complete OTP
      const completeOTP = newOtpValues.join('');
      setFormData(prev => ({
        ...prev,
        otp: completeOTP
      }));

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleSendOTP = async () => {
    // Clear previous errors
    clearError();
    setLocalError(null);
    
    // Validation
    if (!formData.phoneNumber) {
      setLocalError('Please enter your phone number');
      return;
    }

    // Phone number validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setLocalError('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Sending OTP to:', formData.phoneNumber);
      await sendOTP(formData.phoneNumber);
      console.log('OTP sent successfully');
      setShowOTPInput(true);
    } catch (error: any) {
      console.error('Send OTP error in component:', error);
      setLocalError(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsSubmitting(true);
      clearError();
      setLocalError(null);
      await sendOTP(formData.phoneNumber);
      setOtpValues(['', '', '', '', '', '']);
      setFormData(prev => ({ ...prev, otp: '' }));
      // Focus first OTP input
      const firstInput = document.getElementById('otp-0');
      firstInput?.focus();
    } catch (error: any) {
      setLocalError(error.message || 'Failed to resend OTP');
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    clearError();
    setLocalError(null);
    
    // Validation
    if (!formData.email || !formData.password) {
      setLocalError('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setLocalError('Please enter a valid email address');
      return;
    }

    // Password validation
    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Attempting login with:', { email: formData.email });
      await login(formData.email, formData.password);
      console.log('Login successful, navigating to profile');
      onNavigate('profile');
    } catch (error: any) {
      console.error('Login error in component:', error);
      setLocalError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    clearError();
    setLocalError(null);
    
    // Validation
    if (!formData.phoneNumber || !formData.otp) {
      setLocalError('Please fill in all fields');
      return;
    }

    // Phone number validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setLocalError('Please enter a valid 10-digit mobile number');
      return;
    }

    // OTP validation
    if (formData.otp.length !== 6) {
      setLocalError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Attempting OTP login with:', { phoneNumber: formData.phoneNumber });
      await loginWithOTP(formData.phoneNumber, formData.otp);
      console.log('OTP login successful, navigating to profile');
      onNavigate('profile');
    } catch (error: any) {
      console.error('OTP login error in component:', error);
      setLocalError(error.message || 'OTP verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] via-white to-[#F0F9FF] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center text-[#007AFF] hover:text-[#0056CC] transition-colors mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </button>

        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#007AFF] to-[#0056CC] rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">F</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-[#1F2937] dark:text-white mb-2">
            {showForgotPassword ? 'Reset Password' : 'Welcome Back'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {showForgotPassword 
              ? 'Enter your email to reset your password' 
              : 'Sign in to your Facto account'
            }
          </p>
        </div>

        {/* Error Display */}
        {(error || localError) && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 dark:text-red-200">{error || localError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
          {!showForgotPassword && (
            <>
              {/* Login Method Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6">
                <button
                  onClick={() => setLoginMethod('email')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    loginMethod === 'email'
                      ? 'bg-white dark:bg-gray-600 text-[#007AFF] shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-[#007AFF]'
                  }`}
                >
                  Email / Password
                </button>
                <button
                  onClick={() => setLoginMethod('otp')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    loginMethod === 'otp'
                      ? 'bg-white dark:bg-gray-600 text-[#007AFF] shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-[#007AFF]'
                  }`}
                >
                  Mobile OTP
                </button>
              </div>
            </>
          )}

          <form className="space-y-6" onSubmit={loginMethod === 'email' ? handleEmailLogin : handleOTPLogin}>
            {/* Email/Password Login */}
            {!showForgotPassword && loginMethod === 'email' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#1F2937] dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1F2937] dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 text-[#007AFF] focus:ring-[#007AFF] bg-white dark:bg-gray-700" />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-[#007AFF] hover:text-[#0056CC] transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              </>
            )}

            {/* Mobile OTP Login */}
            {!showForgotPassword && loginMethod === 'otp' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#1F2937] dark:text-gray-300 mb-2">
                    Mobile Number
                  </label>
                  <div className="flex">
                    <select className="px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      <option>+91</option>
                    </select>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="flex-1 px-4 py-3 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Enter mobile number"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>

                {!showOTPInput ? (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={isSubmitting || isLoading}
                    className="w-full bg-[#007AFF] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#0056CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting || isLoading ? 'Sending...' : 'Send OTP'}
                  </button>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[#1F2937] dark:text-gray-300 mb-2">
                        Enter OTP
                      </label>
                      <div className="flex space-x-2 justify-center">
                        {otpValues.map((value, index) => (
                          <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            value={value}
                            onChange={(e) => handleOTPChange(index, e.target.value)}
                            className="w-12 h-12 text-center border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all font-medium text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            maxLength={1}
                          />
                        ))}
                      </div>
                      <div className="text-center mt-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Didn't receive code? </span>
                        <button
                          type="button"
                          onClick={handleResendOTP}
                          className="text-sm text-[#007AFF] hover:text-[#0056CC] transition-colors"
                        >
                          Resend OTP
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Forgot Password Form */}
            {showForgotPassword && (
              <div>
                <label className="block text-sm font-medium text-[#1F2937] dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter your email"
                />
              </div>
            )}

            {/* Submit Button - Only show for email/password login or forgot password */}
            {loginMethod === 'email' && !showOTPInput && (
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full bg-gradient-to-r from-[#007AFF] to-[#0056CC] text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting || isLoading ? 'Signing In...' : (showForgotPassword ? 'Send Reset Link' : 'Sign In')}
              </button>
            )}

            {/* Verify OTP Button - Only show when OTP input is visible */}
            {showOTPInput && (
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full bg-gradient-to-r from-[#007AFF] to-[#0056CC] text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting || isLoading ? 'Verifying...' : 'Verify & Sign In'}
              </button>
            )}

            {/* Back to Login */}
            {showForgotPassword && (
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="w-full text-[#007AFF] hover:text-[#0056CC] transition-colors"
              >
                Back to Login
              </button>
            )}
          </form>

          {/* Social Login */}
          {!showForgotPassword && (
            <>
                <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleGoogleLogin(setIsSubmitting, setLocalError)}
                    disabled={isLoading || isSubmitting}
                    className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="ml-2">Google</span>
                  </button>

                  <button 
                    onClick={() => handleFacebookLogin(setIsSubmitting, setLocalError)}
                    disabled={isLoading || isSubmitting}
                    className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="ml-2">Facebook</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Sign Up Link */}
          {!showForgotPassword && (
            <div className="mt-6 text-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Don't have an account? </span>
              <button
                onClick={() => onNavigate('signup')}
                className="text-sm text-[#007AFF] hover:text-[#0056CC] font-medium transition-colors"
              >
                Sign up
              </button>
            </div>
          )}
        </div>

        {/* Trust Badge */}
        <div className="text-center">
          <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Your data is secure and encrypted
          </div>
        </div>
      </div>
    </div>
  );
}
