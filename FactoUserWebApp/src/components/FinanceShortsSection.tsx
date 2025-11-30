import { useState, useEffect, useRef } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile';

interface FinanceShortsSectionProps {
  onNavigate: (page: PageType, serviceId?: string) => void;
}

export function FinanceShortsSection({ onNavigate: _onNavigate }: FinanceShortsSectionProps) {
  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const [visibleVideos, setVisibleVideos] = useState<number[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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
    { videoId: 'tLvaiyovqls', title: 'Travel with me .. high in the sky ...', description: 'Travel with me .. high in the sky ...', duration: '0:30', views: '12.5K', category: 'Travel', expert: '@KRISHNA5-5-5' },
    // Add more videos from your channel here by copying their video IDs
  ];

  // Helper function to get YouTube thumbnail
  const getYouTubeThumbnail = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  // Helper function to generate YouTube embed URL
  const getYouTubeEmbedUrl = (videoId: string) => {
    const params = new URLSearchParams({
      rel: '0', // Don't show related videos from other channels
      modestbranding: '1', // Minimal YouTube branding
    });
    return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
  };

  const financeShorts = YOUTUBE_VIDEOS.map((video) => ({
    ...video,
    thumbnail: getYouTubeThumbnail(video.videoId),
    videoUrl: getYouTubeEmbedUrl(video.videoId),
  }));

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const videoIndex = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleVideos(prev => [...new Set([...prev, videoIndex])]);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const videoCards = sectionRef.current?.querySelectorAll('[data-index]');
    videoCards?.forEach(card => observer.observe(card));

    if (sectionRef.current) {
      sectionObserver.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
      sectionObserver.disconnect();
    };
  }, []);

  const handleVideoPlay = (index: number) => {
    // Option 1: Open in embedded modal (recommended for better UX)
    setActiveVideo(activeVideo === index ? null : index);
    
    // Option 2: Open in new tab (uncomment if you prefer this approach)
    // const video = financeShorts[index];
    // if (video && video.videoUrl) {
    //   window.open(`https://www.youtube.com/watch?v=${YOUTUBE_VIDEOS[index].videoId}`, '_blank');
    // }
  };

  return (
    <section ref={sectionRef} className="py-20 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-[#00C897]/10 to-[#FFD166]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-[#007AFF]/10 to-[#00C897]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-16 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#007AFF]/10 to-[#00C897]/10 dark:from-[#007AFF]/20 dark:to-[#00C897]/20 rounded-full text-sm font-medium text-[#007AFF] dark:text-blue-400 mb-4 backdrop-blur-lg border border-[#007AFF]/20 dark:border-blue-400/20">
            📱 Finance Shorts
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1F2937] dark:text-white mb-4">
            Quick <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AFF] to-[#00C897]">Finance Tips</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Learn essential financial concepts in under 2 minutes with our expert-curated video series.
          </p>
        </div>

        {/* Finance Shorts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-12">
          {financeShorts.map((video, index) => (
            <div
              key={index}
              data-index={index}
              className={`group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-500 cursor-pointer transform ${
                visibleVideos.includes(index) 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              } hover:-translate-y-2 hover:scale-105`}
              style={{ 
                transitionDelay: visibleVideos.includes(index) ? `${index * 100}ms` : '0ms' 
              }}
              onClick={() => handleVideoPlay(index)}
            >
              {/* Video Thumbnail */}
              <div className="relative aspect-[9/16] overflow-hidden">
                <ImageWithFallback
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center animate-pulse">
                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-3 right-3">
                  <span className="bg-black/70 text-white px-2 py-1 rounded text-xs font-medium backdrop-blur-lg">
                    {video.duration}
                  </span>
                </div>

                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className="bg-[#007AFF] dark:bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-lg">
                    {video.category}
                  </span>
                </div>

                {/* Views Count */}
                <div className="absolute top-3 right-3">
                  <div className="bg-black/70 text-white px-2 py-1 rounded text-xs font-medium flex items-center backdrop-blur-lg">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    {video.views}
                  </div>
                </div>
              </div>

              {/* Video Info */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-[#1F2937] dark:text-white text-sm mb-1 line-clamp-2 group-hover:text-[#007AFF] dark:group-hover:text-blue-400 transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-xs line-clamp-2">{video.description}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{video.expert}</span>
                  <button className="text-[#007AFF] dark:text-blue-400 hover:text-[#0056CC] dark:hover:text-blue-300 transition-colors hover:scale-110">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Active Video Indicator */}
              {activeVideo === index && (
                <div className="absolute inset-0 border-4 border-[#007AFF] dark:border-blue-400 rounded-2xl pointer-events-none animate-pulse"></div>
              )}
            </div>
          ))}
        </div>

        {/* Video Player Modal - Embedded Player (Optional) */}
        {activeVideo !== null && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" 
            onClick={() => setActiveVideo(null)}
          >
            <div 
              className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl" 
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                aria-label="Close video"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <iframe
                src={financeShorts[activeVideo]?.videoUrl}
                title={financeShorts[activeVideo]?.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                frameBorder="0"
              />
            </div>
          </div>
        )}

        {/* Video Categories */}
        <div className={`flex flex-wrap justify-center gap-3 mb-12 transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {['All', 'Tax Tips', 'GST', 'Investment', 'Deductions', 'Business', 'Mutual Funds'].map((category, index) => (
            <button
              key={index}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${
                index === 0 
                  ? 'bg-[#007AFF] dark:bg-blue-500 text-white shadow-lg' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-[#007AFF] hover:text-white dark:hover:bg-blue-500 hover:shadow-lg'
              }`}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Stats Section */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="text-center group cursor-pointer">
            <div className="text-3xl font-bold text-[#007AFF] dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform duration-300">50+</div>
            <div className="text-gray-600 dark:text-gray-300 group-hover:text-[#007AFF] dark:group-hover:text-blue-400 transition-colors duration-300">Finance Shorts</div>
          </div>
          <div className="text-center group cursor-pointer">
            <div className="text-3xl font-bold text-[#00C897] dark:text-green-400 mb-2 group-hover:scale-110 transition-transform duration-300">100K+</div>
            <div className="text-gray-600 dark:text-gray-300 group-hover:text-[#00C897] dark:group-hover:text-green-400 transition-colors duration-300">Total Views</div>
          </div>
          <div className="text-center group cursor-pointer">
            <div className="text-3xl font-bold text-[#FFD166] dark:text-yellow-400 mb-2 group-hover:scale-110 transition-transform duration-300">1.5min</div>
            <div className="text-gray-600 dark:text-gray-300 group-hover:text-[#FFD166] dark:group-hover:text-yellow-400 transition-colors duration-300">Avg Duration</div>
          </div>
          <div className="text-center group cursor-pointer">
            <div className="text-3xl font-bold text-[#007AFF] dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform duration-300">Daily</div>
            <div className="text-gray-600 dark:text-gray-300 group-hover:text-[#007AFF] dark:group-hover:text-blue-400 transition-colors duration-300">New Content</div>
          </div>
        </div>

      </div>

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
          animation: gradient-x 4s ease infinite;
        }
      `}</style>
    </section>
  );
}
