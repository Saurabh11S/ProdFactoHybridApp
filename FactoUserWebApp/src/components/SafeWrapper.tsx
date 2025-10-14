import React, { Component, ReactNode } from 'react';

interface SafeWrapperState {
  hasError: boolean;
  error?: Error;
}

interface SafeWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

/**
 * A safe wrapper that catches any runtime errors and provides a fallback
 * This helps prevent the entire app from crashing due to component errors
 */
export class SafeWrapper extends Component<SafeWrapperProps, SafeWrapperState> {
  constructor(props: SafeWrapperProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SafeWrapperState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn(`SafeWrapper (${this.props.name || 'Unknown'}) caught error:`, error);
    console.warn('Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Return fallback if provided, otherwise return null
      return this.props.fallback || null;
    }

    try {
      return this.props.children;
    } catch (error) {
      console.warn(`SafeWrapper (${this.props.name || 'Unknown'}) render error:`, error);
      return this.props.fallback || null;
    }
  }
}

/**
 * Hook version for functional components
 */
export const useSafeRender = (renderFn: () => ReactNode, fallback?: ReactNode, name?: string): ReactNode => {
  try {
    return renderFn();
  } catch (error) {
    console.warn(`useSafeRender (${name || 'Unknown'}) error:`, error);
    return fallback || null;
  }
};

/**
 * HOC for wrapping components safely
 */
export function withSafeWrapper<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  name?: string
) {
  const SafeComponent = React.forwardRef<any, P>((props, ref) => {
    return (
      <SafeWrapper fallback={fallback} name={name || Component.displayName || Component.name}>
        <Component {...props} ref={ref} />
      </SafeWrapper>
    );
  });

  SafeComponent.displayName = `SafeWrapper(${name || Component.displayName || Component.name})`;
  
  return SafeComponent;
}

export default SafeWrapper;