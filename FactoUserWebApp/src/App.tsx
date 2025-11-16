import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { DarkModeProvider } from './components/DarkModeContext';
import { AuthProvider } from './contexts/AuthContext';
import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { ServicesSection } from './components/ServicesSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { CoursesSection } from './components/CoursesSection';
import { FinanceShortsSection } from './components/FinanceShortsSection';
import { NewsSection } from './components/NewsSection';
import { Footer } from './components/Footer';
import { ServicesPage } from './components/ServicesPage';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { ServiceDetailsPage } from './components/ServiceDetailsPage';
import { DocumentUploadPage } from './components/DocumentUploadPage';
import { PaymentPage } from './components/PaymentPage';
import { CoursePaymentPage } from './components/CoursePaymentPage';
import { CourseDetailsPage } from './components/CourseDetailsPage';
import { Learning } from './components/Learning';
import { MobileLearning } from './components/mobile/MobileLearning';
import { Shorts } from './components/Shorts';
import { Updates } from './components/Updates';
import { UserProfile } from './components/UserProfile';
import { WhatsAppChatButton } from './components/WhatsAppChatButton';
import { SessionWarning } from './components/SessionWarning';
import { OfflineIndicator } from './components/OfflineIndicator';
import { useAppState } from './hooks/useAppState';
import { BottomTabBar } from './components/mobile/BottomTabBar';
import { MobileHomeScreen } from './components/mobile/MobileHomeScreen';
import { MobileShorts } from './components/mobile/MobileShorts';
import { MobileLandingPage } from './components/mobile/MobileLandingPage';
import { MobileLoginPage } from './components/mobile/MobileLoginPage';
import { MobileSignupPage } from './components/mobile/MobileSignupPage';
import { MobileUpdates } from './components/mobile/MobileUpdates';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile' | 'course-payment' | 'course-details';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('itr-1');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [servicesFilter, setServicesFilter] = useState<string | undefined>(undefined);
  const [isMobile, setIsMobile] = useState(false);
  const [showLanding, setShowLanding] = useState(false);
  
  // Handle app lifecycle (mobile only)
  useAppState();

  // Detect mobile platform and check if landing page should be shown
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(Capacitor.isNativePlatform() || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Check if landing page has been shown before
    if (isMobile && !localStorage.getItem('landingShown')) {
      setShowLanding(true);
    }
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [isMobile]);

  const handleNavigation = (page: PageType, serviceId?: string, courseId?: string, filter?: string) => {
    setCurrentPage(page);
    if (serviceId) {
      setSelectedServiceId(serviceId);
    }
    if (courseId) {
      setSelectedCourseId(courseId);
    }
    // Set filter for services page
    if (page === 'services' && filter) {
      setServicesFilter(filter);
    } else if (page !== 'services') {
      // Clear filter when navigating away from services page
      setServicesFilter(undefined);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'services':
        return <ServicesPage onNavigate={handleNavigation} initialFilter={servicesFilter} />;
      case 'learning':
        if (isMobile) {
          return <MobileLearning onNavigate={handleNavigation} />;
        }
        return <Learning onNavigate={handleNavigation} />;
      case 'shorts':
        return isMobile ? <MobileShorts onNavigate={handleNavigation} /> : <Shorts onNavigate={handleNavigation} />;
      case 'updates':
        return isMobile ? <MobileUpdates onNavigate={handleNavigation} /> : <Updates onNavigate={handleNavigation} />;
      case 'login':
        return isMobile ? <MobileLoginPage onNavigate={handleNavigation} /> : <LoginPage onNavigate={handleNavigation} />;
      case 'signup':
        return isMobile ? <MobileSignupPage onNavigate={handleNavigation} /> : <SignupPage onNavigate={handleNavigation} />;
      case 'service-details':
        return <ServiceDetailsPage onNavigate={handleNavigation} serviceId={selectedServiceId} />;
      case 'documents':
        return <DocumentUploadPage onNavigate={handleNavigation} />;
      case 'payment':
        return <PaymentPage onNavigate={handleNavigation} serviceId={selectedServiceId} />;
      case 'course-payment':
        return <CoursePaymentPage onNavigate={handleNavigation} courseId={selectedCourseId} />;
      case 'course-details':
        return <CourseDetailsPage onNavigate={handleNavigation} courseId={selectedCourseId} />;
      case 'profile':
        return <UserProfile onNavigate={handleNavigation} />;
      default:
        // Use mobile-optimized home screen on mobile devices
        if (isMobile) {
          return <MobileHomeScreen onNavigate={handleNavigation} />;
        }
        // Use full web home screen on desktop
        return (
          <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-white dark:from-gray-900 dark:to-gray-800">
            <main className="relative">
              <HeroSection onNavigate={handleNavigation} />
              <ServicesSection onNavigate={handleNavigation} />
              <TestimonialsSection />
              <CoursesSection onNavigate={handleNavigation} />
              <FinanceShortsSection onNavigate={handleNavigation} />
              <NewsSection onNavigate={handleNavigation} />
            </main>
            <Footer />
          </div>
        );
    }
  };

  // Show landing page on first launch (mobile only)
  if (showLanding && isMobile) {
    return (
      <MobileLandingPage 
        onNavigate={(page) => {
          setShowLanding(false);
          localStorage.setItem('landingShown', 'true');
          setCurrentPage(page);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen relative bg-background text-foreground">
      {/* Offline Indicator */}
      <OfflineIndicator />
      
      {/* Session Warning */}
      <SessionWarning />
      
      {/* Top Navigation - Minimal on mobile, full on desktop */}
      {currentPage !== 'login' && currentPage !== 'signup' && (
        <Navigation 
          currentPage={currentPage}
          onNavigate={handleNavigation}
          isShortsPage={currentPage === 'shorts'}
        />
      )}

      {/* Page Content */}
      <div className={`w-full ${currentPage !== 'login' && currentPage !== 'signup' && currentPage !== 'shorts' ? (isMobile ? 'pt-16 pb-20' : 'pt-16 md:pt-16') : currentPage === 'shorts' ? '' : ''}`}>
        {renderPage()}
      </div>

      {/* Bottom Tab Bar - Mobile only */}
      {isMobile && currentPage !== 'login' && currentPage !== 'signup' && (
        <BottomTabBar 
          currentPage={currentPage}
          onNavigate={handleNavigation}
        />
      )}

      {/* WhatsApp Chat Button - Show on all pages except login/signup */}
      {/* Always visible on mobile apps - position adjusts based on bottom tab bar presence */}
      {currentPage !== 'login' && currentPage !== 'signup' && (
        <WhatsAppChatButton 
          phoneNumber="+918001234567" // Update this with your actual WhatsApp number
          message="Hello! I need help with your services."
          isMobile={isMobile && ['home', 'services', 'updates', 'profile', 'learning', 'shorts'].includes(currentPage)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </DarkModeProvider>
  );
}
