// Common TypeScript interfaces and types for the 3D Avatar application

/**
 * Message types for chat functionality
 */
export interface ChatMessage {
  id: string;
  content: string;
  timestamp: number;
  sender: 'user' | 'assistant';
  isTyping?: boolean;
  error?: boolean;
}

/**
 * API Response types
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ChatResponse {
  message: string;
  timestamp: number;
  messageId: string;
}

/**
 * Voice Service types
 */
export interface VoiceServiceState {
  isListening: boolean;
  transcript: string;
  error: string | null;
  isSupported: boolean;
}

export interface VoiceServiceActions {
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  clearTranscript: () => void;
  clearError: () => void;
}

/**
 * 3D Avatar types
 */
export interface AvatarProps {
  position?: [number, number, number];
  isSpeaking?: boolean;
}

export interface AvatarColors {
  readonly PRIMARY_FUR: string;
  readonly SECONDARY_FUR: string;
  readonly BLACK: string;
  readonly WHITE: string;
  readonly PINK: string;
  readonly GOLD: string;
}

export interface GeometryConfig {
  readonly SPHERE_SEGMENTS: number;
  readonly CYLINDER_SEGMENTS: number;
  readonly LOW_POLY_SEGMENTS: number;
}

/**
 * Error types
 */
export interface AppError {
  message: string;
  code?: string;
  timestamp: number;
  stack?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

/**
 * Component Props types
 */
export interface ComponentWithChildren {
  children: React.ReactNode;
}

export interface ComponentWithClassName {
  className?: string;
}

export interface ComponentWithTestId {
  testId?: string;
}

/**
 * Event handler types
 */
export type MessageHandler = (message: string) => void;
export type VoiceToggleHandler = (isListening: boolean) => void;
export type ErrorHandler = (error: Error, errorInfo?: React.ErrorInfo) => void;

/**
 * Theme types
 */
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    error: string;
    warning: string;
    success: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
}

/**
 * Utility types
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Form types
 */
export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

export type FormHandler<T> = (values: T) => Promise<void> | void;
export type ValidationRule<T> = (value: T) => string | null;

/**
 * Animation types
 */
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

export interface SpringConfig {
  tension: number;
  friction: number;
  mass?: number;
}

/**
 * Performance monitoring types
 */
export interface PerformanceMetrics {
  renderTime: number;
  componentCount: number;
  memoryUsage: number;
  timestamp: number;
}

export interface PerformanceThresholds {
  renderTime: number;
  memoryUsage: number;
  componentCount: number;
}

/**
 * Feature flags types
 */
export interface FeatureFlags {
  enableVoiceInput: boolean;
  enableErrorReporting: boolean;
  enablePerformanceMonitoring: boolean;
  enableExperimentalFeatures: boolean;
}

/**
 * Environment types
 */
export interface Environment {
  NODE_ENV: 'development' | 'production' | 'test';
  API_URL: string;
  DEBUG_MODE: boolean;
  FEATURE_FLAGS: FeatureFlags;
} 