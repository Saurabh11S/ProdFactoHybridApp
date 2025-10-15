import { useState } from 'react';
import { Footer } from './Footer';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment';

interface UpdatesProps {
  onNavigate: (page: PageType) => void;
}

interface Update {
  id: number;
  title: string;
  description: string;
  content: string;
  thumbnail?: string;
  date: string;
  category: string;
  author: string;
  authorAvatar: string;
  readTime: string;
  isRead: boolean;
  tags: string[];
}

const updates: Update[] = [
  {
    id: 1,
    title: 'New GST Rate Changes Effective from April 2024',
    description: 'Important updates to GST rates that will affect your business operations and tax calculations.',
    content: 'The government has announced several changes to GST rates effective from April 1, 2024. These changes primarily affect the hospitality sector, textiles, and certain electronic goods. Business owners are advised to update their accounting systems and inform their customers about the new rates.',
    thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop',
    date: '2024-03-15',
    category: 'GST Updates',
    author: 'CA Rajesh Kumar',
    authorAvatar: '👨‍💼',
    readTime: '3 min read',
    isRead: false,
    tags: ['GST', 'Tax Updates', 'Business']
  },
  {
    id: 2,
    title: 'Income Tax Return Filing Deadline Extended',
    description: 'ITR filing deadline for FY 2023-24 has been extended to July 31, 2024. Here\'s what you need to know.',
    content: 'The Income Tax Department has extended the deadline for filing Income Tax Returns for the financial year 2023-24. The new deadline is July 31, 2024, giving taxpayers additional time to gather necessary documents and file their returns accurately.',
    thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=250&fit=crop',
    date: '2024-03-12',
    category: 'Tax News',
    author: 'Tax Expert Team',
    authorAvatar: '📊',
    readTime: '2 min read',
    isRead: true,
    tags: ['Income Tax', 'Deadline', 'ITR']
  },
  {
    id: 3,
    title: 'Digital Banking Security Best Practices',
    description: 'Learn how to protect your financial data in the digital age with these essential security tips.',
    content: 'With the increasing adoption of digital banking, it\'s crucial to understand and implement proper security measures. This article covers the latest security best practices, including two-factor authentication, secure password management, and recognizing phishing attempts.',
    thumbnail: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=250&fit=crop',
    date: '2024-03-10',
    category: 'Security',
    author: 'Security Expert',
    authorAvatar: '🔒',
    readTime: '5 min read',
    isRead: false,
    tags: ['Security', 'Digital Banking', 'Privacy']
  },
  {
    id: 4,
    title: 'MSME Registration Benefits and Process',
    description: 'Complete guide to MSME registration and the benefits it offers to small and medium enterprises.',
    content: 'MSME registration provides numerous benefits including easier access to credit, government schemes, and preferential treatment in government tenders. This comprehensive guide walks you through the registration process and highlights all the advantages available to registered MSMEs.',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop',
    date: '2024-03-08',
    category: 'Business',
    author: 'Business Advisor',
    authorAvatar: '🏢',
    readTime: '4 min read',
    isRead: false,
    tags: ['MSME', 'Business Registration', 'Government Schemes']
  },
  {
    id: 5,
    title: 'Investment Trends for 2024',
    description: 'Explore the top investment opportunities and trends that are shaping the financial landscape this year.',
    content: 'The investment landscape continues to evolve with new opportunities emerging in various sectors. From sustainable investments to technology stocks, this analysis covers the most promising investment trends for 2024 and provides insights for both beginners and experienced investors.',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop',
    date: '2024-03-05',
    category: 'Investments',
    author: 'Investment Analyst',
    authorAvatar: '📈',
    readTime: '6 min read',
    isRead: true,
    tags: ['Investments', 'Market Trends', 'Financial Planning']
  },
  {
    id: 6,
    title: 'Company Incorporation Process Simplified',
    description: 'Step-by-step guide to incorporating your business with the latest regulatory changes.',
    content: 'The company incorporation process has been significantly simplified with the introduction of online portals and streamlined procedures. This guide covers everything from name reservation to obtaining the certificate of incorporation, including the latest regulatory updates.',
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=250&fit=crop',
    date: '2024-03-03',
    category: 'Legal',
    author: 'Legal Expert',
    authorAvatar: '⚖️',
    readTime: '7 min read',
    isRead: false,
    tags: ['Company Law', 'Incorporation', 'Legal Compliance']
  }
];

const categories = ['All', 'GST Updates', 'Tax News', 'Security', 'Business', 'Investments', 'Legal'];

export function Updates({ }: UpdatesProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedUpdate, setSelectedUpdate] = useState<Update | null>(null);
  const [updatesData, setUpdatesData] = useState(updates);

  const filteredUpdates = selectedCategory === 'All' 
    ? updatesData 
    : updatesData.filter(update => update.category === selectedCategory);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const markAsRead = (id: number) => {
    setUpdatesData(prev => prev.map(update => 
      update.id === id ? { ...update, isRead: true } : update
    ));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'GST Updates': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Tax News': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Security': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'Business': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Investments': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Legal': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
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

        {/* Updates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredUpdates.map((update) => (
            <article
              key={update.id}
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer ${
                !update.isRead ? 'ring-2 ring-[#007AFF] ring-opacity-50' : ''
              }`}
              onClick={() => {
                setSelectedUpdate(update);
                markAsRead(update.id);
              }}
            >
              {/* Thumbnail */}
              {update.thumbnail && (
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={update.thumbnail}
                    alt={update.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(update.category)}`}>
                      {update.category}
                    </span>
                  </div>
                  {!update.isRead && (
                    <div className="absolute top-4 right-4">
                      <div className="w-3 h-3 bg-[#007AFF] rounded-full"></div>
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(update.date)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {update.readTime}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-[#007AFF] transition-colors duration-300 line-clamp-2">
                  {update.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                  {update.description}
                </p>

                {/* Author Info */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#007AFF] to-[#00C897] rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {update.authorAvatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{update.author}</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {update.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Update Detail Modal */}
        {selectedUpdate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#007AFF] to-[#00C897] rounded-full flex items-center justify-center text-white font-bold">
                    {selectedUpdate.authorAvatar}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedUpdate.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      By {selectedUpdate.author} • {formatDate(selectedUpdate.date)} • {selectedUpdate.readTime}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUpdate(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {selectedUpdate.thumbnail && (
                  <img
                    src={selectedUpdate.thumbnail}
                    alt={selectedUpdate.title}
                    className="w-full h-64 object-cover rounded-lg mb-6"
                  />
                )}
                
                <div className="flex items-center space-x-4 mb-6">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedUpdate.category)}`}>
                    {selectedUpdate.category}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedUpdate.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-6">
                  {selectedUpdate.content}
                </p>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Published on {formatDate(selectedUpdate.date)} • {selectedUpdate.readTime}
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

