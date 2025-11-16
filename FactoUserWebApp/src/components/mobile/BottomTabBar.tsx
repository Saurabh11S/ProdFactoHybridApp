import { Capacitor } from '@capacitor/core';
import { useDarkMode } from '../DarkModeContext';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile' | 'course-payment' | 'course-details';

interface BottomTabBarProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
}

interface TabItem {
  id: PageType;
  label: string;
  icon: (active: boolean) => JSX.Element;
  activeIcon: (active: boolean) => JSX.Element;
}

export function BottomTabBar({ currentPage, onNavigate }: BottomTabBarProps) {
  const { isDarkMode } = useDarkMode();

  // Only show on mobile and for main pages
  if (!Capacitor.isNativePlatform() && window.innerWidth >= 768) {
    return null;
  }

  const mainPages: PageType[] = ['home', 'services', 'shorts', 'updates', 'learning'];
  if (!mainPages.includes(currentPage)) {
    return null;
  }

  // For shorts page, use a semi-transparent overlay style
  const isShortsPage = currentPage === 'shorts';

  const tabs: TabItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: (active) => (
        <svg className={`w-6 h-6 ${active ? 'text-[#007AFF]' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      activeIcon: (active) => (
        <svg className={`w-6 h-6 ${active ? 'text-[#007AFF]' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
    },
    {
      id: 'services',
      label: 'Services',
      icon: (active) => (
        <svg className={`w-6 h-6 ${active ? 'text-[#007AFF]' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      activeIcon: (active) => (
        <svg className={`w-6 h-6 ${active ? 'text-[#007AFF]' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
        </svg>
      ),
    },
    {
      id: 'shorts',
      label: 'Shorts',
      icon: (active) => (
        <svg className={`w-6 h-6 ${active ? 'text-[#007AFF]' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      activeIcon: (active) => (
        <svg className={`w-6 h-6 ${active ? 'text-[#007AFF]' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.77 10.32c-.77-.32-1.2-.5-1.2-.5L18 9.06c1.84-.96 2.53-3.23 1.56-5.06s-3.24-2.53-5.07-1.56L6 6.94c-1.29.68-2.07 2.04-2 3.49.07 1.42.93 2.67 2.22 3.25.03.01 1.2.5 1.2.5L6 14.93c-1.83.97-2.53 3.24-1.56 5.07.97 1.83 3.24 2.53 5.07 1.56l8.5-4.5c1.29-.68 2.06-2.04 1.99-3.49-.07-1.42-.94-2.68-2.23-3.25zM10 14.65v-5.3L15 12l-5 2.65z" />
        </svg>
      ),
    },
    {
      id: 'updates',
      label: 'Updates',
      icon: (active) => (
        <svg className={`w-6 h-6 ${active ? 'text-[#007AFF]' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      activeIcon: (active) => (
        <svg className={`w-6 h-6 ${active ? 'text-[#007AFF]' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
        </svg>
      ),
    },
    {
      id: 'learning',
      label: 'Learning',
      icon: (active) => (
        <svg className={`w-6 h-6 ${active ? 'text-[#007AFF]' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      activeIcon: (active) => (
        <svg className={`w-6 h-6 ${active ? 'text-[#007AFF]' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 2.18l8 4v8.82c0 4.54-3.07 8.79-7.09 9.82-.4-.09-.8-.2-1.18-.33C6.5 19.5 3 15.36 3 10.18V8.18l9-4z" />
        </svg>
      ),
    },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 ${
      isShortsPage
        ? 'bg-black/60 backdrop-blur-md border-t border-white/10'
        : isDarkMode 
          ? 'bg-gray-900 border-t border-gray-800' 
          : 'bg-white border-t border-gray-200'
    } pb-safe`}>
      <div className="flex items-center justify-around h-16 px-1">
        {tabs.map((tab) => {
          const isActive = currentPage === tab.id;
          const IconComponent = isActive ? tab.activeIcon : tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-all duration-200 ${
                isShortsPage
                  ? isActive
                    ? 'text-white'
                    : 'text-white/70'
                  : isActive 
                    ? 'text-[#007AFF]' 
                    : isDarkMode
                      ? 'text-gray-300'
                      : 'text-gray-500'
              }`}
              aria-label={tab.label}
            >
              {isActive && (
                <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-10 h-1 rounded-b-full ${
                  isShortsPage ? 'bg-white' : 'bg-[#007AFF]'
                }`} />
              )}
              <div className="mb-1 relative z-10">
                <div 
                  className={isShortsPage ? (isActive ? 'text-white' : 'text-white/70') : ''}
                  style={isShortsPage ? { color: isActive ? 'white' : 'rgba(255, 255, 255, 0.7)' } : undefined}
                >
                  {IconComponent(isActive)}
                </div>
              </div>
              <span className={`text-xs font-medium transition-colors relative z-10 ${
                isShortsPage
                  ? isActive
                    ? 'text-white'
                    : 'text-white/70'
                  : isActive 
                    ? 'text-[#007AFF]' 
                    : isDarkMode
                      ? 'text-gray-300'
                      : 'text-gray-500'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

