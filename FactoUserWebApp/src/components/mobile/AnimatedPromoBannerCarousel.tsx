import { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { useDarkMode } from '../DarkModeContext';
import { Storage } from '../../utils/storage';
import { PromoBannerConfig } from '../../config/promoBanners';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile';

interface AnimatedPromoBannerCarouselProps {
  banners: PromoBannerConfig[];
  onCTAClick?: (page: PageType, serviceId?: string, courseId?: string, filter?: string) => void;
}

export function AnimatedPromoBannerCarousel({
  banners,
  onCTAClick
}: AnimatedPromoBannerCarouselProps) {
  const { isDarkMode } = useDarkMode();
  const [dismissedBanners, setDismissedBanners] = useState<Set<string>>(new Set());

  // Filter out dismissed banners and get the first active one
  const activeBanners = banners.filter(banner => !dismissedBanners.has(banner.id));
  const currentBanner = activeBanners[0]; // Show only the first active banner

  // Load dismissed banners from storage
  useEffect(() => {
    const loadDismissedBanners = async () => {
      const dismissed = new Set<string>();
      for (const banner of banners) {
        if (banner.storageKey) {
          try {
            const isDismissed = await Storage.get(banner.storageKey);
            if (isDismissed === 'true') {
              dismissed.add(banner.id);
            }
          } catch (error) {
            console.error('Error loading banner dismissal:', error);
          }
        }
      }
      setDismissedBanners(dismissed);
    };
    loadDismissedBanners();
  }, [banners]);

  const handleDismiss = useCallback(async (bannerId: string, storageKey?: string) => {
    setDismissedBanners(prev => new Set(prev).add(bannerId));
    if (storageKey) {
      try {
        await Storage.set(storageKey, 'true');
      } catch (error) {
        console.error('Error saving banner dismissal:', error);
      }
    }
  }, []);

  const handleCTAClick = useCallback((banner: PromoBannerConfig) => {
    if (onCTAClick) {
      onCTAClick(banner.ctaPage || 'services', banner.ctaServiceId, undefined, banner.ctaFilter);
    }
  }, [onCTAClick]);

  // Don't render if no active banner
  if (!currentBanner) return null;

  return (
    <div className="relative mx-4 mb-3 rounded-xl overflow-hidden shadow-lg z-20">
      {/* Attractive Background Matching App Theme */}
      <div 
        className={`relative overflow-hidden ${
          isDarkMode 
            ? 'bg-gradient-to-r from-[#0a1628] via-[#0f1b2e] to-[#152238]' 
            : 'bg-white'
        }`}
        style={{
          minHeight: '100px'
        }}
      >
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Light blue cloud shapes for light mode */}
          {!isDarkMode && (
            <>
              <div className="absolute top-0 right-8 w-24 h-24 bg-blue-100 rounded-full blur-2xl opacity-40"></div>
              <div className="absolute bottom-0 right-16 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-30"></div>
              <div className="absolute top-4 right-24 w-16 h-16 bg-blue-200 rounded-full blur-xl opacity-20"></div>
            </>
          )}
          {/* Subtle gradient overlay for dark mode */}
          {isDarkMode && (
            <>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#007AFF]/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-8 w-40 h-40 bg-[#00C897]/10 rounded-full blur-3xl"></div>
            </>
          )}
        </div>

        {/* Content */}
        <div className="relative p-3 flex items-center justify-between gap-3">
          {/* Left Side - Text Content */}
          <div className="flex-1 min-w-0">
            {/* Discount Badge */}
            {currentBanner.discount && (
              <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold mb-1.5 ${
                isDarkMode 
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' 
                  : 'bg-orange-100 text-orange-600'
              }`}>
                <span className="mr-1">🎉</span>
                <span>{currentBanner.discount}</span>
              </div>
            )}
            
            {/* Title */}
            <h3 className={`text-sm font-bold mb-0.5 line-clamp-1 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {currentBanner.title}
            </h3>
            
            {/* Description */}
            {currentBanner.description && (
              <p className={`text-xs mb-1.5 line-clamp-1 ${
                isDarkMode ? 'text-white/70' : 'text-gray-600'
              }`}>
                {currentBanner.description}
              </p>
            )}
            
            {/* CTA Button */}
            {currentBanner.ctaText && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCTAClick(currentBanner);
                }}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                  isDarkMode
                    ? 'bg-[#007AFF] hover:bg-[#0056CC] text-white shadow-md'
                    : 'bg-[#007AFF] hover:bg-[#0056CC] text-white shadow-sm'
                }`}
              >
                <span>{currentBanner.ctaText}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Right Side - Dismiss Button */}
          {currentBanner.dismissible && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss(currentBanner.id, currentBanner.storageKey);
              }}
              className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'hover:bg-white/10 text-white/60 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
              }`}
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
