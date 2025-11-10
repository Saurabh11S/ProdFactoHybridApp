import { useState, useEffect, useCallback } from "react";
import { Footer } from "./Footer";

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile';

interface ShortsProps {
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
  // Example: { videoId: 'ANOTHER_VIDEO_ID', title: "Video Title", description: "Description", duration: "0:45", views: 5000, likes: 50, comments: 5, category: "Category", creator: "@KRISHNA5-5-5", creatorAvatar: "👤" },
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

export function Shorts({}: ShortsProps) {
  const [currentShort, setCurrentShort] = useState(0);
  const [shortsData, setShortsData] = useState(shorts);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const handleLike = (id: number) => {
    setShortsData((prev) =>
      prev.map((short) =>
        short.id === id
          ? {
              ...short,
              isLiked: !short.isLiked,
              isDisliked: short.isLiked ? false : short.isDisliked,
              likes: short.isLiked ? short.likes - 1 : short.likes + 1,
            }
          : short
      )
    );
  };

  const handleDislike = (id: number) => {
    setShortsData((prev) =>
      prev.map((short) =>
        short.id === id
          ? {
              ...short,
              isDisliked: !short.isDisliked,
              isLiked: short.isDisliked ? false : short.isLiked,
              likes: short.isLiked && short.isDisliked ? short.likes - 1 : short.likes,
            }
          : short
      )
    );
  };

  const handleNext = useCallback(() => {
    setCurrentShort((prev) => (prev + 1) % shortsData.length);
    setIsPlaying(false);
  }, [shortsData.length]);

  const handlePrevious = useCallback(() => {
    setCurrentShort(
      (prev) => (prev - 1 + shortsData.length) % shortsData.length
    );
    setIsPlaying(false);
  }, [shortsData.length]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") handleNext();
      if (e.key === "ArrowUp") handlePrevious();
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleNext, handlePrevious]);

  const currentShortData = shortsData[currentShort];

  return (
    <div className="min-h-screen bg-black pt-16">
      <div className="max-w-md mx-auto h-[calc(100vh-4rem)] relative bg-black">
        {/* Main Video Container - YouTube Shorts Style */}
        <div className="relative w-full h-full">
          {/* Video Thumbnail/Player */}
          <div className="relative w-full h-full">
            {!isPlaying ? (
              <img
                src={currentShortData.thumbnail}
                alt={currentShortData.title}
                className="w-full h-full object-cover"
              />
            ) : (
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
                  className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all"
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

            {/* Play Button Overlay */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <button
                  onClick={() => setIsPlaying(true)}
                  className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-2xl"
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

            {/* Creator Info - Left Side (YouTube Shorts Style) */}
            <div className="absolute bottom-0 left-0 p-4 pb-20 z-10 max-w-[60%]">
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
                <button className="px-4 py-1.5 bg-red-600 text-white rounded-full text-sm font-semibold hover:bg-red-700 transition-colors">
                  Subscribe
                </button>
              </div>

              {/* Video Title */}
              <h3 className="text-white text-base font-medium mb-2 line-clamp-2">
                {currentShortData.title}
              </h3>
            </div>

            {/* Action Buttons - Right Side (YouTube Shorts Style) */}
            <div className="absolute right-3 bottom-20 flex flex-col items-center space-y-5 z-10">
              {/* Like Button */}
              <button
                onClick={() => handleLike(currentShortData.id)}
                className="flex flex-col items-center space-y-1"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    currentShortData.isLiked
                      ? "bg-white text-red-500"
                      : "bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
                  }`}
                >
                  <svg
                    className="w-6 h-6"
                    fill={currentShortData.isLiked ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                </div>
                <span className="text-white text-xs font-medium">
                  {formatNumber(currentShortData.likes)}
                </span>
              </button>

              {/* Dislike Button */}
              <button
                onClick={() => handleDislike(currentShortData.id)}
                className="flex flex-col items-center space-y-1"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    currentShortData.isDisliked
                      ? "bg-white text-gray-800"
                      : "bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
                  }`}
                >
                  <svg
                    className="w-6 h-6"
                    fill={currentShortData.isDisliked ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                    />
                  </svg>
                </div>
                <span className="text-white text-xs font-medium">Dislike</span>
              </button>

              {/* Comments Button */}
              <button className="flex flex-col items-center space-y-1">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all">
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
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <span className="text-white text-xs font-medium">
                  {formatNumber(currentShortData.comments)}
                </span>
              </button>

              {/* Share Button */}
              <button className="flex flex-col items-center space-y-1">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all">
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

              {/* Remix Button */}
              <button className="flex flex-col items-center space-y-1">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all">
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
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <span className="text-white text-xs font-medium">Remix</span>
              </button>
            </div>

            {/* Download Button - Bottom Right */}
            <button className="absolute bottom-4 right-3 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all z-10">
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </button>
          </div>

          {/* Navigation - Swipe Up/Down Indicators */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="flex flex-col items-center space-y-2 opacity-0 hover:opacity-100 transition-opacity">
              <button
                onClick={handlePrevious}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Progress Indicator - Top */}
        <div className="absolute top-0 left-0 right-0 flex space-x-1 px-2 pt-2 z-20">
          {shortsData.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                index === currentShort ? "bg-white" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
