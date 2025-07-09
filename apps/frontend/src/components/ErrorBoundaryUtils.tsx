import React from 'react';
import type { ErrorInfo } from 'react';
import { EnhancedErrorBoundary } from './EnhancedErrorBoundary';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode | ((error: Error, errorInfo: ErrorInfo) => React.ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  retryable?: boolean;
  onRetry?: () => void;
  autoRetry?: boolean;
  maxRetries?: number;
  reportErrors?: boolean;
  errorReporter?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
  logErrors?: boolean;
  gracefulDegradation?: boolean;
  fallbackMode?: 'minimal' | 'alternative' | 'offline';
  isolateErrors?: boolean;
}

// Higher-order component for easy error boundary wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) {
  const WrappedComponent = (props: P) => (
    <EnhancedErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </EnhancedErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for error boundary context
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: Error) => {
    // Throw error to be caught by nearest error boundary
    throw error;
  }, []);

  const reportError = React.useCallback((error: Error, context?: Record<string, unknown>) => {
    // Report error without throwing
    console.error('Error reported:', error, context);
    
    // Send to error reporting service
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('error-report', {
        detail: { error, context }
      });
      window.dispatchEvent(event);
    }
  }, []);

  return { handleError, reportError };
}; 