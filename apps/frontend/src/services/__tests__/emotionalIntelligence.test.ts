import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EmotionalIntelligence } from '../emotionalIntelligence';
import type { Context, EmotionalState, EmotionalAnalysis } from '../../types/context';
import type { ChatMessage } from '../../types/common';

// Mock context for testing
const createMockContext = (userEmotion: string = 'neutral', userId: string = 'test-user'): Context => ({
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
    userId,
    userProfile: {
      userId,
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
    messageCount: 1
  },
  immediate: {
    recentMessages: [],
    currentUserEmotion: userEmotion as EmotionalState,
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
      sessionDuration: 0,
      activeFeatures: [],
      deviceType: 'desktop',
      networkQuality: 'good'
    }
  },
  timestamp: new Date().toISOString()
});

const createMockMessage = (content: string, emotion?: string): ChatMessage => ({
  id: 'test-message-' + Date.now(),
  content,
  role: 'user',
  timestamp: new Date().toISOString(),
  metadata: emotion ? { detectedEmotion: emotion } : undefined
});

describe('EmotionalIntelligence Service', () => {
  let emotionalIntelligence: EmotionalIntelligence;
  let mockContext: Context;

  beforeEach(() => {
    vi.clearAllMocks();
    emotionalIntelligence = new EmotionalIntelligence();
    mockContext = createMockContext();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Emotion Detection', () => {
    it('should detect happy emotion from positive text', () => {
      const userInput = "I'm so excited about this new project! It's going to be amazing and I love working on it!";
      const context = createMockContext('neutral');

      const analysis = emotionalIntelligence.analyzeEmotionalState(userInput, context);

      expect(analysis.detectedEmotion).toBe('happy');
      expect(analysis.confidence).toBeGreaterThan(0.5);
      expect(analysis.emotionalContext.primary).toBe('happy');
      expect(analysis.emotionalContext.intensity).toBeGreaterThan(0.5);
    });

    it('should detect sad emotion from negative text', () => {
      const userInput = "I'm really disappointed about losing my job. I feel terrible and don't know what to do.";
      const context = createMockContext('neutral');

      const analysis = emotionalIntelligence.analyzeEmotionalState(userInput, context);

      expect(analysis.detectedEmotion).toBe('sad');
      expect(analysis.confidence).toBeGreaterThan(0.5);
      expect(analysis.emotionalContext.primary).toBe('sad');
      expect(analysis.emotionalContext.intensity).toBeGreaterThan(0.5);
    });

    it('should detect angry emotion from frustrated text', () => {
      const userInput = "This is absolutely ridiculous! I'm so frustrated with this stupid system that never works!";
      const context = createMockContext('neutral');

      const analysis = emotionalIntelligence.analyzeEmotionalState(userInput, context);

      expect(analysis.detectedEmotion).toBe('angry');
      expect(analysis.confidence).toBeGreaterThan(0.5);
      expect(analysis.emotionalContext.primary).toBe('angry');
    });

    it('should detect anxious emotion from worried text', () => {
      const userInput = "I'm really worried about tomorrow's presentation. What if I mess up? I'm so nervous.";
      const context = createMockContext('neutral');

      const analysis = emotionalIntelligence.analyzeEmotionalState(userInput, context);

      expect(analysis.detectedEmotion).toBe('anxious');
      expect(analysis.confidence).toBeGreaterThan(0.5);
      expect(analysis.emotionalContext.primary).toBe('anxious');
    });

    it('should detect confused emotion from uncertain text', () => {
      const userInput = "I don't understand this at all. What does this mean? I'm completely lost.";
      const context = createMockContext('neutral');

      const analysis = emotionalIntelligence.analyzeEmotionalState(userInput, context);

      expect(analysis.detectedEmotion).toBe('confused');
      expect(analysis.confidence).toBeGreaterThan(0.5);
      expect(analysis.emotionalContext.primary).toBe('confused');
    });

    it('should detect excited emotion from enthusiastic text', () => {
      const userInput = "Oh wow! This is incredible! I can't wait to get started! This is going to be fantastic!";
      const context = createMockContext('neutral');

      const analysis = emotionalIntelligence.analyzeEmotionalState(userInput, context);

      expect(analysis.detectedEmotion).toBe('excited');
      expect(analysis.confidence).toBeGreaterThan(0.5);
      expect(analysis.emotionalContext.primary).toBe('excited');
    });

    it('should default to neutral for ambiguous text', () => {
      const userInput = "The weather is okay today. How are you?";
      const context = createMockContext('neutral');

      const analysis = emotionalIntelligence.analyzeEmotionalState(userInput, context);

      expect(analysis.detectedEmotion).toBe('neutral');
      expect(analysis.confidence).toBeGreaterThan(0);
    });

    it('should handle empty input gracefully', () => {
      const userInput = "";
      const context = createMockContext('neutral');

      const analysis = emotionalIntelligence.analyzeEmotionalState(userInput, context);

      expect(analysis.detectedEmotion).toBe('neutral');
      expect(analysis.confidence).toBeGreaterThan(0);
    });
  });

  describe('Sentiment Analysis', () => {
    it('should calculate high intensity for strong emotional expressions', () => {
      const userInput = "I'm absolutely thrilled and overjoyed! This is the best day ever!";
      const context = createMockContext('neutral');

      const analysis = emotionalIntelligence.analyzeEmotionalState(userInput, context);

      expect(analysis.emotionalContext.intensity).toBeGreaterThan(0.7);
    });

    it('should calculate low intensity for mild emotional expressions', () => {
      const userInput = "I'm somewhat happy about this news.";
      const context = createMockContext('neutral');

      const analysis = emotionalIntelligence.analyzeEmotionalState(userInput, context);

      expect(analysis.emotionalContext.intensity).toBeLessThan(0.7);
      expect(analysis.emotionalContext.intensity).toBeGreaterThan(0.3);
    });

    it('should provide confidence scores for emotion detection', () => {
      const userInput = "I love this amazing wonderful fantastic project!";
      const context = createMockContext('neutral');

      const analysis = emotionalIntelligence.analyzeEmotionalState(userInput, context);

      expect(analysis.confidence).toBeGreaterThanOrEqual(0);
      expect(analysis.confidence).toBeLessThanOrEqual(1);
      expect(analysis.emotionalContext.confidence).toBeGreaterThanOrEqual(0);
      expect(analysis.emotionalContext.confidence).toBeLessThanOrEqual(1);
    });

    it('should identify emotional indicators in text', () => {
      const userInput = "I'm excited and thrilled about this amazing opportunity!";
      const context = createMockContext('neutral');

      const analysis = emotionalIntelligence.analyzeEmotionalState(userInput, context);

      expect(analysis.emotionalContext.indicators).toBeInstanceOf(Array);
      expect(analysis.emotionalContext.indicators.length).toBeGreaterThan(0);
      expect(analysis.emotionalContext.indicators).toContain('excited');
    });
  });

  describe('Response Tone Adaptation', () => {
    it('should suggest enthusiastic tone for happy emotions', () => {
      const userInput = "I'm so happy about this new opportunity!";
      const context = createMockContext('neutral');

      const analysis = emotionalIntelligence.analyzeEmotionalState(userInput, context);

      expect(analysis.suggestedResponse.tone).toBe('enthusiastic');
      expect(analysis.suggestedResponse.adjustments.warmth).toBeGreaterThan(0.5);
      expect(analysis.suggestedResponse.adjustments.energy).toBeGreaterThan(0.5);
    });

    it('should suggest supportive tone for sad emotions', () => {
      const userInput = "I'm feeling really down about this situation.";
      const context = createMockContext('neutral');

      const analysis = emotionalIntelligence.analyzeEmotionalState(userInput, context);

      expect(analysis.suggestedResponse.tone).toBe('supportive');
      expect(analysis.suggestedResponse.adjustments.empathy).toBeGreaterThan(0.7);
      expect(analysis.suggestedResponse.adjustments.warmth).toBeGreaterThan(0.7);
    });

    it('should suggest calming tone for angry emotions', () => {
      const userInput = "I'm so frustrated with this broken system!";
      const context = createMockContext('neutral');

      const analysis = emotionalIntelligence.analyzeEmotionalState(userInput, context);

      expect(analysis.suggestedResponse.tone).toBe('calming');
      expect(analysis.suggestedResponse.adjustments.empathy).toBeGreaterThan(0.5);
      expect(analysis.suggestedResponse.adjustments.energy).toBeLessThan(0);
    });

    it('should suggest calming tone for anxious emotions', () => {
      const userInput = "I'm really worried about what might happen.";
      const context = createMockContext('neutral');

      const analysis = emotionalIntelligence.analyzeEmotionalState(userInput, context);

      expect(analysis.suggestedResponse.tone).toBe('calming');
      expect(analysis.suggestedResponse.adjustments.empathy).toBeGreaterThan(0.7);
      expect(analysis.suggestedResponse.adjustments.energy).toBeLessThan(0);
    });

    it('should suggest encouraging tone for confused emotions', () => {
      const userInput = "I don't understand this concept at all.";
      const context = createMockContext('neutral');

      const analysis = emotionalIntelligence.analyzeEmotionalState(userInput, context);

      expect(analysis.suggestedResponse.tone).toBe('encouraging');
      expect(analysis.suggestedResponse.adjustments.empathy).toBeGreaterThan(0.5);
      expect(analysis.suggestedResponse.adjustments.formality).toBeLessThan(0);
    });

    it('should provide suggested phrases for different emotions', () => {
      const userInput = "I'm feeling really sad today.";
      const context = createMockContext('neutral');

      const analysis = emotionalIntelligence.analyzeEmotionalState(userInput, context);

      expect(analysis.suggestedResponse.suggestedPhrases).toBeInstanceOf(Array);
      expect(analysis.suggestedResponse.suggestedPhrases.length).toBeGreaterThan(0);
      expect(analysis.suggestedResponse.avoidPhrases).toBeInstanceOf(Array);
      expect(analysis.suggestedResponse.avoidPhrases.length).toBeGreaterThan(0);
    });
  });

  describe('Emotional Pattern Tracking', () => {
    it('should track emotional patterns for users', () => {
      const userId = 'test-user-123';
      const context = createMockContext('neutral', userId);

      // Simulate multiple interactions
      emotionalIntelligence.analyzeEmotionalState("I'm happy!", context);
      emotionalIntelligence.analyzeEmotionalState("I'm excited!", context);
      emotionalIntelligence.analyzeEmotionalState("I'm thrilled!", context);

      // Update pattern should be called
      expect(() => {
        emotionalIntelligence.updateEmotionalPattern(userId, 'happy', 0.8);
      }).not.toThrow();
    });

    it('should determine emotional trends', () => {
      const userInput = "I'm feeling better than yesterday.";
      const context = createMockContext('neutral');

      const analysis = emotionalIntelligence.analyzeEmotionalState(userInput, context);

      expect(analysis.emotionalContext.trend).toMatch(/improving|declining|stable/);
    });

    it('should handle multiple emotion detection', () => {
      const userInput = "I'm excited but also a bit nervous about this opportunity.";
      const context = createMockContext('neutral');

      const analysis = emotionalIntelligence.analyzeEmotionalState(userInput, context);

      expect(analysis.emotionalContext.primary).toBeDefined();
      expect(analysis.emotionalContext.secondary).toBeDefined();
      expect(analysis.emotionalContext.primary).not.toBe(analysis.emotionalContext.secondary);
    });
  });

  describe('Contextual Emotion Analysis', () => {
    it('should consider conversation history for emotion detection', () => {
      const contextWithHistory = {
        ...createMockContext('sad'),
        immediate: {
          ...createMockContext('sad').immediate,
          recentMessages: [
            createMockMessage("I lost my job yesterday.", 'sad'),
            createMockMessage("I'm worried about my future.", 'anxious')
          ]
        }
      };

      const userInput = "Things are looking up a bit.";
      const analysis = emotionalIntelligence.analyzeEmotionalState(userInput, contextWithHistory);

      expect(analysis.detectedEmotion).toBeDefined();
      expect(analysis.confidence).toBeGreaterThan(0);
    });

    it('should adapt to user emotional state from context', () => {
      const happyContext = createMockContext('happy');
      const sadContext = createMockContext('sad');

      const neutralInput = "How are you today?";

      const happyAnalysis = emotionalIntelligence.analyzeEmotionalState(neutralInput, happyContext);
      const sadAnalysis = emotionalIntelligence.analyzeEmotionalState(neutralInput, sadContext);

      // Should provide different responses based on context
      expect(happyAnalysis.suggestedResponse.tone).not.toBe(sadAnalysis.suggestedResponse.tone);
    });

    it('should handle missing context gracefully', () => {
      const incompleteContext = {
        ...createMockContext('neutral'),
        immediate: {
          ...createMockContext('neutral').immediate,
          recentMessages: []
        }
      };

      const userInput = "Hello there!";
      const analysis = emotionalIntelligence.analyzeEmotionalState(userInput, incompleteContext);

      expect(analysis.detectedEmotion).toBeDefined();
      expect(analysis.confidence).toBeGreaterThan(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle very long text input', () => {
      const longInput = "I'm happy! ".repeat(1000);
      const context = createMockContext('neutral');

      const analysis = emotionalIntelligence.analyzeEmotionalState(longInput, context);

      expect(analysis.detectedEmotion).toBeDefined();
      expect(analysis.confidence).toBeGreaterThan(0);
    });

    it('should handle special characters and emojis', () => {
      const userInput = "I'm 😊 happy!!! @#$%^&*()";
      const context = createMockContext('neutral');

      const analysis = emotionalIntelligence.analyzeEmotionalState(userInput, context);

      expect(analysis.detectedEmotion).toBeDefined();
      expect(analysis.confidence).toBeGreaterThan(0);
    });

    it('should handle non-English text gracefully', () => {
      const userInput = "Je suis heureux!";
      const context = createMockContext('neutral');

      const analysis = emotionalIntelligence.analyzeEmotionalState(userInput, context);

      expect(analysis.detectedEmotion).toBeDefined();
      expect(analysis.confidence).toBeGreaterThan(0);
    });

    it('should handle malformed context', () => {
      const malformedContext = {
        ...createMockContext('neutral'),
        session: undefined as any
      };

      const userInput = "Hello!";
      
      expect(() => {
        emotionalIntelligence.analyzeEmotionalState(userInput, malformedContext);
      }).not.toThrow();
    });

    it('should provide fallback responses for unknown emotions', () => {
      const userInput = "Blah blah blah random text xyz.";
      const context = createMockContext('neutral');

      const analysis = emotionalIntelligence.analyzeEmotionalState(userInput, context);

      expect(analysis.detectedEmotion).toBeDefined();
      expect(analysis.suggestedResponse.tone).toBeDefined();
      expect(analysis.suggestedResponse.adjustments).toBeDefined();
    });
  });

  describe('Integration with Context Manager', () => {
    it('should return analysis in expected format', () => {
      const userInput = "I'm feeling great today!";
      const context = createMockContext('neutral');

      const analysis = emotionalIntelligence.analyzeEmotionalState(userInput, context);

      // Verify analysis structure matches expected interface
      expect(analysis).toHaveProperty('detectedEmotion');
      expect(analysis).toHaveProperty('confidence');
      expect(analysis).toHaveProperty('suggestedResponse');
      expect(analysis).toHaveProperty('emotionalContext');

      expect(analysis.emotionalContext).toHaveProperty('primary');
      expect(analysis.emotionalContext).toHaveProperty('intensity');
      expect(analysis.emotionalContext).toHaveProperty('confidence');
      expect(analysis.emotionalContext).toHaveProperty('indicators');
      expect(analysis.emotionalContext).toHaveProperty('trend');

      expect(analysis.suggestedResponse).toHaveProperty('tone');
      expect(analysis.suggestedResponse).toHaveProperty('adjustments');
      expect(analysis.suggestedResponse).toHaveProperty('suggestedPhrases');
      expect(analysis.suggestedResponse).toHaveProperty('avoidPhrases');
    });

    it('should handle updateEmotionalPattern method', () => {
      const userId = 'test-user';
      const emotion = 'happy';
      const intensity = 0.8;

      expect(() => {
        emotionalIntelligence.updateEmotionalPattern(userId, emotion, intensity);
      }).not.toThrow();
    });

    it('should maintain consistent emotion detection across calls', () => {
      const userInput = "I'm absolutely thrilled about this!";
      const context = createMockContext('neutral');

      const analysis1 = emotionalIntelligence.analyzeEmotionalState(userInput, context);
      const analysis2 = emotionalIntelligence.analyzeEmotionalState(userInput, context);

      expect(analysis1.detectedEmotion).toBe(analysis2.detectedEmotion);
      expect(Math.abs(analysis1.confidence - analysis2.confidence)).toBeLessThan(0.1);
    });
  });

  describe('Performance and Scalability', () => {
    it('should process emotions quickly', () => {
      const userInput = "I'm happy about this development!";
      const context = createMockContext('neutral');

      const startTime = Date.now();
      const analysis = emotionalIntelligence.analyzeEmotionalState(userInput, context);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
      expect(analysis.detectedEmotion).toBeDefined();
    });

    it('should handle concurrent emotion analysis', async () => {
      const inputs = [
        "I'm happy!",
        "I'm sad.",
        "I'm excited!",
        "I'm worried.",
        "I'm confused."
      ];
      const context = createMockContext('neutral');

      const promises = inputs.map(input => 
        Promise.resolve(emotionalIntelligence.analyzeEmotionalState(input, context))
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.detectedEmotion).toBeDefined();
        expect(result.confidence).toBeGreaterThan(0);
      });
    });

    it('should maintain memory efficiency', () => {
      // Test multiple analyses don't cause memory leaks
      const context = createMockContext('neutral');
      
      for (let i = 0; i < 100; i++) {
        emotionalIntelligence.analyzeEmotionalState(`Test message ${i}`, context);
      }

      // Should not throw memory-related errors
      expect(() => {
        emotionalIntelligence.analyzeEmotionalState("Final test", context);
      }).not.toThrow();
    });
  });
}); 