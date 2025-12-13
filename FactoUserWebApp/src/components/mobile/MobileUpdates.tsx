import { useState, useEffect, useRef } from 'react';
import { fetchBlogs, fetchBlogById, Blog } from '../../api/blogs';
import { getShareBaseUrl } from '../../config/appConfig';
import { useDarkMode } from '../DarkModeContext';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment';

interface MobileUpdatesProps {
  onNavigate: (page: PageType) => void;
}

export function MobileUpdates({ onNavigate: _onNavigate }: MobileUpdatesProps) {
  const { isDarkMode } = useDarkMode();
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const selectedBlogIdRef = useRef<string | null>(null);

  // Fetch blogs from API
  const loadBlogs = async (retryAttempt = 0) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchBlogs(1, 50);
      setBlogs(result.blogs);
      setRetryCount(0); // Reset retry count on success
    } catch (err: any) {
      console.error('Error loading blogs:', err);
      
      // Check if it's a network error and we should retry
      const isNetworkError = err?.code === 'ERR_NETWORK' || 
                            err?.code === 'ECONNABORTED' || 
                            err?.message?.includes('Network') ||
                            err?.message?.includes('timeout');
      
      // Retry up to 2 times for network errors (total 3 attempts)
      if (isNetworkError && retryAttempt < 2) {
        console.log(`Retrying blogs fetch (attempt ${retryAttempt + 1}/2)...`);
        setTimeout(() => {
          loadBlogs(retryAttempt + 1);
        }, 2000 * (retryAttempt + 1)); // Exponential backoff: 2s, 4s
        return;
      }
      
      // Set user-friendly error message
      let errorMessage = 'Failed to load updates. ';
      if (isNetworkError) {
        errorMessage += 'Please check your internet connection or the backend service may be starting up.';
      } else if (err?.message) {
        errorMessage += err.message;
      } else {
        errorMessage += 'Please try again later.';
      }
      
      setError(errorMessage);
      setBlogs([]);
      setRetryCount(retryAttempt);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  // Fetch full blog details when selected
  useEffect(() => {
    const blogId = selectedBlog?._id;
    if (blogId) {
      // Update ref to track current selection
      selectedBlogIdRef.current = blogId;
      
      const loadBlogDetails = async () => {
        try {
          const fullBlog = await fetchBlogById(blogId);
          // Only update if this is still the selected blog (prevent race conditions)
          if (selectedBlogIdRef.current === fullBlog._id) {
            setSelectedBlog(fullBlog);
          }
        } catch (err) {
          console.error('Error loading blog details:', err);
          // Even if fetch fails, keep the blog from the list visible
          // Don't clear selectedBlog on error
        }
      };
      loadBlogDetails();
    } else {
      selectedBlogIdRef.current = null;
    }
  }, [selectedBlog?._id]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    const scrollContainer = document.querySelector('[data-scroll-container]') as HTMLElement;
    if (scrollContainer) {
      if (selectedBlog) {
        scrollContainer.style.overflow = 'hidden';
      } else {
        scrollContainer.style.overflowY = 'auto';
      }
    }
    // Cleanup function to restore scrolling when component unmounts
    return () => {
      if (scrollContainer) {
        scrollContainer.style.overflowY = 'auto';
      }
    };
  }, [selectedBlog]);

  // Show all blogs since category filter UI is removed
  const filteredBlogs = blogs;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  const getCategoryColor = (tag: string) => {
    const colors: { [key: string]: string } = {
      'GST': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'Tax Updates': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'Income Tax': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'ITR': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'Tax News': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'Security': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      'Business': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      'Investments': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'Legal': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
      'MSME': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      'Company Law': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    };
    return colors[tag] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  };

  const getAuthorInitials = (author: string) => {
    return author.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className={`fixed inset-0 z-40 overflow-hidden pb-16 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`} style={{ pointerEvents: 'auto' }}>
      {/* Content Area - Shorts Style Vertical Scroll */}
      <div 
        data-scroll-container
        className={`pb-20 h-full snap-y snap-mandatory ${selectedBlog ? 'overflow-hidden' : 'overflow-y-auto'}`}
        style={{ 
          paddingTop: 'max(calc(env(safe-area-inset-top, 0px) + 4rem), 4rem)',
          WebkitOverflowScrolling: 'touch',
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden'
        }}
      >

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className={`inline-block animate-spin rounded-full h-8 w-8 border-b-2 ${isDarkMode ? 'border-white' : 'border-gray-900'}`}></div>
              <p className={`mt-4 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Loading updates...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex items-center justify-center h-full px-4">
            <div className={`${isDarkMode ? 'bg-black/60 backdrop-blur-md border-white/20' : 'bg-gray-100 backdrop-blur-md border-gray-300'} rounded-2xl p-6 text-center border max-w-md`}>
              <div className="mb-4">
                <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Unable to Load Updates</p>
                <p className={`text-sm mb-4 ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>{error}</p>
              </div>
              <button 
                onClick={() => {
                  setError(null);
                  setRetryCount(0);
                  loadBlogs(0);
                }}
                className="bg-[#007AFF] text-white px-6 py-3 rounded-xl font-medium active:scale-98 transition-transform"
              >
                Retry
              </button>
              {retryCount > 0 && (
                <p className={`text-xs mt-2 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>
                  Retried {retryCount} time{retryCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredBlogs.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className={isDarkMode ? 'text-white/70' : 'text-gray-600'}>No updates available in this category.</p>
          </div>
        )}

        {/* Blogs List - Shorts Style */}
        {!loading && !error && filteredBlogs.length > 0 && (
          <div className="space-y-0 snap-y snap-mandatory">
            {filteredBlogs.map((blog, index) => {
              const thumbnail = blog.contentType === 'image' ? blog.contentUrl : undefined;
              const readTime = calculateReadTime(blog.content);
              const primaryTag = blog.tags?.[0] || 'Updates';
              
              return (
                <article
                  key={blog._id}
                  className="relative w-full h-screen flex-shrink-0 snap-start cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Set the blog immediately to ensure modal opens with correct data
                    // Use a function to ensure we're setting the exact blog object
                    setSelectedBlog(() => blog);
                    // Update ref immediately to prevent race conditions
                    selectedBlogIdRef.current = blog._id;
                  }}
                  style={{
                    contentVisibility: index > 2 ? 'auto' : 'visible',
                    containIntrinsicSize: 'auto 100vh'
                  }}
                >
                  {/* Full Screen Image/Content */}
                  <div className="absolute inset-0">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#007AFF] to-[#00C897] flex items-center justify-center">
                        <div className="text-white text-6xl">📰</div>
                      </div>
                    )}
                    
                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  </div>

                  {/* Content Overlay - Bottom Left (Shorts Style) */}
                  <div className="absolute bottom-0 left-0 p-4 pb-24 z-10 max-w-[70%]">
                    {/* Author Info */}
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#007AFF] to-[#00C897] rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {getAuthorInitials(blog.author)}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">
                          {blog.author}
                        </p>
                        <p className="text-white/70 text-xs">
                          {formatDate(blog.createdAt)} • {readTime}
                        </p>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-white text-lg font-bold mb-2 line-clamp-3">
                      {blog.title}
                    </h3>

                    {/* Description */}
                    <p className="text-white/90 text-sm mb-3 line-clamp-2">
                      {blog.content.substring(0, 150)}...
                    </p>

                    {/* Category Tag */}
                    <div className="mb-3">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                        {primaryTag}
                      </span>
                    </div>
                  </div>

                  {/* Share Button - Right Side (Shorts Style) */}
                  <div className="absolute right-3 bottom-28 flex flex-col items-center space-y-4 z-10">
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const baseUrl = getShareBaseUrl();
                          const shareUrl = `${baseUrl}/updates`;
                          const shareText = `${blog.title}\n\n${blog.content.substring(0, 100)}...`;
                          
                          if (navigator.share) {
                            await navigator.share({
                              title: blog.title,
                              text: shareText,
                              url: shareUrl
                            });
                          } else {
                            await navigator.clipboard.writeText(shareUrl);
                            alert('Link copied to clipboard!');
                          }
                        } catch (error) {
                          console.log('Share cancelled or failed');
                        }
                      }}
                      className="flex flex-col items-center space-y-1 active:scale-95 transition-transform"
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
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Blog Detail Modal - Outside scroll container for proper positioning */}
      {selectedBlog && (
        <div 
          key={`modal-${selectedBlog._id}`}
          className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[100000]" 
          style={{ 
            zIndex: 100000,
            paddingTop: 'max(calc(env(safe-area-inset-top, 0px) + 4rem + 0.5rem), calc(64px + 0.5rem))', // Header height + small gap
            paddingBottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 4rem + 0.5rem), calc(64px + 0.5rem))', // Bottom tab bar height + small gap
            paddingLeft: '0.75rem',
            paddingRight: '0.75rem'
          }}
          onClick={() => {
            setSelectedBlog(null);
            selectedBlogIdRef.current = null;
          }}
        >
          <div 
            className="bg-gray-900 dark:bg-gray-800 backdrop-blur-xl rounded-2xl w-full max-w-2xl overflow-hidden border-2 border-white/30 shadow-2xl relative flex flex-col" 
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
              maxHeight: 'calc(100vh - 8rem - 1rem)', // Account for header (4rem) + bottom bar (4rem) + gaps (1rem)
              height: 'auto'
            }}
          >
            {/* Sticky Header with Clear Close Button */}
            <div className="flex items-center justify-between p-4 border-b-2 border-white/30 sticky top-0 bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur-xl z-20">
              <div className="flex items-center space-x-3 flex-1 min-w-0 pr-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#007AFF] to-[#00C897] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {getAuthorInitials(selectedBlog.author)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white line-clamp-2">
                    {selectedBlog.title}
                  </h3>
                  <p className="text-xs text-white/70 mt-1">
                    {formatDate(selectedBlog.createdAt)}
                  </p>
                </div>
              </div>
              {/* Enhanced Close Button */}
              <button
                onClick={() => {
                  setSelectedBlog(null);
                  selectedBlogIdRef.current = null;
                }}
                className="text-white bg-red-500/90 hover:bg-red-600 rounded-full p-2.5 transition-all flex-shrink-0 shadow-lg hover:scale-110 active:scale-95"
                aria-label="Close"
                style={{
                  minWidth: '44px',
                  minHeight: '44px'
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1" style={{ WebkitOverflowScrolling: 'touch', minHeight: 0 }}>
              {selectedBlog.contentType === 'image' && selectedBlog.contentUrl && (
                <img
                  src={selectedBlog.contentUrl}
                  alt={selectedBlog.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                  loading="lazy"
                  decoding="async"
                />
              )}
              
              {selectedBlog.contentType === 'video' && selectedBlog.contentUrl && (
                <div className="w-full aspect-video mb-4">
                  <iframe
                    src={selectedBlog.contentUrl}
                    className="w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              
              {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                <div className="flex items-center space-x-2 mb-4 flex-wrap">
                    {selectedBlog.tags.map((tag, index) => (
                      <span key={index} className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(tag)}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

              <div className="prose max-w-none">
                <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedBlog.content}
                </p>
              </div>

              {selectedBlog.reference && (
                <div className="mt-4 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                  <p className="text-xs text-white/70 mb-1">Reference:</p>
                    <a 
                      href={selectedBlog.reference.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#60A5FA] hover:underline font-medium text-sm"
                    >
                      {selectedBlog.reference.title}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

