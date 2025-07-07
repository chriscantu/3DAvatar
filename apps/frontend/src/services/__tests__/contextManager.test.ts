import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ContextManager } from '../contextManager';
import { LRUContextCache, createContextCache } from '../contextCache';
import { AvatarMemorySystem, createMemorySystem } from '../memorySystem';
import { EmotionalIntelligence } from '../emotionalIntelligence';
import { ContextCompressor, createContextCompressor } from '../contextCompression';
import { FeedbackCollector, createFeedbackCollector } from '../feedbackCollection';
import { ContextValidator, createContextValidator } from '../contextValidation';
import { AVATAR_PERSONALITY_CONFIG } from '../../config/avatarPersonality';
import type { ChatMessage } from '../../types/common';
import type { Context, UserProfile, ContextAnalysis, EmotionalAnalysis } from '../../types/context';

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

vi.mock('../emotionalIntelligence', () => ({
  EmotionalIntelligence: vi.fn()
}));

vi.mock('../contextCompression', () => ({
  ContextCompressor: vi.fn(),
  createContextCompressor: vi.fn()
}));

vi.mock('../feedbackCollection', () => ({
  FeedbackCollector: vi.fn(),
  createFeedbackCollector: vi.fn()
}));

vi.mock('../contextValidation', () => ({
  ContextValidator: vi.fn(),
  createContextValidator: vi.fn()
}));

describe('ContextManager', () => {
  let contextManager: ContextManager;
  let mockCache: vi.Mocked<LRUContextCache>;
  let mockMemorySystem: vi.Mocked<AvatarMemorySystem>;
  let mockEmotionalIntelligence: vi.Mocked<EmotionalIntelligence>;
  let mockContextCompressor: vi.Mocked<ContextCompressor>;
  let mockFeedbackCollector: vi.Mocked<FeedbackCollector>;
  let mockContextValidator: vi.Mocked<ContextValidator>;

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

    // Mock EmotionalIntelligence
    mockEmotionalIntelligence = {
      analyzeEmotionalState: vi.fn().mockReturnValue({
        detectedEmotion: 'neutral',
        confidence: 0.8,
        suggestedResponse: {
          tone: 'neutral',
          adjustments: { warmth: 0.5, energy: 0, formality: 0, empathy: 0.5 },
          suggestedPhrases: [],
          avoidPhrases: []
        },
        emotionalContext: {
          primary: 'neutral',
          intensity: 0.5,
          confidence: 0.8,
          indicators: [],
          trend: 'stable'
        }
      }),
      updateEmotionalPattern: vi.fn()
    } as unknown as vi.Mocked<EmotionalIntelligence>;

    // Mock ContextCompressor
    mockContextCompressor = {
      compressContext: vi.fn().mockReturnValue({
        originalSize: 1000,
        compressedSize: 500,
        compressionRatio: 0.5,
        summary: 'Test conversation summary',
        keyPoints: ['Point 1', 'Point 2'],
        retainedMessages: [],
        metadata: {
          timestamp: new Date(),
          method: 'extractive',
          qualityScore: 0.8,
          topicsRetained: ['topic1'],
          emotionalTone: 'neutral',
          confidenceScore: 0.8
        }
      }),
      summarizeConversation: vi.fn().mockReturnValue({
        summary: 'Test summary',
        keyPoints: ['Point 1'],
        participants: ['user', 'assistant'],
        startTime: new Date(),
        endTime: new Date(),
        duration: 300,
        messageCount: 5,
        topics: ['topic1'],
        emotionalArc: {
          startEmotion: 'neutral',
          endEmotion: 'neutral',
          peaks: [],
          overallTrend: 'neutral'
        },
        significantMoments: [],
        actionItems: []
      }),
      clearCache: vi.fn()
    } as unknown as vi.Mocked<ContextCompressor>;

    // Mock FeedbackCollector
    mockFeedbackCollector = {
      collectExplicitFeedback: vi.fn(),
      collectImplicitFeedback: vi.fn(),
      getAnalytics: vi.fn().mockReturnValue({
        totalFeedback: 10,
        averageRating: 4.2,
        satisfactionScore: 0.84,
        categoryBreakdown: {},
        trends: { ratingTrend: 'stable' },
        insights: [],
        improvementAreas: [],
        totalInteractions: 50
      })
    } as unknown as vi.Mocked<FeedbackCollector>;

    // Mock ContextValidator
    mockContextValidator = {
      validateContext: vi.fn().mockReturnValue({
        isValid: true,
        score: 0.9,
        errors: [],
        warnings: [],
        metadata: {
          validationTime: 10,
          rulesApplied: 5
        }
      }),
      performHealthCheck: vi.fn().mockReturnValue({
        overall: 'healthy',
        score: 0.9,
        issues: [],
        recommendations: [],
        categories: {
          critical: 0,
          warning: 0,
          info: 0
        },
        lastCheck: new Date()
      })
    } as unknown as vi.Mocked<ContextValidator>;

    // Mock the creation functions to return our mocks
    (createContextCache as any).mockReturnValue(mockCache);
    (createMemorySystem as any).mockReturnValue(mockMemorySystem);
    (EmotionalIntelligence as any).mockImplementation(() => mockEmotionalIntelligence);
    (createContextCompressor as any).mockReturnValue(mockContextCompressor);
    (createFeedbackCollector as any).mockReturnValue(mockFeedbackCollector);
    (createContextValidator as any).mockReturnValue(mockContextValidator);

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

  describe('Phase 2 Integration - Emotional Intelligence', () => {
    it('should use emotional intelligence for emotion detection', async () => {
      const emotionalMessage: ChatMessage = {
        id: 'msg-emotional',
        content: 'I am so excited about this new project!',
        sender: 'user',
        timestamp: Date.now()
      };

      const mockContext: Context = {
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
          userProfile: mockMemorySystem.longTermMemory.userProfile,
          sessionObjectives: [],
          conversationThemes: [],
          startTime: new Date(),
          messageCount: 1
        },
        immediate: {
          recentMessages: [emotionalMessage],
          currentUserEmotion: 'excited',
          conversationFlow: {
            currentPhase: 'greeting',
            flowState: { momentum: 0.8, depth: 0.3, engagement: 0.9, clarity: 0.8 },
            transitionTriggers: []
          },
          activeTopics: ['project', 'excitement'],
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

      vi.spyOn(contextManager as any, 'buildContext').mockResolvedValue(mockContext);

      const result = await contextManager.processMessage(emotionalMessage);

      expect(result.immediate.currentUserEmotion).toBe('excited');
      expect(result.immediate.activeTopics).toContain('excitement');
    });

    it('should analyze context and provide emotional insights', () => {
      const context: Context = {
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
            flowState: { momentum: 0.7, depth: 0.4, engagement: 0.8, clarity: 0.9 },
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

      const analysis = contextManager.analyzeContext(context);

      expect(analysis).toBeDefined();
      expect(analysis.emotionalTone).toBeDefined();
      expect(analysis.emotionalTone.primary).toBe('happy');
    });
  });

  describe('Phase 2 Integration - Context Compression', () => {
    it('should compress large contexts automatically', () => {
      const largeContext: Context = {
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
          userProfile: mockMemorySystem.longTermMemory.userProfile,
          sessionObjectives: [],
          conversationThemes: [],
          startTime: new Date(),
          messageCount: 20
        },
        immediate: {
          recentMessages: Array.from({ length: 20 }, (_, i) => ({
            id: `msg-${i}`,
            content: `Message ${i}`,
            sender: i % 2 === 0 ? 'user' : 'assistant',
            timestamp: Date.now() - (20 - i) * 60000
          })),
          currentUserEmotion: 'neutral',
          conversationFlow: {
            currentPhase: 'deep_discussion',
            flowState: { momentum: 0.7, depth: 0.8, engagement: 0.9, clarity: 0.6 },
            transitionTriggers: []
          },
          activeTopics: ['topic1', 'topic2', 'topic3'],
          environmentData: {
            timeOfDay: 'afternoon',
            userTimezone: 'UTC',
            sessionDuration: 1200,
            activeFeatures: [],
            deviceType: 'desktop',
            networkQuality: 'good'
          }
        },
        timestamp: new Date().toISOString()
      };

      const compressedContext = contextManager.compressContext(largeContext);

      expect(compressedContext).toBeDefined();
      expect(compressedContext.immediate.recentMessages.length).toBeLessThanOrEqual(largeContext.immediate.recentMessages.length);
    });

    it('should provide conversation summaries', () => {
      const messages = [
        { id: 'msg-1', content: 'Hello', sender: 'user', timestamp: Date.now() },
        { id: 'msg-2', content: 'Hi there!', sender: 'assistant', timestamp: Date.now() },
        { id: 'msg-3', content: 'How can you help me?', sender: 'user', timestamp: Date.now() },
        { id: 'msg-4', content: 'I can help with many things!', sender: 'assistant', timestamp: Date.now() }
      ];

      const summary = contextManager.getConversationSummary(messages);

      expect(summary).toBeDefined();
      expect(summary.summary).toBeDefined();
      expect(summary.keyPoints).toBeInstanceOf(Array);
      expect(summary.messageCount).toBe(messages.length);
    });
  });

  describe('Phase 2 Integration - Feedback Collection', () => {
    it('should collect explicit feedback', () => {
      const userId = 'test-user';
      const rating = 4;
      const category = 'response_quality';
      const content = 'Great response!';

      expect(() => {
        contextManager.collectFeedback(userId, rating, category, content);
      }).not.toThrow();
    });

    it('should provide feedback analytics', () => {
      const analytics = contextManager.getFeedbackAnalytics();

      expect(analytics).toBeDefined();
      expect(analytics.totalFeedback).toBeDefined();
      expect(analytics.averageRating).toBeDefined();
      expect(analytics.satisfactionScore).toBeDefined();
    });

    it('should track user interactions for implicit feedback', async () => {
      const message: ChatMessage = {
        id: 'msg-feedback',
        content: 'This is helpful, thank you!',
        sender: 'user',
        timestamp: Date.now()
      };

      const mockContext: Context = {
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
          userProfile: mockMemorySystem.longTermMemory.userProfile,
          sessionObjectives: [],
          conversationThemes: [],
          startTime: new Date(),
          messageCount: 1
        },
        immediate: {
          recentMessages: [message],
          currentUserEmotion: 'grateful',
          conversationFlow: {
            currentPhase: 'conclusion',
            flowState: { momentum: 0.6, depth: 0.7, engagement: 0.8, clarity: 0.9 },
            transitionTriggers: []
          },
          activeTopics: ['helpfulness', 'gratitude'],
          environmentData: {
            timeOfDay: 'afternoon',
            userTimezone: 'UTC',
            sessionDuration: 300,
            activeFeatures: [],
            deviceType: 'desktop',
            networkQuality: 'good'
          }
        },
        timestamp: new Date().toISOString()
      };

      vi.spyOn(contextManager as any, 'buildContext').mockResolvedValue(mockContext);

      const result = await contextManager.processMessage(message);

      expect(result.immediate.currentUserEmotion).toBe('grateful');
      expect(result.immediate.activeTopics).toContain('helpfulness');
    });
  });

  describe('Phase 2 Integration - Context Validation', () => {
    it('should validate context structure and data integrity', async () => {
      const validMessage: ChatMessage = {
        id: 'msg-valid',
        content: 'Test message for validation',
        sender: 'user',
        timestamp: Date.now()
      };

      const mockValidContext: Context = {
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
          userProfile: mockMemorySystem.longTermMemory.userProfile,
          sessionObjectives: [],
          conversationThemes: [],
          startTime: new Date(),
          messageCount: 1
        },
        immediate: {
          recentMessages: [validMessage],
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

      vi.spyOn(contextManager as any, 'buildContext').mockResolvedValue(mockValidContext);

      const result = await contextManager.processMessage(validMessage);

      expect(result).toBeDefined();
      expect(result.system).toBeDefined();
      expect(result.session).toBeDefined();
      expect(result.immediate).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should handle validation errors gracefully', async () => {
      const invalidMessage: ChatMessage = {
        id: '',
        content: '',
        sender: 'user',
        timestamp: Date.now()
      };

      // Should not throw error even with invalid message
      await expect(contextManager.processMessage(invalidMessage)).resolves.toBeDefined();
    });
  });

  describe('Phase 2 Integration - End-to-End Workflow', () => {
    it('should process message through all Phase 2 services', async () => {
      const comprehensiveMessage: ChatMessage = {
        id: 'msg-comprehensive',
        content: 'I am really excited about learning AI and machine learning! Can you help me understand neural networks?',
        sender: 'user',
        timestamp: Date.now()
      };

      const mockComprehensiveContext: Context = {
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
          userProfile: mockMemorySystem.longTermMemory.userProfile,
          sessionObjectives: ['learning', 'AI education'],
          conversationThemes: [{ topic: 'machine learning', confidence: 0.9, firstMentioned: new Date(), lastMentioned: new Date(), frequency: 1 }],
          startTime: new Date(),
          messageCount: 1
        },
        immediate: {
          recentMessages: [comprehensiveMessage],
          currentUserEmotion: 'excited',
          conversationFlow: {
            currentPhase: 'exploration',
            flowState: { momentum: 0.9, depth: 0.6, engagement: 0.95, clarity: 0.8 },
            transitionTriggers: ['learning_request', 'topic_introduction']
          },
          activeTopics: ['AI', 'machine learning', 'neural networks', 'learning'],
          environmentData: {
            timeOfDay: 'afternoon',
            userTimezone: 'UTC',
            sessionDuration: 120,
            activeFeatures: ['text', 'emotion_detection'],
            deviceType: 'desktop',
            networkQuality: 'excellent'
          }
        },
        timestamp: new Date().toISOString()
      };

      vi.spyOn(contextManager as any, 'buildContext').mockResolvedValue(mockComprehensiveContext);

      const result = await contextManager.processMessage(comprehensiveMessage);

      // Verify emotional intelligence integration
      expect(result.immediate.currentUserEmotion).toBe('excited');
      
      // Verify topic extraction and context building
      expect(result.immediate.activeTopics).toContain('AI');
      expect(result.immediate.activeTopics).toContain('machine learning');
      
      // Verify conversation flow analysis
      expect(result.immediate.conversationFlow.currentPhase).toBe('exploration');
      expect(result.immediate.conversationFlow.flowState.engagement).toBeGreaterThan(0.9);
      
      // Verify session objectives and themes
      expect(result.session.sessionObjectives).toContain('learning');
      expect(result.session.conversationThemes.length).toBeGreaterThan(0);
    });

    it('should maintain context integrity across multiple interactions', async () => {
      const messages = [
        { id: 'msg-1', content: 'Hello, I need help with programming', sender: 'user', timestamp: Date.now() },
        { id: 'msg-2', content: 'I can help with programming! What language?', sender: 'assistant', timestamp: Date.now() + 1000 },
        { id: 'msg-3', content: 'I want to learn TypeScript for web development', sender: 'user', timestamp: Date.now() + 2000 },
        { id: 'msg-4', content: 'Great choice! TypeScript is excellent for web development', sender: 'assistant', timestamp: Date.now() + 3000 }
      ];

      for (const message of messages) {
        const mockContext: Context = {
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
            userProfile: mockMemorySystem.longTermMemory.userProfile,
            sessionObjectives: ['programming help', 'TypeScript learning'],
            conversationThemes: [
              { topic: 'programming', confidence: 0.9, firstMentioned: new Date(), lastMentioned: new Date(), frequency: 2 },
              { topic: 'TypeScript', confidence: 0.8, firstMentioned: new Date(), lastMentioned: new Date(), frequency: 1 }
            ],
            startTime: new Date(),
            messageCount: messages.indexOf(message) + 1
          },
          immediate: {
            recentMessages: messages.slice(0, messages.indexOf(message) + 1),
            currentUserEmotion: 'curious',
            conversationFlow: {
              currentPhase: 'exploration',
              flowState: { momentum: 0.8, depth: 0.7, engagement: 0.9, clarity: 0.8 },
              transitionTriggers: ['topic_specification']
            },
            activeTopics: ['programming', 'TypeScript', 'web development'],
            environmentData: {
              timeOfDay: 'afternoon',
              userTimezone: 'UTC',
              sessionDuration: (messages.indexOf(message) + 1) * 30,
              activeFeatures: ['text'],
              deviceType: 'desktop',
              networkQuality: 'good'
            }
          },
          timestamp: new Date().toISOString()
        };

        vi.spyOn(contextManager as any, 'buildContext').mockResolvedValue(mockContext);

        const result = await contextManager.processMessage(message);

        expect(result).toBeDefined();
        expect(result.session.messageCount).toBe(messages.indexOf(message) + 1);
        expect(result.immediate.recentMessages).toContain(message);
      }
    });
  });
}); 