import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AvatarMemorySystem } from '../memorySystem';
import type { ChatMessage } from '../../types/common';
import type { 
  Context, 
  UserProfile, 
  SignificantInteraction, 
  LearnedPreference,
  ActiveProcess,
  MemoryLimits
} from '../../types/context';

describe('AvatarMemorySystem', () => {
  let memorySystem: AvatarMemorySystem;
  let mockEventListener: vi.Mock;

  const mockChatMessage: ChatMessage = {
    id: 'msg-1',
    content: 'Hello, I love programming and artificial intelligence!',
    sender: 'user',
    timestamp: Date.now()
  };

  const mockContext: Context = {
    system: {
      avatarPersonality: {
        traits: {
          empathy: 0.9,
          curiosity: 0.8,
          patience: 0.9,
          humor: 'gentle',
          supportiveness: 0.8,
          formality: 0.5,
          enthusiasm: 0.7
        },
        communicationPatterns: {
          greeting: { tone: 'warm', approach: 'friendly', examples: [] },
          questioning: { tone: 'curious', approach: 'gentle', examples: [] },
          explaining: { tone: 'clear', approach: 'patient', examples: [] },
          encouraging: { tone: 'supportive', approach: 'positive', examples: [] },
          farewells: { tone: 'warm', approach: 'caring', examples: [] }
        },
        boundaries: {
          prohibitedTopics: [],
          maxMessageLength: 500,
          responseGuidelines: []
        },
        responseStyles: {
          casual: { structure: 'relaxed', vocabulary: 'everyday', examples: [] },
          professional: { structure: 'formal', vocabulary: 'technical', examples: [] },
          supportive: { structure: 'empathetic', vocabulary: 'caring', examples: [] },
          educational: { structure: 'structured', vocabulary: 'informative', examples: [] }
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
      messageCount: 1
    },
    immediate: {
      recentMessages: [mockChatMessage],
      currentUserEmotion: 'excited',
      conversationFlow: {
        currentPhase: 'exploration',
        flowState: {
          momentum: 0.7,
          depth: 0.6,
          engagement: 0.8,
          clarity: 0.9
        },
        transitionTriggers: []
      },
      activeTopics: ['programming', 'AI', 'technology'],
      environmentData: {
        timeOfDay: 'afternoon',
        userTimezone: 'UTC',
        sessionDuration: 5,
        activeFeatures: [],
        deviceType: 'desktop',
        networkQuality: 'excellent'
      }
    },
    timestamp: new Date().toISOString()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockEventListener = vi.fn();
    
    const memoryLimits: MemoryLimits = {
      shortTerm: 5,    // Small limit for testing
      longTerm: 10,    // Small limit for testing
      workingMemory: 3  // Small limit for testing
    };
    
    memorySystem = new AvatarMemorySystem(memoryLimits);
  });

  afterEach(() => {
    memorySystem.clearMemories(false);
  });

  describe('Message Processing', () => {
    it('should process messages and store across memory systems', () => {
      memorySystem.processMessage(mockChatMessage, mockContext);

      // Check short-term memory
      const recentMessages = memorySystem.shortTermMemory.getRecentMessages();
      expect(recentMessages).toContain(mockChatMessage);

      // Check working memory
      expect(memorySystem.workingMemory.currentContext).toEqual(mockContext);
    });

    it('should identify significant interactions', () => {
      const significantMessage: ChatMessage = {
        id: 'msg-2',
        content: 'This is really important! Please remember that I have a big presentation tomorrow and I need help with machine learning concepts.',
        sender: 'user',
        timestamp: Date.now()
      };

      const significantContext = {
        ...mockContext,
        immediate: {
          ...mockContext.immediate,
          currentUserEmotion: 'anxious' as const,
          recentMessages: [significantMessage]
        }
      };

      memorySystem.processMessage(significantMessage, significantContext);

      const longTermStats = memorySystem.longTermMemory.getStats();
      expect(longTermStats.interactionCount).toBeGreaterThan(0);
    });

    it('should extract and learn preferences from interactions', () => {
      const briefMessage: ChatMessage = {
        id: 'msg-3',
        content: 'Keep it short.',
        sender: 'user',
        timestamp: Date.now()
      };

      memorySystem.processMessage(briefMessage, mockContext);

      const preferences = memorySystem.longTermMemory.getRelevantPreferences('communication');
      expect(preferences.length).toBeGreaterThan(0);
    });
  });

  describe('Short-Term Memory', () => {
    it('should add messages and respect capacity limits', () => {
      // Add messages up to capacity
      for (let i = 0; i < 10; i++) {
        const message: ChatMessage = {
          id: `msg-${i}`,
          content: `Message ${i}`,
          sender: 'user',
          timestamp: Date.now() + i
        };
        memorySystem.shortTermMemory.addMessage(message);
      }

      const messages = memorySystem.shortTermMemory.getRecentMessages();
      expect(messages.length).toBeLessThanOrEqual(5); // Capacity limit
      
      // Should contain most recent messages
      expect(messages[messages.length - 1].id).toBe('msg-9');
    });

    it('should get recent messages with limit', () => {
      // Add several messages
      for (let i = 0; i < 5; i++) {
        const message: ChatMessage = {
          id: `msg-${i}`,
          content: `Message ${i}`,
          sender: 'user',
          timestamp: Date.now() + i
        };
        memorySystem.shortTermMemory.addMessage(message);
      }

      const recentMessages = memorySystem.shortTermMemory.getRecentMessages(3);
      expect(recentMessages.length).toBe(3);
    });

    it('should clear short-term memory', () => {
      memorySystem.shortTermMemory.addMessage(mockChatMessage);
      expect(memorySystem.shortTermMemory.getRecentMessages().length).toBe(1);

      memorySystem.shortTermMemory.clear();
      expect(memorySystem.shortTermMemory.getRecentMessages().length).toBe(0);
    });

    it('should provide accurate statistics', () => {
      memorySystem.shortTermMemory.addMessage(mockChatMessage);
      
      const stats = memorySystem.shortTermMemory.getStats();
      expect(stats.messageCount).toBe(1);
      expect(stats.capacity).toBe(5);
      expect(stats.utilizationRate).toBe(0.2); // 1/5
      expect(stats.oldestMessageAge).toBeGreaterThan(0);
    });
  });

  describe('Long-Term Memory', () => {
    it('should store significant interactions', () => {
      const interaction: SignificantInteraction = {
        id: 'interaction-1',
        timestamp: new Date(),
        summary: 'User discussed AI and programming interests',
        impact: 0.8,
        emotionalResonance: 0.7,
        topics: ['AI', 'programming']
      };

      memorySystem.longTermMemory.storeSignificantInteraction(interaction);

      const interactions = memorySystem.longTermMemory.searchSignificantInteractions('AI', 5);
      expect(interactions.length).toBe(1);
      expect(interactions[0].topics).toContain('AI');
    });

    it('should search significant interactions by relevance', () => {
      const interactions: SignificantInteraction[] = [
        {
          id: 'interaction-1',
          timestamp: new Date(),
          summary: 'Discussion about machine learning algorithms',
          impact: 0.9,
          emotionalResonance: 0.8,
          topics: ['machine learning', 'algorithms']
        },
        {
          id: 'interaction-2',
          timestamp: new Date(),
          summary: 'Casual conversation about weather',
          impact: 0.2,
          emotionalResonance: 0.3,
          topics: ['weather', 'casual']
        },
        {
          id: 'interaction-3',
          timestamp: new Date(),
          summary: 'Deep dive into neural networks',
          impact: 0.95,
          emotionalResonance: 0.9,
          topics: ['neural networks', 'deep learning']
        }
      ];

      interactions.forEach(interaction => {
        memorySystem.longTermMemory.storeSignificantInteraction(interaction);
      });

      const searchResults = memorySystem.longTermMemory.searchSignificantInteractions('machine learning', 10);
      
      // Should find relevant interactions
      expect(searchResults.length).toBeGreaterThan(0);
      
      // Should prioritize more relevant and impactful interactions
      const topResult = searchResults[0];
      expect(topResult.impact).toBeGreaterThan(0.5);
    });

    it('should update and merge preferences', () => {
      const preference1: LearnedPreference = {
        category: 'communication_style',
        preference: 'prefers_detailed_explanations',
        confidence: 0.6,
        evidence: ['Asked for detailed explanation'],
        lastUpdated: new Date()
      };

      const preference2: LearnedPreference = {
        category: 'communication_style',
        preference: 'prefers_detailed_explanations',
        confidence: 0.8,
        evidence: ['Asked for more details again'],
        lastUpdated: new Date()
      };

      memorySystem.longTermMemory.updatePreference(preference1);
      memorySystem.longTermMemory.updatePreference(preference2);

      const preferences = memorySystem.longTermMemory.getRelevantPreferences('communication');
      expect(preferences.length).toBe(1);
      expect(preferences[0].confidence).toBe(0.8); // Should be updated
      expect(preferences[0].evidence.length).toBe(2); // Should merge evidence
    });

    it('should respect capacity limits for interactions', () => {
      // Add more interactions than capacity
      for (let i = 0; i < 15; i++) {
        const interaction: SignificantInteraction = {
          id: `interaction-${i}`,
          timestamp: new Date(),
          summary: `Interaction ${i}`,
          impact: Math.random(),
          emotionalResonance: Math.random(),
          topics: [`topic-${i}`]
        };
        memorySystem.longTermMemory.storeSignificantInteraction(interaction);
      }

      const stats = memorySystem.longTermMemory.getStats();
      expect(stats.interactionCount).toBeLessThanOrEqual(10); // Capacity limit
    });

    it('should update relationship progress', () => {
      const progress = {
        trustLevel: 0.7,
        intimacyLevel: 0.5,
        sharedExperiences: ['programming discussion', 'AI learning']
      };

      memorySystem.longTermMemory.updateRelationshipProgress(progress);

      const stats = memorySystem.longTermMemory.getStats();
      expect(stats.relationshipLevel).toBe(0.6); // Average of trust and intimacy
    });
  });

  describe('Working Memory', () => {
    it('should update current context', () => {
      memorySystem.workingMemory.updateContext(mockContext);
      
      expect(memorySystem.workingMemory.currentContext).toEqual(mockContext);
    });

    it('should manage active processes', () => {
      const process: ActiveProcess = {
        id: 'process-1',
        type: 'context_analysis',
        status: 'running',
        progress: 0.5,
        data: { analysisType: 'emotion' }
      };

      memorySystem.workingMemory.addProcess(process);
      
      const retrievedProcess = memorySystem.workingMemory.getProcess('process-1');
      expect(retrievedProcess).toEqual(process);
    });

    it('should respect capacity limits for processes', () => {
      // Add more processes than capacity
      for (let i = 0; i < 5; i++) {
        const process: ActiveProcess = {
          id: `process-${i}`,
          type: 'emotion_detection',
          status: 'running',
          progress: 0.0,
          data: {}
        };
        memorySystem.workingMemory.addProcess(process);
      }

      const stats = memorySystem.workingMemory.getStats();
      expect(stats.activeProcessCount).toBeLessThanOrEqual(3); // Capacity limit
    });

    it('should update existing processes', () => {
      const process: ActiveProcess = {
        id: 'process-1',
        type: 'response_generation',
        status: 'running',
        progress: 0.3,
        data: {}
      };

      memorySystem.workingMemory.addProcess(process);
      memorySystem.workingMemory.updateProcess('process-1', { 
        progress: 0.8, 
        status: 'completed' 
      });

      const updatedProcess = memorySystem.workingMemory.getProcess('process-1');
      expect(updatedProcess?.progress).toBe(0.8);
      expect(updatedProcess?.status).toBe('completed');
    });

    it('should manage temporary data', () => {
      memorySystem.workingMemory.setTemporaryData('analysis_result', { confidence: 0.9 });
      
      const data = memorySystem.workingMemory.getTemporaryData('analysis_result');
      expect(data).toEqual({ confidence: 0.9 });
    });

    it('should clear temporary data', () => {
      memorySystem.workingMemory.setTemporaryData('temp_key', 'temp_value');
      expect(memorySystem.workingMemory.getTemporaryData('temp_key')).toBe('temp_value');

      memorySystem.workingMemory.clearTemporaryData();
      expect(memorySystem.workingMemory.getTemporaryData('temp_key')).toBeUndefined();
    });
  });

  describe('Memory Retrieval', () => {
    it('should get relevant memories for a query', () => {
      // Add some test data
      memorySystem.shortTermMemory.addMessage(mockChatMessage);
      
      const interaction: SignificantInteraction = {
        id: 'interaction-1',
        timestamp: new Date(),
        summary: 'Programming discussion',
        impact: 0.8,
        emotionalResonance: 0.7,
        topics: ['programming', 'AI']
      };
      memorySystem.longTermMemory.storeSignificantInteraction(interaction);

      const relevantMemories = memorySystem.getRelevantMemories('programming', 10);

      expect(relevantMemories.recentMessages.length).toBeGreaterThan(0);
      expect(relevantMemories.significantInteractions.length).toBeGreaterThan(0);
      expect(relevantMemories.relevanceScore).toBeGreaterThan(0);
    });

    it('should calculate relevance scores appropriately', () => {
      const highRelevanceQuery = 'programming AI machine learning';
      const lowRelevanceQuery = 'weather cooking recipes';

      // Add relevant content
      memorySystem.shortTermMemory.addMessage(mockChatMessage);

      const highRelevanceResult = memorySystem.getRelevantMemories(highRelevanceQuery, 5);
      const lowRelevanceResult = memorySystem.getRelevantMemories(lowRelevanceQuery, 5);

      expect(highRelevanceResult.relevanceScore).toBeGreaterThan(lowRelevanceResult.relevanceScore);
    });
  });

  describe('Memory Statistics', () => {
    it('should provide comprehensive memory statistics', () => {
      // Add some test data
      memorySystem.shortTermMemory.addMessage(mockChatMessage);
      
      const interaction: SignificantInteraction = {
        id: 'interaction-1',
        timestamp: new Date(),
        summary: 'Test interaction',
        impact: 0.7,
        emotionalResonance: 0.6,
        topics: ['test']
      };
      memorySystem.longTermMemory.storeSignificantInteraction(interaction);

      const process: ActiveProcess = {
        id: 'process-1',
        type: 'context_analysis',
        status: 'running',
        progress: 0.5,
        data: {}
      };
      memorySystem.workingMemory.addProcess(process);

      const stats = memorySystem.getMemoryStats();

      expect(stats.shortTerm.messageCount).toBe(1);
      expect(stats.longTerm.interactionCount).toBe(1);
      expect(stats.working.activeProcessCount).toBe(1);
      expect(stats.totalMemoryUsage).toBeGreaterThan(0);
      expect(stats.memoryLimits).toBeDefined();
    });
  });

  describe('Event System', () => {
    it('should emit events when memory is updated', () => {
      memorySystem.on('memory_updated', mockEventListener);

      memorySystem.processMessage(mockChatMessage, mockContext);

      expect(mockEventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          messageId: mockChatMessage.id,
          timestamp: expect.any(Date),
          memoryTypes: expect.arrayContaining(['short_term', 'working'])
        })
      );
    });

    it('should emit events when relationship is updated', () => {
      memorySystem.on('relationship_updated', mockEventListener);

      const progress = { trustLevel: 0.8, intimacyLevel: 0.6 };
      memorySystem.updateRelationshipProgress(progress);

      expect(mockEventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          progress,
          timestamp: expect.any(Date)
        })
      );
    });

    it('should remove event listeners', () => {
      memorySystem.on('memory_updated', mockEventListener);
      memorySystem.off('memory_updated', mockEventListener);

      memorySystem.processMessage(mockChatMessage, mockContext);

      expect(mockEventListener).not.toHaveBeenCalled();
    });
  });

  describe('Memory Cleanup', () => {
    it('should clear all memories while preserving long-term by default', () => {
      // Add data to all memory types
      memorySystem.shortTermMemory.addMessage(mockChatMessage);
      
      const interaction: SignificantInteraction = {
        id: 'interaction-1',
        timestamp: new Date(),
        summary: 'Test interaction',
        impact: 0.7,
        emotionalResonance: 0.6,
        topics: ['test']
      };
      memorySystem.longTermMemory.storeSignificantInteraction(interaction);

      memorySystem.workingMemory.setTemporaryData('test', 'value');

      memorySystem.clearMemories();

      // Short-term and working memory should be cleared
      expect(memorySystem.shortTermMemory.getRecentMessages().length).toBe(0);
      expect(memorySystem.workingMemory.getTemporaryData('test')).toBeUndefined();

      // Long-term memory should be preserved
      const longTermStats = memorySystem.longTermMemory.getStats();
      expect(longTermStats.interactionCount).toBeGreaterThan(0);
    });

    it('should clear all memories including long-term when specified', () => {
      // Add data to all memory types
      memorySystem.shortTermMemory.addMessage(mockChatMessage);
      
      const interaction: SignificantInteraction = {
        id: 'interaction-1',
        timestamp: new Date(),
        summary: 'Test interaction',
        impact: 0.7,
        emotionalResonance: 0.6,
        topics: ['test']
      };
      memorySystem.longTermMemory.storeSignificantInteraction(interaction);

      memorySystem.clearMemories(false); // Don't preserve long-term

      // All memory should be cleared
      expect(memorySystem.shortTermMemory.getRecentMessages().length).toBe(0);
      const longTermStats = memorySystem.longTermMemory.getStats();
      expect(longTermStats.interactionCount).toBe(0);
    });
  });
}); 