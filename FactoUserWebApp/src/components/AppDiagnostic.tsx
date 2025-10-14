import React from 'react';
import { motion } from 'motion/react';

interface AppDiagnosticProps {
  onClose?: () => void;
}

export function AppDiagnostic({ onClose }: AppDiagnosticProps) {
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString();
  };

  const getSystemInfo = () => {
    return {
      userAgent: navigator.userAgent.split(' ')[0],
      language: navigator.language,
      online: navigator.onLine,
      cookieEnabled: navigator.cookieEnabled,
    };
  };

  const systemInfo = getSystemInfo();

  return (
    <motion.div
      className="fixed bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-4 z-50 border border-gray-200 max-w-sm"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-[#007AFF] flex items-center space-x-2">
            <div className="w-3 h-3 bg-[#00C897] rounded-full animate-pulse"></div>
            <span>Facto System Status</span>
          </div>
          {onClose && (
            <motion.button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18"/>
                <path d="M6 6l12 12"/>
              </svg>
            </motion.button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-2">
            <div className="text-gray-600">
              <span className="font-medium text-gray-800">App Status:</span>
              <br />
              <span className="text-[#00C897]">Running ✓</span>
            </div>
            <div className="text-gray-600">
              <span className="font-medium text-gray-800">Connection:</span>
              <br />
              <span className={systemInfo.online ? 'text-[#00C897]' : 'text-red-500'}>
                {systemInfo.online ? 'Online ✓' : 'Offline ✗'}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-gray-600">
              <span className="font-medium text-gray-800">Time:</span>
              <br />
              <span>{getCurrentTime()}</span>
            </div>
            <div className="text-gray-600">
              <span className="font-medium text-gray-800">Browser:</span>
              <br />
              <span>{systemInfo.userAgent}</span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-1">
            <div>Language: {systemInfo.language}</div>
            <div>Cookies: {systemInfo.cookieEnabled ? 'Enabled' : 'Disabled'}</div>
            <div className="text-[#007AFF] font-medium">Press Ctrl+D to toggle</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}