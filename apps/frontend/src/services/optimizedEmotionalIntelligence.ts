// Optimized Emotional Intelligence Service with performance enhancements
import type { Context, EmotionalState } from '../types/context';
import { performanceMonitor, monitorSync } from './performanceMonitor';

interface EmotionalAnalysisCache {
  key: string;
  result: EmotionalState;
  timestamp: number;
  accessCount: number;
}

interface EmotionalPattern {
  pattern: RegExp;
  emotion: string;
  intensity: number;
  weight: number;
}

export class OptimizedEmotionalIntelligence {
  private cache = new Map<string, EmotionalAnalysisCache>();
  private readonly maxCacheSize = 500;
  private readonly cacheTimeout = 1800000; // 30 minutes
  private readonly cleanupInterval = 300000; // 5 minutes
  
  // Pre-compiled emotion patterns for better performance
  private emotionalPatterns: EmotionalPattern[] = [
    // Positive emotions
    { pattern: /\b(happy|joy|excited|thrilled|delighted|pleased|glad|cheerful)\b/gi, emotion: 'happy', intensity: 0.8, weight: 1.0 },
    { pattern: /\b(love|adore|amazing|wonderful|fantastic|great|excellent)\b/gi, emotion: 'happy', intensity: 0.7, weight: 0.9 },
    { pattern: /\b(good|nice|fine|okay|alright)\b/gi, emotion: 'happy', intensity: 0.4, weight: 0.5 },
    
    // Negative emotions
    { pattern: /\b(sad|depressed|down|upset|disappointed|hurt|crying)\b/gi, emotion: 'sad', intensity: 0.8, weight: 1.0 },
    { pattern: /\b(angry|mad|furious|irritated|annoyed|frustrated|pissed)\b/gi, emotion: 'frustrated', intensity: 0.8, weight: 1.0 },
    { pattern: /\b(worried|anxious|nervous|scared|afraid|fearful|panic)\b/gi, emotion: 'confused', intensity: 0.7, weight: 0.9 },
    { pattern: /\b(confused|puzzled|lost|uncertain|unclear)\b/gi, emotion: 'confused', intensity: 0.6, weight: 0.8 },
    
    // Neutral emotions
    { pattern: /\b(neutral|calm|peaceful|relaxed|content)\b/gi, emotion: 'neutral', intensity: 0.5, weight: 0.6 },
    
    // Energy levels
    { pattern: /\b(tired|exhausted|sleepy|drained|weary)\b/gi, emotion: 'calm', intensity: 0.7, weight: 0.8 },
    { pattern: /\b(energetic|pumped|motivated|inspired|determined)\b/gi, emotion: 'excited', intensity: 0.8, weight: 0.9 },
    { pattern: /\b(curious|interested|wondering|intrigued)\b/gi, emotion: 'curious', intensity: 0.6, weight: 0.7 },
  ];

  // Pre-compiled intensity modifiers
  private intensityModifiers = new Map([
    ['very', 1.3],
    ['extremely', 1.5],
    ['really', 1.2],
    ['quite', 1.1],
    ['somewhat', 0.8],
    ['slightly', 0.7],
    ['a bit', 0.6],
    ['kind of', 0.7],
    ['sort of', 0.7]
  ]);

  constructor() {
    // Start cleanup interval
    setInterval(() => this.cleanupCache(), this.cleanupInterval);
    
    // Setup performance monitoring
    performanceMonitor.onAlert((alert) => {
      if (alert.service === 'emotionalIntelligence') {
        console.warn(`Emotional Intelligence Performance Alert: ${alert.type}`, alert);
      }
    });
  }

  /**
   * Analyze emotional state with performance optimization
   */
  analyzeEmotionalState(content: string, context: Context): EmotionalState {
    return monitorSync('emotionalIntelligence', 'analyzeEmotionalState', () => {
      const cacheKey = this.generateCacheKey(content, context);
      
      // Check cache first
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      // Perform analysis
      const result = this.performEmotionalAnalysis(content, context);
      
      // Cache result
      this.addToCache(cacheKey, result);
      
      return result;
    }, content.length);
  }

  /**
   * Optimized emotional analysis implementation
   */
  private performEmotionalAnalysis(content: string, context: Context): EmotionalState {
    const contentLower = content.toLowerCase();
    const emotionScores = new Map<string, number>();
    
    // Fast pattern matching
    for (const pattern of this.emotionalPatterns) {
      const matches = content.match(pattern.pattern);
      if (matches) {
        const score = matches.length * pattern.intensity * pattern.weight;
        const currentScore = emotionScores.get(pattern.emotion) || 0;
        emotionScores.set(pattern.emotion, currentScore + score);
      }
    }

    // Apply intensity modifiers
    this.applyIntensityModifiers(contentLower, emotionScores);

    // Determine primary emotion
    const primaryEmotion = this.findPrimaryEmotion(emotionScores);
    const intensity = this.calculateIntensity(emotionScores, primaryEmotion);
    const confidence = this.calculateConfidence(emotionScores, primaryEmotion);

    return {
      primary: primaryEmotion,
      secondary: this.findSecondaryEmotion(emotionScores, primaryEmotion),
      intensity,
      confidence,
      indicators: this.extractEmotionalIndicators(emotionScores),
      trend: this.calculateEmotionalTrend(context, primaryEmotion)
    };
  }

  /**
   * Apply intensity modifiers to emotion scores
   */
  private applyIntensityModifiers(content: string, emotionScores: Map<string, number>): void {
    for (const [modifier, multiplier] of this.intensityModifiers) {
      if (content.includes(modifier)) {
        for (const [emotion, score] of emotionScores) {
          emotionScores.set(emotion, score * multiplier);
        }
      }
    }
  }

  /**
   * Find the primary emotion from scores
   */
  private findPrimaryEmotion(emotionScores: Map<string, number>): string {
    if (emotionScores.size === 0) return 'neutral';
    
    let maxEmotion = 'neutral';
    let maxScore = 0;
    
    for (const [emotion, score] of emotionScores) {
      if (score > maxScore) {
        maxScore = score;
        maxEmotion = emotion;
      }
    }
    
    return maxEmotion;
  }

  /**
   * Find secondary emotion
   */
  private findSecondaryEmotion(emotionScores: Map<string, number>, primaryEmotion: string): string | undefined {
    let secondaryEmotion: string | undefined;
    let secondaryScore = 0;
    
    for (const [emotion, score] of emotionScores) {
      if (emotion !== primaryEmotion && score > secondaryScore) {
        secondaryScore = score;
        secondaryEmotion = emotion;
      }
    }
    
    return secondaryScore > 0.3 ? secondaryEmotion : undefined;
  }

  /**
   * Calculate emotion intensity
   */
  private calculateIntensity(emotionScores: Map<string, number>, primaryEmotion: string): number {
    const score = emotionScores.get(primaryEmotion) || 0;
    const maxPossibleScore = 10; // Approximate maximum
    return Math.min(score / maxPossibleScore, 1.0);
  }

  /**
   * Calculate confidence in emotion detection
   */
  private calculateConfidence(emotionScores: Map<string, number>, primaryEmotion: string): number {
    const primaryScore = emotionScores.get(primaryEmotion) || 0;
    const totalScore = Array.from(emotionScores.values()).reduce((sum, score) => sum + score, 0);
    
    if (totalScore === 0) return 0.3; // Low confidence for neutral
    
    const dominance = primaryScore / totalScore;
    const strength = Math.min(primaryScore / 5, 1); // Normalize to 0-1
    
    return Math.min(dominance * strength, 1.0);
  }

  /**
   * Extract emotional indicators
   */
  private extractEmotionalIndicators(emotionScores: Map<string, number>): string[] {
    const indicators: string[] = [];
    
    for (const [emotion, score] of emotionScores) {
      if (score > 0.3) {
        indicators.push(`${emotion}_${score > 0.7 ? 'strong' : 'moderate'}`);
      }
    }
    
    return indicators;
  }

  /**
   * Calculate emotional trend
   */
  private calculateEmotionalTrend(context: Context, currentEmotion: string): 'improving' | 'declining' | 'stable' {
    const previousEmotion = context.immediate?.currentUserEmotion || 'neutral';
    
    if (previousEmotion === currentEmotion) return 'stable';
    
    const positiveEmotions = ['happy', 'excited', 'curious'];
    const negativeEmotions = ['sad', 'frustrated', 'confused'];
    
    const prevPositive = positiveEmotions.includes(previousEmotion);
    const currPositive = positiveEmotions.includes(currentEmotion);
    const prevNegative = negativeEmotions.includes(previousEmotion);
    const currNegative = negativeEmotions.includes(currentEmotion);
    
    if (!prevPositive && currPositive) return 'improving';
    if (prevPositive && !currPositive) return 'declining';
    if (prevNegative && !currNegative) return 'improving';
    if (!prevNegative && currNegative) return 'declining';
    
    return 'stable';
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(content: string, context: Context): string {
    // Create a hash-like key based on content and relevant context
    const contextHash = [
      context.immediate?.currentUserEmotion || 'neutral',
      context.immediate?.conversationFlow.currentPhase || 'greeting',
      context.immediate?.activeTopics?.join(',') || ''
    ].join('|');
    
    return `${content.slice(0, 100)}|${contextHash}`;
  }

  /**
   * Get from cache
   */
  private getFromCache(key: string): EmotionalState | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    // Check if expired
    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    
    // Update access count
    cached.accessCount++;
    cached.timestamp = Date.now();
    
    return cached.result;
  }

  /**
   * Add to cache
   */
  private addToCache(key: string, result: EmotionalState): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.findOldestCacheEntry();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
    this.cache.set(key, {
      key,
      result,
      timestamp: Date.now(),
      accessCount: 1
    });
  }

  /**
   * Find oldest cache entry
   */
  private findOldestCacheEntry(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }
    
    return oldestKey;
  }

  /**
   * Cleanup expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > this.cacheTimeout) {
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => this.cache.delete(key));
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number; maxSize: number } {
    const totalRequests = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.accessCount, 0);
    const hitRate = totalRequests > 0 ? this.cache.size / totalRequests : 0;
    
    return {
      size: this.cache.size,
      hitRate,
      maxSize: this.maxCacheSize
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Export optimized instance
export const optimizedEmotionalIntelligence = new OptimizedEmotionalIntelligence(); 