import type { ChatMessage } from '../types/common';
import type { Context, SignificantInteraction, ConversationTheme } from '../types/context';

/**
 * Context Compression Service for Avatar System
 * 
 * Provides conversation summarization and context size optimization to maintain
 * relevant context while managing memory and processing efficiency.
 */

export interface CompressionConfig {
  maxContextSize: number; // Maximum context size in tokens/characters
  summaryRatio: number; // Ratio of original to summary (0.1 = 10% of original)
  retentionPeriod: number; // How long to keep full context (in messages)
  compressionThreshold: number; // When to trigger compression (context size)
  qualityThreshold: number; // Minimum quality score to retain content
}

export interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  summary: string;
  keyPoints: string[];
  retainedMessages: ChatMessage[];
  metadata: CompressionMetadata;
}

export interface CompressionMetadata {
  timestamp: Date;
  method: 'extractive' | 'abstractive' | 'hybrid';
  qualityScore: number;
  topicsRetained: string[];
  emotionalTone: string;
  confidenceScore: number;
}

export interface ConversationSummary {
  id: string;
  timespan: { start: Date; end: Date };
  participantCount: number;
  messageCount: number;
  summary: string;
  keyTopics: string[];
  significantMoments: SignificantMoment[];
  emotionalArc: EmotionalArc;
  actionItems: ActionItem[];
  quality: SummaryQuality;
}

export interface SignificantMoment {
  timestamp: Date;
  type: 'insight' | 'decision' | 'emotion' | 'topic_change' | 'breakthrough';
  description: string;
  importance: number; // 0-1
  context: string;
}

export interface EmotionalArc {
  startEmotion: string;
  endEmotion: string;
  peaks: { timestamp: Date; emotion: string; intensity: number }[];
  overallTrend: 'positive' | 'negative' | 'neutral' | 'mixed';
}

export interface ActionItem {
  description: string;
  priority: 'low' | 'medium' | 'high';
  deadline?: Date;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface SummaryQuality {
  coherence: number; // 0-1
  completeness: number; // 0-1
  conciseness: number; // 0-1
  relevance: number; // 0-1
  overall: number; // 0-1
}

export class ContextCompressor {
  private config: CompressionConfig;
  private summaryCache: Map<string, ConversationSummary> = new Map();
  private compressionStats: CompressionStats = {
    totalCompressions: 0,
    averageCompressionRatio: 0,
    totalSpaceSaved: 0,
    processingTime: 0
  };

  constructor(config?: Partial<CompressionConfig>) {
    this.config = this.createDefaultConfig(config);
  }

  /**
   * Compress a context to reduce size while maintaining key information
   */
  compressContext(context: Context): CompressionResult {
    const startTime = Date.now();
    
    try {
      const originalSize = this.calculateContextSize(context);
      
      if (originalSize <= this.config.compressionThreshold) {
        return this.createNoCompressionResult(context, originalSize);
      }

      // Extract key information
      const keyMessages = this.extractKeyMessages(context.immediate.recentMessages);
      const summary = this.generateContextSummary(context);
      const keyPoints = this.extractKeyPoints(context);
      
      const compressedSize = this.calculateCompressedSize(summary, keyPoints, keyMessages);
      const compressionRatio = compressedSize / originalSize;
      
      const result: CompressionResult = {
        originalSize,
        compressedSize,
        compressionRatio,
        summary,
        keyPoints,
        retainedMessages: keyMessages,
        metadata: {
          timestamp: new Date(),
          method: 'hybrid',
          qualityScore: this.calculateQualityScore(summary, keyPoints),
          topicsRetained: this.extractTopics(keyMessages),
          emotionalTone: context.immediate.currentUserEmotion,
          confidenceScore: this.calculateConfidenceScore(keyMessages, summary)
        }
      };

      this.updateCompressionStats(result, Date.now() - startTime);
      return result;
    } catch (error) {
      console.warn('Context compression failed:', error);
      return this.createNoCompressionResult(context, this.calculateContextSize(context));
    }
  }

  /**
   * Create a comprehensive conversation summary
   */
  summarizeConversation(messages: ChatMessage[], timespan?: { start: Date; end: Date }): ConversationSummary {
    const id = this.generateSummaryId(messages);
    const cached = this.summaryCache.get(id);
    
    if (cached) {
      return cached;
    }

    const summary: ConversationSummary = {
      id,
      timespan: timespan || this.calculateTimespan(messages),
      participantCount: this.countParticipants(messages),
      messageCount: messages.length,
      summary: this.generateConversationSummary(messages),
      keyTopics: this.extractKeyTopics(messages),
      significantMoments: this.identifySignificantMoments(messages),
      emotionalArc: this.analyzeEmotionalArc(messages),
      actionItems: this.extractActionItems(messages),
      quality: this.assessSummaryQuality(messages)
    };

    this.summaryCache.set(id, summary);
    return summary;
  }

  /**
   * Compress conversation history while preserving important context
   */
  compressConversationHistory(messages: ChatMessage[], maxSize: number): ChatMessage[] {
    if (messages.length <= maxSize) {
      return messages;
    }

    // Always keep the most recent messages
    const recentCount = Math.floor(maxSize * 0.4);
    const recentMessages = messages.slice(-recentCount);
    
    // Select important messages from the rest
    const olderMessages = messages.slice(0, -recentCount);
    const importantMessages = this.selectImportantMessages(olderMessages, maxSize - recentCount);
    
    return [...importantMessages, ...recentMessages];
  }

  /**
   * Get compression statistics
   */
  getCompressionStats(): CompressionStats {
    return { ...this.compressionStats };
  }

  /**
   * Clear compression cache
   */
  clearCache(): void {
    this.summaryCache.clear();
  }

  private createDefaultConfig(config?: Partial<CompressionConfig>): CompressionConfig {
    return {
      maxContextSize: config?.maxContextSize ?? 4000,
      summaryRatio: config?.summaryRatio ?? 0.2,
      retentionPeriod: config?.retentionPeriod ?? 20,
      compressionThreshold: config?.compressionThreshold ?? 3000,
      qualityThreshold: config?.qualityThreshold ?? 0.7
    };
  }

  private calculateContextSize(context: Context): number {
    // Simple size calculation based on string length
    const systemSize = JSON.stringify(context.system).length;
    const sessionSize = JSON.stringify(context.session).length;
    const immediateSize = JSON.stringify(context.immediate).length;
    
    return systemSize + sessionSize + immediateSize;
  }

  private extractKeyMessages(messages: ChatMessage[]): ChatMessage[] {
    if (messages.length <= this.config.retentionPeriod) {
      return messages;
    }

    // Score messages by importance
    const scoredMessages = messages.map(msg => ({
      message: msg,
      score: this.calculateMessageImportance(msg, messages)
    }));

    // Sort by score and keep top messages
    scoredMessages.sort((a, b) => b.score - a.score);
    
    const keepCount = Math.min(this.config.retentionPeriod, messages.length);
    return scoredMessages.slice(0, keepCount).map(item => item.message);
  }

  private calculateMessageImportance(message: ChatMessage, allMessages: ChatMessage[]): number {
    let score = 0;

    // Length factor (longer messages might be more important)
    score += Math.min(message.content.length / 200, 1) * 0.3;

    // Question factor (questions are often important)
    if (message.content.includes('?')) {
      score += 0.4;
    }

    // Emotional content factor
    const emotionalWords = ['feel', 'think', 'believe', 'important', 'need', 'want', 'love', 'hate'];
    const emotionalCount = emotionalWords.filter(word => 
      message.content.toLowerCase().includes(word)
    ).length;
    score += Math.min(emotionalCount / emotionalWords.length, 1) * 0.3;

    // Recency factor (more recent messages are more important)
    const messageIndex = allMessages.findIndex(msg => msg.id === message.id);
    const recencyScore = messageIndex / allMessages.length;
    score += recencyScore * 0.2;

    return score;
  }

  private generateContextSummary(context: Context): string {
    const recentMessages = context.immediate.recentMessages.slice(-5);
    const topics = context.immediate.activeTopics.slice(0, 3);
    const emotion = context.immediate.currentUserEmotion;
    
    let summary = `Recent conversation focused on ${topics.join(', ') || 'general topics'}.`;
    
    if (emotion !== 'neutral') {
      summary += ` User appears to be feeling ${emotion}.`;
    }
    
    if (recentMessages.length > 0) {
      const lastMessage = recentMessages[recentMessages.length - 1];
      summary += ` Last interaction: "${this.truncateText(lastMessage.content, 100)}"`;
    }

    return summary;
  }

  private extractKeyPoints(context: Context): string[] {
    const keyPoints: string[] = [];
    
    // Extract from active topics
    context.immediate.activeTopics.forEach(topic => {
      keyPoints.push(`Discussion about ${topic}`);
    });

    // Extract from conversation themes
    context.session.conversationThemes.slice(0, 3).forEach(theme => {
      keyPoints.push(`${theme.theme} (${theme.frequency} mentions)`);
    });

    // Extract from user preferences
    const preferences = context.session.userProfile.preferences;
    if (preferences.preferredResponseLength !== 'medium') {
      keyPoints.push(`Prefers ${preferences.preferredResponseLength} responses`);
    }

    return keyPoints.slice(0, 5); // Limit to 5 key points
  }

  private generateConversationSummary(messages: ChatMessage[]): string {
    if (messages.length === 0) {
      return 'No conversation to summarize.';
    }

    const userMessages = messages.filter(msg => msg.sender === 'user');
    const assistantMessages = messages.filter(msg => msg.sender === 'assistant');
    
    const topics = this.extractKeyTopics(messages);
    const topicSummary = topics.length > 0 ? `Main topics: ${topics.join(', ')}.` : '';
    
    const lengthSummary = `${userMessages.length} user messages, ${assistantMessages.length} assistant responses.`;
    
    return `${lengthSummary} ${topicSummary}`.trim();
  }

  private extractKeyTopics(messages: ChatMessage[]): string[] {
    const allText = messages.map(msg => msg.content).join(' ').toLowerCase();
    const words = allText.split(/\s+/).filter(word => word.length > 3);
    
    // Count word frequency
    const wordCounts = words.reduce((counts, word) => {
      counts[word] = (counts[word] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    // Return top 3 most frequent words as topics
    return Object.entries(wordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([word]) => word);
  }

  private identifySignificantMoments(messages: ChatMessage[]): SignificantMoment[] {
    const moments: SignificantMoment[] = [];
    
    messages.forEach((message, index) => {
      // Look for emotional peaks
      if (this.isEmotionalPeak(message)) {
        moments.push({
          timestamp: new Date(message.timestamp),
          type: 'emotion',
          description: `Strong emotional expression: "${this.truncateText(message.content, 50)}"`,
          importance: 0.8,
          context: this.getMessageContext(messages, index)
        });
      }

      // Look for insights or decisions
      if (this.isInsightOrDecision(message)) {
        moments.push({
          timestamp: new Date(message.timestamp),
          type: 'insight',
          description: `Key insight: "${this.truncateText(message.content, 50)}"`,
          importance: 0.7,
          context: this.getMessageContext(messages, index)
        });
      }
    });

    return moments.sort((a, b) => b.importance - a.importance).slice(0, 5);
  }

  private analyzeEmotionalArc(messages: ChatMessage[]): EmotionalArc {
    const emotionalPeaks: { timestamp: Date; emotion: string; intensity: number }[] = [];
    
    messages.forEach(message => {
      const emotion = this.detectMessageEmotion(message);
      if (emotion !== 'neutral') {
        emotionalPeaks.push({
          timestamp: new Date(message.timestamp),
          emotion,
          intensity: this.calculateEmotionalIntensity(message)
        });
      }
    });

    const startEmotion = emotionalPeaks.length > 0 ? emotionalPeaks[0].emotion : 'neutral';
    const endEmotion = emotionalPeaks.length > 0 ? emotionalPeaks[emotionalPeaks.length - 1].emotion : 'neutral';
    
    return {
      startEmotion,
      endEmotion,
      peaks: emotionalPeaks,
      overallTrend: this.determineEmotionalTrend(emotionalPeaks)
    };
  }

  private extractActionItems(messages: ChatMessage[]): ActionItem[] {
    const actionItems: ActionItem[] = [];
    
    messages.forEach(message => {
      const content = message.content.toLowerCase();
      
      // Look for action-oriented language
      if (content.includes('need to') || content.includes('should') || content.includes('will')) {
        actionItems.push({
          description: this.truncateText(message.content, 100),
          priority: this.determinePriority(message),
          status: 'pending'
        });
      }
    });

    return actionItems.slice(0, 5); // Limit to 5 action items
  }

  private selectImportantMessages(messages: ChatMessage[], maxCount: number): ChatMessage[] {
    const scoredMessages = messages.map(msg => ({
      message: msg,
      score: this.calculateMessageImportance(msg, messages)
    }));

    scoredMessages.sort((a, b) => b.score - a.score);
    return scoredMessages.slice(0, maxCount).map(item => item.message);
  }

  private calculateCompressedSize(summary: string, keyPoints: string[], messages: ChatMessage[]): number {
    const summarySize = summary.length;
    const keyPointsSize = keyPoints.join(' ').length;
    const messagesSize = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    
    return summarySize + keyPointsSize + messagesSize;
  }

  private calculateQualityScore(summary: string, keyPoints: string[]): number {
    // Simple quality scoring based on content richness
    let score = 0;
    
    // Summary quality
    if (summary.length > 50) score += 0.3;
    if (summary.length > 100) score += 0.2;
    
    // Key points quality
    score += Math.min(keyPoints.length / 5, 1) * 0.3;
    
    // Coherence (simple check for complete sentences)
    const sentences = summary.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length > 1) score += 0.2;
    
    return Math.min(score, 1);
  }

  private extractTopics(messages: ChatMessage[]): string[] {
    return this.extractKeyTopics(messages);
  }

  private calculateConfidenceScore(messages: ChatMessage[], summary: string): number {
    // Confidence based on amount of source material and summary quality
    const messageCount = messages.length;
    const summaryLength = summary.length;
    
    let confidence = 0;
    
    // More messages = higher confidence
    confidence += Math.min(messageCount / 10, 1) * 0.5;
    
    // Reasonable summary length = higher confidence
    if (summaryLength > 30 && summaryLength < 300) {
      confidence += 0.5;
    }
    
    return Math.min(confidence, 1);
  }

  private createNoCompressionResult(context: Context, size: number): CompressionResult {
    return {
      originalSize: size,
      compressedSize: size,
      compressionRatio: 1,
      summary: 'No compression applied - context size below threshold',
      keyPoints: [],
      retainedMessages: context.immediate.recentMessages,
      metadata: {
        timestamp: new Date(),
        method: 'extractive',
        qualityScore: 1,
        topicsRetained: context.immediate.activeTopics,
        emotionalTone: context.immediate.currentUserEmotion,
        confidenceScore: 1
      }
    };
  }

  private updateCompressionStats(result: CompressionResult, processingTime: number): void {
    this.compressionStats.totalCompressions++;
    this.compressionStats.averageCompressionRatio = 
      (this.compressionStats.averageCompressionRatio * (this.compressionStats.totalCompressions - 1) + 
       result.compressionRatio) / this.compressionStats.totalCompressions;
    this.compressionStats.totalSpaceSaved += result.originalSize - result.compressedSize;
    this.compressionStats.processingTime += processingTime;
  }

  private generateSummaryId(messages: ChatMessage[]): string {
    const firstId = messages[0]?.id || 'empty';
    const lastId = messages[messages.length - 1]?.id || 'empty';
    return `summary_${firstId}_${lastId}_${messages.length}`;
  }

  private calculateTimespan(messages: ChatMessage[]): { start: Date; end: Date } {
    if (messages.length === 0) {
      const now = new Date();
      return { start: now, end: now };
    }

    const timestamps = messages.map(msg => new Date(msg.timestamp));
    return {
      start: new Date(Math.min(...timestamps.map(d => d.getTime()))),
      end: new Date(Math.max(...timestamps.map(d => d.getTime())))
    };
  }

  private countParticipants(messages: ChatMessage[]): number {
    const senders = new Set(messages.map(msg => msg.sender));
    return senders.size;
  }

  private assessSummaryQuality(messages: ChatMessage[]): SummaryQuality {
    const messageCount = messages.length;
    
    return {
      coherence: messageCount > 5 ? 0.8 : 0.6,
      completeness: Math.min(messageCount / 20, 1),
      conciseness: 0.7,
      relevance: 0.8,
      overall: 0.75
    };
  }

  private isEmotionalPeak(message: ChatMessage): boolean {
    const emotionalWords = ['amazing', 'terrible', 'love', 'hate', 'excited', 'frustrated', 'wonderful', 'awful'];
    const content = message.content.toLowerCase();
    return emotionalWords.some(word => content.includes(word));
  }

  private isInsightOrDecision(message: ChatMessage): boolean {
    const insightWords = ['realize', 'understand', 'decided', 'conclusion', 'important', 'key point'];
    const content = message.content.toLowerCase();
    return insightWords.some(word => content.includes(word));
  }

  private getMessageContext(messages: ChatMessage[], index: number): string {
    const start = Math.max(0, index - 1);
    const end = Math.min(messages.length, index + 2);
    const contextMessages = messages.slice(start, end);
    
    return contextMessages.map(msg => `${msg.sender}: ${this.truncateText(msg.content, 30)}`).join(' | ');
  }

  private detectMessageEmotion(message: ChatMessage): string {
    const content = message.content.toLowerCase();
    
    if (content.includes('happy') || content.includes('great') || content.includes('wonderful')) {
      return 'happy';
    }
    if (content.includes('sad') || content.includes('upset') || content.includes('disappointed')) {
      return 'sad';
    }
    if (content.includes('angry') || content.includes('frustrated') || content.includes('annoyed')) {
      return 'angry';
    }
    
    return 'neutral';
  }

  private calculateEmotionalIntensity(message: ChatMessage): number {
    const content = message.content.toLowerCase();
    let intensity = 0.5;
    
    // Check for intensity modifiers
    if (content.includes('very') || content.includes('extremely')) {
      intensity += 0.3;
    }
    if (content.includes('!')) {
      intensity += 0.2;
    }
    
    return Math.min(intensity, 1);
  }

  private determineEmotionalTrend(peaks: { emotion: string; intensity: number }[]): 'positive' | 'negative' | 'neutral' | 'mixed' {
    if (peaks.length === 0) return 'neutral';
    
    const positiveEmotions = ['happy', 'excited', 'wonderful'];
    const negativeEmotions = ['sad', 'angry', 'frustrated'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    peaks.forEach(peak => {
      if (positiveEmotions.includes(peak.emotion)) positiveCount++;
      if (negativeEmotions.includes(peak.emotion)) negativeCount++;
    });
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    if (positiveCount > 0 && negativeCount > 0) return 'mixed';
    return 'neutral';
  }

  private determinePriority(message: ChatMessage): 'low' | 'medium' | 'high' {
    const content = message.content.toLowerCase();
    
    if (content.includes('urgent') || content.includes('important') || content.includes('asap')) {
      return 'high';
    }
    if (content.includes('soon') || content.includes('need to')) {
      return 'medium';
    }
    
    return 'low';
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
}

export interface CompressionStats {
  totalCompressions: number;
  averageCompressionRatio: number;
  totalSpaceSaved: number;
  processingTime: number;
}

export function createContextCompressor(config?: Partial<CompressionConfig>): ContextCompressor {
  return new ContextCompressor(config);
} 