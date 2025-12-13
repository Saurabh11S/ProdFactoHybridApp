import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDarkMode } from '../DarkModeContext';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile';

interface WelcomeScreenProps {
  onNavigate: (page: PageType) => void;
}

export function WelcomeScreen({ onNavigate }: WelcomeScreenProps) {
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    console.log('[WelcomeScreen] Component mounted, starting animation');
    
    // After 5 seconds, navigate to home screen
    const timer = setTimeout(() => {
      console.log('[WelcomeScreen] Animation complete, navigating to home');
      // Mark welcome screen as shown in this session
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('welcomeShown', 'true');
      }
      onNavigate('home');
    }, 5000);

    return () => {
      console.log('[WelcomeScreen] Component unmounting, clearing timer');
      clearTimeout(timer);
    };
  }, [onNavigate]);

  const logoPath = "/logo/NewLOGO.png";
  console.log('[WelcomeScreen] Rendering with logo:', logoPath, 'isDarkMode:', isDarkMode);

  return (
    <div 
      className="fixed inset-0 bg-gradient-to-br from-[#0A0F1F] to-[#1A263A] dark:from-[#0A0F1F] dark:to-[#1A263A] flex items-center justify-center overflow-hidden"
      style={{ zIndex: 999999 }}
    >
      {/* Logo with moving animations */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          scale: 1.0,
          y: [0, -20, 0], // Floating up and down
          rotate: [0, 5, -5, 0], // Gentle rotation
        }}
        transition={{
          opacity: { duration: 1, ease: "easeOut" },
          scale: { duration: 1, ease: "easeOut" },
          y: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "reverse" as const,
          },
          rotate: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "reverse" as const,
          },
        }}
        className="flex items-center justify-center"
      >
        <motion.img
          src={logoPath}
          alt="Facto Logo"
          className="w-48 h-48 object-contain"
          style={{
            filter: 'brightness(1.15) drop-shadow(0 4px 12px rgba(255,255,255,0.2))'
          }}
          animate={{
            scale: [1, 1.1, 1], // Pulsing effect
          }}
          transition={{
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "reverse" as const,
            },
          }}
          onError={(e) => {
            console.error('[WelcomeScreen] Logo failed to load:', logoPath);
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) {
              fallback.style.display = 'flex';
              console.log('[WelcomeScreen] Showing fallback logo');
            }
          }}
          onLoad={() => {
            console.log('[WelcomeScreen] Logo loaded successfully:', logoPath);
          }}
        />
        {/* Fallback logo if image not found */}
        <motion.div 
          className="w-48 h-48 bg-gradient-to-br from-[#007AFF] to-[#0056CC] rounded-2xl flex items-center justify-center shadow-2xl hidden"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "reverse" as const,
            },
          }}
        >
          <span className="text-white font-bold text-6xl">F</span>
        </motion.div>
      </motion.div>
    </div>
  );
}

