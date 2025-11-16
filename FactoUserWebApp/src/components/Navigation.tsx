import { useState, useEffect } from 'react';
import { useDarkMode } from './DarkModeContext';
import { useAuth } from '../contexts/AuthContext';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile' | 'course-payment' | 'course-details';

interface NavigationProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  isShortsPage?: boolean;
}

export function Navigation({ currentPage, onNavigate, isShortsPage = false }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { logout, isAuthenticated, user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update status bar for mobile
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const updateStatusBar = async () => {
        try {
          // Set status bar to overlay content (transparent) so we can handle padding ourselves
          await StatusBar.setOverlaysWebView({ overlay: true });
          await StatusBar.setStyle({ 
            style: isDarkMode ? Style.Dark : Style.Light 
          });
          await StatusBar.setBackgroundColor({ 
            color: isDarkMode ? '#1a1a1a' : '#ffffff' 
          });
        } catch (error) {
          console.error('Error updating status bar:', error);
        }
      };
      updateStatusBar();
    }
  }, [isDarkMode]);

  // On mobile, show minimal navigation (just logo and menu)
  const isMobile = Capacitor.isNativePlatform() || (typeof window !== 'undefined' && window.innerWidth < 768);

  // Special styling for Shorts page - transparent dark overlay
  const shortsNavStyle = isShortsPage 
    ? 'bg-black/60 dark:bg-black/60 backdrop-blur-md border-b border-white/10 shadow-none'
    : isScrolled 
      ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg' 
      : 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${shortsNavStyle} ${Capacitor.isNativePlatform() ? 'pt-safe-nav' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center transition-all duration-300 ${
          isScrolled ? 'h-14' : 'h-16'
        }`}>
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer group"
            onClick={() => onNavigate('home')}
          >
            {/* Logo Image */}
            <img 
              src="/logo/NavLogo.png" 
              alt="Facto Logo" 
              className="h-10 w-10 object-contain transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
              onError={(e) => {
                // Fallback to default if logo not found
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            {/* Fallback to default logo if image not found */}
            <div className="w-10 h-10 bg-gradient-to-br from-[#007AFF] to-[#0056CC] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 hidden">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            {/* Enhanced FACTO Text */}
            <span className="ml-3 relative inline-block">
              <span className="relative z-10 text-2xl font-extrabold bg-gradient-to-r from-[#007AFF] via-[#00C897] to-[#007AFF] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-x group-hover:from-[#00C897] group-hover:via-[#007AFF] group-hover:to-[#00C897] transition-all duration-500 tracking-tight">
                FACTO
              </span>
              {/* Subtle glow effect on hover */}
              <span className="absolute inset-0 text-2xl font-extrabold bg-gradient-to-r from-[#007AFF] via-[#00C897] to-[#007AFF] bg-clip-text text-transparent opacity-0 group-hover:opacity-30 blur-sm transition-opacity duration-500 pointer-events-none">
                FACTO
              </span>
            </span>
          </div>
          
          {/* Desktop Navigation - Hidden on mobile */}
          <div className={`${isMobile ? 'hidden' : 'hidden md:flex'} items-center space-x-8`}>
            <button 
              onClick={() => onNavigate('home')}
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                currentPage === 'home' 
                  ? isShortsPage 
                    ? 'text-white bg-white/20' 
                    : 'text-[#007AFF] bg-blue-50 dark:bg-blue-900/30'
                  : isShortsPage
                    ? 'text-white/80 hover:text-white hover:bg-white/10'
                    : 'text-gray-800 dark:text-white hover:text-[#007AFF] hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              Home
            </button>
            <button 
              onClick={() => onNavigate('services')}
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                currentPage === 'services' 
                  ? isShortsPage 
                    ? 'text-white bg-white/20' 
                    : 'text-[#007AFF] bg-blue-50 dark:bg-blue-900/30'
                  : isShortsPage
                    ? 'text-white/80 hover:text-white hover:bg-white/10'
                    : 'text-gray-800 dark:text-white hover:text-[#007AFF] hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              Services
            </button>
            <button 
              onClick={() => onNavigate('learning')}
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                currentPage === 'learning' 
                  ? isShortsPage 
                    ? 'text-white bg-white/20' 
                    : 'text-[#007AFF] bg-blue-50 dark:bg-blue-900/30'
                  : isShortsPage
                    ? 'text-white/80 hover:text-white hover:bg-white/10'
                    : 'text-gray-800 dark:text-white hover:text-[#007AFF] hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              Learning
            </button>
            <button 
              onClick={() => onNavigate('shorts')}
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                currentPage === 'shorts' 
                  ? isShortsPage 
                    ? 'text-white bg-white/20' 
                    : 'text-[#007AFF] bg-blue-50 dark:bg-blue-900/30'
                  : isShortsPage
                    ? 'text-white/80 hover:text-white hover:bg-white/10'
                    : 'text-gray-800 dark:text-white hover:text-[#007AFF] hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              Shorts
            </button>
            <button 
              onClick={() => onNavigate('updates')}
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                currentPage === 'updates' 
                  ? isShortsPage 
                    ? 'text-white bg-white/20' 
                    : 'text-[#007AFF] bg-blue-50 dark:bg-blue-900/30'
                  : isShortsPage
                    ? 'text-white/80 hover:text-white hover:bg-white/10'
                    : 'text-gray-800 dark:text-white hover:text-[#007AFF] hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              Updates
            </button>
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isShortsPage 
                  ? 'text-white/80 hover:text-white hover:bg-white/10' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
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
            
            <span className="text-gray-300 dark:text-gray-600">|</span>
            {isAuthenticated ? (
              // User is logged in - show profile and logout
              <>
                <button 
                  onClick={() => onNavigate('profile')}
                  className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                    currentPage === 'profile' 
                      ? 'text-[#007AFF] bg-blue-50 dark:bg-blue-900/30' 
                      : 'text-gray-800 dark:text-white hover:text-[#007AFF] hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  Profile
                </button>
                <button
                  onClick={logout}
                  className="text-red-400 hover:text-red-300 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Logout
                </button>
              </>
            ) : (
              // User is not logged in - show login and signup
              <>
                <button 
                  onClick={() => onNavigate('login')}
                  className="text-gray-800 dark:text-white hover:text-[#007AFF] px-3 py-2 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Login
                </button>
                <button
                  onClick={() => onNavigate('signup')}
                  className="bg-gradient-to-r from-[#007AFF] to-[#0056CC] text-white px-6 py-2.5 rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium hover:from-[#0056CC] hover:to-[#0041A3]"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button - Show on mobile */}
          <div className={`${isMobile ? 'flex' : 'md:hidden flex'} items-center space-x-2`}>
            {/* Mobile Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isShortsPage 
                  ? 'text-white/80 hover:text-white hover:bg-white/10' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
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
            
            {/* Profile Icon Button - Gmail Style (Replaces hamburger menu) */}
            <button
              onClick={() => {
                if (isAuthenticated) {
                  onNavigate('profile');
                } else {
                  onNavigate('login');
                }
              }}
              className={`relative transition-all duration-200 ${
                isShortsPage 
                  ? 'hover:bg-white/10' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              } rounded-full`}
              aria-label={isAuthenticated ? "Profile" : "Login"}
            >
              {isAuthenticated ? (
                // Show user's profile picture or initial
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                  isShortsPage 
                    ? 'bg-white/20 border-2 border-white/30' 
                    : 'bg-gradient-to-br from-[#007AFF] to-[#00C897] border-2 border-white dark:border-gray-700'
                } shadow-lg`}>
                  {user?.fullName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              ) : (
                // Show default profile icon for unauthenticated users
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isShortsPage 
                    ? 'bg-white/20 border-2 border-white/30 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-600 text-gray-600 dark:text-gray-300'
                } shadow-lg`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className={`md:hidden py-4 border-t backdrop-blur-md ${
            isShortsPage 
              ? 'border-white/10 bg-black/80' 
              : 'border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95'
          }`}>
            <div className="flex flex-col space-y-3">
              <button 
                onClick={() => {
                  onNavigate('home');
                  setIsMobileMenuOpen(false);
                }}
                className={`text-left px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentPage === 'home' 
                    ? isShortsPage 
                      ? 'text-white bg-white/20' 
                      : 'text-[#007AFF] bg-blue-50 dark:bg-blue-900/30'
                    : isShortsPage
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-gray-800 dark:text-white hover:text-[#007AFF] hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                Home
              </button>
              <button 
                onClick={() => {
                  onNavigate('services');
                  setIsMobileMenuOpen(false);
                }}
                className={`text-left px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentPage === 'services' 
                    ? isShortsPage 
                      ? 'text-white bg-white/20' 
                      : 'text-[#007AFF] bg-blue-50 dark:bg-blue-900/30'
                    : isShortsPage
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-gray-800 dark:text-white hover:text-[#007AFF] hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                Services
              </button>
              <button 
                onClick={() => {
                  onNavigate('learning');
                  setIsMobileMenuOpen(false);
                }}
                className={`text-left px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentPage === 'learning' 
                    ? isShortsPage 
                      ? 'text-white bg-white/20' 
                      : 'text-[#007AFF] bg-blue-50 dark:bg-blue-900/30'
                    : isShortsPage
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-gray-800 dark:text-white hover:text-[#007AFF] hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                Learning
              </button>
              <button 
                onClick={() => {
                  onNavigate('shorts');
                  setIsMobileMenuOpen(false);
                }}
                className={`text-left px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentPage === 'shorts' 
                    ? isShortsPage 
                      ? 'text-white bg-white/20' 
                      : 'text-[#007AFF] bg-blue-50 dark:bg-blue-900/30'
                    : isShortsPage
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-gray-800 dark:text-white hover:text-[#007AFF] hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                Shorts
              </button>
              <button 
                onClick={() => {
                  onNavigate('updates');
                  setIsMobileMenuOpen(false);
                }}
                className={`text-left px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentPage === 'updates' 
                    ? isShortsPage 
                      ? 'text-white bg-white/20' 
                      : 'text-[#007AFF] bg-blue-50 dark:bg-blue-900/30'
                    : isShortsPage
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-gray-800 dark:text-white hover:text-[#007AFF] hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                Updates
              </button>
              <hr className={isShortsPage ? "border-white/10" : "border-gray-200 dark:border-gray-700"} />
              {isAuthenticated ? (
                // User is logged in - show profile and logout
                <>
                  <button 
                    onClick={() => {
                      onNavigate('profile');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`text-left px-4 py-2 rounded-lg transition-all duration-200 ${
                      currentPage === 'profile' 
                        ? isShortsPage 
                          ? 'text-white bg-white/20' 
                          : 'text-[#007AFF] bg-blue-50 dark:bg-blue-900/30'
                        : isShortsPage
                          ? 'text-white/80 hover:text-white hover:bg-white/10'
                          : 'text-gray-800 dark:text-white hover:text-[#007AFF] hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className={`mx-4 px-6 py-2.5 rounded-lg font-medium text-center transition-all duration-200 ${
                      isShortsPage 
                        ? 'text-red-300 hover:text-red-200 hover:bg-red-500/20' 
                        : 'text-red-400 hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                    }`}
                  >
                    Logout
                  </button>
                </>
              ) : (
                // User is not logged in - show login and signup
                <>
                  <button 
                    onClick={() => {
                      onNavigate('login');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`text-left px-4 py-2 rounded-lg transition-all duration-200 ${
                      isShortsPage 
                        ? 'text-white/80 hover:text-white hover:bg-white/10' 
                        : 'text-gray-800 dark:text-white hover:text-[#007AFF] hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('signup');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`mx-4 bg-gradient-to-r from-[#007AFF] to-[#0056CC] text-white px-6 py-2.5 rounded-lg font-medium text-center hover:from-[#0056CC] hover:to-[#0041A3] transition-all duration-200 ${
                      isShortsPage ? 'opacity-90 hover:opacity-100' : ''
                    }`}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Gradient Animation Styles */}
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
      `}</style>
    </nav>
  );
}
