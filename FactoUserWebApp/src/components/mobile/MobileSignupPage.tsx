import React, { useState, useEffect } from 'react';
import { useAuth, SignupData } from '../../contexts/AuthContext';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile';

interface MobileSignupPageProps {
  onNavigate: (page: PageType) => void;
}

export function MobileSignupPage({ onNavigate }: MobileSignupPageProps) {
  const { signup, verifyOTP, sendOTP, isLoading, error, clearError } = useAuth();
  
  const [signupMethod, setSignupMethod] = useState<'email' | 'phone'>('email');
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  
  const [formData, setFormData] = useState<SignupData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    clearError();
    setLocalError(null);
  }, [signupMethod, clearError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: SignupData) => ({ ...prev, [name]: value }));
    clearError();
    setLocalError(null);
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);
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
      await sendOTP(formData.phoneNumber!);
      setShowOTPInput(true);
    } catch (error: any) {
      setLocalError(error.message || 'Failed to send OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      await signup(formData);
      onNavigate('home');
    } catch (error: any) {
      setLocalError(error.message || 'Signup failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);
    
    if (!formData.firstName || !formData.lastName || !formData.phoneNumber) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (!showOTPInput) {
      await handleSendOTP();
      return;
    }

    const otp = otpValues.join('');
    if (otp.length !== 6) {
      setLocalError('Please enter complete 6-digit OTP');
      return;
    }

    try {
      setIsSubmitting(true);
      await verifyOTP(formData.phoneNumber!, otp);
      // After OTP verification, complete signup
      await signup({
        ...formData,
        email: `${formData.phoneNumber}@facto.app` // Temporary email
      });
      onNavigate('home');
    } catch (error: any) {
      setLocalError(error.message || 'Signup failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = error || localError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#007AFF] via-[#0056CC] to-[#003D7A] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Back to Home Button */}
        <button
          onClick={() => onNavigate('home')}
          className="absolute top-4 left-4 flex items-center gap-2 text-white/90 hover:text-white active:opacity-70 transition-opacity z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Logo and Title */}
        <div className="text-center mb-8 animate-in" style={{ animationDelay: '0.1s' }}>
          <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <span className="text-4xl">📊</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-white/80">Join us to get started</p>
        </div>

        {/* Signup Method Toggle */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-1 mb-6 flex animate-in" style={{ animationDelay: '0.2s' }}>
          <button
            onClick={() => {
              setSignupMethod('email');
              setShowOTPInput(false);
              clearError();
            }}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              signupMethod === 'email'
                ? 'bg-white text-[#007AFF] shadow-lg'
                : 'text-white/70'
            }`}
          >
            Email
          </button>
          <button
            onClick={() => {
              setSignupMethod('phone');
              setShowOTPInput(false);
              clearError();
            }}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              signupMethod === 'phone'
                ? 'bg-white text-[#007AFF] shadow-lg'
                : 'text-white/70'
            }`}
          >
            Phone
          </button>
        </div>

        {/* Error Message */}
        {displayError && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6 text-red-100 text-sm animate-in">
            {displayError}
          </div>
        )}

        {/* Signup Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl animate-in" style={{ animationDelay: '0.3s' }}>
          {signupMethod === 'email' ? (
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First"
                    className="w-full px-4 py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last"
                    className="w-full px-4 py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full px-4 py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full bg-white text-[#007AFF] py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting || isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePhoneSignup} className="space-y-4">
              {!showOTPInput ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-white/90 text-sm font-medium mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="First"
                        className="w-full px-4 py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white/90 text-sm font-medium mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Last"
                        className="w-full px-4 py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
                      className="w-full px-4 py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="w-full bg-white text-[#007AFF] py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Sending...' : 'Send OTP'}
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-3 text-center">
                      Enter OTP sent to {formData.phoneNumber}
                    </label>
                    <div className="flex justify-center gap-2">
                      {otpValues.map((value, index) => (
                        <input
                          key={index}
                          id={`signup-otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={value}
                          onChange={(e) => handleOTPChange(index, e.target.value)}
                          className="w-12 h-14 text-center text-2xl font-bold bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="w-full bg-white text-[#007AFF] py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting || isLoading ? 'Verifying...' : 'Verify & Sign Up'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={isSubmitting}
                    className="w-full text-white/80 text-sm py-2 active:opacity-70"
                  >
                    Resend OTP
                  </button>
                </>
              )}
            </form>
          )}
        </div>

        {/* Login Link */}
        <div className="text-center mt-6 animate-in" style={{ animationDelay: '0.4s' }}>
          <p className="text-white/80">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-white font-semibold underline active:opacity-70"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

