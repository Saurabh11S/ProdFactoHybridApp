import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { getWhatsAppNumber, getDefaultWhatsAppMessage } from '../config/whatsappConfig';

interface WhatsAppChatButtonProps {
  phoneNumber?: string;
  message?: string;
  isMobile?: boolean; // To adjust position based on bottom tab bar
}

// WhatsApp Icon SVG Component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export function WhatsAppChatButton({ 
  phoneNumber, // Optional: if not provided, uses environment variable or default
  message, // Optional: if not provided, uses default message
  isMobile = false
}: WhatsAppChatButtonProps) {
  // Use provided phone number, or get from environment variable/config
  const whatsappNumber = phoneNumber || getWhatsAppNumber();
  // Use provided message, or get default message
  const whatsappMessage = message || getDefaultWhatsAppMessage();
  const handleWhatsAppClick = () => {
    // Format phone number (remove any spaces, dashes, or special characters except +)
    const formattedPhone = whatsappNumber.replace(/[^\d+]/g, '');
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(whatsappMessage);
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    
    if (Capacitor.isNativePlatform()) {
      // For mobile apps, open in in-app browser
      Browser.open({ 
        url: whatsappUrl,
        toolbarColor: '#25D366' // WhatsApp green color
      });
    } else {
      // For web, open in new tab
      window.open(whatsappUrl, '_blank');
    }
  };

  // Adjust bottom position based on whether mobile bottom tab bar is present
  // For mobile with bottom tab bar: position above it (bottom-24 = 96px)
  // For mobile without bottom tab bar (like shorts page): position at bottom-6
  // For desktop: position at bottom-6
  const bottomPosition = isMobile ? 'bottom-24' : 'bottom-6';
  
  // Use higher z-index to ensure it's above bottom tab bar (which uses z-50)
  const zIndex = 'z-[60]';

  return (
    <button
      onClick={handleWhatsAppClick}
      className={`fixed ${bottomPosition} right-4 md:right-6 w-14 h-14 md:w-16 md:h-16 bg-[#25D366] hover:bg-[#20BA5A] active:bg-[#1DA851] text-white rounded-full shadow-2xl flex items-center justify-center ${zIndex} transition-all duration-300 hover:scale-110 active:scale-95 group touch-manipulation`}
      aria-label="Chat on WhatsApp"
      title="Chat with us on WhatsApp"
    >
      {/* WhatsApp Icon */}
      <WhatsAppIcon className="w-7 h-7 md:w-8 md:h-8" />
      
      {/* Pulse animation ring */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20"></span>
      
      {/* Ripple effect on hover */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-0 group-hover:opacity-30 group-hover:animate-pulse"></span>
      
      {/* Tooltip on hover (desktop only) */}
      <span className="absolute right-full mr-3 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none hidden md:block shadow-lg">
        Chat with us on WhatsApp
        <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900 dark:border-l-gray-800"></span>
      </span>
    </button>
  );
}

