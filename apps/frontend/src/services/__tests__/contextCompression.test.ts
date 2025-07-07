import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ContextCompressor, createContextCompressor } from '../contextCompression';
import type { Context, EmotionalState } from '../../types/context';
import type { ChatMessage } from '../../types/common';

// Mock context for testing
const createMockContext = (messageCount: number = 5): Context => {
  const messages: ChatMessage[] = [];
  for (let i = 0; i < messageCount; i++) {
    messages.push({
      id: `msg-${i}`,
      content: `Test message ${i + 1}`,
      role: i % 2 === 0 ? 'user' : 'assistant',
      timestamp: new Date(Date.now() - (messageCount - i) * 60000).toISOString()
    });
  }

  return {
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
      messageCount: messageCount
    },
    immediate: {
      recentMessages: messages,
      currentUserEmotion: 'neutral' as EmotionalState,
      conversationFlow: {
        currentPhase: 'deep_discussion',
        flowState: {
          momentum: 0.7,
          depth: 0.8,
          engagement: 0.9,
          clarity: 0.6
        },
        transitionTriggers: []
      },
      activeTopics: ['testing', 'context compression'],
      environmentData: {
        timeOfDay: 'afternoon',
        userTimezone: 'UTC',
        sessionDuration: messageCount * 2,
        activeFeatures: ['text'],
        deviceType: 'desktop',
        networkQuality: 'good'
      }
    },
    timestamp: new Date().toISOString()
  };
};

const createMockMessage = (content: string, role: 'user' | 'assistant' = 'user', emotion?: string): ChatMessage => ({
  id: 'test-message-' + Date.now() + Math.random(),
  content,
  role,
  timestamp: new Date().toISOString(),
  metadata: emotion ? { detectedEmotion: emotion } : undefined
});

describe('ContextCompressor Service', () => {
  let contextCompressor: ContextCompressor;

  beforeEach(() => {
    vi.clearAllMocks();
    contextCompressor = createContextCompressor();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Context Compression', () => {
    it('should compress context when size exceeds threshold', () => {
      const largeContext = createMockContext(20); // 20 messages
      
      const result = contextCompressor.compressContext(largeContext);

      expect(result.originalSize).toBeGreaterThan(result.compressedSize);
      expect(result.compressionRatio).toBeLessThan(1);
      expect(result.summary).toBeDefined();
      expect(result.keyPoints).toBeInstanceOf(Array);
      expect(result.retainedMessages).toBeInstanceOf(Array);
      expect(result.retainedMessages.length).toBeLessThan(largeContext.immediate.recentMessages.length);
    });

    it('should not compress context when size is below threshold', () => {
      const smallContext = createMockContext(3); // 3 messages
      
      const result = contextCompressor.compressContext(smallContext);

      expect(result.originalSize).toBe(result.compressedSize);
      expect(result.compressionRatio).toBe(1);
      expect(result.summary).toContain('No compression applied');
      expect(result.retainedMessages).toEqual(smallContext.immediate.recentMessages);
    });

    it('should generate meaningful compression metadata', () => {
      const context = createMockContext(15);
      
      const result = contextCompressor.compressContext(context);

      expect(result.metadata.timestamp).toBeInstanceOf(Date);
      expect(result.metadata.method).toMatch(/extractive|abstractive|hybrid/);
      expect(result.metadata.qualityScore).toBeGreaterThanOrEqual(0);
      expect(result.metadata.qualityScore).toBeLessThanOrEqual(1);
      expect(result.metadata.topicsRetained).toBeInstanceOf(Array);
      expect(result.metadata.emotionalTone).toBeDefined();
      expect(result.metadata.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(result.metadata.confidenceScore).toBeLessThanOrEqual(1);
    });

    it('should preserve important messages during compression', () => {
      const context = createMockContext(0);
      const importantMessages = [
        createMockMessage("This is a critical decision point in our conversation.", 'user'),
        createMockMessage("I understand. Let me help you with that important matter.", 'assistant'),
        createMockMessage("What are the key steps I should take?", 'user'),
        createMockMessage("Here are the essential steps you need to follow...", 'assistant')
      ];
      
      context.immediate.recentMessages = [
        ...Array.from({ length: 10 }, (_, i) => createMockMessage(`Filler message ${i}`, 'user')),
        ...importantMessages
      ];

      const result = contextCompressor.compressContext(context);

      // Should retain at least some important messages
      expect(result.retainedMessages.length).toBeGreaterThan(0);
      expect(result.keyPoints.length).toBeGreaterThan(0);
    });

    it('should handle empty context gracefully', () => {
      const emptyContext = createMockContext(0);
      
      const result = contextCompressor.compressContext(emptyContext);

      expect(result.originalSize).toBe(0);
      expect(result.compressedSize).toBe(0);
      expect(result.compressionRatio).toBe(1);
      expect(result.retainedMessages).toEqual([]);
      expect(result.keyPoints).toEqual([]);
    });
  });

  describe('Message Importance Scoring', () => {
    it('should score longer messages higher', () => {
      const shortMessage = createMockMessage("Yes.");
      const longMessage = createMockMessage("This is a very detailed explanation of the complex topic we've been discussing, including multiple important points and considerations that are crucial for understanding the full context of our conversation.");

      const shortScore = contextCompressor.scoreMessageImportance(shortMessage);
      const longScore = contextCompressor.scoreMessageImportance(longMessage);

      expect(longScore).toBeGreaterThan(shortScore);
    });

    it('should score messages with questions higher', () => {
      const statementMessage = createMockMessage("This is a statement about something.");
      const questionMessage = createMockMessage("What do you think about this important question?");

      const statementScore = contextCompressor.scoreMessageImportance(statementMessage);
      const questionScore = contextCompressor.scoreMessageImportance(questionMessage);

      expect(questionScore).toBeGreaterThan(statementScore);
    });

    it('should score emotionally charged messages higher', () => {
      const neutralMessage = createMockMessage("The weather is okay today.");
      const emotionalMessage = createMockMessage("I'm absolutely thrilled about this amazing opportunity!", 'user', 'excited');

      const neutralScore = contextCompressor.scoreMessageImportance(neutralMessage);
      const emotionalScore = contextCompressor.scoreMessageImportance(emotionalMessage);

      expect(emotionalScore).toBeGreaterThan(neutralScore);
    });

    it('should score recent messages higher', () => {
      const oldMessage = createMockMessage("Old message");
      oldMessage.timestamp = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // 24 hours ago
      
      const recentMessage = createMockMessage("Recent message");
      recentMessage.timestamp = new Date().toISOString();

      const oldScore = contextCompressor.scoreMessageImportance(oldMessage);
      const recentScore = contextCompressor.scoreMessageImportance(recentMessage);

      expect(recentScore).toBeGreaterThan(oldScore);
    });

    it('should return scores between 0 and 1', () => {
      const message = createMockMessage("Test message for scoring");
      const score = contextCompressor.scoreMessageImportance(message);

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });

  describe('Conversation Summarization', () => {
    it('should summarize conversation with key points', () => {
      const messages = [
        createMockMessage("Hi, I need help with my project.", 'user'),
        createMockMessage("I'd be happy to help! What kind of project are you working on?", 'assistant'),
        createMockMessage("It's a web application using React and TypeScript.", 'user'),
        createMockMessage("Great choice! What specific aspect do you need help with?", 'assistant'),
        createMockMessage("I'm struggling with state management and testing.", 'user'),
        createMockMessage("I can help with both! Let's start with state management...", 'assistant')
      ];

      const summary = contextCompressor.summarizeConversation(messages);

      expect(summary.summary).toBeDefined();
      expect(summary.summary.length).toBeGreaterThan(0);
      expect(summary.keyPoints).toBeInstanceOf(Array);
      expect(summary.keyPoints.length).toBeGreaterThan(0);
      expect(summary.participants).toContain('user');
      expect(summary.participants).toContain('assistant');
      expect(summary.duration).toBeGreaterThan(0);
      expect(summary.messageCount).toBe(messages.length);
    });

    it('should extract action items from conversation', () => {
      const messages = [
        createMockMessage("I need to implement user authentication.", 'user'),
        createMockMessage("You should start by setting up a login form.", 'assistant'),
        createMockMessage("Then I'll need to add password validation.", 'user'),
        createMockMessage("Yes, and don't forget to implement session management.", 'assistant')
      ];

      const summary = contextCompressor.summarizeConversation(messages);

      expect(summary.actionItems).toBeInstanceOf(Array);
      expect(summary.actionItems.length).toBeGreaterThan(0);
    });

    it('should analyze emotional arc of conversation', () => {
      const messages = [
        createMockMessage("I'm frustrated with this problem.", 'user', 'frustrated'),
        createMockMessage("I understand your frustration. Let me help.", 'assistant'),
        createMockMessage("Thank you, I'm feeling more hopeful now.", 'user', 'hopeful'),
        createMockMessage("I'm glad to help! You're making great progress.", 'assistant')
      ];

      const summary = contextCompressor.summarizeConversation(messages);

      expect(summary.emotionalArc).toBeDefined();
      expect(summary.emotionalArc.startEmotion).toBeDefined();
      expect(summary.emotionalArc.endEmotion).toBeDefined();
      expect(summary.emotionalArc.overallTrend).toMatch(/positive|negative|neutral|mixed/);
    });

    it('should identify significant moments', () => {
      const messages = [
        createMockMessage("I just had a breakthrough understanding!", 'user', 'excited'),
        createMockMessage("That's wonderful! Tell me more about your insight.", 'assistant'),
        createMockMessage("I realized the solution to my problem.", 'user'),
        createMockMessage("Excellent! That's a significant moment.", 'assistant')
      ];

      const summary = contextCompressor.summarizeConversation(messages);

      expect(summary.significantMoments).toBeInstanceOf(Array);
      expect(summary.significantMoments.length).toBeGreaterThan(0);
    });

    it('should handle empty conversation gracefully', () => {
      const summary = contextCompressor.summarizeConversation([]);

      expect(summary.summary).toBe('No conversation to summarize');
      expect(summary.keyPoints).toEqual([]);
      expect(summary.participants).toEqual([]);
      expect(summary.messageCount).toBe(0);
      expect(summary.duration).toBe(0);
    });
  });

  describe('Context Size Optimization', () => {
    it('should optimize context size based on thresholds', () => {
      const largeContext = createMockContext(25);
      
      const optimizedContext = contextCompressor.optimizeContextSize(largeContext, 1000);

      expect(optimizedContext.immediate.recentMessages.length).toBeLessThan(largeContext.immediate.recentMessages.length);
      expect(optimizedContext.session.messageCount).toBeLessThanOrEqual(largeContext.session.messageCount);
    });

    it('should preserve essential context during optimization', () => {
      const context = createMockContext(20);
      
      const optimizedContext = contextCompressor.optimizeContextSize(context, 500);

      expect(optimizedContext.system).toEqual(context.system);
      expect(optimizedContext.session.sessionId).toBe(context.session.sessionId);
      expect(optimizedContext.session.userId).toBe(context.session.userId);
      expect(optimizedContext.immediate.currentUserEmotion).toBe(context.immediate.currentUserEmotion);
    });

    it('should not modify context when below threshold', () => {
      const smallContext = createMockContext(3);
      
      const optimizedContext = contextCompressor.optimizeContextSize(smallContext, 10000);

      expect(optimizedContext).toEqual(smallContext);
    });
  });

  describe('Conversation Analytics', () => {
    it('should analyze conversation patterns', () => {
      const messages = [
        createMockMessage("Hello, how are you?", 'user'),
        createMockMessage("I'm doing well, thank you! How can I help?", 'assistant'),
        createMockMessage("I have a question about programming.", 'user'),
        createMockMessage("Great! I love discussing programming. What's your question?", 'assistant'),
        createMockMessage("How do I implement error handling?", 'user'),
        createMockMessage("Error handling is crucial. Here are the best practices...", 'assistant')
      ];

      const analytics = contextCompressor.analyzeConversation(messages);

      expect(analytics.messageCount).toBe(messages.length);
      expect(analytics.averageMessageLength).toBeGreaterThan(0);
      expect(analytics.questionCount).toBeGreaterThan(0);
      expect(analytics.topicTransitions).toBeInstanceOf(Array);
    });

    it('should calculate engagement metrics', () => {
      const messages = [
        createMockMessage("This is so interesting!", 'user', 'excited'),
        createMockMessage("I'm glad you find it engaging!", 'assistant'),
        createMockMessage("Tell me more about this topic!", 'user', 'curious'),
        createMockMessage("Absolutely! Here's more detail...", 'assistant')
      ];

      const analytics = contextCompressor.analyzeConversation(messages);

      expect(analytics.engagementScore).toBeGreaterThan(0);
      expect(analytics.engagementScore).toBeLessThanOrEqual(1);
    });

    it('should identify conversation themes', () => {
      const messages = [
        createMockMessage("I'm learning about machine learning.", 'user'),
        createMockMessage("Machine learning is fascinating! What aspect interests you?", 'assistant'),
        createMockMessage("I want to understand neural networks.", 'user'),
        createMockMessage("Neural networks are the foundation of deep learning...", 'assistant')
      ];

      const analytics = contextCompressor.analyzeConversation(messages);

      expect(analytics.themes).toBeInstanceOf(Array);
      expect(analytics.themes.length).toBeGreaterThan(0);
    });
  });

  describe('Caching and Performance', () => {
    it('should cache compression results', () => {
      const context = createMockContext(10);
      
      const result1 = contextCompressor.compressContext(context);
      const result2 = contextCompressor.compressContext(context);

      expect(result1.summary).toBe(result2.summary);
      expect(result1.compressionRatio).toBe(result2.compressionRatio);
    });

    it('should clear cache when requested', () => {
      const context = createMockContext(10);
      
      contextCompressor.compressContext(context);
      
      expect(() => {
        contextCompressor.clearCache();
      }).not.toThrow();
    });

    it('should handle concurrent compression requests', async () => {
      const contexts = Array.from({ length: 5 }, (_, i) => createMockContext(10 + i));
      
      const promises = contexts.map(context => 
        Promise.resolve(contextCompressor.compressContext(context))
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.summary).toBeDefined();
        expect(result.compressionRatio).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed messages gracefully', () => {
      const malformedMessage = {
        id: 'malformed',
        content: null as any,
        role: 'user' as const,
        timestamp: 'invalid-date'
      };

      expect(() => {
        contextCompressor.scoreMessageImportance(malformedMessage);
      }).not.toThrow();
    });

    it('should handle context with missing fields', () => {
      const incompleteContext = {
        ...createMockContext(5),
        immediate: {
          ...createMockContext(5).immediate,
          recentMessages: undefined as any
        }
      };

      expect(() => {
        contextCompressor.compressContext(incompleteContext);
      }).not.toThrow();
    });

    it('should handle very large contexts efficiently', () => {
      const hugeContext = createMockContext(1000);
      
      const startTime = Date.now();
      const result = contextCompressor.compressContext(hugeContext);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(result.compressionRatio).toBeLessThan(1);
    });

    it('should handle contexts with only system messages', () => {
      const context = createMockContext(0);
      context.immediate.recentMessages = [
        { id: 'sys1', content: 'System message 1', role: 'system' as const, timestamp: new Date().toISOString() },
        { id: 'sys2', content: 'System message 2', role: 'system' as const, timestamp: new Date().toISOString() }
      ];

      const result = contextCompressor.compressContext(context);

      expect(result.summary).toBeDefined();
      expect(result.retainedMessages).toBeInstanceOf(Array);
    });

    it('should handle special characters in messages', () => {
      const specialMessage = createMockMessage("Message with special chars: 🎉 @#$%^&*() 中文 العربية");
      
      const score = contextCompressor.scoreMessageImportance(specialMessage);

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });

  describe('Integration with Context Manager', () => {
    it('should return compression result in expected format', () => {
      const context = createMockContext(15);
      
      const result = contextCompressor.compressContext(context);

      expect(result).toHaveProperty('originalSize');
      expect(result).toHaveProperty('compressedSize');
      expect(result).toHaveProperty('compressionRatio');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('keyPoints');
      expect(result).toHaveProperty('retainedMessages');
      expect(result).toHaveProperty('metadata');

      expect(result.metadata).toHaveProperty('timestamp');
      expect(result.metadata).toHaveProperty('method');
      expect(result.metadata).toHaveProperty('qualityScore');
      expect(result.metadata).toHaveProperty('topicsRetained');
      expect(result.metadata).toHaveProperty('emotionalTone');
      expect(result.metadata).toHaveProperty('confidenceScore');
    });

    it('should provide conversation summary in expected format', () => {
      const messages = [
        createMockMessage("Hello there!", 'user'),
        createMockMessage("Hi! How can I help you?", 'assistant'),
        createMockMessage("I need help with testing.", 'user'),
        createMockMessage("I'd be happy to help with testing!", 'assistant')
      ];

      const summary = contextCompressor.summarizeConversation(messages);

      expect(summary).toHaveProperty('summary');
      expect(summary).toHaveProperty('keyPoints');
      expect(summary).toHaveProperty('participants');
      expect(summary).toHaveProperty('startTime');
      expect(summary).toHaveProperty('endTime');
      expect(summary).toHaveProperty('duration');
      expect(summary).toHaveProperty('messageCount');
      expect(summary).toHaveProperty('topics');
      expect(summary).toHaveProperty('emotionalArc');
      expect(summary).toHaveProperty('significantMoments');
      expect(summary).toHaveProperty('actionItems');
    });

    it('should maintain consistency across multiple calls', () => {
      const context = createMockContext(10);
      
      const result1 = contextCompressor.compressContext(context);
      const result2 = contextCompressor.compressContext(context);

      expect(result1.compressionRatio).toBe(result2.compressionRatio);
      expect(result1.keyPoints.length).toBe(result2.keyPoints.length);
    });
  });

  describe('Factory Function', () => {
    it('should create ContextCompressor instance', () => {
      const compressor = createContextCompressor();

      expect(compressor).toBeInstanceOf(ContextCompressor);
      expect(compressor.compressContext).toBeInstanceOf(Function);
      expect(compressor.summarizeConversation).toBeInstanceOf(Function);
      expect(compressor.scoreMessageImportance).toBeInstanceOf(Function);
    });

    it('should create independent instances', () => {
      const compressor1 = createContextCompressor();
      const compressor2 = createContextCompressor();

      expect(compressor1).not.toBe(compressor2);
    });
  });
}); 