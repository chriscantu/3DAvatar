import request from 'supertest';
import { Express } from 'express';
import { testFactories } from './testFactories';
import { vi } from 'vitest';

// API testing utilities for consistent HTTP testing
export const apiTestUtils = {
  // Create a standardized API test request
  createApiRequest: (app: Express, endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET') => {
    const req = request(app);
    switch (method) {
      case 'GET':
        return req.get(endpoint);
      case 'POST':
        return req.post(endpoint);
      case 'PUT':
        return req.put(endpoint);
      case 'DELETE':
        return req.delete(endpoint);
      default:
        return req.get(endpoint);
    }
  },

  // Test health endpoint
  testHealthEndpoint: async (app: Express) => {
    const response = await apiTestUtils.createApiRequest(app, '/health', 'GET')
      .expect(200);
    
    return {
      response,
      isValid: response.body.status === 'OK' && response.body.message === '3DAvatar Backend is running',
    };
  },

  // Test chat endpoint with various scenarios
  testChatEndpoint: {
    // Success scenario
    success: async (app: Express, mockOpenAI: any, messageOverrides: any = {}) => {
      const testMessage = testFactories.createChatMessage(messageOverrides);
      const mockResponse = testFactories.createOpenAIResponse();
      
      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);
      
      const response = await apiTestUtils.createApiRequest(app, '/api/chat', 'POST')
        .send(testMessage)
        .expect(200);
      
      return {
        response,
        testMessage,
        mockResponse,
        isValid: Boolean(response.body.response && response.body.timestamp),
      };
    },

    // Error scenarios
    missingMessage: async (app: Express) => {
      const response = await apiTestUtils.createApiRequest(app, '/api/chat', 'POST')
        .send({})
        .expect(400);
      
      return {
        response,
        isValid: response.body.error === 'Message is required',
      };
    },

    missingApiKey: async (app: Express) => {
      // Temporarily remove API key
      const originalApiKey = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;
      
      const response = await apiTestUtils.createApiRequest(app, '/api/chat', 'POST')
        .send(testFactories.createChatMessage())
        .expect(500);
      
      // Restore API key
      process.env.OPENAI_API_KEY = originalApiKey;
      
      return {
        response,
        isValid: response.body.error === 'OpenAI API key not configured',
      };
    },

    openaiError: async (app: Express, mockOpenAI: any) => {
      const testMessage = testFactories.createChatMessage();
      const errorMessage = 'OpenAI API error';
      
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error(errorMessage));
      
      const response = await apiTestUtils.createApiRequest(app, '/api/chat', 'POST')
        .send(testMessage)
        .expect(500);
      
      return {
        response,
        isValid: response.body.error === 'Failed to process chat request' && 
                response.body.details === errorMessage,
      };
    },

    emptyResponse: async (app: Express, mockOpenAI: any) => {
      const testMessage = testFactories.createChatMessage();
      const mockResponse = testFactories.createEmptyOpenAIResponse();
      
      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);
      
      const response = await apiTestUtils.createApiRequest(app, '/api/chat', 'POST')
        .send(testMessage)
        .expect(200);
      
      return {
        response,
        isValid: Boolean(response.body.response === 'Sorry, I could not generate a response.'),
      };
    },

    specialCharacters: async (app: Express, mockOpenAI: any) => {
      const testMessage = testFactories.createSpecialCharacterMessage();
      const mockResponse = testFactories.createOpenAIResponse();
      
      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);
      
      const response = await apiTestUtils.createApiRequest(app, '/api/chat', 'POST')
        .send(testMessage)
        .expect(200);
      
      return {
        response,
        isValid: Boolean(response.body.response && response.body.timestamp),
      };
    },

    longMessage: async (app: Express, mockOpenAI: any) => {
      const testMessage = testFactories.createChatMessage({ 
        message: testFactories.createLongMessage(1000) 
      });
      const mockResponse = testFactories.createOpenAIResponse();
      
      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);
      
      const response = await apiTestUtils.createApiRequest(app, '/api/chat', 'POST')
        .send(testMessage)
        .expect(200);
      
      return {
        response,
        isValid: Boolean(response.body.response && response.body.timestamp),
      };
    },
  },

  // Test multiple concurrent requests
  testConcurrentRequests: async (app: Express, mockOpenAI: any, requestCount: number = 5) => {
    const mockResponse = testFactories.createOpenAIResponse();
    mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);
    
    const requests = Array.from({ length: requestCount }, (_, index) => 
      apiTestUtils.createApiRequest(app, '/api/chat', 'POST')
        .send(testFactories.createChatMessage({ message: `Test message ${index + 1}` }))
        .expect(200)
    );
    
    const startTime = Date.now();
    const responses = await Promise.all(requests);
    const endTime = Date.now();
    
    return {
      responses,
      responseTime: endTime - startTime,
      averageResponseTime: (endTime - startTime) / requestCount,
      allSuccessful: responses.every(r => r.status === 200),
    };
  },

  // Test request timeout
  testRequestTimeout: async (app: Express, mockOpenAI: any, timeoutMs: number = 5000) => {
    const testMessage = testFactories.createChatMessage();
    
    // Mock a slow response
    mockOpenAI.chat.completions.create.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, timeoutMs + 1000))
    );
    
    const startTime = Date.now();
    
    try {
      await apiTestUtils.createApiRequest(app, '/api/chat', 'POST')
        .send(testMessage)
        .timeout(timeoutMs);
      
      return { timedOut: false, responseTime: Date.now() - startTime };
    } catch (error) {
      return { timedOut: true, responseTime: Date.now() - startTime, error };
    }
  },

  // Validate response structure
  validateResponse: {
    health: (response: any) => {
      const requiredFields = ['status', 'message'];
      return requiredFields.every(field => response.body.hasOwnProperty(field));
    },

    chat: (response: any) => {
      const requiredFields = ['response', 'timestamp'];
      return requiredFields.every(field => response.body.hasOwnProperty(field));
    },

    error: (response: any) => {
      const requiredFields = ['error'];
      return requiredFields.every(field => response.body.hasOwnProperty(field));
    },

    timestamp: (timestamp: string) => {
      const date = new Date(timestamp);
      return !isNaN(date.getTime()) && date.getTime() > 0;
    },
  },

  // Performance testing utilities
  performance: {
    measureResponseTime: async (testFunction: () => Promise<any>) => {
      const startTime = process.hrtime.bigint();
      const result = await testFunction();
      const endTime = process.hrtime.bigint();
      
      return {
        result,
        responseTimeNs: endTime - startTime,
        responseTimeMs: Number(endTime - startTime) / 1000000,
      };
    },

    measureMemoryUsage: () => {
      const usage = process.memoryUsage();
      return {
        heapUsed: usage.heapUsed,
        heapTotal: usage.heapTotal,
        external: usage.external,
        rss: usage.rss,
      };
    },

    runPerformanceTest: async (app: Express, mockOpenAI: any, testConfig: PerformanceTestConfig) => {
      const mockResponse = testFactories.createOpenAIResponse();
      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);
      
      const results = [];
      const startMemory = apiTestUtils.performance.measureMemoryUsage();
      
      for (let i = 0; i < testConfig.requestCount; i++) {
        const testResult = await apiTestUtils.performance.measureResponseTime(async () => {
          return apiTestUtils.createApiRequest(app, '/api/chat', 'POST')
            .send(testFactories.createChatMessage({ message: `Performance test ${i + 1}` }))
            .expect(200);
        });
        
        results.push(testResult);
        
        if (testConfig.delayBetweenRequests) {
          await new Promise(resolve => setTimeout(resolve, testConfig.delayBetweenRequests));
        }
      }
      
      const endMemory = apiTestUtils.performance.measureMemoryUsage();
      
      return {
        results,
        averageResponseTime: results.reduce((sum, r) => sum + r.responseTimeMs, 0) / results.length,
        minResponseTime: Math.min(...results.map(r => r.responseTimeMs)),
        maxResponseTime: Math.max(...results.map(r => r.responseTimeMs)),
        memoryUsage: {
          start: startMemory,
          end: endMemory,
          delta: endMemory.heapUsed - startMemory.heapUsed,
        },
      };
    },
  },

  // Mock management utilities
  mockManagement: {
    setupOpenAIMocks: () => {
      const mockOpenAI = {
        chat: {
          completions: {
            create: vi.fn(),
          },
        },
      };
      
      return mockOpenAI;
    },

    resetAllMocks: (mockOpenAI: any) => {
      vi.clearAllMocks();
      mockOpenAI.chat.completions.create.mockClear();
    },

    setupDefaultMocks: (mockOpenAI: any) => {
      mockOpenAI.chat.completions.create.mockResolvedValue(
        testFactories.createOpenAIResponse()
      );
    },
  },

  // Test data validation utilities
  validation: {
    validateChatRequest: (request: any) => {
      return {
        hasMessage: typeof request.message === 'string' && request.message.trim().length > 0,
        messageLength: request.message ? request.message.length : 0,
        hasValidStructure: request.hasOwnProperty('message'),
      };
    },

    validateOpenAICall: (mockOpenAI: any, expectedMessage: string) => {
      const calls = mockOpenAI.chat.completions.create.mock.calls;
      if (calls.length === 0) return { called: false };
      
      const lastCall = calls[calls.length - 1][0];
      return {
        called: true,
        correctModel: lastCall.model === 'gpt-3.5-turbo',
        correctMessage: lastCall.messages[1].content === expectedMessage,
        correctSystemPrompt: lastCall.messages[0].role === 'system',
        correctParameters: lastCall.max_tokens === 150 && lastCall.temperature === 0.7,
      };
    },
  },
};

// Type definitions for performance testing
export interface PerformanceTestConfig {
  requestCount: number;
  delayBetweenRequests?: number;
  timeoutMs?: number;
}

// Test assertion utilities
export const testAssertions = {
  assertValidResponse: (response: any, expectedStatus: number = 200) => {
    return response.status === expectedStatus;
  },

  assertValidTimestamp: (timestamp: string) => {
    const date = new Date(timestamp);
    return !isNaN(date.getTime()) && date.getTime() > 0;
  },

  assertResponseTime: (responseTime: number, maxTime: number = 5000) => {
    return responseTime <= maxTime;
  },

  assertMemoryUsage: (memoryDelta: number, maxIncrease: number = 50 * 1024 * 1024) => {
    return memoryDelta <= maxIncrease;
  },
}; 