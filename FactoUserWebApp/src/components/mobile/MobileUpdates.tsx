import { useState, useEffect } from 'react';
import { fetchBlogs, fetchBlogById, Blog } from '../../api/blogs';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment';

interface MobileUpdatesProps {
  onNavigate: (page: PageType) => void;
}

export function MobileUpdates({ onNavigate: _onNavigate }: MobileUpdatesProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch blogs from API
  const loadBlogs = async (retryAttempt = 0) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchBlogs(1, 50);
      setBlogs(result.blogs);
      setRetryCount(0); // Reset retry count on success
      
      // Extract unique categories from tags
      const uniqueTags = new Set<string>();
      result.blogs.forEach(blog => {
        blog.tags?.forEach(tag => uniqueTags.add(tag));
      });
      const tagArray = Array.from(uniqueTags).sort();
      setCategories(['All', ...tagArray]);
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
    if (selectedBlog?._id) {
      const loadBlogDetails = async () => {
        try {
          const fullBlog = await fetchBlogById(selectedBlog._id);
          setSelectedBlog(fullBlog);
        } catch (err) {
          console.error('Error loading blog details:', err);
        }
      };
      loadBlogDetails();
    }
  }, [selectedBlog?._id]);

  const filteredBlogs = selectedCategory === 'All' 
    ? blogs 
    : blogs.filter(blog => blog.tags?.includes(selectedCategory));

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
    <div className="min-h-screen bg-white dark:bg-gray-900 pb-20 pt-16">
      <div className="px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Financial <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AFF] to-[#00C897]">Updates</span>
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Stay informed with the latest financial news and updates
          </p>
        </div>

        {/* Category Filter - Horizontal Scroll */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-[#007AFF] to-[#00C897] text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#007AFF]"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">Loading updates...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center border border-red-200 dark:border-red-800">
            <div className="mb-4">
              <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600 dark:text-red-400 font-medium mb-2">Unable to Load Updates</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</p>
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
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Retried {retryCount} time{retryCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredBlogs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No updates available in this category.</p>
          </div>
        )}

        {/* Blogs List */}
        {!loading && !error && filteredBlogs.length > 0 && (
          <div className="space-y-4">
            {filteredBlogs.map((blog) => {
              const thumbnail = blog.contentType === 'image' ? blog.contentUrl : undefined;
              const readTime = calculateReadTime(blog.content);
              const primaryTag = blog.tags?.[0] || 'Updates';
              
              return (
                <article
                  key={blog._id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden active:scale-98 transition-transform"
                  onClick={() => setSelectedBlog(blog)}
                >
                  {/* Thumbnail */}
                  {thumbnail && (
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={thumbnail}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(primaryTag)}`}>
                          {primaryTag}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(blog.createdAt)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {readTime}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {blog.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {blog.content.substring(0, 100)}...
                    </p>

                    {/* Author Info */}
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#007AFF] to-[#00C897] rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {getAuthorInitials(blog.author)}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-900 dark:text-white">{blog.author}</p>
                      </div>
                    </div>

                    {/* Tags */}
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {blog.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Blog Detail Modal */}
        {selectedBlog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedBlog(null)}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#007AFF] to-[#00C897] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {getAuthorInitials(selectedBlog.author)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
                      {selectedBlog.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {formatDate(selectedBlog.createdAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBlog(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
                {selectedBlog.contentType === 'image' && selectedBlog.contentUrl && (
                  <img
                    src={selectedBlog.contentUrl}
                    alt={selectedBlog.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
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

                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedBlog.content}
                  </p>
                </div>

                {selectedBlog.reference && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Reference:</p>
                    <a 
                      href={selectedBlog.reference.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#007AFF] hover:underline font-medium text-sm"
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
    </div>
  );
}

