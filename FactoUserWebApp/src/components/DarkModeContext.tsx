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
  // Initialize with saved preference or default to light mode
  const [isDarkMode, setIsDarkMode] = useState(false); // Default to light mode
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    const loadSavedMode = async () => {
      try {
        // Check if we've already migrated to light mode default
        const migrationKey = 'darkModeMigratedToLight';
        const migrated = await Storage.get(migrationKey);
        
        const savedMode = await Storage.get('darkMode');
        
        if (!migrated && savedMode === 'true') {
          // Migrate existing dark mode users to light mode
          console.log('Migrating dark mode preference to light mode');
          setIsDarkMode(false);
          await Storage.set('darkMode', JSON.stringify(false));
          await Storage.set(migrationKey, 'true');
        } else if (savedMode !== null) {
          const parsedMode = JSON.parse(savedMode);
          setIsDarkMode(parsedMode);
        } else {
          // No saved preference - default to light mode (false)
          setIsDarkMode(false);
          await Storage.set('darkMode', JSON.stringify(false));
        }
      } catch (error) {
        console.error('Error loading dark mode preference:', error);
        // On error, default to light mode
        setIsDarkMode(false);
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
