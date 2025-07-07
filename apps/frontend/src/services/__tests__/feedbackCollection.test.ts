import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FeedbackCollector, createFeedbackCollector } from '../feedbackCollection';
import type { FeedbackContext, FeedbackCategory, BehavioralMetrics } from '../feedbackCollection';

// Mock feedback context for testing
const createMockFeedbackContext = (overrides: Partial<FeedbackContext> = {}): FeedbackContext => ({
  messageId: 'test-message-123',
  conversationPhase: 'deep_discussion',
  userEmotion: 'neutral',
  responseTime: 1500,
  contextSize: 2048,
  activeFeatures: ['text', 'emotion_detection'],
  userIntent: 'learning',
  ...overrides
});

const createMockBehavioralMetrics = (overrides: Partial<BehavioralMetrics> = {}): BehavioralMetrics => ({
  responseTime: 1200,
  messageLength: 150,
  typoCount: 0,
  editCount: 1,
  pauseDuration: 500,
  clarificationRequests: 0,
  topicChanges: 1,
  emotionalExpressions: 2,
  questionCount: 1,
  followUpQuestions: 0,
  ...overrides
});

describe('FeedbackCollector Service', () => {
  let feedbackCollector: FeedbackCollector;

  beforeEach(() => {
    vi.clearAllMocks();
    feedbackCollector = createFeedbackCollector();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Explicit Feedback Collection', () => {
    it('should collect explicit feedback successfully', () => {
      const userId = 'test-user';
      const rating = 4;
      const category: FeedbackCategory = 'response_quality';
      const content = 'Great response, very helpful!';
      const context = createMockFeedbackContext();

      expect(() => {
        feedbackCollector.collectExplicitFeedback(userId, rating, category, content, context);
      }).not.toThrow();
    });

    it('should validate rating range', () => {
      const userId = 'test-user';
      const category: FeedbackCategory = 'response_quality';
      const content = 'Test feedback';
      const context = createMockFeedbackContext();

      // Valid ratings (1-5)
      expect(() => {
        feedbackCollector.collectExplicitFeedback(userId, 1, category, content, context);
      }).not.toThrow();

      expect(() => {
        feedbackCollector.collectExplicitFeedback(userId, 5, category, content, context);
      }).not.toThrow();

      // Invalid ratings should be handled gracefully
      expect(() => {
        feedbackCollector.collectExplicitFeedback(userId, 0, category, content, context);
      }).not.toThrow();

      expect(() => {
        feedbackCollector.collectExplicitFeedback(userId, 6, category, content, context);
      }).not.toThrow();
    });

    it('should handle different feedback categories', () => {
      const userId = 'test-user';
      const rating = 4;
      const content = 'Test feedback';
      const context = createMockFeedbackContext();

      const categories: FeedbackCategory[] = [
        'response_quality',
        'personality_fit',
        'helpfulness',
        'accuracy',
        'conversation_flow',
        'emotional_support'
      ];

      categories.forEach(category => {
        expect(() => {
          feedbackCollector.collectExplicitFeedback(userId, rating, category, content, context);
        }).not.toThrow();
      });
    });

    it('should handle empty content gracefully', () => {
      const userId = 'test-user';
      const rating = 3;
      const category: FeedbackCategory = 'response_quality';
      const context = createMockFeedbackContext();

      expect(() => {
        feedbackCollector.collectExplicitFeedback(userId, rating, category, '', context);
      }).not.toThrow();
    });

    it('should handle missing context gracefully', () => {
      const userId = 'test-user';
      const rating = 4;
      const category: FeedbackCategory = 'response_quality';
      const content = 'Test feedback';

      expect(() => {
        feedbackCollector.collectExplicitFeedback(userId, rating, category, content);
      }).not.toThrow();
    });
  });

  describe('Implicit Feedback Collection', () => {
    it('should collect implicit feedback from behavioral metrics', () => {
      const userId = 'test-user';
      const behavioralData = createMockBehavioralMetrics();
      const context = createMockFeedbackContext();

      expect(() => {
        feedbackCollector.collectImplicitFeedback(userId, behavioralData, context);
      }).not.toThrow();
    });

    it('should infer satisfaction from quick response times', () => {
      const userId = 'test-user';
      const quickResponseMetrics = createMockBehavioralMetrics({
        responseTime: 500, // Quick response
        messageLength: 100,
        typoCount: 0,
        editCount: 0
      });
      const context = createMockFeedbackContext();

      expect(() => {
        feedbackCollector.collectImplicitFeedback(userId, quickResponseMetrics, context);
      }).not.toThrow();
    });

    it('should infer dissatisfaction from multiple clarification requests', () => {
      const userId = 'test-user';
      const confusedMetrics = createMockBehavioralMetrics({
        clarificationRequests: 3,
        topicChanges: 2,
        pauseDuration: 2000
      });
      const context = createMockFeedbackContext();

      expect(() => {
        feedbackCollector.collectImplicitFeedback(userId, confusedMetrics, context);
      }).not.toThrow();
    });

    it('should handle positive engagement signals', () => {
      const userId = 'test-user';
      const engagedMetrics = createMockBehavioralMetrics({
        messageLength: 200,
        followUpQuestions: 2,
        emotionalExpressions: 3,
        questionCount: 2
      });
      const context = createMockFeedbackContext();

      expect(() => {
        feedbackCollector.collectImplicitFeedback(userId, engagedMetrics, context);
      }).not.toThrow();
    });

    it('should handle negative engagement signals', () => {
      const userId = 'test-user';
      const disengagedMetrics = createMockBehavioralMetrics({
        messageLength: 20,
        typoCount: 5,
        editCount: 3,
        pauseDuration: 5000,
        topicChanges: 4
      });
      const context = createMockFeedbackContext();

      expect(() => {
        feedbackCollector.collectImplicitFeedback(userId, disengagedMetrics, context);
      }).not.toThrow();
    });

    it('should handle missing behavioral data gracefully', () => {
      const userId = 'test-user';
      const incompleteMetrics = {} as BehavioralMetrics;
      const context = createMockFeedbackContext();

      expect(() => {
        feedbackCollector.collectImplicitFeedback(userId, incompleteMetrics, context);
      }).not.toThrow();
    });
  });

  describe('Interaction Metrics Tracking', () => {
    it('should track technical metrics', () => {
      const userId = 'test-user';
      const metrics = {
        responseTime: 1500,
        processingTime: 800,
        errorCount: 0,
        cacheHitRate: 0.85,
        memoryUsage: 256,
        contextSize: 2048
      };

      expect(() => {
        feedbackCollector.trackTechnicalMetrics(userId, metrics);
      }).not.toThrow();
    });

    it('should track behavioral metrics', () => {
      const userId = 'test-user';
      const metrics = createMockBehavioralMetrics();

      expect(() => {
        feedbackCollector.trackBehavioralMetrics(userId, metrics);
      }).not.toThrow();
    });

    it('should accumulate metrics over time', () => {
      const userId = 'test-user';
      const metrics1 = createMockBehavioralMetrics({ responseTime: 1000 });
      const metrics2 = createMockBehavioralMetrics({ responseTime: 1500 });
      const metrics3 = createMockBehavioralMetrics({ responseTime: 800 });

      feedbackCollector.trackBehavioralMetrics(userId, metrics1);
      feedbackCollector.trackBehavioralMetrics(userId, metrics2);
      feedbackCollector.trackBehavioralMetrics(userId, metrics3);

      const analytics = feedbackCollector.getAnalytics();
      expect(analytics.totalInteractions).toBeGreaterThan(0);
    });

    it('should handle invalid metric values gracefully', () => {
      const userId = 'test-user';
      const invalidMetrics = {
        responseTime: -100,
        processingTime: NaN,
        errorCount: Infinity,
        cacheHitRate: 2.0,
        memoryUsage: -50,
        contextSize: 0
      };

      expect(() => {
        feedbackCollector.trackTechnicalMetrics(userId, invalidMetrics);
      }).not.toThrow();
    });
  });

  describe('Analytics and Insights', () => {
    it('should generate comprehensive analytics', () => {
      // Add some test data
      const userId = 'test-user';
      feedbackCollector.collectExplicitFeedback(userId, 4, 'response_quality', 'Good response', createMockFeedbackContext());
      feedbackCollector.collectExplicitFeedback(userId, 5, 'helpfulness', 'Very helpful', createMockFeedbackContext());
      feedbackCollector.collectImplicitFeedback(userId, createMockBehavioralMetrics(), createMockFeedbackContext());

      const analytics = feedbackCollector.getAnalytics();

      expect(analytics.totalFeedback).toBeGreaterThan(0);
      expect(analytics.averageRating).toBeGreaterThan(0);
      expect(analytics.averageRating).toBeLessThanOrEqual(5);
      expect(analytics.categoryBreakdown).toBeDefined();
      expect(analytics.trends).toBeDefined();
      expect(analytics.insights).toBeInstanceOf(Array);
    });

    it('should calculate satisfaction scores', () => {
      const userId = 'test-user';
      feedbackCollector.collectExplicitFeedback(userId, 5, 'response_quality', 'Excellent', createMockFeedbackContext());
      feedbackCollector.collectExplicitFeedback(userId, 4, 'helpfulness', 'Good', createMockFeedbackContext());
      feedbackCollector.collectExplicitFeedback(userId, 3, 'accuracy', 'Okay', createMockFeedbackContext());

      const analytics = feedbackCollector.getAnalytics();

      expect(analytics.satisfactionScore).toBeGreaterThan(0);
      expect(analytics.satisfactionScore).toBeLessThanOrEqual(1);
    });

    it('should identify improvement areas', () => {
      const userId = 'test-user';
      // Add some lower ratings to trigger improvement suggestions
      feedbackCollector.collectExplicitFeedback(userId, 2, 'response_quality', 'Could be better', createMockFeedbackContext());
      feedbackCollector.collectExplicitFeedback(userId, 1, 'accuracy', 'Inaccurate', createMockFeedbackContext());

      const analytics = feedbackCollector.getAnalytics();

      expect(analytics.improvementAreas).toBeInstanceOf(Array);
      expect(analytics.improvementAreas.length).toBeGreaterThan(0);
    });

    it('should generate actionable insights', () => {
      const userId = 'test-user';
      // Add varied feedback to generate insights
      feedbackCollector.collectExplicitFeedback(userId, 5, 'emotional_support', 'Great empathy', createMockFeedbackContext());
      feedbackCollector.collectExplicitFeedback(userId, 2, 'conversation_flow', 'Confusing flow', createMockFeedbackContext());
      feedbackCollector.collectImplicitFeedback(userId, createMockBehavioralMetrics({ clarificationRequests: 3 }), createMockFeedbackContext());

      const analytics = feedbackCollector.getAnalytics();

      expect(analytics.insights).toBeInstanceOf(Array);
      analytics.insights.forEach(insight => {
        expect(insight).toHaveProperty('category');
        expect(insight).toHaveProperty('insight');
        expect(insight).toHaveProperty('confidence');
        expect(insight).toHaveProperty('actionable');
      });
    });

    it('should track trends over time', () => {
      const userId = 'test-user';
      // Simulate feedback over time
      const now = Date.now();
      
      for (let i = 0; i < 10; i++) {
        const context = createMockFeedbackContext({
          messageId: `msg-${i}`,
          responseTime: 1000 + i * 100
        });
        feedbackCollector.collectExplicitFeedback(userId, 3 + (i % 3), 'response_quality', `Feedback ${i}`, context);
      }

      const analytics = feedbackCollector.getAnalytics();

      expect(analytics.trends).toBeDefined();
      expect(analytics.trends.ratingTrend).toMatch(/improving|declining|stable/);
    });
  });

  describe('Improvement Recommendations', () => {
    it('should generate improvement recommendations', () => {
      const userId = 'test-user';
      // Add feedback that should trigger recommendations
      feedbackCollector.collectExplicitFeedback(userId, 2, 'response_quality', 'Needs improvement', createMockFeedbackContext());
      feedbackCollector.collectExplicitFeedback(userId, 1, 'accuracy', 'Often wrong', createMockFeedbackContext());

      const recommendations = feedbackCollector.getImprovementRecommendations();

      expect(recommendations).toBeInstanceOf(Array);
      expect(recommendations.length).toBeGreaterThan(0);
      
      recommendations.forEach(rec => {
        expect(rec).toHaveProperty('category');
        expect(rec).toHaveProperty('priority');
        expect(rec).toHaveProperty('recommendation');
        expect(rec).toHaveProperty('expectedImpact');
        expect(rec).toHaveProperty('effort');
        expect(rec).toHaveProperty('timeline');
      });
    });

    it('should prioritize recommendations by impact', () => {
      const userId = 'test-user';
      // Add various types of feedback
      feedbackCollector.collectExplicitFeedback(userId, 1, 'accuracy', 'Very inaccurate', createMockFeedbackContext());
      feedbackCollector.collectExplicitFeedback(userId, 2, 'helpfulness', 'Not helpful', createMockFeedbackContext());
      feedbackCollector.collectExplicitFeedback(userId, 3, 'personality_fit', 'Okay personality', createMockFeedbackContext());

      const recommendations = feedbackCollector.getImprovementRecommendations();

      if (recommendations.length > 1) {
        // Should be sorted by priority (high to low)
        for (let i = 0; i < recommendations.length - 1; i++) {
          const currentPriority = recommendations[i].priority === 'high' ? 3 : recommendations[i].priority === 'medium' ? 2 : 1;
          const nextPriority = recommendations[i + 1].priority === 'high' ? 3 : recommendations[i + 1].priority === 'medium' ? 2 : 1;
          expect(currentPriority).toBeGreaterThanOrEqual(nextPriority);
        }
      }
    });

    it('should provide specific recommendations for each category', () => {
      const userId = 'test-user';
      const categories: FeedbackCategory[] = ['response_quality', 'accuracy', 'helpfulness', 'personality_fit', 'conversation_flow', 'emotional_support'];
      
      categories.forEach(category => {
        feedbackCollector.collectExplicitFeedback(userId, 2, category, 'Needs work', createMockFeedbackContext());
      });

      const recommendations = feedbackCollector.getImprovementRecommendations();

      expect(recommendations.length).toBeGreaterThan(0);
      
      const uniqueCategories = new Set(recommendations.map(r => r.category));
      expect(uniqueCategories.size).toBeGreaterThan(0);
    });

    it('should handle no feedback gracefully', () => {
      const recommendations = feedbackCollector.getImprovementRecommendations();

      expect(recommendations).toBeInstanceOf(Array);
      expect(recommendations.length).toBe(0);
    });
  });

  describe('Performance Benchmarking', () => {
    it('should compare against benchmarks', () => {
      const userId = 'test-user';
      // Add some performance data
      feedbackCollector.trackTechnicalMetrics(userId, {
        responseTime: 1500,
        processingTime: 800,
        errorCount: 0,
        cacheHitRate: 0.85,
        memoryUsage: 256,
        contextSize: 2048
      });

      const benchmarks = feedbackCollector.getBenchmarkComparison();

      expect(benchmarks).toBeDefined();
      expect(benchmarks.responseTime).toBeDefined();
      expect(benchmarks.accuracy).toBeDefined();
      expect(benchmarks.userSatisfaction).toBeDefined();
    });

    it('should identify performance gaps', () => {
      const userId = 'test-user';
      // Add below-average performance data
      feedbackCollector.trackTechnicalMetrics(userId, {
        responseTime: 5000, // Slow response
        processingTime: 3000,
        errorCount: 5,
        cacheHitRate: 0.3,
        memoryUsage: 1024,
        contextSize: 4096
      });

      const benchmarks = feedbackCollector.getBenchmarkComparison();

      expect(benchmarks.performanceGaps).toBeInstanceOf(Array);
      expect(benchmarks.performanceGaps.length).toBeGreaterThan(0);
    });

    it('should suggest optimizations', () => {
      const userId = 'test-user';
      feedbackCollector.trackTechnicalMetrics(userId, {
        responseTime: 3000,
        processingTime: 2000,
        errorCount: 2,
        cacheHitRate: 0.5,
        memoryUsage: 512,
        contextSize: 3000
      });

      const benchmarks = feedbackCollector.getBenchmarkComparison();

      expect(benchmarks.optimizationSuggestions).toBeInstanceOf(Array);
    });
  });

  describe('Data Export and Privacy', () => {
    it('should export feedback data in CSV format', () => {
      const userId = 'test-user';
      feedbackCollector.collectExplicitFeedback(userId, 4, 'response_quality', 'Good', createMockFeedbackContext());
      feedbackCollector.collectExplicitFeedback(userId, 5, 'helpfulness', 'Great', createMockFeedbackContext());

      const csvData = feedbackCollector.exportFeedbackData('csv');

      expect(typeof csvData).toBe('string');
      expect(csvData.includes('rating')).toBe(true);
      expect(csvData.includes('category')).toBe(true);
    });

    it('should export feedback data in JSON format', () => {
      const userId = 'test-user';
      feedbackCollector.collectExplicitFeedback(userId, 3, 'accuracy', 'Okay', createMockFeedbackContext());

      const jsonData = feedbackCollector.exportFeedbackData('json');

      expect(typeof jsonData).toBe('string');
      expect(() => JSON.parse(jsonData)).not.toThrow();
    });

    it('should anonymize user data when requested', () => {
      const userId = 'test-user-123';
      feedbackCollector.collectExplicitFeedback(userId, 4, 'response_quality', 'Good', createMockFeedbackContext());

      const anonymizedData = feedbackCollector.exportFeedbackData('json', true);
      
      expect(anonymizedData.includes('test-user-123')).toBe(false);
      expect(anonymizedData.includes('user_')).toBe(true); // Should have anonymized ID
    });

    it('should handle privacy settings', () => {
      const privacySettings = {
        anonymizeUserIds: true,
        excludePersonalContent: true,
        aggregateOnly: false
      };

      expect(() => {
        feedbackCollector.setPrivacySettings(privacySettings);
      }).not.toThrow();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid user IDs gracefully', () => {
      const invalidUserId = '';
      const rating = 4;
      const category: FeedbackCategory = 'response_quality';
      const content = 'Test';
      const context = createMockFeedbackContext();

      expect(() => {
        feedbackCollector.collectExplicitFeedback(invalidUserId, rating, category, content, context);
      }).not.toThrow();
    });

    it('should handle very long feedback content', () => {
      const userId = 'test-user';
      const longContent = 'Very long feedback content. '.repeat(1000);
      const context = createMockFeedbackContext();

      expect(() => {
        feedbackCollector.collectExplicitFeedback(userId, 4, 'response_quality', longContent, context);
      }).not.toThrow();
    });

    it('should handle malformed context gracefully', () => {
      const userId = 'test-user';
      const malformedContext = {
        messageId: null,
        conversationPhase: undefined,
        userEmotion: 'invalid_emotion',
        responseTime: -100,
        contextSize: NaN
      } as any;

      expect(() => {
        feedbackCollector.collectExplicitFeedback(userId, 4, 'response_quality', 'Test', malformedContext);
      }).not.toThrow();
    });

    it('should handle concurrent feedback collection', async () => {
      const userId = 'test-user';
      const promises = [];

      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(
            feedbackCollector.collectExplicitFeedback(userId, 3 + (i % 3), 'response_quality', `Feedback ${i}`, createMockFeedbackContext())
          )
        );
      }

      await expect(Promise.all(promises)).resolves.not.toThrow();
    });

    it('should handle memory cleanup', () => {
      const userId = 'test-user';
      
      // Add lots of feedback
      for (let i = 0; i < 1000; i++) {
        feedbackCollector.collectExplicitFeedback(userId, 3, 'response_quality', `Feedback ${i}`, createMockFeedbackContext());
      }

      // Should not cause memory issues
      expect(() => {
        feedbackCollector.getAnalytics();
      }).not.toThrow();
    });
  });

  describe('Integration with Context Manager', () => {
    it('should return analytics in expected format', () => {
      const userId = 'test-user';
      feedbackCollector.collectExplicitFeedback(userId, 4, 'response_quality', 'Good', createMockFeedbackContext());

      const analytics = feedbackCollector.getAnalytics();

      expect(analytics).toHaveProperty('totalFeedback');
      expect(analytics).toHaveProperty('averageRating');
      expect(analytics).toHaveProperty('satisfactionScore');
      expect(analytics).toHaveProperty('categoryBreakdown');
      expect(analytics).toHaveProperty('trends');
      expect(analytics).toHaveProperty('insights');
      expect(analytics).toHaveProperty('improvementAreas');
      expect(analytics).toHaveProperty('totalInteractions');
    });

    it('should handle real-time feedback updates', () => {
      const userId = 'test-user';
      
      const initialAnalytics = feedbackCollector.getAnalytics();
      
      feedbackCollector.collectExplicitFeedback(userId, 5, 'helpfulness', 'Very helpful', createMockFeedbackContext());
      
      const updatedAnalytics = feedbackCollector.getAnalytics();

      expect(updatedAnalytics.totalFeedback).toBeGreaterThan(initialAnalytics.totalFeedback);
    });

    it('should maintain consistency across method calls', () => {
      const userId = 'test-user';
      feedbackCollector.collectExplicitFeedback(userId, 4, 'response_quality', 'Good', createMockFeedbackContext());

      const analytics1 = feedbackCollector.getAnalytics();
      const analytics2 = feedbackCollector.getAnalytics();

      expect(analytics1.totalFeedback).toBe(analytics2.totalFeedback);
      expect(analytics1.averageRating).toBe(analytics2.averageRating);
    });
  });

  describe('Factory Function', () => {
    it('should create FeedbackCollector instance', () => {
      const collector = createFeedbackCollector();

      expect(collector).toBeInstanceOf(FeedbackCollector);
      expect(collector.collectExplicitFeedback).toBeInstanceOf(Function);
      expect(collector.collectImplicitFeedback).toBeInstanceOf(Function);
      expect(collector.getAnalytics).toBeInstanceOf(Function);
    });

    it('should create independent instances', () => {
      const collector1 = createFeedbackCollector();
      const collector2 = createFeedbackCollector();

      expect(collector1).not.toBe(collector2);
    });
  });
}); 