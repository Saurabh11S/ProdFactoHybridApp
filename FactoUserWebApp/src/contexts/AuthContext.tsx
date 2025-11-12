import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';
import { Storage } from '../utils/storage';

// User interface based on backend model
export interface User {
  _id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: string;
  registrationDate: string;
  lastLogin?: string;
  fathersName?: string;
  alternativePhone?: string;
  panNumber?: string;
  aadharNumber?: number;
  dateOfBirth?: string;
  state?: string;
  address?: string;
  profilePictureUrl?: string;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithOTP: (phoneNumber: string, otp: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  verifyOTP: (phoneNumber: string, otp: string) => Promise<void>;
  sendOTP: (phoneNumber: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  sessionWarning: { show: boolean; timeLeft: number };
  dismissSessionWarning: () => void;
  extendSession: () => void;
  forceLogout: () => void;
}

// Signup data interface
export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionWarning, setSessionWarning] = useState<{
    show: boolean;
    timeLeft: number;
  }>({ show: false, timeLeft: 0 });

  // Check if user is authenticated
  const isAuthenticated = !!user && !!token;

  // Token validation utilities
  const isTokenExpired = (token: string): boolean => {
    try {
      console.log('🔍 Checking token expiration...');
      
      // Check if token has the correct JWT format (3 parts separated by dots)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.log('❌ Invalid JWT format');
        return true;
      }
      
      // Decode JWT token (without verification for client-side check)
      const payload = JSON.parse(atob(tokenParts[1]));
      console.log('Token payload:', payload);
      
      // Check if token has expiration claim
      if (!payload.exp) {
        console.log('❌ Token has no expiration claim');
        return true;
      }
      
      const currentTime = Date.now() / 1000;
      const expirationTime = payload.exp;
      
      console.log('Current time:', new Date(currentTime * 1000).toISOString());
      console.log('Token expires at:', new Date(expirationTime * 1000).toISOString());
      console.log('Time until expiry (minutes):', (expirationTime - currentTime) / 60);
      console.log('Is expired:', expirationTime < currentTime);
      
      return expirationTime < currentTime;
    } catch (error) {
      console.error('❌ Error decoding token:', error);
      return true; // If we can't decode, consider it expired
    }
  };

  const getTokenExpirationTime = (token: string): number | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch (error) {
      console.error('Error getting token expiration:', error);
      return null;
    }
  };

  // Configure axios defaults and add response interceptor
  useEffect(() => {
    const setupAxios = async () => {
      const token = await Storage.get('authToken');
      if (token && !isTokenExpired(token)) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    };
    setupAxios();

    // Add response interceptor to handle token expiration
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Only logout for specific endpoints that indicate token expiration
          const url = error.config?.url || '';
          const isAuthEndpoint = url.includes('/auth/') || url.includes('/login') || url.includes('/user/');
          
          if (isAuthEndpoint) {
            console.log('401 Unauthorized on auth endpoint - token may be expired, logging out');
            // Clear auth state directly instead of calling logout to avoid stale closure
            setUser(null);
            setToken(null);
            setError(null);
            await Storage.remove('authToken');
            await Storage.remove('user');
            delete axios.defaults.headers.common['Authorization'];
          } else {
            console.log('401 Unauthorized on non-auth endpoint - not logging out automatically');
          }
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing auth state from storage...');
        const storedToken = await Storage.get('authToken');
        const storedUserStr = await Storage.get('user');
        
        console.log('Stored token exists:', !!storedToken);
        console.log('Stored user exists:', !!storedUserStr);
        
        if (storedToken && storedUserStr) {
          // Check if token is expired
          const isExpired = isTokenExpired(storedToken);
          
          if (isExpired) {
            console.log('❌ Token expired, clearing auth data');
            await Storage.remove('authToken');
            await Storage.remove('user');
            delete axios.defaults.headers.common['Authorization'];
            setToken(null);
            setUser(null);
          } else {
            console.log('✅ Token valid, restoring auth state');
            setToken(storedToken);
            setUser(JSON.parse(storedUserStr));
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          }
        } else {
          console.log('No stored auth data found in storage');
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        await Storage.remove('authToken');
        await Storage.remove('user');
        delete axios.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Clear error function
  const clearError = () => setError(null);

  // Session warning functions
  const dismissSessionWarning = () => {
    setSessionWarning({ show: false, timeLeft: 0 });
  };

  const extendSession = async () => {
    try {
      console.log('🔄 Attempting to extend session...');
      
      // Check if we have a valid token
      if (!token || isTokenExpired(token)) {
        console.log('❌ No valid token to refresh');
        setSessionWarning({ show: false, timeLeft: 0 });
        return;
      }

      // Make a request to refresh the token
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success && response.data.data?.token) {
        const newToken = response.data.data.token;
        const newUser = response.data.data.user || user;
        
        console.log('✅ Token refreshed successfully');
        
        // Update token and user
        setToken(newToken);
        setUser(newUser);
        
        // Store in storage
        await Storage.set('authToken', newToken);
        await Storage.set('user', JSON.stringify(newUser));
        
        // Update axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        setSessionWarning({ show: false, timeLeft: 0 });
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      // If refresh fails, logout the user
      logout();
    }
  };

  // Force logout for testing
  const forceLogout = async () => {
    console.log('🔄 Force logout triggered');
    await Storage.remove('authToken');
    await Storage.remove('user');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setSessionWarning({ show: false, timeLeft: 0 });
  };

  // Auto-logout when token expires
  useEffect(() => {
    if (!token) return;

    const expirationTime = getTokenExpirationTime(token);
    if (!expirationTime) return;

    const timeUntilExpiry = expirationTime - Date.now();
    
    if (timeUntilExpiry <= 0) {
      // Token already expired - clear auth state directly
      setUser(null);
      setToken(null);
      setError(null);
      Storage.remove('authToken');
      Storage.remove('user');
      delete axios.defaults.headers.common['Authorization'];
      return;
    }

    // Show warning 5 minutes before expiry
    const warningTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    if (timeUntilExpiry > warningTime) {
      const warningTimeout = setTimeout(() => {
        setSessionWarning({ show: true, timeLeft: warningTime / 1000 });
      }, timeUntilExpiry - warningTime);

      // Cleanup warning timeout
      const cleanupWarning = () => clearTimeout(warningTimeout);
      return cleanupWarning;
    } else {
      // Show warning immediately if less than 5 minutes left
      setSessionWarning({ show: true, timeLeft: timeUntilExpiry / 1000 });
    }

    // Set timeout to logout when token expires
    const timeoutId = setTimeout(() => {
      console.log('Token expired, logging out user');
      // Clear auth state directly instead of calling logout to avoid stale closure
      setUser(null);
      setToken(null);
      setError(null);
      Storage.remove('authToken');
      Storage.remove('user');
      delete axios.defaults.headers.common['Authorization'];
    }, timeUntilExpiry);

    // Cleanup timeout on unmount or token change
    return () => clearTimeout(timeoutId);
  }, [token]);

  // Clear session on browser close/tab close (web only)
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('🔄 Browser closing, clearing session...');
      Storage.remove('authToken');
      Storage.remove('user');
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('🔄 Tab hidden, clearing session...');
        Storage.remove('authToken');
        Storage.remove('user');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Login attempt with email:', email);
      console.log('API URL:', `${API_BASE_URL}/auth/login`);
      
      // Test backend connectivity first
      try {
        await axios.get(`${API_BASE_URL.replace('/api/v1', '')}/health`);
        console.log('✅ Backend is accessible');
      } catch (healthError) {
        console.log('⚠️ Backend health check failed, proceeding with login attempt');
      }

      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });

      console.log('Login response:', response.data);

      if (response.data.success && response.data.data) {
        const { user: userData, token: authToken } = response.data.data;
        
        setUser(userData);
        setToken(authToken);
        
        // Store in storage
        await Storage.set('authToken', authToken);
        await Storage.set('user', JSON.stringify(userData));
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        
        console.log('Login successful, user:', userData);
        console.log('Auth token received:', authToken);
        console.log('Setting user and token state...');
        setIsLoading(false);
        console.log('Login process completed successfully');
      } else {
        throw new Error(response.data.status?.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      
      let errorMessage = 'Login failed';
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        errorMessage = 'Unable to connect to server. Please check if the backend is running.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Login endpoint not found. Please check the API configuration.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.status?.message) {
        errorMessage = error.response.data.status.message;
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP for signup
  const verifyOTP = async (phoneNumber: string, otp: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.post(`${API_BASE_URL}/auth/verifyOtp`, {
        phoneNo: phoneNumber,
        otp
      });

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'OTP verification failed');
      }
    } catch (error: any) {
      console.error('OTP verification error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'OTP verification failed';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.status?.message) {
        errorMessage = error.response.data.status.message;
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Send OTP
  const sendOTP = async (phoneNumber: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.post(`${API_BASE_URL}/auth/sendOtp`, {
        phoneNo: phoneNumber
      });

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      console.error('Send OTP error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Failed to send OTP';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.status?.message) {
        errorMessage = error.response.data.status.message;
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Login with OTP
  const loginWithOTP = async (phoneNumber: string, otp: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.post(`${API_BASE_URL}/auth/verifyOtp`, {
        phoneNo: phoneNumber,
        otp
      });

      if (response.data.success && response.data.data) {
        const { user: userData, token: authToken } = response.data.data;
        
        setUser(userData);
        setToken(authToken);
        
        // Store in storage
        await Storage.set('authToken', authToken);
        await Storage.set('user', JSON.stringify(userData));
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      } else {
        throw new Error(response.data.message || 'OTP verification failed');
      }
    } catch (error: any) {
      console.error('OTP login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'OTP verification failed';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.status?.message) {
        errorMessage = error.response.data.status.message;
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Signup
  const signup = async (userData: SignupData) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Signup attempt with data:', userData);
      console.log('API URL:', `${API_BASE_URL}/auth/signup`);

      const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        phoneNumber: userData.phoneNumber || ''
      });

      console.log('Signup response:', response.data);

      if (response.data.success && response.data.data) {
        const { user: newUser, token: authToken } = response.data.data;
        
        setUser(newUser);
        setToken(authToken);
        
        // Store in localStorage
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        
        console.log('Signup successful, user:', newUser);
      } else {
        throw new Error(response.data.status?.message || 'Signup failed');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorMessage = error.response?.data?.status?.message || error.response?.data?.message || error.message || 'Signup failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh user data from backend
  const refreshUser = async () => {
    if (!token) return;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success && response.data.data?.user) {
        const updatedUser = response.data.data.user;
        setUser(updatedUser);
        await Storage.set('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  // Logout
  const logout = async () => {
    setUser(null);
    setToken(null);
    setError(null);
    await Storage.remove('authToken');
    await Storage.remove('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    loginWithOTP,
    signup,
    verifyOTP,
    sendOTP,
    logout,
    refreshUser,
    error,
    clearError,
    sessionWarning,
    dismissSessionWarning,
    extendSession,
    forceLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
