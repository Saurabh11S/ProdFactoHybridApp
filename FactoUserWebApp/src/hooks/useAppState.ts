import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export const useAppState = () => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let stateListener: any;
    let urlListener: any;

    const setupListeners = async () => {
      stateListener = await App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          console.log('App is now active');
          // Refresh data, check auth status, etc.
        } else {
          console.log('App is now in background');
          // Save state, pause timers, etc.
        }
      });

      // Handle app URL (deep linking)
      urlListener = await App.addListener('appUrlOpen', (data) => {
        console.log('App opened with URL:', data.url);
        // Handle deep links (e.g., payment callbacks)
      });
    };

    setupListeners();

    return () => {
      if (stateListener) {
        stateListener.remove();
      }
      if (urlListener) {
        urlListener.remove();
      }
    };
  }, []);
};

