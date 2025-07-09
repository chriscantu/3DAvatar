import React, { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import type { ErrorBoundaryComponentContract } from '../contracts/ComponentContracts';
import './ErrorBoundary.css';

interface Props extends Partial<ErrorBoundaryComponentContract> {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, errorInfo: ErrorInfo) => ReactNode);
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
  recoveryStrategies?: RecoveryStrategy[];
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
  isRecovering: boolean;
  recoveryAttempted: boolean;
  errorId: string;
  timestamp: Date;
}

interface RecoveryStrategy {
  name: string;
  condition: (error: Error, errorInfo: ErrorInfo) => boolean;
  action: (error: Error, errorInfo: ErrorInfo) => Promise<boolean>;
  priority: number;
  timeout?: number;
}

interface ErrorReport {
  errorId: string;
  timestamp: Date;
  error: {
    message: string;
    stack?: string;
    name: string;
  };
  componentStack: string;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
  retryCount: number;
  recoveryAttempted: boolean;
}

/**
 * Enhanced Error Boundary with comprehensive error handling and recovery strategies
 */
export class EnhancedErrorBoundary extends Component<Props, State> {
  private retryTimeoutId?: NodeJS.Timeout;
  private recoveryTimeoutId?: NodeJS.Timeout;
  private errorReportQueue: ErrorReport[] = [];
  
  static defaultProps: Partial<Props> = {
    retryable: true,
    autoRetry: false,
    maxRetries: 3,
    reportErrors: true,
    showErrorDetails: process.env.NODE_ENV === 'development',
    logErrors: true,
    gracefulDegradation: true,
    fallbackMode: 'alternative',
    isolateErrors: true,
    recoveryStrategies: []
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
      isRecovering: false,
      recoveryAttempted: false,
      errorId: '',
      timestamp: new Date()
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error details
    if (this.props.logErrors) {
      console.error('EnhancedErrorBoundary caught an error:', {
        errorId: this.state.errorId,
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: this.state.timestamp.toISOString(),
        retryCount: this.state.retryCount
      });
    }

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report error if enabled
    if (this.props.reportErrors) {
      this.reportError(error, errorInfo);
    }

    // Attempt automatic recovery
    if (this.props.gracefulDegradation && !this.state.recoveryAttempted) {
      this.attemptRecovery(error, errorInfo);
    }

    // Auto-retry if enabled
    if (this.props.autoRetry && this.state.retryCount < (this.props.maxRetries || 3)) {
      this.scheduleAutoRetry();
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
    if (this.recoveryTimeoutId) {
      clearTimeout(this.recoveryTimeoutId);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    const report: ErrorReport = {
      errorId: this.state.errorId,
      timestamp: this.state.timestamp,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      retryCount: this.state.retryCount,
      recoveryAttempted: this.state.recoveryAttempted
    };

    // Queue report for batch sending
    this.errorReportQueue.push(report);

    // Send report using custom reporter or default
    if (this.props.errorReporter) {
      this.props.errorReporter(error, errorInfo);
    } else {
      this.sendErrorReport(report);
    }
  };

  private sendErrorReport = async (report: ErrorReport) => {
    try {
      // In a real application, you would send this to your error reporting service
      // For now, we'll just log it
      console.warn('Error Report:', report);
      
      // Example: Send to external service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(report)
      // });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  private getUserId = (): string | undefined => {
    // Get user ID from your authentication system
    const userId = localStorage.getItem('userId');
    return userId ?? undefined;
  };

  private getSessionId = (): string | undefined => {
    // Get session ID from your session management
    const sessionId = sessionStorage.getItem('sessionId');
    return sessionId ?? undefined;
  };

  private attemptRecovery = async (error: Error, errorInfo: ErrorInfo) => {
    if (this.state.isRecovering || this.state.recoveryAttempted) {
      return;
    }

    this.setState({ isRecovering: true });

    const strategies = [
      ...this.getDefaultRecoveryStrategies(),
      ...(this.props.recoveryStrategies || [])
    ].sort((a, b) => b.priority - a.priority);

    for (const strategy of strategies) {
      if (strategy.condition(error, errorInfo)) {
        try {
          console.log(`Attempting recovery strategy: ${strategy.name}`);
          
          const recoveryPromise = strategy.action(error, errorInfo);
          const timeoutPromise = strategy.timeout ? 
            new Promise<boolean>((_, reject) => 
              setTimeout(() => reject(new Error('Recovery timeout')), strategy.timeout)
            ) : Promise.resolve(false);

          const success = await Promise.race([recoveryPromise, timeoutPromise]);
          
          if (success) {
            console.log(`Recovery strategy '${strategy.name}' succeeded`);
            this.setState({
              hasError: false,
              error: undefined,
              errorInfo: undefined,
              isRecovering: false,
              recoveryAttempted: true
            });
            return;
          }
        } catch (recoveryError) {
          console.warn(`Recovery strategy '${strategy.name}' failed:`, recoveryError);
        }
      }
    }

    this.setState({ 
      isRecovering: false, 
      recoveryAttempted: true 
    });
  };

  private getDefaultRecoveryStrategies = (): RecoveryStrategy[] => [
    {
      name: 'Memory Cleanup',
      condition: (error) => error.message.includes('memory') || error.message.includes('heap'),
      action: async () => {
        // Force garbage collection if available
        if (window.gc) {
          window.gc();
        }
        
        // Clear caches
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        }
        
        // Clear localStorage of non-essential items
        const nonEssentialKeys = Object.keys(localStorage).filter(key => 
          !key.includes('auth') && !key.includes('user') && !key.includes('session')
        );
        nonEssentialKeys.forEach(key => localStorage.removeItem(key));
        
        return true;
      },
      priority: 8,
      timeout: 5000
    },
    {
      name: 'Network Recovery',
      condition: (error) => error.message.includes('network') || error.message.includes('fetch'),
      action: async () => {
        // Wait for network to recover
        if (!navigator.onLine) {
          await new Promise(resolve => {
            const handleOnline = () => {
              window.removeEventListener('online', handleOnline);
              resolve(true);
            };
            window.addEventListener('online', handleOnline);
          });
        }
        
        // Test network connectivity
        try {
          await fetch('/api/health', { method: 'HEAD' });
          return true;
        } catch {
          return false;
        }
      },
      priority: 7,
      timeout: 10000
    },
    {
      name: 'Component Isolation',
      condition: (error, errorInfo) => {
        return Boolean(this.props.isolateErrors && errorInfo.componentStack?.includes('Avatar'));
      },
      action: async () => {
        // Disable problematic components temporarily
        sessionStorage.setItem('disable_avatar', 'true');
        sessionStorage.setItem('disable_3d', 'true');
        return true;
      },
      priority: 6,
      timeout: 1000
    },
    {
      name: 'State Reset',
      condition: () => true,
      action: async () => {
        // Reset application state
        sessionStorage.clear();
        
        // Reset React state by forcing re-mount
        const event = new CustomEvent('app-reset');
        window.dispatchEvent(event);
        
        return true;
      },
      priority: 5,
      timeout: 2000
    }
  ];

  private scheduleAutoRetry = () => {
    const delay = Math.min(1000 * Math.pow(2, this.state.retryCount), 10000); // Exponential backoff
    
    this.retryTimeoutId = setTimeout(() => {
      this.handleRetry();
    }, delay);
  };

  private handleRetry = () => {
    if (this.state.retryCount >= (this.props.maxRetries || 3)) {
      return;
    }

    console.log(`Retrying (attempt ${this.state.retryCount + 1}/${this.props.maxRetries || 3})`);

    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1,
      isRecovering: false,
      recoveryAttempted: false
    }));

    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  private handleManualRetry = () => {
    this.handleRetry();
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleReportIssue = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      timestamp: this.state.timestamp.toISOString()
    };
    
    const subject = `Error Report: ${this.state.error?.name || 'Unknown Error'}`;
    const body = `Error ID: ${errorDetails.errorId}\nTimestamp: ${errorDetails.timestamp}\nMessage: ${errorDetails.message}`;
    
    window.open(`mailto:support@example.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  private renderFallbackContent = (): ReactNode => {
    const { error, errorInfo, isRecovering, retryCount } = this.state;
    const { maxRetries = 3, retryable = true, fallbackMode = 'alternative' } = this.props;

    if (isRecovering) {
      return (
        <div className="error-boundary recovery">
          <div className="error-boundary-content">
            <div className="recovery-spinner"></div>
            <h2>🔄 Attempting Recovery</h2>
            <p>We're trying to fix the issue automatically. Please wait...</p>
          </div>
        </div>
      );
    }

    switch (fallbackMode) {
      case 'minimal':
        return (
          <div className="error-boundary minimal">
            <div className="error-boundary-content">
              <h2>⚠️ Something went wrong</h2>
              <p>Please refresh the page to continue.</p>
              <button onClick={this.handleReload} className="error-boundary-button error-boundary-button--primary">
                Refresh Page
              </button>
            </div>
          </div>
        );

      case 'offline':
        return (
          <div className="error-boundary offline">
            <div className="error-boundary-content">
              <h2>📱 Offline Mode</h2>
              <p>The application is running in limited offline mode due to an error.</p>
              <div className="error-boundary-actions">
                <button onClick={this.handleReload} className="error-boundary-button error-boundary-button--primary">
                  Try Again Online
                </button>
              </div>
            </div>
          </div>
        );

      default: // 'alternative'
        return (
          <div className="error-boundary">
            <div className="error-boundary-content">
              <h2>🚨 Something went wrong</h2>
              <p>
                We're sorry, but something unexpected happened. 
                {retryable && retryCount < maxRetries && ' You can try again or contact support if the problem persists.'}
                {retryCount >= maxRetries && ' Please contact support for assistance.'}
              </p>
              
              <div className="error-boundary-actions">
                {retryable && retryCount < maxRetries && (
                  <button 
                    onClick={this.handleManualRetry}
                    className="error-boundary-button error-boundary-button--primary"
                  >
                    Try Again {retryCount > 0 && `(${retryCount}/${maxRetries})`}
                  </button>
                )}
                
                <button 
                  onClick={this.handleReload}
                  className="error-boundary-button error-boundary-button--secondary"
                >
                  Reload Page
                </button>
                
                <button 
                  onClick={this.handleReportIssue}
                  className="error-boundary-button error-boundary-button--tertiary"
                >
                  Report Issue
                </button>
              </div>

              {/* Error details for development */}
              {this.props.showErrorDetails && error && (
                <details className="error-boundary-details">
                  <summary>Error Details (Development Only)</summary>
                  <div className="error-boundary-error">
                    <h4>Error ID:</h4>
                    <code>{this.state.errorId}</code>
                    
                    <h4>Error Message:</h4>
                    <code>{error.message}</code>
                    
                    {error.stack && (
                      <>
                        <h4>Stack Trace:</h4>
                        <pre>{error.stack}</pre>
                      </>
                    )}
                    
                    {errorInfo?.componentStack && (
                      <>
                        <h4>Component Stack:</h4>
                        <pre>{errorInfo.componentStack}</pre>
                      </>
                    )}
                    
                    <h4>Retry Count:</h4>
                    <code>{retryCount}</code>
                    
                    <h4>Timestamp:</h4>
                    <code>{this.state.timestamp.toISOString()}</code>
                  </div>
                </details>
              )}
            </div>
          </div>
        );
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback component
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error!, this.state.errorInfo!);
        }
        return this.props.fallback;
      }

      // Default fallback
      return this.renderFallbackContent();
    }

    return this.props.children;
  }
}

export default EnhancedErrorBoundary; 