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
import { MobileHeader } from './components/mobile/MobileHeader';
import { MobileHomeScreen } from './components/mobile/MobileHomeScreen';
import { MobileShorts } from './components/mobile/MobileShorts';
import { MobileLoginPage } from './components/mobile/MobileLoginPage';
import { MobileSignupPage } from './components/mobile/MobileSignupPage';
import { MobileUpdates } from './components/mobile/MobileUpdates';
import { MobileUserProfile } from './components/mobile/MobileUserProfile';
import { WelcomeScreen } from './components/mobile/WelcomeScreen';
import { TermsAndConditions } from './components/TermsAndConditions';
import { PrivacyPolicy } from './components/PrivacyPolicy';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile' | 'course-payment' | 'course-details' | 'terms' | 'privacy';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('itr-1');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [servicesFilter, setServicesFilter] = useState<string | undefined>(undefined);
  // Initialize isMobile immediately to ensure navigation bar shows on native platform
  const [isMobile, setIsMobile] = useState(() => {
    try {
      const isNative = Capacitor.isNativePlatform();
      const isMobileWidth = typeof window !== 'undefined' && window.innerWidth < 768;
      const result = isNative || isMobileWidth;
      console.log('App.tsx: Initial isMobile state:', { isNative, isMobileWidth, result });
      return result;
    } catch (e) {
      console.error('App.tsx: Error checking mobile:', e);
      // Fallback if Capacitor not initialized yet
      return typeof window !== 'undefined' && window.innerWidth < 768;
    }
  });
  const [showWelcome, setShowWelcome] = useState(false);
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
      try {
        const isNative = Capacitor.isNativePlatform();
        const isMobileWidth = typeof window !== 'undefined' && window.innerWidth < 768;
        const result = isNative || isMobileWidth;
        console.log('App.tsx: checkMobile useEffect:', { isNative, isMobileWidth, result, windowWidth: typeof window !== 'undefined' ? window.innerWidth : 'N/A' });
        setIsMobile(result);
      } catch (e) {
        console.error('App.tsx: Error in checkMobile:', e);
        // Fallback if Capacitor not initialized yet
        const fallback = typeof window !== 'undefined' && window.innerWidth < 768;
        console.log('App.tsx: Using fallback isMobile:', fallback);
        setIsMobile(fallback);
      }
    };
    
    // Update on mount and resize
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Check if welcome screen should be shown (every app launch)
    // For native apps, always show on mount (sessionStorage is cleared when app goes to background)
    // For web, check sessionStorage
    try {
      if (isMobile) {
        const isNative = Capacitor.isNativePlatform();
        let shouldShowWelcome = false;
        
        if (isNative) {
          // For native apps, always show welcome screen on app launch
          // The useAppState hook will clear the flag when app goes to background
          const welcomeShown = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('welcomeShown') : null;
          shouldShowWelcome = !welcomeShown;
          console.log('[App.tsx] Native app - Welcome screen check:', { welcomeShown, shouldShowWelcome });
        } else {
          // For web, use sessionStorage check
          const welcomeShown = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('welcomeShown') : null;
          shouldShowWelcome = !welcomeShown;
          console.log('[App.tsx] Web - Welcome screen check:', { welcomeShown, shouldShowWelcome });
        }
        
        if (shouldShowWelcome) {
          console.log('[App.tsx] Setting showWelcome to true');
          setShowWelcome(true);
        }
      }
    } catch (e) {
      console.error('[App.tsx] Error checking welcome screen:', e);
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

  // Show welcome screen on app launch (mobile only, once per session)
  if (showWelcome && isMobile) {
    console.log('[App.tsx] Rendering WelcomeScreen');
    return (
      <WelcomeScreen 
        onNavigate={(page) => {
          console.log('[App.tsx] WelcomeScreen navigation callback:', page);
          setShowWelcome(false);
          setCurrentPage(page);
        }} 
      />
    );
  }

  return (
    <>
      {/* Top Navigation - Fixed at top, completely outside content flow */}
      {/* Show Navigation on web, MobileHeader on native platforms */}
      {(() => {
        const isNative = Capacitor.isNativePlatform();
        console.log('App.tsx: Rendering header', { isNative, currentPage, platform: Capacitor.getPlatform() });
        return isNative ? (
          <MobileHeader 
            currentPage={currentPage}
            onNavigate={handleNavigation}
          />
        ) : (
          <Navigation 
            currentPage={currentPage}
            onNavigate={handleNavigation}
            isShortsPage={currentPage === 'shorts'}
          />
        );
      })()}
      
      <div style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden', backgroundColor: 'transparent' }}>
        <div className="min-h-screen relative bg-background text-foreground" style={{ overflowX: 'hidden', position: 'relative', backgroundColor: 'transparent' }}>
        {/* Offline Indicator */}
        <OfflineIndicator />
        
        {/* Session Warning */}
        <SessionWarning />

        {/* Page Content - Optimized for smooth transitions */}
        <div 
          className={`w-full ${
            currentPage !== 'login' && currentPage !== 'signup' && currentPage !== 'shorts' 
              ? (Capacitor.isNativePlatform()
                  ? `pt-[calc(4rem+max(env(safe-area-inset-top,24px),24px))]` // Header height (4rem) + safe area padding on native
                  : isMobile 
                    ? `pt-[calc(4rem+max(env(safe-area-inset-top,40px),40px))]` 
                    : 'pt-16 md:pt-16') 
              : currentPage === 'shorts' 
                ? '' 
                : ''
          }`}
          style={{ 
            willChange: currentPage !== 'shorts' ? 'contents' : 'auto',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y pinch-zoom', // Allow vertical scrolling and pinch zoom, but let horizontal swipes be handled
            paddingTop: isMobile && currentPage !== 'login' && currentPage !== 'signup' && currentPage !== 'shorts' && currentPage !== 'terms' && currentPage !== 'privacy'
              ? `calc(4rem + max(env(safe-area-inset-top, 40px), 40px))` // 64px (h-16) + safe area top (min 40px for Android with notch)
              : undefined,
            paddingBottom: isMobile && currentPage !== 'login' && currentPage !== 'signup' && currentPage !== 'shorts' && currentPage !== 'terms' && currentPage !== 'privacy'
              ? 'calc(4rem + env(safe-area-inset-bottom, 0px))' // 64px (h-16) + safe area bottom
              : undefined,
            position: 'relative',
            zIndex: 1
          }}
        >
          {renderPage()}
        </div>
      </div>

        {/* Bottom Tab Bar - Mobile only - Fixed to viewport */}
        {(() => {
          // Always show on native platform, or if isMobile is true
          const isNative = Capacitor.isNativePlatform();
          const shouldShowNav = (isNative || isMobile) && currentPage !== 'login' && currentPage !== 'signup' && currentPage !== 'terms' && currentPage !== 'privacy';
          console.log('App.tsx: BottomTabBar render check:', { 
            isMobile, 
            isNative,
            currentPage, 
            shouldShowNav,
            windowWidth: typeof window !== 'undefined' ? window.innerWidth : 'N/A'
          });
          return shouldShowNav ? (
            <BottomTabBar 
              currentPage={currentPage}
              onNavigate={handleNavigation}
            />
          ) : null;
        })()}

        {/* WhatsApp Chat Button - Desktop only (mobile shows in nav) */}
        {!isMobile && currentPage !== 'login' && currentPage !== 'signup' && currentPage !== 'terms' && currentPage !== 'privacy' && (
          <WhatsAppChatButton 
            isMobile={false}
          />
        )}
      </div>
    </>
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
