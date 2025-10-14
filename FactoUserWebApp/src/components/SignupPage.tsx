import React, { useState, useEffect } from 'react';
import { useAuth, SignupData } from '../contexts/AuthContext';

type PageType = 'home' | 'services' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile';

interface SignupPageProps {
  onNavigate: (page: PageType) => void;
}

export function SignupPage({ onNavigate }: SignupPageProps) {
  const { signup, verifyOTP, sendOTP, isLoading, error, clearError } = useAuth();
  
  const [signupMethod, setSignupMethod] = useState<'email' | 'phone'>('email');
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  
  // Form state
  const [formData, setFormData] = useState<SignupData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Clear error when component mounts or method changes
  useEffect(() => {
    clearError();
    setLocalError(null);
  }, [signupMethod, clearError]);

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

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`signup-otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleSendOTP = async () => {
    if (!formData.phoneNumber) {
      setLocalError('Please enter your phone number');
      return;
    }

    try {
      setIsSubmitting(true);
      clearError();
      setLocalError(null);
      await sendOTP(formData.phoneNumber);
      setShowOTPInput(true);
    } catch (error: any) {
      setLocalError(error.message || 'Failed to send OTP');
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
      const firstInput = document.getElementById('signup-otp-0');
      firstInput?.focus();
    } catch (error: any) {
      setLocalError(error.message || 'Failed to resend OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check basic required fields
    if (!formData.firstName || !formData.lastName || !formData.password) {
      setLocalError('Please fill in all required fields');
      return;
    }

    // Check method-specific required fields
    if (signupMethod === 'email') {
      if (!formData.email) {
        setLocalError('Please enter your email address');
        return;
      }
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setLocalError('Please enter a valid email address');
        return;
      }
    } else if (signupMethod === 'phone') {
      if (!formData.phoneNumber) {
        setLocalError('Please enter your phone number');
        return;
      }
    }

    // Password validation
    if (formData.password.length < 8) {
      setLocalError('Password must be at least 8 characters long');
      return;
    }

    // Check if password contains both letters and numbers
    const hasLetter = /[a-zA-Z]/.test(formData.password);
    const hasNumber = /\d/.test(formData.password);
    if (!hasLetter || !hasNumber) {
      setLocalError('Password must contain both letters and numbers');
      return;
    }

    try {
      setIsSubmitting(true);
      clearError();
      setLocalError(null);
      
      if (signupMethod === 'phone') {
        await sendOTP(formData.phoneNumber);
        setCurrentStep(2);
      } else {
        // For email signup, proceed directly to signup
        await signup(formData);
        onNavigate('profile');
      }
    } catch (error: any) {
      setLocalError(error.message || 'Signup failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔍 Verify button clicked');
    console.log('OTP values:', otpValues);
    console.log('Form data:', formData);
    
    const otp = otpValues.join('');
    console.log('Joined OTP:', otp);
    
    if (!otp || otp.length !== 6) {
      console.log('❌ Invalid OTP length:', otp.length);
      setLocalError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      console.log('🚀 Starting OTP verification...');
      setIsSubmitting(true);
      clearError();
      setLocalError(null);
      
      // First verify the OTP
      console.log('📱 Verifying OTP for phone:', formData.phoneNumber);
      await verifyOTP(formData.phoneNumber, otp);
      console.log('✅ OTP verified successfully');
      
      // Then proceed with signup
      console.log('📝 Proceeding with signup...');
      await signup(formData);
      console.log('✅ Signup completed successfully');
      onNavigate('profile');
    } catch (error: any) {
      console.error('❌ Error in step 2:', error);
      setLocalError(error.message || 'OTP verification or signup failed');
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
            Create Your Account
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Join thousands of satisfied customers
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className={`flex items-center ${currentStep >= 1 ? 'text-[#007AFF]' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              currentStep >= 1 ? 'border-[#007AFF] bg-[#007AFF] text-white' : 'border-gray-300'
            }`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium hidden sm:block">Details</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center ${currentStep >= 2 ? 'text-[#007AFF]' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              currentStep >= 2 ? 'border-[#007AFF] bg-[#007AFF] text-white' : 'border-gray-300'
            }`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium hidden sm:block">Verify</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center ${currentStep >= 3 ? 'text-[#007AFF]' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              currentStep >= 3 ? 'border-[#007AFF] bg-[#007AFF] text-white' : 'border-gray-300'
            }`}>
              3
            </div>
            <span className="ml-2 text-sm font-medium hidden sm:block">Done</span>
          </div>
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

        {/* Signup Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
          {currentStep === 1 && (
            <>
              {/* Signup Method Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6">
                <button
                  onClick={() => setSignupMethod('email')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    signupMethod === 'email'
                      ? 'bg-white dark:bg-gray-600 text-[#007AFF] shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-[#007AFF]'
                  }`}
                >
                  Email
                </button>
                <button
                  onClick={() => setSignupMethod('phone')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    signupMethod === 'phone'
                      ? 'bg-white dark:bg-gray-600 text-[#007AFF] shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-[#007AFF]'
                  }`}
                >
                  Phone
                </button>
              </div>

              <form className="space-y-6" onSubmit={handleStep1Submit}>
                {/* Personal Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] dark:text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="First name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] dark:text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Last name"
                      required
                    />
                  </div>
                </div>

                {/* Contact Info */}
                {signupMethod === 'email' ? (
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
                ) : (
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
                )}

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
                    placeholder="Create a strong password"
                    required
                  />
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Must be at least 8 characters with numbers and letters
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    className="mt-1 rounded border-gray-300 dark:border-gray-600 text-[#007AFF] focus:ring-[#007AFF] bg-white dark:bg-gray-700"
                  />
                  <label className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                    I agree to the{' '}
                    <a href="#" className="text-[#007AFF] hover:text-[#0056CC]">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-[#007AFF] hover:text-[#0056CC]">Privacy Policy</a>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="w-full bg-gradient-to-r from-[#007AFF] to-[#0056CC] text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting || isLoading ? 'Processing...' : 'Continue'}
                </button>
              </form>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-[#1F2937] dark:text-white mb-2">
                  Verify Your {signupMethod === 'email' ? 'Email' : 'Phone Number'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  We've sent a verification code to{' '}
                  <span className="font-medium">
                    {signupMethod === 'email' ? 'your@email.com' : '+91 98765 43210'}
                  </span>
                </p>
              </div>

              {!showOTPInput ? (
                <button
                  onClick={handleSendOTP}
                  disabled={isSubmitting || isLoading}
                  className="w-full bg-[#007AFF] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#0056CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting || isLoading ? 'Sending...' : 'Send Verification Code'}
                </button>
              ) : (
                <form onSubmit={handleStep2Submit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] dark:text-gray-300 mb-4 text-center">
                      Enter Verification Code
                    </label>
                    <div className="flex space-x-2 justify-center">
                      {otpValues.map((value, index) => (
                        <input
                          key={index}
                          id={`signup-otp-${index}`}
                          type="text"
                          value={value}
                          onChange={(e) => handleOTPChange(index, e.target.value)}
                          className="w-12 h-12 text-center border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all font-medium text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          maxLength={1}
                          required
                        />
                      ))}
                    </div>
                    <div className="text-center mt-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Didn't receive code? </span>
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={isSubmitting || isLoading}
                        className="text-sm text-[#007AFF] hover:text-[#0056CC] transition-colors disabled:opacity-50"
                      >
                        Resend
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || isLoading}
                      className="flex-1 bg-gradient-to-r from-[#007AFF] to-[#0056CC] text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isSubmitting || isLoading ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {currentStep === 3 && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-[#1F2937] dark:text-white mb-2">
                  Welcome to Facto! 🎉
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your account has been created successfully. You can now access all our services.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => onNavigate('home')}
                  className="w-full bg-gradient-to-r from-[#007AFF] to-[#0056CC] text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Get Started
                </button>
                <button
                  onClick={() => onNavigate('services')}
                  className="w-full border border-[#007AFF] text-[#007AFF] dark:text-[#007AFF] py-3 px-4 rounded-lg font-medium hover:bg-[#007AFF] hover:text-white transition-all"
                >
                  Explore Services
                </button>
              </div>
            </div>
          )}

          {/* Social Signup - Only on step 1 */}
          {currentStep === 1 && (
            <>
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or sign up with</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="ml-2">Google</span>
                  </button>

                  <button className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                    <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="ml-2">Facebook</span>
                  </button>
                </div>
              </div>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Already have an account? </span>
                <button
                  onClick={() => onNavigate('login')}
                  className="text-sm text-[#007AFF] hover:text-[#0056CC] font-medium transition-colors"
                >
                  Sign in
                </button>
              </div>
            </>
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