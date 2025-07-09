import { vi } from 'vitest';
import type { ChatMessage } from '../types/common';
import type { Context, ContextAnalysis } from '../types/context';

/**
 * Test Builders for creating test data with fluent API
 */
export class ChatMessageBuilder {
  private message: Partial<ChatMessage> = {};

  withContent(content: string): this {
    this.message.content = content;
    return this;
  }

  withSender(sender: 'user' | 'assistant'): this {
    this.message.sender = sender;
    return this;
  }

  fromUser(): this {
    this.message.sender = 'user';
    return this;
  }

  fromAssistant(): this {
    this.message.sender = 'assistant';
    return this;
  }

  withTimestamp(timestamp: number): this {
    this.message.timestamp = timestamp;
    return this;
  }

  withId(id: string): this {
    this.message.id = id;
    return this;
  }

  asTyping(): this {
    this.message.isTyping = true;
    return this;
  }

  withError(): this {
    this.message.error = true;
    return this;
  }

  build(): ChatMessage {
    return {
      id: this.message.id || `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: this.message.content || 'Test message',
      timestamp: this.message.timestamp || Date.now(),
      sender: this.message.sender || 'user',
      isTyping: this.message.isTyping || false,
      error: this.message.error || false,
      ...this.message
    };
  }
}

/**
 * Factory for creating test contexts
 */
export class TestContextFactory {
  static createBasicContext(): Context {
    return {
      system: TestContextFactory.createSystemContext(),
      session: TestContextFactory.createSessionContext(),
      immediate: TestContextFactory.createImmediateContext(),
      timestamp: new Date().toISOString()
    };
  }

  static createSystemContext() {
    return {
      avatarPersonality: {
        traits: {
          empathy: 0.8,
          curiosity: 0.7,
          patience: 0.9,
          humor: 'gentle' as const,
          supportiveness: 0.8,
          formality: 0.3,
          enthusiasm: 0.6
        },
        communicationPatterns: {
          greeting: { tone: 'warm', approach: 'friendly', examples: [] },
          questioning: { tone: 'curious', approach: 'gentle', examples: [] },
          explaining: { tone: 'clear', approach: 'simple', examples: [] },
          encouraging: { tone: 'supportive', approach: 'positive', examples: [] },
          farewells: { tone: 'warm', approach: 'caring', examples: [] }
        },
        boundaries: {
          prohibitedTopics: [],
          maxMessageLength: 1000,
          responseGuidelines: []
        },
        responseStyles: {
          casual: { structure: 'casual', vocabulary: 'casual', examples: [] },
          professional: { structure: 'professional', vocabulary: 'professional', examples: [] },
          supportive: { structure: 'supportive', vocabulary: 'supportive', examples: [] },
          educational: { structure: 'educational', vocabulary: 'educational', examples: [] }
        }
      },
      conversationGuidelines: {
        maxContextWindow: 10,
        contextPriority: { immediate: 1.0, recent: 0.8, session: 0.6, historical: 0.3 },
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
    };
  }

  static createSessionContext() {
    return {
      sessionId: 'test-session-123',
      userProfile: {
        userId: 'test-user-456',
        interactionHistory: [],
        preferences: {
          preferredResponseLength: 'medium' as const,
          formalityLevel: 0.5,
          topicDepth: 'moderate' as const,
          explanationStyle: 'simple' as const
        },
        communicationStyle: {
          directness: 0.7,
          emotionalExpressiveness: 0.6,
          questioningStyle: 'exploratory' as const
        },
        topicInterests: ['technology', 'learning']
      },
      sessionObjectives: [],
      conversationThemes: [],
      startTime: new Date(),
      messageCount: 0
    };
  }

  static createImmediateContext() {
    return {
      recentMessages: [],
      currentUserEmotion: 'neutral' as const,
      conversationFlow: {
        currentPhase: 'greeting' as const,
        flowState: { momentum: 0.5, depth: 0.5, engagement: 0.5, clarity: 0.5 },
        transitionTriggers: []
      },
      activeTopics: [],
      environmentData: {
        timeOfDay: 'morning' as const,
        userTimezone: 'UTC',
        sessionDuration: 0,
        activeFeatures: [],
        deviceType: 'desktop' as const,
        networkQuality: 'good' as const
      }
    };
  }

  static createBasicAnalysis(): ContextAnalysis {
    return {
      emotionalTone: { primary: 'neutral', intensity: 0.5 },
      topics: ['general'],
      relevanceScore: 0.7,
      userIntentAnalysis: { primaryIntent: 'conversation' },
      responseRecommendations: []
    };
  }
}

/**
 * Helper functions for creating test data
 */
export const TestHelpers = {
  createMessageHistory: (count: number = 5): ChatMessage[] => {
    return Array.from({ length: count }, (_, i) => 
      new ChatMessageBuilder()
        .withContent(`Message ${i + 1}`)
        .withSender(i % 2 === 0 ? 'user' : 'assistant')
        .withTimestamp(Date.now() - (count - i) * 1000)
        .build()
    );
  },

  createTypingMessage: (): ChatMessage => {
    return new ChatMessageBuilder()
      .fromAssistant()
      .withContent('')
      .asTyping()
      .build();
  },

  createErrorMessage: (content: string = 'Error occurred'): ChatMessage => {
    return new ChatMessageBuilder()
      .fromAssistant()
      .withContent(content)
      .withError()
      .build();
  }
};

/**
 * Mock localStorage for testing
 */
export const createMockLocalStorage = () => {
  const storage = new Map<string, string>();
  
  return {
    getItem: vi.fn((key: string) => storage.get(key) || null),
    setItem: vi.fn((key: string, value: string) => {
      storage.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      storage.delete(key);
    }),
    clear: vi.fn(() => {
      storage.clear();
    }),
    key: vi.fn((index: number) => {
      const keys = Array.from(storage.keys());
      return keys[index] || null;
    }),
    get length() {
      return storage.size;
    }
  };
};

/**
 * Create mock services for testing
 */
export const createMockServices = () => {
  return {
    contextManager: {
      processMessage: vi.fn().mockResolvedValue(TestContextFactory.createBasicContext()),
      analyzeContext: vi.fn().mockReturnValue(TestContextFactory.createBasicAnalysis()),
      clearSession: vi.fn(),
      destroy: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      getCurrentSessionContext: vi.fn(),
      getContextStats: vi.fn(),
      updateUserProfile: vi.fn()
    },
    apiService: {
      sendChatMessage: vi.fn().mockResolvedValue({ response: 'Mock response' }),
      healthCheck: vi.fn().mockResolvedValue({ status: 'ok' })
    },
    voiceService: {
      isSupported: vi.fn().mockReturnValue(true),
      isEnabled: vi.fn().mockReturnValue(false),
      toggle: vi.fn(),
      speak: vi.fn(),
      stop: vi.fn()
    }
  };
}; 