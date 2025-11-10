import { useState, useEffect } from 'react';
import { Network } from '@capacitor/network';
import { Capacitor } from '@capacitor/core';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      // Web: Use navigator.onLine
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    } else {
      // Mobile: Use Capacitor Network plugin
      let listener: any;
      
      const setupListener = async () => {
        listener = await Network.addListener('networkStatusChange', status => {
          setIsOnline(status.connected);
          setConnectionType(status.connectionType);
        });
        
        const status = await Network.getStatus();
        setIsOnline(status.connected);
        setConnectionType(status.connectionType);
      };
      
      setupListener();
      
      return () => {
        if (listener) {
          listener.remove();
        }
      };
    }
  }, []);

  return { isOnline, connectionType };
};

