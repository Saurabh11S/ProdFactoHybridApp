import React, { useEffect, useState, useCallback } from 'react';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'checking';
  message: string;
  fix?: () => void;
}

interface AppHealthCheckProps {
  enabled?: boolean;
  autoFix?: boolean;
  onHealthChange?: (checks: HealthCheck[]) => void;
}

export const AppHealthCheck: React.FC<AppHealthCheckProps> = ({
  enabled = (import.meta as any).env?.MODE === 'development',
  autoFix = false,
  onHealthChange
}) => {
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const updateCheck = useCallback((name: string, updates: Partial<HealthCheck>) => {
    setChecks(prev => {
      const newChecks = prev.map(check => 
        check.name === name ? { ...check, ...updates } : check
      );
      onHealthChange?.(newChecks);
      return newChecks;
    });
  }, [onHealthChange]);

  const runHealthChecks = useCallback(async () => {
    const healthChecks: HealthCheck[] = [
      {
        name: 'Console Errors',
        status: 'checking',
        message: 'Checking for console errors...'
      },
      {
        name: 'Memory Usage',
        status: 'checking',
        message: 'Checking memory usage...'
      },
      {
        name: 'Performance',
        status: 'checking',
        message: 'Checking render performance...'
      },
      {
        name: 'Network',
        status: 'checking',
        message: 'Checking network connectivity...'
      },
      {
        name: 'Local Storage',
        status: 'checking',
        message: 'Checking local storage...'
      },
      {
        name: 'Responsive Design',
        status: 'checking',
        message: 'Checking responsive breakpoints...'
      }
    ];

    setChecks(healthChecks);

    // Console Errors Check
    let errorCount = 0;
    const originalError = console.error;
    console.error = (...args) => {
      errorCount++;
      originalError.apply(console, args);
    };

    setTimeout(() => {
      updateCheck('Console Errors', {
        status: errorCount === 0 ? 'pass' : errorCount < 5 ? 'warning' : 'fail',
        message: errorCount === 0 
          ? 'No console errors detected' 
          : `${errorCount} console errors detected`,
        fix: errorCount > 0 ? () => {
          console.clear();
          updateCheck('Console Errors', {
            status: 'pass',
            message: 'Console cleared'
          });
        } : undefined
      });
    }, 1000);

    // Memory Usage Check
    try {
      const memory = (performance as any).memory;
      if (memory) {
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
        const percentage = (usedMB / limitMB) * 100;

        updateCheck('Memory Usage', {
          status: percentage < 50 ? 'pass' : percentage < 80 ? 'warning' : 'fail',
          message: `Using ${usedMB.toFixed(1)}MB (${percentage.toFixed(1)}%) of ${limitMB.toFixed(1)}MB`,
          fix: percentage > 80 ? () => {
            // Force garbage collection if available
            if ((window as any).gc) {
              (window as any).gc();
              updateCheck('Memory Usage', {
                status: 'pass',
                message: 'Garbage collection triggered'
              });
            }
          } : undefined
        });
      } else {
        updateCheck('Memory Usage', {
          status: 'warning',
          message: 'Memory API not available'
        });
      }
    } catch (error) {
      updateCheck('Memory Usage', {
        status: 'fail',
        message: 'Failed to check memory usage'
      });
    }

    // Performance Check
    const perfStart = performance.now();
    requestAnimationFrame(() => {
      const perfEnd = performance.now();
      const frameDuration = perfEnd - perfStart;
      
      updateCheck('Performance', {
        status: frameDuration < 16.67 ? 'pass' : frameDuration < 33 ? 'warning' : 'fail',
        message: `Frame duration: ${frameDuration.toFixed(2)}ms (${(1000/frameDuration).toFixed(0)} FPS)`
      });
    });

    // Network Check
    try {
      const startTime = performance.now();
      await fetch('/favicon.ico', { method: 'HEAD' });
      const endTime = performance.now();
      const latency = endTime - startTime;

      updateCheck('Network', {
        status: latency < 100 ? 'pass' : latency < 500 ? 'warning' : 'fail',
        message: `Network latency: ${latency.toFixed(0)}ms`
      });
    } catch (error) {
      updateCheck('Network', {
        status: 'fail',
        message: 'Network connectivity issues detected',
        fix: () => {
          window.location.reload();
        }
      });
    }

    // Local Storage Check
    try {
      const testKey = '__health_check_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      
      const usage = JSON.stringify(localStorage).length;
      const usageKB = usage / 1024;

      updateCheck('Local Storage', {
        status: usageKB < 5000 ? 'pass' : usageKB < 8000 ? 'warning' : 'fail',
        message: `Local storage usage: ${usageKB.toFixed(1)}KB`,
        fix: usageKB > 8000 ? () => {
          if (confirm('Clear local storage to free up space?')) {
            localStorage.clear();
            updateCheck('Local Storage', {
              status: 'pass',
              message: 'Local storage cleared'
            });
          }
        } : undefined
      });
    } catch (error) {
      updateCheck('Local Storage', {
        status: 'fail',
        message: 'Local storage not available or full'
      });
    }

    // Responsive Design Check
    const breakpoints = [768, 1024, 1280, 1536];
    const currentWidth = window.innerWidth;
    const appropriateBreakpoint = breakpoints.find(bp => currentWidth <= bp) || 'xl';

    updateCheck('Responsive Design', {
      status: 'pass',
      message: `Current breakpoint: ${currentWidth}px (${appropriateBreakpoint})`
    });

    setLastCheck(new Date());
  }, [updateCheck]);

  const autoFixIssues = useCallback(() => {
    checks.forEach(check => {
      if ((check.status === 'fail' || check.status === 'warning') && check.fix && autoFix) {
        check.fix();
      }
    });
  }, [checks, autoFix]);

  useEffect(() => {
    if (!enabled) return;

    runHealthChecks();
    
    // Run health checks every 30 seconds
    const interval = setInterval(runHealthChecks, 30000);
    
    return () => clearInterval(interval);
  }, [enabled, runHealthChecks]);

  useEffect(() => {
    if (autoFix) {
      autoFixIssues();
    }
  }, [autoFix, autoFixIssues]);

  const getStatusIcon = (status: HealthCheck['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'checking':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: HealthCheck['status']) => {
    switch (status) {
      case 'pass':
        return 'border-green-500 bg-green-50';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50';
      case 'fail':
        return 'border-red-500 bg-red-50';
      case 'checking':
        return 'border-blue-500 bg-blue-50';
    }
  };

  if (!enabled || (import.meta as any).env?.MODE !== 'development') {
    return null;
  }

  const failedChecks = checks.filter(check => check.status === 'fail').length;
  const warningChecks = checks.filter(check => check.status === 'warning').length;

  return (
    <>
      {/* Health Status Indicator */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`fixed top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center z-[9999] transition-all duration-200 ${
          failedChecks > 0 
            ? 'bg-red-500 hover:bg-red-600' 
            : warningChecks > 0 
            ? 'bg-yellow-500 hover:bg-yellow-600' 
            : 'bg-green-500 hover:bg-green-600'
        } text-white shadow-lg`}
        title="App Health Status"
      >
        {failedChecks > 0 ? (
          <XCircle className="w-6 h-6" />
        ) : warningChecks > 0 ? (
          <AlertTriangle className="w-6 h-6" />
        ) : (
          <CheckCircle className="w-6 h-6" />
        )}
      </button>

      {/* Health Check Panel */}
      {isVisible && (
        <div className="fixed top-20 right-4 w-80 bg-white rounded-lg shadow-xl border z-[9999] max-h-96 overflow-y-auto">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">App Health Check</h3>
              <button
                onClick={() => runHealthChecks()}
                className="text-gray-500 hover:text-gray-700 p-1 rounded"
                title="Refresh health checks"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            {lastCheck && (
              <p className="text-xs text-gray-500 mt-1">
                Last check: {lastCheck.toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="p-4 space-y-3">
            {checks.map(check => (
              <div
                key={check.name}
                className={`p-3 rounded-lg border-l-4 ${getStatusColor(check.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(check.status)}
                    <span className="font-medium text-sm">{check.name}</span>
                  </div>
                  {check.fix && (
                    <button
                      onClick={check.fix}
                      className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                    >
                      Fix
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1">{check.message}</p>
              </div>
            ))}
          </div>

          <div className="p-4 border-t bg-gray-50 rounded-b-lg">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>
                {checks.filter(c => c.status === 'pass').length} passed, {' '}
                {warningChecks} warnings, {failedChecks} failed
              </span>
              <label className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={autoFix}
                  onChange={(e) => {
                    // This would need to be controlled from parent component
                    console.log('Auto-fix toggled:', e.target.checked);
                  }}
                  className="w-3 h-3"
                />
                <span>Auto-fix</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppHealthCheck;
