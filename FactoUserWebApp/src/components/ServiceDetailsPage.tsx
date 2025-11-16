import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import SuccessPopup from './SuccessPopup';
import { UserInfoModal } from './UserInfoModal';
import { API_BASE_URL } from '../config/apiConfig';
import { fetchSubServiceById, fetchAllSubServices, SubService } from '../api/services';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { Storage } from '../utils/storage';
import { initializeRazorpayPayment } from '../utils/razorpay';

type PageType = 'home' | 'services' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile';

interface ServiceDetailsPageProps {
  onNavigate: (page: PageType, serviceId?: string) => void;
  serviceId?: string;
}

// Billing period multipliers (kept for potential future use)
// const BILLING_MULTIPLIERS: Record<string, number> = {
//   monthly: 1,
//   quarterly: 3,
//   half_yearly: 6,
//   yearly: 12,
//   one_time: 1
// };

interface UserPurchase {
  _id: string;
  itemId: string;
  itemType: 'service' | 'course';
  status: 'active' | 'expired' | 'cancelled';
  paymentOrderId: string | {
    _id: string;
    status: string;
    amount: number;
  };
}

export function ServiceDetailsPage({ onNavigate, serviceId = 'itr-1' }: ServiceDetailsPageProps) {
  const { isAuthenticated, user, token, refreshUser } = useAuth();
  const [subService, setSubService] = useState<SubService | null>(null);
  const [loadingService, setLoadingService] = useState(true);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('monthly');
  const [selectedRequestOptions, setSelectedRequestOptions] = useState<Record<string, string | string[]>>({});
  const [_showQuotationForm, setShowQuotationForm] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isRequestingConsultation, setIsRequestingConsultation] = useState(false);
  const [isNotifyingTeam, setIsNotifyingTeam] = useState(false);
  const [userPurchases, setUserPurchases] = useState<UserPurchase[]>([]);
  const [successPopup, setSuccessPopup] = useState({
    isOpen: false,
    title: '',
    message: '',
    serviceName: '',
    purchaseId: '',
    amount: 0,
    currency: 'INR'
  });
  const [showMobileConfigurator, setShowMobileConfigurator] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Add refresh key to force re-fetch
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [missingFields, setMissingFields] = useState<{
    phoneNumber?: boolean;
    email?: boolean;
    fullName?: boolean;
  }>({});

  // Fetch user purchases (paymentOrderId is already populated by the API)
  useEffect(() => {
    const fetchUserPurchases = async () => {
      if (!isAuthenticated || !user || !token) {
        return;
      }

      try {
        const purchasesResponse = await axios.get(`${API_BASE_URL}/user-purchases`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setUserPurchases(purchasesResponse.data.data || []);
      } catch (error) {
        console.error('Error fetching user purchases:', error);
        // Don't block the UI if this fails
      }
    };

    fetchUserPurchases();
  }, [isAuthenticated, user, token, refreshKey]);

  // Check if service is already purchased (excluding free consultations)
  const isServicePurchased = useMemo(() => {
    if (!subService || !isAuthenticated || userPurchases.length === 0) {
      return false;
    }

    const purchase = userPurchases.find(
      p => p.itemId === subService._id && p.itemType === 'service' && p.status === 'active'
    );

    if (!purchase) {
      return false;
    }

    // Check if it's a free consultation - if so, don't mark as "purchased"
    const payment = typeof purchase.paymentOrderId === 'object' && purchase.paymentOrderId
      ? purchase.paymentOrderId
      : null;
    
    if (payment && typeof payment === 'object' && 'status' in payment) {
      // If it's a free consultation, it's not fully purchased yet - user needs to pay
      if (payment.status === 'free_consultation') {
        return false;
      }
      // If it's paid (completed), then it's purchased
      if (payment.status === 'completed') {
        return true;
      }
    }

    // Default: if there's a purchase, consider it purchased (for backward compatibility)
    return true;
  }, [subService, userPurchases, isAuthenticated]);

  // Check if service has free consultation request
  const hasFreeConsultation = useMemo(() => {
    if (!subService || !isAuthenticated || userPurchases.length === 0) {
      return false;
    }

    const purchase = userPurchases.find(
      p => p.itemId === subService._id && p.itemType === 'service' && p.status === 'active'
    );

    if (!purchase) {
      return false;
    }

    const payment = typeof purchase.paymentOrderId === 'object' && purchase.paymentOrderId
      ? purchase.paymentOrderId
      : null;
    
    if (payment && typeof payment === 'object' && 'status' in payment) {
      return payment.status === 'free_consultation';
    }

    return false;
  }, [subService, userPurchases, isAuthenticated]);

  // Check if service is already paid (commented out as not currently used)
  // const isServicePaid = useMemo(() => {
  //   if (!subService || !isAuthenticated || userPurchases.length === 0) {
  //     return false;
  //   }

  //   const purchase = userPurchases.find(
  //     p => p.itemId === subService._id && p.itemType === 'service' && p.status === 'active'
  //   );

  //   if (!purchase) {
  //     return false;
  //   }

  //   // Check payment status (paymentOrderId is populated by the API)
  //   const payment = typeof purchase.paymentOrderId === 'object' && purchase.paymentOrderId
  //     ? purchase.paymentOrderId
  //     : null;

  //   if (payment && typeof payment === 'object' && 'status' in payment) {
  //     // Service is paid if status is 'completed'
  //     return payment.status === 'completed';
  //   }

  //   return false;
  // }, [subService, userPurchases, isAuthenticated]);

  // Fetch sub-service details
  useEffect(() => {
    const loadSubService = async () => {
      if (!serviceId) {
        setLoadingService(false);
        return;
      }

      const isMongoId = /^[0-9a-fA-F]{24}$/.test(serviceId);
      
      if (isMongoId) {
        try {
          setLoadingService(true);
          setServiceError(null);
          // Always force refresh to get latest data from database
          const fetchedService = await fetchSubServiceById(serviceId, true);
          
          // Validate that we got valid data
          if (!fetchedService) {
            throw new Error('No service data returned from API');
          }
          // Normalize requests to ensure options array is always present and properly formatted
          if (fetchedService.requests && Array.isArray(fetchedService.requests)) {
            fetchedService.requests = fetchedService.requests.map((req: any) => ({
              ...req,
              inputType: req.inputType || 'checkbox',
              options: req.inputType === 'dropdown' 
                ? (req.options || []).map((opt: any) => ({
                    name: opt.name || opt.title || '',
                    priceModifier: opt.priceModifier || 0,
                    needsQuotation: opt.needsQuotation || false,
                  }))
                : [],
            }));
          }
          setSubService(fetchedService);
          if (fetchedService.period) {
            setSelectedPeriod(fetchedService.period);
          }
          setServiceError(null); // Clear any previous errors
        } catch (error: any) {
          console.error('❌ Error fetching sub-service by ID:', error);
          const statusCode = error.status || error.response?.status;
          const errorMessage = error.response?.data?.message || 
                              error.response?.data?.error?.message ||
                              error.message || 
                              'Failed to load service details';
          
          // If 404, try to find in all services list as fallback
          if (statusCode === 404) {
            try {
              const allServices = await fetchAllSubServices();
              
              // Try to find by _id (exact match)
              let foundService = allServices.find(s => s._id === serviceId);
              
              // If not found by _id, try to find by serviceCode
              if (!foundService) {
                foundService = allServices.find(s => 
                  s.serviceCode === serviceId || 
                  s.serviceCode === serviceId.toLowerCase() ||
                  s.serviceCode?.toLowerCase() === serviceId.toLowerCase()
                );
              }
              
              if (foundService) {
                setSubService(foundService);
                if (foundService.period) {
                  setSelectedPeriod(foundService.period);
                }
                setServiceError(null);
                setLoadingService(false);
                return; // Exit early since we found the service
              } else {
                setServiceError(`Service with ID "${serviceId}" not found. The service may have been removed or the ID is incorrect.`);
              }
            } catch (fallbackError: any) {
              setServiceError(`Service not found (404). Unable to load service details. Please try again later or contact support.`);
            }
          } else {
            // For non-404 errors, show the error message
            setServiceError(errorMessage);
          }
        } finally {
          setLoadingService(false);
        }
      } else {
        // If not a MongoDB ID, try to find by serviceCode
        try {
          setLoadingService(true);
          const allServices = await fetchAllSubServices();
          const foundService = allServices.find(s => 
            s.serviceCode === serviceId || 
            s.serviceCode === serviceId.toLowerCase() ||
            s._id === serviceId
          );
          if (foundService) {
            setSubService(foundService);
            if (foundService.period) {
              setSelectedPeriod(foundService.period);
            }
          } else {
            setServiceError(`Service "${serviceId}" not found.`);
          }
        } catch (error) {
          console.error('❌ Error finding service by code:', error);
          setServiceError(`Failed to load service "${serviceId}"`);
        } finally {
          setLoadingService(false);
        }
      }
    };

    loadSubService();
  }, [serviceId, refreshKey]); // Add refreshKey to dependencies

  // Function to manually refresh the service data
  const handleRefreshService = () => {
    setRefreshKey(prev => prev + 1);
    setSelectedRequestOptions({}); // Clear selected options on refresh
  };

  // Initialize selected period when sub-service loads
  // Use the first available period from pricingStructure (configured by Admin)
  useEffect(() => {
    if (subService && subService.pricingStructure && subService.pricingStructure.length > 0) {
      // Check if current selectedPeriod exists in pricingStructure
      const periodExists = subService.pricingStructure.some(p => p.period === selectedPeriod);
      if (!periodExists) {
        // Set to first available period from pricingStructure
        const firstPeriod = subService.pricingStructure[0].period;
        setSelectedPeriod(firstPeriod);
      }
    } else if (subService && subService.period) {
      // Fallback to legacy period field if pricingStructure is not available
      setSelectedPeriod(subService.period);
    }
  }, [subService, selectedPeriod]);

  // Calculate price with real-time updates
  const priceCalculation = useMemo(() => {
    if (!subService) {
      return { 
        basePrice: 0, 
        modifiers: 0, 
        total: 0, 
        needsQuotation: false, 
        breakdown: [
          { label: 'Base Price', amount: 0, type: 'base' as const },
          { label: 'Subtotal', amount: 0, type: 'base' as const },
          { label: 'GST (18%)', amount: 0, type: 'modifier' as const }
        ] 
      };
    }

    // Get base price for selected period from pricingStructure (configured by Admin)
    // Only use pricingStructure prices, not the legacy price field
    const selectedPricing = subService.pricingStructure?.find(p => p.period === selectedPeriod);
    const basePrice = selectedPricing?.price || 0;
    
    // Validate that selected period exists in pricingStructure
    // If not, we'll handle it in useEffect
    
    // Calculate modifiers from selected options
    let totalModifier = 0;
    let needsQuotation = false;
    
    // Get period label for breakdown
    const periodLabel = selectedPeriod === 'one_time' 
      ? 'One-Time' 
      : selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1).replace('_', ' ');
    
    const breakdown: Array<{ label: string; amount: number; type: 'base' | 'modifier' }> = [
      { label: `Base Price (${periodLabel})`, amount: basePrice, type: 'base' }
    ];

    subService.requests?.forEach((request) => {
      const selectedValue = selectedRequestOptions[request.name];
      // Normalize inputType to handle case variations
      const inputType = (request.inputType || '').toLowerCase();
      
      if (inputType === 'dropdown' && selectedValue && typeof selectedValue === 'string') {
        const option = request.options?.find(opt => opt.name === selectedValue);
        if (option) {
          totalModifier += option.priceModifier;
          breakdown.push({
            label: `${request.name}: ${option.name}`,
            amount: option.priceModifier,
            type: 'modifier'
          });
          if (option.needsQuotation) {
            needsQuotation = true;
          }
        }
      } else if (inputType === 'checkbox') {
        // Handle checkbox with options
        if (request.options && request.options.length > 0) {
          if (request.isMultipleSelect && Array.isArray(selectedValue)) {
            selectedValue.forEach(optionName => {
              const option = request.options?.find(opt => opt.name === optionName);
              if (option) {
                totalModifier += option.priceModifier;
                breakdown.push({
                  label: `${request.name}: ${optionName}`,
                  amount: option.priceModifier,
                  type: 'modifier'
                });
                if (option.needsQuotation) {
                  needsQuotation = true;
                }
              }
            });
          } else if (selectedValue && typeof selectedValue === 'string') {
            const option = request.options?.find(opt => opt.name === selectedValue);
            if (option) {
              totalModifier += option.priceModifier;
              breakdown.push({
                label: `${request.name}: ${option.name}`,
                amount: option.priceModifier,
                type: 'modifier'
              });
              if (option.needsQuotation) {
                needsQuotation = true;
              }
            }
          }
        } else {
          // Handle simple checkbox without options - use request's priceModifier
          if (selectedValue) {
            totalModifier += request.priceModifier || 0;
            breakdown.push({
              label: request.name,
              amount: request.priceModifier || 0,
              type: 'modifier'
            });
          }
        }
      }
      
      if (request.needsQuotation && selectedValue) {
        needsQuotation = true;
      }
    });

    // Calculate subtotal (basePrice already includes the period-specific price from pricingStructure)
    // No need to multiply by period since pricingStructure already has the correct price per period
    const subtotal = basePrice + totalModifier;
    
    // Add tax placeholder (18% GST)
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    breakdown.push(
      { label: 'Subtotal', amount: subtotal, type: 'base' },
      { label: 'GST (18%)', amount: tax, type: 'modifier' }
    );

    return {
      basePrice,
      modifiers: totalModifier,
      total,
      needsQuotation,
      breakdown
    };
  }, [subService, selectedPeriod, selectedRequestOptions]);

  // Handle option selection
  const handleOptionChange = (requestName: string, optionName: string, isMultiple: boolean = false) => {
    setSelectedRequestOptions(prev => {
      if (isMultiple) {
        const current = Array.isArray(prev[requestName]) ? prev[requestName] as string[] : [];
        const isSelected = current.includes(optionName);
        return {
          ...prev,
          [requestName]: isSelected 
            ? current.filter(name => name !== optionName)
            : [...current, optionName]
        };
      } else {
        return {
          ...prev,
          [requestName]: optionName
        };
      }
    });
  };

  // Handle simple checkbox toggle (for checkbox requests without options)
  const handleCheckboxToggle = (requestName: string, checked: boolean) => {
    setSelectedRequestOptions(prev => {
      const updated = {
        ...prev,
        [requestName]: checked ? requestName : undefined
      };
      // Remove undefined values to maintain type safety
      const filtered: Record<string, string | string[]> = {};
      Object.entries(updated).forEach(([key, value]) => {
        if (value !== undefined) {
          filtered[key] = value;
        }
      });
      return filtered;
    });
  };

  // Handle Get Quotation
  const handleGetQuotation = () => {
    if (!isAuthenticated) {
      onNavigate('login');
      return;
    }

    if (priceCalculation.needsQuotation) {
      setShowQuotationForm(true);
    } else {
      // Proceed with payment
      handlePayment();
    }
  };

  // Handle Notify Team (for unauthenticated users)
  const handleNotifyTeam = async () => {
    if (!subService) return;

    setIsNotifyingTeam(true);
    setPaymentError(null);

    try {
      const serviceName = typeof subService.serviceId === 'object' && subService.serviceId !== null
        ? subService.serviceId.title
        : 'Service';

      const response = await axios.post(
        `${API_BASE_URL}/query/consultation`,
        {
          name: 'Guest User',
          email: undefined,
          phoneNo: undefined,
          query: `Interested in ${subService.title} service. Total: ₹${priceCalculation.total.toLocaleString('en-IN')}`,
          category: serviceName.toLowerCase(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        setSuccessPopup({
          isOpen: true,
          title: 'Team Notified!',
          message: 'Our team has been notified of your interest. We will contact you soon!',
          serviceName: displayService.title,
          purchaseId: 'N/A',
          amount: priceCalculation.total,
          currency: 'INR'
        });
      }
    } catch (error: any) {
      console.error('Notify team failed:', error);
      setPaymentError(error.response?.data?.message || 'Failed to notify team. Please try again.');
    } finally {
      setIsNotifyingTeam(false);
    }
  };

  // Handle Free Consultation Request
  const handleFreeConsultation = async () => {
    if (!isAuthenticated || !user || !subService) {
      onNavigate('login');
      return;
    }

    setIsRequestingConsultation(true);
    setPaymentError(null);

    try {
      const authToken = await Storage.get('authToken');
      
      // Extract selected features from options
      const selectedFeatures: string[] = [];
      Object.entries(selectedRequestOptions).forEach(([, value]) => {
        if (value) {
          if (Array.isArray(value)) {
            selectedFeatures.push(...value);
          } else {
            selectedFeatures.push(value as string);
          }
        }
      });
      
      const response = await axios.post(
        `${API_BASE_URL}/user/save-service`,
        {
          itemType: 'service',
          itemId: subService._id,
          selectedFeatures,
          billingPeriod: selectedPeriod,
          isFreeConsultation: true
        },
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccessPopup({
        isOpen: true,
        title: 'Free Consultation Requested!',
        message: response.data.data?.message || 'Your free consultation request has been submitted successfully. Our team will contact you soon.',
        serviceName: displayService.title,
        purchaseId: response.data.data?.purchase?._id || 'N/A',
        amount: 0,
        currency: 'INR'
      });

      // Refresh user purchases to update the UI
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      console.error('Free consultation request failed:', error);
      setPaymentError(error.response?.data?.message || 'Failed to request free consultation. Please try again.');
    } finally {
      setIsRequestingConsultation(false);
    }
  };

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
    if (!isAuthenticated || !user || !subService) {
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
    if (!isAuthenticated || !user || !subService) {
      return;
    }

    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      const paymentOrderData = {
        userId: user._id,
        items: [{
          itemType: 'service',
          itemId: subService._id,
          price: priceCalculation.total,
          billingPeriod: selectedPeriod,
          selectedOptions: selectedRequestOptions
        }]
      };

      const authToken = await Storage.get('authToken');
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
        
        // Note: You may need to implement deep linking or polling to detect payment completion
        // For now, we'll show a message to the user
        setPaymentError('Payment opened in browser. Please complete the payment and return to the app.');
        setIsProcessingPayment(false);
      } else {
        // Web: Use Razorpay utility for proper script loading
        try {
          await initializeRazorpayPayment({
            key: razorpayKey,
            amount: amount,
            currency: currency,
            name: 'Facto Services',
            description: `Payment for ${displayService.title}`,
            order_id: orderId,
            prefill: {
              name: user.fullName || '',
              email: user.email || '',
              contact: user.phoneNumber || ''
            },
            handler: async function (response: any) {
              try {
                const token = await Storage.get('authToken');
                const verifyResponse = await axios.post(`${API_BASE_URL}/payment/verify-payment`, {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                }, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });

                setSuccessPopup({
                  isOpen: true,
                  title: 'Payment Successful!',
                  message: verifyResponse.data.data.message || 'Your service has been activated successfully',
                  serviceName: displayService.title,
                  purchaseId: verifyResponse.data.data.purchaseId || 'N/A',
                  amount: verifyResponse.data.data.amount || amount,
                  currency: currency
                });
                
                setShowQuotationForm(false);
                
                // Refresh user purchases to update the UI
                setRefreshKey(prev => prev + 1);
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
      setPaymentError(error.response?.data?.message || 'Payment initiation failed. Please try again.');
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

  // Loading state
  if (loadingService) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b1220] via-[#0f1729] to-[#121826] pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1287ff] mx-auto mb-4"></div>
              <p className="text-[#98a0ad]">Loading service details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Create placeholder data when API fails
  const getPlaceholderService = () => {
    // Extract service name from serviceId if it's a legacy ID
    let serviceTitle = 'Service Details';
    let serviceCategory = 'Services';
    
    if (serviceId && !/^[0-9a-fA-F]{24}$/.test(serviceId)) {
      // Legacy service ID format
      const serviceMap: Record<string, { title: string; category: string }> = {
        'itr-1': { title: 'ITR-1 Filing', category: 'ITR' },
        'itr-2': { title: 'ITR-2 Filing', category: 'ITR' },
        'itr-3': { title: 'ITR-3 Filing', category: 'ITR' },
        'itr-4': { title: 'ITR-4 Filing', category: 'ITR' },
        'gstr-1-3b-monthly': { title: 'GSTR-1 & GSTR-3B (Monthly)', category: 'GST' },
        'gstr-1-3b-quarterly': { title: 'GSTR-1 & GSTR-3B (Quarterly)', category: 'GST' },
        'gst-registration': { title: 'GST Registration', category: 'GST' }
      };
      
      const mapped = serviceMap[serviceId];
      if (mapped) {
        serviceTitle = mapped.title;
        serviceCategory = mapped.category;
      }
    }
    
    return {
      _id: serviceId || '',
      serviceCode: serviceId || 'placeholder',
      serviceId: {
        _id: '',
        title: serviceCategory,
        category: serviceCategory
      },
      title: serviceTitle,
      description: serviceError 
        ? `We are unable to load the service details for "${serviceTitle}" at this time. Please try again later or contact support.`
        : `Loading details for ${serviceTitle}...`,
      features: [
        'Professional service delivery',
        'Expert consultation',
        'Quality assurance',
        'Timely completion',
        'Ongoing support',
        'Secure processing'
      ],
      price: 0,
      period: 'one_time' as const,
      isActive: true,
      pricingStructure: [{ price: 0, period: 'one_time' }],
      requests: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  // Use placeholder if no service loaded
  const displayService = subService || getPlaceholderService();

  const parentService = displayService.serviceId && typeof displayService.serviceId === 'object' 
    ? displayService.serviceId 
    : null;

  const category = parentService?.category || 'Services';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1220] via-[#0f1729] to-[#121826] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile-Friendly Navigation */}
        {Capacitor.isNativePlatform() || (typeof window !== 'undefined' && window.innerWidth < 768) ? (
          <div className="mb-6">
            <button
              onClick={() => onNavigate('services')}
              className="flex items-center gap-2 text-[#1287ff] mb-4 active:opacity-70 transition-opacity"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back to Services</span>
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="px-3 py-1 bg-[#1287ff]/20 text-[#1287ff] rounded-full text-xs font-medium">
                {category}
              </span>
              <span className="text-[#98a0ad]">•</span>
              <span className="text-white font-medium">{displayService.title}</span>
            </div>
          </div>
        ) : (
          <nav className="flex items-center space-x-2 text-sm mb-8 text-[#98a0ad]">
            <button 
              onClick={() => onNavigate('home')} 
              className="hover:text-[#1287ff] transition-colors"
            >
              Home
            </button>
            <span>/</span>
            <button 
              onClick={() => onNavigate('services')} 
              className="hover:text-[#1287ff] transition-colors"
            >
              Services
            </button>
            <span>/</span>
            <span className="text-[#1287ff]">{category}</span>
            <span>/</span>
            <span className="text-white">{displayService.title}</span>
          </nav>
        )}

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content (2/3 on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <div className="bg-[rgba(255,255,255,0.03)] rounded-[18px] border border-[rgba(255,255,255,0.1)] p-6 md:p-8 shadow-lg">
              <div className="flex items-start gap-6 mb-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#1287ff] to-[#12d6b8] rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-[#1287ff]/20">
                    {category === 'ITR' ? '📊' : category === 'GST' ? '📋' : category === 'Registration' ? '📝' : '📦'}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-4 py-1.5 bg-[#1287ff]/20 text-[#1287ff] rounded-full text-sm font-semibold">
                      {category}
                    </span>
                    {displayService.serviceCode && displayService.serviceCode !== 'placeholder' && (
                      <span className="px-3 py-1 bg-[rgba(255,255,255,0.05)] text-[#98a0ad] rounded-full text-xs font-medium border border-[rgba(255,255,255,0.1)]">
                        Code: {displayService.serviceCode}
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 bg-gradient-to-r from-white via-[#12d6b8] to-white bg-clip-text text-transparent">
                    {displayService.title}
                  </h1>
                  <p className="text-[#98a0ad] text-lg leading-relaxed">
                    {displayService.description}
                  </p>
                  {serviceError && (
                    <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-yellow-400 text-sm">
                        <strong>Note:</strong> {serviceError}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Price Preview */}
              <div className="pt-6 border-t border-[rgba(255,255,255,0.1)]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <p className="text-[#98a0ad] text-sm mb-1">
                      {subService && subService.pricingStructure && subService.pricingStructure.length > 0
                        ? `Starting from (${selectedPeriod === 'one_time' ? 'One-Time' : selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1).replace('_', ' ')})`
                        : 'Starting from'}
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {priceCalculation.total === 0 ? (
                        <span className="px-3 py-1 bg-[#12d6b8]/20 text-[#12d6b8] rounded-full text-sm">Free</span>
                      ) : (
                        `₹${priceCalculation.total.toLocaleString('en-IN')}`
                      )}
                    </p>
                  </div>
                  {!isServicePurchased && (
                    <button
                      onClick={handleGetQuotation}
                      disabled={isProcessingPayment || !isAuthenticated}
                      className="px-6 py-3 bg-[#1287ff] text-white rounded-full font-semibold hover:bg-[#0f6fd6] transition-all shadow-lg shadow-[#1287ff]/20 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {isProcessingPayment 
                        ? 'Processing...' 
                        : !isAuthenticated 
                          ? 'Login to Pay and Activate' 
                          : priceCalculation.needsQuotation 
                            ? 'Pay and Activate — Request Quotation' 
                            : `Pay and Activate — ₹${priceCalculation.total.toLocaleString('en-IN')}`}
                    </button>
                  )}
                  {isServicePurchased && (
                    <div className="px-6 py-3 bg-green-500/20 border-2 border-green-500/50 text-green-400 rounded-full font-semibold text-center whitespace-nowrap">
                      ✓ Service Already Purchased
                    </div>
                  )}
                  {/* Show Payment button for free consultations */}
                  {hasFreeConsultation && !isServicePurchased && (
                    <button
                      onClick={handlePayment}
                      disabled={isProcessingPayment}
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#007AFF] to-[#00C897] text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          <span>Pay Now</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                
                {/* Free Consultation Button - Hero Section */}
                {!isServicePurchased && !hasFreeConsultation && (
                  <div className="mt-3 sm:mt-0 sm:flex sm:justify-end">
                    <button
                      onClick={() => {
                        if (!isAuthenticated) {
                          onNavigate('login');
                        } else {
                          handleFreeConsultation();
                        }
                      }}
                      disabled={isRequestingConsultation || isProcessingPayment}
                      className="w-full sm:w-auto px-6 py-3 bg-transparent border-2 border-[#12d6b8] text-[#12d6b8] rounded-full font-semibold hover:bg-[#12d6b8]/10 transition-all shadow-lg shadow-[#12d6b8]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isRequestingConsultation ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Requesting...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span>{!isAuthenticated ? 'Login to Request Free Consultation' : hasFreeConsultation ? 'Consultation Requested ✓' : 'Request Free Consultation'}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Features Section */}
            {displayService.features && displayService.features.length > 0 && (
              <div className="bg-[rgba(255,255,255,0.03)] rounded-[18px] border border-[rgba(255,255,255,0.1)] p-6 md:p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-6">What's Included</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayService.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-[#12d6b8]/20 rounded-full flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-[#12d6b8]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-[#98a0ad]">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info Sections */}
            <div className="bg-[rgba(255,255,255,0.03)] rounded-[18px] border border-[rgba(255,255,255,0.1)] p-6 md:p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-white mb-6">How It Works</h2>
              <div className="space-y-4">
                {[
                  'Submit your requirements',
                  'Our expert reviews and analyzes',
                  'Service preparation',
                  'Quality review',
                  'Delivery and completion',
                  'Ongoing support'
                ].map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#1287ff] to-[#12d6b8] rounded-xl flex items-center justify-center font-bold text-white shadow-lg">
                      {index + 1}
                    </div>
                    <p className="text-[#98a0ad] pt-2">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Configurator Panel (1/3 on desktop, sticky) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Configurator Card */}
              <div className="bg-[rgba(255,255,255,0.03)] rounded-[18px] border border-[rgba(255,255,255,0.1)] p-6 shadow-lg">
                <h3 className="text-xl font-bold text-white mb-6">Configure Your Service</h3>

                {/* Billing Period Toggle - Only show periods configured by Admin */}
                {subService && subService.pricingStructure && subService.pricingStructure.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-white mb-3">
                      Billing Period
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {subService.pricingStructure.map((pricing) => {
                        const periodLabel = pricing.period === 'one_time' 
                          ? 'One-Time' 
                          : pricing.period.charAt(0).toUpperCase() + pricing.period.slice(1).replace('_', ' ');
                        
                        return (
                          <button
                            key={pricing.period}
                            onClick={() => setSelectedPeriod(pricing.period)}
                            className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                              selectedPeriod === pricing.period
                                ? 'bg-[#1287ff] text-white shadow-lg shadow-[#1287ff]/20'
                                : 'bg-[rgba(255,255,255,0.05)] text-[#98a0ad] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)]'
                            }`}
                          >
                            {periodLabel}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-[#98a0ad] mt-3">
                      Choose how often you'll be billed. Prices shown are per selected billing period.
                    </p>
                  </div>
                )}

                {/* Configurable Options - Service Requests */}
                {subService && subService.requests && subService.requests.length > 0 && (
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-[#98a0ad]">
                        Additional Options
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#98a0ad]">
                          {subService.requests.length} {subService.requests.length === 1 ? 'option' : 'options'} available
                        </span>
                        <button
                          onClick={handleRefreshService}
                          className="text-xs text-[#1287ff] hover:text-[#0f6fd6] transition-colors flex items-center gap-1"
                          title="Refresh to get latest configuration"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Refresh
                        </button>
                      </div>
                    </div>
                    {subService.requests.map((request, index) => {
                      // Normalize inputType to handle case variations (from Admin App configuration)
                      // This ensures dynamic rendering based on what's configured in the database
                      const inputType = (request.inputType || '').toLowerCase();
                      
                      // Debug logging for each request
                      if (import.meta.env.DEV) {
                        console.log(`🎨 Rendering Request ${index} (${request.name}):`, {
                          rawInputType: request.inputType,
                          normalizedInputType: inputType,
                          willRenderAs: inputType === 'dropdown' ? 'DROPDOWN' : inputType === 'checkbox' ? 'CHECKBOX' : 'UNKNOWN',
                          hasOptions: !!(request.options && request.options.length > 0),
                          optionsCount: request.options?.length || 0
                        });
                      }
                      
                      return (
                      <div key={index} className="border-2 border-[rgba(255,255,255,0.1)] rounded-xl p-4 bg-[rgba(255,255,255,0.02)] hover:border-[rgba(255,255,255,0.2)] transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-semibold text-white">{request.name}</label>
                            {/* Input Type Badge */}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              inputType === 'dropdown' 
                                ? 'bg-[#1287ff]/20 text-[#1287ff] border border-[#1287ff]/30' 
                                : 'bg-[#12d6b8]/20 text-[#12d6b8] border border-[#12d6b8]/30'
                            }`}>
                              {inputType === 'dropdown' ? 'Dropdown' : 'Checkbox'}
                            </span>
                          </div>
                          {request.needsQuotation && (
                            <span className="px-2 py-1 bg-[#12d6b8]/20 text-[#12d6b8] rounded-full text-xs font-medium">
                              Quotation required
                            </span>
                          )}
                        </div>
                        
                        {/* Dropdown rendering - always show if inputType is dropdown */}
                        {inputType === 'dropdown' && (
                          <div>
                            <select
                              value={selectedRequestOptions[request.name] as string || ''}
                              onChange={(e) => handleOptionChange(request.name, e.target.value, false)}
                              disabled={!request.options || request.options.length === 0}
                              className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border-2 border-[rgba(255,255,255,0.1)] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1287ff] focus:border-[#1287ff] cursor-pointer transition-all hover:border-[rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <option value="" className="bg-[#0b1220] text-[#98a0ad]">
                                {request.options && request.options.length > 0 ? 'Select an option' : 'No options available'}
                              </option>
                              {request.options && request.options.length > 0 && request.options.map((option, optIndex) => (
                                <option key={optIndex} value={option.name} className="bg-[#0b1220] text-white">
                                  {option.name} {option.priceModifier !== 0 && `(${option.priceModifier > 0 ? '+' : ''}₹${option.priceModifier.toLocaleString('en-IN')})`}
                                  {option.needsQuotation && ' - Quote Required'}
                                </option>
                              ))}
                            </select>
                            {selectedRequestOptions[request.name] && (
                              <p className="text-xs text-[#98a0ad] mt-2">
                                Selected: {selectedRequestOptions[request.name]}
                              </p>
                            )}
                            {(!request.options || request.options.length === 0) && (
                              <p className="text-xs text-yellow-400 mt-2">
                                ⚠️ No options configured. Please contact admin to add options.
                              </p>
                            )}
                          </div>
                        )}

                        {/* Checkbox rendering - only show if inputType is checkbox */}
                        {inputType === 'checkbox' && request.options && request.options.length > 0 && (
                          <div className="space-y-3">
                            {request.options.map((option, optIndex) => {
                              const isSelected = request.isMultipleSelect
                                ? Array.isArray(selectedRequestOptions[request.name]) && (selectedRequestOptions[request.name] as string[]).includes(option.name)
                                : selectedRequestOptions[request.name] === option.name;
                              
                              return (
                                <label 
                                  key={optIndex} 
                                  className={`flex items-center gap-3 cursor-pointer group p-3 rounded-lg border transition-all ${
                                    isSelected 
                                      ? 'bg-[#1287ff]/10 border-[#1287ff]/50' 
                                      : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)]'
                                  }`}
                                >
                                  <input
                                    type={request.isMultipleSelect ? 'checkbox' : 'radio'}
                                    name={request.name}
                                    checked={isSelected}
                                    onChange={() => handleOptionChange(request.name, option.name, request.isMultipleSelect || false)}
                                    className="w-5 h-5 min-w-[20px] rounded border-2 border-[rgba(255,255,255,0.3)] bg-[rgba(255,255,255,0.05)] text-[#1287ff] focus:ring-2 focus:ring-[#1287ff] focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer accent-[#1287ff] flex-shrink-0"
                                  />
                                  <div className="flex-1 flex items-center justify-between min-w-0 ml-2">
                                    <div>
                                      <span className={`text-sm font-medium block ${isSelected ? 'text-white' : 'text-[#98a0ad]'}`}>
                                        {option.name}
                                      </span>
                                      {option.priceModifier !== 0 && (
                                        <span className={`text-xs mt-0.5 block ${isSelected ? 'text-[#12d6b8]' : 'text-[#98a0ad]'}`}>
                                          {option.priceModifier > 0 ? '+' : ''}₹{option.priceModifier.toLocaleString('en-IN')}
                                        </span>
                                      )}
                                    </div>
                                    {option.needsQuotation && (
                                      <span className="px-2 py-1 bg-[#12d6b8]/20 text-[#12d6b8] rounded-full text-xs font-medium ml-2">
                                        Quote Required
                                      </span>
                                    )}
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        )}
                        
                        {/* Simple checkbox when no options are configured */}
                        {inputType === 'checkbox' && (!request.options || request.options.length === 0) && (
                          <label 
                            className={`flex items-center gap-3 cursor-pointer group p-3 rounded-lg border transition-all ${
                              selectedRequestOptions[request.name]
                                ? 'bg-[#1287ff]/10 border-[#1287ff]/50' 
                                : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)]'
                            }`}
                          >
                            <input
                              type="checkbox"
                              name={request.name}
                              checked={!!selectedRequestOptions[request.name]}
                              onChange={(e) => handleCheckboxToggle(request.name, e.target.checked)}
                              className="w-5 h-5 min-w-[20px] rounded border-2 border-[rgba(255,255,255,0.3)] bg-[rgba(255,255,255,0.05)] text-[#1287ff] focus:ring-2 focus:ring-[#1287ff] focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer accent-[#1287ff] flex-shrink-0"
                            />
                            <div className="flex-1 flex items-center justify-between min-w-0 ml-2">
                              <div>
                                <span className={`text-sm font-medium block ${selectedRequestOptions[request.name] ? 'text-white' : 'text-[#98a0ad]'}`}>
                                  {request.name}
                                </span>
                                {request.priceModifier !== 0 && (
                                  <span className={`text-xs mt-0.5 block ${selectedRequestOptions[request.name] ? 'text-[#12d6b8]' : 'text-[#98a0ad]'}`}>
                                    {request.priceModifier > 0 ? '+' : ''}₹{request.priceModifier.toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                              {request.needsQuotation && (
                                <span className="px-2 py-1 bg-[#12d6b8]/20 text-[#12d6b8] rounded-full text-xs font-medium ml-2">
                                  Quote Required
                                </span>
                              )}
                            </div>
                          </label>
                        )}
                        
                      </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Show message if no requests configured */}
                {subService && (!subService.requests || subService.requests.length === 0) && (
                  <div className="p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-xl">
                    <p className="text-sm text-[#98a0ad] text-center">
                      No additional options available for this service
                    </p>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="border-t border-[rgba(255,255,255,0.1)] pt-6">
                  <h4 className="text-sm font-semibold text-white mb-4">Price Breakdown</h4>
                  <div className="space-y-2.5 mb-4">
                    {priceCalculation.breakdown.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm py-1">
                        <span className={item.type === 'base' ? 'text-white font-medium' : 'text-[#98a0ad]'}>
                          {item.label}
                        </span>
                        <span className={item.type === 'base' ? 'text-white font-semibold' : 'text-[#98a0ad]'}>
                          ₹{item.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t-2 border-[rgba(255,255,255,0.2)]">
                    <span className="text-lg font-bold text-white">Total</span>
                    <span 
                      className="text-2xl font-bold text-white transition-all duration-300" 
                      aria-live="polite" 
                      aria-atomic="true"
                      key={priceCalculation.total}
                    >
                      ₹{priceCalculation.total.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {priceCalculation.modifiers > 0 && (
                    <p className="text-xs text-[#12d6b8] mt-3 text-right font-medium">
                      +₹{priceCalculation.modifiers.toLocaleString('en-IN')} from selected options
                    </p>
                  )}
                </div>

                {/* Action Buttons Section */}
                <div className="mt-6 space-y-3">
                  {/* Payment button for free consultations */}
                  {hasFreeConsultation && !isServicePurchased && (
                    <button
                      onClick={handlePayment}
                      disabled={isProcessingPayment}
                      className="w-full px-6 py-4 bg-gradient-to-r from-[#007AFF] to-[#00C897] text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          <span>Pay Now</span>
                        </>
                      )}
                    </button>
                  )}
                  {/* Primary CTA Button */}
                  {!isServicePurchased && !hasFreeConsultation && (
                    <button
                      onClick={handleGetQuotation}
                      disabled={isProcessingPayment || priceCalculation.total === 0 || !isAuthenticated}
                      className="w-full px-6 py-4 bg-[#1287ff] text-white rounded-full font-semibold hover:bg-[#0f6fd6] transition-all shadow-lg shadow-[#1287ff]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isProcessingPayment ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Processing...</span>
                        </>
                      ) : !isAuthenticated ? (
                        <div className="space-y-3">
                          <button
                            onClick={() => {
                              handleNotifyTeam();
                            }}
                            disabled={isNotifyingTeam || isProcessingPayment}
                            className="w-full px-6 py-4 bg-[#1287ff] text-white rounded-full font-semibold hover:bg-[#0f6fd6] transition-all shadow-lg shadow-[#1287ff]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {isNotifyingTeam ? (
                              <>
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Notifying...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span>Notify Team</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              onNavigate('login');
                            }}
                            disabled={isNotifyingTeam || isProcessingPayment}
                            className="w-full px-6 py-3 bg-transparent border-2 border-[#1287ff] text-[#1287ff] rounded-full font-semibold hover:bg-[#1287ff]/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span>Pay Later (Login)</span>
                          </button>
                        </div>
                      ) : priceCalculation.needsQuotation 
                        ? 'Pay and Activate — Request Quotation' 
                        : priceCalculation.total === 0
                          ? 'Get Started'
                          : `Pay and Activate — ₹${priceCalculation.total.toLocaleString('en-IN')}`
                      }
                    </button>
                  )}
                  {hasFreeConsultation && !isServicePurchased && (
                    <button
                      onClick={handlePayment}
                      disabled={isProcessingPayment}
                      className="w-full px-6 py-4 bg-gradient-to-r from-[#007AFF] to-[#00C897] text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          <span>Pay Now</span>
                        </>
                      )}
                    </button>
                  )}
                  {isServicePurchased && !hasFreeConsultation && (
                    <div className="w-full px-6 py-4 bg-green-500/20 border-2 border-green-500/50 text-green-400 rounded-full font-semibold text-center flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Service Already Purchased</span>
                    </div>
                  )}

                  {/* Info Messages */}
                  {priceCalculation.needsQuotation && !isServicePurchased && !isAuthenticated && (
                    <p className="text-xs text-[#98a0ad] text-center">
                      Some selected options require a quotation. Please login to proceed.
                    </p>
                  )}
                  {!isAuthenticated && !isServicePurchased && (
                    <p className="text-xs text-[#98a0ad] text-center">
                      Notify our team or login to proceed with payment.
                    </p>
                  )}

                  {/* Free Consultation Button */}
                  {!isServicePurchased && !hasFreeConsultation && (
                    <button
                      onClick={() => {
                        if (!isAuthenticated) {
                          onNavigate('login');
                        } else {
                          handleFreeConsultation();
                        }
                      }}
                      disabled={isRequestingConsultation || isProcessingPayment}
                      className="w-full px-6 py-3 bg-transparent border-2 border-[#12d6b8] text-[#12d6b8] rounded-full font-semibold hover:bg-[#12d6b8]/10 transition-all shadow-lg shadow-[#12d6b8]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isRequestingConsultation ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Requesting...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span>{!isAuthenticated ? 'Login to Request Free Consultation' : hasFreeConsultation ? 'Consultation Requested ✓' : 'Request Free Consultation'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Secondary Actions */}
                <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-[rgba(255,255,255,0.1)]">
                  <button className="text-sm text-[#98a0ad] hover:text-[#1287ff] transition-colors">
                    Save as Favourite
                  </button>
                  <span className="text-[#98a0ad]">•</span>
                  <button className="text-sm text-[#98a0ad] hover:text-[#1287ff] transition-colors">
                    Compare
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      {successPopup.isOpen && (
        <SuccessPopup
          isOpen={successPopup.isOpen}
          onClose={() => setSuccessPopup({ ...successPopup, isOpen: false })}
          title={successPopup.title}
          message={successPopup.message}
          serviceName={successPopup.serviceName}
          purchaseId={successPopup.purchaseId}
          amount={successPopup.amount}
          currency={successPopup.currency}
        />
      )}

      {/* Mobile Bottom Sheet - Configurator */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[rgba(11,18,32,0.98)] backdrop-blur-lg border-t border-[rgba(255,255,255,0.1)] shadow-2xl z-50">
        {/* Collapsed State - Always Visible */}
        {!showMobileConfigurator && (
          <div className="px-4 py-4 flex items-center justify-between">
            <div>
              <p className="text-[#98a0ad] text-xs mb-1">Total</p>
              <p className="text-2xl font-bold text-white" aria-live="polite">
                ₹{priceCalculation.total.toLocaleString('en-IN')}
              </p>
            </div>
            <button
              onClick={() => setShowMobileConfigurator(true)}
              className="px-6 py-3 bg-[#1287ff] text-white rounded-full font-semibold hover:bg-[#0f6fd6] transition-all shadow-lg shadow-[#1287ff]/20"
            >
              Configure
            </button>
          </div>
        )}

        {/* Expanded State */}
        {showMobileConfigurator && (
          <div className="max-h-[80vh] overflow-y-auto">
            <div className="px-4 py-4 border-b border-[rgba(255,255,255,0.1)] flex items-center justify-between sticky top-0 bg-[rgba(11,18,32,0.98)] backdrop-blur-lg z-10">
              <h3 className="text-lg font-bold text-white">Configure Your Service</h3>
              <button
                onClick={() => setShowMobileConfigurator(false)}
                className="text-[#98a0ad] hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 space-y-6">
              {/* Billing Period - Only show periods configured by Admin */}
              {subService && subService.pricingStructure && subService.pricingStructure.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-[#98a0ad] mb-3">
                    Billing Period
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {subService.pricingStructure.map((pricing) => {
                      const periodLabel = pricing.period === 'one_time' 
                        ? 'One-Time' 
                        : pricing.period.charAt(0).toUpperCase() + pricing.period.slice(1).replace('_', ' ');
                      
                      return (
                        <button
                          key={pricing.period}
                          onClick={() => setSelectedPeriod(pricing.period)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            selectedPeriod === pricing.period
                              ? 'bg-[#1287ff] text-white shadow-lg shadow-[#1287ff]/20'
                              : 'bg-[rgba(255,255,255,0.05)] text-[#98a0ad] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)]'
                          }`}
                        >
                          {periodLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Options */}
              {subService && subService.requests && subService.requests.length > 0 && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-[#98a0ad]">
                    Options
                  </label>
                  {subService.requests.map((request, index) => {
                    // Normalize inputType to handle case variations (from Admin App configuration)
                    // This ensures dynamic rendering based on what's configured in the database
                    const inputType = (request.inputType || '').toLowerCase();
                    
                    return (
                    <div key={index} className="border border-[rgba(255,255,255,0.1)] rounded-xl p-4 bg-[rgba(255,255,255,0.02)]">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-white">{request.name}</label>
                          {/* Input Type Badge */}
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            inputType === 'dropdown' 
                              ? 'bg-[#1287ff]/20 text-[#1287ff] border border-[#1287ff]/30' 
                              : 'bg-[#12d6b8]/20 text-[#12d6b8] border border-[#12d6b8]/30'
                          }`}>
                            {inputType === 'dropdown' ? 'Dropdown' : 'Checkbox'}
                          </span>
                        </div>
                        {request.needsQuotation && (
                          <span className="px-2 py-1 bg-[#12d6b8]/20 text-[#12d6b8] rounded-full text-xs font-medium">
                            Quotation required
                          </span>
                        )}
                      </div>
                      
                      {/* Dropdown rendering - always show if inputType is dropdown */}
                      {inputType === 'dropdown' && (
                        <div>
                          <select
                            value={selectedRequestOptions[request.name] as string || ''}
                            onChange={(e) => handleOptionChange(request.name, e.target.value, false)}
                            disabled={!request.options || request.options.length === 0}
                            className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border-2 border-[rgba(255,255,255,0.1)] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1287ff] focus:border-[#1287ff] cursor-pointer transition-all hover:border-[rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="" className="bg-[#0b1220] text-[#98a0ad]">
                              {request.options && request.options.length > 0 ? 'Select an option' : 'No options available'}
                            </option>
                            {request.options && request.options.length > 0 && request.options.map((option, optIndex) => (
                              <option key={optIndex} value={option.name} className="bg-[#0b1220] text-white">
                                {option.name} {option.priceModifier !== 0 && `(${option.priceModifier > 0 ? '+' : ''}₹${option.priceModifier.toLocaleString('en-IN')})`}
                                {option.needsQuotation && ' - Quote Required'}
                              </option>
                            ))}
                          </select>
                          {selectedRequestOptions[request.name] && (
                            <p className="text-xs text-[#98a0ad] mt-2">
                              Selected: {selectedRequestOptions[request.name]}
                            </p>
                          )}
                          {(!request.options || request.options.length === 0) && (
                            <p className="text-xs text-yellow-400 mt-2">
                              ⚠️ No options configured. Please contact admin to add options.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Checkbox rendering - only show if inputType is checkbox */}
                      {inputType === 'checkbox' && request.options && request.options.length > 0 && (
                        <div className="space-y-3">
                          {request.options.map((option, optIndex) => {
                            const isSelected = request.isMultipleSelect
                              ? Array.isArray(selectedRequestOptions[request.name]) && (selectedRequestOptions[request.name] as string[]).includes(option.name)
                              : selectedRequestOptions[request.name] === option.name;
                            
                            return (
                              <label 
                                key={optIndex} 
                                className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-all ${
                                  isSelected 
                                    ? 'bg-[#1287ff]/10 border-[#1287ff]/50' 
                                    : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)]'
                                }`}
                              >
                                <input
                                  type={request.isMultipleSelect ? 'checkbox' : 'radio'}
                                  name={request.name}
                                  checked={isSelected}
                                  onChange={() => handleOptionChange(request.name, option.name, request.isMultipleSelect || false)}
                                  className="w-5 h-5 min-w-[20px] rounded border-2 border-[rgba(255,255,255,0.3)] bg-[rgba(255,255,255,0.05)] text-[#1287ff] focus:ring-2 focus:ring-[#1287ff] focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer accent-[#1287ff] flex-shrink-0"
                                />
                                <div className="flex-1 flex items-center justify-between min-w-0 ml-2">
                                  <div>
                                    <span className={`text-sm font-medium block ${isSelected ? 'text-white' : 'text-[#98a0ad]'}`}>
                                      {option.name}
                                    </span>
                                    {option.priceModifier !== 0 && (
                                      <span className={`text-xs mt-0.5 block ${isSelected ? 'text-[#12d6b8]' : 'text-[#98a0ad]'}`}>
                                        {option.priceModifier > 0 ? '+' : ''}₹{option.priceModifier.toLocaleString('en-IN')}
                                      </span>
                                    )}
                                  </div>
                                  {option.needsQuotation && (
                                    <span className="px-2 py-1 bg-[#12d6b8]/20 text-[#12d6b8] rounded-full text-xs font-medium ml-2">
                                      Quote Required
                                    </span>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* Simple checkbox when no options are configured (Mobile View) */}
                      {inputType === 'checkbox' && (!request.options || request.options.length === 0) && (
                        <label 
                          className={`flex items-center gap-3 cursor-pointer group p-3 rounded-lg border transition-all ${
                            selectedRequestOptions[request.name]
                              ? 'bg-[#1287ff]/10 border-[#1287ff]/50' 
                              : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)]'
                          }`}
                        >
                          <input
                            type="checkbox"
                            name={request.name}
                            checked={!!selectedRequestOptions[request.name]}
                            onChange={(e) => handleCheckboxToggle(request.name, e.target.checked)}
                            className="w-5 h-5 min-w-[20px] rounded border-2 border-[rgba(255,255,255,0.3)] bg-[rgba(255,255,255,0.05)] text-[#1287ff] focus:ring-2 focus:ring-[#1287ff] focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer accent-[#1287ff] flex-shrink-0"
                          />
                          <div className="flex-1 flex items-center justify-between min-w-0 ml-2">
                            <div>
                              <span className={`text-sm font-medium block ${selectedRequestOptions[request.name] ? 'text-white' : 'text-[#98a0ad]'}`}>
                                {request.name}
                              </span>
                              {request.priceModifier !== 0 && (
                                <span className={`text-xs mt-0.5 block ${selectedRequestOptions[request.name] ? 'text-[#12d6b8]' : 'text-[#98a0ad]'}`}>
                                  {request.priceModifier > 0 ? '+' : ''}₹{request.priceModifier.toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                            {request.needsQuotation && (
                              <span className="px-2 py-1 bg-[#12d6b8]/20 text-[#12d6b8] rounded-full text-xs font-medium ml-2">
                                Quote Required
                              </span>
                            )}
                          </div>
                        </label>
                      )}
                    </div>
                    );
                  })}
                </div>
              )}

              {/* Price Breakdown */}
              <div className="border-t border-[rgba(255,255,255,0.1)] pt-4">
                <h4 className="text-sm font-medium text-[#98a0ad] mb-4">Price Breakdown</h4>
                <div className="space-y-2 mb-4">
                  {priceCalculation.breakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className={item.type === 'base' ? 'text-white font-medium' : 'text-[#98a0ad]'}>
                        {item.label}
                      </span>
                      <span className={item.type === 'base' ? 'text-white font-medium' : 'text-[#98a0ad]'}>
                        ₹{item.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-[rgba(255,255,255,0.1)]">
                  <span className="text-lg font-bold text-white">Total</span>
                  <span className="text-2xl font-bold text-white" aria-live="polite">
                    ₹{priceCalculation.total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Action Buttons Section - Mobile */}
              <div className="mt-6 space-y-3">
                  {/* Primary CTA Button */}
                {!isServicePurchased ? (
                  !isAuthenticated ? (
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          setShowMobileConfigurator(false);
                          handleNotifyTeam();
                        }}
                        disabled={isNotifyingTeam || isProcessingPayment}
                        className="w-full px-6 py-4 bg-[#1287ff] text-white rounded-full font-semibold hover:bg-[#0f6fd6] transition-all shadow-lg shadow-[#1287ff]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isNotifyingTeam ? (
                          <>
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Notifying...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span>Notify Team</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShowMobileConfigurator(false);
                          onNavigate('login');
                        }}
                        disabled={isNotifyingTeam || isProcessingPayment}
                        className="w-full px-6 py-3 bg-transparent border-2 border-[#1287ff] text-[#1287ff] rounded-full font-semibold hover:bg-[#1287ff]/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Pay Later (Login)</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setShowMobileConfigurator(false);
                        handleGetQuotation();
                      }}
                      disabled={isProcessingPayment || priceCalculation.total === 0}
                      className="w-full px-6 py-4 bg-[#1287ff] text-white rounded-full font-semibold hover:bg-[#0f6fd6] transition-all shadow-lg shadow-[#1287ff]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isProcessingPayment ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Processing...</span>
                        </>
                      ) : priceCalculation.needsQuotation 
                        ? 'Pay and Activate — Request Quotation' 
                        : priceCalculation.total === 0
                          ? 'Get Started'
                          : `Pay and Activate — ₹${priceCalculation.total.toLocaleString('en-IN')}`
                      }
                    </button>
                  )
                ) : hasFreeConsultation ? (
                  <button
                    onClick={() => {
                      setShowMobileConfigurator(false);
                      handlePayment();
                    }}
                    disabled={isProcessingPayment}
                    className="w-full px-6 py-4 bg-gradient-to-r from-[#007AFF] to-[#00C897] text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <span>Pay Now</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="w-full px-6 py-4 bg-green-500/20 border-2 border-green-500/50 text-green-400 rounded-full font-semibold text-center flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Service Already Purchased</span>
                  </div>
                )}

                {/* Free Consultation Button - Mobile */}
                {!isServicePurchased && !hasFreeConsultation && (
                  <button
                    onClick={() => {
                      setShowMobileConfigurator(false);
                      if (!isAuthenticated) {
                        onNavigate('login');
                      } else {
                        handleFreeConsultation();
                      }
                    }}
                    disabled={isRequestingConsultation || isProcessingPayment}
                    className="w-full px-6 py-3 bg-transparent border-2 border-[#12d6b8] text-[#12d6b8] rounded-full font-semibold hover:bg-[#12d6b8]/10 transition-all shadow-lg shadow-[#12d6b8]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isRequestingConsultation ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Requesting...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{!isAuthenticated ? 'Login to Request Free Consultation' : 'Request Free Consultation'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Error */}
      {paymentError && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg max-w-md z-50">
          <p className="font-semibold mb-1">Payment Error</p>
          <p className="text-sm">{paymentError}</p>
          <button
            onClick={() => setPaymentError(null)}
            className="mt-2 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

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

