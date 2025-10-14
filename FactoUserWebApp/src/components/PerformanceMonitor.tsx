import React, { useEffect, useState, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  loadTime: number;
  errors: number;
  warnings: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  component?: string;
  onMetrics?: (metrics: PerformanceMetrics) => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = (import.meta as any).env?.MODE === 'development',
  component = 'Unknown',
  onMetrics
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    loadTime: 0,
    errors: 0,
    warnings: 0
  });

  const [startTime] = useState(() => performance.now());

  const updateMetrics = useCallback((newMetrics: Partial<PerformanceMetrics>) => {
    setMetrics(prev => {
      const updated = { ...prev, ...newMetrics };
      onMetrics?.(updated);
      return updated;
    });
  }, [onMetrics]);

  useEffect(() => {
    if (!enabled) return;

    const renderStart = performance.now();
    
    return () => {
      const renderEnd = performance.now();
      const renderTime = renderEnd - renderStart;
      const loadTime = renderEnd - startTime;

      updateMetrics({
        renderTime: Math.round(renderTime * 100) / 100,
        loadTime: Math.round(loadTime * 100) / 100,
        memoryUsage: (performance as any).memory?.usedJSHeapSize
      });

      // Log performance metrics
      if (renderTime > 16.67) { // More than one frame at 60fps
        console.warn(`⚠️ Slow render in ${component}: ${renderTime.toFixed(2)}ms`);
      }

      if (loadTime > 100) {
        console.warn(`⚠️ Slow load in ${component}: ${loadTime.toFixed(2)}ms`);
      }
    };
  }, [enabled, component, startTime, updateMetrics]);

  useEffect(() => {
    if (!enabled) return;

    let errorCount = 0;
    let warningCount = 0;

    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args) => {
      errorCount++;
      updateMetrics({ errors: errorCount });
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      warningCount++;
      updateMetrics({ warnings: warningCount });
      originalWarn.apply(console, args);
    };

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, [enabled, updateMetrics]);

  if (!enabled || (import.meta as any).env?.MODE !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white text-xs p-2 rounded font-mono z-[9999] max-w-xs">
      <div className="font-bold mb-1">{component}</div>
      <div>Render: {metrics.renderTime}ms</div>
      <div>Load: {metrics.loadTime}ms</div>
      {metrics.memoryUsage && (
        <div>Memory: {(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB</div>
      )}
      {metrics.errors > 0 && (
        <div className="text-red-400">Errors: {metrics.errors}</div>
      )}
      {metrics.warnings > 0 && (
        <div className="text-yellow-400">Warnings: {metrics.warnings}</div>
      )}
    </div>
  );
};

// Higher-order component for performance monitoring
export function withPerformanceMonitor<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
    return (
      <>
        <PerformanceMonitor 
          component={componentName || Component.displayName || Component.name} 
        />
        <Component {...props} ref={ref} />
      </>
    );
  });

  WrappedComponent.displayName = `withPerformanceMonitor(${componentName || Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Performance utilities
export const performanceUtils = {
  // Measure function execution time
  measureTime: async <T>(
    name: string,
    fn: () => Promise<T> | T
  ): Promise<T> => {
    const start = performance.now();
    try {
      const result = await fn();
      const end = performance.now();
      console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
      return result;
    } catch (error) {
      const end = performance.now();
      console.error(`❌ ${name} failed after ${(end - start).toFixed(2)}ms:`, error);
      throw error;
    }
  },

  // Throttle function calls
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): T => {
    let inThrottle: boolean;
    return ((...args: any[]) => {
      if (!inThrottle) {
        func.apply(null, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    }) as T;
  },

  // Debounce function calls
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): T => {
    let timeoutId: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    }) as T;
  },

  // Check if component should render (shallow comparison)
  shouldUpdate: (prevProps: any, nextProps: any): boolean => {
    const prevKeys = Object.keys(prevProps);
    const nextKeys = Object.keys(nextProps);

    if (prevKeys.length !== nextKeys.length) {
      return true;
    }

    for (const key of prevKeys) {
      if (prevProps[key] !== nextProps[key]) {
        return true;
      }
    }

    return false;
  }
};