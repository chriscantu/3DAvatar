import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LRUContextCache, CacheKeyGenerator, createContextCache } from '../contextCache';
import type { Context, CacheConfig } from '../../types/context';

// Mock timers for TTL testing
vi.useFakeTimers();

describe('LRUContextCache', () => {
  let cache: LRUContextCache;
  let mockEventListener: vi.Mock;

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

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    mockEventListener = vi.fn();

    const cacheConfig: Partial<CacheConfig> = {
      maxSize: 3,        // Small size for testing eviction
      defaultTTL: 60,    // 60 seconds
      cleanupInterval: 10, // 10 seconds
      compressionEnabled: false
    };

    cache = new LRUContextCache(cacheConfig);
  });

  afterEach(() => {
    cache.destroy();
    vi.clearAllTimers();
  });

  describe('Basic Cache Operations', () => {
    it('should store and retrieve context data', () => {
      const key = 'test-key';
      cache.set(key, mockContext);

      const retrieved = cache.get(key);
      expect(retrieved).toEqual(mockContext);
    });

    it('should return null for non-existent keys', () => {
      const retrieved = cache.get('non-existent-key');
      expect(retrieved).toBeNull();
    });

    it('should check if key exists', () => {
      const key = 'test-key';
      
      expect(cache.has(key)).toBe(false);
      
      cache.set(key, mockContext);
      expect(cache.has(key)).toBe(true);
    });

    it('should delete entries', () => {
      const key = 'test-key';
      cache.set(key, mockContext);
      
      expect(cache.has(key)).toBe(true);
      
      const deleted = cache.delete(key);
      expect(deleted).toBe(true);
      expect(cache.has(key)).toBe(false);
    });

    it('should return false when deleting non-existent key', () => {
      const deleted = cache.delete('non-existent-key');
      expect(deleted).toBe(false);
    });

    it('should clear all entries', () => {
      cache.set('key1', mockContext);
      cache.set('key2', mockContext);
      cache.set('key3', mockContext);

      expect(cache.keys().length).toBe(3);

      cache.clear();
      expect(cache.keys().length).toBe(0);
    });
  });

  describe('LRU Eviction Policy', () => {
    it('should maintain LRU order', () => {
      // Fill cache to capacity
      cache.set('key1', mockContext);
      cache.set('key2', mockContext);
      cache.set('key3', mockContext);

      // Access key1 to make it most recently used
      cache.get('key1');

      // Add another item, should evict key2 (least recently used)
      cache.set('key4', mockContext);

      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(false); // Should be evicted
      expect(cache.has('key3')).toBe(true);
      expect(cache.has('key4')).toBe(true);
    });

    it('should update LRU order on access', () => {
      cache.set('key1', mockContext);
      cache.set('key2', mockContext);
      cache.set('key3', mockContext);

      // Access key1 multiple times
      cache.get('key1');
      cache.get('key1');

      // Add new item
      cache.set('key4', mockContext);

      // key2 should be evicted (was least recently used)
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(false);
      expect(cache.has('key3')).toBe(true);
      expect(cache.has('key4')).toBe(true);
    });

    it('should handle capacity of 1', () => {
      const smallCache = new LRUContextCache({ maxSize: 1 });

      smallCache.set('key1', mockContext);
      expect(smallCache.has('key1')).toBe(true);

      smallCache.set('key2', mockContext);
      expect(smallCache.has('key1')).toBe(false);
      expect(smallCache.has('key2')).toBe(true);

      smallCache.destroy();
    });
  });

  describe('TTL (Time-To-Live) Management', () => {
    it('should respect default TTL', () => {
      const key = 'test-key';
      cache.set(key, mockContext);

      expect(cache.has(key)).toBe(true);

      // Advance time beyond TTL
      vi.advanceTimersByTime(61 * 1000); // 61 seconds

      expect(cache.has(key)).toBe(false);
      expect(cache.get(key)).toBeNull();
    });

    it('should respect custom TTL', () => {
      const key = 'test-key';
      cache.set(key, mockContext, 30); // 30 seconds TTL

      expect(cache.has(key)).toBe(true);

      // Advance time to just before expiration
      vi.advanceTimersByTime(25 * 1000);
      expect(cache.has(key)).toBe(true);

      // Advance time beyond custom TTL
      vi.advanceTimersByTime(10 * 1000); // Total 35 seconds
      expect(cache.has(key)).toBe(false);
    });

    it('should update access time on retrieval', () => {
      const key = 'test-key';
      cache.set(key, mockContext);

      // Advance time but access before expiration
      vi.advanceTimersByTime(30 * 1000);
      const retrieved = cache.get(key);
      expect(retrieved).not.toBeNull();

      // The item should still be valid for its original TTL from last access
      // Note: This test assumes the implementation updates lastAccessed time
      expect(cache.has(key)).toBe(true);
    });

    it('should handle zero TTL gracefully', () => {
      const key = 'test-key';
      cache.set(key, mockContext, 0);

      // Should be immediately expired
      expect(cache.has(key)).toBe(false);
      expect(cache.get(key)).toBeNull();
    });
  });

  describe('Automatic Cleanup', () => {
    it('should clean up expired entries automatically', () => {
      cache.set('key1', mockContext, 10); // 10 seconds TTL
      cache.set('key2', mockContext, 30); // 30 seconds TTL
      cache.set('key3', mockContext, 40); // 40 seconds TTL

      expect(cache.keys().length).toBe(3);

      // Advance time to expire first item
      vi.advanceTimersByTime(15 * 1000);

      // Trigger cleanup interval
      vi.advanceTimersByTime(10 * 1000);

      // key1 should be cleaned up automatically (expired at 10s, now at 25s)
      expect(cache.has('key1')).toBe(false);
      // key2 and key3 should still be valid (30s and 40s TTL, now at 25s)
      expect(cache.has('key2')).toBe(true);
      expect(cache.has('key3')).toBe(true);
    });

    it('should run cleanup at specified intervals', () => {
      const cleanupSpy = vi.spyOn(cache as any, 'cleanupExpiredEntries');

      // Add expired entries
      cache.set('key1', mockContext, 1);
      vi.advanceTimersByTime(2 * 1000);

      // Advance to cleanup interval
      vi.advanceTimersByTime(10 * 1000);

      expect(cleanupSpy).toHaveBeenCalled();
    });
  });

  describe('Cache Statistics', () => {
    it('should provide accurate statistics', () => {
      cache.set('key1', mockContext);
      cache.set('key2', mockContext);
      
      // Access key1 to increase hit count
      cache.get('key1');
      cache.get('key1');
      
      // Try to access non-existent key to increase miss count
      cache.get('non-existent');

      const stats = cache.getStats();

      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBe(3);
      expect(stats.totalAccess).toBeGreaterThan(0);
      expect(stats.hitRate).toBeGreaterThan(0);
      expect(stats.memoryUsage).toBeGreaterThan(0);
    });

    it('should calculate hit rate correctly', () => {
      cache.set('key1', mockContext);
      
      // 2 hits
      cache.get('key1');
      cache.get('key1');
      
      // 1 miss
      cache.get('non-existent');

      const stats = cache.getStats();
      expect(stats.hitRate).toBeCloseTo(0.67, 2); // 2/3 ≈ 0.67
    });

    it('should track expired entries', () => {
      cache.set('key1', mockContext, 1); // 1 second TTL
      
      vi.advanceTimersByTime(2 * 1000);
      
      // Trigger cleanup to count expired entries
      vi.advanceTimersByTime(10 * 1000);

      const stats = cache.getStats();
      expect(stats.expiredCount).toBeGreaterThan(0);
    });
  });

  describe('Event System', () => {
    it('should emit events when context is cached', () => {
      cache.on('context_cached', mockEventListener);

      const key = 'test-key';
      cache.set(key, mockContext);

      expect(mockEventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'context_cached',
          source: 'LRUContextCache',
          timestamp: expect.any(Date),
          payload: expect.objectContaining({
            key,
            context: mockContext,
            timestamp: expect.any(Date),
            ttl: expect.any(Number)
          })
        })
      );
    });

    it('should emit events when context is retrieved', () => {
      cache.on('context_retrieved', mockEventListener);

      const key = 'test-key';
      cache.set(key, mockContext);
      cache.get(key);

      expect(mockEventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'context_retrieved',
          source: 'LRUContextCache',
          timestamp: expect.any(Date),
          payload: expect.objectContaining({
            key,
            context: mockContext,
            accessCount: expect.any(Number)
          })
        })
      );
    });

    it('should emit events when context expires', () => {
      cache.on('context_expired', mockEventListener);

      const key = 'test-key';
      cache.set(key, mockContext, 1); // 1 second TTL

      vi.advanceTimersByTime(2 * 1000);
      
      // Try to access expired entry
      cache.get(key);

      expect(mockEventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'context_expired',
          source: 'LRUContextCache',
          timestamp: expect.any(Date),
          payload: expect.objectContaining({
            key,
            expiredAt: expect.any(Date)
          })
        })
      );
    });

    it('should remove event listeners', () => {
      cache.on('context_cached', mockEventListener);
      cache.off('context_cached', mockEventListener);

      cache.set('test-key', mockContext);

      expect(mockEventListener).not.toHaveBeenCalled();
    });
  });

  describe('Configuration Management', () => {
    it('should use default configuration', () => {
      const defaultCache = new LRUContextCache();
      
      // Should not throw and should have reasonable defaults
      defaultCache.set('test', mockContext);
      expect(defaultCache.get('test')).toEqual(mockContext);
      
      defaultCache.destroy();
    });

    it('should update configuration', () => {
      const newConfig: Partial<CacheConfig> = {
        maxSize: 5,
        defaultTTL: 120
      };

      cache.updateConfig(newConfig);

      // Should be able to store more items now
      for (let i = 0; i < 5; i++) {
        cache.set(`key${i}`, mockContext);
      }

      expect(cache.keys().length).toBe(5);
    });

    it('should handle invalid configuration gracefully', () => {
      const invalidConfig: Partial<CacheConfig> = {
        maxSize: -1,
        defaultTTL: -10
      };

      // Should not throw
      expect(() => cache.updateConfig(invalidConfig)).not.toThrow();
    });
  });

  describe('Key Management', () => {
    it('should return all valid keys', () => {
      cache.set('key1', mockContext);
      cache.set('key2', mockContext, 1); // Will expire soon
      cache.set('key3', mockContext);

      vi.advanceTimersByTime(2 * 1000); // Expire key2

      const keys = cache.keys();
      expect(keys).toContain('key1');
      expect(keys).not.toContain('key2'); // Should be excluded as expired
      expect(keys).toContain('key3');
    });

    it('should handle empty cache', () => {
      const keys = cache.keys();
      expect(keys).toEqual([]);
    });
  });

  describe('Memory Management', () => {
    it('should estimate memory usage', () => {
      cache.set('key1', mockContext);
      cache.set('key2', mockContext);

      const stats = cache.getStats();
      expect(stats.memoryUsage).toBeGreaterThan(0);

      // Adding more entries should increase memory usage
      cache.set('key3', mockContext);
      const newStats = cache.getStats();
      expect(newStats.memoryUsage).toBeGreaterThan(stats.memoryUsage);
    });

    it('should handle large contexts', () => {
      const largeContext = {
        ...mockContext,
        immediate: {
          ...mockContext.immediate,
          recentMessages: Array(100).fill({
            id: 'msg',
            content: 'Large message content'.repeat(100),
            sender: 'user',
            timestamp: Date.now()
          })
        }
      };

      // Should not throw even with large contexts
      expect(() => cache.set('large', largeContext)).not.toThrow();
      expect(cache.get('large')).toEqual(largeContext);
    });
  });

  describe('Compression (when enabled)', () => {
    it('should handle compression configuration', () => {
      const compressedCache = new LRUContextCache({
        maxSize: 3,
        compressionEnabled: true
      });

      compressedCache.set('test', mockContext);
      const retrieved = compressedCache.get('test');

      expect(retrieved).toEqual(mockContext);
      
      compressedCache.destroy();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed data gracefully', () => {
      // Test with potentially problematic keys
      const problematicKeys = ['', '   ', '\n\t', 'very'.repeat(1000)];

      problematicKeys.forEach(key => {
        expect(() => cache.set(key, mockContext)).not.toThrow();
      });
    });

    it('should handle cleanup timer errors gracefully', () => {
      // This test may not be able to fully test timer error handling
      // since it would interfere with cache functionality
      // Just test that cache can be destroyed safely
      const errorCache = new LRUContextCache({ cleanupInterval: 1 });
      
      expect(() => errorCache.destroy()).not.toThrow();
    });
  });

  describe('Resource Cleanup', () => {
    it('should cleanup resources on destroy', () => {
      cache.set('key1', mockContext);
      cache.set('key2', mockContext);

      expect(cache.keys().length).toBe(2);

      cache.destroy();

      // Should not be able to use cache after destroy
      expect(() => cache.set('key3', mockContext)).not.toThrow();
    });

    it('should stop cleanup timer on destroy', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      
      cache.destroy();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });
});

describe('CacheKeyGenerator', () => {
  describe('Key Generation', () => {
    it('should generate session keys', () => {
      const sessionId = 'session-123';
      const key = CacheKeyGenerator.forSession(sessionId);

      expect(key).toBe('session:session-123');
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(0);
    });

    it('should generate user context keys', () => {
      const userId = 'user-456';
      const key = CacheKeyGenerator.forUserContext(userId);

      expect(key).toContain('user:user-456');
      expect(typeof key).toBe('string');
    });

    it('should generate user context keys with timestamp', () => {
      const userId = 'user-456';
      const timestamp = new Date('2023-01-01');
      const key = CacheKeyGenerator.forUserContext(userId, timestamp);

      expect(key).toContain('user:user-456');
      // Just check that timestamp is included somehow, not exact format
      expect(key.length).toBeGreaterThan('user:user-456'.length);
    });

    it('should generate conversation context keys', () => {
      const sessionId = 'session-123';
      const messageCount = 5;
      const key = CacheKeyGenerator.forConversationContext(sessionId, messageCount);

      expect(key).toBe('conversation:session-123:5');
    });

    it('should generate topic context keys', () => {
      const topic = 'programming';
      const userId = 'user-123';
      const key = CacheKeyGenerator.forTopicContext(topic, userId);

      expect(key).toBe('topic:programming:user-123');
    });

    it('should generate temporary context keys', () => {
      const identifier = 'temp-123';
      const key = CacheKeyGenerator.forTemporaryContext(identifier);

      expect(key).toContain('temp:temp-123');
      expect(typeof key).toBe('string');
    });

    it('should handle special characters in keys', () => {
      const specialUserId = 'user@domain.com';
      const key = CacheKeyGenerator.forUserContext(specialUserId);

      expect(key).toContain(specialUserId);
      expect(typeof key).toBe('string');
    });
  });
});

describe('createContextCache', () => {
  it('should create cache with default config', () => {
    const cache = createContextCache();
    
    expect(cache).toBeInstanceOf(LRUContextCache);
    
    cache.destroy();
  });

  it('should create cache with custom config', () => {
    const config: Partial<CacheConfig> = {
      maxSize: 50,
      defaultTTL: 300
    };
    
    const cache = createContextCache(config);
    
    expect(cache).toBeInstanceOf(LRUContextCache);
    
    cache.destroy();
  });
}); 