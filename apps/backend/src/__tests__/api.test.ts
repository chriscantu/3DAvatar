import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Express } from 'express';
import { testFactories } from './utils/testFactories';
import { apiTestUtils, testAssertions } from './utils/apiTestUtils';
import { testUtils, TEST_CONFIG } from './setup';

// Mock OpenAI
const mockOpenAI = {
  chat: {
    completions: {
      create: vi.fn(),
    },
  },
};

vi.mock('openai', () => ({
  default: vi.fn(() => mockOpenAI),
}));

// Import the app after mocking
let app: Express;

describe('API Endpoints', () => {
  beforeEach(async () => {
    // Reset mocks and setup
    apiTestUtils.mockManagement.resetAllMocks(mockOpenAI);
    
    // Set environment variables for testing
    process.env.OPENAI_API_KEY = TEST_CONFIG.API_KEY;
    
    // Dynamically import the app to ensure mocks are applied
    const appModule = await import('../index');
    app = appModule.default || appModule;
  });

  describe('Health Endpoint', () => {
    describe('GET /health', () => {
      it('should return health status with correct structure', async () => {
        const result = await apiTestUtils.testHealthEndpoint(app);
        
        expect(result.response.status).toBe(200);
        expect(result.isValid).toBe(true);
        expect(apiTestUtils.validateResponse.health(result.response)).toBe(true);
      });

      it('should return health status quickly', async () => {
        const performanceResult = await apiTestUtils.performance.measureResponseTime(
          () => apiTestUtils.testHealthEndpoint(app)
        );
        
        expect(performanceResult.responseTimeMs).toBeLessThan(100);
        expect(testAssertions.assertResponseTime(performanceResult.responseTimeMs, 100)).toBe(true);
      });

      it('should handle multiple concurrent health checks', async () => {
        const promises = Array.from({ length: 10 }, () => 
          apiTestUtils.testHealthEndpoint(app)
        );
        
        const results = await Promise.all(promises);
        
        expect(results.every(r => r.isValid)).toBe(true);
        expect(results.every(r => r.response.status === 200)).toBe(true);
      });
    });
  });

  describe('Chat Endpoint', () => {
    describe('Success Scenarios', () => {
      it('should handle successful chat response', async () => {
        const result = await apiTestUtils.testChatEndpoint.success(app, mockOpenAI);
        
        expect(result.response.status).toBe(200);
        expect(result.isValid).toBe(true);
        expect(apiTestUtils.validateResponse.chat(result.response)).toBe(true);
        expect(testAssertions.assertValidTimestamp(result.response.body.timestamp)).toBe(true);
        
        // Verify OpenAI was called correctly
        const validation = apiTestUtils.validation.validateOpenAICall(
          mockOpenAI, 
          result.testMessage.message
        );
        expect(validation.called).toBe(true);
        expect(validation.correctModel).toBe(true);
        expect(validation.correctMessage).toBe(true);
        expect(validation.correctSystemPrompt).toBe(true);
        expect(validation.correctParameters).toBe(true);
      });

      it('should handle special characters in messages', async () => {
        const result = await apiTestUtils.testChatEndpoint.specialCharacters(app, mockOpenAI);
        
        expect(result.response.status).toBe(200);
        expect(result.isValid).toBe(true);
        expect(apiTestUtils.validateResponse.chat(result.response)).toBe(true);
      });

      it('should handle long messages', async () => {
        const result = await apiTestUtils.testChatEndpoint.longMessage(app, mockOpenAI);
        
        expect(result.response.status).toBe(200);
        expect(result.isValid).toBe(true);
        expect(apiTestUtils.validateResponse.chat(result.response)).toBe(true);
      });

      it('should handle empty OpenAI response gracefully', async () => {
        const result = await apiTestUtils.testChatEndpoint.emptyResponse(app, mockOpenAI);
        
        expect(result.response.status).toBe(200);
        expect(result.isValid).toBe(true);
        expect(result.response.body.response).toBe('Sorry, I could not generate a response.');
      });
    });

    describe('Error Scenarios', () => {
      it('should return 400 when message is missing', async () => {
        const result = await apiTestUtils.testChatEndpoint.missingMessage(app);
        
        expect(result.response.status).toBe(400);
        expect(result.isValid).toBe(true);
        expect(apiTestUtils.validateResponse.error(result.response)).toBe(true);
      });

      it('should return 500 when OpenAI API key is not configured', async () => {
        const result = await apiTestUtils.testChatEndpoint.missingApiKey(app);
        
        expect(result.response.status).toBe(500);
        expect(result.isValid).toBe(true);
        expect(apiTestUtils.validateResponse.error(result.response)).toBe(true);
      });

      it('should handle OpenAI API errors gracefully', async () => {
        const result = await apiTestUtils.testChatEndpoint.openaiError(app, mockOpenAI);
        
        expect(result.response.status).toBe(500);
        expect(result.isValid).toBe(true);
        expect(apiTestUtils.validateResponse.error(result.response)).toBe(true);
      });
    });

    describe('Performance Tests', () => {
      it('should handle multiple concurrent requests', async () => {
        const result = await apiTestUtils.testConcurrentRequests(app, mockOpenAI, 5);
        
        expect(result.allSuccessful).toBe(true);
        expect(result.responses).toHaveLength(5);
        expect(result.averageResponseTime).toBeLessThan(2000);
        expect(testAssertions.assertResponseTime(result.averageResponseTime, 2000)).toBe(true);
      });

      it('should maintain performance under load', async () => {
        const performanceResult = await apiTestUtils.performance.runPerformanceTest(
          app, 
          mockOpenAI, 
          { requestCount: 10, delayBetweenRequests: 100 }
        );
        
        expect(performanceResult.results).toHaveLength(10);
        expect(performanceResult.averageResponseTime).toBeLessThan(1000);
        expect(performanceResult.memoryUsage.delta).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
        expect(testAssertions.assertMemoryUsage(performanceResult.memoryUsage.delta)).toBe(true);
      });
    });

    describe('Edge Cases', () => {
      it('should handle extremely long messages', async () => {
        const longMessage = testFactories.createLongMessage(5000);
        const result = await apiTestUtils.testChatEndpoint.success(
          app, 
          mockOpenAI,
          { message: longMessage }
        );
        
        expect(result.response.status).toBe(200);
        expect(result.isValid).toBe(true);
      });

      it('should handle rapid successive requests', async () => {
        const promises = Array.from({ length: 5 }, (_, index) => 
          apiTestUtils.testChatEndpoint.success(app, mockOpenAI, { 
            message: `Rapid test ${index + 1}` 
          })
        );
        
        const results = await Promise.all(promises);
        
        expect(results.every(r => r.response.status === 200)).toBe(true);
        expect(results.every(r => r.isValid)).toBe(true);
      });

      it('should handle malformed JSON gracefully', async () => {
        const response = await apiTestUtils.createApiRequest(app, '/api/chat', 'POST')
          .send('invalid json')
          .expect(500);
        
        expect(response.body).toHaveProperty('error');
      });
    });
  });

  describe('Request Validation', () => {
    it('should validate chat request structure', () => {
      const validRequest = testFactories.createChatMessage();
      const validation = apiTestUtils.validation.validateChatRequest(validRequest);
      
      expect(validation.hasMessage).toBe(true);
      expect(validation.messageLength).toBeGreaterThan(0);
      expect(validation.hasValidStructure).toBe(true);
    });

    it('should identify invalid chat requests', () => {
      const invalidRequest = testFactories.createInvalidRequestBody('empty');
      const validation = apiTestUtils.validation.validateChatRequest(invalidRequest);
      
      expect(validation.hasMessage).toBe(false);
      expect(validation.hasValidStructure).toBe(false);
    });
  });

  describe('Response Validation', () => {
    it('should validate response timestamps', () => {
      const validTimestamp = new Date().toISOString();
      const invalidTimestamp = 'invalid-timestamp';
      
      expect(apiTestUtils.validateResponse.timestamp(validTimestamp)).toBe(true);
      expect(apiTestUtils.validateResponse.timestamp(invalidTimestamp)).toBe(false);
    });

    it('should validate response structures', async () => {
      const result = await apiTestUtils.testChatEndpoint.success(app, mockOpenAI);
      
      expect(apiTestUtils.validateResponse.chat(result.response)).toBe(true);
      expect(testUtils.expectValidResponseStructure(
        result.response.body, 
        ['response', 'timestamp']
      )).toBe(true);
    });
  });
}); 