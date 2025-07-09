import { vi } from 'vitest';

// Test data factories for consistent test data generation
export const testFactories = {
  // Chat message factory
  createChatMessage: (overrides: Partial<ChatMessageInput> = {}) => ({
    message: 'Hello, how are you?',
    timestamp: Date.now(),
    ...overrides,
  }),

  // API response factory
  createApiResponse: (overrides: Partial<ApiResponse> = {}) => ({
    response: 'I am doing well, thank you for asking!',
    timestamp: new Date().toISOString(),
    ...overrides,
  }),

  // OpenAI completion response factory
  createOpenAIResponse: (overrides: Partial<OpenAICompletionResponse> = {}) => ({
    choices: [
      {
        message: {
          content: 'This is a test response from OpenAI',
          role: 'assistant',
        },
        finish_reason: 'stop',
        index: 0,
      },
    ],
    created: Math.floor(Date.now() / 1000),
    model: 'gpt-3.5-turbo',
    object: 'chat.completion',
    usage: {
      prompt_tokens: 20,
      completion_tokens: 15,
      total_tokens: 35,
    },
    ...overrides,
  }),

  // Empty OpenAI response factory
  createEmptyOpenAIResponse: () => ({
    choices: [],
    created: Math.floor(Date.now() / 1000),
    model: 'gpt-3.5-turbo',
    object: 'chat.completion',
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    },
  }),

  // Error response factory
  createErrorResponse: (overrides: Partial<ErrorResponse> = {}) => ({
    error: 'Something went wrong',
    details: 'Test error details',
    timestamp: new Date().toISOString(),
    ...overrides,
  }),

  // Health check response factory
  createHealthResponse: (overrides: Partial<HealthResponse> = {}) => ({
    status: 'OK',
    message: '3DAvatar Backend is running',
    timestamp: new Date().toISOString(),
    ...overrides,
  }),

  // Request body factory
  createRequestBody: (overrides: Record<string, any> = {}) => ({
    message: 'Test message',
    userId: 'test-user-123',
    sessionId: 'test-session-456',
    ...overrides,
  }),

  // Invalid request body factory
  createInvalidRequestBody: (type: 'empty' | 'missing-message' | 'invalid-type' = 'empty') => {
    switch (type) {
      case 'empty':
        return {};
      case 'missing-message':
        return { userId: 'test-user' };
      case 'invalid-type':
        return { message: 123 };
      default:
        return {};
    }
  },

  // Mock OpenAI client factory
  createMockOpenAI: () => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  }),

  // Long message factory for testing limits
  createLongMessage: (length: number = 1000) => {
    return 'A'.repeat(length);
  },

  // Special character message factory
  createSpecialCharacterMessage: () => ({
    message: 'Hello! 🎉 This message contains special characters: àáâãäåæçèéêë & <script>alert("test")</script>',
  }),

  // Multiple message factory
  createMultipleMessages: (count: number = 5) => {
    return Array.from({ length: count }, (_, index) => ({
      message: `Test message ${index + 1}`,
      timestamp: Date.now() + index * 1000,
    }));
  },

  // Error scenarios factory
  createErrorScenarios: () => ({
    networkError: new Error('Network connection failed'),
    timeoutError: new Error('Request timeout'),
    apiError: new Error('OpenAI API error'),
    authError: new Error('Authentication failed'),
    rateLimitError: new Error('Rate limit exceeded'),
  }),

  // Environment variable factory
  createTestEnv: (overrides: Record<string, string> = {}) => ({
    NODE_ENV: 'test',
    PORT: '3001',
    OPENAI_API_KEY: 'test-api-key-12345',
    ...overrides,
  }),
};

// Type definitions for better type safety
export interface ChatMessageInput {
  message: string;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

export interface ApiResponse {
  response: string;
  timestamp: string;
}

export interface OpenAICompletionResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
    index: number;
  }>;
  created: number;
  model: string;
  object: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ErrorResponse {
  error: string;
  details?: string;
  timestamp?: string;
}

export interface HealthResponse {
  status: string;
  message: string;
  timestamp?: string;
}

// Test scenario generators
export const testScenarios = {
  // Generate success scenarios
  generateSuccessScenarios: () => [
    {
      name: 'simple greeting',
      input: testFactories.createChatMessage({ message: 'Hello' }),
      expected: 'should return a greeting response',
    },
    {
      name: 'question',
      input: testFactories.createChatMessage({ message: 'How are you?' }),
      expected: 'should return a helpful response',
    },
    {
      name: 'long message',
      input: testFactories.createChatMessage({ message: testFactories.createLongMessage(500) }),
      expected: 'should handle long messages',
    },
  ],

  // Generate error scenarios
  generateErrorScenarios: () => [
    {
      name: 'empty message',
      input: testFactories.createInvalidRequestBody('empty'),
      expectedStatus: 400,
      expectedError: 'Message is required',
    },
    {
      name: 'missing message field',
      input: testFactories.createInvalidRequestBody('missing-message'),
      expectedStatus: 400,
      expectedError: 'Message is required',
    },
    {
      name: 'invalid message type',
      input: testFactories.createInvalidRequestBody('invalid-type'),
      expectedStatus: 400,
      expectedError: 'Message must be a string',
    },
  ],

  // Generate performance scenarios
  generatePerformanceScenarios: () => [
    {
      name: 'concurrent requests',
      requestCount: 10,
      expectedMaxResponseTime: 2000,
    },
    {
      name: 'large payload',
      messageSize: 10000,
      expectedMaxResponseTime: 5000,
    },
  ],
}; 