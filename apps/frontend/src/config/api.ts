// API Configuration and Service

/**
 * Custom error types for better error handling
 */
export class ApiError extends Error {
  public status?: number;
  public statusText?: string;
  public data?: unknown;

  constructor(
    message: string,
    status?: number,
    statusText?: string,
    data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

export class NetworkError extends Error {
  public originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
    this.originalError = originalError;
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Request timeout') {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * API Response interface
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Chat API types
 */
export interface ChatMessage {
  id: string;
  content: string;
  timestamp: number;
  sender: 'user' | 'assistant';
}

export interface ChatResponse {
  message: string;
  timestamp: number;
  messageId: string;
}

/**
 * API Configuration
 */
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

/**
 * Request options interface
 */
interface RequestOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  signal?: AbortSignal;
}

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Enhanced fetch with timeout and retry logic
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit & RequestOptions = {}
): Promise<Response> {
  const {
    timeout = API_CONFIG.TIMEOUT,
    retries = API_CONFIG.RETRY_ATTEMPTS,
    retryDelay = API_CONFIG.RETRY_DELAY,
    signal: externalSignal,
    ...fetchOptions
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= retries; attempt++) {
    // Create combined abort controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Combine external signal with timeout signal
    if (externalSignal) {
      externalSignal.addEventListener('abort', () => controller.abort());
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Don't retry on client errors (4xx) except 408 (timeout)
      if (response.status >= 400 && response.status < 500 && response.status !== 408) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new ApiError(
          `HTTP ${response.status}: ${errorText}`,
          response.status,
          response.statusText,
          errorText
        );
      }

      // Don't retry on successful responses or redirect responses
      if (response.ok || (response.status >= 300 && response.status < 400)) {
        return response;
      }

      // Server errors (5xx) should be retried
      if (response.status >= 500) {
        throw new ApiError(
          `Server error: ${response.status} ${response.statusText}`,
          response.status,
          response.statusText
        );
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof DOMException && error.name === 'AbortError') {
        if (externalSignal?.aborted) {
          throw new Error('Request was cancelled');
        }
        lastError = new TimeoutError(`Request timeout after ${timeout}ms`);
      } else if (error instanceof TypeError) {
        lastError = new NetworkError('Network error - please check your connection', error);
      } else if (error instanceof ApiError) {
        // Don't retry API errors (4xx client errors)
        throw error;
      } else {
        lastError = error as Error;
      }

      // If this is the last attempt, throw the error
      if (attempt === retries) {
        throw lastError;
      }

      // Wait before retrying (with exponential backoff)
      const delay = retryDelay * Math.pow(2, attempt);
      console.warn(`API request failed (attempt ${attempt + 1}/${retries + 1}). Retrying in ${delay}ms...`, lastError);
      await sleep(delay);
    }
  }

  throw lastError!;
}

/**
 * Enhanced API service with better error handling
 */
export class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_CONFIG.BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic API request method
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit & RequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const {
      timeout,
      retries,
      retryDelay,
      signal,
      ...fetchOptions
    } = options;

    const requestOptions: RequestInit & RequestOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
      ...fetchOptions,
      timeout,
      retries,
      retryDelay,
      signal
    };

    try {
      const response = await fetchWithTimeout(url, requestOptions);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new ApiError(
          `HTTP ${response.status}: ${errorText}`,
          response.status,
          response.statusText,
          errorText
        );
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return response.text() as unknown as T;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Add context to errors
      if (error instanceof ApiError) {
        error.message = `API Error at ${endpoint}: ${error.message}`;
      } else if (error instanceof NetworkError) {
        error.message = `Network Error at ${endpoint}: ${error.message}`;
      } else if (error instanceof TimeoutError) {
        error.message = `Timeout Error at ${endpoint}: ${error.message}`;
      }
      
      throw error;
    }
  }

  /**
   * Send chat message with enhanced error handling
   */
  async sendChatMessage(
    message: string,
    options: RequestOptions = {}
  ): Promise<ChatResponse> {
    if (!message.trim()) {
      throw new ApiError('Message cannot be empty', 400);
    }

    return this.request<ChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: message.trim() }),
      ...options,
    });
  }

  /**
   * Health check endpoint
   */
  async healthCheck(options: RequestOptions = {}): Promise<{ status: string; timestamp: number }> {
    return this.request<{ status: string; timestamp: number }>('/api/health', {
      method: 'GET',
      timeout: 5000, // Shorter timeout for health checks
      ...options,
    });
  }

  /**
   * Get chat history (if implemented)
   */
  async getChatHistory(options: RequestOptions = {}): Promise<ChatMessage[]> {
    return this.request<ChatMessage[]>('/api/chat/history', {
      method: 'GET',
      ...options,
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export default configuration
export default {
  apiService,
  API_CONFIG,
  ApiError,
  NetworkError,
  TimeoutError,
}; 