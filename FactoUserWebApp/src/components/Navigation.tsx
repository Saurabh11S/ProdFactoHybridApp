import { useState, useEffect } from 'react';
import { useDarkMode } from './DarkModeContext';
import { useAuth } from '../contexts/AuthContext';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile';

interface NavigationProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg' 
        : 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm'
    }`}>
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
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => onNavigate('home')}
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                currentPage === 'home' 
                  ? 'text-[#007AFF] bg-blue-50 dark:bg-blue-900/30' 
                  : 'text-gray-800 dark:text-white hover:text-[#007AFF] hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              Home
            </button>
            <button 
              onClick={() => onNavigate('services')}
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                currentPage === 'services' 
                  ? 'text-[#007AFF] bg-blue-50 dark:bg-blue-900/30' 
                  : 'text-gray-800 dark:text-white hover:text-[#007AFF] hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              Services
            </button>
            <button 
              onClick={() => onNavigate('learning')}
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                currentPage === 'learning' 
                  ? 'text-[#007AFF] bg-blue-50 dark:bg-blue-900/30' 
                  : 'text-gray-800 dark:text-white hover:text-[#007AFF] hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              Learning
            </button>
            <button 
              onClick={() => onNavigate('shorts')}
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                currentPage === 'shorts' 
                  ? 'text-[#007AFF] bg-blue-50 dark:bg-blue-900/30' 
                  : 'text-gray-800 dark:text-white hover:text-[#007AFF] hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              Shorts
            </button>
            <button 
              onClick={() => onNavigate('updates')}
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                currentPage === 'updates' 
                  ? 'text-[#007AFF] bg-blue-50 dark:bg-blue-900/30' 
                  : 'text-gray-800 dark:text-white hover:text-[#007AFF] hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              Updates
            </button>
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
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

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
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
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-800 dark:text-white hover:text-[#007AFF] p-2 rounded-lg transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
            <div className="flex flex-col space-y-3">
              <button 
                onClick={() => {
                  onNavigate('home');
                  setIsMobileMenuOpen(false);
                }}
                className={`text-left px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentPage === 'home' 
                    ? 'text-[#007AFF] bg-blue-50 dark:bg-blue-900/30' 
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
                    ? 'text-[#007AFF] bg-blue-50 dark:bg-blue-900/30' 
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
                    ? 'text-[#007AFF] bg-blue-50 dark:bg-blue-900/30' 
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
                    ? 'text-[#007AFF] bg-blue-50 dark:bg-blue-900/30' 
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
                    ? 'text-[#007AFF] bg-blue-50 dark:bg-blue-900/30' 
                    : 'text-gray-800 dark:text-white hover:text-[#007AFF] hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                Updates
              </button>
              <hr className="border-gray-200 dark:border-gray-700" />
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
                        ? 'text-[#007AFF] bg-blue-50 dark:bg-blue-900/30' 
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
                    className="mx-4 text-red-400 hover:text-red-300 px-6 py-2.5 rounded-lg font-medium text-center hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
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
                    className="text-left px-4 py-2 text-gray-800 dark:text-white hover:text-[#007AFF] rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('signup');
                      setIsMobileMenuOpen(false);
                    }}
                    className="mx-4 bg-gradient-to-r from-[#007AFF] to-[#0056CC] text-white px-6 py-2.5 rounded-lg font-medium text-center hover:from-[#0056CC] hover:to-[#0041A3] transition-all duration-200"
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
