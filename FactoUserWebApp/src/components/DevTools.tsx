import React, { Suspense, useState, useEffect, useCallback } from 'react';

interface DevToolsProps {
  enabled?: boolean;
  currentPage?: string;
}

// Safe wrapper for development tools that won't cause runtime errors
export const DevTools: React.FC<DevToolsProps> = ({ enabled = false, currentPage = 'App' }) => {
  const [mounted, setMounted] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleError = useCallback((error: Error) => {
    console.warn('Development tools error:', error);
    setHasError(true);
  }, []);

  // Don't render anything if not enabled, not mounted, or has error
  if (!enabled || !mounted || hasError) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <ErrorBoundaryWrapper onError={handleError}>
        <LazyPerformanceMonitor component={currentPage} />
        <LazyHealthCheck />
      </ErrorBoundaryWrapper>
    </Suspense>
  );
};

// Simple error boundary wrapper
interface ErrorBoundaryWrapperProps {
  children: React.ReactNode;
  onError?: (error: Error) => void;
}

class ErrorBoundaryWrapper extends React.Component<ErrorBoundaryWrapperProps, { hasError: boolean }> {
  constructor(props: ErrorBoundaryWrapperProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

// Lazy loading components that won't break if imports fail
const LazyPerformanceMonitor: React.FC<{ component: string }> = ({ component }) => {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadComponent = async () => {
      try {
        const { PerformanceMonitor } = await import('./PerformanceMonitor');
        if (isMounted) {
          setComponent(() => PerformanceMonitor);
        }
      } catch (error) {
        console.warn('Failed to load PerformanceMonitor:', error);
      }
    };

    // Only load in development and not in Figma
    if ((import.meta as any).env?.MODE === 'development') {
      try {
        const isFigma = typeof window !== 'undefined' && window.location?.href?.includes('figma.com');
        if (!isFigma) {
          loadComponent();
        }
      } catch (error) {
        console.warn('Environment detection error:', error);
      }
    }

    return () => {
      isMounted = false;
    };
  }, []);

  if (!Component) {
    return null;
  }

  try {
    return <Component component={component} enabled={true} />;
  } catch (error) {
    console.warn('PerformanceMonitor render error:', error);
    return null;
  }
};

const LazyHealthCheck: React.FC = () => {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadComponent = async () => {
      try {
        const AppHealthCheckModule = await import('./AppHealthCheck');
        const AppHealthCheck = AppHealthCheckModule.default || AppHealthCheckModule.AppHealthCheck;
        if (isMounted && AppHealthCheck) {
          setComponent(() => AppHealthCheck);
        }
      } catch (error) {
        console.warn('Failed to load AppHealthCheck:', error);
      }
    };

    // Only load in development and not in Figma
    if ((import.meta as any).env?.MODE === 'development') {
      try {
        const isFigma = typeof window !== 'undefined' && window.location?.href?.includes('figma.com');
        if (!isFigma) {
          loadComponent();
        }
      } catch (error) {
        console.warn('Environment detection error:', error);
      }
    }

    return () => {
      isMounted = false;
    };
  }, []);

  if (!Component) {
    return null;
  }

  try {
    return <Component enabled={true} autoFix={false} />;
  } catch (error) {
    console.warn('AppHealthCheck render error:', error);
    return null;
  }
};

export default DevTools;