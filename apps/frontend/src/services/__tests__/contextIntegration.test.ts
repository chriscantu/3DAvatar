import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ContextManager } from '../contextManager';
import { EmotionalIntelligence } from '../emotionalIntelligence';
import { ContextCompressor, createContextCompressor } from '../contextCompression';
import { FeedbackCollector, createFeedbackCollector } from '../feedbackCollection';
import { ContextValidator, createContextValidator } from '../contextValidation';
import type { Context, EmotionalState } from '../../types/context';
import type { ChatMessage } from '../../types/common';

// Mock data factories
const createTestMessage = (content: string, role: 'user' | 'assistant' = 'user', emotion?: string): ChatMessage => ({
  id: `msg-${Date.now()}-${Math.random()}`,
  content,
  role,
  timestamp: new Date().toISOString(),
  metadata: emotion ? { detectedEmotion: emotion } : undefined
});

const createTestContext = (messages: ChatMessage[] = [], emotion: EmotionalState = 'neutral'): Context => ({
  system: {
    avatarPersonality: {
      traits: {
        empathy: 0.9,
        curiosity: 0.8,
        patience: 0.7,
        supportiveness: 0.8,
        playfulness: 0.6,
        wisdom: 0.7
      },
      communicationStyle: {
        warmth: 0.8,
        formality: 0.3,
        directness: 0.6,
        enthusiasm: 0.7,
        supportiveness: 0.9
      },
      coreValues: ['helpfulness', 'empathy', 'growth', 'authenticity'],
      interests: ['technology', 'learning', 'creativity', 'human connection'],
      boundaries: {
        topics: ['no harmful content', 'no personal medical advice'],
        tone: ['always respectful', 'supportive', 'encouraging']
      },
      responsePatterns: {
        greeting: {
          structure: 'warm',
          vocabulary: 'friendly',
          examples: ['Hello! How can I help you today?']
        },
        supportive: {
          structure: 'empathetic',
          vocabulary: 'caring',
          examples: ['I understand how you feel', 'That sounds challenging']
        },
        informative: {
          structure: 'clear',
          vocabulary: 'accessible',
          examples: ['Let me explain that clearly', 'Here\'s what I know about that']
        }
      }
    },
    conversationGuidelines: {
      maxContextWindow: 10,
      contextPriority: {
        immediate: 1,
        recent: 0.8,
        session: 0.6,
        historical: 0.4
      },
      responseRules: [],
      escalationRules: []
    },
    technicalCapabilities: {
      supportedLanguages: ['en'],
      maxTokens: 2000,
      processingTimeout: 30000,
      cacheSize: 100,
      memoryLimits: {
        shortTerm: 50,
        longTerm: 1000,
        workingMemory: 20
      }
    }
  },
  session: {
    sessionId: 'test-session',
    userId: 'test-user',
    userProfile: {
      userId: 'test-user',
      interactionHistory: [],
      preferences: {
        preferredResponseLength: 'medium',
        formalityLevel: 0.5,
        topicDepth: 'moderate',
        explanationStyle: 'detailed'
      },
      communicationStyle: {
        directness: 0.7,
        emotionalExpressiveness: 0.6,
        questioningStyle: 'exploratory'
      },
      topicInterests: []
    },
    sessionObjectives: [],
    conversationThemes: [],
    startTime: new Date(),
    messageCount: messages.length
  },
  immediate: {
    recentMessages: messages,
    currentUserEmotion: emotion,
    conversationFlow: {
      currentPhase: 'greeting',
      flowState: {
        momentum: 0.5,
        depth: 0.3,
        engagement: 0.7,
        clarity: 0.8
      },
      transitionTriggers: []
    },
    activeTopics: ['greeting'],
    environmentData: {
      timeOfDay: 'morning',
      userTimezone: 'UTC',
      sessionDuration: messages.length * 30,
      activeFeatures: ['text'],
      deviceType: 'desktop',
      networkQuality: 'good'
    }
  },
  timestamp: new Date().toISOString()
});

describe('Phase 2 Integration Tests', () => {
  let emotionalIntelligence: EmotionalIntelligence;
  let contextCompressor: ContextCompressor;
  let feedbackCollector: FeedbackCollector;
  let contextValidator: ContextValidator;

  beforeEach(() => {
    vi.clearAllMocks();
    emotionalIntelligence = new EmotionalIntelligence();
    contextCompressor = createContextCompressor();
    feedbackCollector = createFeedbackCollector();
    contextValidator = createContextValidator();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Emotional Intelligence + Context Compression Integration', () => {
    it('should preserve emotional context during compression', () => {
      const emotionalMessages = [
        createTestMessage("I'm so frustrated with this problem!", 'user', 'frustrated'),
        createTestMessage("I understand your frustration. Let me help you work through this.", 'assistant'),
        createTestMessage("Thank you, I'm feeling a bit better now.", 'user', 'relieved'),
        createTestMessage("I'm glad to hear that! Let's continue step by step.", 'assistant'),
        createTestMessage("This is actually starting to make sense!", 'user', 'excited'),
        createTestMessage("Wonderful! Your enthusiasm is great to see.", 'assistant')
      ];

      const context = createTestContext(emotionalMessages, 'excited');
      
      // Analyze emotions first
      const emotionalAnalysis = emotionalIntelligence.analyzeEmotionalState(
        emotionalMessages[emotionalMessages.length - 1].content,
        context
      );

      // Then compress context
      const compressionResult = contextCompressor.compressContext(context);

      // Verify emotional context is preserved
      expect(emotionalAnalysis.detectedEmotion).toBe('excited');
      expect(compressionResult.metadata.emotionalTone).toBeDefined();
      expect(compressionResult.summary).toContain('frustrated');
      expect(compressionResult.keyPoints.some(point => 
        point.includes('frustrated') || point.includes('excited') || point.includes('better')
      )).toBe(true);
    });

    it('should adapt compression strategy based on emotional intensity', () => {
      const highEmotionalIntensityMessages = [
        createTestMessage("I LOVE this new feature! It's absolutely amazing!", 'user', 'excited'),
        createTestMessage("I'm thrilled you love it! What specifically excites you most?", 'assistant'),
        createTestMessage("Everything! The design, the functionality, the user experience!", 'user', 'excited')
      ];

      const lowEmotionalIntensityMessages = [
        createTestMessage("This feature is okay.", 'user', 'neutral'),
        createTestMessage("Thank you for the feedback. What could we improve?", 'assistant'),
        createTestMessage("Maybe add more options.", 'user', 'neutral')
      ];

      const highEmotionContext = createTestContext(highEmotionalIntensityMessages, 'excited');
      const lowEmotionContext = createTestContext(lowEmotionalIntensityMessages, 'neutral');

      const highEmotionCompression = contextCompressor.compressContext(highEmotionContext);
      const lowEmotionCompression = contextCompressor.compressContext(lowEmotionContext);

      // High emotion conversations should retain more emotional indicators
      expect(highEmotionCompression.keyPoints.length).toBeGreaterThanOrEqual(lowEmotionCompression.keyPoints.length);
      expect(highEmotionCompression.metadata.emotionalTone).not.toBe('neutral');
    });
  });

  describe('Emotional Intelligence + Feedback Collection Integration', () => {
    it('should correlate emotional state with user satisfaction', () => {
      const userId = 'test-user';
      const positiveEmotionMessage = "I'm so happy with how this turned out!";
      const negativeEmotionMessage = "I'm really disappointed with this result.";

      const positiveContext = createTestContext([createTestMessage(positiveEmotionMessage)], 'happy');
      const negativeContext = createTestContext([createTestMessage(negativeEmotionMessage)], 'disappointed');

      // Analyze emotions
      const positiveAnalysis = emotionalIntelligence.analyzeEmotionalState(positiveEmotionMessage, positiveContext);
      const negativeAnalysis = emotionalIntelligence.analyzeEmotionalState(negativeEmotionMessage, negativeContext);

      // Collect corresponding feedback
      feedbackCollector.collectExplicitFeedback(userId, 5, 'response_quality', 'Excellent!', {
        messageId: 'msg-positive',
        conversationPhase: 'conclusion',
        userEmotion: positiveAnalysis.detectedEmotion,
        responseTime: 1000,
        contextSize: 1024,
        activeFeatures: ['text', 'emotion_detection'],
        userIntent: 'satisfaction'
      });

      feedbackCollector.collectExplicitFeedback(userId, 2, 'response_quality', 'Not helpful', {
        messageId: 'msg-negative',
        conversationPhase: 'problem_solving',
        userEmotion: negativeAnalysis.detectedEmotion,
        responseTime: 3000,
        contextSize: 1024,
        activeFeatures: ['text', 'emotion_detection'],
        userIntent: 'help_seeking'
      });

      const analytics = feedbackCollector.getAnalytics();

      expect(analytics.totalFeedback).toBeGreaterThan(0);
      expect(analytics.categoryBreakdown.response_quality).toBeDefined();
    });

    it('should use emotional patterns to improve feedback insights', () => {
      const userId = 'test-user';
      
      // Simulate a conversation with emotional progression
      const conversationMessages = [
        { content: "I'm confused about this topic", emotion: 'confused' },
        { content: "This explanation is starting to help", emotion: 'hopeful' },
        { content: "Now I understand! Thank you!", emotion: 'grateful' }
      ];

      conversationMessages.forEach((msg, index) => {
        const context = createTestContext([createTestMessage(msg.content)], msg.emotion as EmotionalState);
        const analysis = emotionalIntelligence.analyzeEmotionalState(msg.content, context);
        
        // Collect implicit feedback based on emotional progression
        feedbackCollector.collectImplicitFeedback(userId, {
          responseTime: 1500 - (index * 200), // Faster responses as understanding improves
          messageLength: 50 + (index * 30),   // Longer messages as engagement increases
          typoCount: 2 - index,               // Fewer typos as comfort increases
          editCount: 1,
          pauseDuration: 1000 - (index * 300),
          clarificationRequests: Math.max(0, 2 - index),
          topicChanges: 0,
          emotionalExpressions: index + 1,    // More emotional expressions as satisfaction grows
          questionCount: Math.max(0, 2 - index),
          followUpQuestions: index
        }, {
          messageId: `msg-${index}`,
          conversationPhase: index === 0 ? 'problem_identification' : index === 1 ? 'explanation' : 'resolution',
          userEmotion: analysis.detectedEmotion,
          responseTime: 1500 - (index * 200),
          contextSize: 1024,
          activeFeatures: ['text', 'emotion_detection'],
          userIntent: 'learning'
        });
      });

      const analytics = feedbackCollector.getAnalytics();
      expect(analytics.insights.length).toBeGreaterThan(0);
    });
  });

  describe('Context Compression + Validation Integration', () => {
    it('should validate compressed context integrity', () => {
      const largeConversation = Array.from({ length: 50 }, (_, i) => 
        createTestMessage(`Message ${i + 1} with some meaningful content about the topic`, i % 2 === 0 ? 'user' : 'assistant')
      );

      const context = createTestContext(largeConversation, 'neutral');
      
      // First validate the original context
      const originalValidation = contextValidator.validateContext(context);
      expect(originalValidation.isValid).toBe(true);

      // Compress the context
      const compressionResult = contextCompressor.compressContext(context);
      
      // Create a new context with compressed messages
      const compressedContext = {
        ...context,
        immediate: {
          ...context.immediate,
          recentMessages: compressionResult.retainedMessages
        }
      };

      // Validate the compressed context
      const compressedValidation = contextValidator.validateContext(compressedContext);
      
      expect(compressedValidation.isValid).toBe(true);
      expect(compressedValidation.score).toBeGreaterThan(0.7); // Should maintain good quality
      expect(compressedContext.immediate.recentMessages.length).toBeLessThan(context.immediate.recentMessages.length);
    });

    it('should handle validation errors during compression gracefully', () => {
      // Create a context with some invalid data
      const invalidContext = createTestContext([
        createTestMessage("Valid message", 'user'),
        { ...createTestMessage("Invalid message", 'user'), id: '' }, // Invalid: empty ID
        createTestMessage("Another valid message", 'assistant')
      ], 'neutral');

      // Validation should catch the invalid message
      const validation = contextValidator.validateContext(invalidContext);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);

      // Compression should still work but may filter out invalid messages
      const compressionResult = contextCompressor.compressContext(invalidContext);
      expect(compressionResult.retainedMessages.every(msg => msg.id && msg.id.length > 0)).toBe(true);
    });
  });

  describe('Feedback Collection + Validation Integration', () => {
    it('should validate feedback data integrity', () => {
      const userId = 'test-user';
      
      // Collect various types of feedback
      feedbackCollector.collectExplicitFeedback(userId, 4, 'response_quality', 'Good response', {
        messageId: 'msg-1',
        conversationPhase: 'exploration',
        userEmotion: 'satisfied',
        responseTime: 1200,
        contextSize: 2048,
        activeFeatures: ['text'],
        userIntent: 'learning'
      });

      // Collect behavioral metrics
      feedbackCollector.collectImplicitFeedback(userId, {
        responseTime: 1200,
        messageLength: 150,
        typoCount: 1,
        editCount: 0,
        pauseDuration: 500,
        clarificationRequests: 0,
        topicChanges: 1,
        emotionalExpressions: 2,
        questionCount: 1,
        followUpQuestions: 0
      }, {
        messageId: 'msg-2',
        conversationPhase: 'deep_discussion',
        userEmotion: 'engaged',
        responseTime: 1200,
        contextSize: 2048,
        activeFeatures: ['text'],
        userIntent: 'exploration'
      });

      const analytics = feedbackCollector.getAnalytics();
      
      // Validate analytics structure
      expect(analytics.totalFeedback).toBeGreaterThan(0);
      expect(analytics.averageRating).toBeGreaterThanOrEqual(1);
      expect(analytics.averageRating).toBeLessThanOrEqual(5);
      expect(analytics.satisfactionScore).toBeGreaterThanOrEqual(0);
      expect(analytics.satisfactionScore).toBeLessThanOrEqual(1);
    });

    it('should provide health recommendations based on feedback patterns', () => {
      const userId = 'test-user';
      
      // Simulate declining feedback pattern
      const feedbackData = [
        { rating: 5, content: 'Excellent!', emotion: 'happy' },
        { rating: 4, content: 'Good', emotion: 'satisfied' },
        { rating: 3, content: 'Okay', emotion: 'neutral' },
        { rating: 2, content: 'Not great', emotion: 'disappointed' },
        { rating: 1, content: 'Poor', emotion: 'frustrated' }
      ];

      feedbackData.forEach((feedback, index) => {
        feedbackCollector.collectExplicitFeedback(userId, feedback.rating, 'response_quality', feedback.content, {
          messageId: `msg-${index}`,
          conversationPhase: 'ongoing',
          userEmotion: feedback.emotion,
          responseTime: 1500 + (index * 500), // Increasing response time indicates frustration
          contextSize: 2048,
          activeFeatures: ['text'],
          userIntent: 'help_seeking'
        });
      });

      const analytics = feedbackCollector.getAnalytics();
      const recommendations = feedbackCollector.getImprovementRecommendations();

      expect(analytics.trends.ratingTrend).toBe('declining');
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(rec => rec.priority === 'high')).toBe(true);
    });
  });

  describe('Full Integration - All Services Working Together', () => {
    it('should process a complete conversation workflow', () => {
      const userId = 'test-user';
      const conversationFlow = [
        { content: "Hi, I need help with a programming problem", emotion: 'neutral', rating: null },
        { content: "I'd be happy to help! What's the issue?", emotion: null, rating: null },
        { content: "I'm getting confused with async/await in JavaScript", emotion: 'confused', rating: null },
        { content: "I understand async can be tricky. Let me explain...", emotion: null, rating: null },
        { content: "Oh wow, that makes so much more sense now!", emotion: 'excited', rating: 5 },
        { content: "I'm glad it clicked! Would you like to try an example?", emotion: null, rating: null },
        { content: "Yes please! I'm feeling much more confident now", emotion: 'confident', rating: 5 }
      ];

      const messages: ChatMessage[] = [];
      let currentContext = createTestContext([], 'neutral');

      conversationFlow.forEach((turn, index) => {
        const message = createTestMessage(turn.content, index % 2 === 0 ? 'user' : 'assistant', turn.emotion || undefined);
        messages.push(message);

        // Update context with new message
        currentContext = createTestContext(messages, turn.emotion as EmotionalState || 'neutral');

        // Analyze emotions for user messages
        if (index % 2 === 0 && turn.emotion) {
          const emotionalAnalysis = emotionalIntelligence.analyzeEmotionalState(turn.content, currentContext);
          expect(emotionalAnalysis.detectedEmotion).toBeDefined();
          
          // Update emotional pattern
          emotionalIntelligence.updateEmotionalPattern(userId, emotionalAnalysis.detectedEmotion, emotionalAnalysis.emotionalContext.intensity);
        }

        // Collect feedback for rated interactions
        if (turn.rating) {
          feedbackCollector.collectExplicitFeedback(userId, turn.rating, 'helpfulness', 'Great explanation!', {
            messageId: message.id,
            conversationPhase: index < 2 ? 'greeting' : index < 4 ? 'problem_identification' : 'resolution',
            userEmotion: turn.emotion || 'neutral',
            responseTime: turn.emotion === 'excited' ? 800 : 1500, // Faster response when excited
            contextSize: JSON.stringify(currentContext).length,
            activeFeatures: ['text', 'emotion_detection'],
            userIntent: 'learning'
          });
        }

        // Validate context periodically
        if (index % 3 === 0) {
          const validation = contextValidator.validateContext(currentContext);
          expect(validation.isValid).toBe(true);
        }

        // Compress context if it gets large
        if (messages.length > 10) {
          const compressionResult = contextCompressor.compressContext(currentContext);
          expect(compressionResult.compressionRatio).toBeLessThanOrEqual(1);
        }
      });

      // Final analysis
      const finalContext = currentContext;
      const finalValidation = contextValidator.validateContext(finalContext);
      const conversationSummary = contextCompressor.summarizeConversation(messages);
      const feedbackAnalytics = feedbackCollector.getAnalytics();

      // Verify integration results
      expect(finalValidation.isValid).toBe(true);
      expect(finalValidation.score).toBeGreaterThan(0.8);

      expect(conversationSummary.emotionalArc.startEmotion).toBe('neutral');
      expect(conversationSummary.emotionalArc.endEmotion).toBe('confident');
      expect(conversationSummary.emotionalArc.overallTrend).toBe('positive');

      expect(feedbackAnalytics.averageRating).toBe(5);
      expect(feedbackAnalytics.satisfactionScore).toBeGreaterThan(0.9);
      expect(feedbackAnalytics.trends.ratingTrend).toBe('stable'); // Consistently high
    });

    it('should handle error scenarios gracefully across all services', () => {
      const userId = 'test-user';
      
      // Create problematic scenarios
      const problematicScenarios = [
        { content: "", emotion: 'neutral' }, // Empty content
        { content: "A".repeat(10000), emotion: 'frustrated' }, // Very long content
        { content: "Test with special chars: 🎉💯✨", emotion: 'excited' }, // Special characters
        { content: null as any, emotion: 'confused' } // Null content
      ];

      problematicScenarios.forEach((scenario, index) => {
        try {
          const message = createTestMessage(scenario.content || "fallback", 'user', scenario.emotion);
          const context = createTestContext([message], scenario.emotion as EmotionalState);

          // Each service should handle errors gracefully
          const emotionalAnalysis = emotionalIntelligence.analyzeEmotionalState(scenario.content || "fallback", context);
          expect(emotionalAnalysis.detectedEmotion).toBeDefined();

          const validation = contextValidator.validateContext(context);
          expect(validation).toBeDefined();

          const compressionResult = contextCompressor.compressContext(context);
          expect(compressionResult).toBeDefined();

          feedbackCollector.collectExplicitFeedback(userId, 3, 'response_quality', 'Test feedback', {
            messageId: message.id,
            conversationPhase: 'testing',
            userEmotion: scenario.emotion,
            responseTime: 1500,
            contextSize: 1024,
            activeFeatures: ['text'],
            userIntent: 'testing'
          });

        } catch (error) {
          // Services should not throw unhandled errors
          expect(error).toBeUndefined();
        }
      });

      // Verify system remains functional
      const analytics = feedbackCollector.getAnalytics();
      expect(analytics.totalFeedback).toBeGreaterThan(0);
    });

    it('should maintain performance under load', async () => {
      const userId = 'test-user';
      const startTime = Date.now();

      // Simulate concurrent operations
      const operations = Array.from({ length: 100 }, (_, i) => {
        const message = createTestMessage(`Performance test message ${i}`, 'user', 'neutral');
        const context = createTestContext([message], 'neutral');

        return Promise.resolve().then(() => {
          // Run all services
          const emotionalAnalysis = emotionalIntelligence.analyzeEmotionalState(message.content, context);
          const validation = contextValidator.validateContext(context);
          const compressionResult = contextCompressor.compressContext(context);
          
          feedbackCollector.collectExplicitFeedback(userId, 4, 'response_quality', 'Performance test', {
            messageId: message.id,
            conversationPhase: 'testing',
            userEmotion: emotionalAnalysis.detectedEmotion,
            responseTime: 1000,
            contextSize: 1024,
            activeFeatures: ['text'],
            userIntent: 'testing'
          });

          return {
            emotional: emotionalAnalysis,
            validation,
            compression: compressionResult
          };
        });
      });

      const results = await Promise.all(operations);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Verify all operations completed successfully
      expect(results).toHaveLength(100);
      results.forEach(result => {
        expect(result.emotional.detectedEmotion).toBeDefined();
        expect(result.validation.isValid).toBeDefined();
        expect(result.compression.summary).toBeDefined();
      });

      // Performance should be reasonable (less than 10 seconds for 100 operations)
      expect(totalTime).toBeLessThan(10000);

      const analytics = feedbackCollector.getAnalytics();
      expect(analytics.totalFeedback).toBe(100);
    });
  });

  describe('Service Interdependency Management', () => {
    it('should handle service dependencies correctly', () => {
      const userId = 'test-user';
      const message = createTestMessage("I'm really excited about this new feature!", 'user', 'excited');
      const context = createTestContext([message], 'excited');

      // Services should work independently
      const emotionalAnalysis = emotionalIntelligence.analyzeEmotionalState(message.content, context);
      const validation = contextValidator.validateContext(context);
      const compression = contextCompressor.compressContext(context);

      // But also enhance each other when used together
      expect(emotionalAnalysis.detectedEmotion).toBe('excited');
      expect(validation.isValid).toBe(true);
      expect(compression.metadata.emotionalTone).toBeDefined();

      // Feedback collection can use insights from other services
      feedbackCollector.collectExplicitFeedback(userId, 5, 'emotional_support', 'Great emotional awareness!', {
        messageId: message.id,
        conversationPhase: 'engagement',
        userEmotion: emotionalAnalysis.detectedEmotion,
        responseTime: 900, // Quick response indicates satisfaction
        contextSize: compression.compressedSize,
        activeFeatures: ['text', 'emotion_detection', 'compression'],
        userIntent: 'satisfaction'
      });

      const analytics = feedbackCollector.getAnalytics();
      expect(analytics.categoryBreakdown.emotional_support).toBeDefined();
    });

    it('should provide comprehensive system health overview', () => {
      const userId = 'test-user';
      
      // Simulate a complex interaction
      const messages = [
        createTestMessage("I need help understanding machine learning", 'user', 'curious'),
        createTestMessage("I'd love to help! What aspect interests you most?", 'assistant'),
        createTestMessage("I'm particularly interested in neural networks", 'user', 'excited'),
        createTestMessage("Great choice! Neural networks are fascinating...", 'assistant')
      ];

      const context = createTestContext(messages, 'excited');

      // Get comprehensive system status
      const emotionalAnalysis = emotionalIntelligence.analyzeEmotionalState(messages[2].content, context);
      const healthCheck = contextValidator.performHealthCheck(context);
      const conversationSummary = contextCompressor.summarizeConversation(messages);
      
      feedbackCollector.collectExplicitFeedback(userId, 5, 'helpfulness', 'Very informative!', {
        messageId: messages[2].id,
        conversationPhase: 'exploration',
        userEmotion: emotionalAnalysis.detectedEmotion,
        responseTime: 1200,
        contextSize: JSON.stringify(context).length,
        activeFeatures: ['text', 'emotion_detection'],
        userIntent: 'learning'
      });

      const feedbackAnalytics = feedbackCollector.getAnalytics();

      // Verify comprehensive system health
      expect(healthCheck.overall).toBe('healthy');
      expect(healthCheck.score).toBeGreaterThan(0.8);
      
      expect(conversationSummary.emotionalArc.overallTrend).toBe('positive');
      expect(conversationSummary.topics).toContain('machine learning');
      
      expect(feedbackAnalytics.satisfactionScore).toBeGreaterThan(0.9);
      expect(feedbackAnalytics.insights.length).toBeGreaterThan(0);

      // System should provide actionable insights
      const recommendations = feedbackCollector.getImprovementRecommendations();
      expect(recommendations).toBeInstanceOf(Array);
    });
  });
}); 