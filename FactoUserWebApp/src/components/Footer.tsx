<<<<<<< HEAD
type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile' | 'course-payment' | 'course-details' | 'terms' | 'privacy';

interface FooterProps {
  onNavigate?: (page: PageType, serviceId?: string, courseId?: string, filter?: string) => void;
}

export function Footer({ onNavigate }: FooterProps = {}) {
=======

export function Footer() {
>>>>>>> 5f5c8b06feb0902b4f528e0151338f5ac63be3c9
  const currentYear = new Date().getFullYear();

  const footerSections = {
    services: {
      title: 'Services',
      links: [
        'ITR Filing',
        'GST Services',
        'MSME Registration',
        'Business Registration',
        'Accounting Services',
        'Tax Planning',
        'Audit & Assurance',
        'Financial Consulting'
      ]
    },
    resources: {
      title: 'Resources',
      links: [
        'Tax Calculator',
        'GST Calculator',
        'Finance Courses',
        'Finance Shorts',
        'News & Updates',
        'Tax Guides',
        'Compliance Calendar',
        'Document Templates'
      ]
    },
    support: {
      title: 'Support',
      links: [
        'Help Center',
        'Contact Us',
        'Live Chat',
        'Book Consultation',
        'Track Application',
        'Refund Policy',
        'Service Status',
        'Community Forum'
      ]
    },
    company: {
      title: 'Company',
      links: [
        'About Us',
        'Our Team',
        'Careers',
        'Press Kit',
        'Partner Program',
        'Affiliate Program',
        'Investor Relations',
        'CSR Initiatives'
      ]
    }
  };

  return (
    <footer className="bg-[#1F2937] dark:bg-gray-950 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[#007AFF] to-[#00C897] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[#FFD166] to-[#007AFF] rounded-full blur-3xl"></div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-[#007AFF] to-[#0056CC] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <span className="ml-3 text-2xl font-bold">Facto</span>
            </div>
            
            <p className="text-gray-300 leading-relaxed">
              Your trusted partner for comprehensive financial services in India. 
              From tax filing to business registration, we make finance simple and accessible for everyone.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center group cursor-pointer">
                <div className="w-10 h-10 bg-[#007AFF]/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-[#007AFF]/30 transition-colors duration-300">
                  <svg className="w-5 h-5 text-[#007AFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors duration-300">+91-800-123-4567</span>
              </div>
              <div className="flex items-center group cursor-pointer">
                <div className="w-10 h-10 bg-[#00C897]/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-[#00C897]/30 transition-colors duration-300">
                  <svg className="w-5 h-5 text-[#00C897]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors duration-300">support@facto.in</span>
              </div>
              <div className="flex items-center group cursor-pointer">
                <div className="w-10 h-10 bg-[#FFD166]/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-[#FFD166]/30 transition-colors duration-300">
                  <svg className="w-5 h-5 text-[#FFD166]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors duration-300">Bangalore, Karnataka, India</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex space-x-4">
              {[
                { name: 'LinkedIn', icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z', color: 'hover:text-blue-400' },
                { name: 'Twitter', icon: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z', color: 'hover:text-blue-400' },
                { name: 'YouTube', icon: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z', color: 'hover:text-red-500' },
                { name: 'Instagram', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z', color: 'hover:text-pink-500' }
              ].map((social) => (
                <a
                  key={social.name}
                  href="#"
                  className={`group w-12 h-12 bg-gray-700/50 hover:bg-gray-600/50 backdrop-blur-lg rounded-xl flex items-center justify-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-600/50 hover:border-gray-500/50 ${social.color}`}
                  aria-label={social.name}
                >
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key} className="space-y-4">
              <h4 className="font-bold text-lg text-white">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="text-gray-300 hover:text-[#007AFF] transition-all duration-200 text-sm group flex items-center"
                    >
                      <span className="transform group-hover:translate-x-1 transition-transform duration-200">{link}</span>
                      <svg className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Badges Section */}
      <div className="border-t border-gray-700/50 bg-gray-800/30 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            <div className="flex items-center justify-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 bg-[#00C897]/20 rounded-lg flex items-center justify-center group-hover:bg-[#00C897]/30 transition-colors duration-300">
                <svg className="w-6 h-6 text-[#00C897]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-white font-medium text-sm">SSL Secured</div>
                <div className="text-gray-400 text-xs">256-bit encryption</div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 bg-[#007AFF]/20 rounded-lg flex items-center justify-center group-hover:bg-[#007AFF]/30 transition-colors duration-300">
                <svg className="w-6 h-6 text-[#007AFF]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-white font-medium text-sm">Verified CA Partners</div>
                <div className="text-gray-400 text-xs">Certified professionals</div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 bg-[#FFD166]/20 rounded-lg flex items-center justify-center group-hover:bg-[#FFD166]/30 transition-colors duration-300">
                <svg className="w-6 h-6 text-[#FFD166]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-white font-medium text-sm">ISO 27001 Certified</div>
                <div className="text-gray-400 text-xs">International standard</div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 bg-[#00C897]/20 rounded-lg flex items-center justify-center group-hover:bg-[#00C897]/30 transition-colors duration-300">
                <svg className="w-6 h-6 text-[#00C897]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-white font-medium text-sm">24/7 Support</div>
                <div className="text-gray-400 text-xs">Always available</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex flex-wrap items-center justify-center md:justify-start space-x-6 text-sm text-gray-300">
<<<<<<< HEAD
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigate) onNavigate('privacy');
                }}
                className="hover:text-[#007AFF] transition-colors duration-200 hover:underline cursor-pointer"
              >
                Privacy Policy
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigate) onNavigate('terms');
                }}
                className="hover:text-[#007AFF] transition-colors duration-200 hover:underline cursor-pointer"
              >
                Terms of Service
              </a>
=======
              <a href="#" className="hover:text-[#007AFF] transition-colors duration-200 hover:underline">Privacy Policy</a>
              <a href="#" className="hover:text-[#007AFF] transition-colors duration-200 hover:underline">Terms of Service</a>
>>>>>>> 5f5c8b06feb0902b4f528e0151338f5ac63be3c9
              <a href="#" className="hover:text-[#007AFF] transition-colors duration-200 hover:underline">Cookie Policy</a>
              <a href="#" className="hover:text-[#007AFF] transition-colors duration-200 hover:underline">GDPR Compliance</a>
              <a href="#" className="hover:text-[#007AFF] transition-colors duration-200 hover:underline">Disclaimer</a>
            </div>
            <div className="mt-4 md:mt-0 text-center md:text-right">
              <p className="text-sm text-gray-300">
                © {currentYear} Facto Financial Services. All rights reserved.
              </p>
              <p className="text-xs text-gray-400 mt-1 flex items-center justify-center md:justify-end">
                Made with <span className="text-red-500 mx-1 animate-pulse">❤️</span> in India | CIN: U74999KA2020PTC123456
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
