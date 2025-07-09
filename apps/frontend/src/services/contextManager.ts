// Main context manager for the 3D Avatar project
// Integrates all context management systems for intelligent conversation

import type { 
  Context, 
  SystemContext, 
  SessionContext, 
  ImmediateContext,
  ContextManagerConfig,
  ContextAnalysis,
  ContextEvent,
  ContextEventType,
  UserProfile,
  EmotionState,
  ConversationPhase,
  EnvironmentData
} from '../types/context';
import type { ChatMessage } from '../types/common';
import type { IContextManager, ServiceHealth } from '../interfaces/ServiceInterfaces';

import { LRUContextCache, CacheKeyGenerator, createContextCache } from './contextCache';
import { AvatarMemorySystem, createMemorySystem } from './memorySystem';
import { EmotionalIntelligence } from './emotionalIntelligence';
import { ContextCompressor, createContextCompressor } from './contextCompression';
import { FeedbackCollector, createFeedbackCollector } from './feedbackCollection';
import { ContextValidator, createContextValidator } from './contextValidation';
import type { ConversationSummary } from './contextCompression';
import { AVATAR_PERSONALITY_CONFIG } from '../config/avatarPersonality';

/**
 * Main Context Manager
 * Orchestrates all context management systems for intelligent conversation
 */
export class ContextManager implements IContextManager {
  private cache: LRUContextCache;
  private memory: AvatarMemorySystem;
  private emotionalIntelligence: EmotionalIntelligence;
  private contextCompressor: ContextCompressor;
  private feedbackCollector: FeedbackCollector;
  private contextValidator: ContextValidator;
  private config: ContextManagerConfig;
  private currentSessionId: string;
  private eventListeners = new Map<ContextEventType, Array<(event: ContextEvent) => void>>();
  private isInitialized = false;
  private isHealthy = true;

  constructor(config?: Partial<ContextManagerConfig>) {
    this.config = this.createDefaultConfig(config);
    this.cache = createContextCache(this.config.cache);
    this.memory = createMemorySystem(this.config.memory);
    this.emotionalIntelligence = new EmotionalIntelligence();
    this.contextCompressor = createContextCompressor();
    this.feedbackCollector = createFeedbackCollector();
    this.contextValidator = createContextValidator();
    this.currentSessionId = this.generateSessionId();

    // Set up event forwarding
    this.setupEventForwarding();
  }

  // Service interface methods
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize all sub-services
      await Promise.all([
        this.memory.initialize?.(),
        this.emotionalIntelligence.initialize?.(),
        this.contextCompressor.initialize?.(),
        this.feedbackCollector.initialize?.(),
        this.contextValidator.initialize?.()
      ].filter(Boolean));

      this.isInitialized = true;
      this.isHealthy = true;
    } catch (error) {
      this.isHealthy = false;
      throw new Error(`Failed to initialize ContextManager: ${error}`);
    }
  }

  async shutdown(): Promise<void> {
    try {
      // Shutdown all sub-services
      await Promise.all([
        this.memory.shutdown?.(),
        this.emotionalIntelligence.shutdown?.(),
        this.contextCompressor.shutdown?.(),
        this.feedbackCollector.shutdown?.(),
        this.contextValidator.shutdown?.()
      ].filter(Boolean));

      this.eventListeners.clear();
      this.isInitialized = false;
    } catch (error) {
      console.error('Error during ContextManager shutdown:', error);
    }
  }

  async healthCheck(): Promise<ServiceHealth> {
    const subServiceHealths = await Promise.all([
      this.memory.healthCheck?.() || { status: 'healthy', details: {} },
      this.emotionalIntelligence.healthCheck?.() || { status: 'healthy', details: {} },
      this.contextCompressor.healthCheck?.() || { status: 'healthy', details: {} },
      this.feedbackCollector.healthCheck?.() || { status: 'healthy', details: {} },
      this.contextValidator.healthCheck?.() || { status: 'healthy', details: {} }
    ]);

    const unhealthyServices = subServiceHealths.filter(h => h.status !== 'healthy');
    const status = unhealthyServices.length === 0 ? 'healthy' : 
                  unhealthyServices.length < subServiceHealths.length ? 'degraded' : 'unhealthy';

    return {
      status,
      details: {
        initialized: this.isInitialized,
        sessionId: this.currentSessionId,
        cacheStats: this.cache.getStats(),
        memoryStats: this.memory.getMemoryStats(),
        subServices: {
          memory: subServiceHealths[0],
          emotionalIntelligence: subServiceHealths[1],
          contextCompressor: subServiceHealths[2],
          feedbackCollector: subServiceHealths[3],
          contextValidator: subServiceHealths[4]
        }
      }
    };
  }

  /**
   * Process message to build context
   */
  async processMessage(message: ChatMessage): Promise<Context> {
    try {
      const context = await this.buildContext(message);
      
      // Store in memory
      this.memory.processMessage(message, context);
      
      // Cache the context
      const cacheKey = CacheKeyGenerator.forConversationContext(
        this.currentSessionId, 
        context.session.messageCount
      );
      this.cache.set(cacheKey, context);
      
      // Emit context creation event
      this.emitEvent('context_created', {
        sessionId: this.currentSessionId,
        messageId: message.id,
        contextType: 'conversation',
        timestamp: new Date()
      });

      return context;
    } catch (error) {
      // Fallback to building a minimal context if processing fails
      console.warn('Message processing failed, building fallback context:', error);
      return await this.buildFallbackContext(message.content);
    }
  }

  /**
   * Get context for response generation
   */
  async getContextForResponse(query: string): Promise<Context> {
    try {
      // Try to get from cache first
      const cacheKey = CacheKeyGenerator.forSession(this.currentSessionId);
      let context = this.cache.get(cacheKey);
      
      if (!context) {
        // Build new context if not in cache
        context = await this.buildContextFromMemory(query);
        this.cache.set(cacheKey, context);
      }
      
      return context;
    } catch (error) {
      // Fallback to building a minimal context if cache fails
      console.warn('Context retrieval failed, building fallback context:', error);
      return await this.buildFallbackContext(query);
    }
  }

  /**
   * Analyze context for response optimization
   */
  analyzeContext(context: Context): ContextAnalysis {
    const analysis: ContextAnalysis = {
      relevanceScore: this.calculateRelevanceScore(context),
      emotionalTone: this.analyzeEmotionalTone(context),
      topicClassification: this.classifyTopics(context),
      userIntentAnalysis: this.analyzeUserIntent(context),
      responseRecommendations: this.generateResponseRecommendations(context)
    };

    // Emit analysis event
    this.emitEvent('context_updated', {
      sessionId: this.currentSessionId,
      analysis,
      timestamp: new Date()
    });

    return analysis;
  }

  /**
   * Update user profile based on interaction
   */
  updateUserProfile(updates: Partial<UserProfile>): void {
    this.memory.longTermMemory.userProfile = {
      ...this.memory.longTermMemory.userProfile,
      ...updates
    };
    
    this.emitEvent('memory_updated', {
      type: 'user_profile',
      updates,
      timestamp: new Date()
    });
  }

  /**
   * Get current session context
   */
  getCurrentSessionContext(): SessionContext {
    const memoryStats = this.memory.getMemoryStats();
    
    return {
      sessionId: this.currentSessionId,
      userProfile: this.memory.longTermMemory.userProfile,
      sessionObjectives: this.extractSessionObjectives(),
      conversationThemes: this.extractConversationThemes(),
      startTime: new Date(), // This should be stored when session starts
      messageCount: memoryStats.shortTerm.messageCount
    };
  }

  /**
   * Get comprehensive context statistics
   */
  getContextStats(): ContextStats {
    const memoryStats = this.memory.getMemoryStats();
    const cacheStats = this.cache.getStats();
    
    return {
      session: {
        sessionId: this.currentSessionId,
        messageCount: memoryStats.shortTerm.messageCount,
        duration: 0, // Calculate from session start time
        cacheHitRate: cacheStats.hitRate
      },
      memory: memoryStats,
      cache: cacheStats,
      performance: {
        averageProcessingTime: 0, // Track this over time
        contextBuildTime: 0,
        cacheRetrievalTime: 0
      }
    };
  }

  /**
   * Compress context to optimize size and performance
   */
  compressContext(context: Context): Context {
    const compressionResult = this.contextCompressor.compressContext(context);
    
    // Create compressed context
    const compressedContext: Context = {
      ...context,
      immediate: {
        ...context.immediate,
        recentMessages: compressionResult.retainedMessages
      }
    };
    
    // Emit compression event
    this.emitEvent('context_updated', {
      type: 'compression',
      originalSize: compressionResult.originalSize,
      compressedSize: compressionResult.compressedSize,
      compressionRatio: compressionResult.compressionRatio,
      timestamp: new Date()
    });
    
    return compressedContext;
  }

  /**
   * Get conversation summary
   */
  getConversationSummary(messages?: ChatMessage[]): ConversationSummary {
    const messagesToSummarize = messages || this.memory.shortTermMemory.getRecentMessages(50);
    return this.contextCompressor.summarizeConversation(messagesToSummarize);
  }

  /**
   * Collect user feedback
   */
  collectFeedback(
    userId: string,
    rating: number,
    category: string,
    content: string,
    context?: any
  ): void {
    this.feedbackCollector.collectExplicitFeedback(
      this.currentSessionId,
      userId,
      rating,
      category as any,
      content,
      context
    );
    
    this.emitEvent('context_updated', {
      type: 'feedback_collected',
      sessionId: this.currentSessionId,
      rating,
      category,
      timestamp: new Date()
    });
  }

  /**
   * Get feedback analytics
   */
  getFeedbackAnalytics(): any {
    return this.feedbackCollector.getAnalytics();
  }

  /**
   * Clear session data
   */
  clearSession(preserveUserProfile: boolean = true): void {
    this.memory.clearMemories(preserveUserProfile);
    this.cache.clear();
    this.contextCompressor.clearCache();
    this.currentSessionId = this.generateSessionId();
    
    this.emitEvent('context_expired', {
      reason: 'session_cleared',
      preservedUserProfile: preserveUserProfile,
      timestamp: new Date()
    });
  }

  /**
   * Add event listener
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
   * Destroy and cleanup resources
   */
  destroy(): void {
    this.cache.destroy();
    this.eventListeners.clear();
  }

  // Private methods

  private async buildContext(message: ChatMessage): Promise<Context> {
    const system = this.buildSystemContext();
    const session = this.getCurrentSessionContext();
    const immediate = await this.buildImmediateContext(message);
    
    return {
      system,
      session,
      immediate,
      timestamp: new Date().toISOString()
    };
  }

  private async buildContextFromMemory(query: string): Promise<Context> {
    const relevantMemories = this.memory.getRelevantMemories(query);
    const system = this.buildSystemContext();
    const session = this.getCurrentSessionContext();
    
    const immediate: ImmediateContext = {
      recentMessages: relevantMemories.recentMessages,
      currentUserEmotion: this.detectEmotionFromMemories(relevantMemories.recentMessages),
      conversationFlow: this.analyzeConversationFlow(relevantMemories.recentMessages),
      activeTopics: this.extractActiveTopics(relevantMemories.recentMessages),
      environmentData: this.buildEnvironmentData()
    };
    
    return {
      system,
      session,
      immediate,
      timestamp: new Date().toISOString()
    };
  }

  private async buildFallbackContext(query: string): Promise<Context> {
    // Build a minimal context when errors occur
    const system = this.buildSystemContext();
    
    const session: SessionContext = {
      sessionId: this.currentSessionId,
      userProfile: {
        userId: 'anonymous',
        interactionHistory: [],
        preferences: {
          preferredResponseLength: 'medium',
          formalityLevel: 0.5,
          topicDepth: 'moderate',
          explanationStyle: 'simple'
        },
        communicationStyle: {
          directness: 0.5,
          emotionalExpressiveness: 0.5,
          questioningStyle: 'exploratory'
        },
        topicInterests: []
      },
      sessionObjectives: [],
      conversationThemes: [],
      startTime: new Date(),
      messageCount: 0
    };
    
    const immediate: ImmediateContext = {
      recentMessages: [],
      currentUserEmotion: 'neutral',
      conversationFlow: {
        currentPhase: 'greeting',
        flowState: {
          momentum: 0.5,
          depth: 0.3,
          engagement: 0.5,
          clarity: 0.8
        },
        transitionTriggers: []
      },
      activeTopics: [query],
      environmentData: this.buildEnvironmentData()
    };
    
    return {
      system,
      session,
      immediate,
      timestamp: new Date().toISOString()
    };
  }

  private buildSystemContext(): SystemContext {
    return {
      avatarPersonality: AVATAR_PERSONALITY_CONFIG.personality,
      conversationGuidelines: AVATAR_PERSONALITY_CONFIG.guidelines,
      technicalCapabilities: {
        supportedLanguages: ['en'],
        maxTokens: 2000,
        processingTimeout: 30000,
        cacheSize: this.config.cache.maxSize,
        memoryLimits: this.config.memory
      }
    };
  }

  private async buildImmediateContext(message: ChatMessage): Promise<ImmediateContext> {
    const recentMessages = this.memory.shortTermMemory.getRecentMessages(10);
    
    return {
      recentMessages,
      currentUserEmotion: this.detectEmotion(message),
      conversationFlow: this.analyzeConversationFlow(recentMessages),
      activeTopics: this.extractActiveTopics([...recentMessages, message]),
      environmentData: this.buildEnvironmentData()
    };
  }

  private buildEnvironmentData(): EnvironmentData {
    const now = new Date();
    const hour = now.getHours();
    
    let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    if (hour < 12) timeOfDay = 'morning';
    else if (hour < 17) timeOfDay = 'afternoon';
    else if (hour < 22) timeOfDay = 'evening';
    else timeOfDay = 'night';
    
    return {
      timeOfDay,
      userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      sessionDuration: 0, // Calculate from session start
      activeFeatures: ['chat', 'voice', '3d_avatar'],
      deviceType: this.detectDeviceType(),
      networkQuality: 'good' // Could be detected dynamically
    };
  }

  private buildMinimalContext(message: ChatMessage): Context {
    return {
      system: this.buildSystemContext(),
      session: this.getCurrentSessionContext(),
      immediate: {
        recentMessages: [message],
        currentUserEmotion: 'neutral',
        conversationFlow: {
          currentPhase: 'exploration',
          flowState: {
            momentum: 0.5,
            depth: 0.5,
            engagement: 0.5,
            clarity: 0.5
          },
          transitionTriggers: []
        },
        activeTopics: [],
        environmentData: this.buildEnvironmentData()
      },
      timestamp: new Date().toISOString()
    };
  }

  private detectEmotion(message: ChatMessage): EmotionState {
    // Use emotional intelligence for enhanced emotion detection
    try {
      const context = this.buildMinimalContext(message);
      const analysis = this.emotionalIntelligence.analyzeEmotionalState(message.content, context);
      
      // Update emotional patterns
      this.emotionalIntelligence.updateEmotionalPattern(
        context.session.userProfile.userId, 
        analysis.detectedEmotion, 
        message.content
      );
      
      // Map detected emotion to EmotionState
      const emotionMap: Record<string, EmotionState> = {
        'happy': 'happy',
        'sad': 'sad',
        'excited': 'excited',
        'calm': 'calm',
        'angry': 'frustrated',
        'frustrated': 'frustrated',
        'confused': 'confused',
        'curious': 'curious',
        'anxious': 'frustrated',
        'positive': 'happy',
        'negative': 'sad'
      };
      
      return emotionMap[analysis.detectedEmotion] || 'neutral';
    } catch {
      // Fallback to simple emotion detection
      const content = message.content.toLowerCase();
      
      if (content.includes('happy') || content.includes('great') || content.includes('awesome')) {
        return 'happy';
      }
      if (content.includes('sad') || content.includes('upset') || content.includes('disappointed')) {
        return 'sad';
      }
      if (content.includes('excited') || content.includes('amazing') || content.includes('wow')) {
        return 'excited';
      }
      if (content.includes('confused') || content.includes('don\'t understand') || content.includes('what')) {
        return 'confused';
      }
      if (content.includes('frustrated') || content.includes('annoyed') || content.includes('irritated')) {
        return 'frustrated';
      }
      if (content.includes('curious') || content.includes('interested') || content.includes('wonder')) {
        return 'curious';
      }
      if (content.includes('calm') || content.includes('peaceful') || content.includes('relaxed')) {
        return 'calm';
      }
      
      return 'neutral';
    }
  }

  private detectEmotionFromMemories(messages: ChatMessage[]): EmotionState {
    if (messages.length === 0) return 'neutral';
    
    const lastMessage = messages[messages.length - 1];
    return this.detectEmotion(lastMessage);
  }

  private analyzeConversationFlow(messages: ChatMessage[]) {
    const currentPhase: ConversationPhase = this.determineConversationPhase(messages);
    
    return {
      currentPhase,
      flowState: {
        momentum: this.calculateMomentum(messages),
        depth: this.calculateDepth(messages),
        engagement: this.calculateEngagement(messages),
        clarity: this.calculateClarity(messages)
      },
      transitionTriggers: [] // Could be populated with learned triggers
    };
  }

  private determineConversationPhase(messages: ChatMessage[]): ConversationPhase {
    if (messages.length === 0) return 'greeting';
    if (messages.length < 3) return 'exploration';
    if (messages.length < 10) return 'deep_discussion';
    return 'conclusion';
  }

  private calculateMomentum(messages: ChatMessage[]): number {
    if (messages.length < 2) return 0.5;
    
    const recentMessages = messages.slice(-5);
    const avgLength = recentMessages.reduce((sum, msg) => sum + msg.content.length, 0) / recentMessages.length;
    
    return Math.min(avgLength / 200, 1.0); // Normalize to 0-1
  }

  private calculateDepth(messages: ChatMessage[]): number {
    if (messages.length === 0) return 0.1;
    
    const avgLength = messages.reduce((sum, msg) => sum + msg.content.length, 0) / messages.length;
    return Math.min(avgLength / 300, 1.0); // Normalize to 0-1
  }

  private calculateEngagement(messages: ChatMessage[]): number {
    if (messages.length === 0) return 0.5;
    
    const userMessages = messages.filter(msg => msg.sender === 'user');
    const engagementScore = userMessages.length / messages.length;
    
    return Math.min(engagementScore * 2, 1.0); // Normalize to 0-1
  }

  private calculateClarity(messages: ChatMessage[]): number {
    // Simple clarity metric based on question frequency
    if (messages.length === 0) return 0.8;
    
    const questionCount = messages.filter(msg => msg.content.includes('?')).length;
    const clarityScore = 1.0 - (questionCount / messages.length);
    
    return Math.max(clarityScore, 0.1); // Minimum 0.1
  }

  private extractActiveTopics(messages: ChatMessage[]): string[] {
    if (messages.length === 0) return [];
    
    const allWords = messages
      .map(msg => msg.content.toLowerCase())
      .join(' ')
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    // Count word frequency
    const wordCounts = allWords.reduce((counts, word) => {
      counts[word] = (counts[word] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    // Return top 5 most frequent words as topics
    return Object.entries(wordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  private extractSessionObjectives(): string[] {
    // Extract objectives from conversation patterns
    const memories = this.memory.getRelevantMemories('goal objective want need');
    return memories.learnedPreferences
      .filter(pref => pref.category === 'objectives')
      .map(pref => pref.preference);
  }

  private extractConversationThemes(): import('../types/context').ConversationTheme[] {
    const topics = this.memory.longTermMemory.significantInteractions
      .flatMap(interaction => interaction.topics);
    
    const themeCounts = topics.reduce((counts, topic) => {
      counts[topic] = (counts[topic] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    return Object.entries(themeCounts).map(([theme, frequency]) => ({
      theme,
      frequency,
      recency: 0.8, // Could be calculated based on timestamps
      userEngagement: 0.7, // Could be calculated based on message patterns
      relatedTopics: []
    }));
  }

  private detectDeviceType(): 'desktop' | 'tablet' | 'mobile' {
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent;
      if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
        return 'tablet';
      }
      if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
        return 'mobile';
      }
    }
    return 'desktop';
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createDefaultConfig(config?: Partial<ContextManagerConfig>): ContextManagerConfig {
    return {
      cache: {
        maxSize: config?.cache?.maxSize ?? 100,
        defaultTTL: config?.cache?.defaultTTL ?? 1800, // 30 minutes
        cleanupInterval: config?.cache?.cleanupInterval ?? 300, // 5 minutes
        compressionEnabled: config?.cache?.compressionEnabled ?? false
      },
      memory: {
        shortTerm: config?.memory?.shortTerm ?? 50,
        longTerm: config?.memory?.longTerm ?? 1000,
        workingMemory: config?.memory?.workingMemory ?? 20
      },
      processing: {
        maxProcessingTime: config?.processing?.maxProcessingTime ?? 5000,
        batchSize: config?.processing?.batchSize ?? 10,
        priorityLevels: config?.processing?.priorityLevels ?? 3
      },
      validation: {
        enabled: config?.validation?.enabled ?? true,
        rules: config?.validation?.rules ?? [],
        strictMode: config?.validation?.strictMode ?? false
      }
    };
  }

  private setupEventForwarding(): void {
    // Forward cache events
    this.cache.on('context_cached', (event) => {
      this.emitEvent('context_cached', event.payload);
    });
    
    this.cache.on('context_retrieved', (event) => {
      this.emitEvent('context_retrieved', event.payload);
    });
    
    this.cache.on('context_expired', (event) => {
      this.emitEvent('context_expired', event.payload);
    });
    
    // Forward memory events
    this.memory.on('memory_updated', (data) => {
      this.emitEvent('memory_updated', data);
    });
  }

  private calculateRelevanceScore(context: Context): number {
    // Calculate relevance based on various factors
    const factors = [
      context.immediate.recentMessages.length > 0 ? 1.0 : 0.5,
      context.immediate.activeTopics.length > 0 ? 1.0 : 0.5,
      context.immediate.currentUserEmotion !== 'neutral' ? 1.0 : 0.7,
      context.session.messageCount > 0 ? 1.0 : 0.5
    ];
    
    return factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
  }

  private analyzeEmotionalTone(context: Context): import('../types/context').EmotionAnalysis {
    const emotion = context.immediate.currentUserEmotion;
    
    return {
      primary: emotion,
      secondary: undefined,
      intensity: emotion === 'neutral' ? 0.3 : 0.7,
      confidence: 0.8,
      triggers: context.immediate.activeTopics.slice(0, 3)
    };
  }

  private classifyTopics(context: Context): import('../types/context').TopicClassification[] {
    return context.immediate.activeTopics.map(topic => ({
      topic,
      confidence: 0.7,
      category: 'general',
      relevance: 0.8
    }));
  }

  private analyzeUserIntent(context: Context): import('../types/context').UserIntentAnalysis {
    const lastMessage = context.immediate.recentMessages[context.immediate.recentMessages.length - 1];
    
    if (!lastMessage) {
      return {
        primaryIntent: 'greeting',
        secondaryIntents: [],
        confidence: 0.5,
        actionRequired: false,
        urgency: 'low'
      };
    }
    
    const content = lastMessage.content.toLowerCase();
    
    if (content.includes('help') || content.includes('how') || content.includes('what')) {
      return {
        primaryIntent: 'seeking_information',
        secondaryIntents: ['clarification'],
        confidence: 0.8,
        actionRequired: true,
        urgency: 'medium'
      };
    }
    
    return {
      primaryIntent: 'conversation',
      secondaryIntents: [],
      confidence: 0.7,
      actionRequired: false,
      urgency: 'low'
    };
  }

  private generateResponseRecommendations(context: Context): import('../types/context').ResponseRecommendation[] {
    const recommendations: import('../types/context').ResponseRecommendation[] = [];
    
    if (context.immediate.currentUserEmotion === 'confused') {
      recommendations.push({
        type: 'clarification',
        priority: 0.9,
        suggestion: 'Provide clear, simple explanation',
        reasoning: 'User appears confused based on emotional analysis'
      });
    }
    
    if (context.immediate.activeTopics.length > 0) {
      recommendations.push({
        type: 'information',
        priority: 0.7,
        suggestion: `Continue discussion about ${context.immediate.activeTopics[0]}`,
        reasoning: 'User is actively engaged with this topic'
      });
    }
    
    return recommendations;
  }

  private emitEvent(type: ContextEventType, payload: Record<string, unknown>): void {
    const event: ContextEvent = {
      type,
      payload,
      timestamp: new Date(),
      source: 'ContextManager'
    };
    
    const listeners = this.eventListeners.get(type) || [];
    listeners.forEach(listener => listener(event));
  }
}

// Additional types for context statistics
export interface ContextStats {
  session: {
    sessionId: string;
    messageCount: number;
    duration: number;
    cacheHitRate: number;
  };
  memory: import('./memorySystem').MemoryStats;
  cache: import('./contextCache').CacheStats;
  performance: {
    averageProcessingTime: number;
    contextBuildTime: number;
    cacheRetrievalTime: number;
  };
}

/**
 * Create a context manager with default configuration
 */
export function createContextManager(config?: Partial<ContextManagerConfig>): ContextManager {
  return new ContextManager(config);
} 