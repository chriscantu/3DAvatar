import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Global test configuration
const TEST_CONFIG = {
  PORT: 3001,
  TIMEOUT: 5000,
  API_KEY: 'test-api-key-12345',
  NODE_ENV: 'test',
} as const;

// Mock console methods to reduce noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = TEST_CONFIG.NODE_ENV;
  process.env.PORT = TEST_CONFIG.PORT.toString();
  process.env.OPENAI_API_KEY = TEST_CONFIG.API_KEY;
  
  // Mock console methods
  console.log = vi.fn();
  console.error = vi.fn();
  console.warn = vi.fn();
  
  // Set test timeout
  vi.setConfig({ testTimeout: TEST_CONFIG.TIMEOUT });
});

afterAll(() => {
  // Restore console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  
  // Clean up environment variables
  delete process.env.OPENAI_API_KEY;
  delete process.env.PORT;
  delete process.env.NODE_ENV;
});

beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();
  
  // Reset environment variables for each test
  process.env.OPENAI_API_KEY = TEST_CONFIG.API_KEY;
  process.env.NODE_ENV = TEST_CONFIG.NODE_ENV;
});

afterEach(() => {
  // Clean up after each test
  vi.clearAllTimers();
  vi.restoreAllMocks();
});

// Global test utilities
export const testUtils = {
  async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  
  generateRandomString(length: number = 10): string {
    return Math.random().toString(36).substring(2, length + 2);
  },
  
  createMockRequest(overrides: Record<string, any> = {}) {
    return {
      body: {},
      params: {},
      query: {},
      headers: {},
      ...overrides,
    };
  },
  
  createMockResponse() {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
      end: vi.fn().mockReturnThis(),
    };
    return res;
  },
  
  expectValidTimestamp(timestamp: string): boolean {
    const date = new Date(timestamp);
    return !isNaN(date.getTime());
  },
  
  expectValidResponseStructure(response: any, expectedKeys: string[]): boolean {
    return expectedKeys.every(key => response.hasOwnProperty(key));
  },
};

// Export test configuration for use in tests
export { TEST_CONFIG }; 