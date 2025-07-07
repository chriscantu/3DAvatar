// Memory system for the 3D Avatar project
// Manages short-term, long-term, and working memory for conversation continuity

import type { 
  MemorySystem,
  ShortTermMemory,
  LongTermMemory,
  WorkingMemory,
  Context,
  UserProfile,
  SignificantInteraction,
  LearnedPreference,
  RelationshipProgress,
  ActiveProcess,
  MemoryLimits
} from '../types/context';
import type { ChatMessage } from '../types/common';

/**
 * Comprehensive Memory Management System
 * Handles different types of memory for intelligent conversation continuity
 */
export class AvatarMemorySystem implements MemorySystem {
  shortTermMemory: ShortTermMemoryManager;
  longTermMemory: LongTermMemoryManager;
  workingMemory: WorkingMemoryManager;

  private memoryLimits: MemoryLimits;
  private eventListeners = new Map<string, Array<(data: Record<string, unknown>) => void>>();

  constructor(limits: Partial<MemoryLimits> = {}) {
    this.memoryLimits = {
      shortTerm: limits.shortTerm ?? 50,      // 50 messages
      longTerm: limits.longTerm ?? 1000,      // 1000 interactions
      workingMemory: limits.workingMemory ?? 20 // 20 active processes
    };

    this.shortTermMemory = new ShortTermMemoryManager(this.memoryLimits.shortTerm);
    this.longTermMemory = new LongTermMemoryManager(this.memoryLimits.longTerm);
    this.workingMemory = new WorkingMemoryManager(this.memoryLimits.workingMemory);
  }

  /**
   * Process and store a new message across all memory systems
   */
  processMessage(message: ChatMessage, context: Context): void {
    // Store in short-term memory
    this.shortTermMemory.addMessage(message);

    // Update working memory with current context
    this.workingMemory.updateContext(context);

    // Analyze for long-term significance
    if (this.isSignificantInteraction(message, context)) {
      const interaction = this.createSignificantInteraction(message, context);
      this.longTermMemory.storeSignificantInteraction(interaction);
    }

    // Extract and learn preferences
    const preferences = this.extractPreferences(message, context);
    preferences.forEach(pref => this.longTermMemory.updatePreference(pref));

    // Emit memory update event
    this.emitEvent('memory_updated', {
      messageId: message.id,
      timestamp: new Date(),
      memoryTypes: ['short_term', 'working']
    });
  }

  /**
   * Retrieve relevant memories for context building
   */
  getRelevantMemories(query: string, limit: number = 10): RelevantMemoryResult {
    const shortTerm = this.shortTermMemory.getRecentMessages(limit);
    const longTerm = this.longTermMemory.searchSignificantInteractions(query, limit);
    const preferences = this.longTermMemory.getRelevantPreferences(query);

    return {
      recentMessages: shortTerm,
      significantInteractions: longTerm,
      learnedPreferences: preferences,
      relevanceScore: this.calculateRelevanceScore(query, shortTerm, longTerm)
    };
  }

  /**
   * Update user relationship progress
   */
  updateRelationshipProgress(progress: Partial<RelationshipProgress>): void {
    this.longTermMemory.updateRelationshipProgress(progress);
    
    this.emitEvent('relationship_updated', {
      progress,
      timestamp: new Date()
    });
  }

  /**
   * Get comprehensive memory statistics
   */
  getMemoryStats(): MemoryStats {
    return {
      shortTerm: this.shortTermMemory.getStats(),
      longTerm: this.longTermMemory.getStats(),
      working: this.workingMemory.getStats(),
      memoryLimits: this.memoryLimits,
      totalMemoryUsage: this.calculateTotalMemoryUsage()
    };
  }

  /**
   * Clear all memories (with optional preservation of long-term data)
   */
  clearMemories(preserveLongTerm: boolean = true): void {
    this.shortTermMemory.clear();
    this.workingMemory.clear();
    
    if (!preserveLongTerm) {
      this.longTermMemory.clear();
    }

    this.emitEvent('memory_cleared', {
      preservedLongTerm: preserveLongTerm,
      timestamp: new Date()
    });
  }

  /**
   * Add event listener
   */
  on(event: string, listener: (data: Record<string, unknown>) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * Remove event listener
   */
  off(event: string, listener: (data: Record<string, unknown>) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Private methods

  private isSignificantInteraction(message: ChatMessage, context: Context): boolean {
    // Determine significance based on various factors
    const factors = [
      message.content.length > 100, // Longer messages might be more significant
      context.immediate.currentUserEmotion !== 'neutral', // Emotional content
      message.content.includes('remember'), // Explicit memory requests
      message.content.includes('important'), // Explicit importance markers
      // Add more significance criteria here
    ];

    return factors.filter(Boolean).length >= 2; // At least 2 factors must be true
  }

  private createSignificantInteraction(message: ChatMessage, context: Context): SignificantInteraction {
    return {
      id: `interaction_${message.id}`,
      timestamp: new Date(message.timestamp),
      summary: this.summarizeInteraction(message, context),
      impact: this.calculateInteractionImpact(message, context),
      emotionalResonance: this.calculateEmotionalResonance(context),
      topics: this.extractTopics(message.content)
    };
  }

  private extractPreferences(message: ChatMessage, context: Context): LearnedPreference[] {
    const preferences: LearnedPreference[] = [];
    
    // Extract communication style preferences
    if (message.sender === 'user') {
      if (message.content.length < 50) {
        preferences.push({
          category: 'communication_style',
          preference: 'prefers_brief_responses',
          confidence: 0.3,
          evidence: [message.content],
          lastUpdated: new Date()
        });
      }
      
      // Extract preferences based on user emotion
      if (context.immediate.currentUserEmotion !== 'neutral') {
        preferences.push({
          category: 'emotional_response',
          preference: `responds_well_to_${context.immediate.currentUserEmotion}_tone`,
          confidence: 0.4,
          evidence: [message.content],
          lastUpdated: new Date()
        });
      }
    }

    return preferences;
  }

  private summarizeInteraction(message: ChatMessage, context: Context): string {
    // Simple summarization - in production, this could use AI summarization
    const emotion = context.immediate.currentUserEmotion;
    const topics = context.immediate.activeTopics.slice(0, 2).join(', ');
    
    return `${emotion} discussion about ${topics}: "${message.content.substring(0, 100)}..."`;
  }

  private calculateInteractionImpact(message: ChatMessage, context: Context): number {
    // Calculate impact based on various factors (0-1 scale)
    let impact = 0.5; // Base impact
    
    if (context.immediate.currentUserEmotion !== 'neutral') {
      impact += 0.2; // Emotional content has higher impact
    }
    
    if (message.content.length > 200) {
      impact += 0.1; // Longer messages might have more impact
    }
    
    return Math.min(impact, 1.0);
  }

  private calculateEmotionalResonance(context: Context): number {
    // Calculate emotional resonance (0-1 scale)
    const emotion = context.immediate.currentUserEmotion;
    const resonanceMap: Record<string, number> = {
      'happy': 0.8,
      'excited': 0.9,
      'sad': 0.7,
      'frustrated': 0.6,
      'confused': 0.4,
      'calm': 0.5,
      'curious': 0.7,
      'neutral': 0.3
    };
    
    return resonanceMap[emotion] || 0.3;
  }

  private extractTopics(content: string): string[] {
    // Simple topic extraction - in production, this could use NLP
    const keywords = content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    return [...new Set(keywords)].slice(0, 5); // Return unique keywords, max 5
  }

  private calculateRelevanceScore(query: string, shortTerm: ChatMessage[], longTerm: SignificantInteraction[]): number {
    // Calculate overall relevance score (0-1 scale)
    let score = 0.0;
    
    // Short-term relevance
    const recentRelevant = shortTerm.filter(msg => 
      msg.content.toLowerCase().includes(query.toLowerCase())
    ).length;
    
    score += (recentRelevant / Math.max(shortTerm.length, 1)) * 0.4;
    
    // Long-term relevance
    const longTermRelevant = longTerm.filter(interaction =>
      interaction.topics.some(topic => topic.includes(query.toLowerCase()))
    ).length;
    
    score += (longTermRelevant / Math.max(longTerm.length, 1)) * 0.6;
    
    return Math.min(score, 1.0);
  }

  private calculateTotalMemoryUsage(): number {
    // Estimate total memory usage in bytes
    const shortTermSize = JSON.stringify(this.shortTermMemory).length * 2;
    const longTermSize = JSON.stringify(this.longTermMemory).length * 2;
    const workingSize = JSON.stringify(this.workingMemory).length * 2;
    
    return shortTermSize + longTermSize + workingSize;
  }

  private emitEvent(event: string, data: Record<string, unknown>): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => listener(data));
  }
}

/**
 * Short-term Memory Manager
 */
class ShortTermMemoryManager implements ShortTermMemory {
  messages: ChatMessage[] = [];
  context: Context[] = [];
  duration: number = 30; // 30 minutes
  capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  addMessage(message: ChatMessage): void {
    this.messages.push(message);
    
    // Remove old messages if over capacity
    if (this.messages.length > this.capacity) {
      this.messages.shift();
    }
  }

  getRecentMessages(limit?: number): ChatMessage[] {
    const maxItems = limit ?? this.messages.length;
    return this.messages.slice(-maxItems);
  }

  addContext(context: Context): void {
    this.context.push(context);
    
    // Keep context array manageable
    if (this.context.length > this.capacity) {
      this.context.shift();
    }
  }

  clear(): void {
    this.messages = [];
    this.context = [];
  }

  getStats(): ShortTermMemoryStats {
    return {
      messageCount: this.messages.length,
      contextCount: this.context.length,
      capacity: this.capacity,
      utilizationRate: this.messages.length / this.capacity,
      oldestMessageAge: this.getOldestMessageAge()
    };
  }

  private getOldestMessageAge(): number {
    if (this.messages.length === 0) return 0;
    
    const oldest = this.messages[0];
    return Date.now() - oldest.timestamp;
  }
}

/**
 * Long-term Memory Manager
 */
class LongTermMemoryManager implements LongTermMemory {
  userProfile: UserProfile;
  significantInteractions: SignificantInteraction[] = [];
  learnedPreferences: LearnedPreference[] = [];
  relationshipProgress: RelationshipProgress;

  private capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    
    // Initialize with default values
    this.userProfile = this.createDefaultUserProfile();
    this.relationshipProgress = this.createDefaultRelationshipProgress();
  }

  storeSignificantInteraction(interaction: SignificantInteraction): void {
    this.significantInteractions.push(interaction);
    
    // Remove oldest interactions if over capacity
    if (this.significantInteractions.length > this.capacity) {
      this.significantInteractions.sort((a, b) => a.impact - b.impact);
      this.significantInteractions.shift();
    }
  }

  searchSignificantInteractions(query: string, limit: number = 10): SignificantInteraction[] {
    const queryLower = query.toLowerCase();
    
    return this.significantInteractions
      .filter(interaction => 
        interaction.summary.toLowerCase().includes(queryLower) ||
        interaction.topics.some(topic => topic.includes(queryLower))
      )
      .sort((a, b) => b.impact - a.impact)
      .slice(0, limit);
  }

  updatePreference(preference: LearnedPreference): void {
    const existing = this.learnedPreferences.find(p => 
      p.category === preference.category && p.preference === preference.preference
    );

    if (existing) {
      // Update existing preference
      existing.confidence = Math.min((existing.confidence + preference.confidence) / 2, 1.0);
      existing.evidence.push(...preference.evidence);
      existing.lastUpdated = preference.lastUpdated;
    } else {
      // Add new preference
      this.learnedPreferences.push(preference);
    }
  }

  getRelevantPreferences(query: string): LearnedPreference[] {
    const queryLower = query.toLowerCase();
    
    return this.learnedPreferences
      .filter(pref => 
        pref.category.toLowerCase().includes(queryLower) ||
        pref.preference.toLowerCase().includes(queryLower)
      )
      .sort((a, b) => b.confidence - a.confidence);
  }

  updateRelationshipProgress(progress: Partial<RelationshipProgress>): void {
    this.relationshipProgress = {
      ...this.relationshipProgress,
      ...progress
    };
  }

  clear(): void {
    this.significantInteractions = [];
    this.learnedPreferences = [];
    this.userProfile = this.createDefaultUserProfile();
    this.relationshipProgress = this.createDefaultRelationshipProgress();
  }

  getStats(): LongTermMemoryStats {
    return {
      interactionCount: this.significantInteractions.length,
      preferenceCount: this.learnedPreferences.length,
      relationshipLevel: this.relationshipProgress.trustLevel,
      capacity: this.capacity,
      averageInteractionImpact: this.calculateAverageImpact()
    };
  }

  private createDefaultUserProfile(): UserProfile {
    return {
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
    };
  }

  private createDefaultRelationshipProgress(): RelationshipProgress {
    return {
      trustLevel: 0.5,
      intimacyLevel: 0.1,
      sharedExperiences: [],
      communicationEvolution: []
    };
  }

  private calculateAverageImpact(): number {
    if (this.significantInteractions.length === 0) return 0;
    
    const totalImpact = this.significantInteractions.reduce((sum, interaction) => 
      sum + interaction.impact, 0
    );
    
    return totalImpact / this.significantInteractions.length;
  }
}

/**
 * Working Memory Manager
 */
class WorkingMemoryManager implements WorkingMemory {
  currentContext: Context;
  activeProcesses: ActiveProcess[] = [];
  temporaryData: Record<string, unknown> = {};

  private capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.currentContext = this.createDefaultContext();
  }

  updateContext(context: Context): void {
    this.currentContext = context;
  }

  addProcess(process: ActiveProcess): void {
    this.activeProcesses.push(process);
    
    // Remove completed processes if over capacity
    if (this.activeProcesses.length > this.capacity) {
      this.activeProcesses = this.activeProcesses.filter(p => p.status !== 'completed');
      
      // If still over capacity, remove oldest
      if (this.activeProcesses.length > this.capacity) {
        this.activeProcesses.shift();
      }
    }
  }

  updateProcess(processId: string, updates: Partial<ActiveProcess>): void {
    const process = this.activeProcesses.find(p => p.id === processId);
    if (process) {
      Object.assign(process, updates);
    }
  }

  getProcess(processId: string): ActiveProcess | null {
    return this.activeProcesses.find(p => p.id === processId) || null;
  }

  removeProcess(processId: string): void {
    this.activeProcesses = this.activeProcesses.filter(p => p.id !== processId);
  }

  setTemporaryData(key: string, value: unknown): void {
    this.temporaryData[key] = value;
  }

  getTemporaryData(key: string): unknown {
    return this.temporaryData[key];
  }

  clearTemporaryData(): void {
    this.temporaryData = {};
  }

  clear(): void {
    this.currentContext = this.createDefaultContext();
    this.activeProcesses = [];
    this.temporaryData = {};
  }

  getStats(): WorkingMemoryStats {
    return {
      activeProcessCount: this.activeProcesses.length,
      temporaryDataSize: Object.keys(this.temporaryData).length,
      hasCurrentContext: true,
      capacity: this.capacity
    };
  }

  private createDefaultContext(): Context {
    return {
      system: {
        avatarPersonality: {
          traits: {
            empathy: 0.5,
            curiosity: 0.5,
            patience: 0.5,
            humor: 'gentle',
            supportiveness: 0.5,
            formality: 0.5,
            enthusiasm: 0.5
          },
          communicationPatterns: {
            greeting: { tone: 'neutral', approach: 'standard', examples: [] },
            questioning: { tone: 'neutral', approach: 'standard', examples: [] },
            explaining: { tone: 'neutral', approach: 'standard', examples: [] },
            encouraging: { tone: 'neutral', approach: 'standard', examples: [] },
            farewells: { tone: 'neutral', approach: 'standard', examples: [] }
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
      },
      session: {
        sessionId: 'default',
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
      },
      immediate: {
        recentMessages: [],
        currentUserEmotion: 'neutral',
        conversationFlow: {
          currentPhase: 'greeting',
          flowState: { momentum: 0.5, depth: 0.5, engagement: 0.5, clarity: 0.5 },
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
  }
}

// Type definitions for memory statistics and results

export interface RelevantMemoryResult {
  recentMessages: ChatMessage[];
  significantInteractions: SignificantInteraction[];
  learnedPreferences: LearnedPreference[];
  relevanceScore: number;
}

export interface MemoryStats {
  shortTerm: ShortTermMemoryStats;
  longTerm: LongTermMemoryStats;
  working: WorkingMemoryStats;
  memoryLimits: MemoryLimits;
  totalMemoryUsage: number;
}

export interface ShortTermMemoryStats {
  messageCount: number;
  contextCount: number;
  capacity: number;
  utilizationRate: number;
  oldestMessageAge: number;
}

export interface LongTermMemoryStats {
  interactionCount: number;
  preferenceCount: number;
  relationshipLevel: number;
  capacity: number;
  averageInteractionImpact: number;
}

export interface WorkingMemoryStats {
  activeProcessCount: number;
  temporaryDataSize: number;
  hasCurrentContext: boolean;
  capacity: number;
}

/**
 * Create a memory system with default configuration
 */
export function createMemorySystem(limits?: Partial<MemoryLimits>): AvatarMemorySystem {
  return new AvatarMemorySystem(limits);
} 