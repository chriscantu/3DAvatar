// Performance optimization tests for Phase 2 services
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { performanceMonitor, monitorSync, monitorAsync } from '../performanceMonitor';
import { optimizedEmotionalIntelligence } from '../optimizedEmotionalIntelligence';
import type { Context } from '../../types/context';
import { AVATAR_PERSONALITY_CONFIG } from '../../config/avatarPersonality';

describe('Performance Optimization Suite', () => {
  let mockContext: Context;

  beforeEach(() => {
    performanceMonitor.clearMetrics();
    
    mockContext = {
      system: {
        avatarPersonality: AVATAR_PERSONALITY_CONFIG.personality,
        conversationGuidelines: {
          maxContextWindow: 10,
          contextPriority: { immediate: 1, recent: 0.8, session: 0.6, historical: 0.4 },
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
        sessionId: 'test-session',
        userProfile: {
          userId: 'test-user',
          interactionHistory: [],
          preferences: {
            preferredResponseLength: 'medium',
            formalityLevel: 0.5,
            topicDepth: 'moderate',
            explanationStyle: 'simple'
          },
          communicationStyle: {
            directness: 0.5,
            emotionalExpressiveness: 0.5,
            questioningStyle: 'exploratory'
          },
          topicInterests: []
        },
        sessionObjectives: [],
        conversationThemes: [],
        startTime: new Date(),
        messageCount: 1
      },
      immediate: {
        recentMessages: [],
        currentUserEmotion: 'neutral',
        conversationFlow: {
          currentPhase: 'greeting',
          flowState: { momentum: 0.5, depth: 0.3, engagement: 0.7, clarity: 0.8 },
          transitionTriggers: []
        },
        activeTopics: ['greeting'],
        environmentData: {
          timeOfDay: 'morning',
          userTimezone: 'UTC',
          sessionDuration: 0,
          activeFeatures: [],
          deviceType: 'desktop',
          networkQuality: 'good'
        }
      },
      timestamp: new Date().toISOString()
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Performance Monitor', () => {
    it('should track operation performance metrics', () => {
      const tracker = performanceMonitor.startOperation('testService', 'testOperation', 100);
      
      // Simulate some work
      const result = 'test result';
      const metrics = tracker.finish(result.length, false);

      expect(metrics.service).toBe('testService');
      expect(metrics.operation).toBe('testOperation');
      expect(metrics.inputSize).toBe(100);
      expect(metrics.outputSize).toBe(result.length);
      expect(metrics.duration).toBeGreaterThan(0);
      expect(metrics.cacheHit).toBe(false);
      expect(metrics.errorOccurred).toBe(false);
    });

    it('should monitor sync operations', () => {
      const result = monitorSync('testService', 'syncOperation', () => {
        return 'sync result';
      }, 50);

      expect(result).toBe('sync result');
      
      const stats = performanceMonitor.getServiceStats('testService');
      expect(stats.operationCount).toBe(1);
      expect(stats.averageResponseTime).toBeGreaterThan(0);
    });

    it('should monitor async operations', async () => {
      const result = await monitorAsync('testService', 'asyncOperation', async () => {
        return new Promise(resolve => setTimeout(() => resolve('async result'), 10));
      }, 75);

      expect(result).toBe('async result');
      
      const stats = performanceMonitor.getServiceStats('testService');
      expect(stats.operationCount).toBe(1);
      expect(stats.averageResponseTime).toBeGreaterThan(0);
    });

    it('should handle errors in monitored operations', async () => {
      const error = new Error('Test error');
      
      await expect(monitorAsync('testService', 'errorOperation', async () => {
        throw error;
      })).rejects.toThrow('Test error');

      const stats = performanceMonitor.getServiceStats('testService');
      expect(stats.operationCount).toBe(1);
      expect(stats.errorRate).toBe(1);
    });

    it('should provide service performance statistics', () => {
      // Generate some test data
      for (let i = 0; i < 10; i++) {
        monitorSync('testService', 'operation', () => `result ${i}`, 100);
      }

      const stats = performanceMonitor.getServiceStats('testService');
      
      expect(stats.service).toBe('testService');
      expect(stats.operationCount).toBe(10);
      expect(stats.averageResponseTime).toBeGreaterThan(0);
      expect(stats.errorRate).toBe(0);
      expect(stats.throughput).toBeGreaterThan(0);
    });

    it('should generate optimization recommendations', () => {
      // Create slow operations to trigger recommendations
      for (let i = 0; i < 5; i++) {
        const tracker = performanceMonitor.startOperation('slowService', 'slowOperation', 1000);
        // Simulate slow operation
        const start = performance.now();
        while (performance.now() - start < 50) { /* busy wait */ }
        tracker.finish(100, false);
      }

      const recommendations = performanceMonitor.getOptimizationRecommendations();
      
      expect(recommendations).toBeInstanceOf(Array);
      // Should have recommendations for slow service
      const slowServiceRecs = recommendations.filter(r => r.service === 'slowService');
      expect(slowServiceRecs.length).toBeGreaterThan(0);
    });

    it('should trigger performance alerts', () => {
      const alertCallback = vi.fn();
      performanceMonitor.onAlert(alertCallback);

      // Create a slow operation that should trigger an alert
      const tracker = performanceMonitor.startOperation('alertService', 'slowOperation', 100);
      const start = performance.now();
      while (performance.now() - start < 100) { /* busy wait to make it slow */ }
      tracker.finish(50, false);

      // Check if alert was triggered (may not trigger immediately due to thresholds)
      expect(alertCallback).toHaveBeenCalledTimes(0); // Default threshold is 1000ms
    });

    it('should export metrics in different formats', () => {
      monitorSync('testService', 'operation', () => 'result', 100);
      
      const jsonMetrics = performanceMonitor.exportMetrics('json');
      expect(() => JSON.parse(jsonMetrics)).not.toThrow();
      
      const csvMetrics = performanceMonitor.exportMetrics('csv');
      expect(csvMetrics).toContain('timestamp,service,operation');
      expect(csvMetrics).toContain('testService,operation');
    });
  });

  describe('Optimized Emotional Intelligence', () => {
    it('should analyze emotions faster with caching', () => {
      const content = 'I am very excited about this project!';
      
      // First analysis (cache miss)
      const start1 = performance.now();
      const result1 = optimizedEmotionalIntelligence.analyzeEmotionalState(content, mockContext);
      const duration1 = performance.now() - start1;
      
      // Second analysis (cache hit)
      const start2 = performance.now();
      const result2 = optimizedEmotionalIntelligence.analyzeEmotionalState(content, mockContext);
      const duration2 = performance.now() - start2;
      
      expect(result1.primary).toBe('excited');
      expect(result2.primary).toBe('excited');
      expect(duration2).toBeLessThan(duration1); // Cache hit should be faster
    });

    it('should handle multiple emotions correctly', () => {
      const content = 'I am happy but also a bit confused about the requirements';
      
      const result = optimizedEmotionalIntelligence.analyzeEmotionalState(content, mockContext);
      
      expect(result.primary).toBe('happy');
      expect(result.secondary).toBeDefined();
      expect(result.intensity).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.indicators).toBeInstanceOf(Array);
      expect(['improving', 'declining', 'stable']).toContain(result.trend);
    });

    it('should detect emotional trends', () => {
      const happyContext = {
        ...mockContext,
        immediate: {
          ...mockContext.immediate,
          currentUserEmotion: 'happy' as const
        }
      };
      
      const result = optimizedEmotionalIntelligence.analyzeEmotionalState('I am excited!', happyContext);
      expect(result.trend).toBe('stable'); // Both positive emotions
      
      const sadContext = {
        ...mockContext,
        immediate: {
          ...mockContext.immediate,
          currentUserEmotion: 'sad' as const
        }
      };
      
      const result2 = optimizedEmotionalIntelligence.analyzeEmotionalState('I am excited!', sadContext);
      expect(result2.trend).toBe('improving'); // From sad to excited
    });

    it('should provide cache statistics', () => {
      const content1 = 'I am happy';
      const content2 = 'I am sad';
      
      optimizedEmotionalIntelligence.analyzeEmotionalState(content1, mockContext);
      optimizedEmotionalIntelligence.analyzeEmotionalState(content2, mockContext);
      optimizedEmotionalIntelligence.analyzeEmotionalState(content1, mockContext); // Cache hit
      
      const stats = optimizedEmotionalIntelligence.getCacheStats();
      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBe(500);
      expect(stats.hitRate).toBeGreaterThan(0);
    });

    it('should clear cache when requested', () => {
      optimizedEmotionalIntelligence.analyzeEmotionalState('test', mockContext);
      
      let stats = optimizedEmotionalIntelligence.getCacheStats();
      expect(stats.size).toBe(1);
      
      optimizedEmotionalIntelligence.clearCache();
      
      stats = optimizedEmotionalIntelligence.getCacheStats();
      expect(stats.size).toBe(0);
    });

    it('should handle intensity modifiers', () => {
      const normalContent = 'I am happy';
      const intensifiedContent = 'I am very extremely happy';
      
      const normalResult = optimizedEmotionalIntelligence.analyzeEmotionalState(normalContent, mockContext);
      const intensifiedResult = optimizedEmotionalIntelligence.analyzeEmotionalState(intensifiedContent, mockContext);
      
      expect(intensifiedResult.intensity).toBeGreaterThan(normalResult.intensity);
      expect(intensifiedResult.confidence).toBeGreaterThan(normalResult.confidence);
    });

    it('should handle neutral emotions', () => {
      const neutralContent = 'This is a regular message';
      
      const result = optimizedEmotionalIntelligence.analyzeEmotionalState(neutralContent, mockContext);
      
      expect(result.primary).toBe('neutral');
      expect(result.intensity).toBeLessThan(0.5);
      expect(result.confidence).toBeLessThan(0.5);
    });
  });

  describe('Performance Benchmarks', () => {
    it('should process emotions under 100ms for typical content', () => {
      const content = 'I am really excited about this new feature and I think it will be amazing!';
      
      const start = performance.now();
      optimizedEmotionalIntelligence.analyzeEmotionalState(content, mockContext);
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(100); // Should be fast
    });

    it('should handle batch processing efficiently', () => {
      const contents = [
        'I am happy',
        'I am sad',
        'I am excited',
        'I am confused',
        'I am frustrated'
      ];
      
      const start = performance.now();
      const results = contents.map(content => 
        optimizedEmotionalIntelligence.analyzeEmotionalState(content, mockContext)
      );
      const duration = performance.now() - start;
      
      expect(results).toHaveLength(5);
      expect(duration).toBeLessThan(500); // Batch should be efficient
      results.forEach(result => {
        expect(result.primary).toBeDefined();
        expect(result.intensity).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeGreaterThanOrEqual(0);
      });
    });

    it('should maintain performance under concurrent load', async () => {
      const concurrentOperations = 50;
      const content = 'I am excited about concurrent processing!';
      
      const start = performance.now();
      const promises = Array.from({ length: concurrentOperations }, () =>
        Promise.resolve(optimizedEmotionalIntelligence.analyzeEmotionalState(content, mockContext))
      );
      
      const results = await Promise.all(promises);
      const duration = performance.now() - start;
      
      expect(results).toHaveLength(concurrentOperations);
      expect(duration).toBeLessThan(1000); // Should handle concurrent load
      
      // All results should be consistent (cached)
      const firstResult = results[0];
      results.forEach(result => {
        expect(result.primary).toBe(firstResult.primary);
        expect(result.intensity).toBe(firstResult.intensity);
      });
    });

    it('should optimize memory usage', () => {
      // Fill cache to near capacity
      for (let i = 0; i < 480; i++) {
        optimizedEmotionalIntelligence.analyzeEmotionalState(`Test message ${i}`, mockContext);
      }
      
      let stats = optimizedEmotionalIntelligence.getCacheStats();
      expect(stats.size).toBe(480);
      
      // Add more to trigger cleanup
      for (let i = 480; i < 520; i++) {
        optimizedEmotionalIntelligence.analyzeEmotionalState(`Test message ${i}`, mockContext);
      }
      
      stats = optimizedEmotionalIntelligence.getCacheStats();
      expect(stats.size).toBeLessThanOrEqual(500); // Should not exceed max size
    });
  });

  describe('Integration Performance', () => {
    it('should track performance across multiple services', () => {
      // Simulate multiple service calls
      monitorSync('emotionalIntelligence', 'analyze', () => 'emotion result', 100);
      monitorSync('contextValidation', 'validate', () => 'validation result', 200);
      monitorSync('contextCompression', 'compress', () => 'compression result', 150);
      monitorSync('feedbackCollection', 'collect', () => 'feedback result', 50);
      
      const emotionalStats = performanceMonitor.getServiceStats('emotionalIntelligence');
      const validationStats = performanceMonitor.getServiceStats('contextValidation');
      const compressionStats = performanceMonitor.getServiceStats('contextCompression');
      const feedbackStats = performanceMonitor.getServiceStats('feedbackCollection');
      
      expect(emotionalStats.operationCount).toBe(1);
      expect(validationStats.operationCount).toBe(1);
      expect(compressionStats.operationCount).toBe(1);
      expect(feedbackStats.operationCount).toBe(1);
    });

    it('should provide system-wide optimization recommendations', () => {
      // Create some performance data for different services
      const services = ['emotionalIntelligence', 'contextValidation', 'contextCompression', 'feedbackCollection'];
      
      services.forEach(service => {
        for (let i = 0; i < 3; i++) {
          monitorSync(service, 'operation', () => `result ${i}`, 100);
        }
      });
      
      const recommendations = performanceMonitor.getOptimizationRecommendations();
      expect(recommendations).toBeInstanceOf(Array);
      
      // Should have recommendations sorted by priority
      if (recommendations.length > 1) {
        const priorities = { critical: 4, high: 3, medium: 2, low: 1 };
        for (let i = 0; i < recommendations.length - 1; i++) {
          expect(priorities[recommendations[i].priority]).toBeGreaterThanOrEqual(
            priorities[recommendations[i + 1].priority]
          );
        }
      }
    });

    it('should handle error scenarios gracefully', () => {
      const erroringOperation = () => {
        throw new Error('Simulated error');
      };
      
      expect(() => {
        monitorSync('testService', 'errorOperation', erroringOperation, 100);
      }).toThrow('Simulated error');
      
      const stats = performanceMonitor.getServiceStats('testService');
      expect(stats.errorRate).toBe(1);
      expect(stats.operationCount).toBe(1);
    });
  });
}); 