/**
 * Promotional Banner Configuration
 * 
 * Configure promotional banners for the mobile app here.
 * You can easily enable/disable banners and customize their content.
 */

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile';

export interface PromoBannerConfig {
  id: string;
  enabled: boolean;
  title: string;
  description?: string;
  discount?: string;
  offerText?: string;
  ctaText?: string;
  ctaPage?: PageType;
  ctaServiceId?: string;
  ctaFilter?: string;
  variant?: 'discount' | 'offer' | 'announcement';
  dismissible?: boolean;
  storageKey?: string;
  // Optional: Show only on specific dates
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
}

/**
 * Promotional Banners Configuration
 * 
 * Add your banners here. Set `enabled: true` to show a banner.
 * Each banner can have its own storage key for dismissal tracking.
 */
export const promoBanners: PromoBannerConfig[] = [
  {
    id: 'mega-discount',
    enabled: true,
    title: '🎉 Mega Sale - 50% OFF!',
    description: 'Get massive 50% discount on all tax filing services including ITR, GST, Tax Planning & more',
    discount: '50% OFF',
    offerText: '⚡ Limited time offer - Don\'t miss this amazing deal!',
    ctaText: 'Claim 50% Discount Now',
    ctaPage: 'services',
    variant: 'discount',
    dismissible: true,
    storageKey: 'megaDiscountBannerDismissed'
  },
  {
    id: 'itr-discount',
    enabled: false,
    title: '🎯 ITR Special - 20% OFF!',
    description: 'Get 20% off on all ITR filing services. File your taxes with ease!',
    discount: '20% OFF',
    offerText: '⚡ Limited time offer - File your ITR now and save!',
    ctaText: 'Claim ITR Offer',
    ctaPage: 'services',
    ctaFilter: 'itr',
    variant: 'discount',
    dismissible: true,
    storageKey: 'itrPromoBannerDismissed'
  },
  // GST Offer Banner
  {
    id: 'gst-offer',
    enabled: false,
    title: '📋 GST Filing Made Easy!',
    description: 'Comprehensive GST services at competitive prices. Expert assistance guaranteed!',
    offerText: '✨ New customers get special pricing',
    ctaText: 'Explore GST Services',
    ctaPage: 'services',
    ctaFilter: 'gst',
    variant: 'offer',
    dismissible: true,
    storageKey: 'gstPromoBannerDismissed'
  },
  // Example: Announcement Banner (disabled by default)
  {
    id: 'new-feature',
    enabled: false,
    title: 'New Feature Available!',
    description: 'Check out our latest tax planning tools',
    ctaText: 'Learn More',
    ctaPage: 'services',
    variant: 'announcement',
    dismissible: true,
    storageKey: 'newFeatureBannerDismissed'
  }
];

/**
 * Get active banners (enabled and within date range if specified)
 */
export const getActiveBanners = (): PromoBannerConfig[] => {
  const now = new Date();
  
  return promoBanners.filter(banner => {
    if (!banner.enabled) return false;
    
    // Check date range if specified
    if (banner.startDate) {
      const startDate = new Date(banner.startDate);
      if (now < startDate) return false;
    }
    
    if (banner.endDate) {
      const endDate = new Date(banner.endDate);
      if (now > endDate) return false;
    }
    
    return true;
  });
};

