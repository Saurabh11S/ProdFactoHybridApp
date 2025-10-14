import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function SessionWarning() {
  const { sessionWarning, dismissSessionWarning, extendSession } = useAuth();
  const [timeLeft, setTimeLeft] = useState(sessionWarning.timeLeft);

  useEffect(() => {
    setTimeLeft(sessionWarning.timeLeft);
  }, [sessionWarning.timeLeft]);

  useEffect(() => {
    if (!sessionWarning.show) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionWarning.show]);

  if (!sessionWarning.show) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white p-4 shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <p className="font-semibold">Session Expiring Soon</p>
            <p className="text-sm">
              Your session will expire in {formatTime(timeLeft)}. 
              Please save your work and refresh the page to extend your session.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={extendSession}
            className="bg-white text-yellow-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Extend Session
          </button>
          <button
            onClick={dismissSessionWarning}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

