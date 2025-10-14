import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

type PageType = 'home' | 'services' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment';

interface UserPurchase {
  _id: string;
  userId: string;
  itemType: 'service' | 'course';
  itemId: string;
  selectedFeatures: string[];
  billingPeriod: string;
  paymentOrderId: string;
  status: 'active' | 'expired' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface ServicesPageProps {
  onNavigate: (page: PageType, serviceId?: string) => void;
}

export function ServicesPage({ onNavigate }: ServicesPageProps) {
  const { isAuthenticated, user, token } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userPurchases, setUserPurchases] = useState<UserPurchase[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch user purchases when component mounts
  useEffect(() => {
    const fetchUserPurchases = async () => {
      // Only fetch if user is authenticated and has a token
      if (!isAuthenticated || !user || !token) {
        console.log('Skipping user purchases fetch - user not authenticated');
        return;
      }
      
      setLoading(true);
      try {
        console.log('Fetching user purchases for authenticated user');
        const response = await axios.get('http://localhost:8080/api/v1/user-purchases', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setUserPurchases(response.data.data || []);
        console.log('User purchases fetched successfully');
      } catch (error) {
        console.error('Error fetching user purchases:', error);
        // Don't show error to user if they're not authenticated
        if (error.response?.status !== 401) {
          console.error('Non-auth error fetching user purchases:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserPurchases();
  }, [isAuthenticated, user, token]);

  // Helper function to check if a service is already purchased
  const isServicePurchased = (serviceId: string): boolean => {
    return userPurchases.some(purchase => 
      purchase.itemId === serviceId && 
      purchase.itemType === 'service' && 
      purchase.status === 'active'
    );
  };

  const categories = [
    { id: 'all', name: 'All Services', count: 20 },
    { id: 'tax', name: 'Tax Services', count: 4 },
    { id: 'gst', name: 'GST Services', count: 5 },
    { id: 'consultancy', name: 'Consultancy on tax planning', count: 2 },
    { id: 'registrations', name: 'Registrations', count: 6 },
    { id: 'outsourcing', name: 'Outsourcing Services', count: 3 }
  ];

  const services = [
    // ITR Services
    {
      id: 'itr-1',
      title: 'ITR-1',
      description: 'Salaried + 1 House property Plan',
      price: '₹1',
      originalPrice: '₹2,499',
      duration: '2-3 days',
      category: 'tax',
      features: [
        'Resident individuals having income upto 50 Lakh',
        'Salaried Income (Single & multiple employer)',
        'Single House Property',
        'Income from Other Sources'
      ],
      rating: 4.8,
      reviews: 2547,
      popular: false
    },
    {
      id: 'itr-2',
      title: 'ITR-2',
      description: 'Salary + more than 1 House property, Capital gain',
      price: '₹1',
      originalPrice: '₹2,999',
      duration: '3-5 days',
      category: 'tax',
      features: [
        'Resident individuals having income more than 50 Lakh',
        'Capital Gain',
        'More than 1 house property income',
        'Crypto (if treated as capital gain)',
        'Foreign income',
        'Holding directorship and unlisted share in a company'
      ],
      rating: 4.9,
      reviews: 1876,
      popular: true
    },
    {
      id: 'itr-3',
      title: 'ITR-3',
      description: 'Business income, Future & option, crypto income, capital gain, other sources, salary and more',
      price: '₹1',
      originalPrice: '₹3,999',
      duration: '5-7 days',
      category: 'tax',
      features: [
        'F&O Income/Loss (Non Audit)',
        'Crypto Income',
        'Speculative Income',
        'Salaried Income',
        'House property income',
        'Business & Professional Income(Non Audit)',
        'Other sources'
      ],
      rating: 4.7,
      reviews: 1234,
      popular: false
    },
    {
      id: 'itr-4',
      title: 'ITR-4',
      description: 'Business & income (Composition dealer)',
      price: '₹1',
      originalPrice: '₹2,499',
      duration: '3-5 days',
      category: 'tax',
      features: [
        'Salaried Income',
        'Business & Professional Income (Non Audit)',
        'Income from other sources'
      ],
      rating: 4.6,
      reviews: 987,
      popular: false
    },
    // GST Services
    {
      id: 'gstr-1-3b-monthly',
      title: 'GSTR-1 & GSTR-3B (Monthly)',
      description: 'B2B Invoice, B2c Invoice, Credit and Debit note, HSN summary, Documents summary, GSTR-2B vs 3B vs books (reconciliation)',
      price: '₹1',
      originalPrice: '₹2,500',
      duration: '1-2 days',
      category: 'gst',
      features: [
        'GSTR-1 Return Filing',
        'GSTR-3B Return Filing',
        'Input Reconciliation (GSTR-2B vs books vs 3B)'
      ],
      rating: 4.7,
      reviews: 3421,
      popular: true
    },
    {
      id: 'gstr-1-3b-quarterly',
      title: 'GSTR-1/IFF & GSTR-3B (Quarterly-QRMP)',
      description: 'B2B Invoice, B2c Invoice, Credit and Debit note, HSN summary, Documents summary, GSTR-2B vs 3B vs books (reconciliation)',
      price: '₹1',
      originalPrice: '₹4,500',
      duration: '2-3 days',
      category: 'gst',
      features: [
        'GSTR-1 (Quarterly)',
        'GSTR-3B (Quarterly)',
        'Monthly Payment',
        'Input Reconciliation (Books with GSTR-2B)'
      ],
      rating: 4.6,
      reviews: 2156,
      popular: false
    },
    {
      id: 'gst-registration',
      title: 'GST Registration',
      description: 'Apply GST Registration, reply for clarification, Any modification in GST registration 1 time',
      price: '₹1',
      originalPrice: '₹3,999',
      duration: '7-10 days',
      category: 'gst',
      features: [
        'GST Registration for Rented property or self occupied property',
        'Application for Clarification'
      ],
      rating: 4.8,
      reviews: 1234,
      popular: false
    },
    {
      id: 'gst-composite-quarterly',
      title: 'GST Compliance for Composite Dealer (Quarterly)',
      description: 'Composition dealer -Small taxpayers can get rid of tedious GST formalities and pay GST at a fixed rate',
      price: '₹1',
      originalPrice: '₹2,999',
      duration: '1-2 days',
      category: 'gst',
      features: [
        'CMP-08 Filing',
        'GSTR-4 Annual Return'
      ],
      rating: 4.5,
      reviews: 876,
      popular: false
    },
    {
      id: 'lut-filing-annually',
      title: 'LUT Filing (Annually)',
      description: 'Letter of Undertaking (LUT) is a declaration filed by exporters under GST to supply goods or services without paying Integrated Goods and Services Tax (IGST)',
      price: '₹1',
      originalPrice: '₹2,996',
      duration: '1 day',
      category: 'gst',
      features: [
        'LUT Filing'
      ],
      rating: 4.4,
      reviews: 543,
      popular: false
    },
    // Consultancy Services
    {
      id: 'tax-optimization-plan',
      title: 'Tax Optimization Plan (Annual)',
      description: 'Tax Optimization Plan for Salaried Employees',
      price: '₹1',
      originalPrice: '₹1,500',
      duration: 'Annual',
      category: 'consultancy',
      features: [
        'New vs Old tax regime comparison',
        'Salary restructure',
        'Other basic tax saving points',
        'Consult a tax advisor',
        'Help in decision making',
        'Tax saving opportunities suited to your goals',
        'Bifurcation of HRA calculation'
      ],
      rating: 4.8,
      reviews: 892,
      popular: true
    },
    {
      id: 'property-tax-optimization',
      title: 'Property tax Optimization Plan (Annual)',
      description: 'Tax Saving and Optimization Plan Property and other',
      price: '₹1',
      originalPrice: '₹2,999',
      duration: 'Annual',
      category: 'consultancy',
      features: [
        'Tax Optimization Plan for Salaried Employees',
        'Sale of property',
        'Purchase of property',
        'Other tax saving guidance plan',
        'Consult a tax advisor'
      ],
      rating: 4.7,
      reviews: 456,
      popular: false
    },
    // Registration Services
    {
      id: 'gst-registration-service',
      title: 'GST Registration',
      description: 'Starting a New Business? Worried About Registration? Facto Expert makes registration easy and fast!',
      price: '₹1',
      originalPrice: '₹4,999',
      duration: '7-10 days',
      category: 'registrations',
      features: [
        'Complete GST registration process',
        'Document preparation and verification',
        'Online application submission',
        'Follow-up with department',
        'Certificate delivery',
        'Post-registration support'
      ],
      rating: 4.8,
      reviews: 1234,
      popular: true
    },
    {
      id: 'partnership-registration',
      title: 'Partnership Registration',
      description: 'Register your partnership firm with ease and get all necessary documentation completed professionally.',
      price: '₹1',
      originalPrice: '₹5,999',
      duration: '10-15 days',
      category: 'registrations',
      features: [
        'Partnership deed preparation',
        'Firm registration application',
        'PAN and TAN registration',
        'Bank account opening assistance',
        'GST registration (if applicable)',
        'Complete documentation support'
      ],
      rating: 4.6,
      reviews: 567,
      popular: false
    },
    {
      id: 'llp-registration',
      title: 'LLP (Limited Liability Partnership)',
      description: 'Register your Limited Liability Partnership with professional assistance and complete compliance support.',
      price: '₹1',
      originalPrice: '₹7,999',
      duration: '15-20 days',
      category: 'registrations',
      features: [
        'LLP agreement preparation',
        'Name reservation and approval',
        'DIN and DSC application',
        'LLP registration certificate',
        'PAN and TAN registration',
        'Bank account opening assistance'
      ],
      rating: 4.7,
      reviews: 423,
      popular: false
    },
    {
      id: 'company-registration',
      title: 'Company Registration',
      description: 'Complete private limited company registration with all necessary compliances and documentation.',
      price: '₹1',
      originalPrice: '₹9,999',
      duration: '15-20 days',
      category: 'registrations',
      features: [
        'Name approval and reservation',
        'MOA & AOA preparation',
        'DIN & DSC application',
        'Certificate of Incorporation',
        'PAN and TAN registration',
        'Bank account opening assistance'
      ],
      rating: 4.8,
      reviews: 1234,
      popular: true
    },
    {
      id: 'msme-registration-service',
      title: 'MSME Registration',
      description: 'Udyam registration for small and medium enterprises with government benefits and subsidies.',
      price: '₹1',
      originalPrice: '₹2,499',
      duration: '3-5 days',
      category: 'registrations',
      features: [
        'Udyam certificate generation',
        'Government benefits access',
        'Loan eligibility enhancement',
        'Subsidy access support',
        'Documentation assistance',
        'Compliance guidance'
      ],
      rating: 4.5,
      reviews: 2876,
      popular: false
    },
    {
      id: 'startup-india-registration',
      title: 'Startup India Registration',
      description: 'Register your startup with Startup India initiative and avail all government benefits and incentives.',
      price: '₹1',
      originalPrice: '₹4,999',
      duration: '10-15 days',
      category: 'registrations',
      features: [
        'Startup India recognition',
        'Tax benefits and exemptions',
        'IPR support and guidance',
        'Funding assistance',
        'Mentorship programs',
        'Government scheme access'
      ],
      rating: 4.6,
      reviews: 789,
      popular: false
    },
    // Outsourcing Services
    {
      id: 'day-to-day-accounting',
      title: 'Day-to-day Accounting',
      description: 'Are you looking for a professional to handle your day-to-day accounting? We provide comprehensive accounting services.',
      price: '₹1',
      originalPrice: '₹3,999',
      duration: 'Monthly',
      category: 'outsourcing',
      features: [
        'Daily bookkeeping and entries',
        'Bank reconciliation',
        'Accounts payable and receivable',
        'Financial statement preparation',
        'Monthly MIS reports',
        'Tax compliance support'
      ],
      rating: 4.6,
      reviews: 1543,
      popular: true
    },
    {
      id: 'payroll-management',
      title: 'Payroll Management',
      description: 'Professional payroll management services to handle all employee-related financial processes efficiently.',
      price: '₹1',
      originalPrice: '₹2,999',
      duration: 'Monthly',
      category: 'outsourcing',
      features: [
        'Salary calculation and processing',
        'TDS and PF calculations',
        'ESI compliance',
        'Payroll reports generation',
        'Employee self-service portal',
        'Statutory compliance support'
      ],
      rating: 4.7,
      reviews: 987,
      popular: false
    },
    {
      id: 'finance-gst-compliance',
      title: 'Finance Role & GST Compliance',
      description: 'Complete finance role and GST compliance management for your business with expert professionals.',
      price: '₹1',
      originalPrice: '₹5,999',
      duration: 'Monthly',
      category: 'outsourcing',
      features: [
        'Complete finance management',
        'GST return filing',
        'Financial planning and analysis',
        'Budget preparation and monitoring',
        'Cash flow management',
        'Audit support and preparation'
      ],
      rating: 4.8,
      reviews: 1123,
      popular: true
    }
  ];

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-white dark:from-gray-900 dark:to-gray-800 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#1F2937] dark:text-white mb-4">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AFF] to-[#00C897]">Professional Services</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Comprehensive financial and business services designed for individuals and small businesses across India.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-[#007AFF] text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-[#007AFF] hover:text-[#007AFF]'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>

        {/* Services Grid */}
        {loading && isAuthenticated ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007AFF] mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Loading your services...</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className={`group bg-white dark:bg-gray-800 rounded-2xl shadow-lg border overflow-hidden transition-all duration-300 ${
                isServicePurchased(service.id)
                  ? 'border-green-200 dark:border-green-700 hover:shadow-green-100 dark:hover:shadow-green-900/20'
                  : 'border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2'
              }`}
            >
              {/* Service Header */}
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-[#1F2937] dark:text-white text-lg group-hover:text-[#007AFF] transition-colors">
                        {service.title}
                      </h3>
                      {service.popular && (
                        <span className="bg-[#FFD166] text-[#1F2937] px-2 py-1 rounded-full text-xs font-bold">
                          Popular
                        </span>
                      )}
                      {isServicePurchased(service.id) && (
                        <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full text-xs font-bold">
                          Already Purchased
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 text-[#00C897] mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Service Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {service.duration}
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center mr-2">
                      {Array.from({ length: 5 }, (_, i) => (
                        <svg
                          key={i}
                          className={`w-3 h-3 ${i < Math.floor(service.rating) ? 'text-[#FFD166]' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span>{service.rating} ({service.reviews})</span>
                  </div>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#007AFF] text-xl">{service.price}</span>
                    <span className="text-gray-400 dark:text-gray-500 text-sm line-through">{service.originalPrice}</span>
                    <span className="text-[#00C897] text-sm font-medium">
                      Save {Math.round(((parseFloat(service.originalPrice.replace('₹', '').replace(',', '')) - 
                             parseFloat(service.price.replace('₹', '').replace(',', ''))) / 
                            parseFloat(service.originalPrice.replace('₹', '').replace(',', ''))) * 100)}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4">
                  <div className="relative">
                    <button
                      onClick={() => !isServicePurchased(service.id) && onNavigate('service-details', service.id)}
                      disabled={isServicePurchased(service.id)}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 text-sm ${
                        isServicePurchased(service.id)
                          ? 'border border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
                          : 'border border-[#007AFF] text-[#007AFF] dark:text-[#007AFF] hover:bg-[#007AFF] hover:text-white cursor-pointer'
                      }`}
                      title={isServicePurchased(service.id) ? 'This service is already purchased' : 'View service details'}
                    >
                      {isServicePurchased(service.id) ? 'Already Purchased' : 'View Details'}
                    </button>
                    {isServicePurchased(service.id) && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                        Service already purchased
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    {isServicePurchased(service.id) ? (
                      <button
                        onClick={() => onNavigate('profile')}
                        className="w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800 cursor-pointer"
                        title="View your purchased service in profile"
                      >
                        View in Profile
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => isAuthenticated ? onNavigate('service-details', service.id) : onNavigate('login')}
                          disabled={!isAuthenticated}
                          className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 text-sm ${
                            isAuthenticated 
                              ? 'bg-gradient-to-r from-[#007AFF] to-[#0056CC] text-white hover:shadow-lg cursor-pointer' 
                              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {isAuthenticated ? 'Get Quotation' : 'Login to Get Quotation'}
                        </button>
                        {!isAuthenticated && (
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                            Please login to get quotation
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Bottom CTA Section */}
        <div className="mt-16 text-center bg-gradient-to-r from-[#007AFF]/10 to-[#00C897]/10 dark:from-[#007AFF]/20 dark:to-[#00C897]/20 rounded-2xl p-8 border border-[#007AFF]/20 dark:border-[#007AFF]/30">
          <h3 className="text-2xl font-bold text-[#1F2937] dark:text-white mb-4">
            Need a Custom Solution?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Can't find exactly what you're looking for? Our experts can create a tailored solution for your specific business needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => isAuthenticated ? window.open('tel:+91-9876543210', '_self') : onNavigate('login')}
              disabled={!isAuthenticated}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                isAuthenticated 
                  ? 'bg-[#007AFF] text-white hover:bg-[#0056CC] cursor-pointer' 
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              {isAuthenticated ? 'Schedule Consultation' : 'Login to Schedule Consultation'}
            </button>
            <button 
              onClick={() => isAuthenticated ? window.open('tel:+91-9876543210', '_self') : onNavigate('login')}
              disabled={!isAuthenticated}
              className={`px-8 py-3 rounded-lg font-medium transition-all ${
                isAuthenticated 
                  ? 'border border-[#007AFF] text-[#007AFF] dark:text-[#007AFF] hover:bg-[#007AFF] hover:text-white cursor-pointer' 
                  : 'border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              {isAuthenticated ? 'Contact Expert' : 'Login to Contact Expert'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}