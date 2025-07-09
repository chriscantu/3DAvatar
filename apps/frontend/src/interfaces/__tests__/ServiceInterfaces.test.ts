import { describe, it, expect, vi, beforeEach } from 'vitest';
import type {
  IService,
  IContextManager,
  IMemorySystem,
  RelevantMemoryResult,
  MemoryStats
} from '../ServiceInterfaces';
import type { Context, ContextAnalysis, ContextManagerConfig } from '../../types/context';
import type { ChatMessage } from '../../types/common';

// Mock implementations for testing
class MockService implements IService {
  readonly name = 'MockService';
  readonly version = '1.0.0';
  
  isHealthy(): boolean {
    return true;
  }
  
  async initialize(): Promise<void> {
    // Mock initialization
  }
  
  async cleanup(): Promise<void> {
    // Mock cleanup
  }
}

class MockContextManager extends MockService implements IContextManager {
  readonly name = 'MockContextManager';
  
  async processMessage(message: ChatMessage): Promise<Context> {
    return {
      system: {
        timestamp: new Date(),
        environment: 'test',
        version: '1.0.0',
        capabilities: [],
        resources: { cpu: 0.5, memory: 0.3, network: 0.2 }
      },
      session: {
        id: 'test-session',
        userId: 'test-user',
        startTime: new Date(),
        messageCount: 1,
        conversationPhase: 'greeting',
        topics: ['test'],
        userProfile: {
          id: 'test-user',
          name: 'Test User',
          preferences: {},
          conversationStyle: 'friendly',
          interests: ['testing'],
          expertise: [],
          goals: [],
          personalityTraits: { openness: 0.7, conscientiousness: 0.8, extraversion: 0.6, agreeableness: 0.9, neuroticism: 0.3 },
          communicationPreferences: { formality: 'casual', verbosity: 'moderate', responseTime: 'normal' },
          learningStyle: 'visual',
          culturalContext: { language: 'en', region: 'US', timezone: 'UTC' },
          accessibilityNeeds: [],
          privacySettings: { dataCollection: true, personalization: true, analytics: false },
          relationshipLevel: 'new',
          trustLevel: 0.5,
          engagementHistory: { totalInteractions: 1, averageSessionLength: 300, lastActive: new Date(), preferredTopics: ['test'] },
          feedbackHistory: { ratings: [], comments: [], improvements: [] },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      immediate: {
        currentMessage: message,
        recentMessages: [message],
        currentTopic: 'test',
        userIntent: 'test',
        emotionalState: { primary: 'neutral', intensity: 0.5, confidence: 0.8, indicators: [], timestamp: new Date() },
        urgency: 'normal',
        contextClues: [],
        environmentData: { location: 'test', timeOfDay: 'morning', weather: 'clear', deviceType: 'desktop', platform: 'web' },
        userState: { isTyping: false, lastActive: new Date(), attention: 'focused', mood: 'neutral', energy: 'normal' },
        conversationFlow: { stage: 'active', momentum: 'building', direction: 'forward', coherence: 0.8 },
        relevantMemories: [],
        activeProcesses: [],
        temporaryData: {}
      }
    };
  }
  
  async analyzeContext(_context: Context): Promise<ContextAnalysis> {
    return {
      relevanceScore: 0.8,
      emotionalTone: { primary: 'neutral', intensity: 0.5, confidence: 0.8, indicators: [], timestamp: new Date() },
      topicProgression: [{ topic: 'test', startTime: new Date(), endTime: new Date(), messageCount: 1, engagement: 0.8 }],
      userEngagement: 0.8,
      conversationQuality: 0.9,
      recommendations: ['Continue current approach'],
      insights: ['User is engaged'],
      contextualFactors: { timeOfDay: 'morning', userMood: 'neutral', conversationLength: 'short' },
      processingMetadata: { analysisTime: 100, confidence: 0.9, version: '1.0.0' }
    };
  }
  
  async updateContext(_updates: Partial<Context>): Promise<Context> {
    return await this.processMessage({ id: 'test', content: 'test', timestamp: Date.now(), sender: 'user' });
  }
  
  async clearSession(_preserveProfile?: boolean): Promise<void> {
    // Mock clear session
  }
  
  getSessionContext(): Context {
    return {
      system: {
        timestamp: new Date(),
        environment: 'test',
        version: '1.0.0',
        capabilities: [],
        resources: { cpu: 0.5, memory: 0.3, network: 0.2 }
      },
      session: {
        id: 'test-session',
        userId: 'test-user',
        startTime: new Date(),
        messageCount: 0,
        conversationPhase: 'greeting',
        topics: [],
        userProfile: {
          id: 'test-user',
          name: 'Test User',
          preferences: {},
          conversationStyle: 'friendly',
          interests: [],
          expertise: [],
          goals: [],
          personalityTraits: { openness: 0.7, conscientiousness: 0.8, extraversion: 0.6, agreeableness: 0.9, neuroticism: 0.3 },
          communicationPreferences: { formality: 'casual', verbosity: 'moderate', responseTime: 'normal' },
          learningStyle: 'visual',
          culturalContext: { language: 'en', region: 'US', timezone: 'UTC' },
          accessibilityNeeds: [],
          privacySettings: { dataCollection: true, personalization: true, analytics: false },
          relationshipLevel: 'new',
          trustLevel: 0.5,
          engagementHistory: { totalInteractions: 0, averageSessionLength: 0, lastActive: new Date(), preferredTopics: [] },
          feedbackHistory: { ratings: [], comments: [], improvements: [] },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      immediate: {
        currentMessage: { id: 'test', content: 'test', timestamp: Date.now(), sender: 'user' },
        recentMessages: [],
        currentTopic: '',
        userIntent: '',
        emotionalState: { primary: 'neutral', intensity: 0.5, confidence: 0.8, indicators: [], timestamp: new Date() },
        urgency: 'normal',
        contextClues: [],
        environmentData: { location: 'test', timeOfDay: 'morning', weather: 'clear', deviceType: 'desktop', platform: 'web' },
        userState: { isTyping: false, lastActive: new Date(), attention: 'focused', mood: 'neutral', energy: 'normal' },
        conversationFlow: { stage: 'active', momentum: 'building', direction: 'forward', coherence: 0.8 },
        relevantMemories: [],
        activeProcesses: [],
        temporaryData: {}
      }
    };
  }
  
  addEventListener(_event: string, _handler: (event: any) => void): () => void {
    return () => {};
  }
  
  removeEventListener(_event: string, _handler: (event: any) => void): void {
    // Mock remove event listener
  }
  
  getConfig(): ContextManagerConfig {
    return {
      cache: { maxSize: 1000, ttl: 3600 },
      memory: { shortTerm: 50, longTerm: 1000, workingMemory: 20 },
      compression: { enabled: true, threshold: 10000 },
      validation: { strictMode: false, enabled: true },
      feedback: { enabled: true, collectImplicit: true }
    };
  }
  
  updateConfig(_updates: Partial<ContextManagerConfig>): void {
    // Mock update config
  }
}

class MockMemorySystem extends MockService implements IMemorySystem {
  readonly name = 'MockMemorySystem';
  readonly shortTermMemory = {
    addMessage: vi.fn(),
    getRecentMessages: vi.fn().mockReturnValue([]),
    clear: vi.fn(),
    getStats: vi.fn().mockReturnValue({ messageCount: 0, capacity: 50, utilizationPercentage: 0 })
  };
  readonly longTermMemory = {
    userProfile: {} as any,
    significantInteractions: [],
    learnedPreferences: [],
    relationshipProgress: {} as any,
    addSignificantInteraction: vi.fn(),
    updateUserProfile: vi.fn(),
    addLearnedPreference: vi.fn(),
    updateRelationshipProgress: vi.fn(),
    clear: vi.fn(),
    getStats: vi.fn().mockReturnValue({ interactionCount: 0, preferenceCount: 0, relationshipLevel: 0, memoryQuality: 0.8, lastUpdate: new Date() })
  };
  readonly workingMemory = {
    currentContext: {} as any,
    activeProcesses: [],
    temporaryData: {},
    updateContext: vi.fn(),
    addActiveProcess: vi.fn(),
    removeActiveProcess: vi.fn(),
    setTemporaryData: vi.fn(),
    getTemporaryData: vi.fn(),
    clear: vi.fn(),
    getStats: vi.fn().mockReturnValue({ activeProcessCount: 0, temporaryDataSize: 0, capacity: 20, utilizationPercentage: 0 })
  };
  
  async processMessage(_message: ChatMessage, _context: Context): Promise<void> {
    // Mock process message
  }
  
  async getRelevantMemories(_query: string): Promise<RelevantMemoryResult> {
    return {
      recentMessages: [],
      significantInteractions: [],
      learnedPreferences: [],
      relevanceScore: 0.8
    };
  }
  
  async clearMemory(_type: 'short' | 'long' | 'working' | 'all'): Promise<void> {
    // Mock clear memory
  }
  
  getMemoryStats(): MemoryStats {
    return {
      shortTerm: { messageCount: 0, capacity: 50, utilizationPercentage: 0 },
      longTerm: { interactionCount: 0, preferenceCount: 0, relationshipLevel: 0, memoryQuality: 0.8, lastUpdate: new Date() },
      working: { activeProcessCount: 0, temporaryDataSize: 0, capacity: 20, utilizationPercentage: 0 },
      memoryLimits: { shortTerm: 50, longTerm: 1000, workingMemory: 20 },
      totalMemoryUsage: 0.1
    };
  }
  
  async optimizeMemory(): Promise<void> {
    // Mock optimize memory
  }
}

describe('Service Interfaces', () => {
  describe('IService Base Interface', () => {
    let service: IService;
    
    beforeEach(() => {
      service = new MockService();
    });
    
    it('should have required properties', () => {
      expect(service.name).toBe('MockService');
      expect(service.version).toBe('1.0.0');
    });
    
    it('should implement health check', () => {
      expect(service.isHealthy()).toBe(true);
    });
    
    it('should implement lifecycle methods', async () => {
      await expect(service.initialize()).resolves.toBeUndefined();
      await expect(service.cleanup()).resolves.toBeUndefined();
    });
  });
  
  describe('IContextManager Interface', () => {
    let contextManager: IContextManager;
    
    beforeEach(() => {
      contextManager = new MockContextManager();
    });
    
    it('should process messages and return context', async () => {
      const message: ChatMessage = { id: '1', content: 'Hello', timestamp: Date.now(), sender: 'user' };
      const context = await contextManager.processMessage(message);
      
      expect(context).toHaveProperty('system');
      expect(context).toHaveProperty('session');
      expect(context).toHaveProperty('immediate');
      expect(context.immediate.currentMessage).toEqual(message);
    });
    
    it('should analyze context and return analysis', async () => {
      const context = contextManager.getSessionContext();
      const analysis = await contextManager.analyzeContext(context);
      
      expect(analysis).toHaveProperty('relevanceScore');
      expect(analysis).toHaveProperty('emotionalTone');
      expect(analysis).toHaveProperty('topicProgression');
      expect(analysis.relevanceScore).toBeGreaterThan(0);
    });
    
    it('should update context', async () => {
      const updates = { system: { timestamp: new Date() } };
      const updatedContext = await contextManager.updateContext(updates);
      
      expect(updatedContext).toHaveProperty('system');
      expect(updatedContext).toHaveProperty('session');
      expect(updatedContext).toHaveProperty('immediate');
    });
    
    it('should clear session', async () => {
      await expect(contextManager.clearSession()).resolves.toBeUndefined();
      await expect(contextManager.clearSession(true)).resolves.toBeUndefined();
    });
    
    it('should manage event listeners', () => {
      const handler = vi.fn();
      const unsubscribe = contextManager.addEventListener('message', handler);
      
      expect(typeof unsubscribe).toBe('function');
      
      contextManager.removeEventListener('message', handler);
      expect(handler).not.toHaveBeenCalled();
    });
    
    it('should manage configuration', () => {
      const config = contextManager.getConfig();
      expect(config).toHaveProperty('cache');
      expect(config).toHaveProperty('memory');
      expect(config).toHaveProperty('compression');
      
      contextManager.updateConfig({ cache: { maxSize: 2000, ttl: 7200 } });
      // Should not throw
    });
  });
  
  describe('IMemorySystem Interface', () => {
    let memorySystem: IMemorySystem;
    
    beforeEach(() => {
      memorySystem = new MockMemorySystem();
    });
    
    it('should have memory components', () => {
      expect(memorySystem).toHaveProperty('shortTermMemory');
      expect(memorySystem).toHaveProperty('longTermMemory');
      expect(memorySystem).toHaveProperty('workingMemory');
    });
    
    it('should process messages', async () => {
      const message: ChatMessage = { id: '1', content: 'Hello', timestamp: Date.now(), sender: 'user' };
      const context = {} as Context;
      
      await expect(memorySystem.processMessage(message, context)).resolves.toBeUndefined();
    });
    
    it('should retrieve relevant memories', async () => {
      const memories = await memorySystem.getRelevantMemories('test query');
      
      expect(memories).toHaveProperty('recentMessages');
      expect(memories).toHaveProperty('significantInteractions');
      expect(memories).toHaveProperty('learnedPreferences');
      expect(memories).toHaveProperty('relevanceScore');
      expect(Array.isArray(memories.recentMessages)).toBe(true);
    });
    
    it('should clear memory', async () => {
      await expect(memorySystem.clearMemory('short')).resolves.toBeUndefined();
      await expect(memorySystem.clearMemory('long')).resolves.toBeUndefined();
      await expect(memorySystem.clearMemory('working')).resolves.toBeUndefined();
      await expect(memorySystem.clearMemory('all')).resolves.toBeUndefined();
    });
    
    it('should provide memory statistics', () => {
      const stats = memorySystem.getMemoryStats();
      
      expect(stats).toHaveProperty('shortTerm');
      expect(stats).toHaveProperty('longTerm');
      expect(stats).toHaveProperty('working');
      expect(stats).toHaveProperty('memoryLimits');
      expect(stats).toHaveProperty('totalMemoryUsage');
    });
    
    it('should optimize memory', async () => {
      await expect(memorySystem.optimizeMemory()).resolves.toBeUndefined();
    });
    
    it('should manage short-term memory', () => {
      const message: ChatMessage = { id: '1', content: 'Hello', timestamp: Date.now(), sender: 'user' };
      
      memorySystem.shortTermMemory.addMessage(message);
      expect(memorySystem.shortTermMemory.addMessage).toHaveBeenCalledWith(message);
      
      const recentMessages = memorySystem.shortTermMemory.getRecentMessages(5);
      expect(Array.isArray(recentMessages)).toBe(true);
      
      const stats = memorySystem.shortTermMemory.getStats();
      expect(stats).toHaveProperty('messageCount');
      expect(stats).toHaveProperty('capacity');
      expect(stats).toHaveProperty('utilizationPercentage');
    });
    
    it('should manage long-term memory', () => {
      const interaction = { id: '1', timestamp: new Date(), type: 'positive', description: 'Good interaction', impact: 0.8, participants: ['user'], context: {} };
      
      memorySystem.longTermMemory.addSignificantInteraction(interaction);
      expect(memorySystem.longTermMemory.addSignificantInteraction).toHaveBeenCalledWith(interaction);
      
      const stats = memorySystem.longTermMemory.getStats();
      expect(stats).toHaveProperty('interactionCount');
      expect(stats).toHaveProperty('preferenceCount');
      expect(stats).toHaveProperty('relationshipLevel');
    });
    
    it('should manage working memory', () => {
      const context = {} as Context;
      const process = { id: '1', type: 'analysis', status: 'active', data: {}, startTime: new Date() };
      
      memorySystem.workingMemory.updateContext(context);
      expect(memorySystem.workingMemory.updateContext).toHaveBeenCalledWith(context);
      
      memorySystem.workingMemory.addActiveProcess(process);
      expect(memorySystem.workingMemory.addActiveProcess).toHaveBeenCalledWith(process);
      
      memorySystem.workingMemory.setTemporaryData('key', 'value');
      expect(memorySystem.workingMemory.setTemporaryData).toHaveBeenCalledWith('key', 'value');
    });
  });
  
  describe('Interface Contracts', () => {
    it('should ensure service interfaces extend IService', () => {
      const contextManager = new MockContextManager();
      const memorySystem = new MockMemorySystem();
      
      // All services should implement IService
      expect(contextManager).toHaveProperty('name');
      expect(contextManager).toHaveProperty('version');
      expect(contextManager.isHealthy).toBeDefined();
      expect(contextManager.initialize).toBeDefined();
      expect(contextManager.cleanup).toBeDefined();
      
      expect(memorySystem).toHaveProperty('name');
      expect(memorySystem).toHaveProperty('version');
      expect(memorySystem.isHealthy).toBeDefined();
      expect(memorySystem.initialize).toBeDefined();
      expect(memorySystem.cleanup).toBeDefined();
    });
    
    it('should validate method signatures', () => {
      const contextManager = new MockContextManager();
      
      // Context manager methods should have correct signatures
      expect(contextManager.processMessage).toBeInstanceOf(Function);
      expect(contextManager.analyzeContext).toBeInstanceOf(Function);
      expect(contextManager.updateContext).toBeInstanceOf(Function);
      expect(contextManager.clearSession).toBeInstanceOf(Function);
      expect(contextManager.getSessionContext).toBeInstanceOf(Function);
      expect(contextManager.addEventListener).toBeInstanceOf(Function);
      expect(contextManager.removeEventListener).toBeInstanceOf(Function);
      expect(contextManager.getConfig).toBeInstanceOf(Function);
      expect(contextManager.updateConfig).toBeInstanceOf(Function);
    });
    
    it('should validate return types', async () => {
      const contextManager = new MockContextManager();
      const message: ChatMessage = { id: '1', content: 'Hello', timestamp: Date.now(), sender: 'user' };
      
      // processMessage should return Promise<Context>
      const context = await contextManager.processMessage(message);
      expect(context).toHaveProperty('system');
      expect(context).toHaveProperty('session');
      expect(context).toHaveProperty('immediate');
      
      // analyzeContext should return Promise<ContextAnalysis>
      const analysis = await contextManager.analyzeContext(context);
      expect(analysis).toHaveProperty('relevanceScore');
      expect(analysis).toHaveProperty('emotionalTone');
      expect(analysis).toHaveProperty('topicProgression');
      
      // getSessionContext should return Context
      const sessionContext = contextManager.getSessionContext();
      expect(sessionContext).toHaveProperty('system');
      expect(sessionContext).toHaveProperty('session');
      expect(sessionContext).toHaveProperty('immediate');
    });
    
    it('should validate readonly properties', () => {
      const memorySystem = new MockMemorySystem();
      
      // Memory components should be readonly
      expect(memorySystem.shortTermMemory).toBeDefined();
      expect(memorySystem.longTermMemory).toBeDefined();
      expect(memorySystem.workingMemory).toBeDefined();
      
      // Service properties should be readonly
      expect(memorySystem.name).toBe('MockMemorySystem');
      expect(memorySystem.version).toBe('1.0.0');
    });
  });
  
  describe('Error Handling', () => {
    it('should handle service initialization errors', async () => {
      const failingService = new MockService();
      failingService.initialize = vi.fn().mockRejectedValue(new Error('Initialization failed'));
      
      await expect(failingService.initialize()).rejects.toThrow('Initialization failed');
    });
    
    it('should handle method call errors gracefully', async () => {
      const contextManager = new MockContextManager();
      contextManager.processMessage = vi.fn().mockRejectedValue(new Error('Processing failed'));
      
      const message: ChatMessage = { id: '1', content: 'Hello', timestamp: Date.now(), sender: 'user' };
      await expect(contextManager.processMessage(message)).rejects.toThrow('Processing failed');
    });
    
    it('should handle invalid input gracefully', async () => {
      const memorySystem = new MockMemorySystem();
      
      // Should handle invalid memory type
      await expect(memorySystem.clearMemory('invalid' as any)).resolves.toBeUndefined();
    });
  });
  
  describe('Performance Considerations', () => {
    it('should track method execution time', async () => {
      const contextManager = new MockContextManager();
      const message: ChatMessage = { id: '1', content: 'Hello', timestamp: Date.now(), sender: 'user' };
      
      const start = performance.now();
      await contextManager.processMessage(message);
      const end = performance.now();
      
      expect(end - start).toBeLessThan(100); // Should be fast for mock
    });
    
    it('should handle concurrent operations', async () => {
      const contextManager = new MockContextManager();
      const messages = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        content: `Message ${i}`,
        timestamp: Date.now(),
        sender: 'user' as const
      }));
      
      const promises = messages.map(msg => contextManager.processMessage(msg));
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveProperty('system');
        expect(result).toHaveProperty('session');
        expect(result).toHaveProperty('immediate');
      });
    });
  });
}); 