// WhatsApp Configuration
// Centralized configuration for WhatsApp phone number
// Uses environment variable VITE_WHATSAPP_NUMBER with fallback to default

const DEFAULT_WHATSAPP_NUMBER = '+918800772257';

/**
 * Gets the WhatsApp phone number from environment variable or default
 * @returns WhatsApp phone number in E.164 format (e.g., +918800772257)
 */
export const getWhatsAppNumber = (): string => {
  // Priority 1: Environment variable (from .env file or Vercel)
  if (import.meta.env.VITE_WHATSAPP_NUMBER) {
    return import.meta.env.VITE_WHATSAPP_NUMBER;
  }
  
  // Priority 2: Default fallback
  return DEFAULT_WHATSAPP_NUMBER;
};

/**
 * Gets the default WhatsApp message
 * @returns Default message for WhatsApp chat
 */
export const getDefaultWhatsAppMessage = (): string => {
  return 'Hello! I need help with your services.';
};

// Export constant for backward compatibility
export const WHATSAPP_NUMBER = getWhatsAppNumber();
export const DEFAULT_WHATSAPP_MESSAGE = getDefaultWhatsAppMessage();

