import { useState, useEffect } from 'react';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile';

interface MobileLandingPageProps {
  onNavigate: (page: PageType) => void;
}

export function MobileLandingPage({ onNavigate }: MobileLandingPageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Show content after a brief delay
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const slides = [
    {
      icon: '📊',
      title: 'Tax Made Simple',
      description: 'File your ITR in minutes with expert guidance',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '📋',
      title: 'GST Compliance',
      description: 'Stay compliant with automated GST filing',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: '💰',
      title: 'Save More',
      description: 'Maximize your tax savings with smart planning',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const handleGetStarted = () => {
    onNavigate('home');
  };

  const handleSkip = () => {
    onNavigate('home');
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleGetStarted();
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#007AFF] via-[#0056CC] to-[#003D7A] z-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center px-6">
        {/* Skip Button */}
        <button
          onClick={handleSkip}
          className="absolute top-12 right-6 text-white/80 text-sm font-medium active:opacity-70 transition-opacity"
        >
          Skip
        </button>

        {/* Slide Content */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-sm w-full">
          {/* Icon Animation */}
          <div 
            className={`mb-8 transition-all duration-700 ${showContent ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
            style={{ transitionDelay: '0.2s' }}
          >
            <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${slides[currentSlide].color} flex items-center justify-center text-6xl shadow-2xl transform rotate-12 hover:rotate-0 transition-transform duration-500`}>
              {slides[currentSlide].icon}
            </div>
          </div>

          {/* Text Content */}
          <div 
            className={`text-center mb-12 transition-all duration-700 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
            style={{ transitionDelay: '0.4s' }}
          >
            <h1 className="text-4xl font-bold text-white mb-4">
              {slides[currentSlide].title}
            </h1>
            <p className="text-lg text-white/90 leading-relaxed">
              {slides[currentSlide].description}
            </p>
          </div>

          {/* Slide Indicators */}
          <div className="flex space-x-2 mb-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'w-8 bg-white' 
                    : 'w-2 bg-white/40'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div 
          className={`w-full max-w-sm pb-12 transition-all duration-700 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
          style={{ transitionDelay: '0.6s' }}
        >
          {currentSlide === slides.length - 1 ? (
            <button
              onClick={handleGetStarted}
              className="w-full bg-white text-[#007AFF] py-4 rounded-2xl font-bold text-lg shadow-2xl active:scale-95 transition-transform duration-200"
            >
              Get Started
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full bg-white/20 backdrop-blur-lg text-white border-2 border-white/30 py-4 rounded-2xl font-bold text-lg active:scale-95 transition-transform duration-200"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

