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
import { MobileUserProfile } from './components/mobile/MobileUserProfile';
import { TermsAndConditions } from './components/TermsAndConditions';
import { PrivacyPolicy } from './components/PrivacyPolicy';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile' | 'course-payment' | 'course-details' | 'terms' | 'privacy';

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
    const mainTabs: PageType[] = ['home', 'services', 'shorts', 'updates', 'learning'];
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
    
    const mainPages: PageType[] = ['home', 'services', 'shorts', 'updates', 'learning'];
    
    // Don't enable swipe on non-main pages
    // Exclude 'shorts' page as it has its own navigation handler
    if (!mainPages.includes(currentPage) || currentPage === 'shorts') {
      return;
    }
    
    let touchStartTime = 0;
    let touchStartY = 0;
    let touchStartXValue = 0;
    let isScrolling = false;
    let hasMoved = false;
    let swipeDirection: 'horizontal' | 'vertical' | null = null;
    let isEdgeSwipe = false;
    
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      
      touchStartXValue = touch.clientX;
      touchStartY = touch.clientY;
      touchStartX.current = touch.clientX;
      touchStartTime = Date.now();
      isScrolling = false;
      hasMoved = false;
      swipeDirection = null;
      
      // Check if touch started near screen edge (for edge swipe detection)
      const screenWidth = window.innerWidth;
      const edgeThreshold = 30; // pixels from edge
      isEdgeSwipe = touch.clientX < edgeThreshold || touch.clientX > screenWidth - edgeThreshold;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartXValue) return;
      
      const touch = e.touches[0];
      if (!touch) return;
      
      const deltaX = Math.abs(touch.clientX - touchStartXValue);
      const deltaY = Math.abs(touch.clientY - touchStartY);
      
      // Determine swipe direction on first significant movement
      if (!hasMoved && (deltaX > 10 || deltaY > 10)) {
        hasMoved = true;
        
        // For edge swipes, prioritize horizontal detection
        if (isEdgeSwipe && deltaX > 15) {
          swipeDirection = 'horizontal';
        } else if (deltaY > deltaX * 1.2) {
          // If vertical movement is significantly greater, it's a scroll
          isScrolling = true;
          swipeDirection = 'vertical';
        } else if (deltaX > deltaY * 1.2) {
          swipeDirection = 'horizontal';
        }
      }
      
      // If we've determined it's a vertical scroll (and not an edge swipe), don't interfere
      // This is especially important for Shorts page
      if ((isScrolling || swipeDirection === 'vertical') && !isEdgeSwipe) {
        return;
      }
      
      // For horizontal swipes (especially edge swipes), prevent default scrolling on the X axis
      if ((swipeDirection === 'horizontal' || isEdgeSwipe) && deltaX > 20) {
        // Allow some vertical movement but prioritize horizontal
        if (deltaX > deltaY || isEdgeSwipe) {
          e.preventDefault();
        }
      }
      
      touchEndX.current = touch.clientX;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      // Don't handle swipe if user was scrolling vertically (unless it's an edge swipe)
      if ((isScrolling || swipeDirection === 'vertical') && !isEdgeSwipe) {
        touchStartXValue = 0;
        isEdgeSwipe = false;
        return;
      }
      
      // Get the final touch position
      const finalX = e.changedTouches[0]?.clientX || touchEndX.current;
      
      if (!touchStartXValue) {
        return;
      }
      
      const touchDuration = Date.now() - touchStartTime;
      const swipeDistance = touchStartXValue - finalX;
      const minSwipeDistance = 60; // Minimum distance for swipe
      const maxSwipeDuration = 500; // Maximum duration for swipe
      const minSwipeVelocity = 0.3; // Minimum velocity (px/ms)
      
      // Reset touch start
      touchStartXValue = 0;
      const wasEdgeSwipe = isEdgeSwipe;
      isEdgeSwipe = false;
      
      // For edge swipes, use more lenient thresholds
      const effectiveMinDistance = wasEdgeSwipe ? minSwipeDistance * 0.7 : minSwipeDistance;
      const effectiveMinVelocity = wasEdgeSwipe ? minSwipeVelocity * 0.7 : minSwipeVelocity;
      
      // Only process if it's a quick, significant swipe
      if (touchDuration > maxSwipeDuration) {
        return;
      }
      
      const swipeVelocity = Math.abs(swipeDistance) / touchDuration;
      if (Math.abs(swipeDistance) < effectiveMinDistance || swipeVelocity < effectiveMinVelocity) {
        return;
      }
      
      // Don't navigate if already navigating
      if (isNavigating.current) {
        return;
      }
      
      const currentIndex = mainPages.indexOf(currentPage);
      if (currentIndex === -1) {
        return;
      }
      
      // Swipe left (finger moves left, screen moves right) - next page
      if (swipeDistance > 0 && currentIndex < mainPages.length - 1) {
        console.log('Swipe left detected, navigating to:', mainPages[currentIndex + 1]);
        handleNavigation(mainPages[currentIndex + 1]);
      } 
      // Swipe right (finger moves right, screen moves left) - previous page
      else if (swipeDistance < 0 && currentIndex > 0) {
        console.log('Swipe right detected, navigating to:', mainPages[currentIndex - 1]);
        handleNavigation(mainPages[currentIndex - 1]);
      }
    };
    
    // Use capture phase for touchstart to catch events early
    // Use non-passive for touchmove to allow preventDefault for horizontal swipes
    document.addEventListener('touchstart', handleTouchStart, { passive: true, capture: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true, capture: true });
    document.addEventListener('touchcancel', () => {
      touchStartXValue = 0;
      isScrolling = false;
      swipeDirection = null;
    }, { passive: true, capture: true });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart, { capture: true } as any);
      document.removeEventListener('touchmove', handleTouchMove, { capture: true } as any);
      document.removeEventListener('touchend', handleTouchEnd, { capture: true } as any);
      document.removeEventListener('touchcancel', () => {}, { capture: true } as any);
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
        return isMobile ? <MobileUserProfile onNavigate={handleNavigation} /> : <UserProfile onNavigate={handleNavigation} />;
      case 'terms':
        return <TermsAndConditions onNavigate={handleNavigation} />;
      case 'privacy':
        return <PrivacyPolicy onNavigate={handleNavigation} />;
      default:
        // Use mobile-optimized home screen on mobile devices
        if (isMobile) {
          return <MobileHomeScreen onNavigate={handleNavigation} />;
        }
        // Use full web home screen on desktop
        return (
          <div className="min-h-screen bg-gradient-to-br from-[#0A0F1F] to-[#1A263A] dark:from-[#0A0F1F] dark:to-[#1A263A]">
            <main className="relative">
              <HeroSection onNavigate={handleNavigation} />
              <ServicesSection onNavigate={handleNavigation} />
              <TestimonialsSection />
              <CoursesSection onNavigate={handleNavigation} />
              <FinanceShortsSection onNavigate={handleNavigation} />
              <NewsSection onNavigate={handleNavigation} />
            </main>
            <Footer onNavigate={handleNavigation} />
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
      <Navigation 
        currentPage={currentPage}
        onNavigate={handleNavigation}
        isShortsPage={currentPage === 'shorts'}
      />

      {/* Page Content - Optimized for smooth transitions */}
      <div 
        className={`w-full ${currentPage !== 'login' && currentPage !== 'signup' && currentPage !== 'shorts' ? (isMobile ? 'pt-16 pb-20' : 'pt-16 md:pt-16') : currentPage === 'shorts' ? '' : ''}`}
        style={{ 
          willChange: currentPage !== 'shorts' ? 'contents' : 'auto',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y pinch-zoom' // Allow vertical scrolling and pinch zoom, but let horizontal swipes be handled
        }}
      >
        {renderPage()}
      </div>

      {/* Bottom Tab Bar - Mobile only */}
      {isMobile && currentPage !== 'login' && currentPage !== 'signup' && currentPage !== 'terms' && currentPage !== 'privacy' && (
        <BottomTabBar 
          currentPage={currentPage}
          onNavigate={handleNavigation}
        />
      )}

      {/* WhatsApp Chat Button - Desktop only (mobile shows in nav) */}
      {!isMobile && currentPage !== 'login' && currentPage !== 'signup' && currentPage !== 'terms' && currentPage !== 'privacy' && (
        <WhatsAppChatButton 
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
