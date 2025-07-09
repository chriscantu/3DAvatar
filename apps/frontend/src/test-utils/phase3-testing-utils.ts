import { vi } from 'vitest';
import { render, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ChatMessage } from '../types/common';
import type { Context, ContextAnalysis } from '../types/context';

/**
 * Phase 3 Testing Infrastructure
 * Comprehensive utilities for test-driven development approach
 */

// Type-safe test builders
export class TypeSafeTestBuilder {
  /**
   * Create type-safe mock functions with proper TypeScript types
   */
  static createTypedMock<T extends (...args: any[]) => any>(
    implementation?: T
  ): T & { mock: any } {
    const mockFn = vi.fn(implementation);
    return mockFn as T & { mock: any };
  }

  /**
   * Create type-safe event handlers for testing
   */
  static createEventHandlers<T extends Record<string, (...args: any[]) => any>>(
    handlers: Partial<T>
  ): T {
    const mockHandlers = {} as T;
    
    for (const [key, handler] of Object.entries(handlers)) {
      mockHandlers[key as keyof T] = this.createTypedMock(handler);
    }
    
    return mockHandlers;
  }

  /**
   * Create type-safe props with validation
   */
  static createValidatedProps<T extends Record<string, any>>(
    props: T,
    validator?: (props: T) => boolean
  ): T {
    if (validator && !validator(props)) {
      throw new Error('Invalid props provided to test');
    }
    return props;
  }
}

// Performance testing utilities
export class PerformanceTestUtils {
  private static performanceEntries: PerformanceEntry[] = [];

  /**
   * Start performance monitoring for a test
   */
  static startMonitoring(testName: string): void {
    this.performanceEntries = [];
    performance.mark(`${testName}-start`);
  }

  /**
   * End performance monitoring and return metrics
   */
  static endMonitoring(testName: string): {
    duration: number;
    memoryUsage: number;
    renderTime: number;
  } {
    performance.mark(`${testName}-end`);
    performance.measure(testName, `${testName}-start`, `${testName}-end`);
    
    const measure = performance.getEntriesByName(testName)[0];
    const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
    
    return {
      duration: measure.duration,
      memoryUsage,
      renderTime: measure.duration
    };
  }

  /**
   * Assert performance thresholds
   */
  static assertPerformance(
    metrics: { duration: number; memoryUsage: number; renderTime: number },
    thresholds: { maxDuration?: number; maxMemory?: number; maxRenderTime?: number }
  ): void {
    if (thresholds.maxDuration && metrics.duration > thresholds.maxDuration) {
      throw new Error(`Performance threshold exceeded: duration ${metrics.duration}ms > ${thresholds.maxDuration}ms`);
    }
    
    if (thresholds.maxMemory && metrics.memoryUsage > thresholds.maxMemory) {
      throw new Error(`Memory threshold exceeded: ${metrics.memoryUsage} bytes > ${thresholds.maxMemory} bytes`);
    }
    
    if (thresholds.maxRenderTime && metrics.renderTime > thresholds.maxRenderTime) {
      throw new Error(`Render time threshold exceeded: ${metrics.renderTime}ms > ${thresholds.maxRenderTime}ms`);
    }
  }

  /**
   * Create performance test wrapper
   */
  static withPerformanceTracking<T>(
    testName: string,
    testFn: () => T,
    thresholds?: { maxDuration?: number; maxMemory?: number; maxRenderTime?: number }
  ): T {
    this.startMonitoring(testName);
    
    try {
      const result = testFn();
      const metrics = this.endMonitoring(testName);
      
      if (thresholds) {
        this.assertPerformance(metrics, thresholds);
      }
      
      return result;
    } catch (error) {
      this.endMonitoring(testName);
      throw error;
    }
  }
}

// Linting error test utilities
export class LintingTestUtils {
  /**
   * Test that a variable is actually used in the component
   */
  static testVariableUsage(
    renderResult: RenderResult,
    variableName: string,
    expectedUsage: 'dom' | 'callback' | 'effect' | 'state'
  ): void {
    const { container } = renderResult;
    
    switch (expectedUsage) {
      case 'dom':
        // Check if variable affects DOM
        expect(container.innerHTML).toContain(variableName);
        break;
      case 'callback':
        // Variable should be used in event handlers
        expect(container.querySelector(`[data-testid="${variableName}"]`)).toBeTruthy();
        break;
      case 'effect':
        // Variable should trigger side effects
        expect(container.querySelector(`[data-effect="${variableName}"]`)).toBeTruthy();
        break;
      case 'state':
        // Variable should affect component state
        expect(container.querySelector(`[data-state="${variableName}"]`)).toBeTruthy();
        break;
    }
  }

  /**
   * Test React hook dependencies
   */
  static testHookDependencies(
    hookResult: any,
    dependencies: string[],
    expectedBehavior: 'rerender' | 'no-rerender'
  ): void {
    const initialValue = hookResult.current;
    
    // Simulate dependency change
    dependencies.forEach(dep => {
      // Mock dependency change
      if (typeof hookResult.current[dep] === 'function') {
        hookResult.current[dep]();
      }
    });
    
    if (expectedBehavior === 'rerender') {
      expect(hookResult.current).not.toBe(initialValue);
    } else {
      expect(hookResult.current).toBe(initialValue);
    }
  }

  /**
   * Test that imports are actually used
   */
  static testImportUsage(
    component: React.ComponentType<any>,
    importName: string,
    usage: 'prop' | 'hook' | 'util' | 'type'
  ): void {
    const componentString = component.toString();
    
    switch (usage) {
      case 'prop':
        expect(componentString).toMatch(new RegExp(`props\\.${importName}|\\{.*${importName}.*\\}`));
        break;
      case 'hook':
        expect(componentString).toMatch(new RegExp(`${importName}\\(|use${importName}`));
        break;
      case 'util':
        expect(componentString).toMatch(new RegExp(`${importName}\\.|${importName}\\(`));
        break;
      case 'type':
        // Type imports are used at compile time
        expect(componentString).toContain(importName);
        break;
    }
  }
}

// Type safety testing utilities
export class TypeSafetyTestUtils {
  /**
   * Test that a value matches expected TypeScript type
   */
  static assertType<T>(value: any, typeGuard: (value: any) => value is T): asserts value is T {
    if (!typeGuard(value)) {
      throw new Error(`Value does not match expected type: ${JSON.stringify(value)}`);
    }
  }

  /**
   * Create type-safe mock with proper interface
   */
  static createTypedMock<T extends Record<string, any>>(
    interfaceShape: T
  ): T {
    const mock = {} as T;
    
    for (const [key, value] of Object.entries(interfaceShape)) {
      if (typeof value === 'function') {
        mock[key as keyof T] = vi.fn(value);
      } else if (typeof value === 'object' && value !== null) {
        mock[key as keyof T] = this.createTypedMock(value);
      } else {
        mock[key as keyof T] = value;
      }
    }
    
    return mock;
  }

  /**
   * Validate service interface implementation
   */
  static validateServiceInterface<T extends Record<string, any>>(
    implementation: T,
    expectedInterface: T
  ): { isValid: boolean; missingMethods: string[]; invalidMethods: string[] } {
    const missingMethods: string[] = [];
    const invalidMethods: string[] = [];

    for (const [key, expectedValue] of Object.entries(expectedInterface)) {
      if (!(key in implementation)) {
        missingMethods.push(key);
        continue;
      }

      const actualValue = implementation[key];
      
      if (typeof expectedValue === 'function' && typeof actualValue !== 'function') {
        invalidMethods.push(`${key}: expected function, got ${typeof actualValue}`);
      }
    }

    return {
      isValid: missingMethods.length === 0 && invalidMethods.length === 0,
      missingMethods,
      invalidMethods
    };
  }
}

// Enhanced component testing utilities
export class ComponentTestUtils {
  /**
   * Render component with comprehensive error boundary
   */
  static renderWithErrorBoundary(
    component: React.ReactElement,
    options?: {
      onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
      fallback?: React.ComponentType<any>;
    }
  ): RenderResult & { errorBoundary: { hasError: boolean; error?: Error } } {
    let errorBoundaryState = { hasError: false, error: undefined as Error | undefined };

    const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
      const [hasError, setHasError] = React.useState(false);
      const [error, setError] = React.useState<Error | undefined>();

      React.useEffect(() => {
        const handleError = (event: ErrorEvent) => {
          setHasError(true);
          setError(event.error);
          errorBoundaryState = { hasError: true, error: event.error };
          
          if (options?.onError) {
            options.onError(event.error, { componentStack: '' });
          }
        };

        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
      }, []);

      if (hasError) {
        return options?.fallback ? React.createElement(options.fallback) : React.createElement('div', null, 'Error occurred');
      }

      return React.createElement(React.Fragment, null, children);
    };

    const result = render(React.createElement(ErrorBoundary, {}, component));

    return {
      ...result,
      errorBoundary: errorBoundaryState
    };
  }

  /**
   * Test component with different prop combinations
   */
  static testPropCombinations<T extends Record<string, any>>(
    Component: React.ComponentType<T>,
    propCombinations: T[],
    testFn: (props: T, renderResult: RenderResult) => void
  ): void {
    propCombinations.forEach((props, index) => {
      const renderResult = render(React.createElement(Component, props));
      
      try {
        testFn(props, renderResult);
      } catch (error) {
        throw new Error(`Test failed for prop combination ${index}: ${error}`);
      } finally {
        renderResult.unmount();
      }
    });
  }

  /**
   * Test component accessibility
   */
  static async testAccessibility(
    renderResult: RenderResult,
    options?: {
      checkFocus?: boolean;
      checkAria?: boolean;
      checkKeyboard?: boolean;
    }
  ): Promise<{ passed: boolean; violations: string[] }> {
    const { container } = renderResult;
    const violations: string[] = [];

    // Check focus management
    if (options?.checkFocus !== false) {
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        const firstFocusable = focusableElements[0] as HTMLElement;
        firstFocusable.focus();
        
        if (document.activeElement !== firstFocusable) {
          violations.push('Focus management: First focusable element not focused');
        }
      }
    }

    // Check ARIA attributes
    if (options?.checkAria !== false) {
      const elementsWithAriaLabel = container.querySelectorAll('[aria-label]');
      const elementsWithAriaDescribedBy = container.querySelectorAll('[aria-describedby]');
      
      elementsWithAriaDescribedBy.forEach((element) => {
        const describedBy = element.getAttribute('aria-describedby');
        if (describedBy && !container.querySelector(`#${describedBy}`)) {
          violations.push(`ARIA: Element references non-existent describedby ID: ${describedBy}`);
        }
      });
    }

    // Check keyboard navigation
    if (options?.checkKeyboard !== false) {
      const user = userEvent.setup();
      const buttons = container.querySelectorAll('button');
      
      for (const button of buttons) {
        if (!button.disabled) {
          button.focus();
          await user.keyboard('{Enter}');
          // Should not throw error
        }
      }
    }

    return {
      passed: violations.length === 0,
      violations
    };
  }
}

// Test data factories
export class TestDataFactory {
  /**
   * Create realistic chat message data
   */
  static createChatMessage(overrides?: Partial<ChatMessage>): ChatMessage {
    return {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: 'Test message content',
      timestamp: Date.now(),
      sender: 'user',
      isTyping: false,
      error: false,
      ...overrides
    };
  }

  /**
   * Create realistic context data
   */
  static createContext(overrides?: Partial<Context>): Context {
    return {
      system: {
        avatarPersonality: {
          traits: {
            empathy: 0.8,
            curiosity: 0.7,
            patience: 0.9,
            humor: 'gentle',
            supportiveness: 0.8,
            formality: 0.3,
            enthusiasm: 0.6
          },
          communicationPatterns: {
            greeting: { tone: 'warm', approach: 'friendly', examples: [] },
            questioning: { tone: 'curious', approach: 'gentle', examples: [] },
            explaining: { tone: 'clear', approach: 'simple', examples: [] },
            encouraging: { tone: 'supportive', approach: 'positive', examples: [] },
            farewells: { tone: 'warm', approach: 'caring', examples: [] }
          },
          boundaries: {
            prohibitedTopics: [],
            maxMessageLength: 1000,
            responseGuidelines: []
          },
          responseStyles: {
            casual: { structure: 'casual', vocabulary: 'casual', examples: [] },
            professional: { structure: 'professional', vocabulary: 'professional', examples: [] },
            supportive: { structure: 'supportive', vocabulary: 'supportive', examples: [] },
            educational: { structure: 'educational', vocabulary: 'educational', examples: [] }
          }
        },
        conversationGuidelines: {
          maxContextWindow: 10,
          contextPriority: { immediate: 1.0, recent: 0.8, session: 0.6, historical: 0.3 },
          responseRules: [],
          escalationRules: []
        },
        technicalCapabilities: {
          supportedLanguages: ['en'],
          maxTokens: 2000,
          processingTimeout: 30000,
          cacheSize: 100,
          memoryLimits: { shortTerm: 50, longTerm: 1000, workingMemory: 20 }
        }
      },
      session: {
        sessionId: `session-${Date.now()}`,
        startTime: new Date().toISOString(),
        userProfile: {
          userId: `user-${Date.now()}`,
          preferences: {},
          conversationHistory: [],
          learnedTraits: {}
        },
        conversationPhase: 'active',
        environmentData: {
          roomSettings: {},
          visualPreferences: {},
          audioSettings: {}
        }
      },
      immediate: {
        currentMessage: this.createChatMessage(),
        recentMessages: [this.createChatMessage()],
        currentUserEmotion: 'neutral',
        conversationFlow: 'normal',
        activeTopics: ['general'],
        userIntent: 'conversation'
      },
      timestamp: new Date().toISOString(),
      ...overrides
    };
  }

  /**
   * Create realistic context analysis
   */
  static createContextAnalysis(overrides?: Partial<ContextAnalysis>): ContextAnalysis {
    return {
      relevanceScore: 0.8,
      emotionalTone: { primary: 'neutral', intensity: 0.5, confidence: 0.7 },
      topicProgression: ['general'],
      userIntentAnalysis: { primaryIntent: 'conversation', confidence: 0.8 },
      responseRecommendations: [],
      conversationQuality: { engagement: 0.8, coherence: 0.9, satisfaction: 0.7 },
      contextHealth: { completeness: 0.9, accuracy: 0.8, freshness: 0.9 },
      ...overrides
    };
  }
}

// Test assertion utilities
export class TestAssertions {
  /**
   * Assert that a function is called with proper types
   */
  static assertTypedCall<T extends (...args: any[]) => any>(
    mockFn: T & { mock: any },
    expectedArgs: Parameters<T>,
    typeGuards: Array<(arg: any) => boolean>
  ): void {
    expect(mockFn).toHaveBeenCalled();
    
    const lastCall = mockFn.mock.calls[mockFn.mock.calls.length - 1];
    
    expectedArgs.forEach((expectedArg, index) => {
      const actualArg = lastCall[index];
      
      if (typeGuards[index] && !typeGuards[index](actualArg)) {
        throw new Error(`Argument ${index} does not match expected type`);
      }
      
      expect(actualArg).toEqual(expectedArg);
    });
  }

  /**
   * Assert component renders without accessibility violations
   */
  static async assertAccessible(renderResult: RenderResult): Promise<void> {
    const accessibilityResult = await ComponentTestUtils.testAccessibility(renderResult);
    
    if (!accessibilityResult.passed) {
      throw new Error(`Accessibility violations: ${accessibilityResult.violations.join(', ')}`);
    }
  }

  /**
   * Assert performance meets requirements
   */
  static assertPerformance(
    testName: string,
    testFn: () => void,
    requirements: { maxDuration: number; maxMemory?: number }
  ): void {
    const metrics = PerformanceTestUtils.withPerformanceTracking(testName, testFn);
    
    if (requirements.maxDuration && metrics > requirements.maxDuration) {
      throw new Error(`Performance requirement failed: ${metrics}ms > ${requirements.maxDuration}ms`);
    }
  }
}

// Export all utilities
export default {
  TypeSafeTestBuilder,
  PerformanceTestUtils,
  LintingTestUtils,
  TypeSafetyTestUtils,
  ComponentTestUtils,
  TestDataFactory,
  TestAssertions
}; 