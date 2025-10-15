import { useState, useEffect, useRef } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile';

interface FinanceShortsSectionProps {
  onNavigate: (page: PageType, serviceId?: string) => void;
}

export function FinanceShortsSection({ onNavigate }: FinanceShortsSectionProps) {
  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const [visibleVideos, setVisibleVideos] = useState<number[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const financeShorts = [
    {
      title: '5-Minute Tax Tips',
      description: 'Quick ways to save on taxes',
      thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=400&fit=crop',
      duration: '0:45',
      views: '2.5K',
      category: 'Tax Tips',
      expert: 'CA Rajesh Kumar'
    },
    {
      title: 'GST Filing Hacks',
      description: 'Simplify your GST returns',
      thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
      duration: '1:20',
      views: '3.2K',
      category: 'GST',
      expert: 'CA Priya Sharma'
    },
    {
      title: 'Investment Basics',
      description: 'Start investing with ₹500',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=400&fit=crop',
      duration: '2:15',
      views: '4.1K',
      category: 'Investment',
      expert: 'CA Vikram Singh'
    },
    {
      title: 'Deduction Calculator',
      description: 'Maximize your 80C benefits',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=400&fit=crop',
      duration: '1:05',
      views: '1.8K',
      category: 'Deductions',
      expert: 'CA Anita Patel'
    },
    {
      title: 'Business Loan Tips',
      description: 'Get loans for your startup',
      thumbnail: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=300&h=400&fit=crop',
      duration: '1:45',
      views: '2.9K',
      category: 'Business',
      expert: 'CA Rohit Shah'
    },
    {
      title: 'Mutual Fund SIP',
      description: 'Start SIP with just ₹100',
      thumbnail: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=300&h=400&fit=crop',
      duration: '1:30',
      views: '3.7K',
      category: 'Mutual Funds',
      expert: 'CA Meera Reddy'
    }
  ];

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
    setActiveVideo(activeVideo === index ? null : index);
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

        {/* CTA Section */}
        <div className={`text-center bg-gradient-to-r from-[#007AFF]/10 to-[#00C897]/10 dark:from-[#007AFF]/20 dark:to-[#00C897]/20 rounded-2xl p-8 border border-[#007AFF]/20 dark:border-blue-400/20 backdrop-blur-lg relative overflow-hidden transform transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {/* Background animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#007AFF]/5 via-[#00C897]/5 to-[#007AFF]/5 opacity-0 hover:opacity-100 transition-opacity duration-700 animate-gradient-x"></div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-[#1F2937] dark:text-white mb-4">
              Get Personalized Finance Tips
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Subscribe to our newsletter and get daily finance tips directly in your inbox. Stay updated with the latest tax and investment strategies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] dark:focus:ring-blue-400 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300"
              />
              <button 
                onClick={() => onNavigate('login')}
                className="group bg-gradient-to-r from-[#007AFF] to-[#0056CC] text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 whitespace-nowrap transform hover:-translate-y-1 hover:scale-105"
              >
                <span className="flex items-center justify-center">
                  Subscribe Now
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </button>
            </div>
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
