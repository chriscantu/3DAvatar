// Enhanced common types with strict type safety for 3D Avatar project
// Eliminates 'any' types and provides branded types for better type safety

// Branded types for unique identification
export type UserId = string & { readonly __brand: 'UserId' };
export type SessionId = string & { readonly __brand: 'SessionId' };
export type MessageId = string & { readonly __brand: 'MessageId' };
export type ConversationId = string & { readonly __brand: 'ConversationId' };
export type TimestampMs = number & { readonly __brand: 'TimestampMs' };

// Utility types for better type safety
export type StrictPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, Keys>> & 
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export type Exact<T, U> = T extends U ? (U extends T ? T : never) : never;

// Conditional types for type inference
export type NonNullable<T> = T extends null | undefined ? never : T;
export type NonEmptyArray<T> = [T, ...T[]];

// Deep readonly utility
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Partial deep utility
export type PartialDeep<T> = {
  [P in keyof T]?: T[P] extends object ? PartialDeep<T[P]> : T[P];
};

// Message sender type with strict constraints
export type MessageSender = 'user' | 'assistant';

// Validated message interface with branded types
export interface ChatMessage {
  readonly id: MessageId;
  readonly content: string;
  readonly sender: MessageSender;
  readonly timestamp: TimestampMs;
  readonly conversationId?: ConversationId;
  readonly metadata?: DeepReadonly<MessageMetadata>;
}

// Message metadata with strict typing
export interface MessageMetadata {
  readonly emotionalTone?: EmotionalTone;
  readonly confidence?: ConfidenceScore;
  readonly processingTime?: number;
  readonly tokens?: TokenCount;
  readonly context?: ContextMetadata;
}

// Emotional tone with strict enum
export type EmotionalTone = 
  | 'positive' 
  | 'negative' 
  | 'neutral' 
  | 'excited' 
  | 'calm' 
  | 'concerned' 
  | 'supportive';

// Confidence score with validation
export type ConfidenceScore = number & { readonly __brand: 'ConfidenceScore' };

// Token count with validation
export type TokenCount = number & { readonly __brand: 'TokenCount' };

// Context metadata with strict typing
export interface ContextMetadata {
  readonly relevanceScore: number;
  readonly topicTags: readonly string[];
  readonly processingFlags: readonly ProcessingFlag[];
}

// Processing flags enum
export type ProcessingFlag = 
  | 'emotional_analysis'
  | 'context_compression'
  | 'memory_storage'
  | 'validation_passed'
  | 'error_recovered';

// Conversation state with strict typing
export interface ConversationState {
  readonly id: ConversationId;
  readonly userId: UserId;
  readonly sessionId: SessionId;
  readonly messages: readonly ChatMessage[];
  readonly status: ConversationStatus;
  readonly createdAt: TimestampMs;
  readonly lastActivity: TimestampMs;
  readonly metadata: DeepReadonly<ConversationMetadata>;
}

// Conversation status enum
export type ConversationStatus = 
  | 'active' 
  | 'paused' 
  | 'completed' 
  | 'archived' 
  | 'error';

// Conversation metadata
export interface ConversationMetadata {
  readonly messageCount: number;
  readonly averageResponseTime: number;
  readonly emotionalTrend: EmotionalTone[];
  readonly topics: readonly string[];
  readonly userSatisfaction?: number;
}

// Result type for error handling
export type Result<T, E = Error> = 
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: E };

// Async result type
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

// Validation result type
export interface ValidationResult<T> {
  readonly isValid: boolean;
  readonly data?: T;
  readonly errors: readonly ValidationError[];
}

// Validation error type
export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly code: ValidationErrorCode;
}

// Validation error codes
export type ValidationErrorCode = 
  | 'REQUIRED_FIELD'
  | 'INVALID_FORMAT'
  | 'OUT_OF_RANGE'
  | 'DUPLICATE_VALUE'
  | 'CUSTOM_VALIDATION';

// Type guards for runtime validation
export function isValidMessageSender(value: unknown): value is MessageSender {
  return typeof value === 'string' && ['user', 'assistant'].includes(value);
}

export function isValidChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false;
  
  const msg = value as Record<string, unknown>;
  
  return (
    typeof msg.id === 'string' &&
    typeof msg.content === 'string' &&
    isValidMessageSender(msg.sender) &&
    typeof msg.timestamp === 'number' &&
    msg.timestamp > 0
  );
}

export function isValidConversationState(value: unknown): value is ConversationState {
  if (!value || typeof value !== 'object') return false;
  
  const state = value as Record<string, unknown>;
  
  return (
    typeof state.id === 'string' &&
    typeof state.userId === 'string' &&
    typeof state.sessionId === 'string' &&
    Array.isArray(state.messages) &&
    state.messages.every(isValidChatMessage) &&
    typeof state.status === 'string' &&
    ['active', 'paused', 'completed', 'archived', 'error'].includes(state.status as string)
  );
}

// Factory functions for branded types
export function createUserId(id: string): UserId {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid user ID');
  }
  return id as UserId;
}

export function createSessionId(id: string): SessionId {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid session ID');
  }
  return id as SessionId;
}

export function createMessageId(id: string): MessageId {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid message ID');
  }
  return id as MessageId;
}

export function createConversationId(id: string): ConversationId {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid conversation ID');
  }
  return id as ConversationId;
}

export function createTimestamp(timestamp: number): TimestampMs {
  if (typeof timestamp !== 'number' || timestamp <= 0) {
    throw new Error('Invalid timestamp');
  }
  return timestamp as TimestampMs;
}

export function createConfidenceScore(score: number): ConfidenceScore {
  if (typeof score !== 'number' || score < 0 || score > 1) {
    throw new Error('Confidence score must be between 0 and 1');
  }
  return score as ConfidenceScore;
}

export function createTokenCount(count: number): TokenCount {
  if (typeof count !== 'number' || count < 0 || !Number.isInteger(count)) {
    throw new Error('Token count must be a non-negative integer');
  }
  return count as TokenCount;
}

// Safe message creation with validation
export function createChatMessage(params: {
  id: string;
  content: string;
  sender: MessageSender;
  timestamp: number;
  conversationId?: string;
  metadata?: MessageMetadata;
}): Result<ChatMessage, ValidationError[]> {
  const errors: ValidationError[] = [];

  // Validate required fields
  if (!params.id) {
    errors.push({
      field: 'id',
      message: 'Message ID is required',
      code: 'REQUIRED_FIELD'
    });
  }

  if (!params.content) {
    errors.push({
      field: 'content',
      message: 'Message content is required',
      code: 'REQUIRED_FIELD'
    });
  }

  if (!isValidMessageSender(params.sender)) {
    errors.push({
      field: 'sender',
      message: 'Invalid message sender',
      code: 'INVALID_FORMAT'
    });
  }

  if (typeof params.timestamp !== 'number' || params.timestamp <= 0) {
    errors.push({
      field: 'timestamp',
      message: 'Invalid timestamp',
      code: 'INVALID_FORMAT'
    });
  }

  if (errors.length > 0) {
    return { success: false, error: errors };
  }

  try {
    const message: ChatMessage = {
      id: createMessageId(params.id),
      content: params.content,
      sender: params.sender,
      timestamp: createTimestamp(params.timestamp),
      conversationId: params.conversationId ? createConversationId(params.conversationId) : undefined,
      metadata: params.metadata
    };

    return { success: true, data: message };
  } catch (error) {
    return { 
      success: false, 
      error: [{
        field: 'general',
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'CUSTOM_VALIDATION'
      }]
    };
  }
}

// Safe conversation state creation
export function createConversationState(params: {
  id: string;
  userId: string;
  sessionId: string;
  messages: ChatMessage[];
  status: ConversationStatus;
  createdAt: number;
  lastActivity: number;
  metadata: ConversationMetadata;
}): Result<ConversationState, ValidationError[]> {
  const errors: ValidationError[] = [];

  // Validate all required fields
  if (!params.id) errors.push({ field: 'id', message: 'Conversation ID is required', code: 'REQUIRED_FIELD' });
  if (!params.userId) errors.push({ field: 'userId', message: 'User ID is required', code: 'REQUIRED_FIELD' });
  if (!params.sessionId) errors.push({ field: 'sessionId', message: 'Session ID is required', code: 'REQUIRED_FIELD' });
  if (!Array.isArray(params.messages)) errors.push({ field: 'messages', message: 'Messages must be an array', code: 'INVALID_FORMAT' });

  if (errors.length > 0) {
    return { success: false, error: errors };
  }

  try {
    const state: ConversationState = {
      id: createConversationId(params.id),
      userId: createUserId(params.userId),
      sessionId: createSessionId(params.sessionId),
      messages: params.messages,
      status: params.status,
      createdAt: createTimestamp(params.createdAt),
      lastActivity: createTimestamp(params.lastActivity),
      metadata: params.metadata
    };

    return { success: true, data: state };
  } catch (error) {
    return { 
      success: false, 
      error: [{
        field: 'general',
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'CUSTOM_VALIDATION'
      }]
    };
  }
}

// Utility functions for type-safe operations
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}

export function exhaustiveCheck<T>(value: T): T {
  return value;
}

// Type-safe event system
export interface TypedEvent<T = Record<string, unknown>> {
  readonly type: string;
  readonly payload: T;
  readonly timestamp: TimestampMs;
}

export type EventHandler<T = Record<string, unknown>> = (event: TypedEvent<T>) => void;

// Type-safe configuration
export interface TypeSafeConfig<T> {
  readonly schema: T;
  readonly validate: (value: unknown) => ValidationResult<T>;
  readonly defaults: T;
}

// Export all types for external use
export type {
  DeepReadonly,
  PartialDeep,
  StrictPick,
  RequireAtLeastOne,
  Exact,
  NonNullable,
  NonEmptyArray
}; 