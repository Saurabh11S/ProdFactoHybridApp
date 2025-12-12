import { useState, useEffect, useRef } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function TestimonialsSection() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Software Engineer',
      company: 'Tech Mahindra',
      image: 'https://ui-avatars.com/api/?name=Priya+Sharma&size=100&background=007AFF&color=fff&bold=true',
      content: 'Facto made my ITR filing so simple! Their team guided me through every step and I got my refund within 2 weeks. Highly recommended for tech professionals.',
      rating: 5,
      location: 'Bangalore'
    },
    {
      name: 'Rajesh Kumar',
      role: 'Small Business Owner',
      company: 'Kumar Enterprises',
      image: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&size=100&background=00C897&color=fff&bold=true',
      content: 'As a small business owner, GST compliance was always stressful. Facto\'s team handles everything professionally and their pricing is very reasonable.',
      rating: 5,
      location: 'Delhi'
    },
    {
      name: 'Anita Patel',
      role: 'Freelance Designer',
      company: 'Independent',
      image: 'https://ui-avatars.com/api/?name=Anita+Patel&size=100&background=FFD166&color=000&bold=true',
      content: 'Being a freelancer, my income sources are diverse. Facto\'s experts understood my unique situation and filed my returns perfectly. Great service!',
      rating: 5,
      location: 'Mumbai'
    },
    {
      name: 'Vikram Singh',
      role: 'CA Firm Partner',
      company: 'Singh & Associates',
      image: 'https://ui-avatars.com/api/?name=Vikram+Singh&size=100&background=007AFF&color=fff&bold=true',
      content: 'We partnered with Facto for our clients\' compliance needs. Their technology platform and expert team make the entire process seamless.',
      rating: 5,
      location: 'Pune'
    },
    {
      name: 'Meera Reddy',
      role: 'HR Manager',
      company: 'Infosys',
      image: 'https://ui-avatars.com/api/?name=Meera+Reddy&size=100&background=00C897&color=fff&bold=true',
      content: 'Facto\'s support team is incredibly responsive. They answered all my queries patiently and made sure I understood every aspect of my tax filing.',
      rating: 5,
      location: 'Hyderabad'
    }
  ];

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-[#FFD166]' : 'text-gray-300 dark:text-gray-600'} transition-colors duration-300`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-br from-[#F9FAFB] to-white dark:from-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-[#007AFF]/10 to-[#FFD166]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-[#00C897]/10 to-[#007AFF]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-16 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#007AFF]/10 to-[#00C897]/10 dark:from-[#007AFF]/20 dark:to-[#00C897]/20 rounded-full text-sm font-medium text-[#007AFF] dark:text-blue-400 mb-4 backdrop-blur-lg border border-[#007AFF]/20 dark:border-blue-400/20">
            Customer Stories
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1F2937] dark:text-white mb-4">
            What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AFF] to-[#00C897]">Customers Say</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Join thousands of satisfied customers who trust Facto for their financial and tax needs.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className={`relative transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-3xl transition-all duration-500">
            <div className="p-8 sm:p-12 md:pl-20 md:pr-20 relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Customer Photo & Info */}
                <div className="flex-shrink-0 text-center md:text-left md:min-w-[200px] relative z-10">
                  <div className="relative mx-auto md:mx-0 group">
                    <ImageWithFallback
                      src={testimonials[currentTestimonial].image}
                      alt={testimonials[currentTestimonial].name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-[#007AFF]/20 dark:border-blue-400/20 group-hover:border-[#007AFF]/40 transition-all duration-300 group-hover:scale-105"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#00C897] rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-1">
                    <h4 className="font-bold text-[#1F2937] dark:text-white text-lg">{testimonials[currentTestimonial].name}</h4>
                    <p className="text-[#007AFF] dark:text-blue-400 font-medium">{testimonials[currentTestimonial].role}</p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{testimonials[currentTestimonial].company}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center justify-center md:justify-start">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {testimonials[currentTestimonial].location}
                    </p>
                  </div>
                </div>

                {/* Testimonial Content */}
                <div className="flex-1">
                  {/* Rating */}
                  <div className="flex justify-center md:justify-start mb-4">
                    {renderStars(testimonials[currentTestimonial].rating)}
                  </div>

                  {/* Quote */}
                  <div className="relative">
                    <svg className="w-10 h-10 text-[#007AFF]/20 dark:text-blue-400/20 mb-4" fill="currentColor" viewBox="0 0 32 32">
                      <path d="M4 8h8v8H4V8zm12 0h8v8h-8V8zM4 20h8v4H4v-4zm12 0h8v4h-8v-4z"/>
                    </svg>
                    <blockquote className="text-lg sm:text-xl text-[#1F2937] dark:text-gray-200 leading-relaxed italic">
                      "{testimonials[currentTestimonial].content}"
                    </blockquote>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevTestimonial}
            className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-full shadow-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center text-[#007AFF] dark:text-blue-400 hover:bg-[#007AFF] hover:text-white dark:hover:bg-blue-500 transition-all duration-300 hover:scale-110 z-20"
            aria-label="Previous testimonial"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextTestimonial}
            className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-full shadow-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center text-[#007AFF] dark:text-blue-400 hover:bg-[#007AFF] hover:text-white dark:hover:bg-blue-500 transition-all duration-300 hover:scale-110 z-20"
            aria-label="Next testimonial"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTestimonial(index)}
              className={`h-3 rounded-full transition-all duration-300 hover:scale-110 ${
                index === currentTestimonial 
                  ? 'bg-[#007AFF] dark:bg-blue-400 w-8' 
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-[#007AFF]/50 dark:hover:bg-blue-400/50 w-3'
              }`}
            />
          ))}
        </div>

        {/* Trust Stats */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="text-center group cursor-pointer">
            <div className="text-3xl font-bold text-[#007AFF] dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform duration-300">50K+</div>
            <div className="text-gray-600 dark:text-gray-300 group-hover:text-[#007AFF] dark:group-hover:text-blue-400 transition-colors duration-300">Happy Customers</div>
          </div>
          <div className="text-center group cursor-pointer">
            <div className="text-3xl font-bold text-[#00C897] dark:text-green-400 mb-2 group-hover:scale-110 transition-transform duration-300">₹500Cr+</div>
            <div className="text-gray-600 dark:text-gray-300 group-hover:text-[#00C897] dark:group-hover:text-green-400 transition-colors duration-300">Tax Savings</div>
          </div>
          <div className="text-center group cursor-pointer">
            <div className="text-3xl font-bold text-[#FFD166] dark:text-yellow-400 mb-2 group-hover:scale-110 transition-transform duration-300">4.9/5</div>
            <div className="text-gray-600 dark:text-gray-300 group-hover:text-[#FFD166] dark:group-hover:text-yellow-400 transition-colors duration-300">Customer Rating</div>
          </div>
          <div className="text-center group cursor-pointer">
            <div className="text-3xl font-bold text-[#007AFF] dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform duration-300">24/7</div>
            <div className="text-gray-600 dark:text-gray-300 group-hover:text-[#007AFF] dark:group-hover:text-blue-400 transition-colors duration-300">Support Available</div>
          </div>
        </div>
      </div>
    </section>
  );
}
