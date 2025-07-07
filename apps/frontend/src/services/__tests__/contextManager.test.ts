import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ContextManager } from '../contextManager';
import { LRUContextCache, createContextCache } from '../contextCache';
import { AvatarMemorySystem, createMemorySystem } from '../memorySystem';
import { AVATAR_PERSONALITY_CONFIG } from '../../config/avatarPersonality';
import type { ChatMessage } from '../../types/common';
import type { Context, UserProfile, ContextAnalysis } from '../../types/context';

// Mock dependencies
vi.mock('../contextCache', () => ({
  LRUContextCache: vi.fn(),
  CacheKeyGenerator: {
    forConversationContext: vi.fn().mockReturnValue('test-cache-key'),
    forSession: vi.fn().mockReturnValue('test-session-key'),
    forUser: vi.fn().mockReturnValue('test-user-key')
  },
  createContextCache: vi.fn()
}));
vi.mock('../memorySystem', () => ({
  AvatarMemorySystem: vi.fn(),
  createMemorySystem: vi.fn()
}));

describe('ContextManager', () => {
  let contextManager: ContextManager;
  let mockCache: vi.Mocked<LRUContextCache>;
  let mockMemorySystem: vi.Mocked<AvatarMemorySystem>;

  const mockChatMessage: ChatMessage = {
    id: 'msg-1',
    content: 'Hello, how are you?',
    sender: 'user',
    timestamp: Date.now()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock LRUContextCache
    mockCache = {
      set: vi.fn(),
      get: vi.fn(),
      has: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
      getStats: vi.fn(),
      keys: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      destroy: vi.fn(),
      updateConfig: vi.fn()
    } as unknown as vi.Mocked<LRUContextCache>;

    // Mock AvatarMemorySystem
    mockMemorySystem = {
      processMessage: vi.fn(),
      getRelevantMemories: vi.fn().mockReturnValue({
        recentMessages: [],
        significantInteractions: [],
        learnedPreferences: [],
        relevanceScore: 0.5
      }),
      updateRelationshipProgress: vi.fn(),
      getMemoryStats: vi.fn(),
      clearMemories: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      shortTermMemory: {
        addMessage: vi.fn(),
        getRecentMessages: vi.fn(),
        addContext: vi.fn(),
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
        significantInteractions: [],
        storeSignificantInteraction: vi.fn(),
        searchSignificantInteractions: vi.fn(),
        updatePreference: vi.fn(),
        getRelevantPreferences: vi.fn(),
        updateRelationshipProgress: vi.fn(),
        clear: vi.fn(),
        getStats: vi.fn()
      },
      workingMemory: {
        currentContext: {} as Context,
        activeProcesses: [],
        temporaryData: {},
        updateContext: vi.fn(),
        addProcess: vi.fn(),
        updateProcess: vi.fn(),
        getProcess: vi.fn(),
        removeProcess: vi.fn(),
        setTemporaryData: vi.fn(),
        getTemporaryData: vi.fn(),
        clearTemporaryData: vi.fn(),
        clear: vi.fn(),
        getStats: vi.fn()
      }
    } as unknown as vi.Mocked<AvatarMemorySystem>;

    // Mock the creation functions to return our mocks
    (createContextCache as any).mockReturnValue(mockCache);
    (createMemorySystem as any).mockReturnValue(mockMemorySystem);

    // Create ContextManager instance - now it will use our mocks
    contextManager = new ContextManager();
  });

  afterEach(() => {
    contextManager.destroy();
  });

  describe('Message Processing', () => {
    it('should process messages correctly', async () => {
      const mockContext: Context = {
        system: {
          avatarPersonality: AVATAR_PERSONALITY_CONFIG.personality,
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
          userProfile: mockMemorySystem.longTermMemory.userProfile,
          sessionObjectives: [],
          conversationThemes: [],
          startTime: new Date(),
          messageCount: 1
        },
        immediate: {
          recentMessages: [mockChatMessage],
          currentUserEmotion: 'neutral',
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
      };

      // Mock the buildContext method to return our mock context
      vi.spyOn(contextManager as any, 'buildContext').mockResolvedValue(mockContext);

      const result = await contextManager.processMessage(mockChatMessage);

      expect(result).toEqual(mockContext);
      expect(mockMemorySystem.processMessage).toHaveBeenCalledWith(mockChatMessage, mockContext);
      expect(mockCache.set).toHaveBeenCalled();
    });

    it('should handle processing errors gracefully', async () => {
      mockMemorySystem.processMessage.mockImplementation(() => {
        throw new Error('Memory processing failed');
      });

      // Should not throw error, should handle gracefully
      await expect(contextManager.processMessage(mockChatMessage)).resolves.toBeDefined();
    });
  });

  describe('Context Retrieval', () => {
    it('should retrieve context from cache when available', async () => {
      const mockContext: Context = {
        system: {
          avatarPersonality: AVATAR_PERSONALITY_CONFIG.personality,
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
          userProfile: mockMemorySystem.longTermMemory.userProfile,
          sessionObjectives: [],
          conversationThemes: [],
          startTime: new Date(),
          messageCount: 1
        },
        immediate: {
          recentMessages: [mockChatMessage],
          currentUserEmotion: 'neutral',
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
      };

      mockCache.get.mockReturnValue(mockContext);

      const result = await contextManager.getContextForResponse('test query');

      expect(result).toEqual(mockContext);
      expect(mockCache.get).toHaveBeenCalled();
    });

    it('should build new context when cache miss', async () => {
      mockCache.get.mockReturnValue(null);
      
      const mockContext: Context = {
        system: {
          avatarPersonality: AVATAR_PERSONALITY_CONFIG.personality,
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
          userProfile: mockMemorySystem.longTermMemory.userProfile,
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
            flowState: {
              momentum: 0.5,
              depth: 0.3,
              engagement: 0.7,
              clarity: 0.8
            },
            transitionTriggers: []
          },
          activeTopics: [],
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

      // Mock buildContextFromMemory
      vi.spyOn(contextManager as any, 'buildContextFromMemory').mockResolvedValue(mockContext);

      const result = await contextManager.getContextForResponse('test query');

      expect(result).toEqual(mockContext);
      expect(mockCache.set).toHaveBeenCalled();
    });
  });

  describe('Context Analysis', () => {
    it('should analyze context and return analysis', () => {
      const mockContext: Context = {
        system: {
          avatarPersonality: AVATAR_PERSONALITY_CONFIG.personality,
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
          userProfile: mockMemorySystem.longTermMemory.userProfile,
          sessionObjectives: [],
          conversationThemes: [],
          startTime: new Date(),
          messageCount: 1
        },
        immediate: {
          recentMessages: [mockChatMessage],
          currentUserEmotion: 'happy',
          conversationFlow: {
            currentPhase: 'greeting',
            flowState: {
              momentum: 0.7,
              depth: 0.4,
              engagement: 0.8,
              clarity: 0.9
            },
            transitionTriggers: []
          },
          activeTopics: ['greeting', 'wellbeing'],
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

      const analysis = contextManager.analyzeContext(mockContext);

      expect(analysis).toBeDefined();
      expect(analysis.relevanceScore).toBeGreaterThanOrEqual(0);
      expect(analysis.relevanceScore).toBeLessThanOrEqual(1);
      expect(analysis.emotionalTone).toBeDefined();
      expect(analysis.topicClassification).toBeDefined();
      expect(analysis.userIntentAnalysis).toBeDefined();
      expect(analysis.responseRecommendations).toBeDefined();
    });
  });

  describe('User Profile Management', () => {
    it('should update user profile', () => {
      const updates: Partial<UserProfile> = {
        preferences: {
          preferredResponseLength: 'short',
          formalityLevel: 0.3,
          topicDepth: 'surface',
          explanationStyle: 'simple'
        }
      };

      contextManager.updateUserProfile(updates);

      expect(mockMemorySystem.longTermMemory.userProfile.preferences).toEqual(updates.preferences);
    });
  });

  describe('Session Management', () => {
    it('should get current session context', () => {
      mockMemorySystem.getMemoryStats.mockReturnValue({
        shortTerm: {
          messageCount: 5,
          contextCount: 3,
          capacity: 50,
          utilizationRate: 0.1,
          oldestMessageAge: 300
        },
        longTerm: {
          interactionCount: 10,
          preferenceCount: 3,
          relationshipLevel: 0.4,
          capacity: 1000,
          averageInteractionImpact: 0.6
        },
        working: {
          activeProcessCount: 2,
          temporaryDataSize: 1024,
          hasCurrentContext: true,
          capacity: 20
        },
        memoryLimits: {
          shortTerm: 50,
          longTerm: 1000,
          workingMemory: 20
        },
        totalMemoryUsage: 2048
      });

      const sessionContext = contextManager.getCurrentSessionContext();

      expect(sessionContext).toBeDefined();
      expect(sessionContext.sessionId).toBeDefined();
      expect(sessionContext.userProfile).toBeDefined();
      expect(sessionContext.messageCount).toBe(5);
    });

    it('should clear session data', () => {
      contextManager.clearSession();

      expect(mockMemorySystem.clearMemories).toHaveBeenCalledWith(true);
      expect(mockCache.clear).toHaveBeenCalled();
    });

    it('should clear session data without preserving user profile', () => {
      contextManager.clearSession(false);

      expect(mockMemorySystem.clearMemories).toHaveBeenCalledWith(false);
      expect(mockCache.clear).toHaveBeenCalled();
    });
  });

  describe('Statistics and Monitoring', () => {
    it('should return context statistics', () => {
      mockMemorySystem.getMemoryStats.mockReturnValue({
        shortTerm: {
          messageCount: 5,
          contextCount: 3,
          capacity: 50,
          utilizationRate: 0.1,
          oldestMessageAge: 300
        },
        longTerm: {
          interactionCount: 10,
          preferenceCount: 3,
          relationshipLevel: 0.4,
          capacity: 1000,
          averageInteractionImpact: 0.6
        },
        working: {
          activeProcessCount: 2,
          temporaryDataSize: 1024,
          hasCurrentContext: true,
          capacity: 20
        },
        memoryLimits: {
          shortTerm: 50,
          longTerm: 1000,
          workingMemory: 20
        },
        totalMemoryUsage: 2048
      });

      mockCache.getStats.mockReturnValue({
        size: 10,
        maxSize: 100,
        hitRate: 0.8,
        totalAccess: 50,
        expiredCount: 5,
        memoryUsage: 1024
      });

      const stats = contextManager.getContextStats();

      expect(stats).toBeDefined();
      expect(stats.session.sessionId).toBeDefined();
      expect(stats.session.messageCount).toBe(5);
      expect(stats.session.cacheHitRate).toBe(0.8);
      expect(stats.memory).toBeDefined();
      expect(stats.cache).toBeDefined();
    });
  });

  describe('Event System', () => {
    it('should register and trigger events', () => {
      const mockListener = vi.fn();
      contextManager.on('context_updated', mockListener);

      // Process a message to trigger an event
      const mockContext: Context = {
        system: {
          avatarPersonality: AVATAR_PERSONALITY_CONFIG.personality,
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
          userProfile: mockMemorySystem.longTermMemory.userProfile,
          sessionObjectives: [],
          conversationThemes: [],
          startTime: new Date(),
          messageCount: 1
        },
        immediate: {
          recentMessages: [mockChatMessage],
          currentUserEmotion: 'neutral',
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
      };

      contextManager.analyzeContext(mockContext);

      expect(mockListener).toHaveBeenCalled();
    });

    it('should remove event listeners', () => {
      const mockListener = vi.fn();
      contextManager.on('context_updated', mockListener);
      contextManager.off('context_updated', mockListener);

      // Process a message to trigger an event
      const mockContext: Context = {
        system: {
          avatarPersonality: AVATAR_PERSONALITY_CONFIG.personality,
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
          userProfile: mockMemorySystem.longTermMemory.userProfile,
          sessionObjectives: [],
          conversationThemes: [],
          startTime: new Date(),
          messageCount: 1
        },
        immediate: {
          recentMessages: [mockChatMessage],
          currentUserEmotion: 'neutral',
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
      };

      contextManager.analyzeContext(mockContext);

      expect(mockListener).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle cache errors gracefully', async () => {
      mockCache.get.mockImplementation(() => {
        throw new Error('Cache error');
      });

      // Should not throw error
      await expect(contextManager.getContextForResponse('test')).resolves.toBeDefined();
    });

    it('should handle memory system errors gracefully', async () => {
      mockMemorySystem.processMessage.mockImplementation(() => {
        throw new Error('Memory error');
      });

      // Should not throw error
      await expect(contextManager.processMessage(mockChatMessage)).resolves.toBeDefined();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources properly', () => {
      contextManager.destroy();

      expect(mockCache.destroy).toHaveBeenCalled();
    });
  });
}); 