// Context caching service for the 3D Avatar project
// Implements LRU cache with TTL management for optimal performance

import type { 
  Context, 
  ContextCache, 
  CacheConfig,
  ContextEvent,
  ContextEventType
} from '../types/context';

/**
 * LRU Cache Implementation with TTL Support
 * Manages context data with automatic expiration and size limits
 */
export class LRUContextCache {
  private cache = new Map<string, ContextCache>();
  private config: CacheConfig;
  private cleanupTimer: number | null = null;
  private eventListeners = new Map<ContextEventType, Array<(event: ContextEvent) => void>>();

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: config.maxSize ?? 100,
      defaultTTL: config.defaultTTL ?? 30 * 60, // 30 minutes default
      cleanupInterval: config.cleanupInterval ?? 5 * 60, // 5 minutes cleanup
      compressionEnabled: config.compressionEnabled ?? false
    };

    this.startCleanupTimer();
  }

  /**
   * Store context data in cache
   */
  set(key: string, context: Context, customTTL?: number): void {
    const now = new Date();
    const ttl = customTTL ?? this.config.defaultTTL;
    
    // Remove existing entry if it exists to update LRU order
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Check if we need to evict items due to size limit
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastRecentlyUsed();
    }

    // Create cache entry
    const cacheEntry: ContextCache = {
      key,
      data: this.config.compressionEnabled ? this.compressContext(context) : context,
      timestamp: now,
      ttl,
      accessCount: 1,
      lastAccessed: now
    };

    // Add to cache (will be at the end, most recently used)
    this.cache.set(key, cacheEntry);

    // Emit cache event
    this.emitEvent('context_cached', {
      key,
      context,
      timestamp: now,
      ttl
    });
  }

  /**
   * Retrieve context data from cache
   */
  get(key: string): Context | null {
    const cacheEntry = this.cache.get(key);
    
    if (!cacheEntry) {
      return null;
    }

    const now = new Date();
    
    // Check if entry has expired
    if (this.isExpired(cacheEntry, now)) {
      this.cache.delete(key);
      this.emitEvent('context_expired', {
        key,
        expiredAt: now
      });
      return null;
    }

    // Update access statistics
    cacheEntry.accessCount++;
    cacheEntry.lastAccessed = now;

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, cacheEntry);

    // Decompress if needed
    const context = this.config.compressionEnabled 
      ? this.decompressContext(cacheEntry.data)
      : cacheEntry.data;

    // Emit retrieval event
    this.emitEvent('context_retrieved', {
      key,
      context,
      accessCount: cacheEntry.accessCount
    });

    return context;
  }

  /**
   * Check if a key exists in cache and is not expired
   */
  has(key: string): boolean {
    const cacheEntry = this.cache.get(key);
    
    if (!cacheEntry) {
      return false;
    }

    if (this.isExpired(cacheEntry, new Date())) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remove specific entry from cache
   */
  delete(key: string): boolean {
    const existed = this.cache.has(key);
    this.cache.delete(key);
    
    if (existed) {
      this.emitEvent('context_expired', {
        key,
        expiredAt: new Date(),
        reason: 'manual_deletion'
      });
    }

    return existed;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const keys = Array.from(this.cache.keys());
    this.cache.clear();
    
    this.emitEvent('context_expired', {
      keys,
      expiredAt: new Date(),
      reason: 'cache_cleared'
    });
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const now = new Date();
    let totalAccess = 0;
    let expiredCount = 0;
    
    for (const entry of this.cache.values()) {
      totalAccess += entry.accessCount;
      if (this.isExpired(entry, now)) {
        expiredCount++;
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: this.calculateHitRate(),
      totalAccess,
      expiredCount,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * Get all non-expired cache keys
   */
  keys(): string[] {
    const now = new Date();
    const validKeys: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isExpired(entry, now)) {
        validKeys.push(key);
      }
    }

    return validKeys;
  }

  /**
   * Update cache configuration
   */
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart cleanup timer if interval changed
    if (newConfig.cleanupInterval !== undefined) {
      this.stopCleanupTimer();
      this.startCleanupTimer();
    }
  }

  /**
   * Add event listener for cache events
   */
  on(eventType: ContextEventType, listener: (event: ContextEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  /**
   * Remove event listener
   */
  off(eventType: ContextEventType, listener: (event: ContextEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Clean up resources and stop timers
   */
  destroy(): void {
    this.stopCleanupTimer();
    this.clear();
    this.eventListeners.clear();
  }

  // Private methods

  private evictLeastRecentlyUsed(): void {
    // Get the first entry (least recently used)
    const firstEntry = this.cache.entries().next();
    if (!firstEntry.done) {
      const [key] = firstEntry.value;
      this.cache.delete(key);
      
      this.emitEvent('context_expired', {
        key,
        expiredAt: new Date(),
        reason: 'lru_eviction'
      });
    }
  }

  private isExpired(entry: ContextCache, now: Date): boolean {
    const ageInSeconds = (now.getTime() - entry.timestamp.getTime()) / 1000;
    return ageInSeconds > entry.ttl;
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = window.setInterval(() => {
      this.cleanupExpiredEntries();
    }, this.config.cleanupInterval * 1000);
  }

  private stopCleanupTimer(): void {
    if (this.cleanupTimer !== null) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  private cleanupExpiredEntries(): void {
    const now = new Date();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry, now)) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => {
      this.cache.delete(key);
    });

    if (expiredKeys.length > 0) {
      this.emitEvent('context_expired', {
        keys: expiredKeys,
        expiredAt: now,
        reason: 'ttl_cleanup'
      });
    }
  }

  private compressContext(context: Context): Context {
    // Simple compression simulation - in real implementation,
    // this would use actual compression algorithms
    return {
      ...context,
      compressed: true
    } as Context;
  }

  private decompressContext(context: Context): Context {
    // Simple decompression simulation
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { compressed, ...decompressedContext } = context as Context & { compressed?: boolean };
    return decompressedContext;
  }

  private calculateHitRate(): number {
    // This would be calculated based on hit/miss statistics
    // For now, returning a placeholder value
    return 0.85; // 85% hit rate
  }

  private estimateMemoryUsage(): number {
    // Rough estimation of memory usage in bytes
    let totalSize = 0;
    
    for (const entry of this.cache.values()) {
      // Estimate size based on JSON string length
      totalSize += JSON.stringify(entry).length * 2; // Rough UTF-16 estimation
    }

    return totalSize;
  }

  private emitEvent(type: ContextEventType, payload: Record<string, unknown>): void {
    const event: ContextEvent = {
      type,
      payload,
      timestamp: new Date(),
      source: 'LRUContextCache'
    };

    const listeners = this.eventListeners.get(type) || [];
    listeners.forEach(listener => listener(event));
  }
}

/**
 * Cache statistics interface
 */
export interface CacheStats {
  size: number;
  maxSize: number;
  hitRate: number;
  totalAccess: number;
  expiredCount: number;
  memoryUsage: number;
}

/**
 * Cache key generation utilities
 */
export class CacheKeyGenerator {
  static forSession(sessionId: string): string {
    return `session:${sessionId}`;
  }

  static forUserContext(userId: string, timestamp?: Date): string {
    const time = timestamp ? timestamp.getTime() : Date.now();
    return `user:${userId}:${Math.floor(time / 60000)}`; // 1-minute buckets
  }

  static forConversationContext(sessionId: string, messageCount: number): string {
    return `conversation:${sessionId}:${messageCount}`;
  }

  static forTopicContext(topic: string, userId: string): string {
    return `topic:${topic.toLowerCase().replace(/\s+/g, '_')}:${userId}`;
  }

  static forTemporaryContext(identifier: string): string {
    return `temp:${identifier}:${Date.now()}`;
  }
}

/**
 * Default cache configuration
 */
export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  maxSize: 100,
  defaultTTL: 30 * 60, // 30 minutes
  cleanupInterval: 5 * 60, // 5 minutes
  compressionEnabled: false
};

/**
 * Create a pre-configured context cache instance
 */
export function createContextCache(config?: Partial<CacheConfig>): LRUContextCache {
  return new LRUContextCache({ ...DEFAULT_CACHE_CONFIG, ...config });
} 