import { useState, useEffect } from 'react';
import { Footer } from './Footer';
import { fetchBlogs, fetchBlogById, Blog } from '../api/blogs';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment';

interface UpdatesProps {
  onNavigate: (page: PageType) => void;
}

export function Updates({ onNavigate: _onNavigate }: UpdatesProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>(['All']);

  // Fetch blogs from API
  useEffect(() => {
    const loadBlogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchBlogs(1, 50); // Fetch first 50 blogs
        setBlogs(result.blogs);
        
        // Extract unique categories from tags
        const uniqueTags = new Set<string>();
        result.blogs.forEach(blog => {
          blog.tags?.forEach(tag => uniqueTags.add(tag));
        });
        const tagArray = Array.from(uniqueTags).sort();
        setCategories(['All', ...tagArray]);
      } catch (err: any) {
        console.error('Error loading blogs:', err);
        setError('Failed to load updates. Please try again later.');
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

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
      month: 'long', 
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
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-white dark:from-gray-900 dark:to-gray-800 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Financial <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AFF] to-[#00C897]">Updates</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Stay informed with the latest financial news, regulatory updates, and industry insights
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-[#007AFF] to-[#00C897] text-white shadow-lg transform scale-105'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#007AFF]"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading updates...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="text-red-500 text-lg mb-4">{error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-[#007AFF] text-white px-6 py-2 rounded-lg hover:bg-[#0056CC] transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredBlogs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No updates available in this category.</p>
          </div>
        )}

        {/* Blogs Grid */}
        {!loading && !error && filteredBlogs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((blog) => {
              const thumbnail = blog.contentType === 'image' ? blog.contentUrl : undefined;
              const readTime = calculateReadTime(blog.content);
              const primaryTag = blog.tags?.[0] || 'Updates';
              
              return (
                <article
                  key={blog._id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer"
                  onClick={() => setSelectedBlog(blog)}
                >
                  {/* Thumbnail */}
                  {thumbnail && (
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={thumbnail}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(primaryTag)}`}>
                          {primaryTag}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(blog.createdAt)}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {readTime}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-[#007AFF] transition-colors duration-300 line-clamp-2">
                      {blog.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                      {blog.content.substring(0, 150)}...
                    </p>

                    {/* Author Info */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#007AFF] to-[#00C897] rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {getAuthorInitials(blog.author)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{blog.author}</p>
                      </div>
                    </div>

                    {/* Tags */}
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {blog.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full"
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#007AFF] to-[#00C897] rounded-full flex items-center justify-center text-white font-bold">
                    {getAuthorInitials(selectedBlog.author)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedBlog.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      By {selectedBlog.author} • {formatDate(selectedBlog.createdAt)} • {calculateReadTime(selectedBlog.content)}
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
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {selectedBlog.contentType === 'image' && selectedBlog.contentUrl && (
                  <img
                    src={selectedBlog.contentUrl}
                    alt={selectedBlog.title}
                    className="w-full h-64 object-cover rounded-lg mb-6"
                  />
                )}
                
                {selectedBlog.contentType === 'video' && selectedBlog.contentUrl && (
                  <div className="w-full aspect-video mb-6">
                    <iframe
                      src={selectedBlog.contentUrl}
                      className="w-full h-full rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
                
                {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                  <div className="flex items-center space-x-4 mb-6">
                    {selectedBlog.tags.map((tag, index) => (
                      <span key={index} className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(tag)}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed whitespace-pre-wrap">
                    {selectedBlog.content}
                  </p>
                </div>

                {selectedBlog.reference && (
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Reference:</p>
                    <a 
                      href={selectedBlog.reference.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#007AFF] hover:underline font-medium"
                    >
                      {selectedBlog.reference.title}
                    </a>
                  </div>
                )}

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Published on {formatDate(selectedBlog.createdAt)} • {calculateReadTime(selectedBlog.content)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
