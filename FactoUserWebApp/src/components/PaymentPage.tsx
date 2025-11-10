import { useState, useEffect } from 'react';
import { fetchSubServiceById, SubService } from '../api/services';

type PageType = 'home' | 'services' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment';

interface PaymentPageProps {
  onNavigate: (page: PageType) => void;
  serviceId?: string;
}

export function PaymentPage({ onNavigate, serviceId }: PaymentPageProps) {
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{code: string, discount: number} | null>(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [serviceDetails, setServiceDetails] = useState<SubService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch service details from API
  useEffect(() => {
    const loadServiceDetails = async () => {
      if (!serviceId) {
        setError('Service ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const service = await fetchSubServiceById(serviceId);
        setServiceDetails(service);
      } catch (err: any) {
        console.error('Error loading service details:', err);
        setError('Failed to load service details. Please try again.');
        setServiceDetails(null);
      } finally {
        setLoading(false);
      }
    };

    loadServiceDetails();
  }, [serviceId]);

  // Get price from service details or default to 0
  const basePrice = serviceDetails?.price || 0;
  const originalPrice = serviceDetails?.pricingStructure?.[0]?.price || basePrice || 0;

  const pricingPlans = {
    monthly: {
      price: basePrice,
      originalPrice: originalPrice,
      duration: serviceDetails?.period === 'one_time' ? 'One-time' : 'Monthly',
      features: serviceDetails?.features || [
        'Complete service delivery',
        'Expert CA review',
        'Error-free processing',
        'Document verification',
        'Government filing',
        'Email support'
      ]
    },
    yearly: {
      price: Math.round(basePrice * 1.5),
      originalPrice: Math.round(originalPrice * 1.5),
      duration: 'Annual Package',
      features: [
        'Unlimited service access',
        'Priority CA consultation',
        'Express processing',
        'Document storage',
        'Post-service support',
        'Tax planning advice'
      ]
    },
    consultation: {
      price: 0,
      originalPrice: 0,
      duration: 'Free Consultation',
      features: [
        'Free initial consultation',
        'Service assessment & analysis',
        'Customized strategy',
        'No obligation to proceed',
        'Pay only if satisfied',
        'Expert CA guidance'
      ]
    }
  };

  const discountCodes = {
    'SAVE20': 20,
    'FIRST100': 100,
    'STUDENT50': 50
  };

  const currentPlan = pricingPlans[selectedPlan as keyof typeof pricingPlans];
  const subtotal = currentPlan.price;
  const discountAmount = appliedDiscount ? appliedDiscount.discount : 0;
  const taxes = Math.round((subtotal - discountAmount) * 0.18);
  const total = subtotal - discountAmount + taxes;

  // Show loading or error state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-white dark:from-gray-900 dark:to-gray-800 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#007AFF]"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (error || !serviceDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-white dark:from-gray-900 dark:to-gray-800 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">{error || 'Service not found'}</div>
          <button 
            onClick={() => onNavigate('services')}
            className="bg-[#007AFF] text-white px-6 py-2 rounded-lg hover:bg-[#0056CC] transition-colors"
          >
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  const paymentMethods = [
    {
      id: 'upi',
      name: 'UPI',
      description: 'Pay using any UPI app',
      icon: '📱',
      popular: true
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard, RuPay',
      icon: '💳',
      popular: false
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      description: 'All major banks supported',
      icon: '🏦',
      popular: false
    },
    {
      id: 'wallet',
      name: 'Wallet',
      description: 'Paytm, PhonePe, Google Pay',
      icon: '👛',
      popular: false
    }
  ];

  const applyDiscount = () => {
    const discount = discountCodes[discountCode as keyof typeof discountCodes];
    if (discount) {
      setAppliedDiscount({ code: discountCode, discount });
      setDiscountCode('');
    } else {
      alert('Invalid discount code');
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
  };

  const handlePayment = () => {
    // Simulate payment processing
    setShowPaymentSuccess(true);
  };

  if (showPaymentSuccess) {
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
              Thank you for your payment. Your ITR filing service has been activated and our team will contact you within 24 hours.
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Transaction ID:</span>
                <span className="text-sm font-mono text-[#007AFF] dark:text-blue-400">TXN{Math.random().toString(36).substring(2, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Amount Paid:</span>
                <span className="text-sm font-semibold">₹{total.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => onNavigate('home')}
                className="w-full bg-gradient-to-r from-[#007AFF] to-[#0056CC] text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
              >
                Back to Home
              </button>
              <button
                onClick={() => onNavigate('services')}
                className="w-full border border-[#007AFF] dark:border-blue-400 text-[#007AFF] dark:text-blue-400 py-3 px-4 rounded-lg font-medium hover:bg-[#007AFF] hover:text-white dark:hover:bg-blue-500 dark:hover:text-white transition-all"
              >
                Explore More Services
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-white dark:from-gray-900 dark:to-gray-800 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#1F2937] dark:text-white mb-4">
            Complete Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AFF] to-[#00C897]">Payment</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Secure payment gateway with 256-bit SSL encryption
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Plan Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Select Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(pricingPlans).map(([key, plan]) => (
                  <div
                    key={key}
                    className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                      selectedPlan === key
                        ? 'border-[#007AFF] bg-[#007AFF]/5'
                        : 'border-gray-200 dark:border-gray-600 hover:border-[#007AFF]/50'
                    }`}
                    onClick={() => setSelectedPlan(key)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          checked={selectedPlan === key}
                          onChange={() => setSelectedPlan(key)}
                          className="text-[#007AFF] dark:text-blue-400"
                        />
                        <span className="ml-2 font-semibold text-gray-800 dark:text-white">{plan.duration}</span>
                        {key === 'consultation' && (
                          <span className="ml-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                            FREE
                          </span>
                        )}
                        {key === 'yearly' && (
                          <span className="ml-2 bg-[#FFD166] text-[#1F2937] dark:text-gray-800 px-2 py-1 rounded-full text-xs font-bold">
                            Best Value
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-800 dark:text-white">
                          {plan.price === 0 ? 'FREE' : `₹${plan.price.toLocaleString()}`}
                        </span>
                        {plan.originalPrice > 0 && (
                          <span className="text-gray-400 line-through">₹{plan.originalPrice.toLocaleString()}</span>
                        )}
                      </div>
                      {plan.originalPrice > plan.price && plan.price > 0 && (
                        <div className="text-sm text-gray-800 dark:text-white font-medium">
                          Save ₹{(plan.originalPrice - plan.price).toLocaleString()}
                        </div>
                      )}
                      {plan.price === 0 && (
                        <div className="text-sm text-green-400 font-medium">
                          No payment required
                        </div>
                      )}
                    </div>
                    
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <svg className="w-3 h-3 text-[#00C897] mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                      {plan.features.length > 3 && (
                        <li className="text-[#007AFF] dark:text-blue-400 text-xs">
                          +{plan.features.length - 3} more features
                        </li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Discount Code */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Discount Code</h3>
              {!appliedDiscount ? (
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    placeholder="Enter discount code"
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <button
                    onClick={applyDiscount}
                    className="px-6 py-3 bg-[#007AFF] text-white rounded-lg font-medium hover:bg-[#0056CC] transition-colors"
                  >
                    Apply
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                  <div className="flex items-center text-green-700 dark:text-green-400">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">
                      Code "{appliedDiscount.code}" applied - Save ₹{appliedDiscount.discount}
                    </span>
                  </div>
                  <button
                    onClick={removeDiscount}
                    className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <p className="mb-2">Available discount codes:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-xs">SAVE20 (₹20 off)</span>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-xs">FIRST100 (₹100 off)</span>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-xs">STUDENT50 (₹50 off)</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Payment Method</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      paymentMethod === method.id
                        ? 'border-[#007AFF] bg-[#007AFF]/5'
                        : 'border-gray-200 dark:border-gray-600 hover:border-[#007AFF]/50'
                    }`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)}
                        className="text-[#007AFF] dark:text-blue-400"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center">
                          <span className="text-xl mr-2">{method.icon}</span>
                          <span className="font-medium text-gray-800 dark:text-white">{method.name}</span>
                          {method.popular && (
                            <span className="ml-2 bg-[#FFD166] text-[#1F2937] dark:text-gray-800 px-2 py-1 rounded-full text-xs font-bold">
                              Popular
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{method.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Form Fields */}
              <div className="space-y-4">
                {paymentMethod === 'upi' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-800 dark:text-white mb-2">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      placeholder="example@upi"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-800 dark:text-white mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-800 dark:text-white mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-800 dark:text-white mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-800 dark:text-white mb-2">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>
                  </>
                )}

                {paymentMethod === 'netbanking' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-800 dark:text-white mb-2">
                      Select Bank
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value="">Choose your bank</option>
                      <option value="sbi">State Bank of India</option>
                      <option value="hdfc">HDFC Bank</option>
                      <option value="icici">ICICI Bank</option>
                      <option value="axis">Axis Bank</option>
                      <option value="pnb">Punjab National Bank</option>
                    </select>
                  </div>
                )}

                {paymentMethod === 'wallet' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-800 dark:text-white mb-2">
                      Select Wallet
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value="">Choose wallet</option>
                      <option value="paytm">Paytm</option>
                      <option value="phonepe">PhonePe</option>
                      <option value="gpay">Google Pay</option>
                      <option value="amazorpay">Amazon Pay</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Service Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Order Summary</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-[#007AFF]/10 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-[#007AFF] dark:text-blue-400 text-xl">📊</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 dark:text-white">{serviceDetails.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {typeof serviceDetails.serviceId === 'object' && serviceDetails.serviceId !== null
                        ? (serviceDetails.serviceId.category || serviceDetails.serviceId.title || 'Service')
                        : 'Service'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{serviceDetails.description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Price Breakdown</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-800 dark:text-white">Subtotal</span>
                  <span className="font-medium text-gray-800 dark:text-white">₹{subtotal.toLocaleString()}</span>
                </div>
                
                {appliedDiscount && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedDiscount.code})</span>
                    <span>-₹{appliedDiscount.discount}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-800 dark:text-white">GST (18%)</span>
                  <span className="font-medium text-gray-800 dark:text-white">₹{taxes}</span>
                </div>
                
                <hr className="border-gray-200 dark:border-gray-600" />
                
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-800 dark:text-white">Total</span>
                  <span className="text-gray-800 dark:text-white">₹{total.toLocaleString()}</span>
                </div>
                
                {appliedDiscount && (
                  <div className="text-sm text-green-600 text-center">
                    You saved ₹{appliedDiscount.discount + (currentPlan.originalPrice - currentPlan.price)}!
                  </div>
                )}
              </div>
            </div>

            {/* Payment Button */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 p-6">
              <button
                onClick={total === 0 ? () => {
                  // Handle contact us action for free consultation
                  window.open('tel:+91-9876543210', '_self');
                } : handlePayment}
                className={`w-full py-4 px-6 rounded-lg font-bold text-lg hover:shadow-lg transition-all duration-200 mb-4 flex items-center justify-center ${
                  total === 0 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700' 
                    : 'bg-gradient-to-r from-[#007AFF] to-[#0056CC] text-white hover:from-[#0056CC] hover:to-[#007AFF]'
                }`}
              >
                {total === 0 ? (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Contact Us for Free Consultation
                  </>
                ) : (
                  `Pay ₹${total.toLocaleString()}`
                )}
              </button>
              
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
    </div>
  );
}
