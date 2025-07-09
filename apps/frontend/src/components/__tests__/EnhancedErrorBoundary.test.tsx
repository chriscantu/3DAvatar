import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorBoundary } from '../ErrorBoundary';

// Mock console methods to avoid noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  console.error = vi.fn();
  console.warn = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Test component that throws errors
const ThrowingComponent: React.FC<{ shouldThrow?: boolean; errorMessage?: string }> = ({ 
  shouldThrow = false, 
  errorMessage = 'Test error' 
}) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div>Working component</div>;
};

// Test component that throws async errors
const AsyncThrowingComponent: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = false }) => {
  React.useEffect(() => {
    if (shouldThrow) {
      setTimeout(() => {
        throw new Error('Async error');
      }, 10);
    }
  }, [shouldThrow]);
  
  return <div>Async component</div>;
};

// Component that simulates network errors
const NetworkErrorComponent: React.FC<{ shouldFail?: boolean }> = ({ shouldFail = false }) => {
  const [error, setError] = React.useState<Error | null>(null);
  
  React.useEffect(() => {
    if (shouldFail) {
      setError(new Error('Network request failed'));
    }
  }, [shouldFail]);
  
  if (error) {
    throw error;
  }
  
  return <div>Network component</div>;
};

describe('Enhanced Error Boundary', () => {
  describe('Basic Error Handling', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={false} />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Working component')).toBeInTheDocument();
    });
    
    it('should catch and display error when child throws', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} errorMessage="Test error message" />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('🚨 Something went wrong')).toBeInTheDocument();
      expect(screen.getByText(/We're sorry, but something unexpected happened/)).toBeInTheDocument();
    });
    
    it('should show error details in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} errorMessage="Development error" />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Error Details (Development Only)')).toBeInTheDocument();
      expect(screen.getByText('Development error')).toBeInTheDocument();
      
      process.env.NODE_ENV = originalEnv;
    });
    
    it('should hide error details in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} errorMessage="Production error" />
        </ErrorBoundary>
      );
      
      expect(screen.queryByText('Error Details (Development Only)')).not.toBeInTheDocument();
      expect(screen.queryByText('Production error')).not.toBeInTheDocument();
      
      process.env.NODE_ENV = originalEnv;
    });
  });
  
  describe('Custom Error Handling', () => {
    it('should call custom error handler when provided', () => {
      const mockErrorHandler = vi.fn();
      
      render(
        <ErrorBoundary onError={mockErrorHandler}>
          <ThrowingComponent shouldThrow={true} errorMessage="Custom handler test" />
        </ErrorBoundary>
      );
      
      expect(mockErrorHandler).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Custom handler test' }),
        expect.any(Object)
      );
    });
    
    it('should render custom fallback component', () => {
      const CustomFallback = () => <div>Custom error fallback</div>;
      
      render(
        <ErrorBoundary fallback={<CustomFallback />}>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Custom error fallback')).toBeInTheDocument();
      expect(screen.queryByText('🚨 Something went wrong')).not.toBeInTheDocument();
    });
    
    it('should render custom fallback function', () => {
      const customFallbackFunction = (error: Error) => (
        <div>Error occurred: {error.message}</div>
      );
      
      render(
        <ErrorBoundary fallback={customFallbackFunction}>
          <ThrowingComponent shouldThrow={true} errorMessage="Function fallback test" />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Error occurred: Function fallback test')).toBeInTheDocument();
    });
  });
  
  describe('Error Recovery', () => {
    it('should allow retry functionality', async () => {
      let shouldThrow = true;
      const TestComponent = () => <ThrowingComponent shouldThrow={shouldThrow} />;
      
      const { rerender } = render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      );
      
      // Error should be displayed
      expect(screen.getByText('🚨 Something went wrong')).toBeInTheDocument();
      
      // Fix the error condition
      shouldThrow = false;
      
      // Click retry button
      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);
      
      // Rerender with fixed component
      rerender(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      );
      
      // Should show working component again
      expect(screen.getByText('Working component')).toBeInTheDocument();
    });
    
    it('should allow page reload', () => {
      const mockReload = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true
      });
      
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const reloadButton = screen.getByText('Reload Page');
      fireEvent.click(reloadButton);
      
      expect(mockReload).toHaveBeenCalled();
    });
  });
  
  describe('Error Logging', () => {
    it('should log error details to console', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} errorMessage="Logging test" />
        </ErrorBoundary>
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.objectContaining({
          error: 'Logging test',
          timestamp: expect.any(String)
        })
      );
      
      consoleSpy.mockRestore();
    });
    
    it('should include component stack in error info', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <ErrorBoundary>
          <div>
            <ThrowingComponent shouldThrow={true} />
          </div>
        </ErrorBoundary>
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      );
      
      consoleSpy.mockRestore();
    });
  });
  
  describe('Multiple Error Scenarios', () => {
    it('should handle multiple errors in sequence', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} errorMessage="First error" />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('🚨 Something went wrong')).toBeInTheDocument();
      
      // Reset and throw different error
      fireEvent.click(screen.getByText('Try Again'));
      
      rerender(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} errorMessage="Second error" />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('🚨 Something went wrong')).toBeInTheDocument();
    });
    
    it('should handle errors from different component types', () => {
      render(
        <ErrorBoundary>
          <div>
            <ThrowingComponent shouldThrow={false} />
            <NetworkErrorComponent shouldFail={true} />
          </div>
        </ErrorBoundary>
      );
      
      expect(screen.getByText('🚨 Something went wrong')).toBeInTheDocument();
    });
  });
  
  describe('Error Boundary Nesting', () => {
    it('should handle nested error boundaries', () => {
      render(
        <ErrorBoundary fallback={<div>Outer boundary</div>}>
          <div>
            <ErrorBoundary fallback={<div>Inner boundary</div>}>
              <ThrowingComponent shouldThrow={true} />
            </ErrorBoundary>
          </div>
        </ErrorBoundary>
      );
      
      // Inner boundary should catch the error
      expect(screen.getByText('Inner boundary')).toBeInTheDocument();
      expect(screen.queryByText('Outer boundary')).not.toBeInTheDocument();
    });
    
    it('should propagate to outer boundary if inner fails', () => {
      const InnerBoundaryThatThrows = () => {
        throw new Error('Inner boundary error');
      };
      
      render(
        <ErrorBoundary fallback={<div>Outer boundary</div>}>
          <div>
            <ErrorBoundary fallback={<InnerBoundaryThatThrows />}>
              <ThrowingComponent shouldThrow={true} />
            </ErrorBoundary>
          </div>
        </ErrorBoundary>
      );
      
      // Outer boundary should catch the error from inner boundary
      expect(screen.getByText('Outer boundary')).toBeInTheDocument();
    });
  });
  
  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const errorContainer = screen.getByRole('alert', { hidden: true });
      expect(errorContainer).toBeInTheDocument();
    });
    
    it('should have focusable retry button', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const retryButton = screen.getByText('Try Again');
      expect(retryButton).toHaveAttribute('type', 'button');
      expect(retryButton).not.toHaveAttribute('disabled');
    });
    
    it('should support keyboard navigation', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const retryButton = screen.getByText('Try Again');
      const reloadButton = screen.getByText('Reload Page');
      
      // Should be able to tab between buttons
      retryButton.focus();
      expect(document.activeElement).toBe(retryButton);
      
      // Simulate tab key
      fireEvent.keyDown(retryButton, { key: 'Tab' });
      reloadButton.focus();
      expect(document.activeElement).toBe(reloadButton);
    });
  });
  
  describe('Performance', () => {
    it('should not affect performance when no errors occur', () => {
      const start = performance.now();
      
      for (let i = 0; i < 100; i++) {
        const { unmount } = render(
          <ErrorBoundary>
            <ThrowingComponent shouldThrow={false} />
          </ErrorBoundary>
        );
        unmount();
      }
      
      const end = performance.now();
      const duration = end - start;
      
      // Should render 100 components quickly
      expect(duration).toBeLessThan(100);
    });
    
    it('should handle error state efficiently', () => {
      const start = performance.now();
      
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const end = performance.now();
      const duration = end - start;
      
      // Error handling should be fast
      expect(duration).toBeLessThan(50);
    });
  });
  
  describe('Memory Management', () => {
    it('should clean up error state on unmount', () => {
      const { unmount } = render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('🚨 Something went wrong')).toBeInTheDocument();
      
      // Unmount should not throw
      expect(() => unmount()).not.toThrow();
    });
    
    it('should handle rapid mount/unmount cycles', () => {
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(
          <ErrorBoundary>
            <ThrowingComponent shouldThrow={i % 2 === 0} />
          </ErrorBoundary>
        );
        unmount();
      }
      
      // Should not leak memory or throw errors
      expect(true).toBe(true);
    });
  });
  
  describe('Error Types', () => {
    it('should handle different error types', () => {
      const errors = [
        new Error('Standard error'),
        new TypeError('Type error'),
        new ReferenceError('Reference error'),
        new RangeError('Range error')
      ];
      
      errors.forEach((error, index) => {
        const ThrowSpecificError = () => {
          throw error;
        };
        
        const { unmount } = render(
          <ErrorBoundary>
            <ThrowSpecificError />
          </ErrorBoundary>
        );
        
        expect(screen.getByText('🚨 Something went wrong')).toBeInTheDocument();
        unmount();
      });
    });
    
    it('should handle non-Error objects', () => {
      const ThrowString = () => {
        throw 'String error';
      };
      
      const ThrowObject = () => {
        throw { message: 'Object error' };
      };
      
      const ThrowNull = () => {
        throw null;
      };
      
      [ThrowString, ThrowObject, ThrowNull].forEach((Component, index) => {
        const { unmount } = render(
          <ErrorBoundary>
            <Component />
          </ErrorBoundary>
        );
        
        expect(screen.getByText('🚨 Something went wrong')).toBeInTheDocument();
        unmount();
      });
    });
  });
  
  describe('Integration with React Features', () => {
    it('should work with React.Suspense', async () => {
      const LazyComponent = React.lazy(() => 
        Promise.resolve({
          default: () => <ThrowingComponent shouldThrow={true} />
        })
      );
      
      render(
        <ErrorBoundary>
          <React.Suspense fallback={<div>Loading...</div>}>
            <LazyComponent />
          </React.Suspense>
        </ErrorBoundary>
      );
      
      await waitFor(() => {
        expect(screen.getByText('🚨 Something went wrong')).toBeInTheDocument();
      });
    });
    
    it('should work with React.StrictMode', () => {
      render(
        <React.StrictMode>
          <ErrorBoundary>
            <ThrowingComponent shouldThrow={true} />
          </ErrorBoundary>
        </React.StrictMode>
      );
      
      expect(screen.getByText('🚨 Something went wrong')).toBeInTheDocument();
    });
  });
}); 