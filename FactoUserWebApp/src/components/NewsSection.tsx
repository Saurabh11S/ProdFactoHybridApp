import { useEffect, useRef, useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { fetchBlogs, Blog } from '../api/blogs';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile';

interface NewsSectionProps {
  onNavigate: (page: PageType, serviceId?: string) => void;
}

export function NewsSection({ onNavigate }: NewsSectionProps) {
  const [visibleArticles, setVisibleArticles] = useState<number[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  // Fetch blogs from backend
  useEffect(() => {
    const loadBlogs = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching blogs for NewsSection...');
        const { blogs: fetchedBlogs } = await fetchBlogs(1, 50); // Fetch up to 50 blogs (same as Updates page)
        console.log('✅ Fetched blogs:', fetchedBlogs.length);
        setBlogs(fetchedBlogs);
      } catch (err: any) {
        console.error('❌ Error fetching blogs:', err);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, []);

  // Convert blogs to news articles format
  const newsArticles = blogs.map((blog) => {
    const publishDate = new Date(blog.createdAt);
    const daysAgo = Math.floor((Date.now() - publishDate.getTime()) / (1000 * 60 * 60 * 24));
    let publishDateText = '';
    if (daysAgo === 0) publishDateText = 'Today';
    else if (daysAgo === 1) publishDateText = '1 day ago';
    else if (daysAgo < 7) publishDateText = `${daysAgo} days ago`;
    else if (daysAgo < 30) publishDateText = `${Math.floor(daysAgo / 7)} weeks ago`;
    else publishDateText = `${Math.floor(daysAgo / 30)} months ago`;

    // Estimate read time based on content length
    const wordsPerMinute = 200;
    const wordCount = blog.content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);

    // Get category from tags or default
    const category = blog.tags && blog.tags.length > 0 ? blog.tags[0] : 'Updates';

    return {
      id: blog._id,
      title: blog.title,
      excerpt: blog.content.length > 150 ? blog.content.substring(0, 150) + '...' : blog.content,
      image: blog.contentType === 'image' ? blog.contentUrl : 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop',
      category: category,
      readTime: `${readTime} min read`,
      publishDate: publishDateText,
      author: blog.author || 'Facto Team',
      trending: daysAgo < 3, // Trending if published in last 3 days
      blog: blog // Keep reference to original blog
    };
  });

  // Use blogs if available, otherwise show loading or empty state
  const displayArticles = newsArticles.length > 0 ? newsArticles : [];

  // Intersection Observer for animations
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const articleIndex = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleArticles(prev => [...new Set([...prev, articleIndex])]);
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

    // Use setTimeout to ensure DOM is ready after articles are rendered
    timeoutId = setTimeout(() => {
      const articleCards = sectionRef.current?.querySelectorAll('[data-index]');
      if (articleCards && articleCards.length > 0) {
        articleCards.forEach(card => observer.observe(card));
        // Immediately show cards that are already in viewport
        articleCards.forEach((card, index) => {
          const rect = card.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            setVisibleArticles(prev => [...new Set([...prev, index])]);
          }
        });
      }
    }, 100);

    if (sectionRef.current) {
      sectionObserver.observe(sectionRef.current);
      // Immediately show section if already in viewport
      const rect = sectionRef.current.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        setIsVisible(true);
      }
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      observer.disconnect();
      sectionObserver.disconnect();
    };
  }, [displayArticles.length]);

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Tax Updates': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      'GST': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      'Business': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
      'Investment': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      'Policy': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      'Crypto': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
    };
    return colors[category] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-br from-[#F9FAFB] to-white dark:from-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-[#FFD166]/10 to-[#007AFF]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-[#007AFF]/10 to-[#00C897]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-16 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#007AFF]/10 to-[#00C897]/10 dark:from-[#007AFF]/20 dark:to-[#00C897]/20 rounded-full text-sm font-medium text-[#007AFF] dark:text-blue-400 mb-4 backdrop-blur-lg border border-[#007AFF]/20 dark:border-blue-400/20">
            📰 Latest Updates
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1F2937] dark:text-white mb-4">
            Finance <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AFF] to-[#00C897]">News & Insights</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Stay ahead with the latest updates in taxation, GST, business regulations, and financial planning from our expert team.
          </p>
        </div>

        {/* News Grid - Show all articles in grid format (same as Updates page) */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : displayArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Show all articles in grid format (matching Updates page) */}
            {displayArticles.map((article, index) => (
              <div
                key={article.id}
                data-index={index}
                onClick={() => onNavigate('updates')}
                className={`group bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer transform ${
                  visibleArticles.includes(index) 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-10 opacity-0'
                } hover:-translate-y-2 hover:scale-105`}
                style={{ 
                  transitionDelay: visibleArticles.includes(index) ? `${index * 150}ms` : '0ms' 
                }}
              >
              {/* Article Image */}
              <div className="relative overflow-hidden">
                <ImageWithFallback
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {article.trending && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-[#FFD166] dark:bg-yellow-500 text-[#1F2937] dark:text-gray-800 px-2 py-1 rounded-full text-xs font-bold backdrop-blur-lg animate-pulse">
                      🔥 Trending
                    </span>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-lg ${getCategoryColor(article.category)}`}>
                    {article.category}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Article Content */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>{article.publishDate}</span>
                  <span>{article.readTime}</span>
                </div>

                <h3 className="font-bold text-[#1F2937] dark:text-white text-lg leading-tight group-hover:text-[#007AFF] dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  {article.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3">
                  {article.excerpt}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#007AFF] to-[#0056CC] rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-medium text-xs">
                        {article.author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{article.author}</span>
                  </div>
                  <button 
                    onClick={() => onNavigate('updates')}
                    className="text-[#007AFF] dark:text-blue-400 hover:text-[#0056CC] dark:hover:text-blue-300 transition-all duration-300 hover:scale-110"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>
        ) : displayArticles.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No updates available at the moment. Check back soon!</p>
          </div>
        ) : null}

        {/* Newsletter Subscription */}
        <div className={`bg-gradient-to-r from-[#007AFF] to-[#0056CC] dark:from-blue-600 dark:to-blue-800 rounded-3xl p-8 lg:p-12 text-center text-white relative overflow-hidden transform transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {/* Background animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 hover:opacity-100 transition-opacity duration-700 animate-gradient-x"></div>
          
          <div className="max-w-3xl mx-auto relative z-10">
            <h3 className="text-2xl lg:text-3xl font-bold mb-4">
              Never Miss Important Updates
            </h3>
            <p className="text-lg mb-8 opacity-90">
              Subscribe to our newsletter and get the latest finance news, tax updates, and expert insights delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 rounded-xl text-[#1F2937] dark:text-gray-800 bg-white dark:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all duration-300"
              />
              <button 
                onClick={() => onNavigate('login')}
                className="group bg-white dark:bg-gray-100 text-[#007AFF] dark:text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 dark:hover:bg-white transition-all duration-300 whitespace-nowrap transform hover:-translate-y-1 hover:scale-105"
              >
                <span className="flex items-center justify-center">
                  Subscribe Now
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </button>
            </div>
            <p className="text-sm mt-4 opacity-75">
              Join 25,000+ professionals who stay updated with Facto
            </p>
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
