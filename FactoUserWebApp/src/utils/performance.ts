/**
 * Performance optimization utilities
 */

/**
 * Throttle function - limits how often a function can be called
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Debounce function - delays function execution until after wait time
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function (this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * RequestAnimationFrame wrapper for smooth animations
 */
export function raf(callback: () => void): number {
  return requestAnimationFrame(callback);
}

/**
 * Cancel animation frame wrapper
 */
export function cancelRaf(id: number): void {
  cancelAnimationFrame(id);
}

/**
 * Optimized scroll handler using requestAnimationFrame
 */
export function createOptimizedScrollHandler(
  callback: () => void,
  throttleMs: number = 16
): () => void {
  let ticking = false;
  const throttledCallback = throttle(callback, throttleMs);
  
  return () => {
    if (!ticking) {
      raf(() => {
        throttledCallback();
        ticking = false;
      });
      ticking = true;
    }
  };
}

