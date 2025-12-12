import React, { useState, useEffect } from 'react';
import { useDarkMode } from './DarkModeContext';
import { useAuth } from '../contexts/AuthContext';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Browser } from '@capacitor/browser';
import { getWhatsAppNumber, getDefaultWhatsAppMessage } from '../config/whatsappConfig';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile' | 'course-payment' | 'course-details' | 'terms' | 'privacy';

interface NavigationProps {
  currentPage: PageType;
  onNavigate: (page: PageType, serviceId?: string, courseId?: string, filter?: string) => void;
  isShortsPage?: boolean;
}

export function Navigation({ currentPage, onNavigate, isShortsPage = false }: NavigationProps) {
  // Mobile menu state removed - Mobile apps use bottom tab bar navigation instead
  // const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { logout, isAuthenticated } = useAuth();

  useEffect(() => {
    // Use throttled scroll handler for better performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Use passive listener for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update status bar for mobile
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const updateStatusBar = async () => {
        try {
          // CRITICAL: Set status bar to NOT overlay content (solid background) to ensure status bar is visible
          // This ensures the status bar has a solid background color and system UI is visible
          await StatusBar.setOverlaysWebView({ overlay: false });
          
          // Set status bar background to match header gradient (dark blue for home page)
          // For home page, use the header gradient color; for other pages, match navigation
          // IMPORTANT: Use slightly lighter colors to ensure system UI icons are visible
          const isHomePage = currentPage === 'home';
          const statusBarColor = isShortsPage 
            ? (isDarkMode ? '#000000' : '#ffffff') // Black for dark mode, white for light mode on Shorts
            : isHomePage
              ? (!isDarkMode ? '#007AFF' : '#0a1628') // Match header gradient color for home page
              : isDarkMode 
                ? '#111827' // Match dark navigation color
                : '#ffffff'; // Match light navigation color
          
          await StatusBar.setBackgroundColor({ 
            color: statusBarColor
          });
          
          // CRITICAL: Ensure status bar style provides proper contrast for system UI icons
          // Dark Theme → Dark background → White icons → Style.Light
          // Light Theme → Light background → Black icons → Style.Dark
          // Style.Light = white icons (for dark backgrounds)
          // Style.Dark = black icons (for light backgrounds)
          // This ensures time, battery, signal icons are always visible
          const statusBarIconStyle = isDarkMode ? Style.Light : Style.Dark;
          
          await StatusBar.setStyle({ 
            style: statusBarIconStyle
          });
          
          console.log('Navigation: Status bar configured', {
            isDarkMode,
            currentPage,
            isShortsPage,
            backgroundColor: statusBarColor,
            iconStyle: isDarkMode ? 'Style.Light (white icons)' : 'Style.Dark (black icons)'
          });
          
          // Ensure status bar is visible (not hidden)
          await StatusBar.show();
        } catch (error) {
          console.error('Error updating status bar:', error);
        }
      };
      updateStatusBar();
    }
  }, [isDarkMode, isShortsPage, currentPage]);

  // Get status bar height for Android devices
  const [statusBarHeight, setStatusBarHeight] = React.useState(() => {
    // Initialize with Android default - modern devices need more space
    if (typeof window !== 'undefined' && Capacitor.isNativePlatform()) {
      const platform = Capacitor.getPlatform();
      return platform === 'android' ? 40 : 0; // Default 40px for Android (accounts for notch/status bar)
    }
    return 0;
  });
  
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Get status bar height from device info
      const getStatusBarHeight = () => {
        if (typeof window !== 'undefined') {
          // Try to get actual status bar height from the viewport
          // On Android, we can use window.visualViewport or calculate from screen metrics
          let height = 0;
          
          // Method 1: Try CSS env variable
          try {
            const testDiv = document.createElement('div');
            testDiv.style.position = 'fixed';
            testDiv.style.top = '0';
            testDiv.style.left = '0';
            testDiv.style.height = 'env(safe-area-inset-top)';
            testDiv.style.visibility = 'hidden';
            document.body.appendChild(testDiv);
            const computedHeight = window.getComputedStyle(testDiv).height;
            document.body.removeChild(testDiv);
            
            if (computedHeight && computedHeight !== '0px' && computedHeight !== 'auto') {
              height = parseInt(computedHeight.replace('px', ''), 10) || 0;
            }
          } catch (e) {
            console.log('Could not get safe area inset:', e);
          }
          
          // Method 2: Use visual viewport if available
          if (height === 0 && window.visualViewport) {
            const viewportTop = window.visualViewport.offsetTop || 0;
            if (viewportTop > 0) {
              height = viewportTop;
            }
          }
          
          // Fallback: Use platform-specific defaults
          if (height === 0) {
            const platform = Capacitor.getPlatform();
            if (platform === 'android') {
              // Modern Android devices (especially with notches) need 40-48px
              // Older devices typically have 24-32px
              // We'll use 40px as a safe default that works for most devices
              height = 40;
            } else if (platform === 'ios') {
              // iOS devices vary by model
              height = 44; // Standard iOS status bar height
            }
          }
          
          setStatusBarHeight(height);
        }
      };
      
      // Get initial height
      getStatusBarHeight();
      
      // Also listen for resize/orientation changes
      window.addEventListener('resize', getStatusBarHeight);
      window.addEventListener('orientationchange', getStatusBarHeight);
      
      // Use a small delay to ensure DOM is ready
      const timeoutId = setTimeout(getStatusBarHeight, 100);
      
      return () => {
        window.removeEventListener('resize', getStatusBarHeight);
        window.removeEventListener('orientationchange', getStatusBarHeight);
        clearTimeout(timeoutId);
      };
    }
  }, []);

  // On mobile, show minimal navigation (just logo and menu)
  const isMobile = Capacitor.isNativePlatform() || (typeof window !== 'undefined' && window.innerWidth < 768);

  // Special styling for Shorts page - adaptive background for better visibility
  // On home page, make navigation transparent to show header background
  const isHomePage = currentPage === 'home';
  const isWebApp = !Capacitor.isNativePlatform();
  
  // Market standard navigation styling for web app - using default theme colors
  const shortsNavStyle = isShortsPage 
    ? 'bg-white dark:bg-gray-900 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-lg' // Theme-responsive background
    : isHomePage && isMobile
      ? '!bg-transparent !backdrop-blur-none !border-b-0 !shadow-none' // Fully transparent on mobile home page
      : isScrolled 
        ? isWebApp
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]' 
          : 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-lg'
        : isWebApp
          ? 'bg-white dark:bg-gray-900 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm'
          : 'bg-white dark:bg-gray-900 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm';

  // Calculate padding top for native platforms
  const getPaddingTop = () => {
    if (!Capacitor.isNativePlatform()) {
      return '0px';
    }
    
    const platform = Capacitor.getPlatform();
    
    // For Android, use a higher minimum to account for status bar + notch
    // Modern Android devices need 40-48px, we'll use 40px as safe default
    const minPadding = platform === 'android' ? 40 : (platform === 'ios' ? 44 : 0);
    
    // Use calculated status bar height if available, otherwise use minimum
    const finalHeight = statusBarHeight > 0 ? Math.max(statusBarHeight, minPadding) : minPadding;
    
    return `${finalHeight}px`;
  };

  // Enhanced scroll effects for web app
  const scrollShadowStyle = isWebApp && isScrolled && !isShortsPage && !(isHomePage && isMobile)
    ? {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.05)',
      }
    : {};

  return (
    <nav 
      id="top-navigation-bar"
      className={`fixed left-0 right-0 z-[99999] transition-all duration-200 ${shortsNavStyle}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        width: '100%',
        maxWidth: '100vw',
        paddingTop: Capacitor.isNativePlatform() ? getPaddingTop() : '0px',
        paddingBottom: '0px',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        willChange: 'transform',
        isolation: 'isolate',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'stretch',
        visibility: 'visible',
        opacity: 1,
        boxSizing: 'border-box',
        margin: 0,
        paddingLeft: 0,
        paddingRight: 0,
        pointerEvents: 'auto',
        overflow: 'visible',
        backgroundColor: isShortsPage ? undefined : (isHomePage && isMobile ? 'transparent' : undefined),
        ...scrollShadowStyle,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ marginTop: 0, marginBottom: 0 }}>
        <div 
          className="flex justify-between items-center transition-all duration-200"
          style={{
            minHeight: '70px',
            height: '70px',
            alignItems: 'center',
            justifyContent: 'space-between',
            display: 'flex',
            flexDirection: 'row',
            paddingTop: '0px',
            paddingBottom: '0px',
            marginTop: '0px',
            marginBottom: '0px',
          }}
        >
          {/* Logo and WhatsApp */}
          <div className={`flex items-center ${isWebApp ? 'gap-3' : 'gap-1.5'}`} style={{ alignItems: 'center', justifyContent: 'flex-start', flexShrink: 0, zIndex: 100001 }}>
            <div 
              className={`flex items-center cursor-pointer group ${isHomePage && isMobile ? 'bg-white/10 dark:bg-black/20 rounded-lg px-2 py-1 backdrop-blur-sm' : ''}`}
              onClick={() => onNavigate('home')}
              style={{ alignItems: 'center', display: 'flex', flexShrink: 0, position: 'relative', zIndex: 100001 }}
            >
              {/* Logo Image */}
              <img 
                src="/logo/NavLogo.png" 
                alt="Facto Logo" 
                className={`${isMobile ? 'h-8 w-8' : (isWebApp ? 'h-9 w-9' : 'h-8 w-8')} object-contain transition-all duration-200 group-hover:scale-105`}
                style={{ 
                  display: 'block', 
                  flexShrink: 0,
                  visibility: 'visible',
                  opacity: 1,
                  zIndex: 100000,
                  filter: isHomePage && isMobile ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none'
                }}
                onError={(e) => {
                  // Fallback to default if logo not found
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              {/* Fallback to default logo if image not found */}
              <div className={`${isMobile ? 'w-8 h-8' : (isWebApp ? 'w-9 h-9' : 'w-8 h-8')} bg-gradient-to-br from-[#007AFF] to-[#0056CC] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105 hidden`}>
                <span className="text-white font-bold text-base">F</span>
              </div>
              {/* Enhanced FACTO Text - Always visible with proper contrast */}
              <span className={`${isMobile ? 'ml-2' : (isWebApp ? 'ml-3' : 'ml-2')} relative inline-block`}>
                <span className={`relative z-10 ${isMobile ? 'text-lg' : (isWebApp ? 'text-xl' : 'text-xl')} ${isWebApp ? 'font-bold' : 'font-extrabold'} tracking-tight ${
                  isShortsPage
                    ? isDarkMode 
                      ? 'text-[#60A5FA]' // Bright blue for dark mode
                      : 'text-[#007AFF]' // Blue for light mode on Shorts
                    : isDarkMode 
                      ? 'text-white' // White text for dark mode
                      : 'bg-gradient-to-r from-[#007AFF] via-[#00C897] to-[#007AFF] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-x group-hover:from-[#00C897] group-hover:via-[#007AFF] group-hover:to-[#00C897] transition-all duration-500'
                }`}>
                  FACTO
                </span>
                {/* Subtle glow effect on hover - only for light mode and non-Shorts */}
                {!isDarkMode && !isShortsPage && (
                  <span className={`absolute inset-0 ${isMobile ? 'text-lg' : 'text-2xl'} font-extrabold bg-gradient-to-r from-[#007AFF] via-[#00C897] to-[#007AFF] bg-clip-text text-transparent opacity-0 group-hover:opacity-30 blur-sm transition-opacity duration-500 pointer-events-none`}>
                    FACTO
                  </span>
                )}
              </span>
            </div>
            
            {/* WhatsApp Button - Mobile Only */}
            {isMobile && (
              <button
                onClick={() => {
                  const phoneNumber = getWhatsAppNumber();
                  const message = getDefaultWhatsAppMessage();
                  const formattedPhone = phoneNumber.replace(/[^\d+]/g, '');
                  const encodedMessage = encodeURIComponent(message);
                  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
                  
                  if (Capacitor.isNativePlatform()) {
                    Browser.open({ 
                      url: whatsappUrl,
                      toolbarColor: '#25D366'
                    });
                  } else {
                    window.open(whatsappUrl, '_blank');
                  }
                }}
                className="w-10 h-10 bg-[#25D366] hover:bg-[#20BA5A] active:bg-[#1DA851] text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 flex-shrink-0"
                style={{ minWidth: '40px', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Chat on WhatsApp"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </button>
            )}
          </div>
          
          {/* Desktop Navigation - Hidden on mobile */}
          <div 
            className={`${isMobile ? 'hidden' : 'hidden md:flex'} items-center`} 
            style={{ 
              alignItems: 'center', 
              display: isMobile ? 'none' : 'flex',
              gap: '1.5rem' // Consistent spacing matching screenshot
            }}
          >
            <button 
              onClick={() => onNavigate('home')}
              className={`relative px-4 py-2 rounded-lg transition-all duration-200 ${
                currentPage === 'home' 
                  ? isShortsPage 
                    ? isDarkMode
                      ? 'text-white bg-white/20'
                      : 'text-[#007AFF] bg-blue-50'
                    : isDarkMode
                      ? 'text-white bg-[#1e3a5f]'
                      : 'text-[#007AFF] bg-blue-50'
                  : isShortsPage
                    ? isDarkMode
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-gray-700 hover:text-[#007AFF] hover:bg-gray-100'
                    : isDarkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                      : 'text-gray-700 hover:text-[#007AFF] hover:bg-gray-100'
              }`}
            >
              <span className="text-[15px] font-medium">Home</span>
            </button>
            <button 
              onClick={() => onNavigate('services')}
              className={`relative px-4 py-2 rounded-lg transition-all duration-200 ${
                currentPage === 'services' 
                  ? isShortsPage 
                    ? isDarkMode
                      ? 'text-white bg-white/20'
                      : 'text-[#007AFF] bg-blue-50'
                    : isDarkMode
                      ? 'text-white bg-[#1e3a5f]'
                      : 'text-[#007AFF] bg-blue-50'
                  : isShortsPage
                    ? isDarkMode
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-gray-700 hover:text-[#007AFF] hover:bg-gray-100'
                    : isDarkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                      : 'text-gray-700 hover:text-[#007AFF] hover:bg-gray-100'
              }`}
            >
              <span className="text-[15px] font-medium">Services</span>
            </button>
            <button 
              onClick={() => onNavigate('learning')}
              className={`relative px-4 py-2 rounded-lg transition-all duration-200 ${
                currentPage === 'learning' 
                  ? isShortsPage 
                    ? isDarkMode
                      ? 'text-white bg-white/20'
                      : 'text-[#007AFF] bg-blue-50'
                    : isDarkMode
                      ? 'text-white bg-[#1e3a5f]'
                      : 'text-[#007AFF] bg-blue-50'
                  : isShortsPage
                    ? isDarkMode
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-gray-700 hover:text-[#007AFF] hover:bg-gray-100'
                    : isDarkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                      : 'text-gray-700 hover:text-[#007AFF] hover:bg-gray-100'
              }`}
            >
              <span className="text-[15px] font-medium">Learning</span>
            </button>
            <button 
              onClick={() => onNavigate('shorts')}
              className={`relative px-4 py-2 rounded-lg transition-all duration-200 ${
                currentPage === 'shorts' 
                  ? isShortsPage 
                    ? isDarkMode
                      ? 'text-white bg-white/20'
                      : 'text-[#007AFF] bg-blue-50'
                    : isDarkMode
                      ? 'text-white bg-[#1e3a5f]'
                      : 'text-[#007AFF] bg-blue-50'
                  : isShortsPage
                    ? isDarkMode
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-gray-700 hover:text-[#007AFF] hover:bg-gray-100'
                    : isDarkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                      : 'text-gray-700 hover:text-[#007AFF] hover:bg-gray-100'
              }`}
            >
              <span className="text-[15px] font-medium">Shorts</span>
            </button>
            <button 
              onClick={() => onNavigate('updates')}
              className={`relative px-4 py-2 rounded-lg transition-all duration-200 ${
                currentPage === 'updates' 
                  ? isShortsPage 
                    ? isDarkMode
                      ? 'text-white bg-white/20'
                      : 'text-[#007AFF] bg-blue-50'
                    : isDarkMode
                      ? 'text-white bg-[#1e3a5f]'
                      : 'text-[#007AFF] bg-blue-50'
                  : isShortsPage
                    ? isDarkMode
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-gray-700 hover:text-[#007AFF] hover:bg-gray-100'
                    : isDarkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                      : 'text-gray-700 hover:text-[#007AFF] hover:bg-gray-100'
              }`}
            >
              <span className="text-[15px] font-medium">Updates</span>
            </button>
            
            {/* Dark Mode Toggle Icon - Only for Web App */}
            {isWebApp && (
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isDarkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            )}
            
            {/* Auth Buttons */}
            <div className={`flex items-center ${isWebApp ? 'gap-4' : 'gap-2'}`}>
              {isAuthenticated ? (
                // User is logged in - show profile and logout
                <>
                  <button 
                    onClick={() => onNavigate('profile')}
                    className={`${isWebApp ? 'px-3 py-1.5' : 'px-2 py-1'} rounded-lg transition-all duration-200 ${
                      currentPage === 'profile' 
                        ? isWebApp
                          ? 'text-[#007AFF] font-semibold bg-blue-50 dark:bg-blue-900/30'
                          : 'text-[#007AFF] bg-blue-50 dark:bg-blue-900/30'
                        : isWebApp
                          ? 'text-gray-700 dark:text-gray-300 hover:text-[#007AFF] hover:bg-gray-100 dark:hover:bg-gray-800/50 font-medium'
                          : 'text-gray-800 dark:text-white hover:text-[#007AFF] hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className={isWebApp ? 'text-[15px]' : ''}>Profile</span>
                  </button>
                  <button
                    onClick={logout}
                    className={`${isWebApp ? 'px-3 py-1.5' : 'px-2 py-1'} text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 rounded-lg transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium`}
                  >
                    <span className={isWebApp ? 'text-[15px]' : ''}>Logout</span>
                  </button>
                </>
              ) : (
                // User is not logged in - show login and signup
                <>
                  <button 
                    onClick={() => onNavigate('login')}
                    className={`px-4 py-1.5 rounded-lg transition-all duration-200 font-medium ${
                      isDarkMode
                        ? 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                        : 'text-gray-700 hover:text-[#007AFF] hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-[15px]">Login</span>
                  </button>
                  <button
                    onClick={() => onNavigate('signup')}
                    className="px-5 py-2 bg-gradient-to-r from-[#007AFF] to-[#0056CC] text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5 transition-all duration-200 font-semibold hover:from-[#0056CC] hover:to-[#0041A3]"
                  >
                    <span className="text-[15px]">Sign Up</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Hamburger menu removed - Mobile apps use bottom tab bar navigation instead */}
        </div>

        {/* Mobile Navigation Menu - Removed: Mobile apps use bottom tab bar navigation instead */}
      </div>
      
      {/* Animation Styles */}
      <style>{`
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </nav>
  );
}
