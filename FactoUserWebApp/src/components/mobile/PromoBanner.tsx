import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useDarkMode } from '../DarkModeContext';
import { Storage } from '../../utils/storage';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile';

interface PromoBannerProps {
  title: string;
  description?: string;
  discount?: string;
  offerText?: string;
  ctaText?: string;
  onCTAClick?: (page: PageType, serviceId?: string, courseId?: string, filter?: string) => void;
  ctaPage?: PageType;
  ctaServiceId?: string;
  ctaFilter?: string;
  variant?: 'discount' | 'offer' | 'announcement';
  dismissible?: boolean;
  storageKey?: string; // Key to store dismissal state
}

export function PromoBanner({
  title,
  description,
  discount,
  offerText,
  ctaText = 'Get Started',
  onCTAClick,
  ctaPage = 'services',
  ctaServiceId,
  ctaFilter,
  variant = 'discount',
  dismissible = true,
  storageKey = 'promoBannerDismissed'
}: PromoBannerProps) {
  const { isDarkMode } = useDarkMode();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load dismissal state from storage (works for both web and mobile)
  useEffect(() => {
    const checkDismissed = async () => {
      if (storageKey) {
        try {
          const dismissed = await Storage.get(storageKey);
          setIsDismissed(dismissed === 'true');
        } catch (error) {
          console.error('Error checking banner dismissal:', error);
          setIsDismissed(false);
        }
      }
      setIsLoading(false);
    };
    checkDismissed();
  }, [storageKey]);

  const handleDismiss = async () => {
    setIsDismissed(true);
    if (storageKey) {
      try {
        await Storage.set(storageKey, 'true');
      } catch (error) {
        console.error('Error saving banner dismissal:', error);
      }
    }
  };

  const handleCTAClick = () => {
    if (onCTAClick) {
      onCTAClick(ctaPage, ctaServiceId, undefined, ctaFilter);
    }
  };

  // Don't render while loading dismissal state
  if (isLoading) return null;
  
  // Don't render if dismissed
  if (isDismissed) return null;

  // Variant-based styling
  const variantStyles = {
    discount: {
      bg: isDarkMode 
        ? 'bg-gradient-to-r from-purple-900/80 via-purple-800/80 to-red-900/80 border-purple-700/50' 
        : 'bg-gradient-to-r from-purple-100 via-red-100 to-pink-100 border-purple-300',
      text: isDarkMode ? 'text-white' : 'text-gray-900',
      accent: 'text-orange-400 dark:text-orange-300',
      badge: 'bg-orange-500 dark:bg-orange-600 text-white'
    },
    offer: {
      bg: isDarkMode 
        ? 'bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-teal-500/20 border-green-500/30' 
        : 'bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-green-200',
      text: isDarkMode ? 'text-white' : 'text-gray-900',
      accent: 'text-green-600 dark:text-green-400',
      badge: 'bg-green-500 dark:bg-green-600 text-white'
    },
    announcement: {
      bg: isDarkMode 
        ? 'bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 border-blue-500/30' 
        : 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-200',
      text: isDarkMode ? 'text-white' : 'text-gray-900',
      accent: 'text-blue-600 dark:text-blue-400',
      badge: 'bg-blue-500 dark:bg-blue-600 text-white'
    }
  };

  const styles = variantStyles[variant];

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .promo-banner-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
      <div className={`relative mx-4 mb-6 rounded-2xl border-2 ${styles.bg} shadow-lg overflow-hidden z-20 promo-banner-fade-in`}>
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative p-4">
        {/* Header with Dismiss Button */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            {/* Discount Badge */}
            {discount && (
              <div className={`inline-flex items-center px-4 py-1.5 rounded-full ${styles.badge} text-base font-bold mb-2 animate-pulse shadow-lg`}>
                <span className="mr-1.5 text-lg">🎉</span>
                <span className="text-lg">{discount}</span>
                {discount.includes('50%') && (
                  <span className="ml-1.5 text-xs bg-white/20 px-2 py-0.5 rounded-full">MEGA SALE</span>
                )}
              </div>
            )}
            
            {/* Title */}
            <h3 className={`text-lg font-bold ${styles.text} mb-1`}>
              {title}
            </h3>
            
            {/* Description */}
            {description && (
              <p className={`text-sm ${isDarkMode ? 'text-white/80' : 'text-gray-700'} mb-3`}>
                {description}
              </p>
            )}
            
            {/* Offer Text */}
            {offerText && (
              <p className={`text-sm font-semibold ${styles.accent} mb-3`}>
                {offerText}
              </p>
            )}
          </div>

          {/* Dismiss Button */}
          {dismissible && (
            <button
              onClick={handleDismiss}
              className={`flex-shrink-0 ml-2 p-1 rounded-full ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-200'} transition-colors`}
              aria-label="Dismiss banner"
            >
              <X className={`w-4 h-4 ${isDarkMode ? 'text-white/70' : 'text-gray-500'}`} />
            </button>
          )}
        </div>

        {/* CTA Button */}
        {ctaText && (
          <button
            onClick={handleCTAClick}
            className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-98 ${
              variant === 'discount'
                ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30'
                : variant === 'offer'
                ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30'
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30'
            }`}
          >
            {ctaText}
          </button>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-2 right-2 w-16 h-16 opacity-5">
        <div className="w-full h-full rounded-full bg-white blur-xl"></div>
      </div>
    </div>
    </>
  );
}

