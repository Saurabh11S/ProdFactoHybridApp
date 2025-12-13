import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { fetchAllSubServices, SubService } from '../../api/services';
import { fetchCourseById, Course } from '../../api/courses';
import { ServiceDocumentUpload } from '../ServiceDocumentUpload';
import { API_BASE_URL } from '../../config/apiConfig';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile' | 'course-payment';

interface MobileUserProfileProps {
  onNavigate: (page: PageType, serviceId?: string) => void;
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

export function MobileUserProfile({ onNavigate }: MobileUserProfileProps) {
  // Dark mode is handled via CSS dark: classes
  // const { isDarkMode } = useDarkMode();
  const { user, token, isAuthenticated, refreshUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'services' | 'courses' | 'payments'>('profile');
  const [userPurchases, setUserPurchases] = useState<UserPurchase[]>([]);
  const [paymentOrders, setPaymentOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedServiceForUpload, setSelectedServiceForUpload] = useState<{id: string, purchaseId?: string, name: string} | null>(null);
  const [serviceDocumentCounts, setServiceDocumentCounts] = useState<{[key: string]: number}>({});
  const [allServices, setAllServices] = useState<SubService[]>([]);
  const [courseDetailsMap, setCourseDetailsMap] = useState<{[key: string]: Course}>({});
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    gstNumber: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Initialize edit form data when user data is available
  useEffect(() => {
    if (user) {
      const gstNumber = (user as any).gstProfile?.gstNumber || '';
      setEditFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        gstNumber: gstNumber
      });
    }
  }, [user]);

  // Fetch all services for mapping
  useEffect(() => {
    const loadAllServices = async () => {
      try {
        const data = await fetchAllSubServices();
        setAllServices(data);
      } catch (err) {
        console.error('Error fetching all services:', err);
      }
    };
    loadAllServices();
  }, []);

  // Handle edit profile
  const handleEditProfile = () => {
    setIsEditingProfile(true);
    setSaveError(null);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setSaveError(null);
    if (user) {
      const gstNumber = (user as any).gstProfile?.gstNumber || '';
      setEditFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        gstNumber: gstNumber
      });
    }
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    if (!token || !user) {
      setSaveError('You must be logged in to update your profile');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      // Validate email format if provided
      if (editFormData.email && !/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(editFormData.email.trim())) {
        setSaveError('Please enter a valid email address');
        setIsSaving(false);
        return;
      }

      const updateData: any = {};
      if (editFormData.fullName.trim()) {
        updateData.fullName = editFormData.fullName.trim();
      }
      if (editFormData.email.trim()) {
        updateData.email = editFormData.email.trim().toLowerCase();
      }
      const existingGstProfile = (user as any).gstProfile || {};
      const trimmedGstNumber = editFormData.gstNumber.trim().toUpperCase();
      
      if (trimmedGstNumber) {
        updateData.gstProfile = {
          ...existingGstProfile,
          gstNumber: trimmedGstNumber
        };
      } else if (existingGstProfile && Object.keys(existingGstProfile).length > 0) {
        const { gstNumber, ...restGstProfile } = existingGstProfile;
        if (Object.keys(restGstProfile).length > 0) {
          updateData.gstProfile = restGstProfile;
        } else {
          updateData.gstProfile = {
            ...existingGstProfile,
            gstNumber: ''
          };
        }
      }

      const response = await axios.put(
        `${API_BASE_URL}/user/profile`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        await refreshUser();
        setIsEditingProfile(false);
        setSaveError(null);
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setSaveError(
        error.response?.data?.message || 
        error.message || 
        'Failed to update profile. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Create service data mapping
  const serviceDataMap: { [key: string]: ServiceData } = allServices.reduce((acc, service) => {
    acc[service._id] = {
      id: service._id,
      title: service.title,
      description: service.description,
      price: `₹${service.price}`,
      category: typeof service.serviceId === 'object' && service.serviceId !== null
        ? (service.serviceId.title || service.serviceId.category || 'General Services')
        : 'General Services',
      duration: service.period,
      features: service.features || []
    };
    return acc;
  }, {} as { [key: string]: ServiceData });

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !isAuthenticated || !token) {
        return;
      }
      
      setLoading(true);
      
      try {
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const [purchasesRes, paymentsRes] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/user-purchases`, { headers }),
          axios.get(`${API_BASE_URL}/payment-orders`, { headers })
        ]);

        if (purchasesRes.status === 'fulfilled') {
          const purchases = purchasesRes.value.data.data || [];
          setUserPurchases(purchases);
          
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
          
          if (paymentsRes.status === 'fulfilled') {
            const directPayments = paymentsRes.value.data.data || [];
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

        const purchases = purchasesRes.status === 'fulfilled' ? (purchasesRes.value.data.data || []) : [];
        const documentCounts: {[key: string]: number} = {};
        for (const purchase of purchases) {
          if (purchase.itemType === 'service') {
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
        }
        setServiceDocumentCounts(documentCounts);

        const coursePurchases = purchases.filter((p: UserPurchase) => p.itemType === 'course');
        if (coursePurchases.length > 0) {
          setCoursesLoading(true);
          const courseDetails: {[key: string]: Course} = {};
          await Promise.all(
            coursePurchases.map(async (purchase: UserPurchase) => {
              try {
                const course = await fetchCourseById(purchase.itemId, token || undefined);
                courseDetails[purchase.itemId] = course;
              } catch (error) {
                console.error(`Error fetching course ${purchase.itemId}:`, error);
              }
            })
          );
          setCourseDetailsMap(courseDetails);
          setCoursesLoading(false);
        }

      } catch (error: any) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, isAuthenticated, token]);

  const getServiceData = (itemId: string): ServiceData | null => {
    return serviceDataMap[itemId] || null;
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate statistics
  const totalServices = userPurchases.filter(purchase => purchase.itemType === 'service' && getServiceData(purchase.itemId) !== null).length;
  const totalPayments = paymentOrders.length;
  const totalCourses = userPurchases.filter(purchase => purchase.itemType === 'course').length;
  const totalSpent = (() => {
    const fromPayments = paymentOrders
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    return fromPayments;
  })();

  // Get user initials
  const getUserInitials = () => {
    if (!user?.fullName) return 'U';
    return user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-4">Please log in to view your profile</h2>
          <button
            onClick={() => onNavigate('login')}
            className="bg-[#007AFF] text-white px-6 py-3 rounded-xl font-medium"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a1628] pb-2 pt-16">
      {/* Welcome Section */}
      <div className="px-4 pt-4 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
          Welcome to <span className="text-[#007AFF]">Facto</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">Manage your profile, services, and payments</p>
      </div>

      {/* Summary Cards */}
      <div className="px-4 mb-4 space-y-3">
        {/* Total Services */}
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 dark:border-white/10">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Total Services</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? '...' : totalServices}
              </p>
            </div>
          </div>
        </div>

        {/* Total Payments */}
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 dark:border-white/10">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? '...' : totalPayments}
              </p>
            </div>
          </div>
        </div>

        {/* Total Courses */}
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 dark:border-white/10">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? '...' : totalCourses}
              </p>
            </div>
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 dark:border-white/10">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? '...' : `₹${totalSpent.toLocaleString('en-IN')}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 mb-4">
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-2 border border-gray-200 dark:border-white/10 flex gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'profile'
                ? 'bg-[#007AFF] text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profile</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'services'
                ? 'bg-[#007AFF] text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>My Services</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'courses'
                ? 'bg-[#007AFF] text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>My Courses</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'payments'
                ? 'bg-[#007AFF] text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>Payments</span>
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 pb-4">
        {activeTab === 'profile' && (
          <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-white/10">
            {isEditingProfile ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={editFormData.fullName}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                    placeholder="Enter your email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">GST Number</label>
                  <input
                    type="text"
                    value={editFormData.gstNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, gstNumber: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                    placeholder="Enter GST number"
                    maxLength={15}
                  />
                </div>
                {saveError && (
                  <div className="p-3 bg-red-50 dark:bg-red-500/20 border border-red-200 dark:border-red-500/50 rounded-xl">
                    <p className="text-sm text-red-600 dark:text-red-300">{saveError}</p>
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex-1 bg-[#007AFF] text-white py-3 px-4 rounded-xl font-medium disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="flex-1 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-gray-200 dark:border-white/10">
                  <span className="text-gray-600 dark:text-gray-400">Full Name</span>
                  <span className="text-gray-900 dark:text-white font-medium">{user.fullName}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200 dark:border-white/10">
                  <span className="text-gray-600 dark:text-gray-400">Email</span>
                  <span className="text-gray-900 dark:text-white font-medium">{user.email}</span>
                </div>
                {user.phoneNumber && (
                  <div className="flex justify-between py-3 border-b border-gray-200 dark:border-white/10">
                    <span className="text-gray-600 dark:text-gray-400">Phone</span>
                    <span className="text-gray-900 dark:text-white font-medium">+91 {user.phoneNumber}</span>
                  </div>
                )}
                <div className="flex justify-between py-3 border-b border-gray-200 dark:border-white/10">
                  <span className="text-gray-600 dark:text-gray-400">GST Number</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {((user as any).gstProfile?.gstNumber) ? (user as any).gstProfile.gstNumber : 'Not provided'}
                  </span>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleEditProfile}
                    className="flex-1 bg-[#007AFF] text-white py-3 px-4 rounded-xl font-medium"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={logout}
                    className="flex-1 border border-red-500/50 text-red-400 py-3 px-4 rounded-xl font-medium hover:bg-red-500/10 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007AFF] mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-4">Loading...</p>
              </div>
            ) : userPurchases.filter(p => p.itemType === 'service').length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-white/10">
                <p className="text-gray-600 dark:text-gray-400">No services yet</p>
                <button
                  onClick={() => onNavigate('services')}
                  className="mt-4 bg-[#007AFF] text-white px-6 py-2 rounded-xl"
                >
                  Explore Services
                </button>
              </div>
            ) : (
              userPurchases
                .filter(p => p.itemType === 'service' && getServiceData(p.itemId))
                .map((purchase) => {
                  const serviceData = getServiceData(purchase.itemId);
                  if (!serviceData) return null;
                  return (
                    <div key={purchase._id} className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 dark:border-white/10">
                      <h3 className="text-gray-900 dark:text-white font-bold mb-2">{serviceData.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{serviceData.description}</p>
                      <div className="flex justify-between text-sm mb-3">
                        <span className="text-gray-600 dark:text-gray-400">Price:</span>
                        <span className="text-gray-900 dark:text-white">{serviceData.price}</span>
                      </div>
                      <button
                        onClick={() => setSelectedServiceForUpload({ id: purchase.itemId, purchaseId: purchase._id, name: serviceData.title })}
                        className="w-full bg-[#007AFF] text-white py-2 rounded-xl text-sm font-medium"
                      >
                        {serviceDocumentCounts[purchase._id] > 0 ? 'Manage Documents' : 'Upload Documents'}
                      </button>
                    </div>
                  );
                })
            )}
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="space-y-4">
            {loading || coursesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007AFF] mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-4">Loading...</p>
              </div>
            ) : userPurchases.filter(p => p.itemType === 'course').length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-white/10">
                <p className="text-gray-600 dark:text-gray-400">No courses yet</p>
                <button
                  onClick={() => onNavigate('learning')}
                  className="mt-4 bg-[#007AFF] text-white px-6 py-2 rounded-xl"
                >
                  Explore Courses
                </button>
              </div>
            ) : (
              userPurchases
                .filter(p => p.itemType === 'course')
                .map((purchase) => {
                  const course = courseDetailsMap[purchase.itemId];
                  if (!course) return null;
                  return (
                    <div key={purchase._id} className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 dark:border-white/10">
                      <h3 className="text-gray-900 dark:text-white font-bold mb-2">{course.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{course.description}</p>
                      <button
                        onClick={() => onNavigate('learning')}
                        className="w-full bg-[#007AFF] text-white py-2 rounded-xl text-sm font-medium"
                      >
                        View Course
                      </button>
                    </div>
                  );
                })
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007AFF] mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-4">Loading...</p>
              </div>
            ) : paymentOrders.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-white/10">
                <p className="text-gray-600 dark:text-gray-400">No payments yet</p>
              </div>
            ) : (
              paymentOrders.map((payment) => (
                <div key={payment._id} className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 dark:border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{formatDate(payment.createdAt)}</span>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      payment.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      payment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">₹{payment.amount.toLocaleString('en-IN')}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* User Info Card at Bottom */}
      <div className="px-4 pb-2">
        <div className="bg-gradient-to-r from-[#007AFF] to-[#00C897] rounded-2xl p-6 mb-4">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mr-4">
              <span className="text-2xl font-bold text-white">{getUserInitials()}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1">{user.fullName}</h3>
              <p className="text-white/80 text-sm">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Back to Home Button */}
        <button
          onClick={() => onNavigate('home')}
          className="w-full flex items-center justify-center gap-2 bg-[#007AFF] text-white hover:bg-[#0056CC] dark:bg-[#007AFF] dark:hover:bg-[#0056CC] active:opacity-70 transition-all py-3 px-4 rounded-xl font-medium shadow-lg shadow-[#007AFF]/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Back to Home</span>
        </button>
      </div>

      {/* Document Upload Modal */}
      {selectedServiceForUpload && (
        <ServiceDocumentUpload
          serviceId={selectedServiceForUpload.id}
          serviceName={selectedServiceForUpload.name}
          onClose={() => setSelectedServiceForUpload(null)}
        />
      )}
    </div>
  );
}

