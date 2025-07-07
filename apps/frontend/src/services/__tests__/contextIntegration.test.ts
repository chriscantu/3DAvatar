import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the services for integration testing
vi.mock('../contextCache', () => ({
  LRUContextCache: vi.fn().mockImplementation(() => ({
    set: vi.fn(),
    get: vi.fn().mockReturnValue(null),
    has: vi.fn().mockReturnValue(false),
    delete: vi.fn(),
    clear: vi.fn(),
    getStats: vi.fn().mockReturnValue({
      size: 0,
      maxSize: 100,
      hitRate: 0,
      totalAccess: 0,
      expiredCount: 0,
      memoryUsage: 0
    }),
    destroy: vi.fn(),
    on: vi.fn(),
    off: vi.fn()
  })),
  createContextCache: vi.fn(),
  CacheKeyGenerator: {
    forSession: vi.fn().mockReturnValue('test-session-key'),
    forConversationContext: vi.fn().mockReturnValue('test-conversation-key'),
    forUserProfile: vi.fn().mockReturnValue('test-profile-key')
  }
}));

vi.mock('../memorySystem', () => ({
  AvatarMemorySystem: vi.fn().mockImplementation(() => ({
    processMessage: vi.fn(),
    getRelevantMemories: vi.fn().mockReturnValue({
      recentMessages: [],
      significantInteractions: [],
      learnedPreferences: [],
      relevanceScore: 0.5
    }),
    updateRelationshipProgress: vi.fn(),
    getMemoryStats: vi.fn().mockReturnValue({
      shortTerm: { messageCount: 0, contextCount: 0, capacity: 50, utilizationRate: 0, oldestMessageAge: 0 },
      longTerm: { interactionCount: 0, preferenceCount: 0, relationshipLevel: 0, capacity: 1000, averageInteractionImpact: 0 },
      working: { activeProcessCount: 0, temporaryDataSize: 0, hasCurrentContext: false, capacity: 20 },
      memoryLimits: { shortTerm: 50, longTerm: 1000, workingMemory: 20 },
      totalMemoryUsage: 0
    }),
    clearMemories: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    shortTermMemory: {
      addMessage: vi.fn(),
      getRecentMessages: vi.fn().mockReturnValue([]),
      clear: vi.fn(),
      getStats: vi.fn()
    },
    longTermMemory: {
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
      }
    }
  })),
  createMemorySystem: vi.fn()
}));

import { ContextManager } from '../contextManager';
import { createContextCache } from '../contextCache';
import { createMemorySystem } from '../memorySystem';
import type { ChatMessage } from '../../types/common';

describe('Context Management Integration', () => {
  let contextManager: ContextManager;

  const createTestMessage = (content: string, sender: 'user' | 'assistant' = 'user'): ChatMessage => ({
    id: `msg-${Date.now()}-${Math.random()}`,
    content,
    sender,
    timestamp: Date.now()
  });

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up the mocked creation functions to return proper mocks
    const mockCache = {
      set: vi.fn(),
      get: vi.fn().mockReturnValue(null),
      has: vi.fn().mockReturnValue(false),
      delete: vi.fn(),
      clear: vi.fn(),
      getStats: vi.fn().mockReturnValue({
        size: 0,
        maxSize: 100,
        hitRate: 0,
        totalAccess: 0,
        expiredCount: 0,
        memoryUsage: 0
      }),
      destroy: vi.fn(),
      on: vi.fn(),
      off: vi.fn()
    };

    const mockMemorySystem = {
      processMessage: vi.fn(),
      getRelevantMemories: vi.fn().mockReturnValue({
        recentMessages: [],
        significantInteractions: [],
        learnedPreferences: [],
        relevanceScore: 0.5
      }),
      updateRelationshipProgress: vi.fn(),
      getMemoryStats: vi.fn().mockReturnValue({
        shortTerm: { messageCount: 0, contextCount: 0, capacity: 50, utilizationRate: 0, oldestMessageAge: 0 },
        longTerm: { interactionCount: 0, preferenceCount: 0, relationshipLevel: 0, capacity: 1000, averageInteractionImpact: 0 },
        working: { activeProcessCount: 0, temporaryDataSize: 0, hasCurrentContext: false, capacity: 20 },
        memoryLimits: { shortTerm: 50, longTerm: 1000, workingMemory: 20 },
        totalMemoryUsage: 0
      }),
      clearMemories: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      shortTermMemory: {
        addMessage: vi.fn(),
        getRecentMessages: vi.fn().mockReturnValue([]),
        clear: vi.fn(),
        getStats: vi.fn()
      },
      longTermMemory: {
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
        significantInteractions: []
      }
    };

    // Mock the creation functions to return our mocks
    vi.mocked(createContextCache).mockReturnValue(mockCache as any);
    vi.mocked(createMemorySystem).mockReturnValue(mockMemorySystem as any);
    
    contextManager = new ContextManager();
  });

  afterEach(() => {
    contextManager.destroy();
  });

  describe('End-to-End Context Processing', () => {
    it('should process user message and build context', async () => {
      const userMessage = createTestMessage('Hello! I am interested in learning about artificial intelligence.');

      const context = await contextManager.processMessage(userMessage);

      expect(context).toBeDefined();
      expect(context.system).toBeDefined();
      expect(context.session).toBeDefined();
      expect(context.immediate).toBeDefined();
      expect(context.timestamp).toBeDefined();
    });

    it('should analyze context and provide insights', async () => {
      const userMessage = createTestMessage('I am really excited about machine learning and want to build my first neural network!');

      const context = await contextManager.processMessage(userMessage);
      const analysis = contextManager.analyzeContext(context);

      expect(analysis).toBeDefined();
      expect(analysis.relevanceScore).toBeGreaterThanOrEqual(0);
      expect(analysis.relevanceScore).toBeLessThanOrEqual(1);
      expect(analysis.emotionalTone).toBeDefined();
      expect(analysis.topicClassification).toBeDefined();
      expect(analysis.userIntentAnalysis).toBeDefined();
    });

    it('should maintain conversation continuity across messages', async () => {
      const messages = [
        createTestMessage('Hi, I want to learn programming'),
        createTestMessage('Specifically Python programming'),
        createTestMessage('Can you help me understand variables?')
      ];

      const contexts = [];
      for (const message of messages) {
        const context = await contextManager.processMessage(message);
        contexts.push(context);
      }

      expect(contexts.length).toBe(3);
      
      // Each context should be valid
      contexts.forEach(context => {
        expect(context).toBeDefined();
        expect(context.session.sessionId).toBeDefined();
      });

      // Session should be consistent across messages
      const sessionIds = contexts.map(ctx => ctx.session.sessionId);
      expect(new Set(sessionIds).size).toBe(1); // All should have the same session ID
    });
  });

  describe('Context Retrieval and Caching', () => {
    it('should retrieve context for response generation', async () => {
      const query = 'Tell me about machine learning algorithms';
      
      const context = await contextManager.getContextForResponse(query);

      expect(context).toBeDefined();
      expect(context.system).toBeDefined();
      expect(context.session).toBeDefined();
      expect(context.immediate).toBeDefined();
    });

    it('should handle context retrieval with empty cache', async () => {
      const query = 'What is artificial intelligence?';
      
      // Should build new context when cache is empty
      const context = await contextManager.getContextForResponse(query);

      expect(context).toBeDefined();
    });
  });

  describe('Session Management', () => {
    it('should maintain session context across interactions', () => {
      const sessionContext = contextManager.getCurrentSessionContext();

      expect(sessionContext).toBeDefined();
      expect(sessionContext.sessionId).toBeDefined();
      expect(sessionContext.userProfile).toBeDefined();
      expect(typeof sessionContext.messageCount).toBe('number');
    });

    it('should provide session statistics', () => {
      const stats = contextManager.getContextStats();

      expect(stats).toBeDefined();
      expect(stats.session).toBeDefined();
      expect(stats.memory).toBeDefined();
      expect(stats.cache).toBeDefined();
      expect(stats.performance).toBeDefined();
    });

    it('should clear session while preserving user profile by default', () => {
      const initialSession = contextManager.getCurrentSessionContext();
      const initialSessionId = initialSession.sessionId;

      contextManager.clearSession();

      const newSession = contextManager.getCurrentSessionContext();
      expect(newSession.sessionId).not.toBe(initialSessionId);
      expect(newSession.userProfile).toBeDefined();
    });
  });
}); 