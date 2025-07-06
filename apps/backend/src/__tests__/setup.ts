import { beforeAll, afterAll } from 'vitest';

// Set test environment variables
beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.PORT = '3001';
});

afterAll(() => {
  // Clean up any test data or connections
}); 