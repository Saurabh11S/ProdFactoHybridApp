import { useState, useEffect } from 'react';

type PageType = 'home' | 'services' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment';

interface HeroSectionProps {
  onNavigate: (page: PageType) => void;
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStatIndex, setCurrentStatIndex] = useState(0);

  const animatedStats = [
    { label: 'Happy Customers', value: '50,000+', icon: '👥' },
    { label: 'Tax Saved', value: '₹500Cr+', icon: '💰' },
    { label: 'Success Rate', value: '99.9%', icon: '✅' },
    { label: 'Processing Time', value: '24hrs', icon: '⚡' }
  ];

  useEffect(() => {
    setIsVisible(true);
    
    const interval = setInterval(() => {
      setCurrentStatIndex((prev) => (prev + 1) % animatedStats.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F9FAFB] via-white to-[#F0F9FF] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-[#007AFF]/20 to-[#00C897]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-gradient-to-br from-[#FFD166]/20 to-[#007AFF]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-40 h-40 bg-gradient-to-br from-[#00C897]/20 to-[#FFD166]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Glassmorphism Cards */}
        <div className="absolute top-20 right-10 w-20 h-20 bg-white/10 dark:bg-white/5 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-white/10 shadow-lg animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3s' }}>
          <div className="w-full h-full flex items-center justify-center text-2xl">📊</div>
        </div>
        <div className="absolute bottom-32 left-10 w-16 h-16 bg-white/10 dark:bg-white/5 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-white/10 shadow-lg animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '4s' }}>
          <div className="w-full h-full flex items-center justify-center text-xl">💼</div>
        </div>
        
        {/* Gradient Mesh */}
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-blue-50/30 dark:from-blue-900/20 to-transparent rounded-full blur-3xl transform rotate-12"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-green-50/20 dark:from-green-900/20 to-transparent rounded-full blur-3xl transform -rotate-12"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="inline-flex items-center px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-full text-sm font-medium text-[#007AFF] mb-6 border border-white/20 dark:border-gray-700/20 shadow-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Trusted by 50,000+ Indians
              </div>
            </div>

            <div className={`transform transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 dark:text-white leading-tight mb-6">
                Get Your <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AFF] via-[#00C897] to-[#007AFF] animate-gradient-x">
                    Taxes & Finances
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#007AFF] via-[#00C897] to-[#007AFF] opacity-20 blur-xl animate-pulse"></div>
                </span> Sorted with Facto
              </h1>
            </div>

            <div className={`transform transition-all duration-1000 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-200 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Professional tax filing, GST services, and business registration made simple. 
                Join thousands of satisfied customers who trust Facto for their financial needs.
              </p>
            </div>

            {/* Animated CTA Buttons */}
            <div className={`transform transition-all duration-1000 delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <button
                  onClick={() => onNavigate('service-details')}
                  className="group relative bg-gradient-to-r from-[#007AFF] to-[#0056CC] text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 flex items-center justify-center overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0056CC] to-[#007AFF] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative mr-2">📊</span>
                  <span className="relative">File ITR Now</span>
                  <svg className="relative w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl animate-pulse"></div>
                </button>
                
                <button
                  onClick={() => onNavigate('services')}
                  className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg text-[#007AFF] dark:text-blue-400 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-[#007AFF]/30 dark:border-blue-400/30 hover:bg-[#007AFF] hover:text-white dark:hover:bg-blue-500 dark:hover:text-white transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-2xl transform hover:-translate-y-2"
                >
                  <span className="mr-2">🏢</span>
                  Start GST Filing
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Animated Trust Indicators */}
            <div className={`transform transition-all duration-1000 delay-800 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-600 dark:text-gray-200">
                <div className="flex items-center group">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#00C897] to-[#00A86B] rounded-full flex items-center justify-center mr-2 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Verified CA Partners
                </div>
                <div className="flex items-center group">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#007AFF] to-[#0056CC] rounded-full flex items-center justify-center mr-2 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Secure Payments
                </div>
                <div className="flex items-center group">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#FFD166] to-[#FFA500] rounded-full flex items-center justify-center mr-2 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-4 h-4 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  24/7 Support
                </div>
              </div>
            </div>
          </div>

          {/* Why Choose Facto - Key Features Card */}
          <div className={`relative transform transition-all duration-1000 delay-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="relative z-10">
              {/* Main Features Card */}
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/20 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-800 dark:text-white text-xl">Why Choose Facto?</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-[#00C897] text-sm font-medium">Trusted</span>
                    </div>
                  </div>
                  
                  {/* Key Features Grid */}
                  <div className="grid grid-cols-1 gap-4">
                    {/* Feature 1: Expert CA Support */}
                    <div className="group bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200/50 dark:border-blue-700/50 transform hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#007AFF] to-[#0056CC] rounded-xl flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                          👨‍💼
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 dark:text-white mb-1">Expert CA Partners</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Verified Chartered Accountants ensure accurate filing and maximum tax savings</p>
                        </div>
                      </div>
                    </div>

                    {/* Feature 2: Fast & Easy */}
                    <div className="group bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/30 dark:to-green-800/20 p-4 rounded-xl border border-green-200/50 dark:border-green-700/50 transform hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#00C897] to-[#00A86B] rounded-xl flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                          ⚡
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 dark:text-white mb-1">Fast & Hassle-Free</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Complete your filing in just 15 minutes with our streamlined process</p>
                        </div>
                      </div>
                    </div>

                    {/* Feature 3: Secure & Compliant */}
                    <div className="group bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/30 dark:to-purple-800/20 p-4 rounded-xl border border-purple-200/50 dark:border-purple-700/50 transform hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#9333EA] to-[#7C3AED] rounded-xl flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                          🔒
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 dark:text-white mb-1">Secure & Compliant</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Bank-level encryption and 100% compliance with tax regulations</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats Banner */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-[#007AFF]/10 via-[#00C897]/10 to-[#007AFF]/10 dark:from-[#007AFF]/20 dark:via-[#00C897]/20 dark:to-[#007AFF]/20 rounded-xl border border-[#007AFF]/20 dark:border-[#007AFF]/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#007AFF] to-[#00C897] rounded-full flex items-center justify-center text-white text-lg animate-pulse">
                          {animatedStats[currentStatIndex].icon}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800 dark:text-white text-lg">
                            {animatedStats[currentStatIndex].value}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-200">
                            {animatedStats[currentStatIndex].label}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        {animatedStats.map((_, index) => (
                          <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              index === currentStatIndex ? 'bg-[#007AFF]' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => onNavigate('services')}
                    className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-[#007AFF] to-[#00C897] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group"
                  >
                    <span className="mr-2">Explore All Services</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-[#FFD166]/30 to-[#FFA500]/30 rounded-full opacity-60 blur-xl animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-[#00C897]/30 to-[#00A86B]/30 rounded-full opacity-60 blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400 mb-2">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-gray-300 dark:border-gray-600 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 dark:bg-gray-500 rounded-full mt-2 animate-bounce"></div>
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
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </section>
  );
}
