import type { ChatMessage } from '../types/common';
import type { Context } from '../types/context';

/**
 * Feedback Collection Service for Avatar System
 * 
 * Provides comprehensive feedback collection, interaction tracking, and improvement analytics
 * to continuously enhance the avatar's performance and user experience.
 */

export interface FeedbackConfig {
  collectImplicitFeedback: boolean;
  collectExplicitFeedback: boolean;
  feedbackRetentionDays: number;
  analyticsEnabled: boolean;
  privacyMode: 'full' | 'anonymous' | 'minimal';
  batchSize: number;
  reportingInterval: number; // minutes
}

export interface UserFeedback {
  id: string;
  sessionId: string;
  userId: string;
  timestamp: Date;
  type: FeedbackType;
  rating?: number; // 1-5 scale
  category: FeedbackCategory;
  content: string;
  context: FeedbackContext;
  metadata: FeedbackMetadata;
}

export type FeedbackType = 'explicit' | 'implicit' | 'behavioral' | 'system';

export type FeedbackCategory = 
  | 'response_quality'
  | 'personality_fit'
  | 'helpfulness'
  | 'accuracy'
  | 'emotional_support'
  | 'conversation_flow'
  | 'technical_performance'
  | 'user_experience'
  | 'feature_request'
  | 'bug_report';

export interface FeedbackContext {
  messageId?: string;
  conversationPhase: string;
  userEmotion: string;
  responseTime: number;
  contextSize: number;
  activeFeatures: string[];
  userIntent: string;
}

export interface FeedbackMetadata {
  source: 'user_action' | 'system_inference' | 'behavior_analysis';
  confidence: number; // 0-1
  deviceType: string;
  sessionDuration: number;
  messageCount: number;
  userEngagement: number;
}

export interface InteractionMetrics {
  sessionId: string;
  userId: string;
  timestamp: Date;
  duration: number; // seconds
  messageCount: number;
  userInitiated: boolean;
  completionRate: number; // 0-1
  engagementScore: number; // 0-1
  satisfactionScore: number; // 0-1
  technicalMetrics: TechnicalMetrics;
  behavioralMetrics: BehavioralMetrics;
}

export interface TechnicalMetrics {
  averageResponseTime: number;
  errorCount: number;
  cacheHitRate: number;
  memoryUsage: number;
  processingTime: number;
  networkLatency: number;
}

export interface BehavioralMetrics {
  messageLength: number;
  questionCount: number;
  emotionalExpressions: number;
  topicChanges: number;
  interruptions: number;
  clarificationRequests: number;
}

export interface FeedbackAnalytics {
  summary: AnalyticsSummary;
  trends: FeedbackTrends;
  insights: FeedbackInsights;
  recommendations: ImprovementRecommendations;
  performance: PerformanceMetrics;
}

export interface AnalyticsSummary {
  totalFeedback: number;
  averageRating: number;
  satisfactionRate: number;
  topCategories: { category: FeedbackCategory; count: number }[];
  responseDistribution: { rating: number; count: number }[];
  timeRange: { start: Date; end: Date };
}

export interface FeedbackTrends {
  ratingTrend: { date: Date; averageRating: number }[];
  categoryTrends: { category: FeedbackCategory; trend: 'improving' | 'declining' | 'stable' }[];
  volumeTrend: { date: Date; feedbackCount: number }[];
  userEngagementTrend: { date: Date; engagementScore: number }[];
}

export interface FeedbackInsights {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  userPatterns: UserPattern[];
  criticalIssues: CriticalIssue[];
}

export interface UserPattern {
  pattern: string;
  frequency: number;
  impact: 'positive' | 'negative' | 'neutral';
  examples: string[];
}

export interface CriticalIssue {
  issue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  frequency: number;
  impact: string;
  suggestedActions: string[];
}

export interface ImprovementRecommendations {
  immediate: Recommendation[];
  shortTerm: Recommendation[];
  longTerm: Recommendation[];
  priorityScore: number;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: FeedbackCategory;
  priority: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  timeline: string;
  dependencies: string[];
}

export interface PerformanceMetrics {
  responseQuality: number; // 0-1
  userSatisfaction: number; // 0-1
  engagementLevel: number; // 0-1
  technicalPerformance: number; // 0-1
  overallScore: number; // 0-1
  benchmarkComparison: BenchmarkComparison;
}

export interface BenchmarkComparison {
  industry: number;
  internal: number;
  historical: number;
  target: number;
}

export class FeedbackCollector {
  private config: FeedbackConfig;
  private feedbackStore: Map<string, UserFeedback> = new Map();
  private interactionMetrics: Map<string, InteractionMetrics> = new Map();
  private analyticsCache: FeedbackAnalytics | null = null;
  private lastAnalyticsUpdate: Date = new Date();

  constructor(config?: Partial<FeedbackConfig>) {
    this.config = this.createDefaultConfig(config);
  }

  /**
   * Collect explicit feedback from user
   */
  collectExplicitFeedback(
    sessionId: string,
    userId: string,
    rating: number,
    category: FeedbackCategory,
    content: string,
    context: Partial<FeedbackContext> = {}
  ): UserFeedback {
    const feedback: UserFeedback = {
      id: this.generateFeedbackId(),
      sessionId,
      userId,
      timestamp: new Date(),
      type: 'explicit',
      rating,
      category,
      content,
      context: this.buildFeedbackContext(context),
      metadata: this.buildFeedbackMetadata('user_action', 1.0, sessionId)
    };

    this.storeFeedback(feedback);
    this.invalidateAnalyticsCache();
    return feedback;
  }

  /**
   * Collect implicit feedback from user behavior
   */
  collectImplicitFeedback(
    sessionId: string,
    userId: string,
    behaviorData: Partial<BehavioralMetrics>,
    context: Partial<FeedbackContext> = {}
  ): UserFeedback {
    const inferredRating = this.inferRatingFromBehavior(behaviorData);
    const category = this.inferCategoryFromBehavior(behaviorData);
    const content = this.generateImplicitFeedbackContent(behaviorData);

    const feedback: UserFeedback = {
      id: this.generateFeedbackId(),
      sessionId,
      userId,
      timestamp: new Date(),
      type: 'implicit',
      rating: inferredRating,
      category,
      content,
      context: this.buildFeedbackContext(context),
      metadata: this.buildFeedbackMetadata('behavior_analysis', 0.7, sessionId)
    };

    this.storeFeedback(feedback);
    this.invalidateAnalyticsCache();
    return feedback;
  }

  /**
   * Track interaction metrics
   */
  trackInteraction(
    sessionId: string,
    userId: string,
    duration: number,
    messageCount: number,
    technicalMetrics: Partial<TechnicalMetrics> = {},
    behavioralMetrics: Partial<BehavioralMetrics> = {}
  ): InteractionMetrics {
    const metrics: InteractionMetrics = {
      sessionId,
      userId,
      timestamp: new Date(),
      duration,
      messageCount,
      userInitiated: true, // Could be inferred from context
      completionRate: this.calculateCompletionRate(sessionId),
      engagementScore: this.calculateEngagementScore(behavioralMetrics),
      satisfactionScore: this.calculateSatisfactionScore(sessionId),
      technicalMetrics: this.buildTechnicalMetrics(technicalMetrics),
      behavioralMetrics: this.buildBehavioralMetrics(behavioralMetrics)
    };

    this.interactionMetrics.set(sessionId, metrics);
    this.invalidateAnalyticsCache();
    return metrics;
  }

  /**
   * Get comprehensive feedback analytics
   */
  getAnalytics(forceRefresh: boolean = false): FeedbackAnalytics {
    if (!forceRefresh && this.analyticsCache && this.isAnalyticsCacheValid()) {
      return this.analyticsCache;
    }

    const analytics = this.generateAnalytics();
    this.analyticsCache = analytics;
    this.lastAnalyticsUpdate = new Date();
    return analytics;
  }

  /**
   * Get feedback for specific category
   */
  getFeedbackByCategory(category: FeedbackCategory): UserFeedback[] {
    return Array.from(this.feedbackStore.values())
      .filter(feedback => feedback.category === category)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get feedback for specific user
   */
  getFeedbackByUser(userId: string): UserFeedback[] {
    return Array.from(this.feedbackStore.values())
      .filter(feedback => feedback.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get recent feedback
   */
  getRecentFeedback(hours: number = 24): UserFeedback[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return Array.from(this.feedbackStore.values())
      .filter(feedback => feedback.timestamp > cutoff)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get improvement recommendations
   */
  getRecommendations(): ImprovementRecommendations {
    const analytics = this.getAnalytics();
    return analytics.recommendations;
  }

  /**
   * Export feedback data
   */
  exportFeedback(format: 'json' | 'csv' = 'json'): string {
    const feedback = Array.from(this.feedbackStore.values());
    
    if (format === 'csv') {
      return this.convertToCSV(feedback);
    }
    
    return JSON.stringify(feedback, null, 2);
  }

  /**
   * Clear old feedback based on retention policy
   */
  cleanupOldFeedback(): number {
    const cutoff = new Date(Date.now() - this.config.feedbackRetentionDays * 24 * 60 * 60 * 1000);
    let removedCount = 0;

    for (const [id, feedback] of this.feedbackStore.entries()) {
      if (feedback.timestamp < cutoff) {
        this.feedbackStore.delete(id);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.invalidateAnalyticsCache();
    }

    return removedCount;
  }

  /**
   * Get feedback statistics
   */
  getStats(): FeedbackStats {
    const allFeedback = Array.from(this.feedbackStore.values());
    const allMetrics = Array.from(this.interactionMetrics.values());

    return {
      totalFeedback: allFeedback.length,
      explicitFeedback: allFeedback.filter(f => f.type === 'explicit').length,
      implicitFeedback: allFeedback.filter(f => f.type === 'implicit').length,
      averageRating: this.calculateAverageRating(allFeedback),
      totalInteractions: allMetrics.length,
      averageEngagement: this.calculateAverageEngagement(allMetrics),
      retentionRate: this.calculateRetentionRate(allMetrics),
      cacheHitRate: this.isAnalyticsCacheValid() ? 1 : 0
    };
  }

  private createDefaultConfig(config?: Partial<FeedbackConfig>): FeedbackConfig {
    return {
      collectImplicitFeedback: config?.collectImplicitFeedback ?? true,
      collectExplicitFeedback: config?.collectExplicitFeedback ?? true,
      feedbackRetentionDays: config?.feedbackRetentionDays ?? 90,
      analyticsEnabled: config?.analyticsEnabled ?? true,
      privacyMode: config?.privacyMode ?? 'anonymous',
      batchSize: config?.batchSize ?? 50,
      reportingInterval: config?.reportingInterval ?? 60
    };
  }

  private generateFeedbackId(): string {
    return `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private buildFeedbackContext(context: Partial<FeedbackContext>): FeedbackContext {
    return {
      messageId: context.messageId,
      conversationPhase: context.conversationPhase || 'unknown',
      userEmotion: context.userEmotion || 'neutral',
      responseTime: context.responseTime || 0,
      contextSize: context.contextSize || 0,
      activeFeatures: context.activeFeatures || [],
      userIntent: context.userIntent || 'unknown'
    };
  }

  private buildFeedbackMetadata(
    source: 'user_action' | 'system_inference' | 'behavior_analysis',
    confidence: number,
    sessionId: string
  ): FeedbackMetadata {
    const sessionMetrics = this.interactionMetrics.get(sessionId);
    
    return {
      source,
      confidence,
      deviceType: 'desktop', // Could be detected
      sessionDuration: sessionMetrics?.duration || 0,
      messageCount: sessionMetrics?.messageCount || 0,
      userEngagement: sessionMetrics?.engagementScore || 0.5
    };
  }

  private inferRatingFromBehavior(behaviorData: Partial<BehavioralMetrics>): number {
    let rating = 3; // Default neutral rating
    
    // Positive indicators
    if (behaviorData.messageLength && behaviorData.messageLength > 50) {
      rating += 0.5; // Longer messages indicate engagement
    }
    
    if (behaviorData.questionCount && behaviorData.questionCount > 0) {
      rating += 0.3; // Questions indicate engagement
    }
    
    // Negative indicators
    if (behaviorData.interruptions && behaviorData.interruptions > 2) {
      rating -= 0.5; // Many interruptions indicate frustration
    }
    
    if (behaviorData.clarificationRequests && behaviorData.clarificationRequests > 1) {
      rating -= 0.3; // Many clarifications indicate confusion
    }
    
    return Math.max(1, Math.min(5, Math.round(rating)));
  }

  private inferCategoryFromBehavior(behaviorData: Partial<BehavioralMetrics>): FeedbackCategory {
    if (behaviorData.clarificationRequests && behaviorData.clarificationRequests > 1) {
      return 'accuracy';
    }
    
    if (behaviorData.emotionalExpressions && behaviorData.emotionalExpressions > 2) {
      return 'emotional_support';
    }
    
    if (behaviorData.topicChanges && behaviorData.topicChanges > 3) {
      return 'conversation_flow';
    }
    
    return 'response_quality';
  }

  private generateImplicitFeedbackContent(behaviorData: Partial<BehavioralMetrics>): string {
    const behaviors: string[] = [];
    
    if (behaviorData.messageLength && behaviorData.messageLength > 100) {
      behaviors.push('detailed messages');
    }
    
    if (behaviorData.questionCount && behaviorData.questionCount > 2) {
      behaviors.push('multiple questions');
    }
    
    if (behaviorData.interruptions && behaviorData.interruptions > 0) {
      behaviors.push('interruptions');
    }
    
    return `Implicit feedback based on: ${behaviors.join(', ') || 'general behavior'}`;
  }

  private buildTechnicalMetrics(metrics: Partial<TechnicalMetrics>): TechnicalMetrics {
    return {
      averageResponseTime: metrics.averageResponseTime || 0,
      errorCount: metrics.errorCount || 0,
      cacheHitRate: metrics.cacheHitRate || 0,
      memoryUsage: metrics.memoryUsage || 0,
      processingTime: metrics.processingTime || 0,
      networkLatency: metrics.networkLatency || 0
    };
  }

  private buildBehavioralMetrics(metrics: Partial<BehavioralMetrics>): BehavioralMetrics {
    return {
      messageLength: metrics.messageLength || 0,
      questionCount: metrics.questionCount || 0,
      emotionalExpressions: metrics.emotionalExpressions || 0,
      topicChanges: metrics.topicChanges || 0,
      interruptions: metrics.interruptions || 0,
      clarificationRequests: metrics.clarificationRequests || 0
    };
  }

  private calculateCompletionRate(sessionId: string): number {
    // Simple completion rate calculation
    const metrics = this.interactionMetrics.get(sessionId);
    if (!metrics) return 0.5;
    
    // Consider session completed if it lasted more than 2 minutes
    return metrics.duration > 120 ? 1.0 : metrics.duration / 120;
  }

  private calculateEngagementScore(behaviorData: Partial<BehavioralMetrics>): number {
    let score = 0.5;
    
    if (behaviorData.messageLength && behaviorData.messageLength > 30) {
      score += 0.2;
    }
    
    if (behaviorData.questionCount && behaviorData.questionCount > 0) {
      score += 0.2;
    }
    
    if (behaviorData.emotionalExpressions && behaviorData.emotionalExpressions > 0) {
      score += 0.1;
    }
    
    return Math.min(1.0, score);
  }

  private calculateSatisfactionScore(sessionId: string): number {
    const userFeedback = Array.from(this.feedbackStore.values())
      .filter(f => f.sessionId === sessionId && f.rating);
    
    if (userFeedback.length === 0) return 0.5;
    
    const avgRating = userFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / userFeedback.length;
    return avgRating / 5; // Convert 1-5 scale to 0-1 scale
  }

  private storeFeedback(feedback: UserFeedback): void {
    if (this.config.privacyMode === 'minimal') {
      // Store minimal data
      feedback.content = '[REDACTED]';
      feedback.userId = 'anonymous';
    } else if (this.config.privacyMode === 'anonymous') {
      // Anonymize user data
      feedback.userId = this.hashUserId(feedback.userId);
    }
    
    this.feedbackStore.set(feedback.id, feedback);
  }

  private hashUserId(userId: string): string {
    // Simple hash function for anonymization
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `user_${Math.abs(hash)}`;
  }

  private generateAnalytics(): FeedbackAnalytics {
    const allFeedback = Array.from(this.feedbackStore.values());
    const allMetrics = Array.from(this.interactionMetrics.values());

    return {
      summary: this.generateSummary(allFeedback),
      trends: this.generateTrends(allFeedback),
      insights: this.generateInsights(allFeedback),
      recommendations: this.generateRecommendations(allFeedback),
      performance: this.generatePerformanceMetrics(allFeedback, allMetrics)
    };
  }

  private generateSummary(feedback: UserFeedback[]): AnalyticsSummary {
    const ratings = feedback.filter(f => f.rating).map(f => f.rating!);
    const categories = feedback.reduce((acc, f) => {
      acc[f.category] = (acc[f.category] || 0) + 1;
      return acc;
    }, {} as Record<FeedbackCategory, number>);

    return {
      totalFeedback: feedback.length,
      averageRating: ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0,
      satisfactionRate: ratings.filter(r => r >= 4).length / Math.max(ratings.length, 1),
      topCategories: Object.entries(categories)
        .map(([category, count]) => ({ category: category as FeedbackCategory, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      responseDistribution: [1, 2, 3, 4, 5].map(rating => ({
        rating,
        count: ratings.filter(r => r === rating).length
      })),
      timeRange: this.calculateTimeRange(feedback)
    };
  }

  private generateTrends(feedback: UserFeedback[]): FeedbackTrends {
    // Simplified trend analysis
    const last30Days = feedback.filter(f => 
      f.timestamp > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    return {
      ratingTrend: this.calculateRatingTrend(last30Days),
      categoryTrends: this.calculateCategoryTrends(last30Days),
      volumeTrend: this.calculateVolumeTrend(last30Days),
      userEngagementTrend: this.calculateEngagementTrend(last30Days)
    };
  }

  private generateInsights(feedback: UserFeedback[]): FeedbackInsights {
    return {
      strengths: this.identifyStrengths(feedback),
      weaknesses: this.identifyWeaknesses(feedback),
      opportunities: this.identifyOpportunities(feedback),
      userPatterns: this.identifyUserPatterns(feedback),
      criticalIssues: this.identifyCriticalIssues(feedback)
    };
  }

  private generateRecommendations(feedback: UserFeedback[]): ImprovementRecommendations {
    const weaknesses = this.identifyWeaknesses(feedback);
    const criticalIssues = this.identifyCriticalIssues(feedback);

    return {
      immediate: this.generateImmediateRecommendations(criticalIssues),
      shortTerm: this.generateShortTermRecommendations(weaknesses),
      longTerm: this.generateLongTermRecommendations(feedback),
      priorityScore: this.calculatePriorityScore(criticalIssues, weaknesses)
    };
  }

  private generatePerformanceMetrics(feedback: UserFeedback[], metrics: InteractionMetrics[]): PerformanceMetrics {
    const ratings = feedback.filter(f => f.rating).map(f => f.rating!);
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    const avgEngagement = metrics.length > 0 ? metrics.reduce((a, b) => a + b.engagementScore, 0) / metrics.length : 0;

    return {
      responseQuality: avgRating / 5,
      userSatisfaction: ratings.filter(r => r >= 4).length / Math.max(ratings.length, 1),
      engagementLevel: avgEngagement,
      technicalPerformance: this.calculateTechnicalPerformance(metrics),
      overallScore: (avgRating / 5 + avgEngagement) / 2,
      benchmarkComparison: {
        industry: 0.75,
        internal: 0.8,
        historical: 0.7,
        target: 0.85
      }
    };
  }

  private isAnalyticsCacheValid(): boolean {
    const cacheAge = Date.now() - this.lastAnalyticsUpdate.getTime();
    return cacheAge < this.config.reportingInterval * 60 * 1000;
  }

  private invalidateAnalyticsCache(): void {
    this.analyticsCache = null;
  }

  private calculateAverageRating(feedback: UserFeedback[]): number {
    const ratings = feedback.filter(f => f.rating).map(f => f.rating!);
    return ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  }

  private calculateAverageEngagement(metrics: InteractionMetrics[]): number {
    return metrics.length > 0 ? metrics.reduce((a, b) => a + b.engagementScore, 0) / metrics.length : 0;
  }

  private calculateRetentionRate(metrics: InteractionMetrics[]): number {
    // Simple retention calculation based on completion rate
    return metrics.length > 0 ? metrics.reduce((a, b) => a + b.completionRate, 0) / metrics.length : 0;
  }

  private calculateTimeRange(feedback: UserFeedback[]): { start: Date; end: Date } {
    if (feedback.length === 0) {
      const now = new Date();
      return { start: now, end: now };
    }

    const timestamps = feedback.map(f => f.timestamp);
    return {
      start: new Date(Math.min(...timestamps.map(d => d.getTime()))),
      end: new Date(Math.max(...timestamps.map(d => d.getTime())))
    };
  }

  private calculateRatingTrend(feedback: UserFeedback[]): { date: Date; averageRating: number }[] {
    // Simplified daily trend
    const dailyRatings = new Map<string, number[]>();
    
    feedback.forEach(f => {
      if (f.rating) {
        const date = f.timestamp.toISOString().split('T')[0];
        if (!dailyRatings.has(date)) {
          dailyRatings.set(date, []);
        }
        dailyRatings.get(date)!.push(f.rating);
      }
    });

    return Array.from(dailyRatings.entries()).map(([date, ratings]) => ({
      date: new Date(date),
      averageRating: ratings.reduce((a, b) => a + b, 0) / ratings.length
    }));
  }

  private calculateCategoryTrends(feedback: UserFeedback[]): { category: FeedbackCategory; trend: 'improving' | 'declining' | 'stable' }[] {
    // Simplified category trend analysis
    const categories = Array.from(new Set(feedback.map(f => f.category)));
    
    return categories.map(category => ({
      category,
      trend: 'stable' as const // Simplified - would need historical data for real trends
    }));
  }

  private calculateVolumeTrend(feedback: UserFeedback[]): { date: Date; feedbackCount: number }[] {
    const dailyCounts = new Map<string, number>();
    
    feedback.forEach(f => {
      const date = f.timestamp.toISOString().split('T')[0];
      dailyCounts.set(date, (dailyCounts.get(date) || 0) + 1);
    });

    return Array.from(dailyCounts.entries()).map(([date, count]) => ({
      date: new Date(date),
      feedbackCount: count
    }));
  }

  private calculateEngagementTrend(feedback: UserFeedback[]): { date: Date; engagementScore: number }[] {
    // Simplified engagement trend
    return feedback.map(f => ({
      date: f.timestamp,
      engagementScore: f.metadata.userEngagement
    }));
  }

  private identifyStrengths(feedback: UserFeedback[]): string[] {
    const highRatingFeedback = feedback.filter(f => f.rating && f.rating >= 4);
    const strengths = new Set<string>();

    highRatingFeedback.forEach(f => {
      if (f.category === 'response_quality') {
        strengths.add('High-quality responses');
      }
      if (f.category === 'helpfulness') {
        strengths.add('Helpful assistance');
      }
      if (f.category === 'emotional_support') {
        strengths.add('Strong emotional support');
      }
    });

    return Array.from(strengths);
  }

  private identifyWeaknesses(feedback: UserFeedback[]): string[] {
    const lowRatingFeedback = feedback.filter(f => f.rating && f.rating <= 2);
    const weaknesses = new Set<string>();

    lowRatingFeedback.forEach(f => {
      if (f.category === 'accuracy') {
        weaknesses.add('Accuracy issues');
      }
      if (f.category === 'technical_performance') {
        weaknesses.add('Technical performance problems');
      }
      if (f.category === 'conversation_flow') {
        weaknesses.add('Conversation flow issues');
      }
    });

    return Array.from(weaknesses);
  }

  private identifyOpportunities(feedback: UserFeedback[]): string[] {
    const featureRequests = feedback.filter(f => f.category === 'feature_request');
    const opportunities = new Set<string>();

    featureRequests.forEach(f => {
      opportunities.add(`Feature request: ${f.content.substring(0, 50)}...`);
    });

    return Array.from(opportunities);
  }

  private identifyUserPatterns(feedback: UserFeedback[]): UserPattern[] {
    // Simplified pattern identification
    const patterns: UserPattern[] = [];
    
    const frequentCategories = feedback.reduce((acc, f) => {
      acc[f.category] = (acc[f.category] || 0) + 1;
      return acc;
    }, {} as Record<FeedbackCategory, number>);

    Object.entries(frequentCategories).forEach(([category, count]) => {
      if (count > 3) {
        patterns.push({
          pattern: `Frequent ${category} feedback`,
          frequency: count,
          impact: count > 5 ? 'positive' : 'neutral',
          examples: feedback.filter(f => f.category === category).slice(0, 3).map(f => f.content)
        });
      }
    });

    return patterns;
  }

  private identifyCriticalIssues(feedback: UserFeedback[]): CriticalIssue[] {
    const criticalFeedback = feedback.filter(f => f.rating && f.rating === 1);
    const issues: CriticalIssue[] = [];

    if (criticalFeedback.length > 0) {
      issues.push({
        issue: 'Very low ratings detected',
        severity: 'high',
        frequency: criticalFeedback.length,
        impact: 'User dissatisfaction and potential churn',
        suggestedActions: ['Investigate root causes', 'Implement immediate fixes', 'Follow up with affected users']
      });
    }

    return issues;
  }

  private generateImmediateRecommendations(criticalIssues: CriticalIssue[]): Recommendation[] {
    return criticalIssues.map((issue, index) => ({
      id: `immediate_${index}`,
      title: `Address ${issue.issue}`,
      description: issue.suggestedActions.join(', '),
      category: 'technical_performance',
      priority: 'critical',
      effort: 'high',
      impact: 'high',
      timeline: '1-2 days',
      dependencies: []
    }));
  }

  private generateShortTermRecommendations(weaknesses: string[]): Recommendation[] {
    return weaknesses.map((weakness, index) => ({
      id: `short_term_${index}`,
      title: `Improve ${weakness}`,
      description: `Focus on addressing ${weakness} based on user feedback`,
      category: 'response_quality',
      priority: 'high',
      effort: 'medium',
      impact: 'medium',
      timeline: '1-2 weeks',
      dependencies: []
    }));
  }

  private generateLongTermRecommendations(feedback: UserFeedback[]): Recommendation[] {
    return [
      {
        id: 'long_term_1',
        title: 'Implement advanced personalization',
        description: 'Develop more sophisticated user modeling and personalization',
        category: 'user_experience',
        priority: 'medium',
        effort: 'high',
        impact: 'high',
        timeline: '2-3 months',
        dependencies: ['user_data_collection', 'ml_infrastructure']
      }
    ];
  }

  private calculatePriorityScore(criticalIssues: CriticalIssue[], weaknesses: string[]): number {
    let score = 0;
    
    score += criticalIssues.length * 0.4;
    score += weaknesses.length * 0.2;
    
    return Math.min(1, score);
  }

  private calculateTechnicalPerformance(metrics: InteractionMetrics[]): number {
    if (metrics.length === 0) return 0.5;
    
    const avgResponseTime = metrics.reduce((a, b) => a + b.technicalMetrics.averageResponseTime, 0) / metrics.length;
    const avgErrorRate = metrics.reduce((a, b) => a + b.technicalMetrics.errorCount, 0) / metrics.length;
    
    // Simple performance calculation
    const responseScore = Math.max(0, 1 - avgResponseTime / 5000); // 5 seconds max
    const errorScore = Math.max(0, 1 - avgErrorRate / 10); // 10 errors max
    
    return (responseScore + errorScore) / 2;
  }

  private convertToCSV(feedback: UserFeedback[]): string {
    const headers = ['id', 'timestamp', 'type', 'rating', 'category', 'content', 'userId', 'sessionId'];
    const rows = feedback.map(f => [
      f.id,
      f.timestamp.toISOString(),
      f.type,
      f.rating || '',
      f.category,
      f.content.replace(/,/g, ';'), // Replace commas to avoid CSV issues
      f.userId,
      f.sessionId
    ]);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }
}

export interface FeedbackStats {
  totalFeedback: number;
  explicitFeedback: number;
  implicitFeedback: number;
  averageRating: number;
  totalInteractions: number;
  averageEngagement: number;
  retentionRate: number;
  cacheHitRate: number;
}

export function createFeedbackCollector(config?: Partial<FeedbackConfig>): FeedbackCollector {
  return new FeedbackCollector(config);
} 