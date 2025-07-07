// Feedback Collection Service for Avatar System

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

export interface ImprovementRecommendation {
  category: FeedbackCategory;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  actionItems: string[];
  expectedImpact: string;
  implementationEffort: 'low' | 'medium' | 'high';
  metrics: string[];
}

export interface ImprovementRecommendations {
  areas: ImprovementRecommendation[];
  overallScore: number;
  priorityActions: string[];
  longTermGoals: string[];
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
   * Track technical performance metrics
   */
  trackTechnicalMetrics(userId: string, metrics: Partial<TechnicalMetrics>): void {
    const sessionId = this.getCurrentSessionId(userId);
    const interactionMetrics = this.getOrCreateInteractionMetrics(sessionId, userId);
    
    // Update technical metrics
    interactionMetrics.technicalMetrics = {
      ...interactionMetrics.technicalMetrics,
      averageResponseTime: metrics.averageResponseTime || interactionMetrics.technicalMetrics.averageResponseTime,
      processingTime: metrics.processingTime || interactionMetrics.technicalMetrics.processingTime,
      memoryUsage: metrics.memoryUsage || interactionMetrics.technicalMetrics.memoryUsage,
      errorCount: metrics.errorCount || interactionMetrics.technicalMetrics.errorCount,
      cacheHitRate: metrics.cacheHitRate || interactionMetrics.technicalMetrics.cacheHitRate,
      networkLatency: metrics.networkLatency || interactionMetrics.technicalMetrics.networkLatency
    };
    
    this.interactionMetrics.set(sessionId, interactionMetrics);
    this.invalidateAnalyticsCache();
  }

  /**
   * Track behavioral metrics
   */
  trackBehavioralMetrics(userId: string, metrics: Partial<BehavioralMetrics>): void {
    const sessionId = this.getCurrentSessionId(userId);
    const interactionMetrics = this.getOrCreateInteractionMetrics(sessionId, userId);
    
    // Update behavioral metrics
    interactionMetrics.behavioralMetrics = {
      ...interactionMetrics.behavioralMetrics,
      messageLength: metrics.messageLength || interactionMetrics.behavioralMetrics.messageLength,
      questionCount: (interactionMetrics.behavioralMetrics.questionCount || 0) + (metrics.questionCount || 0),
      emotionalExpressions: (interactionMetrics.behavioralMetrics.emotionalExpressions || 0) + (metrics.emotionalExpressions || 0),
      topicChanges: (interactionMetrics.behavioralMetrics.topicChanges || 0) + (metrics.topicChanges || 0),
      interruptions: (interactionMetrics.behavioralMetrics.interruptions || 0) + (metrics.interruptions || 0),
      clarificationRequests: (interactionMetrics.behavioralMetrics.clarificationRequests || 0) + (metrics.clarificationRequests || 0)
    };
    
    // Update engagement score based on new metrics
    interactionMetrics.engagementScore = this.calculateEngagementScore(interactionMetrics.behavioralMetrics);
    
    this.interactionMetrics.set(sessionId, interactionMetrics);
    this.invalidateAnalyticsCache();
  }

  /**
   * Get comprehensive feedback analytics
   */
  getAnalytics(forceRefresh: boolean = false): any {
    if (!forceRefresh && this.analyticsCache && this.isAnalyticsCacheValid()) {
      return this.getFlatAnalytics(this.analyticsCache);
    }

    const analytics = this.generateAnalytics();
    this.analyticsCache = analytics;
    this.lastAnalyticsUpdate = new Date();
    return this.getFlatAnalytics(analytics);
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
  getImprovementRecommendations(): ImprovementRecommendation[] {
    const analytics = this.getAnalytics();
    return analytics.recommendations.areas.map(area => ({
      category: area.category,
      priority: area.priority,
      description: area.description,
      actionItems: area.actionItems,
      expectedImpact: area.expectedImpact,
      implementationEffort: area.implementationEffort,
      metrics: area.metrics
    }));
  }

  /**
   * Export feedback data with optional anonymization
   */
  exportFeedbackData(format: 'json' | 'csv' = 'json', anonymize: boolean = false): string {
    let feedback = Array.from(this.feedbackStore.values());
    
    if (anonymize) {
      feedback = feedback.map(f => ({
        ...f,
        userId: this.anonymizeUserId(f.userId),
        sessionId: this.anonymizeSessionId(f.sessionId),
        content: this.anonymizeContent(f.content)
      }));
    }
    
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

  /**
   * Set privacy settings
   */
  setPrivacySettings(settings: Partial<FeedbackConfig>): void {
    this.config = {
      ...this.config,
      ...settings
    };
    
    // If privacy mode changed to minimal, clean up sensitive data
    if (settings.privacyMode === 'minimal') {
      this.cleanupSensitiveData();
    }
  }

  getBenchmarkComparison(): BenchmarkComparison & { performanceGaps: string[]; optimizationSuggestions: string[] } {
    const analytics = this.getAnalytics();
    const currentScore = analytics.performance.overallScore;
    
    // Industry benchmarks (simulated)
    const industryBenchmark = 0.75;
    const internalBenchmark = 0.80;
    const historicalBenchmark = 0.70;
    const targetBenchmark = 0.85;
    
    return {
      industry: currentScore / industryBenchmark,
      internal: currentScore / internalBenchmark,
      historical: currentScore / historicalBenchmark,
      target: currentScore / targetBenchmark,
      performanceGaps: this.identifyPerformanceGaps(currentScore, {
        industry: industryBenchmark,
        internal: internalBenchmark,
        historical: historicalBenchmark,
        target: targetBenchmark
      }),
      optimizationSuggestions: this.generateOptimizationSuggestions(currentScore, targetBenchmark)
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
        areas: this.generateImmediateRecommendations(criticalIssues),
        overallScore: this.calculatePriorityScore(criticalIssues, weaknesses),
        priorityActions: this.generatePriorityActions(criticalIssues, weaknesses),
        longTermGoals: this.generateLongTermGoals()
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

  private generateImmediateRecommendations(criticalIssues: CriticalIssue[]): ImprovementRecommendation[] {
    return criticalIssues.map((issue) => ({
      category: 'technical_performance', // Default to technical for immediate fixes
      priority: 'critical',
      description: issue.suggestedActions.join(', '),
      actionItems: issue.suggestedActions,
      expectedImpact: issue.impact,
      implementationEffort: 'high',
      metrics: [] // No specific metrics for immediate fixes
    }));
  }

  private generateShortTermRecommendations(weaknesses: string[]): ImprovementRecommendation[] {
    return weaknesses.map((weakness) => ({
      category: 'response_quality',
      priority: 'high',
      description: `Focus on addressing ${weakness} based on user feedback`,
      actionItems: [],
      expectedImpact: 'Medium-term improvement in response quality',
      implementationEffort: 'medium',
      metrics: []
    }));
  }

  private generateLongTermRecommendations(): ImprovementRecommendation[] {
    return [
      {
        category: 'user_experience',
        priority: 'medium',
        description: 'Develop more sophisticated user modeling and personalization',
        actionItems: [],
        expectedImpact: 'Long-term enhancement of user satisfaction and engagement',
        implementationEffort: 'high',
        metrics: []
      }
    ];
  }

  private generatePriorityActions(criticalIssues: CriticalIssue[], weaknesses: string[]): string[] {
    const actions: string[] = [];
    criticalIssues.forEach(issue => {
      actions.push(`Address ${issue.issue} (Priority: ${issue.severity})`);
    });
    weaknesses.forEach(weakness => {
      actions.push(`Improve ${weakness} (Priority: high)`);
    });
    return actions;
  }

  private generateLongTermGoals(): string[] {
    const goals: string[] = [];
    goals.push('Achieve industry-leading technical performance.');
    goals.push('Develop a robust and scalable user modeling system.');
    goals.push('Implement advanced personalization algorithms.');
    return goals;
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
      this.ensureStringContent(f.content).replace(/,/g, ';'), // Replace commas to avoid CSV issues
      f.userId,
      f.sessionId
    ]);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  private getCurrentSessionId(userId: string): string {
    // Try to find existing session for user, or create new one
    for (const [sessionId, metrics] of this.interactionMetrics.entries()) {
      if (metrics.userId === userId) {
        return sessionId;
      }
    }
    // Create new session ID if none found
    return this.generateSessionId(userId);
  }

  private generateSessionId(userId: string): string {
    return `session_${userId}_${Date.now()}`;
  }

  private getOrCreateInteractionMetrics(sessionId: string, userId: string): InteractionMetrics {
    let metrics = this.interactionMetrics.get(sessionId);
    
    if (!metrics) {
      metrics = {
        sessionId,
        userId,
        timestamp: new Date(),
        messageCount: 0,
        duration: 0,
        userInitiated: true,
        completionRate: 0,
        engagementScore: 0.5,
        satisfactionScore: 0.5,
        technicalMetrics: {
          averageResponseTime: 0,
          processingTime: 0,
          memoryUsage: 0,
          errorCount: 0,
          cacheHitRate: 0,
          networkLatency: 0
        },
        behavioralMetrics: {
          messageLength: 0,
          questionCount: 0,
          emotionalExpressions: 0,
          topicChanges: 0,
          interruptions: 0,
          clarificationRequests: 0
        }
      };
      this.interactionMetrics.set(sessionId, metrics);
    }
    
    return metrics;
  }

  private updateAverageResponseTime(currentAverage: number, newResponseTime: number, messageCount: number): number {
    if (messageCount === 0) return newResponseTime;
    return ((currentAverage * messageCount) + newResponseTime) / (messageCount + 1);
  }

  private anonymizeUserId(userId: string): string {
    // Simple anonymization - could be more sophisticated
    const hash = this.simpleHash(userId);
    return `user_${hash}`;
  }

  private anonymizeSessionId(sessionId: string): string {
    const hash = this.simpleHash(sessionId);
    return `session_${hash}`;
  }

  private anonymizeContent(content: string): string {
    // Ensure content is a string
    const stringContent = this.ensureStringContent(content);
    
    // Remove personally identifiable information
    return stringContent
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      .replace(/\b\d{3}-?\d{3}-?\d{4}\b/g, '[PHONE]')
      .replace(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, '[CARD]');
  }

  private ensureStringContent(content: unknown): string {
    if (typeof content === 'string') {
      return content;
    }
    
    if (content === null || content === undefined) {
      return '';
    }
    
    if (typeof content === 'object') {
      return JSON.stringify(content);
    }
    
    return String(content);
  }

  private getFlatAnalytics(analytics: FeedbackAnalytics): any {
    const allFeedback = Array.from(this.feedbackStore.values());
    const allMetrics = Array.from(this.interactionMetrics.values());
    
    // Create category breakdown
    const categoryBreakdown: Record<string, number> = {};
    allFeedback.forEach(f => {
      categoryBreakdown[f.category] = (categoryBreakdown[f.category] || 0) + 1;
    });

    // Calculate simple trend
    const ratingTrend = this.calculateSimpleTrend(analytics.trends.ratingTrend);

    return {
      // Flat properties for tests
      totalFeedback: analytics.summary.totalFeedback,
      averageRating: analytics.summary.averageRating,
      satisfactionScore: analytics.performance.userSatisfaction,
      categoryBreakdown,
      totalInteractions: allMetrics.length,
      improvementAreas: analytics.insights.weaknesses,
      trends: { ...analytics.trends, ratingTrend },
      insights: analytics.insights,
      // Keep nested structure for compatibility
      summary: analytics.summary,
      performance: analytics.performance,
      recommendations: analytics.recommendations
    };
  }

  private calculateSimpleTrend(ratingTrend: { date: Date; averageRating: number }[]): string {
    if (ratingTrend.length < 2) return 'stable';
    
    const first = ratingTrend[0].averageRating;
    const last = ratingTrend[ratingTrend.length - 1].averageRating;
    
    if (last > first + 0.1) return 'improving';
    if (last < first - 0.1) return 'declining';
    return 'stable';
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private cleanupSensitiveData(): void {
    // Remove sensitive data when privacy mode is minimal
    for (const feedback of this.feedbackStore.values()) {
      feedback.content = this.anonymizeContent(feedback.content);
      feedback.userId = this.anonymizeUserId(feedback.userId);
      feedback.sessionId = this.anonymizeSessionId(feedback.sessionId);
    }
  }

  private identifyPerformanceGaps(currentScore: number, benchmarks: { industry: number; internal: number; historical: number; target: number }): string[] {
    const gaps: string[] = [];
    
    if (currentScore < benchmarks.industry) {
      gaps.push(`Below industry average by ${((benchmarks.industry - currentScore) * 100).toFixed(1)}%`);
    }
    
    if (currentScore < benchmarks.internal) {
      gaps.push(`Below internal benchmark by ${((benchmarks.internal - currentScore) * 100).toFixed(1)}%`);
    }
    
    if (currentScore < benchmarks.target) {
      gaps.push(`Below target by ${((benchmarks.target - currentScore) * 100).toFixed(1)}%`);
    }
    
    return gaps;
  }

  private generateOptimizationSuggestions(currentScore: number, targetScore: number): string[] {
    const suggestions: string[] = [];
    
    if (currentScore < targetScore) {
      const gap = targetScore - currentScore;
      
      if (gap > 0.2) {
        suggestions.push('Implement comprehensive feedback collection strategy');
        suggestions.push('Focus on user experience improvements');
        suggestions.push('Enhance response quality metrics');
      } else if (gap > 0.1) {
        suggestions.push('Fine-tune existing feedback mechanisms');
        suggestions.push('Optimize response personalization');
      } else {
        suggestions.push('Minor adjustments to maintain performance');
      }
    }
    
    return suggestions;
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