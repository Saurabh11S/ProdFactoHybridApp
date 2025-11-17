import { useState, useEffect, useCallback, useRef } from 'react';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile';

interface MobileShortsProps {
  onNavigate?: (page: PageType) => void;
}

interface Short {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  views: number;
  likes: number;
  comments: number;
  category: string;
  creator: string;
  creatorAvatar: string;
  isLiked: boolean;
  isDisliked: boolean;
}

/**
 * YouTube Video Configuration
 * Channel: @KRISHNA5-5-5 (Krishna-5-5-5)
 * 
 * Video from: https://www.youtube.com/shorts/tLvaiyovqls
 * Video ID: tLvaiyovqls
 * 
 * To add more videos from your channel:
 * 1. Open the video on YouTube
 * 2. Copy the video ID from the URL (e.g., https://www.youtube.com/shorts/VIDEO_ID)
 * 3. Add it to the YOUTUBE_VIDEOS array below
 */

// Configure your YouTube video IDs from @KRISHNA5-5-5 channel
const YOUTUBE_VIDEOS = [
  { videoId: 'tLvaiyovqls', title: "Travel with me .. high in the sky ...", description: "Travel with me .. high in the sky ...", duration: "0:30", views: 12500, likes: 6, comments: 0, category: "Travel", creator: "@KRISHNA5-5-5", creatorAvatar: "👤" },
  // Add more videos from your channel here by copying their video IDs
];

// Helper function to generate YouTube embed URL (privacy-enhanced mode)
const getYouTubeEmbedUrl = (videoId: string, autoplay: boolean = false) => {
  const params = new URLSearchParams({
    rel: '0', // Don't show related videos from other channels
    modestbranding: '1', // Minimal YouTube branding
    ...(autoplay && { autoplay: '1', mute: '1' })
  });
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
};

// Helper function to get YouTube thumbnail
const getYouTubeThumbnail = (videoId: string) => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

const shorts: Short[] = YOUTUBE_VIDEOS.map((video, index) => ({
  id: index + 1,
  title: video.title,
  description: video.description,
  thumbnail: getYouTubeThumbnail(video.videoId),
  videoUrl: getYouTubeEmbedUrl(video.videoId),
  duration: video.duration,
  views: video.views,
  likes: video.likes,
  comments: video.comments || 0,
  category: video.category,
  creator: video.creator,
  creatorAvatar: video.creatorAvatar,
  isLiked: false,
  isDisliked: false,
}));

export function MobileShorts({ onNavigate }: MobileShortsProps = {}) {
  const [currentShort, setCurrentShort] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);


  const handleNext = useCallback(() => {
    setCurrentShort((prev) => (prev + 1) % shorts.length);
    setIsPlaying(false);
  }, []);

  const handlePrevious = useCallback(() => {
    setCurrentShort((prev) => (prev - 1 + shorts.length) % shorts.length);
    setIsPlaying(false);
  }, []);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const diff = touchStartY.current - touchEndY.current;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        // Swipe up - next
        handleNext();
      } else {
        // Swipe down - previous
        handlePrevious();
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") handleNext();
      if (e.key === "ArrowUp") handlePrevious();
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleNext, handlePrevious]);

  const currentShortData = shorts[currentShort];

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black z-40 overflow-hidden pb-16"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ pointerEvents: 'auto' }}
    >
      {/* Video Container - Full Screen */}
      <div className="relative w-full h-full">
        {/* Video/Thumbnail */}
        <div className="relative w-full h-full">
          <img
            src={currentShortData.thumbnail}
            alt={currentShortData.title}
            className="w-full h-full object-cover"
          />

          {/* Play Button Overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <button
                onClick={() => setIsPlaying(true)}
                className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center active:scale-95 transition-transform duration-200 shadow-2xl"
              >
                <svg
                  className="w-10 h-10 text-black ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          )}

          {/* Video Player */}
          {isPlaying && (
            <iframe
              src={`${currentShortData.videoUrl}&autoplay=1&mute=${isMuted ? '1' : '0'}`}
              title={currentShortData.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              frameBorder="0"
            />
          )}

          {/* Video Controls - Top (YouTube Shorts Style) */}
          {isPlaying && (
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <button
                onClick={() => setIsPlaying(false)}
                className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white active:scale-95 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              </button>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white active:scale-95 transition-all"
              >
                {isMuted ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </button>
            </div>
          )}

          {/* Creator Info - Left Side (YouTube Shorts Style) */}
          <div className="absolute bottom-0 left-0 p-4 pb-24 z-10 max-w-[60%]">
            {/* Creator Profile */}
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#007AFF] to-[#00C897] rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                {currentShortData.creatorAvatar}
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">
                  {currentShortData.creator}
                </p>
              </div>
              <button className="px-4 py-1.5 bg-red-600 text-white rounded-full text-sm font-semibold active:scale-95 transition-transform">
                Subscribe
              </button>
            </div>

            {/* Video Title */}
            <h3 className="text-white text-base font-medium mb-2 line-clamp-2">
              {currentShortData.title}
            </h3>
          </div>

          {/* Share Button Only - Right Side (YouTube Shorts Style) */}
          <div className="absolute right-3 bottom-28 flex flex-col items-center space-y-4 z-10">
            {/* Share Button */}
            <button 
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  const videoId = YOUTUBE_VIDEOS[currentShort]?.videoId || '';
                  const shareUrl = `https://www.youtube.com/shorts/${videoId}`;
                  const shareTitle = currentShortData.title || 'Check out this video!';
                  const shareText = currentShortData.description || `Watch: ${shareTitle}`;
                  
                  // Use Web Share API if available
                  if (navigator.share && navigator.canShare && navigator.canShare({ title: shareTitle, text: shareText, url: shareUrl })) {
                    await navigator.share({
                      title: shareTitle,
                      text: shareText,
                      url: shareUrl
                    });
                  } else if (navigator.share) {
                    // Fallback for browsers that support share but not canShare
                    await navigator.share({
                      title: shareTitle,
                      text: shareText,
                      url: shareUrl
                    });
                  } else {
                    // Fallback: Copy to clipboard
                    try {
                      await navigator.clipboard.writeText(shareUrl);
                      // Show toast notification instead of alert
                      const toast = document.createElement('div');
                      toast.textContent = 'Link copied to clipboard!';
                      toast.style.cssText = 'position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); color: white; padding: 12px 24px; border-radius: 8px; z-index: 10000; font-size: 14px;';
                      document.body.appendChild(toast);
                      setTimeout(() => toast.remove(), 2000);
                    } catch (clipboardError) {
                      console.error('Failed to copy to clipboard:', clipboardError);
                    }
                  }
                } catch (error: any) {
                  // User cancelled or share failed - this is expected behavior
                  if (error.name !== 'AbortError') {
                    console.log('Share failed:', error);
                  }
                }
              }}
              className="flex flex-col items-center space-y-1 active:scale-95 transition-transform touch-manipulation"
              aria-label="Share video"
            >
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
              </div>
              <span className="text-white text-xs font-medium">Share</span>
            </button>
          </div>
        </div>

      </div>

      {/* Close Button - Top Left */}
      {onNavigate && (
        <button
          onClick={() => onNavigate('home')}
          className="absolute top-4 left-4 z-50 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-95 transition-transform"
          aria-label="Close Shorts"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      {/* Progress Indicator - Top */}
      <div className="absolute top-16 left-0 right-0 flex justify-center space-x-1 px-4">
        {shorts.map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              index === currentShort ? "bg-white" : "bg-white/30"
            }`}
          />
        ))}
      </div>

      {/* Swipe Hint */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-white/70 text-xs animate-pulse">
        Swipe up/down to navigate
      </div>
    </div>
  );
}

