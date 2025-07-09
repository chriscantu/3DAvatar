import type { 
  Context, 
  ContextAnalysis, 
  ContextEvent, 
  ContextEventType,
  UserProfile,
  EmotionState,
  ContextManagerConfig,
  MemoryLimits,
  SignificantInteraction,
  LearnedPreference,
  RelationshipProgress,
  ActiveProcess
} from '../types/context';
import type { ChatMessage } from '../types/common';

// Core Service Interface
export interface IService {
  readonly name: string;
  readonly version: string;
  isHealthy(): boolean;
  initialize(): Promise<void>;
  cleanup(): Promise<void>;
}

// Context Manager Service Interface
export interface IContextManager extends IService {
  processMessage(message: ChatMessage): Promise<Context>;
  analyzeContext(context: Context): Promise<ContextAnalysis>;
  updateContext(updates: Partial<Context>): Promise<Context>;
  clearSession(preserveProfile?: boolean): Promise<void>;
  getSessionContext(): Context;
  addEventListener(event: ContextEventType, handler: (event: ContextEvent) => void): () => void;
  removeEventListener(event: ContextEventType, handler: (event: ContextEvent) => void): void;
  getConfig(): ContextManagerConfig;
  updateConfig(updates: Partial<ContextManagerConfig>): void;
}

// Memory System Service Interface
export interface IMemorySystem extends IService {
  readonly shortTermMemory: IShortTermMemory;
  readonly longTermMemory: ILongTermMemory;
  readonly workingMemory: IWorkingMemory;
  
  processMessage(message: ChatMessage, context: Context): Promise<void>;
  getRelevantMemories(query: string): Promise<RelevantMemoryResult>;
  clearMemory(type: 'short' | 'long' | 'working' | 'all'): Promise<void>;
  getMemoryStats(): MemoryStats;
  optimizeMemory(): Promise<void>;
}

// Memory Component Interfaces
export interface IShortTermMemory {
  addMessage(message: ChatMessage): void;
  getRecentMessages(count?: number): ChatMessage[];
  clear(): void;
  getStats(): ShortTermMemoryStats;
}

export interface ILongTermMemory {
  readonly userProfile: UserProfile;
  readonly significantInteractions: SignificantInteraction[];
  readonly learnedPreferences: LearnedPreference[];
  readonly relationshipProgress: RelationshipProgress;
  
  addSignificantInteraction(interaction: SignificantInteraction): void;
  updateUserProfile(updates: Partial<UserProfile>): void;
  addLearnedPreference(preference: LearnedPreference): void;
  updateRelationshipProgress(updates: Partial<RelationshipProgress>): void;
  clear(): void;
  getStats(): LongTermMemoryStats;
}

export interface IWorkingMemory {
  readonly currentContext: Context;
  readonly activeProcesses: ActiveProcess[];
  readonly temporaryData: Record<string, unknown>;
  
  updateContext(context: Context): void;
  addActiveProcess(process: ActiveProcess): void;
  removeActiveProcess(processId: string): void;
  setTemporaryData(key: string, value: unknown): void;
  getTemporaryData(key: string): unknown;
  clear(): void;
  getStats(): WorkingMemoryStats;
}

// Emotional Intelligence Service Interface
export interface IEmotionalIntelligence extends IService {
  analyzeEmotion(text: string): Promise<EmotionalAnalysis>;
  getEmotionalContext(messages: ChatMessage[]): Promise<EmotionalContext>;
  updateEmotionalState(emotion: EmotionState): Promise<void>;
  getEmotionalTrends(): Promise<EmotionalTrends>;
  calibrateEmotions(): Promise<void>;
}

// Context Compression Service Interface
export interface IContextCompression extends IService {
  compressContext(context: Context): Promise<CompressionResult>;
  summarizeConversation(messages: ChatMessage[]): Promise<ConversationSummary>;
  analyzeConversation(messages: ChatMessage[]): Promise<ConversationAnalytics>;
  getCompressionStats(): CompressionStats;
  optimizeCompression(): Promise<void>;
}

// Context Validation Service Interface
export interface IContextValidation extends IService {
  validateContext(context: Context): Promise<ValidationResult>;
  validateMessage(message: ChatMessage): Promise<ValidationResult>;
  getValidationRules(): ValidationRule[];
  addValidationRule(rule: ValidationRule): void;
  removeValidationRule(ruleId: string): void;
  performHealthCheck(): Promise<HealthCheckResult>;
}

// Feedback Collection Service Interface
export interface IFeedbackCollection extends IService {
  collectFeedback(feedback: UserFeedback): Promise<void>;
  recordInteraction(metrics: InteractionMetrics): Promise<void>;
  getAnalytics(): Promise<FeedbackAnalytics>;
  generateReport(): Promise<FeedbackReport>;
  exportData(): Promise<string>;
}

// Voice Service Interface
export interface IVoiceService extends IService {
  readonly isSupported: boolean;
  readonly isListening: boolean;
  readonly transcript: string;
  
  startListening(): Promise<void>;
  stopListening(): Promise<void>;
  clearTranscript(): void;
  getConfiguration(): VoiceConfiguration;
  updateConfiguration(config: Partial<VoiceConfiguration>): void;
}

// Service Factory Interface
export interface IServiceFactory {
  createContextManager(config?: Partial<ContextManagerConfig>): IContextManager;
  createMemorySystem(limits?: Partial<MemoryLimits>): IMemorySystem;
  createEmotionalIntelligence(): IEmotionalIntelligence;
  createContextCompression(): IContextCompression;
  createContextValidation(): IContextValidation;
  createFeedbackCollection(): IFeedbackCollection;
  createVoiceService(): IVoiceService;
}

// Type definitions for interfaces
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
  capacity: number;
  utilizationPercentage: number;
  oldestMessage?: Date;
  newestMessage?: Date;
}

export interface LongTermMemoryStats {
  interactionCount: number;
  preferenceCount: number;
  relationshipLevel: number;
  memoryQuality: number;
  lastUpdate: Date;
}

export interface WorkingMemoryStats {
  activeProcessCount: number;
  temporaryDataSize: number;
  capacity: number;
  utilizationPercentage: number;
}

export interface EmotionalAnalysis {
  primary: string;
  secondary?: string;
  intensity: number;
  confidence: number;
  indicators: string[];
  trend: 'improving' | 'declining' | 'stable';
}

export interface EmotionalContext {
  primary: string;
  secondary?: string;
  intensity: number;
  confidence: number;
  indicators: string[];
  trend: 'improving' | 'declining' | 'stable';
}

export interface EmotionalTrends {
  overall: string;
  recent: string[];
  patterns: EmotionalPattern[];
  recommendations: string[];
}

export interface EmotionalPattern {
  emotion: string;
  frequency: number;
  triggers: string[];
  duration: number;
}

export interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  summary: string;
  keyPoints: string[];
  quality: number;
  metadata: CompressionMetadata;
}

export interface CompressionMetadata {
  algorithm: string;
  processingTime: number;
  qualityScore: number;
  preservedElements: string[];
}

export interface ConversationSummary {
  id: string;
  timespan: { start: Date; end: Date };
  participantCount: number;
  messageCount: number;
  summary: string;
  keyTopics: string[];
  keyPoints: string[];
  participants: string[];
  duration: number;
  significantMoments: SignificantMoment[];
  emotionalArc: EmotionalArc;
  actionItems: ActionItem[];
  quality: SummaryQuality;
}

export interface SignificantMoment {
  timestamp: Date;
  type: 'breakthrough' | 'conflict' | 'insight' | 'decision';
  description: string;
  impact: number;
  participants: string[];
}

export interface EmotionalArc {
  start: string;
  end: string;
  peaks: EmotionalPeak[];
  overall: string;
  stability: number;
}

export interface EmotionalPeak {
  timestamp: Date;
  emotion: string;
  intensity: number;
  trigger: string;
}

export interface ActionItem {
  id: string;
  description: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: Date;
}

export interface SummaryQuality {
  accuracy: number;
  completeness: number;
  coherence: number;
  overall: number;
}

export interface ConversationAnalytics {
  messageCount: number;
  participantCount: number;
  timespan: { start: Date; end: Date };
  averageMessageLength: number;
  questionCount: number;
  engagementScore: number;
  themes: string[];
  emotionalTone: string;
  topicTransitions: TopicProgression[];
  interactionPatterns: InteractionPattern[];
  topicProgression: TopicProgression[];
  responseTimePatterns: ResponseTimePattern[];
}

export interface TopicProgression {
  topic: string;
  startTime: Date;
  endTime: Date;
  messageCount: number;
  engagement: number;
}

export interface InteractionPattern {
  pattern: string;
  frequency: number;
  participants: string[];
  significance: number;
}

export interface ResponseTimePattern {
  participant: string;
  averageResponseTime: number;
  pattern: 'consistent' | 'variable' | 'declining' | 'improving';
}

export interface CompressionStats {
  totalCompressions: number;
  averageCompressionRatio: number;
  qualityScore: number;
  processingTime: number;
  memoryUsage: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number;
  summary: ValidationSummary;
  recommendations: ValidationRecommendation[];
  metadata?: ValidationMetadata;
}

export interface ValidationError {
  code: string;
  message: string;
  severity: 'error' | 'warning';
  field?: string;
  value?: unknown;
}

export interface ValidationWarning {
  code: string;
  message: string;
  field?: string;
  value?: unknown;
}

export interface ValidationSummary {
  totalChecks: number;
  passed: number;
  failed: number;
  warnings: number;
  overallScore: number;
}

export interface ValidationRecommendation {
  type: 'fix' | 'optimize' | 'enhance';
  description: string;
  priority: 'low' | 'medium' | 'high';
  impact: string;
}

export interface ValidationMetadata {
  validationTime: number;
  rulesApplied: string[];
  [key: string]: unknown;
}

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  category: 'required' | 'type' | 'range' | 'format' | 'consistency' | 'performance';
  severity: 'error' | 'warning';
  enabled: boolean;
  validator: (context: Context) => ValidationResult | null;
  validate?: (context: Context) => { isValid: boolean; error?: unknown };
}

export interface HealthCheckResult {
  isHealthy: boolean;
  issues: HealthIssue[];
  score: number;
  recommendations: string[];
  timestamp: Date;
}

export interface HealthIssue {
  type: 'data_quality' | 'performance' | 'consistency' | 'security';
  severity: 'info' | 'warning' | 'error' | 'critical';
  description: string;
  affectedComponents: string[];
  resolution: string;
  category: 'data_quality' | 'performance' | 'consistency' | 'security';
}

export interface UserFeedback {
  id: string;
  sessionId: string;
  userId: string;
  timestamp: Date;
  type: FeedbackType;
  rating?: number;
  category: FeedbackCategory;
  content: string;
  context: FeedbackContext;
  metadata: FeedbackMetadata;
}

export interface FeedbackType {
  explicit: boolean;
  implicit: boolean;
  category: string;
}

export interface FeedbackCategory {
  name: string;
  description: string;
  weight: number;
}

export interface FeedbackContext {
  page: string;
  feature: string;
  userAgent: string;
  sessionDuration: number;
  previousActions: string[];
}

export interface FeedbackMetadata {
  source: string;
  confidence: number;
  processed: boolean;
  tags: string[];
}

export interface InteractionMetrics {
  sessionId: string;
  userId: string;
  timestamp: Date;
  duration: number;
  messageCount: number;
  userInitiated: boolean;
  completionRate: number;
  engagementScore: number;
  satisfactionScore: number;
  technicalMetrics: TechnicalMetrics;
  behavioralMetrics: BehavioralMetrics;
}

export interface TechnicalMetrics {
  responseTime: number;
  errorRate: number;
  throughput: number;
  resourceUsage: ResourceUsage;
}

export interface ResourceUsage {
  cpu: number;
  memory: number;
  network: number;
}

export interface BehavioralMetrics {
  clickRate: number;
  scrollDepth: number;
  timeOnPage: number;
  bounceRate: number;
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
  satisfactionScore: number;
  categoryBreakdown: Record<string, number>;
  timeRange: { start: Date; end: Date };
}

export interface FeedbackTrends {
  rating: TrendData;
  satisfaction: TrendData;
  categories: Record<string, TrendData>;
  volume: TrendData;
}

export interface TrendData {
  current: number;
  previous: number;
  change: number;
  direction: 'up' | 'down' | 'stable';
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
  impact: string;
  segments: string[];
}

export interface CriticalIssue {
  issue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedUsers: number;
  resolution: string;
  priority: number;
}

export interface ImprovementRecommendations {
  areas: ImprovementRecommendation[];
  overallScore: number;
  priorityActions: string[];
  longTermGoals: string[];
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

export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  availability: number;
  userSatisfaction: number;
}

export interface FeedbackReport {
  id: string;
  generatedAt: Date;
  timeRange: { start: Date; end: Date };
  summary: AnalyticsSummary;
  analytics: FeedbackAnalytics;
  recommendations: ImprovementRecommendations;
  rawData: UserFeedback[];
}

export interface VoiceConfiguration {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  timeout: number;
  sensitivity: number;
} 