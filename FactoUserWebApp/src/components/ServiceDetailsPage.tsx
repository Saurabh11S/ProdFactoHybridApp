import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import SuccessPopup from './SuccessPopup';
import { API_BASE_URL } from '../config/apiConfig';

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}


type PageType = 'home' | 'services' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile';

interface ServiceDetailsPageProps {
  onNavigate: (page: PageType, serviceId?: string) => void;
  serviceId?: string;
}

export function ServiceDetailsPage({ onNavigate, serviceId = 'itr-1' }: ServiceDetailsPageProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [showQuotationForm, setShowQuotationForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    annualIncome: '',
    additionalRequirements: '',
    selectedFeatures: [] as string[]
  });
  
  // Success popup state
  const [successPopup, setSuccessPopup] = useState({
    isOpen: false,
    title: '',
    message: '',
    serviceName: '',
    purchaseId: '',
    amount: 0,
    currency: 'INR'
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Validation functions
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    // Check phone number - use user's phone if available, otherwise form data
    const phoneNumber = user?.phoneNumber || formData.phoneNumber;
    if (!phoneNumber || phoneNumber.length < 10) {
      errors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }
    
    if (!formData.annualIncome) {
      errors.annualIncome = 'Please select your annual income range';
    }
    
    // Validate additional requirements - should not be just random characters
    if (formData.additionalRequirements) {
      const trimmed = formData.additionalRequirements.trim();
      if (trimmed.length < 3) {
        errors.additionalRequirements = 'Please provide meaningful requirements (at least 3 characters)';
      } else if (!/^[a-zA-Z0-9\s.,!?()-]+$/.test(trimmed)) {
        errors.additionalRequirements = 'Please use only letters, numbers, and common punctuation';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Removed unused handleInputChange function

  // Service data based on serviceId
  const getServiceDetails = (id: string) => {
    const services = {
      'itr-1': {
        title: 'ITR-1',
        description: 'Salaried + 1 House property Plan - Professional income tax return filing for individuals with salary income and single house property.',
        rating: 4.8,
        reviews: 2547,
        category: 'Tax Services',
        duration: '2-3 business days',
        price: '₹1',
        originalPrice: '₹2,499',
        features: [
          'Resident individuals having income upto 50 Lakh',
          'Salaried Income (Single & multiple employer)',
          'Single House Property',
          'Income from Other Sources',
          'Complete Form 16 analysis and validation',
          'Maximum deduction optimization under all sections',
          'Expert CA review and consultation',
          'Error-free filing with government portal'
        ],
        process: [
          'Upload your documents (Form 16, investment proofs)',
          'Our CA expert reviews and analyzes your documents',
          'Tax computation and optimization',
          'ITR preparation and review',
          'Filing with Income Tax Department',
          'Acknowledgment and refund tracking'
        ],
        documents: [
          'Form 16 from employer',
          'PAN Card copy',
          'Aadhaar Card copy',
          'Bank account details',
          'Investment proofs (80C, 80D, etc.)',
          'Interest certificates',
          'Previous year ITR (if applicable)'
        ]
      },
      'itr-2': {
        title: 'ITR-2',
        description: 'Salary + more than 1 House property, Capital gain - Comprehensive tax filing for individuals with complex income sources.',
        rating: 4.9,
        reviews: 1876,
        category: 'Tax Services',
        duration: '3-5 business days',
        price: '₹1',
        originalPrice: '₹2,999',
        features: [
          'Resident individuals having income more than 50 Lakh',
          'Capital Gain',
          'More than 1 house property income',
          'Crypto (if treated as capital gain)',
          'Foreign income',
          'Holding directorship and unlisted share in a company',
          'Complete capital gain calculations',
          'Expert CA review and consultation'
        ],
        process: [
          'Upload all relevant documents',
          'CA expert analyzes complex income sources',
          'Capital gain calculations and optimization',
          'ITR-2 preparation and review',
          'Filing with Income Tax Department',
          'Acknowledgment and refund tracking'
        ],
        documents: [
          'Form 16 from employer',
          'Capital gain statements',
          'Property documents',
          'Crypto transaction records',
          'Foreign income certificates',
          'PAN Card copy',
          'Aadhaar Card copy'
        ]
      },
      'itr-3': {
        title: 'ITR-3',
        description: 'Business income, Future & option, crypto income, capital gain, other sources, salary and more - Complete business tax filing solution.',
        rating: 4.7,
        reviews: 1234,
        category: 'Tax Services',
        duration: '5-7 business days',
        price: '₹1',
        originalPrice: '₹3,999',
        features: [
          'F&O Income/Loss (Non Audit)',
          'Crypto Income',
          'Speculative Income',
          'Salaried Income',
          'House property income',
          'Business & Professional Income(Non Audit)',
          'Other sources',
          'Complete P&L preparation',
          'Balance sheet preparation'
        ],
        process: [
          'Upload business documents and P&L statements',
          'CA expert analyzes all income sources',
          'Business income calculations',
          'ITR-3 preparation with schedules',
          'Review and optimization',
          'Filing with Income Tax Department'
        ],
        documents: [
          'P&L statements',
          'Balance sheet',
          'Bank statements',
          'Trading statements (F&O)',
          'Crypto transaction records',
          'Business registration documents',
          'PAN Card copy'
        ]
      },
      'itr-4': {
        title: 'ITR-4',
        description: 'Business & income (Composition dealer) - Simplified tax filing for composition dealers and presumptive taxation.',
        rating: 4.6,
        reviews: 987,
        category: 'Tax Services',
        duration: '3-5 business days',
        price: '₹1',
        originalPrice: '₹2,499',
        features: [
          'Salaried Income',
          'Business & Professional Income (Non Audit)',
          'Income from other sources',
          'Presumptive taxation under section 44AD',
          'Composition scheme compliance',
          'Simplified return filing process'
        ],
        process: [
          'Upload business documents',
          'CA expert calculates presumptive income',
          'ITR-4 preparation',
          'Review and filing',
          'Acknowledgment and compliance tracking'
        ],
        documents: [
          'Business registration documents',
          'Bank statements',
          'Sales records',
          'PAN Card copy',
          'Aadhaar Card copy',
          'Previous year ITR (if applicable)'
        ]
      },
      'gstr-1-3b-monthly': {
        title: 'GSTR-1 & GSTR-3B (Monthly)',
        description: 'B2B Invoice, B2c Invoice, Credit and Debit note, HSN summary, Documents summary, GSTR-2B vs 3B vs books (reconciliation)',
        rating: 4.7,
        reviews: 3421,
        category: 'GST Services',
        duration: '1-2 business days',
        price: '₹1',
        originalPrice: '₹2,500',
        features: [
          'GSTR-1 Return Filing',
          'GSTR-3B Return Filing',
          'Input Reconciliation (GSTR-2B vs books vs 3B)',
          'B2B Invoice processing',
          'B2C Invoice processing',
          'Credit and Debit note handling',
          'HSN summary preparation',
          'Monthly compliance reporting'
        ],
        process: [
          'Upload sales and purchase data',
          'CA expert reconciles books with GSTR-2B',
          'GSTR-1 preparation and filing',
          'GSTR-3B preparation and filing',
          'Monthly compliance report',
          'ITC reconciliation'
        ],
        documents: [
          'Sales invoices',
          'Purchase invoices',
          'Bank statements',
          'GST registration certificate',
          'Previous month returns',
          'Books of accounts'
        ]
      },
      'gstr-1-3b-quarterly': {
        title: 'GSTR-1/IFF & GSTR-3B (Quarterly-QRMP)',
        description: 'B2B Invoice, B2c Invoice, Credit and Debit note, HSN summary, Documents summary, GSTR-2B vs 3B vs books (reconciliation)',
        rating: 4.6,
        reviews: 2156,
        category: 'GST Services',
        duration: '2-3 business days',
        price: '₹1',
        originalPrice: '₹4,500',
        features: [
          'GSTR-1 (Quarterly)',
          'GSTR-3B (Quarterly)',
          'Monthly Payment',
          'Input Reconciliation (Books with GSTR-2B)',
          'Quarterly compliance reporting',
          'IFF filing for QRMP scheme'
        ],
        process: [
          'Upload quarterly sales and purchase data',
          'CA expert reconciles quarterly books',
          'GSTR-1 quarterly preparation',
          'GSTR-3B quarterly preparation',
          'Monthly payment processing',
          'Quarterly compliance report'
        ],
        documents: [
          'Quarterly sales invoices',
          'Quarterly purchase invoices',
          'Bank statements',
          'GST registration certificate',
          'Previous quarter returns',
          'Books of accounts'
        ]
      },
      'gst-registration': {
        title: 'GST Registration',
        description: 'Apply GST Registration, reply for clarification, Any modification in GST registration 1 time',
        rating: 4.8,
        reviews: 1234,
        category: 'GST Services',
        duration: '7-10 business days',
        price: '₹1',
        originalPrice: '₹3,999',
        features: [
          'GST Registration for Rented property or self occupied property',
          'Application for Clarification',
          'Document preparation and verification',
          'Online application submission',
          'Follow-up with department',
          'Certificate delivery'
        ],
        process: [
          'Document collection and verification',
          'Online application submission',
          'Department processing',
          'Clarification handling (if any)',
          'Certificate generation',
          'Post-registration support'
        ],
        documents: [
          'PAN Card copy',
          'Aadhaar Card copy',
          'Business registration documents',
          'Address proof',
          'Bank account details',
          'Business photographs'
        ]
      },
      'gst-composite-quarterly': {
        title: 'GST Compliance for Composite Dealer (Quarterly)',
        description: 'Composition dealer -Small taxpayers can get rid of tedious GST formalities and pay GST at a fixed rate',
        rating: 4.5,
        reviews: 876,
        category: 'GST Services',
        duration: '1-2 business days',
        price: '₹1',
        originalPrice: '₹2,999',
        features: [
          'CMP-08 Filing',
          'GSTR-4 Annual Return',
          'Composition scheme compliance',
          'Fixed rate GST calculation',
          'Quarterly return filing',
          'Annual return preparation'
        ],
        process: [
          'Calculate composition tax liability',
          'CMP-08 preparation and filing',
          'Quarterly compliance',
          'GSTR-4 annual return preparation',
          'Annual return filing',
          'Compliance certificate'
        ],
        documents: [
          'Composition scheme certificate',
          'Sales records',
          'Bank statements',
          'GST registration certificate',
          'Previous returns',
          'Books of accounts'
        ]
      },
      'lut-filing-annually': {
        title: 'LUT Filing (Annually)',
        description: 'Letter of Undertaking (LUT) is a declaration filed by exporters under GST to supply goods or services without paying Integrated Goods and Services Tax (IGST)',
        rating: 4.4,
        reviews: 543,
        category: 'GST Services',
        duration: '1 business day',
        price: '₹1',
        originalPrice: '₹2,996',
        features: [
          'LUT Filing',
          'Export documentation support',
          'IGST exemption processing',
          'Annual compliance',
          'Export benefit optimization'
        ],
        process: [
          'Export documentation verification',
          'LUT application preparation',
          'Online submission',
          'Department processing',
          'LUT certificate generation',
          'Annual renewal support'
        ],
        documents: [
          'Export invoices',
          'Shipping bills',
          'GST registration certificate',
          'Export license',
          'Bank guarantee (if required)',
          'Previous LUT (if applicable)'
        ]
      },
      'tax-optimization-plan': {
        title: 'Tax Optimization Plan (Annual)',
        description: 'Tax Optimization Plan for Salaried Employees - Comprehensive tax planning and optimization service designed to maximize your tax savings through strategic planning and expert guidance.',
        rating: 4.8,
        reviews: 892,
        category: 'Consultancy Services',
        duration: 'Annual',
        price: '₹1',
        originalPrice: '₹1,500',
        features: [
          'New vs Old tax regime comparison',
          'Salary restructure',
          'Other basic tax saving points',
          'Consult a tax advisor',
          'Help in decision making',
          'Tax saving opportunities suited to your goals',
          'Bifurcation of HRA calculation',
          'Personalized tax strategy',
          'Annual tax planning review',
          'Investment optimization advice'
        ],
        process: [
          'Initial consultation and assessment',
          'Tax regime analysis and comparison',
          'Salary structure optimization',
          'Tax saving strategy development',
          'Implementation guidance',
          'Ongoing support and review'
        ],
        documents: [
          'Current salary structure',
          'Previous year ITR',
          'Investment details',
          'HRA details',
          'Other income sources',
          'Financial goals and objectives'
        ]
      },
      'property-tax-optimization': {
        title: 'Property tax Optimization Plan (Annual)',
        description: 'Tax Saving and Optimization Plan Property and other - Specialized tax planning service for property transactions and related tax optimization strategies.',
        rating: 4.7,
        reviews: 456,
        category: 'Consultancy Services',
        duration: 'Annual',
        price: '₹1',
        originalPrice: '₹2,999',
        features: [
          'Tax Optimization Plan for Salaried Employees',
          'Sale of property',
          'Purchase of property',
          'Other tax saving guidance plan',
          'Consult a tax advisor',
          'Property investment strategies',
          'Capital gains optimization',
          'Stamp duty planning',
          'Home loan optimization'
        ],
        process: [
          'Property portfolio assessment',
          'Tax implications analysis',
          'Transaction planning',
          'Capital gains optimization',
          'Documentation guidance',
          'Ongoing property tax support'
        ],
        documents: [
          'Property documents',
          'Sale/purchase agreements',
          'Previous property transactions',
          'Home loan details',
          'Current property portfolio',
          'Investment objectives'
        ]
      },
      // Registration Services
      'gst-registration-service': {
        title: 'GST Registration',
        description: 'Starting a New Business? Worried About Registration? Facto Expert makes registration easy and fast! Complete GST registration process with professional assistance.',
        rating: 4.8,
        reviews: 1234,
        category: 'Registration Services',
        duration: '7-10 business days',
        price: '₹1',
        originalPrice: '₹4,999',
        features: [
          'Complete GST registration process',
          'Document preparation and verification',
          'Online application submission',
          'Follow-up with department',
          'Certificate delivery',
          'Post-registration support',
          'GST number generation',
          'Compliance guidance'
        ],
        process: [
          'Document collection and verification',
          'GST registration application submission',
          'Department processing and approval',
          'GST certificate generation',
          'Post-registration compliance setup',
          'Ongoing support and guidance'
        ],
        documents: [
          'PAN Card copy',
          'Aadhaar Card copy',
          'Business registration documents',
          'Address proof',
          'Bank account details',
          'Business photographs'
        ]
      },
      'partnership-registration': {
        title: 'Partnership Registration',
        description: 'Register your partnership firm with ease and get all necessary documentation completed professionally.',
        rating: 4.6,
        reviews: 567,
        category: 'Registration Services',
        duration: '10-15 business days',
        price: '₹1',
        originalPrice: '₹5,999',
        features: [
          'Partnership deed preparation',
          'Firm registration application',
          'PAN and TAN registration',
          'Bank account opening assistance',
          'GST registration (if applicable)',
          'Complete documentation support',
          'Legal compliance guidance',
          'Ongoing support'
        ],
        process: [
          'Partnership deed drafting',
          'Firm name verification',
          'Registration application submission',
          'PAN and TAN application',
          'Bank account opening',
          'GST registration (if required)'
        ],
        documents: [
          'Partners PAN cards',
          'Partners Aadhaar cards',
          'Address proof of partners',
          'Business address proof',
          'Partnership deed',
          'Bank account details'
        ]
      },
      'llp-registration': {
        title: 'LLP (Limited Liability Partnership)',
        description: 'Register your Limited Liability Partnership with professional assistance and complete compliance support.',
        rating: 4.7,
        reviews: 423,
        category: 'Registration Services',
        duration: '15-20 business days',
        price: '₹1',
        originalPrice: '₹7,999',
        features: [
          'LLP agreement preparation',
          'Name reservation and approval',
          'DIN and DSC application',
          'LLP registration certificate',
          'PAN and TAN registration',
          'Bank account opening assistance',
          'Compliance setup',
          'Ongoing support'
        ],
        process: [
          'LLP name reservation',
          'DIN and DSC application',
          'LLP agreement preparation',
          'Registration application submission',
          'Certificate generation',
          'PAN and TAN registration'
        ],
        documents: [
          'Partners PAN cards',
          'Partners Aadhaar cards',
          'Address proof',
          'LLP agreement',
          'DIN and DSC details',
          'Bank account information'
        ]
      },
      'company-registration': {
        title: 'Company Registration',
        description: 'Complete private limited company registration with all necessary compliances and documentation.',
        rating: 4.8,
        reviews: 1234,
        category: 'Registration Services',
        duration: '15-20 business days',
        price: '₹1',
        originalPrice: '₹9,999',
        features: [
          'Name approval and reservation',
          'MOA & AOA preparation',
          'DIN & DSC application',
          'Certificate of Incorporation',
          'PAN and TAN registration',
          'Bank account opening assistance',
          'Compliance setup',
          'Ongoing support'
        ],
        process: [
          'Company name approval',
          'DIN and DSC application',
          'MOA and AOA preparation',
          'Registration application submission',
          'Certificate of Incorporation',
          'PAN and TAN registration'
        ],
        documents: [
          'Directors PAN cards',
          'Directors Aadhaar cards',
          'Address proof',
          'MOA and AOA',
          'DIN and DSC details',
          'Registered office proof'
        ]
      },
      'msme-registration-service': {
        title: 'MSME Registration',
        description: 'Udyam registration for small and medium enterprises with government benefits and subsidies.',
        rating: 4.5,
        reviews: 2876,
        category: 'Registration Services',
        duration: '3-5 business days',
        price: '₹1',
        originalPrice: '₹2,499',
        features: [
          'Udyam certificate generation',
          'Government benefits access',
          'Loan eligibility enhancement',
          'Subsidy access support',
          'Documentation assistance',
          'Compliance guidance',
          'Benefits optimization',
          'Ongoing support'
        ],
        process: [
          'Business verification',
          'Udyam registration application',
          'Document submission',
          'Certificate generation',
          'Benefits activation',
          'Compliance guidance'
        ],
        documents: [
          'PAN Card copy',
          'Aadhaar Card copy',
          'Business registration proof',
          'Bank account details',
          'Business address proof',
          'Investment details'
        ]
      },
      'startup-india-registration': {
        title: 'Startup India Registration',
        description: 'Register your startup with Startup India initiative and avail all government benefits and incentives.',
        rating: 4.6,
        reviews: 789,
        category: 'Registration Services',
        duration: '10-15 business days',
        price: '₹1',
        originalPrice: '₹4,999',
        features: [
          'Startup India recognition',
          'Tax benefits and exemptions',
          'IPR support and guidance',
          'Funding assistance',
          'Mentorship programs',
          'Government scheme access',
          'Compliance support',
          'Ongoing guidance'
        ],
        process: [
          'Startup eligibility verification',
          'Registration application submission',
          'Document verification',
          'Recognition certificate generation',
          'Benefits activation',
          'Ongoing support'
        ],
        documents: [
          'Company registration certificate',
          'PAN Card copy',
          'Business plan',
          'Innovation certificate',
          'Directors details',
          'Bank account information'
        ]
      },
      // Outsourcing Services
      'day-to-day-accounting': {
        title: 'Day-to-day Accounting',
        description: 'Are you looking for a professional to handle your day-to-day accounting? We provide comprehensive accounting services.',
        rating: 4.6,
        reviews: 1543,
        category: 'Outsourcing Services',
        duration: 'Monthly',
        price: '₹1',
        originalPrice: '₹3,999',
        features: [
          'Daily bookkeeping and entries',
          'Bank reconciliation',
          'Accounts payable and receivable',
          'Financial statement preparation',
          'Monthly MIS reports',
          'Tax compliance support',
          'Real-time reporting',
          'Expert consultation'
        ],
        process: [
          'Initial setup and data migration',
          'Daily transaction recording',
          'Monthly reconciliation',
          'Financial statement preparation',
          'Report generation',
          'Ongoing support and consultation'
        ],
        documents: [
          'Bank statements',
          'Sales and purchase invoices',
          'Expense receipts',
          'Previous accounting records',
          'Tax registration documents',
          'Business registration proof'
        ]
      },
      'payroll-management': {
        title: 'Payroll Management',
        description: 'Professional payroll management services to handle all employee-related financial processes efficiently.',
        rating: 4.7,
        reviews: 987,
        category: 'Outsourcing Services',
        duration: 'Monthly',
        price: '₹1',
        originalPrice: '₹2,999',
        features: [
          'Salary calculation and processing',
          'TDS and PF calculations',
          'ESI compliance',
          'Payroll reports generation',
          'Employee self-service portal',
          'Statutory compliance support',
          'Automated calculations',
          'Expert guidance'
        ],
        process: [
          'Employee data setup',
          'Salary structure configuration',
          'Monthly payroll processing',
          'Statutory compliance calculations',
          'Report generation',
          'Ongoing support and updates'
        ],
        documents: [
          'Employee details',
          'Salary structure',
          'Previous payroll records',
          'PF and ESI details',
          'TDS certificates',
          'Bank account details'
        ]
      },
      'finance-gst-compliance': {
        title: 'Finance Role & GST Compliance',
        description: 'Complete finance role and GST compliance management for your business with expert professionals.',
        rating: 4.8,
        reviews: 1123,
        category: 'Outsourcing Services',
        duration: 'Monthly',
        price: '₹1',
        originalPrice: '₹5,999',
        features: [
          'Complete finance management',
          'GST return filing',
          'Financial planning and analysis',
          'Budget preparation and monitoring',
          'Cash flow management',
          'Audit support and preparation',
          'Compliance monitoring',
          'Strategic financial advice'
        ],
        process: [
          'Financial system setup',
          'Monthly bookkeeping and reconciliation',
          'GST return preparation and filing',
          'Financial analysis and reporting',
          'Budget monitoring and control',
          'Ongoing compliance support'
        ],
        documents: [
          'Financial statements',
          'GST returns',
          'Bank statements',
          'Sales and purchase records',
          'Tax documents',
          'Audit reports'
        ]
      }
    };
    
    return services[id as keyof typeof services] || services['itr-1'];
  };

  const serviceDetails = getServiceDetails(serviceId);


  // Initialize form data with user information
  const initializeFormData = () => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        annualIncome: '', // Annual income is not stored in user profile
        additionalRequirements: '',
        selectedFeatures: []
      });
    }
  };

  // Check if user has complete profile information
  const hasCompleteProfile = user && user.fullName && user.email && user.phoneNumber;

  // Initialize form data when modal opens
  useEffect(() => {
    if (showQuotationForm) {
      initializeFormData();
      setPaymentError(null); // Clear any previous errors
    }
  }, [showQuotationForm, user]);

  const plans = [
    {
      id: 'basic',
      name: 'Standard Plan',
      price: serviceDetails.price,
      originalPrice: serviceDetails.originalPrice,
      features: serviceDetails.features.slice(0, 6),
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      price: `₹${parseInt(serviceDetails.price.replace('₹', '').replace(',', '')) + 500}`,
      originalPrice: `₹${parseInt(serviceDetails.originalPrice.replace('₹', '').replace(',', '')) + 1000}`,
      features: [
        ...serviceDetails.features,
        'Priority CA consultation',
        'Express processing',
        'Document storage for 2 years',
        'Post-service support',
        'Tax planning advice'
      ],
      popular: false
    },
    {
      id: 'consultation',
      name: 'Free Consultation',
      price: 'FREE',
      originalPrice: '₹0',
      features: [
        'Free initial consultation',
        'Service assessment & analysis',
        'Customized strategy',
        'No obligation to proceed',
        'Pay only if satisfied',
        'Expert CA guidance',
        'Transparent pricing'
      ],
      popular: false
    }
  ];

  const handleFormFieldChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };


  // Payment processing functions
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initiatePayment = async () => {
    if (!user) {
      alert('Please login to proceed with payment');
      return;
    }

    // Validate form before proceeding
    if (!validateForm()) {
      return;
    }

    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      const parsedAmount = parseInt(serviceDetails.price.replace('₹', '').replace(',', ''));
      console.log('💰 Service Details Price:', serviceDetails.price);
      console.log('💰 Parsed Amount:', parsedAmount);
      
      // First, create payment order with backend
      const paymentOrderData = {
        userId: user._id,
        amount: parsedAmount,
        currency: 'INR',
        items: [{
          itemType: 'service',
          itemId: serviceId,
          price: parsedAmount,
          billingPeriod: 'one-time',
          selectedFeatures: formData.selectedFeatures || []
        }]
      };
      
      console.log('📦 Payment Order Data:', paymentOrderData);

      const paymentOrderResponse = await axios.post(`${API_BASE_URL}/payment/initiate-payment`, paymentOrderData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Payment order response:', paymentOrderResponse.data);
      const { orderId, amount, currency, isDevelopmentMode } = paymentOrderResponse.data.data;
      console.log('isDevelopmentMode from backend:', isDevelopmentMode);

      // Proceed with real Razorpay integration

      // Load Razorpay script for production
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      // Create payment options with Razorpay order ID from backend
      const paymentOptions = {
        key: 'rzp_test_RH6v2Ap0TDGOmM', // Using master .env file value
        order_id: orderId, // Use order ID from backend
        amount: amount,
        currency: currency,
        name: 'Facto Services',
        description: `Payment for ${serviceDetails.title}`,
        handler: async function (response: any) {
          console.log('Payment successful:', response);
          try {
            // Verify payment with backend
            const verifyData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            };

            console.log('Verifying payment:', verifyData);
            
            const verifyResponse = await axios.post(`${API_BASE_URL}/payment/verify-payment`, verifyData, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
              }
            });

            console.log('Payment verified:', verifyResponse.data);
            
            // Show success popup with service details
            console.log('🎉 Payment verification response:', verifyResponse.data);
            console.log('💰 Amount from backend:', verifyResponse.data.data.amount);
            console.log('💰 Service price:', serviceDetails.price);
            
            setSuccessPopup({
              isOpen: true,
              title: 'Payment Successful!',
              message: verifyResponse.data.data.message || 'Your service has been activated successfully',
              serviceName: verifyResponse.data.data.serviceName || serviceDetails.title,
              purchaseId: verifyResponse.data.data.purchaseId || 'N/A',
              amount: verifyResponse.data.data.amount || parseInt(serviceDetails.price.replace('₹', '').replace(',', '')),
              currency: verifyResponse.data.data.currency || 'INR'
            });
            
            setShowQuotationForm(false);
          } catch (error) {
            console.error('Failed to verify payment:', error);
            alert('Payment successful, but failed to verify. Please contact support.');
            setShowQuotationForm(false);
            onNavigate('home');
          }
        },
        prefill: {
          name: user.fullName || formData.fullName,
          email: user.email || formData.email,
          contact: user.phoneNumber || formData.phoneNumber
        },
        modal: {
          ondismiss: function() {
            setIsProcessingPayment(false);
          }
        }
      };

      const rzp = new window.Razorpay(paymentOptions);
      rzp.open();
    } catch (error: any) {
      console.error('Payment initiation failed:', error);
      
      // Provide more specific error messages based on the error type
      let errorMessage = 'Payment initiation failed. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (status === 400) {
          errorMessage = data?.message || 'Invalid request. Please check your information.';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (data?.message) {
          errorMessage = data.message;
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message) {
        // Other error
        errorMessage = error.message;
      }
      
      setPaymentError(errorMessage);
      setIsProcessingPayment(false);
    }
  };

  const handleQuotationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare quotation data with user information
    const quotationData = {
      serviceId,
      serviceName: serviceDetails.title,
      userInfo: {
        fullName: user?.fullName || formData.fullName,
        email: user?.email || formData.email,
        phoneNumber: user?.phoneNumber || formData.phoneNumber,
        annualIncome: formData.annualIncome
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('Quotation Request:', quotationData);
    
    // Reset form
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      annualIncome: '',
      additionalRequirements: '',
      selectedFeatures: []
    });
    setShowQuotationForm(false);
    
    // Show success message or redirect
    alert('Quotation request submitted successfully! Our team will contact you within 24 hours.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-white dark:from-gray-900 dark:to-gray-800 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-400 mb-8">
          <button onClick={() => onNavigate('home')} className="hover:text-[#007AFF] dark:text-[#007AFF]">Home</button>
          <span>/</span>
          <button onClick={() => onNavigate('services')} className="hover:text-[#007AFF] dark:text-[#007AFF]">Services</button>
          <span>/</span>
          <span className="text-[#007AFF] dark:text-[#007AFF]">{serviceDetails.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Service Header */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="inline-block px-3 py-1 bg-[#007AFF]/10 text-[#007AFF] dark:text-[#007AFF] rounded-full text-sm font-medium mb-3">
                    {serviceDetails.category}
                  </span>
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">
                    {serviceDetails.title}
                  </h1>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }, (_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${i < Math.floor(serviceDetails.rating) ? 'text-[#FFD166]' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-2 font-medium">{serviceDetails.rating}</span>
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">({serviceDetails.reviews.toLocaleString()} reviews)</span>
                    <span className="text-gray-600 dark:text-gray-400">• {serviceDetails.duration}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                {serviceDetails.description}
              </p>
            </div>

            {/* Features */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">What's Included</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {serviceDetails.features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-[#00C897] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Process */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">How It Works</h2>
              <div className="space-y-4">
                {serviceDetails.process.map((step: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <div className="w-8 h-8 bg-[#007AFF] text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Documents */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Required Documents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {serviceDetails.documents.map((document: string, index: number) => (
                  <div key={index} className="flex items-center">
                    <svg className="w-5 h-5 text-[#007AFF] dark:text-[#007AFF] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">{document}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Plan Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Choose Your Plan</h3>
              <div className="space-y-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      selectedPlan === plan.id
                        ? 'border-[#007AFF] bg-[#007AFF]/5'
                        : 'border-gray-200 dark:border-gray-600 hover:border-[#007AFF]/50'
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          checked={selectedPlan === plan.id}
                          onChange={() => setSelectedPlan(plan.id)}
                          className="text-[#007AFF] dark:text-[#007AFF]"
                        />
                        <span className="ml-2 font-semibold text-gray-800 dark:text-white">{plan.name}</span>
                        {plan.id === 'consultation' && (
                          <span className="ml-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                            FREE
                          </span>
                        )}
                        {plan.popular && (
                          <span className="ml-2 bg-[#FFD166] text-[#1F2937] dark:text-white px-2 py-1 rounded-full text-xs font-bold">
                            Popular
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-800 dark:text-white">{plan.price}</div>
                        <div className="text-xs text-gray-400 line-through">{plan.originalPrice}</div>
                      </div>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-200">
                      {plan.features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-center">
                          <svg className="w-3 h-3 text-[#00C897] mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="mt-6">
                {selectedPlan === 'consultation' ? (
                  <div className="relative">
                    <button
                      onClick={() => {
                        if (isAuthenticated) {
                          // Handle contact us action - could open contact form or redirect
                          window.open('tel:+91-9876543210', '_self');
                        } else {
                          onNavigate('login');
                        }
                      }}
                      disabled={!isAuthenticated}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                        isAuthenticated 
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-lg cursor-pointer' 
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {isAuthenticated ? 'Contact Us for Free Consultation' : 'Login to Contact Us'}
                    </button>
                    {!isAuthenticated && (
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                        Please login to contact us
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => isAuthenticated ? setShowQuotationForm(true) : onNavigate('login')}
                      disabled={!isAuthenticated}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                        isAuthenticated 
                          ? 'bg-gradient-to-r from-[#007AFF] to-[#0056CC] text-white hover:shadow-lg cursor-pointer' 
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isAuthenticated ? 'Get Quotation' : 'Login to Get Quotation'}
                    </button>
                    {!isAuthenticated && (
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                        Please login to get quotation
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Support */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Need Help?</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <svg className="w-5 h-5 text-[#007AFF] dark:text-[#007AFF] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+91-800-123-4567</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <svg className="w-5 h-5 text-[#007AFF] dark:text-[#007AFF] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>support@facto.in</span>
                </div>
                <button className="w-full mt-4 bg-[#00C897] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#00A86B] transition-colors">
                  Chat with Expert
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quotation Form Modal */}
        {showQuotationForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#007AFF] rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-[#1F2937] dark:text-white">{serviceDetails.title}</h3>
                </div>
                <button
                  onClick={() => setShowQuotationForm(false)}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-400"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>


              <form onSubmit={handleQuotationSubmit} className="space-y-4">
                {/* Development Mode Indicator */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                      Development Mode: Using mock payment flow for testing
                    </span>
                  </div>
                </div>

                {/* Show user info summary if profile is complete */}
                {hasCompleteProfile && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                        Using your profile information: {user?.fullName} ({user?.email})
                      </span>
                    </div>
                  </div>
                )}

                {/* Payment Error Display */}
                {paymentError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-red-700 dark:text-red-300 font-medium">
                          {paymentError}
                        </span>
                      </div>
                      <button
                        onClick={() => setPaymentError(null)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Full Name - only show if not available in profile */}
                {!user?.fullName && (
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] dark:text-white mb-2">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => handleFormFieldChange('fullName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Enter your full name"
                    />
                  </div>
                )}

                {/* Email - only show if not available in profile */}
                {!user?.email && (
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] dark:text-white mb-2">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleFormFieldChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Enter your email"
                    />
                  </div>
                )}

                {/* Phone Number - only show if not available in profile */}
                {!user?.phoneNumber && (
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] dark:text-white mb-2">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={(e) => handleFormFieldChange('phoneNumber', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                        formErrors.phoneNumber ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Enter your phone number"
                    />
                    {formErrors.phoneNumber && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.phoneNumber}</p>
                    )}
                  </div>
                )}

                {/* Annual Income - always show as it's not stored in profile */}
                <div>
                  <label className="block text-sm font-medium text-[#1F2937] dark:text-white mb-2">Annual Income</label>
                  <select 
                    value={formData.annualIncome}
                    onChange={(e) => handleFormFieldChange('annualIncome', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      formErrors.annualIncome ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">Select income range</option>
                    <option value="0-250000">Up to ₹2.5 Lakh</option>
                    <option value="250001-500000">₹2.5 - ₹5 Lakh</option>
                    <option value="500001-1000000">₹5 - ₹10 Lakh</option>
                    <option value="1000000+">Above ₹10 Lakh</option>
                  </select>
                  {formErrors.annualIncome && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.annualIncome}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1F2937] dark:text-white mb-2">Additional Requirements</label>
                  <textarea
                    value={formData.additionalRequirements}
                    onChange={(e) => handleFormFieldChange('additionalRequirements', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                      formErrors.additionalRequirements ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    rows={3}
                    placeholder="Any specific requirements or questions?"
                  ></textarea>
                  {formErrors.additionalRequirements && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.additionalRequirements}</p>
                  )}
                </div>
                <div className="space-y-3 pt-4">
                  {/* Pay & Activate button - only show for non-consultation plans */}
                  {selectedPlan !== 'consultation' && (
                    <button
                      type="button"
                      onClick={initiatePayment}
                      disabled={isProcessingPayment || !isAuthenticated || isLoading}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                        isProcessingPayment || !isAuthenticated || isLoading
                          ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-[#007AFF] to-[#0056CC] text-white hover:shadow-lg cursor-pointer'
                      }`}
                    >
                      {isProcessingPayment ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          Pay & Activate
                        </>
                      )}
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => setShowQuotationForm(false)}
                    className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Success Popup */}
        <SuccessPopup
          isOpen={successPopup.isOpen}
          onClose={() => {
            setSuccessPopup({ ...successPopup, isOpen: false });
            onNavigate('profile'); // Navigate to profile after closing popup
          }}
          title={successPopup.title}
          message={successPopup.message}
          serviceName={successPopup.serviceName}
          purchaseId={successPopup.purchaseId}
          amount={successPopup.amount}
          currency={successPopup.currency}
        />
      </div>
    </div>
  );
}
