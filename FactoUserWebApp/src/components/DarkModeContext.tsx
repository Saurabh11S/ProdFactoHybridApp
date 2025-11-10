import React, { createContext, useContext, useEffect, useState } from 'react';
import { Storage } from '../utils/storage';

interface DarkModeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};

interface DarkModeProviderProps {
  children: React.ReactNode;
}

export const DarkModeProvider: React.FC<DarkModeProviderProps> = ({ children }) => {
  // Initialize with saved preference or default to dark mode
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    const loadSavedMode = async () => {
      try {
        const savedMode = await Storage.get('darkMode');
        if (savedMode !== null) {
          setIsDarkMode(JSON.parse(savedMode));
        }
      } catch (error) {
        console.error('Error loading dark mode preference:', error);
      } finally {
        setIsInitialized(true);
      }
    };
    loadSavedMode();
  }, []);

  useEffect(() => {
    if (!isInitialized) return; // Wait for initialization
    
    // Apply dark mode class to document immediately
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save preference
    Storage.set('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode, isInitialized]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};
