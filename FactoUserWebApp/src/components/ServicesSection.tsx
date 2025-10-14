import React, { useState, useEffect, useRef } from 'react';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile';

interface ServicesSectionProps {
  onNavigate: (page: PageType, serviceId?: string) => void;
}

export function ServicesSection({ onNavigate }: ServicesSectionProps) {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  const services = [
    {
      icon: '📊',
      title: 'ITR Filing',
      description: 'Professional income tax return filing for individuals and businesses',
      features: ['Salaried Employees', 'Freelancers', 'Business Owners', 'NRI Returns'],
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/30',
      textColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-700'
    },
    {
      icon: '🏢',
      title: 'GST Services',
      description: 'Complete GST registration, filing, and compliance solutions',
      features: ['GST Registration', 'Monthly Returns', 'Annual Returns', 'Compliance'],
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/30',
      textColor: 'text-green-600 dark:text-green-400',
      borderColor: 'border-green-200 dark:border-green-700'
    },
    {
      icon: '📋',
      title: 'MSME Registration',
      description: 'Quick and hassle-free MSME registration for small businesses',
      features: ['Udyam Registration', 'Benefits Guide', 'Documentation', 'Fast Processing'],
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/30',
      textColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-200 dark:border-purple-700'
    },
    {
      icon: '💼',
      title: 'Accounting',
      description: 'Professional bookkeeping and accounting services',
      features: ['Monthly Books', 'Financial Reports', 'MIS Reports', 'Audit Support'],
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/30',
      textColor: 'text-orange-600 dark:text-orange-400',
      borderColor: 'border-orange-200 dark:border-orange-700'
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cardIndex = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleCards(prev => [...new Set([...prev, cardIndex])]);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    const cards = sectionRef.current?.querySelectorAll('[data-index]');
    cards?.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-white dark:bg-gray-900 relative overflow-hidden" id="services">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[#007AFF]/10 to-[#00C897]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[#FFD166]/10 to-[#007AFF]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#007AFF]/10 to-[#00C897]/10 dark:from-[#007AFF]/20 dark:to-[#00C897]/20 rounded-full text-sm font-medium text-[#007AFF] dark:text-blue-400 mb-4 backdrop-blur-lg border border-[#007AFF]/20 dark:border-blue-400/20">
            Our Services
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Professional <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AFF] to-[#00C897]">Financial Services</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-200 max-w-3xl mx-auto">
            From tax filing to business registration, we provide comprehensive financial solutions 
            tailored for Indian individuals and small businesses.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              data-index={index}
              className={`group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:border-[#007AFF]/30 dark:hover:border-blue-400/30 shadow-lg hover:shadow-2xl transition-all duration-700 transform ${
                visibleCards.includes(index) 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              } hover:-translate-y-4 hover:scale-105`}
              style={{ 
                transitionDelay: visibleCards.includes(index) ? `${index * 150}ms` : '0ms' 
              }}
            >
              {/* Glassmorphism overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-white/5 dark:to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              
              {/* Service Icon */}
              <div className={`relative w-16 h-16 ${service.bgColor} rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-all duration-300 border ${service.borderColor} shadow-lg`}>
                <span className="relative z-10">{service.icon}</span>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Service Content */}
              <div className="relative space-y-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-[#007AFF] dark:group-hover:text-blue-400 transition-colors duration-300">
                  {service.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-200 text-sm leading-relaxed">
                  {service.description}
                </p>

                {/* Features List */}
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-600 dark:text-gray-200 transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: `${featureIndex * 50}ms` }}>
                      <div className={`w-4 h-4 ${service.textColor} mr-2 flex-shrink-0 transform scale-100 group-hover:scale-110 transition-transform duration-300`}>
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="group-hover:text-white dark:group-hover:text-white transition-colors duration-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button 
                  onClick={() => onNavigate('services')}
                  className={`relative w-full mt-6 bg-gradient-to-r ${service.color} text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 overflow-hidden group-hover:shadow-2xl hover:brightness-110`}
                >
                  <span className="relative z-10">Get Started</span>
                </button>
              </div>

              {/* Floating particles on hover */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br from-[#007AFF] to-[#00C897] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-bounce"></div>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-gradient-to-br from-[#FFD166] to-[#FFA500] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-16 text-center bg-gradient-to-r from-[#007AFF]/10 to-[#00C897]/10 dark:from-[#007AFF]/20 dark:to-[#00C897]/20 rounded-2xl p-8 border border-[#007AFF]/20 dark:border-blue-400/20 backdrop-blur-lg relative overflow-hidden">
          {/* Background animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#007AFF]/5 via-[#00C897]/5 to-[#007AFF]/5 opacity-0 hover:opacity-100 transition-opacity duration-700 animate-gradient-x"></div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-[#1F2937] dark:text-white mb-4">
              Need Help Choosing the Right Service?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Our expert team can guide you through our services and help you find the perfect solution for your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => onNavigate('login')}
                className="group bg-[#007AFF] hover:bg-[#0056CC] text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 hover:scale-105"
              >
                <span className="flex items-center justify-center">
                  Schedule Free Consultation
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </button>
              <button 
                onClick={() => onNavigate('services')}
                className="group border border-[#007AFF] dark:border-blue-400 text-[#007AFF] dark:text-blue-400 hover:bg-[#007AFF] hover:text-white dark:hover:bg-blue-500 px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 hover:scale-105"
              >
                <span className="flex items-center justify-center">
                  View All Services
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
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