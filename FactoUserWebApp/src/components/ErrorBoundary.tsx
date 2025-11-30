import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
    this.resetError = this.resetError.bind(this);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Log error details for debugging
    if (typeof window !== 'undefined' && window.console) {
      console.group('🚨 React Error Boundary');
      console.error('Error:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Component stack:', errorInfo.componentStack);
      console.groupEnd();
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-white flex items-center justify-center p-4">
          <div className="max-w-lg mx-auto text-center">
            <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
              {/* Error Icon */}
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg 
                  className="w-8 h-8 text-red-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Oops! Something went wrong
              </h2>
              
              <p className="text-gray-600 mb-8 leading-relaxed">
                We're sorry, but something unexpected happened. This could be a temporary issue. 
                Please try refreshing the page or go back to the home page.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={this.resetError}
                  className="bg-[#007AFF] hover:bg-[#0056CC] text-white px-6 py-3 rounded-lg transition-all duration-300 font-medium"
                >
                  Try Again
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg transition-all duration-300 font-medium"
                >
                  Refresh Page
                </button>
                
                <button
                  onClick={() => {
                    this.resetError();
                    window.location.href = '/';
                  }}
                  className="text-[#007AFF] hover:text-[#0056CC] px-6 py-3 rounded-lg transition-all duration-300 font-medium underline"
                >
                  Go Home
                </button>
              </div>

              {/* Development Error Details */}
              {(import.meta as any).env?.MODE === 'development' && this.state.error && (
                <details className="mt-8 text-left bg-gray-50 rounded-lg p-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                    🔧 Error Details (Development Only)
                  </summary>
                  <div className="mt-4 space-y-4">
                    <div>
                      <h4 className="font-medium text-red-600 mb-2">Error Message:</h4>
                      <pre className="text-xs text-red-700 bg-red-50 p-3 rounded border overflow-auto">
                        {this.state.error.message}
                      </pre>
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <h4 className="font-medium text-red-600 mb-2">Stack Trace:</h4>
                        <pre className="text-xs text-red-700 bg-red-50 p-3 rounded border overflow-auto max-h-40">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <h4 className="font-medium text-red-600 mb-2">Component Stack:</h4>
                        <pre className="text-xs text-red-700 bg-red-50 p-3 rounded border overflow-auto max-h-40">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
