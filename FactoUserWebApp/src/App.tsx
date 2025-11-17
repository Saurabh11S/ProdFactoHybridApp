import { useState, useEffect, useRef, useCallback } from 'react';
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
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isNavigating = useRef(false);
  const navigationTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Handle app lifecycle (mobile only)
  useAppState();

  const handleNavigation = useCallback((page: PageType, serviceId?: string, courseId?: string, filter?: string) => {
    console.log('handleNavigation called:', { page, currentPage, serviceId, courseId, filter });
    
    // Always allow navigation for tab bar clicks (same page is fine for refreshing)
    // Only prevent if it's the exact same page AND no serviceId/courseId change AND it's not a main tab
    const mainTabs: PageType[] = ['home', 'services', 'learning', 'shorts', 'updates'];
    const isMainTab = mainTabs.includes(page);
    
    if (currentPage === page && !serviceId && !courseId && !filter && !isMainTab) {
      console.log('Already on this page, skipping navigation');
      // Still reset navigation lock in case it's stuck
      isNavigating.current = false;
      return;
    }
    
    // Prevent rapid navigation calls, but allow after a short delay
    if (isNavigating.current) {
      console.log('Navigation in progress, forcing after delay');
      setTimeout(() => {
        isNavigating.current = false;
        handleNavigation(page, serviceId, courseId, filter);
      }, 50); // Reduced delay for faster response
      return;
    }
    
    isNavigating.current = true;
    
    // Clear any pending navigation
    if (navigationTimeout.current) {
      clearTimeout(navigationTimeout.current);
    }
    
    // Use requestAnimationFrame for smooth transitions
    requestAnimationFrame(() => {
      console.log('Setting current page to:', page);
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
      
      // Reset navigation lock after transition
      navigationTimeout.current = setTimeout(() => {
        isNavigating.current = false;
        console.log('Navigation lock released');
      }, 200); // Reduced timeout for faster navigation
    });
  }, [currentPage]);
  
  // Swipe navigation handlers - optimized to not interfere with scrolling
  useEffect(() => {
    if (!isMobile) return;
    
    let touchStartTime = 0;
    let isScrolling = false;
    
    let touchStartY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
      isScrolling = false;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      const deltaX = Math.abs(e.touches[0].clientX - touchStartX.current);
      const deltaY = Math.abs(e.touches[0].clientY - touchStartY);
      
      // If vertical movement is greater, it's a scroll, not a swipe
      if (deltaY > deltaX && deltaY > 10) {
        isScrolling = true;
      }
      
      touchEndX.current = e.touches[0].clientX;
    };
    
    const handleTouchEnd = () => {
      // Don't handle swipe if user was scrolling
      if (isScrolling) return;
      
      const touchDuration = Date.now() - touchStartTime;
      const swipeDistance = touchStartX.current - touchEndX.current;
      const minSwipeDistance = 100;
      const maxSwipeDuration = 300; // Max 300ms for a swipe
      
      // Only handle swipe on main pages (not login/signup/service-details)
      if (['login', 'signup', 'service-details', 'documents', 'payment', 'profile', 'course-payment', 'course-details'].includes(currentPage)) {
        return;
      }
      
      // Only process if it's a quick swipe (not a slow drag)
      if (touchDuration > maxSwipeDuration) return;
      
      if (Math.abs(swipeDistance) > minSwipeDistance && !isNavigating.current) {
        const pages: PageType[] = ['home', 'services', 'learning', 'shorts', 'updates'];
        const currentIndex = pages.indexOf(currentPage);
        
        if (swipeDistance > 0 && currentIndex < pages.length - 1) {
          // Swipe left - next page
          handleNavigation(pages[currentIndex + 1]);
        } else if (swipeDistance < 0 && currentIndex > 0) {
          // Swipe right - previous page
          handleNavigation(pages[currentIndex - 1]);
        }
      }
    };
    
    // Use capture phase and passive listeners for better performance
    document.addEventListener('touchstart', handleTouchStart, { passive: true, capture: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: true, capture: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true, capture: false });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      if (navigationTimeout.current) {
        clearTimeout(navigationTimeout.current);
      }
    };
  }, [isMobile, currentPage, handleNavigation]);

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

      {/* Page Content - Optimized for smooth transitions */}
      <div 
        className={`w-full ${currentPage !== 'login' && currentPage !== 'signup' && currentPage !== 'shorts' ? (isMobile ? 'pt-16 pb-20' : 'pt-16 md:pt-16') : currentPage === 'shorts' ? '' : ''}`}
        style={{ 
          willChange: currentPage !== 'shorts' ? 'contents' : 'auto',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {renderPage()}
      </div>

      {/* Bottom Tab Bar - Mobile only */}
      {isMobile && currentPage !== 'login' && currentPage !== 'signup' && (
        <BottomTabBar 
          currentPage={currentPage}
          onNavigate={handleNavigation}
        />
      )}

      {/* WhatsApp Chat Button - Desktop only (mobile shows in nav) */}
      {!isMobile && currentPage !== 'login' && currentPage !== 'signup' && (
        <WhatsAppChatButton 
          phoneNumber="+918001234567" // Update this with your actual WhatsApp number
          message="Hello! I need help with your services."
          isMobile={false}
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
