import { useState, useEffect, useRef } from 'react';

interface CarouselSlide {
  id: string;
  title: string;
  subtitle: string;
  value: string;
  icon: string;
  gradient: string;
  backgroundImage?: string;
}

interface AnimatedCarouselProps {
  slides: CarouselSlide[];
  autoPlayInterval?: number;
}

export function AnimatedCarousel({ slides, autoPlayInterval = 3000 }: AnimatedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPaused && slides.length > 1) {
      intervalRef.current = window.setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
      }, autoPlayInterval);
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, slides.length, autoPlayInterval]);

  const currentSlide = slides[currentIndex];

  return (
    <div 
      className="relative rounded-2xl overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setTimeout(() => setIsPaused(false), 5000)}
    >
      {/* Professional Dark Background */}
      <div className="bg-gradient-to-br from-[#0a1628] via-[#0f1b2e] to-[#152238] p-6">
        {/* Content Container */}
        <div className="relative flex items-center justify-between">
          {/* Left Side - Icon and Value */}
          <div className="flex items-center gap-4 flex-1">
            {/* Icon Container - Yellow Accent */}
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400/20 to-yellow-500/10 border border-yellow-400/30 flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className={`text-2xl ${currentSlide.icon === '₹' ? 'text-yellow-400 font-bold' : ''}`}>
                {currentSlide.icon}
              </span>
            </div>
            
            {/* Value and Title */}
            <div className="flex-1 min-w-0">
              <div className="text-2xl font-bold text-white mb-0.5 leading-tight">
                {currentSlide.value}
              </div>
              <div className="text-xs text-white/60 font-medium uppercase tracking-wide">
                {currentSlide.title}
              </div>
            </div>
          </div>
        </div>

        {/* Slide Indicators - Subtle and Professional */}
        <div className="flex justify-center items-center gap-2 mt-6">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-500 ${
                index === currentIndex
                  ? 'w-6 bg-white/80'
                  : 'w-1.5 bg-white/30'
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

