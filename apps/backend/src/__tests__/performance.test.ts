import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Express } from 'express';
import { testFactories } from './utils/testFactories';
import { apiTestUtils, testAssertions, PerformanceTestConfig } from './utils/apiTestUtils';
import { TEST_CONFIG } from './setup';

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

describe('Performance Tests', () => {
  beforeEach(async () => {
    // Reset mocks and setup
    apiTestUtils.mockManagement.resetAllMocks(mockOpenAI);
    apiTestUtils.mockManagement.setupDefaultMocks(mockOpenAI);
    
    // Set environment variables for testing
    process.env.OPENAI_API_KEY = TEST_CONFIG.API_KEY;
    
    // Dynamically import the app to ensure mocks are applied
    const appModule = await import('../index');
    app = appModule.default || appModule;
  });

  describe('Response Time Performance', () => {
    it('should respond to health checks within 50ms', async () => {
      const performanceResult = await apiTestUtils.performance.measureResponseTime(
        () => apiTestUtils.testHealthEndpoint(app)
      );
      
      expect(performanceResult.responseTimeMs).toBeLessThan(50);
      expect(testAssertions.assertResponseTime(performanceResult.responseTimeMs, 50)).toBe(true);
    });

    it('should handle chat requests within 1000ms', async () => {
      const performanceResult = await apiTestUtils.performance.measureResponseTime(
        () => apiTestUtils.testChatEndpoint.success(app, mockOpenAI)
      );
      
      expect(performanceResult.responseTimeMs).toBeLessThan(1000);
      expect(testAssertions.assertResponseTime(performanceResult.responseTimeMs, 1000)).toBe(true);
    });

    it('should maintain consistent response times under load', async () => {
      const testConfig: PerformanceTestConfig = {
        requestCount: 20,
        delayBetweenRequests: 50,
      };

      const performanceResult = await apiTestUtils.performance.runPerformanceTest(
        app, 
        mockOpenAI, 
        testConfig
      );

      expect(performanceResult.results).toHaveLength(20);
      expect(performanceResult.averageResponseTime).toBeLessThan(1000);
      expect(performanceResult.maxResponseTime).toBeLessThan(2000);
      
      // Response time variance should be reasonable
      const responseTimeVariance = performanceResult.maxResponseTime - performanceResult.minResponseTime;
      expect(responseTimeVariance).toBeLessThan(1000);
    });
  });

  describe('Concurrency Performance', () => {
    it('should handle 10 concurrent requests efficiently', async () => {
      const result = await apiTestUtils.testConcurrentRequests(app, mockOpenAI, 10);
      
      expect(result.allSuccessful).toBe(true);
      expect(result.responses).toHaveLength(10);
      expect(result.averageResponseTime).toBeLessThan(1500);
      expect(result.responseTime).toBeLessThan(3000); // Total time for all 10 requests
    });

    it('should handle 50 concurrent requests without errors', async () => {
      const result = await apiTestUtils.testConcurrentRequests(app, mockOpenAI, 50);
      
      expect(result.allSuccessful).toBe(true);
      expect(result.responses).toHaveLength(50);
      expect(result.responseTime).toBeLessThan(10000); // Total time for all 50 requests
    });

    it('should handle mixed endpoint concurrent requests', async () => {
      const promises = [
        // Health check requests
        ...Array.from({ length: 5 }, () => apiTestUtils.testHealthEndpoint(app)),
        // Chat requests
        ...Array.from({ length: 5 }, () => apiTestUtils.testChatEndpoint.success(app, mockOpenAI)),
      ];
      
      const startTime = Date.now();
      const results = await Promise.all(promises);
      const endTime = Date.now();
      
      expect(results).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(5000);
      
      // Verify all requests succeeded
      const healthResults = results.slice(0, 5);
      const chatResults = results.slice(5);
      
      expect(healthResults.every(r => r.isValid)).toBe(true);
      expect(chatResults.every(r => r.isValid)).toBe(true);
    });
  });

  describe('Memory Usage Performance', () => {
    it('should not leak memory during sustained load', async () => {
      const testConfig: PerformanceTestConfig = {
        requestCount: 100,
        delayBetweenRequests: 10,
      };

      const performanceResult = await apiTestUtils.performance.runPerformanceTest(
        app, 
        mockOpenAI, 
        testConfig
      );

      // Memory usage should not increase significantly
      expect(performanceResult.memoryUsage.delta).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
      expect(testAssertions.assertMemoryUsage(performanceResult.memoryUsage.delta, 100 * 1024 * 1024)).toBe(true);
    });

    it('should handle memory efficiently with large payloads', async () => {
      const initialMemory = apiTestUtils.performance.measureMemoryUsage();
      
      // Test with large messages
      const largeMessage = testFactories.createLongMessage(10000);
      const requests = Array.from({ length: 10 }, () => 
        apiTestUtils.testChatEndpoint.success(app, mockOpenAI, { message: largeMessage })
      );
      
      await Promise.all(requests);
      
      const finalMemory = apiTestUtils.performance.measureMemoryUsage();
      const memoryDelta = finalMemory.heapUsed - initialMemory.heapUsed;
      
      expect(memoryDelta).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
    });
  });

  describe('Throughput Performance', () => {
    it('should maintain high throughput for health checks', async () => {
      const requestCount = 100;
      const startTime = Date.now();
      
      const promises = Array.from({ length: requestCount }, () => 
        apiTestUtils.testHealthEndpoint(app)
      );
      
      const results = await Promise.all(promises);
      const endTime = Date.now();
      
      const totalTime = endTime - startTime;
      const throughput = requestCount / (totalTime / 1000); // requests per second
      
      expect(results.every(r => r.isValid)).toBe(true);
      expect(throughput).toBeGreaterThan(100); // At least 100 requests per second
    });

    it('should maintain reasonable throughput for chat requests', async () => {
      const requestCount = 20;
      const startTime = Date.now();
      
      const promises = Array.from({ length: requestCount }, (_, index) => 
        apiTestUtils.testChatEndpoint.success(app, mockOpenAI, { 
          message: `Throughput test ${index + 1}` 
        })
      );
      
      const results = await Promise.all(promises);
      const endTime = Date.now();
      
      const totalTime = endTime - startTime;
      const throughput = requestCount / (totalTime / 1000); // requests per second
      
      expect(results.every(r => r.isValid)).toBe(true);
      expect(throughput).toBeGreaterThan(10); // At least 10 requests per second
    });
  });

  describe('Stress Testing', () => {
    it('should handle rapid successive requests without degradation', async () => {
      const batches = 5;
      const requestsPerBatch = 10;
      const results = [];
      
      for (let batch = 0; batch < batches; batch++) {
        const batchPromises = Array.from({ length: requestsPerBatch }, (_, index) => 
          apiTestUtils.performance.measureResponseTime(
            () => apiTestUtils.testChatEndpoint.success(app, mockOpenAI, { 
              message: `Batch ${batch + 1}, Request ${index + 1}` 
            })
          )
        );
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      expect(results).toHaveLength(batches * requestsPerBatch);
      
      // Check that response times don't degrade significantly over time
      const firstBatchAvg = results.slice(0, requestsPerBatch)
        .reduce((sum, r) => sum + r.responseTimeMs, 0) / requestsPerBatch;
      const lastBatchAvg = results.slice(-requestsPerBatch)
        .reduce((sum, r) => sum + r.responseTimeMs, 0) / requestsPerBatch;
      
      // Last batch should not be more than 3x slower than first batch (more forgiving)
      expect(lastBatchAvg).toBeLessThan(firstBatchAvg * 3);
    });

    it('should recover gracefully from error conditions', async () => {
      // First, cause some errors
      const errorRequests = Array.from({ length: 5 }, () => 
        apiTestUtils.testChatEndpoint.missingMessage(app)
      );
      
      await Promise.all(errorRequests);
      
      // Then test normal operation
      const normalRequests = Array.from({ length: 5 }, () => 
        apiTestUtils.testChatEndpoint.success(app, mockOpenAI)
      );
      
      const results = await Promise.all(normalRequests);
      
      expect(results.every(r => r.isValid)).toBe(true);
      expect(results.every(r => r.response.status === 200)).toBe(true);
    });
  });

  describe('Resource Utilization', () => {
    it('should not exceed memory thresholds during peak load', async () => {
      const initialMemory = apiTestUtils.performance.measureMemoryUsage();
      
      // Generate peak load (reduced for faster testing)
      const peakLoadConfig: PerformanceTestConfig = {
        requestCount: 10,
        delayBetweenRequests: 100,
      };
      
      const performanceResult = await apiTestUtils.performance.runPerformanceTest(
        app, 
        mockOpenAI, 
        peakLoadConfig
      );
      
      const finalMemory = apiTestUtils.performance.measureMemoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      expect(memoryIncrease).toBeLessThan(200 * 1024 * 1024); // Less than 200MB increase
      expect(performanceResult.results.every(r => r.result.status === 200)).toBe(true);
    }, 20000); // 20 second timeout

    it('should maintain consistent performance across different message sizes', async () => {
      const messageSizes = [100, 500, 1000, 2000, 5000];
      const results = [];
      
      for (const size of messageSizes) {
        const performanceResult = await apiTestUtils.performance.measureResponseTime(
          () => apiTestUtils.testChatEndpoint.success(app, mockOpenAI, { 
            message: testFactories.createLongMessage(size) 
          })
        );
        
        results.push({
          size,
          responseTime: performanceResult.responseTimeMs,
          success: performanceResult.result.isValid,
        });
      }
      
      expect(results.every(r => r.success)).toBe(true);
      
      // Response time should not increase dramatically with message size
      const smallMessageTime = results[0].responseTime;
      const largeMessageTime = results[results.length - 1].responseTime;
      
      expect(largeMessageTime).toBeLessThan(smallMessageTime * 3);
    });
  });
}); 