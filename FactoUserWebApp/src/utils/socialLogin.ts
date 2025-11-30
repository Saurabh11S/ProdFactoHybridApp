import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

// Extend Window interface for Google and Facebook SDKs
declare global {
  interface Window {
    google?: any;
    FB?: any;
  }
}

export const handleGoogleLogin = async (
  setIsSubmitting: (loading: boolean) => void,
  setError: (error: string | null) => void
): Promise<void> => {
  try {
    setIsSubmitting(true);
    setError(null);

    // Use Google Identity Services
    if (window.google?.accounts) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
        callback: async (response: any) => {
          try {
            // Decode the credential
            const credential = response.credential;
            const payload = JSON.parse(atob(credential.split('.')[1]));
            
            // Send to backend
            const backendResponse = await axios.post(`${API_BASE_URL}/auth/google`, {
              idToken: credential,
              email: payload.email,
              name: payload.name,
              picture: payload.picture
            });

            if (backendResponse.data.success) {
              const { user, token } = backendResponse.data.data;
              localStorage.setItem('token', token);
              localStorage.setItem('user', JSON.stringify(user));
              window.location.reload(); // Reload to update auth state
            }
          } catch (error: any) {
            setError(error.response?.data?.message || 'Google login failed');
            setIsSubmitting(false);
          }
        }
      });

      window.google.accounts.id.prompt();
    } else {
      setError('Google Sign-In is not available. Please refresh the page.');
      setIsSubmitting(false);
    }
  } catch (error: any) {
    setError(error.message || 'Failed to initialize Google login');
    setIsSubmitting(false);
  }
};

export const handleFacebookLogin = async (
  setIsSubmitting: (loading: boolean) => void,
  setError: (error: string | null) => void
): Promise<void> => {
  try {
    setIsSubmitting(true);
    setError(null);

    if (window.FB) {
      window.FB.login(async (response: any) => {
        if (response.authResponse) {
          try {
            // Get user info
            window.FB.api('/me', { fields: 'name,email,picture' }, async (userInfo: any) => {
              try {
                // Send to backend
                const backendResponse = await axios.post(`${API_BASE_URL}/auth/facebook`, {
                  accessToken: response.authResponse.accessToken,
                  email: userInfo.email,
                  name: userInfo.name,
                  picture: userInfo.picture
                });

                if (backendResponse.data.success) {
                  const { user, token } = backendResponse.data.data;
                  localStorage.setItem('token', token);
                  localStorage.setItem('user', JSON.stringify(user));
                  window.location.reload(); // Reload to update auth state
                }
              } catch (error: any) {
                setError(error.response?.data?.message || 'Facebook login failed');
                setIsSubmitting(false);
              }
            });
          } catch (error: any) {
            setError(error.message || 'Failed to get Facebook user info');
            setIsSubmitting(false);
          }
        } else {
          setError('Facebook login was cancelled');
          setIsSubmitting(false);
        }
      }, { scope: 'email,public_profile' });
    } else {
      setError('Facebook SDK not loaded. Please refresh the page.');
      setIsSubmitting(false);
    }
  } catch (error: any) {
    setError(error.message || 'Failed to initialize Facebook login');
    setIsSubmitting(false);
  }
};

// Load Google Identity Services
export const loadGoogleScript = (): void => {
  if (document.getElementById('google-signin-script')) return;
  
  const script = document.createElement('script');
  script.id = 'google-signin-script';
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  document.body.appendChild(script);
};

// Load Facebook SDK
export const loadFacebookScript = (): void => {
  if (document.getElementById('facebook-sdk-script')) return;
  
  const script = document.createElement('script');
  script.id = 'facebook-sdk-script';
  script.src = 'https://connect.facebook.net/en_US/sdk.js';
  script.async = true;
  script.defer = true;
  script.crossOrigin = 'anonymous';
  document.body.appendChild(script);

  script.onload = () => {
    if (window.FB) {
      window.FB.init({
        appId: import.meta.env.VITE_FACEBOOK_APP_ID || '',
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
    }
  };
};

