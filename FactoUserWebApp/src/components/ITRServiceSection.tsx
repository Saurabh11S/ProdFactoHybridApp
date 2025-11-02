import { useState, useEffect, useRef } from 'react';
import { fetchAllSubServices, SubService } from '../api/services';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile';

interface ITRServiceSectionProps {
  onNavigate: (page: PageType, serviceId?: string) => void;
}

export function ITRServiceSection({ onNavigate }: ITRServiceSectionProps) {
  const [itrServices, setItrServices] = useState<SubService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [visibleCards, setVisibleCards] = useState<number[]>([]);

  // Fetch ITR services on component mount
  useEffect(() => {
    const loadITRServices = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAllSubServices();
        console.log('ITRServiceSection - Fetched data:', data);
        console.log('ITRServiceSection - Data length:', data.length);
        // Filter for ITR services and show only active ones
        const itrData = data.filter(service => 
          service.isActive && 
          (service.title.toLowerCase().includes('itr') || 
           service.serviceCode.toLowerCase().includes('itr'))
        );
        console.log('ITRServiceSection - ITR services:', itrData);
        setItrServices(itrData);
      } catch (err) {
        console.error('Error fetching ITR services:', err);
        setError('Failed to load ITR services');
        setItrServices([]);
      } finally {
        setLoading(false);
      }
    };

    loadITRServices();
  }, []);

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
  }, [itrServices]);

  const getServiceIcon = (service: SubService) => {
    if (service.title.toLowerCase().includes('basic')) return '📋';
    if (service.title.toLowerCase().includes('premium')) return '⭐';
    if (service.title.toLowerCase().includes('express')) return '⚡';
    return '📊';
  };

  const getServiceBadge = (service: SubService) => {
    if (service.title.toLowerCase().includes('basic')) return 'Basic';
    if (service.title.toLowerCase().includes('premium')) return 'Premium';
    if (service.title.toLowerCase().includes('express')) return 'Express';
    return 'Standard';
  };

  const getServiceColor = (service: SubService) => {
    if (service.title.toLowerCase().includes('basic')) return 'from-blue-500 to-blue-600';
    if (service.title.toLowerCase().includes('premium')) return 'from-purple-500 to-purple-600';
    if (service.title.toLowerCase().includes('express')) return 'from-orange-500 to-orange-600';
    return 'from-green-500 to-green-600';
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return `₹${price}`;
  };

  return (
    <section 
      ref={sectionRef}
      className="py-20 bg-gradient-to-br from-[#1e3a8a] via-[#1e40af] to-[#1d4ed8] text-white relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            ITR Filing Services
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Professional <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60a5fa] to-[#93c5fd]">ITR Filing</span>
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Expert ITR filing services for individuals. Choose from our range of professional packages designed to make tax filing simple and stress-free.
          </p>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white/10 rounded-2xl p-8 animate-pulse">
                <div className="w-16 h-16 bg-white/20 rounded-2xl mb-6"></div>
                <div className="h-6 bg-white/20 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-white/20 rounded w-full mb-2"></div>
                <div className="h-4 bg-white/20 rounded w-5/6 mb-6"></div>
                <div className="h-12 bg-white/20 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-300 text-lg mb-4">⚠️ {error}</div>
            <button
              onClick={() => window.location.reload()}
              className="bg-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/30 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : itrServices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-blue-200 text-lg mb-4">No ITR services available at the moment.</p>
            <p className="text-blue-300 text-sm">Please check back later or contact support.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {itrServices.map((service, index) => (
              <div
                key={service._id}
                data-index={index}
                className={`
                  bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20
                  transform transition-all duration-700 ease-out hover:scale-105
                  ${visibleCards.includes(index) ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
                  hover:bg-white/15 hover:shadow-2xl
                `}
              >
                {/* Service Icon and Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className="text-4xl">{getServiceIcon(service)}</div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getServiceColor(service)} text-white`}>
                    {getServiceBadge(service)}
                  </div>
                </div>

                {/* Service Title */}
                <h3 className="text-2xl font-bold mb-4 text-white">{service.title}</h3>
                
                {/* Service Description */}
                <p className="text-blue-100 mb-6 leading-relaxed">{service.description}</p>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-blue-200 mb-3">What's Included:</h4>
                  <ul className="space-y-2">
                    {service.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-blue-100">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-3"></span>
                        {feature}
                      </li>
                    ))}
                    {service.features.length > 3 && (
                      <li className="text-sm text-blue-300">
                        +{service.features.length - 3} more features
                      </li>
                    )}
                  </ul>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="text-3xl font-bold text-white mb-1">
                    {formatPrice(service.price)}
                  </div>
                  <div className="text-sm text-blue-200 capitalize">
                    {service.period.replace('_', ' ')} billing
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => onNavigate('service-details', service._id)}
                  className={`
                    w-full py-4 px-6 rounded-xl font-semibold text-white
                    bg-gradient-to-r ${getServiceColor(service)}
                    hover:shadow-lg transform hover:scale-105 transition-all duration-300
                    border border-white/20
                  `}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Need Help Choosing?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Our tax experts are here to help you choose the right ITR filing package based on your specific needs and income sources.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onNavigate('services')}
                className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
              >
                View All Services
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Get Expert Consultation
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
