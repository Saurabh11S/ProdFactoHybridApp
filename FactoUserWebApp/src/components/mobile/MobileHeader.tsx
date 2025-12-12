import React from 'react';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useAuth } from '../../contexts/AuthContext';
import { useDarkMode } from '../DarkModeContext';
import { getWhatsAppNumber, getDefaultWhatsAppMessage } from '../../config/whatsappConfig';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile' | 'course-payment' | 'course-details' | 'terms' | 'privacy';

interface MobileHeaderProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
}

export function MobileHeader({ currentPage, onNavigate }: MobileHeaderProps) {
  const { isAuthenticated, user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // Determine if we're on home page - needed for status bar configuration
  const isHomePage = currentPage === 'home';

  // Configure status bar based on theme - CRITICAL: Keep system UI visible
  React.useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const configureStatusBar = async () => {
        try {
          // Determine status bar background color based on theme
          // Light theme: Blue everywhere (#007AFF)
          // Dark theme: Light white mixed with dark bluish (#E8EBF0)
          const statusBarBgColor = isDarkMode 
            ? '#E8EBF0' // Light white mixed with dark bluish for dark theme
            : '#007AFF'; // Blue for light theme everywhere
          
          // CRITICAL: Set overlay to FALSE FIRST to ensure system UI (time, battery) is always visible
          // overlay: false = status bar has its own space, system UI icons are always visible
          // overlay: true = status bar overlays content, can hide system UI icons
          await StatusBar.setOverlaysWebView({ overlay: false });
          
          // Small delay to ensure overlay setting is applied
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Set status bar background color to match header
          await StatusBar.setBackgroundColor({ 
            color: statusBarBgColor
          });
          
          // Small delay to ensure background color is applied before setting style
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // CRITICAL: Status bar icon style configuration
          // Dark Theme → Light white/bluish background → BLACK icons → Style.Dark (for visibility on light background)
          // Light Theme → Blue background → BLACK icons → Style.Dark
          // Style.Light = white icons (for dark backgrounds)
          // Style.Dark = black icons (for light backgrounds)
          const statusBarIconStyle = Style.Dark; // Black icons for both themes (light backgrounds)
          
          // Set style multiple times with delays to ensure it sticks
          await StatusBar.setStyle({ style: statusBarIconStyle });
          await new Promise(resolve => setTimeout(resolve, 100));
          await StatusBar.setStyle({ style: statusBarIconStyle });
          await new Promise(resolve => setTimeout(resolve, 100));
          await StatusBar.setStyle({ style: statusBarIconStyle });
          
          // CRITICAL: Always ensure status bar is visible and shown
          await StatusBar.show();
          
          // Final enforcement: Set style again after showing to ensure it sticks
          await new Promise(resolve => setTimeout(resolve, 150));
          await StatusBar.setStyle({ style: statusBarIconStyle });
          
          console.log('MobileHeader: Status bar configured', { 
            isDarkMode, 
            isHomePage,
            currentPage,
            backgroundColor: statusBarBgColor,
            iconStyle: 'Style.Dark (black icons)', // Black icons for light backgrounds in both themes
            iconStyleValue: 'Dark',
            overlay: false
          });
        } catch (error) {
          console.error('Error configuring status bar:', error);
          // Fallback: Try to show status bar even if configuration fails
          try {
            await StatusBar.setOverlaysWebView({ overlay: false });
            await StatusBar.show();
            const fallbackIconStyle = Style.Dark; // Black icons for light backgrounds
            await StatusBar.setStyle({ style: fallbackIconStyle });
            console.log('MobileHeader: Fallback status bar configured', {
              iconStyle: 'Style.Dark (black icons)'
            });
          } catch (fallbackError) {
            console.error('Fallback status bar configuration failed:', fallbackError);
          }
        }
      };
      
      // Run immediately
      configureStatusBar();
      
      // Also run after a short delay to ensure it sticks, especially on navigation
      const timeoutId = setTimeout(() => {
        configureStatusBar();
      }, 200);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isDarkMode, currentPage, isHomePage]);

  // Debug logging
  React.useEffect(() => {
    console.log('MobileHeader: Component rendered', {
      isNative: Capacitor.isNativePlatform(),
      platform: Capacitor.getPlatform(),
      currentPage,
      isAuthenticated,
      isDarkMode
    });
  }, [currentPage, isAuthenticated, isDarkMode]);

  // Ensure header stays visible during scroll - Force visibility
  React.useEffect(() => {
    const headerElement = document.getElementById('mobile-header');
    if (headerElement) {
      // Force header to stay visible
      const ensureVisibility = () => {
        headerElement.style.position = 'fixed';
        headerElement.style.top = '0';
        headerElement.style.zIndex = '99999';
        headerElement.style.visibility = 'visible';
        headerElement.style.opacity = '1';
        headerElement.style.display = 'block';
        headerElement.style.transform = 'translateZ(0)';
        headerElement.style.webkitTransform = 'translateZ(0)';
      };

      // Ensure visibility on mount
      ensureVisibility();

      // Ensure visibility on scroll (in case something tries to hide it)
      const handleScroll = () => {
        ensureVisibility();
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('touchmove', handleScroll, { passive: true });

      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('touchmove', handleScroll);
      };
    }
  }, []);

  // CRITICAL: Update status bar immediately when theme changes (toggle click)
  React.useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const updateStatusBarOnThemeChange = async () => {
        try {
          // Determine status bar background color based on theme
          // Light theme: Blue everywhere (#007AFF)
          // Dark theme: Light white mixed with dark bluish (#E8EBF0)
          const statusBarBgColor = isDarkMode 
            ? '#E8EBF0' // Light white mixed with dark bluish for dark theme
            : '#007AFF'; // Blue for light theme everywhere
          
          // Set overlay to false FIRST to ensure system UI is visible
          await StatusBar.setOverlaysWebView({ overlay: false });
          
          // Small delay to ensure overlay setting is applied
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Set status bar background color
          await StatusBar.setBackgroundColor({ 
            color: statusBarBgColor
          });
          
          // Small delay to ensure background color is applied before setting style
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // CRITICAL: Status bar icon style configuration
          // Dark Theme → Dark background → WHITE icons → Style.Light (MUST be white)
          // Light Theme → Light/Blue background → BLACK icons → Style.Dark
          const iconStyle = isDarkMode ? Style.Light : Style.Dark;
          
          // Set style multiple times with delays to ensure it sticks
          await StatusBar.setStyle({ style: iconStyle });
          await new Promise(resolve => setTimeout(resolve, 100));
          await StatusBar.setStyle({ style: iconStyle });
          await new Promise(resolve => setTimeout(resolve, 100));
          await StatusBar.setStyle({ style: iconStyle });
          
          // Ensure status bar is visible
          await StatusBar.show();
          
          // Final enforcement: Set style again after showing to ensure it sticks
          await new Promise(resolve => setTimeout(resolve, 150));
          await StatusBar.setStyle({ style: iconStyle });
          
          console.log('MobileHeader: Status bar updated on theme change', {
            isDarkMode,
            iconStyle: 'Style.Dark (black icons)', // Black icons for light backgrounds in both themes
            backgroundColor: statusBarBgColor,
            currentPage
          });
        } catch (error) {
          console.error('Error updating status bar on theme change:', error);
        }
      };

      // Update immediately when theme changes
      updateStatusBarOnThemeChange();
      
      // Also update after a short delay to ensure it sticks
      const timeoutId = setTimeout(updateStatusBarOnThemeChange, 200);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isDarkMode, isHomePage, currentPage]);

  // Ensure status bar stays visible on page navigation - Additional safeguard
  React.useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const ensureStatusBarVisible = async () => {
        try {
          // Determine status bar background color based on theme
          // Light theme: Blue everywhere (#007AFF)
          // Dark theme: Light white mixed with dark bluish (#E8EBF0)
          const statusBarBgColor = isDarkMode 
            ? '#E8EBF0' // Light white mixed with dark bluish for dark theme
            : '#007AFF'; // Blue for light theme everywhere
          
          // CRITICAL: Set overlay to false FIRST to ensure system UI is visible
          await StatusBar.setOverlaysWebView({ overlay: false });
          
          // Small delay to ensure overlay setting is applied
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Set background color
          await StatusBar.setBackgroundColor({ color: statusBarBgColor });
          
          // Small delay to ensure background color is applied
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Always ensure status bar is shown and visible
          await StatusBar.show();
          
          // CRITICAL: Status bar icon style configuration
          // Dark Theme → Dark background → WHITE icons → Style.Light (MUST be white)
          // Light Theme → Light/Blue background → BLACK icons → Style.Dark
          const iconStyle = isDarkMode ? Style.Light : Style.Dark;
          
          // Set style multiple times with delays to ensure it sticks
          await StatusBar.setStyle({ style: iconStyle });
          await new Promise(resolve => setTimeout(resolve, 100));
          await StatusBar.setStyle({ style: iconStyle });
          await new Promise(resolve => setTimeout(resolve, 100));
          await StatusBar.setStyle({ style: iconStyle });
          
          // Final enforcement: Set style again after showing to ensure it sticks
          await new Promise(resolve => setTimeout(resolve, 150));
          await StatusBar.setStyle({ style: iconStyle });
          
          console.log('MobileHeader: Status bar visibility ensured', {
            isDarkMode,
            isHomePage,
            currentPage,
            backgroundColor: statusBarBgColor,
            iconStyle: isDarkMode ? 'Style.Light (white)' : 'Style.Dark (black)',
          });
        } catch (error) {
          console.error('Error ensuring status bar visibility:', error);
        }
      };

      // Run immediately and also after a short delay to catch any late updates
      ensureStatusBarVisible();
      const timeoutId = setTimeout(ensureStatusBarVisible, 200);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentPage, isDarkMode, isHomePage]);

  const handleWhatsAppClick = () => {
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
  };

  const handleProfileClick = () => {
    if (isAuthenticated) {
      onNavigate('profile');
    } else {
      onNavigate('login');
    }
  };

  // Handle dark mode toggle with immediate status bar update
  const handleDarkModeToggle = async () => {
    // Toggle the theme first
    toggleDarkMode();
    
    // Immediately update status bar after toggle
    if (Capacitor.isNativePlatform()) {
      // Use setTimeout to ensure theme state has updated
      setTimeout(async () => {
        try {
          const newDarkMode = !isDarkMode; // Get the new state after toggle
          // Light theme: Blue everywhere (#007AFF)
          // Dark theme: Dark bluish everywhere (#0a1628)
          const statusBarBgColor = newDarkMode 
            ? '#0a1628' // Dark bluish for dark theme
            : '#007AFF'; // Blue for light theme everywhere
          
          // CRITICAL: Set overlay to false FIRST to ensure system UI is visible
          await StatusBar.setOverlaysWebView({ overlay: false });
          
          // Small delay to ensure overlay setting is applied
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Set background color
          await StatusBar.setBackgroundColor({ color: statusBarBgColor });
          
          // Small delay to ensure background color is applied before setting style
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // CRITICAL: Status bar icon style configuration
          // Dark Theme → Dark background → WHITE icons → Style.Light (MUST be white)
          // Light Theme → Light/Blue background → BLACK icons → Style.Dark
          const iconStyle = newDarkMode ? Style.Light : Style.Dark;
          
          // Set style multiple times with delays to ensure it sticks
          await StatusBar.setStyle({ style: iconStyle });
          await new Promise(resolve => setTimeout(resolve, 100));
          await StatusBar.setStyle({ style: iconStyle });
          await new Promise(resolve => setTimeout(resolve, 100));
          await StatusBar.setStyle({ style: iconStyle });
          
          // Ensure status bar is visible
          await StatusBar.show();
          
          // Final enforcement: Set style again after showing to ensure it sticks
          await new Promise(resolve => setTimeout(resolve, 150));
          await StatusBar.setStyle({ style: iconStyle });
          
          console.log('MobileHeader: Status bar updated on toggle click', {
            newDarkMode,
            iconStyle: newDarkMode ? 'Style.Light (white icons)' : 'Style.Dark (black icons)',
            backgroundColor: statusBarBgColor
          });
        } catch (error) {
          console.error('Error updating status bar on toggle:', error);
        }
      }, 100); // Small delay to ensure state has updated
    }
  };
  
  return (
    <header 
      id="mobile-header"
      data-mobile-header="true"
      className={`fixed top-0 left-0 right-0 z-[99999] border-b shadow-md ${
        isHomePage 
          ? 'border-transparent' // Transparent border on home page, but keep background for visibility
          : isDarkMode 
            ? 'border-gray-700/30' // Dark bluish background set inline
            : 'border-blue-200/50' // Light bluish/whitish background set inline
      }`}
      style={{
        paddingTop: Capacitor.isNativePlatform() 
          ? 'max(env(safe-area-inset-top, 24px), 24px)' 
          : '0px',
        minHeight: Capacitor.isNativePlatform()
          ? 'calc(4rem + max(env(safe-area-inset-top, 24px), 24px))'
          : '4rem',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        maxWidth: '100vw',
        backgroundColor: isDarkMode 
          ? (isHomePage 
              ? 'rgba(232, 235, 240, 0.95)' // Light white mixed with dark bluish with transparency on home page
              : '#E8EBF0') // Light white mixed with dark bluish for dark theme
          : 'rgba(0, 122, 255, 0.95)', // Blue (#007AFF) everywhere for light theme
        backdropFilter: isDarkMode && isHomePage ? 'blur(10px)' : (!isDarkMode ? 'blur(10px)' : 'none'), // Add blur for light theme and home page dark theme
        WebkitBackdropFilter: isDarkMode && isHomePage ? 'blur(10px)' : (!isDarkMode ? 'blur(10px)' : 'none'),
        zIndex: 99999,
        display: 'block',
        visibility: 'visible',
        opacity: 1,
        boxSizing: 'border-box',
        transform: 'translateZ(0)', // Hardware acceleration
        WebkitTransform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        willChange: 'transform',
        isolation: 'isolate', // Create new stacking context
        pointerEvents: 'auto',
        overflow: 'visible',
        margin: 0,
        paddingLeft: 0,
        paddingRight: 0
      }}
    >
      <div 
        className="flex items-center justify-between px-4 relative" 
        style={{ 
          height: '4rem',
          minHeight: '4rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative'
        }}
      >
        {/* Left: WhatsApp Icon */}
        <button
          onClick={handleWhatsAppClick}
          className="w-10 h-10 bg-[#25D366] hover:bg-[#20BA5A] active:bg-[#1DA851] text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 flex-shrink-0"
          style={{ 
            minWidth: '40px', 
            minHeight: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            zIndex: 1
          }}
          aria-label="Chat on WhatsApp"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </button>

        {/* Center: Facto Logo - Absolutely positioned for true center alignment */}
        <div 
          className="flex items-center cursor-pointer group absolute left-1/2 transform -translate-x-1/2"
          onClick={() => onNavigate('home')}
          style={{ 
            alignItems: 'center', 
            display: 'flex', 
            justifyContent: 'center',
            zIndex: 1
          }}
        >
          <img 
            src="/logo/NewLOGO.png" 
            alt="Facto Logo" 
            className="h-16 w-16 object-contain transition-all duration-200 group-hover:scale-105"
            style={{ 
              display: 'block', 
              flexShrink: 0,
              visibility: 'visible',
              opacity: 1,
              filter: isDarkMode 
                ? 'brightness(1.15) drop-shadow(0 2px 6px rgba(255,255,255,0.15))' 
                : 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          {/* Fallback to default logo if image not found */}
          <div className="w-16 h-16 bg-gradient-to-br from-[#007AFF] to-[#0056CC] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105 hidden">
            <span className="text-white font-bold text-2xl">F</span>
          </div>
        </div>

        {/* Right: Dark Mode Toggle and Profile Icon */}
        <div 
          className="flex items-center gap-2"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0,
            zIndex: 1
          }}
        >
                      {/* Dark Mode Toggle */}
                      <button
                        onClick={handleDarkModeToggle}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
              isDarkMode ? 'hover:bg-white/10' : 'hover:bg-white/20' // Hover effect for dark/light theme
            }`}
            style={{ 
              minWidth: '40px', 
              minHeight: '40px',
              // Ensure icon is always visible
              zIndex: 10
            }}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <svg 
                className="w-5 h-5 text-gray-800" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg 
                className="w-5 h-5 text-white drop-shadow-lg" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Profile Icon */}
          <button
            onClick={handleProfileClick}
            className={`relative transition-all duration-200 flex-shrink-0 rounded-full ${
              isDarkMode ? 'hover:bg-white/10' : 'hover:bg-white/20' // Hover effect for dark/light theme
            }`}
            style={{ 
              minWidth: '40px', 
              minHeight: '40px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0,
              zIndex: 10
            }}
            aria-label={isAuthenticated ? "Profile" : "Login"}
          >
            {isAuthenticated ? (
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm bg-gradient-to-br from-[#007AFF] to-[#00C897] border-2 text-white shadow-lg ${
                isDarkMode ? 'border-white/30' : 'border-white/50'
              }`} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                flexShrink: 0,
                width: '40px',
                height: '40px',
                filter: !isDarkMode ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'none'
              }}>
                {user?.fullName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            ) : (
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-lg ${
                isDarkMode 
                  ? 'bg-gray-200/50 border-gray-300/50 text-gray-800' // Dark icon on light header background for dark theme
                  : 'bg-white/30 border-white/50 text-white' // White icon on blue background for light theme
              }`} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                flexShrink: 0,
                width: '40px',
                height: '40px',
                filter: !isDarkMode ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'none'
              }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

