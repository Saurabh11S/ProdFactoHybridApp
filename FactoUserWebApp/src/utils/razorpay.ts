/**
 * Razorpay Payment Gateway Utility
 * Handles script loading and payment initialization
 */

declare global {
  interface Window {
    Razorpay: any;
  }
}

let razorpayScriptLoaded = false;
let razorpayScriptLoading = false;
let razorpayLoadPromise: Promise<void> | null = null;

/**
 * Load Razorpay checkout script
 * Ensures script is only loaded once and handles errors properly
 */
export function loadRazorpayScript(): Promise<void> {
  // If already loaded, return resolved promise
  if (razorpayScriptLoaded && window.Razorpay) {
    return Promise.resolve();
  }

  // If currently loading, return the existing promise
  if (razorpayScriptLoading && razorpayLoadPromise) {
    return razorpayLoadPromise;
  }

  // Check if script already exists in DOM
  const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
  if (existingScript && window.Razorpay) {
    razorpayScriptLoaded = true;
    return Promise.resolve();
  }

  // Start loading script
  razorpayScriptLoading = true;
  razorpayLoadPromise = new Promise((resolve, reject) => {
    // Remove existing script if it exists but Razorpay is not available
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      // Wait a bit for Razorpay to be available
      const checkRazorpay = () => {
        if (window.Razorpay) {
          razorpayScriptLoaded = true;
          razorpayScriptLoading = false;
          console.log('✅ Razorpay script loaded successfully');
          resolve();
        } else {
          // Retry after 100ms
          setTimeout(checkRazorpay, 100);
        }
      };
      checkRazorpay();
    };

    script.onerror = (error) => {
      razorpayScriptLoading = false;
      razorpayLoadPromise = null;
      console.error('❌ Failed to load Razorpay script:', error);
      reject(new Error('Failed to load Razorpay payment gateway. Please check your internet connection and try again.'));
    };

    // Set timeout for script loading (10 seconds)
    setTimeout(() => {
      if (!razorpayScriptLoaded) {
        razorpayScriptLoading = false;
        razorpayLoadPromise = null;
        reject(new Error('Razorpay script loading timeout. Please refresh the page and try again.'));
      }
    }, 10000);

    document.body.appendChild(script);
  });

  return razorpayLoadPromise;
}

/**
 * Initialize Razorpay payment
 */
export async function initializeRazorpayPayment(options: {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  handler: (response: any) => void | Promise<void>;
  onDismiss?: () => void;
}): Promise<void> {
  try {
    // Load Razorpay script first
    await loadRazorpayScript();

    // Verify Razorpay is available
    if (!window.Razorpay) {
      throw new Error('Razorpay is not available. Please refresh the page and try again.');
    }

    // Create Razorpay instance
    const rzpOptions = {
      key: options.key,
      amount: options.amount,
      currency: options.currency,
      name: options.name,
      description: options.description,
      order_id: options.order_id,
      prefill: options.prefill || {},
      handler: options.handler,
      modal: {
        ondismiss: options.onDismiss || (() => {
          console.log('Payment modal dismissed');
        })
      },
      theme: {
        color: '#007AFF'
      }
    };

    const rzp = new window.Razorpay(rzpOptions);
    rzp.open();

    console.log('✅ Razorpay payment modal opened');
  } catch (error: any) {
    console.error('❌ Razorpay initialization error:', error);
    throw error;
  }
}

