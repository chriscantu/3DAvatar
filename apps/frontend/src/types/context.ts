// Context management types for the 3D Avatar application

import type { ChatMessage } from './common';

/**
 * Core Context Types
 */
export interface Context {
  system: SystemContext;
  session: SessionContext;
  immediate: ImmediateContext;
  timestamp: string;
}

/**
 * System Context - Persistent across all sessions
 */
export interface SystemContext {
  avatarPersonality: AvatarPersonality;
  conversationGuidelines: ConversationGuidelines;
  technicalCapabilities: TechnicalCapabilities;
}

/**
 * Session Context - Semi-persistent during a session
 */
export interface SessionContext {
  sessionId: string;
  userProfile: UserProfile;
  sessionObjectives: string[];
  conversationThemes: ConversationTheme[];
  startTime: Date;
  messageCount: number;
}

/**
 * Immediate Context - Dynamic, current state
 */
export interface ImmediateContext {
  recentMessages: ChatMessage[];
  currentUserEmotion: EmotionState;
  conversationFlow: ConversationFlow;
  activeTopics: string[];
  environmentData: EnvironmentData;
}

/**
 * Avatar Personality Definition
 */
export interface AvatarPersonality {
  traits: PersonalityTraits;
  communicationPatterns: CommunicationPatterns;
  boundaries: PersonalityBoundaries;
  responseStyles: ResponseStyles;
}

export interface PersonalityTraits {
  empathy: number; // 0-1
  curiosity: number; // 0-1
  patience: number; // 0-1
  humor: 'none' | 'gentle' | 'witty' | 'playful';
  supportiveness: number; // 0-1
  formality: number; // 0-1
  enthusiasm: number; // 0-1
}

export interface CommunicationPatterns {
  greeting: CommunicationStyle;
  questioning: CommunicationStyle;
  explaining: CommunicationStyle;
  encouraging: CommunicationStyle;
  farewells: CommunicationStyle;
}

export interface CommunicationStyle {
  tone: string;
  approach: string;
  examples: string[];
}

export interface PersonalityBoundaries {
  prohibitedTopics: string[];
  maxMessageLength: number;
  responseGuidelines: string[];
}

export interface ResponseStyles {
  casual: ResponsePattern;
  professional: ResponsePattern;
  supportive: ResponsePattern;
  educational: ResponsePattern;
}

export interface ResponsePattern {
  structure: string;
  vocabulary: string;
  examples: string[];
}

/**
 * Conversation Guidelines
 */
export interface ConversationGuidelines {
  maxContextWindow: number;
  contextPriority: ContextPriority;
  responseRules: ResponseRule[];
  escalationRules: EscalationRule[];
}

export interface ContextPriority {
  immediate: number;
  recent: number;
  session: number;
  historical: number;
}

export interface ResponseRule {
  condition: string;
  action: string;
  priority: number;
}

export interface EscalationRule {
  trigger: string;
  response: string;
  severity: 'low' | 'medium' | 'high';
}

/**
 * Technical Capabilities
 */
export interface TechnicalCapabilities {
  supportedLanguages: string[];
  maxTokens: number;
  processingTimeout: number;
  cacheSize: number;
  memoryLimits: MemoryLimits;
}

export interface MemoryLimits {
  shortTerm: number;
  longTerm: number;
  workingMemory: number;
}

/**
 * User Profile
 */
export interface UserProfile {
  userId: string;
  interactionHistory: InteractionSummary[];
  preferences: UserPreferences;
  communicationStyle: UserCommunicationStyle;
  topicInterests: TopicInterest[];
}

export interface InteractionSummary {
  date: Date;
  messageCount: number;
  primaryTopics: string[];
  satisfaction: number; // 0-1
  duration: number; // minutes
}

export interface UserPreferences {
  preferredResponseLength: 'short' | 'medium' | 'long';
  formalityLevel: number; // 0-1
  topicDepth: 'surface' | 'moderate' | 'deep';
  explanationStyle: 'simple' | 'detailed' | 'technical';
}

export interface UserCommunicationStyle {
  directness: number; // 0-1
  emotionalExpressiveness: number; // 0-1
  questioningStyle: 'direct' | 'exploratory' | 'hypothetical';
}

export interface TopicInterest {
  topic: string;
  interest: number; // 0-1
  expertise: number; // 0-1
  lastDiscussed: Date;
}

/**
 * Conversation Themes and Topics
 */
export interface ConversationTheme {
  theme: string;
  frequency: number;
  recency: number;
  userEngagement: number;
  relatedTopics: string[];
}

export interface ConversationFlow {
  currentPhase: ConversationPhase;
  flowState: FlowState;
  transitionTriggers: TransitionTrigger[];
}

export type ConversationPhase = 
  | 'greeting'
  | 'exploration'
  | 'deep_discussion'
  | 'problem_solving'
  | 'conclusion'
  | 'farewell';

export interface FlowState {
  momentum: number; // 0-1
  depth: number; // 0-1
  engagement: number; // 0-1
  clarity: number; // 0-1
}

export interface TransitionTrigger {
  from: ConversationPhase;
  to: ConversationPhase;
  condition: string;
  probability: number; // 0-1
}

/**
 * Emotion and Sentiment
 */
export type EmotionState = 
  | 'happy'
  | 'sad'
  | 'excited'
  | 'calm'
  | 'frustrated'
  | 'confused'
  | 'curious'
  | 'neutral';

export interface EmotionAnalysis {
  primary: EmotionState;
  secondary?: EmotionState;
  intensity: number; // 0-1
  confidence: number; // 0-1
  triggers: string[];
}

/**
 * Enhanced Emotional Intelligence Types
 */
export interface EmotionalState {
  primary: string;
  secondary?: string;
  intensity: number; // 0-1 scale
  confidence: number; // 0-1 scale
  indicators: string[];
  trend: 'improving' | 'declining' | 'stable';
}

export interface EmotionalAnalysis {
  detectedEmotion: string;
  confidence: number;
  suggestedResponse: ResponseToneAdjustment;
  emotionalContext: EmotionalState;
}

export interface EmotionalContext {
  primary: string;
  secondary?: string;
  intensity: number; // 0-1 scale
  confidence: number; // 0-1 scale
  indicators: string[];
  trend: 'improving' | 'declining' | 'stable';
}

export interface ResponseToneAdjustment {
  tone: 'supportive' | 'enthusiastic' | 'calming' | 'encouraging' | 'neutral';
  adjustments: {
    warmth: number; // -1 to 1
    energy: number; // -1 to 1
    formality: number; // -1 to 1
    empathy: number; // 0 to 1
  };
  suggestedPhrases: string[];
  avoidPhrases: string[];
}

export interface EmotionalPattern {
  userId: string;
  patterns: {
    commonEmotions: string[];
    triggers: { emotion: string; keywords: string[] }[];
    recoveryStrategies: { emotion: string; effectiveResponses: string[] }[];
    emotionalJourney: { timestamp: number; emotion: string; intensity: number }[];
  };
  lastUpdated: number;
}

/**
 * Environment Data
 */
export interface EnvironmentData {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  userTimezone: string;
  sessionDuration: number; // minutes
  activeFeatures: string[];
  deviceType: 'desktop' | 'tablet' | 'mobile';
  networkQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

/**
 * Memory System Types
 */
export interface MemorySystem {
  shortTermMemory: ShortTermMemory;
  longTermMemory: LongTermMemory;
  workingMemory: WorkingMemory;
}

export interface ShortTermMemory {
  messages: ChatMessage[];
  context: Context[];
  duration: number; // minutes
  capacity: number;
}

export interface LongTermMemory {
  userProfile: UserProfile;
  significantInteractions: SignificantInteraction[];
  learnedPreferences: LearnedPreference[];
  relationshipProgress: RelationshipProgress;
}

export interface WorkingMemory {
  currentContext: Context;
  activeProcesses: ActiveProcess[];
  temporaryData: Record<string, unknown>;
}

export interface SignificantInteraction {
  id: string;
  timestamp: Date;
  summary: string;
  impact: number; // 0-1
  emotionalResonance: number; // 0-1
  topics: string[];
}

export interface LearnedPreference {
  category: string;
  preference: string;
  confidence: number; // 0-1
  evidence: string[];
  lastUpdated: Date;
}

export interface RelationshipProgress {
  trustLevel: number; // 0-1
  intimacyLevel: number; // 0-1
  sharedExperiences: string[];
  communicationEvolution: CommunicationEvolution[];
}

export interface CommunicationEvolution {
  phase: string;
  characteristics: string[];
  timestamp: Date;
}

export interface ActiveProcess {
  id: string;
  type: 'context_analysis' | 'response_generation' | 'emotion_detection';
  status: 'running' | 'waiting' | 'completed' | 'failed';
  progress: number; // 0-1
  data: Record<string, unknown>;
}

/**
 * Context Cache Types
 */
export interface ContextCache {
  key: string;
  data: Context;
  timestamp: Date;
  ttl: number; // seconds
  accessCount: number;
  lastAccessed: Date;
}

export interface CacheConfig {
  maxSize: number;
  defaultTTL: number; // seconds
  cleanupInterval: number; // seconds
  compressionEnabled: boolean;
}

/**
 * Context Manager Configuration
 */
export interface ContextManagerConfig {
  cache: CacheConfig;
  memory: MemoryLimits;
  processing: ProcessingConfig;
  validation: ValidationConfig;
}

export interface ProcessingConfig {
  maxProcessingTime: number; // milliseconds
  batchSize: number;
  priorityLevels: number;
}

export interface ValidationConfig {
  enabled: boolean;
  rules: ValidationRule[];
  strictMode: boolean;
}

export interface ValidationRule {
  field: string;
  validator: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

/**
 * Context Events
 */
export interface ContextEvent {
  type: ContextEventType;
  payload: Record<string, unknown>;
  timestamp: Date;
  source: string;
}

export type ContextEventType = 
  | 'context_created'
  | 'context_updated'
  | 'context_cached'
  | 'context_retrieved'
  | 'context_expired'
  | 'memory_updated'
  | 'personality_adjusted'
  | 'error_occurred';

/**
 * Context Analysis Results
 */
export interface ContextAnalysis {
  relevanceScore: number; // 0-1
  emotionalTone: EmotionAnalysis;
  topicClassification: TopicClassification[];
  userIntentAnalysis: UserIntentAnalysis;
  responseRecommendations: ResponseRecommendation[];
}

export interface TopicClassification {
  topic: string;
  confidence: number; // 0-1
  category: string;
  relevance: number; // 0-1
}

export interface UserIntentAnalysis {
  primaryIntent: string;
  secondaryIntents: string[];
  confidence: number; // 0-1
  actionRequired: boolean;
  urgency: 'low' | 'medium' | 'high';
}

export interface ResponseRecommendation {
  type: 'clarification' | 'information' | 'support' | 'action';
  priority: number; // 0-1
  suggestion: string;
  reasoning: string;
} 