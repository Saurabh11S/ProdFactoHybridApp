import { useState, useEffect } from 'react';
import { Footer } from './Footer';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment';

interface ShortsProps {
  onNavigate: (page: PageType) => void;
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
  category: string;
  creator: string;
  creatorAvatar: string;
  isLiked: boolean;
}

const shorts: Short[] = [
  {
    id: 1,
    title: '5 Tax Saving Tips Under 80C',
    description: 'Quick tips to maximize your tax savings legally',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '0:45',
    views: 12500,
    likes: 890,
    category: 'Tax Tips',
    creator: 'CA Priya',
    creatorAvatar: '👩‍💼',
    isLiked: false
  },
  {
    id: 2,
    title: 'GST Rate Changes 2024',
    description: 'Latest GST updates you need to know',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '1:20',
    views: 8900,
    likes: 567,
    category: 'GST',
    creator: 'Tax Expert',
    creatorAvatar: '👨‍💼',
    isLiked: true
  },
  {
    id: 3,
    title: 'Investment Mistakes to Avoid',
    description: 'Common investment pitfalls and how to avoid them',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '0:58',
    views: 15600,
    likes: 1200,
    category: 'Investments',
    creator: 'Finance Guru',
    creatorAvatar: '💰',
    isLiked: false
  },
  {
    id: 4,
    title: 'Business Registration Process',
    description: 'Step-by-step business registration guide',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '1:15',
    views: 9800,
    likes: 445,
    category: 'Business',
    creator: 'Legal Expert',
    creatorAvatar: '⚖️',
    isLiked: false
  },
  {
    id: 5,
    title: 'Digital Banking Security',
    description: 'How to keep your digital banking safe',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '0:42',
    views: 11200,
    likes: 789,
    category: 'Security',
    creator: 'Tech Expert',
    creatorAvatar: '🔒',
    isLiked: true
  },
  {
    id: 6,
    title: 'Budget Planning for 2024',
    description: 'Create an effective budget for the new year',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '1:05',
    views: 18700,
    likes: 1340,
    category: 'Planning',
    creator: 'Budget Coach',
    creatorAvatar: '📊',
    isLiked: false
  },
  {
    id: 7,
    title: 'Credit Score Improvement',
    description: 'Quick ways to boost your credit score',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '0:52',
    views: 14200,
    likes: 923,
    category: 'Credit',
    creator: 'Credit Advisor',
    creatorAvatar: '📈',
    isLiked: false
  },
  {
    id: 8,
    title: 'Emergency Fund Basics',
    description: 'Why you need an emergency fund and how to build it',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '1:10',
    views: 16800,
    likes: 1156,
    category: 'Savings',
    creator: 'Financial Planner',
    creatorAvatar: '🏦',
    isLiked: true
  }
];

export function Shorts({ onNavigate: _onNavigate }: ShortsProps) {
  const [currentShort, setCurrentShort] = useState(0);
  const [shortsData, setShortsData] = useState(shorts);
  const [isPlaying, setIsPlaying] = useState(false);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handleLike = (id: number) => {
    setShortsData(prev => prev.map(short => 
      short.id === id 
        ? { 
            ...short, 
            isLiked: !short.isLiked,
            likes: short.isLiked ? short.likes - 1 : short.likes + 1
          }
        : short
    ));
  };

  const handleNext = () => {
    setCurrentShort((prev) => (prev + 1) % shortsData.length);
    setIsPlaying(false);
  };

  const handlePrevious = () => {
    setCurrentShort((prev) => (prev - 1 + shortsData.length) % shortsData.length);
    setIsPlaying(false);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') handleNext();
      if (e.key === 'ArrowUp') handlePrevious();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const currentShortData = shortsData[currentShort];

  return (
    <div className="min-h-screen bg-black dark:bg-gray-900 pt-20">
      <div className="max-w-md mx-auto h-screen relative">
        {/* Main Video Container */}
        <div className="relative h-full bg-gray-900 rounded-lg overflow-hidden">
          {/* Video Thumbnail/Player */}
          <div className="relative w-full h-full">
            <img
              src={currentShortData.thumbnail}
              alt={currentShortData.title}
              className="w-full h-full object-cover"
            />
            
            {/* Play Button Overlay */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <button
                  onClick={() => setIsPlaying(true)}
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300"
                >
                  <svg className="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
              </div>
            )}

            {/* Video Player */}
            {isPlaying && (
              <iframe
                src={currentShortData.videoUrl}
                title={currentShortData.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}

            {/* Video Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                  {currentShortData.duration}
                </span>
                <span className="bg-[#007AFF] text-white px-2 py-1 rounded text-xs font-medium">
                  {currentShortData.category}
                </span>
              </div>
              
              <h3 className="text-white text-lg font-bold mb-2">
                {currentShortData.title}
              </h3>
              
              <p className="text-gray-300 text-sm mb-3">
                {currentShortData.description}
              </p>

              {/* Creator Info */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#007AFF] to-[#00C897] rounded-full flex items-center justify-center text-white font-bold">
                  {currentShortData.creatorAvatar}
                </div>
                <div>
                  <p className="text-white font-medium">{currentShortData.creator}</p>
                  <p className="text-gray-400 text-xs">{formatNumber(currentShortData.views)} views</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="absolute right-4 bottom-20 flex flex-col space-y-4">
            {/* Like Button */}
            <button
              onClick={() => handleLike(currentShortData.id)}
              className="flex flex-col items-center space-y-1"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                currentShortData.isLiked 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}>
                <svg className="w-6 h-6" fill={currentShortData.isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-white text-xs font-medium">
                {formatNumber(currentShortData.likes)}
              </span>
            </button>

            {/* Share Button */}
            <button className="flex flex-col items-center space-y-1">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white hover:bg-opacity-30 transition-all duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
              <span className="text-white text-xs font-medium">Share</span>
            </button>

            {/* More Button */}
            <button className="flex flex-col items-center space-y-1">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white hover:bg-opacity-30 transition-all duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </div>
            </button>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white hover:bg-opacity-30 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white hover:bg-opacity-30 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {shortsData.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentShort ? 'bg-white' : 'bg-white bg-opacity-30'
              }`}
            />
          ))}
        </div>

        {/* Instructions */}
        <div className="absolute top-4 left-4 text-white text-sm opacity-70">
          <p>Use ↑↓ arrow keys or swipe to navigate</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

