import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { fetchAllSubServices, SubService } from '../api/services';
import { ServiceDocumentUpload } from './ServiceDocumentUpload';
import { API_BASE_URL } from '../config/apiConfig';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile';

interface UserProfileProps {
  onNavigate: (page: PageType) => void;
}

interface ServiceData {
  id: string;
  title: string;
  description: string;
  price: string;
  category: string;
  duration: string;
  features: string[];
}

interface UserPurchase {
  _id: string;
  itemType: string;
  itemId: string;
  selectedFeatures: string[];
  billingPeriod: string;
  status: 'active' | 'expired' | 'pending';
  createdAt: string;
  expiryDate?: string;
  paymentOrderId: string | {
    _id: string;
    amount: number;
    currency: string;
    status: string;
    transactionId: string;
    createdAt: string;
    paymentMethod?: string;
  };
}

interface PaymentOrder {
  _id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId: string;
  items: any[];
  createdAt: string;
}

interface Quotation {
  _id: string;
  subServiceId: string;
  selectedFeatures: string[];
  price?: number;
  createdAt: string;
}

export function UserProfile({ onNavigate }: UserProfileProps) {
  const { user, logout, forceLogout, token, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'services' | 'payments'>('profile');
  const [userPurchases, setUserPurchases] = useState<UserPurchase[]>([]);
  const [paymentOrders, setPaymentOrders] = useState<PaymentOrder[]>([]);
  const [, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedServiceForUpload, setSelectedServiceForUpload] = useState<{id: string, name: string} | null>(null);
  const [serviceDocumentCounts, setServiceDocumentCounts] = useState<{[key: string]: number}>({});
  const [allServices, setAllServices] = useState<SubService[]>([]);
  const [_servicesLoading, setServicesLoading] = useState(true);

  // Fetch all services for mapping
  useEffect(() => {
    const loadAllServices = async () => {
      try {
        setServicesLoading(true);
        const data = await fetchAllSubServices();
        setAllServices(data);
      } catch (err) {
        console.error('Error fetching all services:', err);
      } finally {
        setServicesLoading(false);
      }
    };

    loadAllServices();
  }, []);

  // Create service data mapping from fetched services
  const serviceDataMap: { [key: string]: ServiceData } = allServices.reduce((acc, service) => {
    acc[service._id] = {
      id: service._id,
      title: service.title,
      description: service.description,
      price: `₹${service.price}`,
      category: service.serviceId?.title || 'General Services',
      duration: service.period,
      features: service.features || []
    };
    return acc;
  }, {} as { [key: string]: ServiceData });

  // Fallback service data mapping for backward compatibility
  const fallbackServiceDataMap: { [key: string]: ServiceData } = {
    // ITR Services
    'itr-1': {
      id: 'itr-1',
      title: 'ITR-1',
      description: 'Salaried + 1 House property Plan',
      price: '₹1',
      category: 'Tax Services',
      duration: '2-3 days',
      features: ['Resident individuals having income upto 50 Lakh', 'Salaried Income', 'Single House Property']
    },
    'itr-2': {
      id: 'itr-2',
      title: 'ITR-2',
      description: 'Salary + more than 1 House property, Capital gain',
      price: '₹1',
      category: 'Tax Services',
      duration: '3-5 days',
      features: ['Resident individuals having income more than 50 Lakh', 'Capital Gain', 'More than 1 house property income']
    },
    'itr-3': {
      id: 'itr-3',
      title: 'ITR-3',
      description: 'Business Income Plan',
      price: '₹1',
      category: 'Tax Services',
      duration: '5-7 days',
      features: ['Business Income', 'Professional Income', 'P&L Statement preparation']
    },
    'itr-4': {
      id: 'itr-4',
      title: 'ITR-4',
      description: 'Presumptive Taxation Plan',
      price: '₹1',
      category: 'Tax Services',
      duration: '3-5 days',
      features: ['Presumptive Taxation', 'Business Income', 'Professional Income']
    },
    // GST Services
    'gstr-1-3b-monthly': {
      id: 'gstr-1-3b-monthly',
      title: 'GSTR-1 & GSTR-3B Monthly',
      description: 'Monthly GST Returns Filing',
      price: '₹1',
      category: 'GST Services',
      duration: '3-5 days',
      features: ['Monthly GSTR-1 filing', 'Monthly GSTR-3B filing', 'GST compliance']
    },
    'gstr-1-3b-quarterly': {
      id: 'gstr-1-3b-quarterly',
      title: 'GSTR-1/IFF & GSTR-3B Quarterly',
      description: 'Quarterly GST Returns Filing',
      price: '₹1',
      category: 'GST Services',
      duration: '5-7 days',
      features: ['Quarterly GSTR-1 filing', 'Quarterly GSTR-3B filing', 'IFF filing']
    },
    'gst-registration': {
      id: 'gst-registration',
      title: 'GST Registration',
      description: 'New GST Registration Service',
      price: '₹1',
      category: 'GST Services',
      duration: '7-10 days',
      features: ['GST registration application', 'Document preparation', 'Follow-up with department']
    },
    'gst-compliance-composite': {
      id: 'gst-compliance-composite',
      title: 'GST Compliance for Composite Dealer',
      description: 'Composite Dealer GST Compliance',
      price: '₹1',
      category: 'GST Services',
      duration: '3-5 days',
      features: ['Composite dealer compliance', 'GST return filing', 'Compliance monitoring']
    },
    'lut-filing': {
      id: 'lut-filing',
      title: 'LUT Filing',
      description: 'Letter of Undertaking Filing',
      price: '₹1',
      category: 'GST Services',
      duration: '2-3 days',
      features: ['LUT application', 'Document preparation', 'Department follow-up']
    },
    // Consultancy Services
    'tax-planning-consultancy': {
      id: 'tax-planning-consultancy',
      title: 'Tax Planning Consultancy',
      description: 'Personalized Tax Planning Advice',
      price: '₹1',
      category: 'Consultancy on tax planning',
      duration: '5-7 days',
      features: ['Personalized tax strategy', 'Investment advice', 'Tax optimization']
    },
    'business-tax-consultancy': {
      id: 'business-tax-consultancy',
      title: 'Business Tax Consultancy',
      description: 'Business Tax Planning and Compliance',
      price: '₹1',
      category: 'Consultancy on tax planning',
      duration: '7-10 days',
      features: ['Business tax strategy', 'Compliance planning', 'Audit support']
    },
    // Registration Services
    'company-registration': {
      id: 'company-registration',
      title: 'Company Registration',
      description: 'Private Limited Company Registration',
      price: '₹1',
      category: 'Registrations',
      duration: '10-15 days',
      features: ['Company incorporation', 'DIN & DSC', 'ROC filing']
    },
    'llp-registration': {
      id: 'llp-registration',
      title: 'LLP Registration',
      description: 'Limited Liability Partnership Registration',
      price: '₹1',
      category: 'Registrations',
      duration: '8-12 days',
      features: ['LLP incorporation', 'Partnership deed', 'ROC compliance']
    },
    'partnership-registration': {
      id: 'partnership-registration',
      title: 'Partnership Registration',
      description: 'Partnership Firm Registration',
      price: '₹1',
      category: 'Registrations',
      duration: '5-7 days',
      features: ['Partnership deed', 'Firm registration', 'PAN & TAN']
    },
    'sole-proprietorship': {
      id: 'sole-proprietorship',
      title: 'Sole Proprietorship',
      description: 'Sole Proprietorship Registration',
      price: '₹1',
      category: 'Registrations',
      duration: '3-5 days',
      features: ['Business registration', 'PAN & TAN', 'GST registration']
    },
    'trademark-registration': {
      id: 'trademark-registration',
      title: 'Trademark Registration',
      description: 'Trademark Application and Registration',
      price: '₹1',
      category: 'Registrations',
      duration: '12-18 months',
      features: ['Trademark search', 'Application filing', 'Follow-up & renewal']
    },
    'import-export-code': {
      id: 'import-export-code',
      title: 'Import Export Code',
      description: 'IEC Code Registration',
      price: '₹1',
      category: 'Registrations',
      duration: '5-7 days',
      features: ['IEC application', 'Document preparation', 'Department follow-up']
    },
    // Outsourcing Services
    'bookkeeping-services': {
      id: 'bookkeeping-services',
      title: 'Bookkeeping Services',
      description: 'Complete Bookkeeping and Accounting',
      price: '₹1',
      category: 'Outsourcing Services',
      duration: 'Ongoing',
      features: ['Daily bookkeeping', 'Monthly reports', 'Financial statements']
    },
    'payroll-management': {
      id: 'payroll-management',
      title: 'Payroll Management',
      description: 'Complete Payroll Processing',
      price: '₹1',
      category: 'Outsourcing Services',
      duration: 'Ongoing',
      features: ['Salary processing', 'PF & ESI compliance', 'Tax deductions']
    },
    'tax-compliance-outsourcing': {
      id: 'tax-compliance-outsourcing',
      title: 'Tax Compliance Outsourcing',
      description: 'Complete Tax Compliance Management',
      price: '₹1',
      category: 'Outsourcing Services',
      duration: 'Ongoing',
      features: ['Tax return filing', 'Compliance monitoring', 'Audit support']
    },
    // Additional services from ServicesPage that were missing
    'gst-composite-quarterly': {
      id: 'gst-composite-quarterly',
      title: 'GST Compliance for Composite Dealer (Quarterly)',
      description: 'Composite Dealer GST Compliance',
      price: '₹1',
      category: 'GST Services',
      duration: '3-5 days',
      features: ['Composite dealer compliance', 'GST return filing', 'Compliance monitoring']
    },
    'lut-filing-annually': {
      id: 'lut-filing-annually',
      title: 'LUT Filing (Annually)',
      description: 'Letter of Undertaking Filing',
      price: '₹1',
      category: 'GST Services',
      duration: '2-3 days',
      features: ['LUT application', 'Document preparation', 'Department follow-up']
    },
    'tax-optimization-plan': {
      id: 'tax-optimization-plan',
      title: 'Tax Optimization Plan (Annual)',
      description: 'Personalized Tax Optimization Strategy',
      price: '₹1',
      category: 'Consultancy on tax planning',
      duration: '7-10 days',
      features: ['Tax strategy planning', 'Investment optimization', 'Compliance planning']
    },
    'property-tax-optimization': {
      id: 'property-tax-optimization',
      title: 'Property tax Optimization Plan (Annual)',
      description: 'Property Tax Optimization Strategy',
      price: '₹1',
      category: 'Consultancy on tax planning',
      duration: '5-7 days',
      features: ['Property tax planning', 'Investment advice', 'Tax optimization']
    },
    'gst-registration-service': {
      id: 'gst-registration-service',
      title: 'GST Registration',
      description: 'New GST Registration Service',
      price: '₹1',
      category: 'Registrations',
      duration: '7-10 days',
      features: ['GST registration application', 'Document preparation', 'Follow-up with department']
    },
    'msme-registration-service': {
      id: 'msme-registration-service',
      title: 'MSME Registration',
      description: 'MSME Registration Service',
      price: '₹1',
      category: 'Registrations',
      duration: '5-7 days',
      features: ['MSME application', 'Document preparation', 'Department follow-up']
    },
    'startup-india-registration': {
      id: 'startup-india-registration',
      title: 'Startup India Registration',
      description: 'Startup India Registration Service',
      price: '₹1',
      category: 'Registrations',
      duration: '10-15 days',
      features: ['Startup India application', 'Document preparation', 'Department follow-up']
    },
    'day-to-day-accounting': {
      id: 'day-to-day-accounting',
      title: 'Day-to-day Accounting',
      description: 'Daily Accounting Services',
      price: '₹1',
      category: 'Outsourcing Services',
      duration: 'Ongoing',
      features: ['Daily bookkeeping', 'Monthly reports', 'Financial statements']
    },
    'finance-gst-compliance': {
      id: 'finance-gst-compliance',
      title: 'Finance Role & GST Compliance',
      description: 'Complete Finance and GST Compliance Management',
      price: '₹1',
      category: 'Outsourcing Services',
      duration: 'Ongoing',
      features: ['Financial management', 'GST compliance', 'Tax planning']
    }
  };

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !isAuthenticated || !token) {
        console.log('Skipping user data fetch - user not authenticated');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Fetch user purchases, payment orders, and quotations in parallel
        const [purchasesRes, paymentsRes, quotationsRes] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/user-purchases`, { headers }),
          axios.get(`${API_BASE_URL}/payment-orders`, { headers }),
          axios.get(`${API_BASE_URL}/quotations`, { headers })
        ]);

        if (purchasesRes.status === 'fulfilled') {
          const purchases = purchasesRes.value.data.data || [];
          setUserPurchases(purchases);
          
          // Extract payment orders from purchases if they're populated
          const populatedPayments = purchases
            .map((p: any) => p.paymentOrderId)
            .filter((p: any) => p && typeof p === 'object' && p._id)
            .map((p: any) => ({
              _id: p._id,
              amount: p.amount,
              currency: p.currency || 'INR',
              status: p.status,
              paymentMethod: p.paymentMethod || 'razorpay',
              transactionId: p.transactionId || p._id,
              items: [],
              createdAt: p.createdAt
            }));
          
          // Merge with directly fetched payment orders
          if (paymentsRes.status === 'fulfilled') {
            const directPayments = paymentsRes.value.data.data || [];
            // Combine and deduplicate by _id
            const allPayments = [...directPayments, ...populatedPayments];
            const uniquePayments = Array.from(
              new Map(allPayments.map((p: any) => [p._id, p])).values()
            );
            setPaymentOrders(uniquePayments);
          } else if (populatedPayments.length > 0) {
            setPaymentOrders(populatedPayments);
          }
        } else if (paymentsRes.status === 'fulfilled') {
          setPaymentOrders(paymentsRes.value.data.data || []);
        }

        if (quotationsRes.status === 'fulfilled') {
          setQuotations(quotationsRes.value.data.data || []);
        }

        // Fetch document counts for each service
        // Use purchases from the response, not state (which hasn't updated yet)
        const purchases = purchasesRes.status === 'fulfilled' ? (purchasesRes.value.data.data || []) : [];
        const documentCounts: {[key: string]: number} = {};
        for (const purchase of purchases) {
          try {
            const docResponse = await axios.get(
              `${API_BASE_URL}/document/service/${purchase._id}`,
              { headers }
            );
            documentCounts[purchase._id] = docResponse.data.data.userDocuments?.length || 0;
          } catch (error) {
            documentCounts[purchase._id] = 0;
          }
        }
        setServiceDocumentCounts(documentCounts);

      } catch (error: any) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, isAuthenticated, token]);

  // Helper functions
  const getServiceData = (itemId: string): ServiceData | null => {
    return serviceDataMap[itemId] || fallbackServiceDataMap[itemId] || null;
  };

  const getPaymentStatus = (purchase: UserPurchase): { status: string; color: string } => {
    // Check if paymentOrderId is populated (object) or just an ID (string)
    const payment = typeof purchase.paymentOrderId === 'object' && purchase.paymentOrderId
      ? purchase.paymentOrderId
      : paymentOrders.find(p => p._id === purchase.paymentOrderId);
    
    if (!payment) return { status: 'Unknown', color: 'gray' };
    
    const status = typeof payment === 'object' && 'status' in payment ? payment.status : 'unknown';
    
    switch (status) {
      case 'completed':
        return { status: 'Paid', color: 'green' };
      case 'pending':
        return { status: 'Pending', color: 'yellow' };
      case 'failed':
        return { status: 'Failed', color: 'red' };
      case 'refunded':
        return { status: 'Refunded', color: 'blue' };
      default:
        return { status: 'Unknown', color: 'gray' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Please log in to view your profile</h2>
          <button
            onClick={() => onNavigate('login')}
            className="bg-[#007AFF] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0056CC] transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-white dark:from-gray-900 dark:to-gray-800 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#1F2937] dark:text-white mb-4">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AFF] to-[#00C897]">Facto</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Manage your profile, services, and payments
          </p>
        </div>

        {/* Summary Statistics */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Services Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Services</p>
                  <p className="text-2xl font-bold text-[#1F2937] dark:text-white">
                    {loading ? '...' : userPurchases.filter(purchase => getServiceData(purchase.itemId) !== null).length}
                  </p>
                </div>
              </div>
            </div>

            {/* Payments Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Payments</p>
                  <p className="text-2xl font-bold text-[#1F2937] dark:text-white">
                    {loading ? '...' : paymentOrders.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Spent */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
                  <p className="text-2xl font-bold text-[#1F2937] dark:text-white">
                    {loading ? '...' : (() => {
                      // Calculate from payment orders
                      const fromPayments = paymentOrders
                        .filter(p => p.status === 'completed')
                        .reduce((sum, p) => sum + (p.amount || 0), 0);
                      
                      // Also calculate from purchases (in case payment orders are missing)
                      const fromPurchases = userPurchases
                        .filter(p => {
                          const payment = typeof p.paymentOrderId === 'object' ? p.paymentOrderId : 
                            paymentOrders.find(po => po._id === p.paymentOrderId);
                          return payment && (typeof payment === 'object' && 'status' in payment && payment.status === 'completed');
                        })
                        .reduce((sum, p) => {
                          const payment = typeof p.paymentOrderId === 'object' ? p.paymentOrderId : 
                            paymentOrders.find(po => po._id === p.paymentOrderId);
                          const amount = typeof payment === 'object' && payment && 'amount' in payment ? payment.amount : 0;
                          return sum + amount;
                        }, 0);
                      
                      const total = Math.max(fromPayments, fromPurchases);
                      return `₹${total.toLocaleString('en-IN')}`;
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="flex border-b border-gray-200 dark:border-gray-600">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-[#007AFF] text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-[#007AFF] hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <svg className="w-5 h-5 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === 'services'
                    ? 'bg-[#007AFF] text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-[#007AFF] hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <svg className="w-5 h-5 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                My Services
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === 'payments'
                    ? 'bg-[#007AFF] text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-[#007AFF] hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <svg className="w-5 h-5 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Payments
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <>
            {/* Profile Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-[#007AFF] to-[#00C897] p-8 text-white">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold">
                    {user.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{user.fullName}</h2>
                  <p className="text-white/80 text-lg">{user.email}</p>
                  <div className="flex items-center mt-2">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                      {user.role?.toUpperCase() || 'USER'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div>
                  <h3 className="text-xl font-bold text-[#1F2937] dark:text-white mb-6 flex items-center">
                    <svg className="w-6 h-6 text-[#007AFF] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Personal Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-600">
                      <span className="font-medium text-gray-600 dark:text-gray-400">Full Name</span>
                      <span className="text-[#1F2937] dark:text-white">{user.fullName}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-600">
                      <span className="font-medium text-gray-600 dark:text-gray-400">Email</span>
                      <span className="text-[#1F2937] dark:text-white">{user.email}</span>
                    </div>
                    {user.phoneNumber && (
                      <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-600">
                        <span className="font-medium text-gray-600 dark:text-gray-400">Phone</span>
                        <span className="text-[#1F2937] dark:text-white">+91 {user.phoneNumber}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-600">
                      <span className="font-medium text-gray-600 dark:text-gray-400">Role</span>
                      <span className="text-[#1F2937] dark:text-white capitalize">{user.role}</span>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div>
                  <h3 className="text-xl font-bold text-[#1F2937] dark:text-white mb-6 flex items-center">
                    <svg className="w-6 h-6 text-[#007AFF] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Account Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-600">
                      <span className="font-medium text-gray-600 dark:text-gray-400">Member Since</span>
                      <span className="text-[#1F2937] dark:text-white">
                        {user.registrationDate ? formatDate(user.registrationDate) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-600">
                      <span className="font-medium text-gray-600 dark:text-gray-400">Last Login</span>
                      <span className="text-[#1F2937] dark:text-white">
                        {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-600">
                      <span className="font-medium text-gray-600 dark:text-gray-400">Account Status</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">Active</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              {(user.fathersName || user.panNumber || user.aadharNumber) && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-[#1F2937] dark:text-white mb-6 flex items-center">
                    <svg className="w-6 h-6 text-[#007AFF] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Additional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.fathersName && (
                      <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-600">
                        <span className="font-medium text-gray-600 dark:text-gray-400">Father's Name</span>
                        <span className="text-[#1F2937] dark:text-white">{user.fathersName}</span>
                      </div>
                    )}
                    {user.panNumber && (
                      <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-600">
                        <span className="font-medium text-gray-600 dark:text-gray-400">PAN Number</span>
                        <span className="text-[#1F2937] dark:text-white">{user.panNumber}</span>
                      </div>
                    )}
                    {user.aadharNumber && (
                      <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-600">
                        <span className="font-medium text-gray-600 dark:text-gray-400">Aadhar Number</span>
                        <span className="text-[#1F2937] dark:text-white">{user.aadharNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => onNavigate('services')}
                  className="flex-1 bg-gradient-to-r from-[#007AFF] to-[#0056CC] text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Explore Services
                </button>
                <button
                  onClick={() => onNavigate('home')}
                  className="flex-1 border border-[#007AFF] text-[#007AFF] dark:text-[#007AFF] py-3 px-6 rounded-lg font-medium hover:bg-[#007AFF] hover:text-white transition-all"
                >
                  Go to Home
                </button>
                <button
                  onClick={logout}
                  className="flex-1 border border-red-500 text-red-500 py-3 px-6 rounded-lg font-medium hover:bg-red-500 hover:text-white transition-all"
                >
                  Logout
                </button>
              </div>
              
              {/* Test Button - Remove in production */}
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                  🧪 Testing: Force logout to test session expiration
                </p>
                <button
                  onClick={forceLogout}
                  className="bg-yellow-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
                >
                  Force Logout (Test)
                </button>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="mt-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-green-800 dark:text-green-200">
                  Account Created Successfully! 🎉
                </h3>
                <p className="text-green-700 dark:text-green-300 mt-1">
                  Welcome to Facto! You can now access all our services and features. Your account is ready to use.
                </p>
              </div>
            </div>
          </div>
        </div>
          </>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-[#1F2937] dark:text-white mb-6 flex items-center">
                  <svg className="w-6 h-6 text-[#007AFF] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  My Services
                </h2>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007AFF] mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-400 mt-4">Loading your services...</p>
                  </div>
                ) : userPurchases.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Services Yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">You haven't purchased any services yet. Explore our services to get started!</p>
                    <button
                      onClick={() => onNavigate('services')}
                      className="bg-[#007AFF] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0056CC] transition-colors"
                    >
                      Explore Services
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userPurchases.map((purchase) => {
                      const serviceData = getServiceData(purchase.itemId);
                      const paymentStatus = getPaymentStatus(purchase);
                      
                      if (!serviceData) return null;

                      return (
                        <div key={purchase._id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-[#1F2937] dark:text-white">{serviceData.title}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{serviceData.description}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              paymentStatus.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              paymentStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              paymentStatus.color === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                            }`}>
                              {paymentStatus.status}
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Price:</span>
                              <span className="font-medium text-[#1F2937] dark:text-white">
                                {typeof purchase.paymentOrderId === 'object' && purchase.paymentOrderId?.amount 
                                  ? `₹${purchase.paymentOrderId.amount.toLocaleString('en-IN')}` 
                                  : serviceData.price}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                              <span className="font-medium text-[#1F2937] dark:text-white">{serviceData.duration}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Purchased:</span>
                              <span className="font-medium text-[#1F2937] dark:text-white">{formatDate(purchase.createdAt)}</span>
                            </div>
                            {purchase.expiryDate && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Expires:</span>
                                <span className="font-medium text-[#1F2937] dark:text-white">{formatDate(purchase.expiryDate)}</span>
                              </div>
                            )}
                          </div>

                          {purchase.selectedFeatures.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Selected Features:</h4>
                              <div className="flex flex-wrap gap-1">
                                {purchase.selectedFeatures.map((feature, index) => (
                                  <span key={index} className="bg-[#007AFF]/10 text-[#007AFF] text-xs px-2 py-1 rounded-full">
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Document Upload Button */}
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Documents: {serviceDocumentCounts[purchase._id] || 0}
                              </span>
                              {serviceDocumentCounts[purchase._id] > 0 && (
                                <span className="text-xs text-[#00C897] bg-[#00C897]/10 px-2 py-1 rounded-full">
                                  ✓ Uploaded
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => setSelectedServiceForUpload({
                                id: purchase._id,
                                name: serviceData.title
                              })}
                              className="w-full bg-gradient-to-r from-[#00C897] to-[#007AFF] text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              {serviceDocumentCounts[purchase._id] > 0 ? 'Manage Documents' : 'Upload Documents'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-[#1F2937] dark:text-white mb-6 flex items-center">
                  <svg className="w-6 h-6 text-[#007AFF] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Payment History
                </h2>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007AFF] mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-400 mt-4">Loading payment history...</p>
                  </div>
                ) : paymentOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Payments Yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">You haven't made any payments yet. Purchase a service to see your payment history here.</p>
                    <button
                      onClick={() => onNavigate('services')}
                      className="bg-[#007AFF] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0056CC] transition-colors"
                    >
                      Explore Services
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentOrders.map((payment) => (
                      <div key={payment._id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-[#1F2937] dark:text-white">
                              Payment #{payment.transactionId || payment._id.slice(-8)}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(payment.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-[#1F2937] dark:text-white">
                              ₹{payment.amount}
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              payment.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              payment.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                            }`}>
                              {payment.status.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                            <span className="ml-2 font-medium text-[#1F2937] dark:text-white capitalize">{payment.paymentMethod}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Currency:</span>
                            <span className="ml-2 font-medium text-[#1F2937] dark:text-white">{payment.currency}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Transaction ID:</span>
                            <span className="ml-2 font-medium text-[#1F2937] dark:text-white font-mono text-xs">
                              {payment.transactionId || 'N/A'}
                            </span>
                          </div>
                        </div>

                        {payment.items && payment.items.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Items:</h4>
                            <div className="space-y-2">
                              {payment.items.map((item: any, index: number) => {
                                const serviceData = getServiceData(item.itemId);
                                return (
                                  <div key={index} className="flex justify-between items-center text-sm">
                                    <span className="text-[#1F2937] dark:text-white">
                                      {serviceData?.title || item.itemId}
                                    </span>
                                    <span className="text-gray-600 dark:text-gray-400">
                                      {item.billingPeriod || 'One-time'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Document Upload Modal */}
        {selectedServiceForUpload && (
          <ServiceDocumentUpload
            serviceId={selectedServiceForUpload.id}
            serviceName={selectedServiceForUpload.name}
            onClose={() => setSelectedServiceForUpload(null)}
          />
        )}
      </div>
    </div>
  );
}

