import { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight } from 'lucide-react';
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
  const [dismissedBanners, setDismissedBanners] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Filter out dismissed banners and get the first active one
  const activeBanners = banners.filter(banner => !dismissedBanners.has(banner.id));
  const currentBanner = activeBanners[0]; // Show only the first active banner

  // Load dismissed banners from storage
  useEffect(() => {
    const loadDismissedBanners = async () => {
      console.log('[Banner] Starting to load dismissal state for', banners.length, 'banners');
      setIsLoading(true);
      const dismissed = new Set<string>();
      
      // If no banners provided, skip loading
      if (banners.length === 0) {
        console.log('[Banner] No banners provided, skipping dismissal check');
        setIsLoading(false);
        return;
      }
      
      for (const banner of banners) {
        if (banner.storageKey) {
          try {
            const isDismissed = await Storage.get(banner.storageKey);
            console.log(`[Banner] Checked "${banner.id}" dismissal state:`, isDismissed);
            if (isDismissed === 'true') {
              dismissed.add(banner.id);
              console.log(`[Banner] ✓ Banner "${banner.id}" is dismissed`);
            } else {
              console.log(`[Banner] ✓ Banner "${banner.id}" is NOT dismissed`);
            }
          } catch (error) {
            // Fail-safe: If storage read fails, show banner by default
            console.error(`[Banner] ✗ Error loading dismissal state for "${banner.id}":`, error);
            console.log(`[Banner] Showing banner "${banner.id}" by default due to storage error`);
            // Don't add to dismissed set - show banner by default
          }
        } else {
          console.log(`[Banner] Banner "${banner.id}" has no storageKey, will always show`);
        }
      }
      
      setDismissedBanners(dismissed);
      setIsLoading(false);
      const availableCount = banners.length - dismissed.size;
      console.log('[Banner] Summary - Total:', banners.length, 'Dismissed:', dismissed.size, 'Available:', availableCount);
      console.log('[Banner] Available banner IDs:', banners.filter(b => !dismissed.has(b.id)).map(b => b.id));
    };
    loadDismissedBanners();
  }, [banners]);

  const handleDismiss = useCallback(async (bannerId: string, storageKey?: string) => {
    console.log(`[Banner] Dismissing banner: ${bannerId}`);
    // Immediately update state to hide banner
    setDismissedBanners(prev => {
      const newSet = new Set(prev);
      newSet.add(bannerId);
      console.log(`[Banner] Updated dismissed banners:`, Array.from(newSet));
      return newSet;
    });
    
    // Save to storage
    if (storageKey) {
      try {
        await Storage.set(storageKey, 'true');
        console.log(`[Banner] Banner "${bannerId}" dismissed and saved to storage`);
      } catch (error) {
        console.error('[Banner] Error saving banner dismissal:', error);
      }
    }
  }, []);

  const handleCTAClick = useCallback((banner: PromoBannerConfig) => {
    if (onCTAClick) {
      onCTAClick(banner.ctaPage || 'services', banner.ctaServiceId, undefined, banner.ctaFilter);
    }
  }, [onCTAClick]);

  // Show banner optimistically while loading, or show current banner if available
  // Only hide if we've confirmed it's dismissed (not during loading)
  const displayBanner = isLoading ? banners[0] : currentBanner;
  
  // Debug logging for visibility decision
  useEffect(() => {
    console.log('[Banner] ===== VISIBILITY DEBUG =====');
    console.log('[Banner] isLoading:', isLoading);
    console.log('[Banner] banners.length:', banners.length);
    console.log('[Banner] dismissedBanners.size:', dismissedBanners.size);
    console.log('[Banner] activeBanners.length:', activeBanners.length);
    console.log('[Banner] currentBanner:', currentBanner?.id || 'none');
    
    if (isLoading) {
      console.log('[Banner] Loading state: Showing banner optimistically:', banners[0]?.id || 'none');
    } else {
      console.log('[Banner] Loaded state - Current banner:', currentBanner?.id || 'none');
      console.log('[Banner] Active banners count:', activeBanners.length);
      if (currentBanner) {
        console.log('[Banner] ✓ Will display banner:', currentBanner.id);
      } else {
        console.log('[Banner] ✗ No banner to display. All banners dismissed or none available.');
        console.log('[Banner] Dismissed banner IDs:', Array.from(dismissedBanners));
      }
    }
    console.log('[Banner] ============================');
  }, [isLoading, currentBanner, activeBanners.length, banners, dismissedBanners]);
  
  // Don't render if no banner available (unless forced)
  if (!displayBanner) {
    if (!isLoading) {
      console.log('[Banner] ✗ Rendering null - No active banner to display. All banners may be dismissed.');
      console.log('[Banner] Available banners:', banners.map(b => ({ id: b.id, enabled: b.enabled })));
    }
    return null;
  }
  
  console.log('[Banner] ✓ Rendering banner:', displayBanner.id);

  return (
    <div 
      className="relative mb-3 rounded-2xl"
      style={{
        zIndex: 30,
        position: 'relative',
        minHeight: '140px',
        display: 'block',
        visibility: 'visible',
        opacity: 1,
        width: '100%',
        overflow: 'visible'
      }}
      data-banner-id={displayBanner.id}
      data-banner-visible="true"
    >
      {/* Premium Dark Blue Gradient Background */}
      <div 
        className="relative overflow-visible rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, #0B1F33 0%, #123A5F 100%)',
          minHeight: '140px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxShadow: '0 8px 32px rgba(0, 122, 255, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}
      >
        {/* Glassmorphism Overlay */}
        <div 
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        />

        {/* Subtle Blue Glow Effect */}
        <div 
          className="absolute inset-0 rounded-2xl opacity-30"
          style={{
            background: 'radial-gradient(circle at top right, rgba(0, 122, 255, 0.2), transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        {/* Content Container */}
        <div className="relative flex-1 flex flex-col p-3.5 z-10" style={{ minHeight: '140px' }}>
          {/* Top Row: Badge and Dismiss Button */}
          <div className="flex items-start justify-between mb-1.5 flex-shrink-0">
            {/* LIMITED OFFER Badge */}
            <div 
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                boxShadow: '0 2px 8px rgba(255, 107, 53, 0.3)'
              }}
            >
              <span className="text-[10px]" style={{ fontSize: '9px' }}>🔥</span>
              <span className="text-[10px] font-bold text-white tracking-wide" style={{ fontSize: '10px' }}>LIMITED OFFER</span>
            </div>

            {/* Dismiss Button */}
            {displayBanner.dismissible && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDismiss(displayBanner.id, displayBanner.storageKey);
                }}
                className="flex-shrink-0 p-1 rounded-lg transition-colors hover:bg-white/10"
                style={{
                  color: 'rgba(255, 255, 255, 0.6)'
                }}
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Main Content Row */}
          <div className="flex-1 flex items-start justify-between gap-3 min-h-0">
            {/* Left Side - Text Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-start" style={{ flex: '1 1 auto' }}>
              {/* Main Headline */}
              <h3 
                className="font-bold mb-1 leading-tight"
                style={{
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '15px',
                  lineHeight: '1.2',
                  marginBottom: '4px'
                }}
              >
                {displayBanner.title || 'Mega Tax Filing Sale'}
              </h3>

              {/* Offer Highlight */}
              {displayBanner.discount && (
                <div className="mb-1" style={{ marginBottom: '4px' }}>
                  <span 
                    className="font-bold"
                    style={{
                      color: '#60A5FA',
                      fontWeight: 800,
                      fontSize: '22px',
                      lineHeight: '1.2',
                      textShadow: '0 0 20px rgba(96, 165, 250, 0.4)',
                      background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      display: 'inline-block'
                    }}
                  >
                    {displayBanner.discount}
                  </span>
                </div>
              )}

              {/* Supporting Text and CTA Button - Adjacent Layout */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Supporting Text */}
                {displayBanner.description && (
                  <p 
                    className="leading-relaxed flex-shrink"
                    style={{
                      color: 'rgba(255, 255, 255, 0.75)',
                      fontSize: '11px',
                      lineHeight: '1.4',
                      margin: 0,
                      flex: '1 1 auto',
                      minWidth: 0
                    }}
                  >
                    {displayBanner.description}
                  </p>
                )}

                {/* CTA Button - Adjacent to text */}
                {displayBanner.ctaText && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCTAClick(displayBanner);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-semibold transition-all active:scale-95 flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #007AFF 0%, #00C8FF 100%)',
                      color: '#FFFFFF',
                      fontWeight: 600,
                      fontSize: '11px',
                      boxShadow: '0 4px 12px rgba(0, 122, 255, 0.4)',
                      border: 'none',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span>{displayBanner.ctaText}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Right Side - Subtle Icons */}
            <div className="flex-shrink-0 flex items-center justify-center" style={{ opacity: 0.25, alignSelf: 'center' }}>
              <div className="relative w-14 h-14">
                {/* Document Icon */}
                <svg 
                  className="absolute top-0 right-0" 
                  width="28" 
                  height="28" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  style={{ color: '#60A5FA' }}
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                  <line x1="9" y1="12" x2="15" y2="12" />
                </svg>
                
                {/* Checkmark Icon */}
                <svg 
                  className="absolute bottom-0 left-0" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5"
                  style={{ color: '#10B981' }}
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
