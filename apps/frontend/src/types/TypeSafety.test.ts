import { describe, it, expect, expectTypeOf } from 'vitest';
import type { ChatMessage } from './';
import type { 
  Context, 
  ContextAnalysis, 
  UserProfile, 
  EmotionState,
  SystemContext,
  SessionContext,
  ImmediateContext
} from './';

// Type-only tests to validate TypeScript types at compile time
describe('Type Safety', () => {
  describe('ChatMessage Type Safety', () => {
    it('should enforce required properties', () => {
      // Valid message
      const validMessage: ChatMessage = {
        id: 'test-id',
        content: 'Hello world',
        timestamp: Date.now(),
        sender: 'user'
      };
      
      expectTypeOf(validMessage).toEqualTypeOf<ChatMessage>();
      expect(validMessage.id).toBe('test-id');
      expect(validMessage.content).toBe('Hello world');
      expect(validMessage.sender).toBe('user');
    });
    
    it('should enforce sender type constraints', () => {
      // Should only allow 'user' or 'assistant'
      expectTypeOf<ChatMessage['sender']>().toEqualTypeOf<'user' | 'assistant'>();
      
      const userMessage: ChatMessage = {
        id: '1',
        content: 'Hello',
        timestamp: Date.now(),
        sender: 'user'
      };
      
      const assistantMessage: ChatMessage = {
        id: '2',
        content: 'Hi there',
        timestamp: Date.now(),
        sender: 'assistant'
      };
      
      expect(userMessage.sender).toBe('user');
      expect(assistantMessage.sender).toBe('assistant');
    });
    
    it('should enforce readonly arrays for message lists', () => {
      type MessageList = readonly ChatMessage[];
      
      const messages: MessageList = [
        {
          id: '1',
          content: 'Hello',
          timestamp: Date.now(),
          sender: 'user'
        }
      ];
      
      expectTypeOf(messages).toEqualTypeOf<readonly ChatMessage[]>();
      
      // Should not be able to push to readonly array
      // @ts-expect-error - Cannot push to readonly array
      // messages.push({ id: '2', content: 'World', timestamp: Date.now(), sender: 'assistant' });
    });
  });
  
  describe('Context Type Safety', () => {
    it('should enforce complete context structure', () => {
      const validContext: Context = {
        system: {
          timestamp: new Date(),
          environment: 'test',
          version: '1.0.0',
          capabilities: ['chat', 'voice'],
          resources: { cpu: 0.5, memory: 0.3, network: 0.2 }
        },
        session: {
          id: 'session-1',
          userId: 'user-1',
          startTime: new Date(),
          messageCount: 5,
          conversationPhase: 'active',
          topics: ['technology', 'AI'],
          userProfile: {
            id: 'user-1',
            name: 'Test User',
            preferences: { theme: 'dark', language: 'en' },
            conversationStyle: 'friendly',
            interests: ['technology'],
            expertise: ['programming'],
            goals: ['learn AI'],
            personalityTraits: {
              openness: 0.8,
              conscientiousness: 0.7,
              extraversion: 0.6,
              agreeableness: 0.9,
              neuroticism: 0.3
            },
            communicationPreferences: {
              formality: 'casual',
              verbosity: 'moderate',
              responseTime: 'normal'
            },
            learningStyle: 'visual',
            culturalContext: {
              language: 'en',
              region: 'US',
              timezone: 'UTC'
            },
            accessibilityNeeds: [],
            privacySettings: {
              dataCollection: true,
              personalization: true,
              analytics: false
            },
            relationshipLevel: 'established',
            trustLevel: 0.8,
            engagementHistory: {
              totalInteractions: 100,
              averageSessionLength: 1800,
              lastActive: new Date(),
              preferredTopics: ['technology', 'AI']
            },
            feedbackHistory: {
              ratings: [5, 4, 5, 5, 4],
              comments: ['Great conversation!'],
              improvements: ['More technical depth']
            },
            createdAt: new Date(),
            updatedAt: new Date()
          }
        },
        immediate: {
          currentMessage: {
            id: 'msg-1',
            content: 'Hello',
            timestamp: Date.now(),
            sender: 'user'
          },
          recentMessages: [],
          currentTopic: 'greeting',
          userIntent: 'start_conversation',
          emotionalState: {
            primary: 'neutral',
            intensity: 0.5,
            confidence: 0.8,
            indicators: ['calm_tone'],
            timestamp: new Date()
          },
          urgency: 'normal',
          contextClues: ['first_message'],
          environmentData: {
            location: 'home',
            timeOfDay: 'morning',
            weather: 'sunny',
            deviceType: 'desktop',
            platform: 'web'
          },
          userState: {
            isTyping: false,
            lastActive: new Date(),
            attention: 'focused',
            mood: 'positive',
            energy: 'high'
          },
          conversationFlow: {
            stage: 'opening',
            momentum: 'building',
            direction: 'forward',
            coherence: 0.9
          },
          relevantMemories: [],
          activeProcesses: [],
          temporaryData: {}
        }
      };
      
      expectTypeOf(validContext).toEqualTypeOf<Context>();
      expect(validContext.system.environment).toBe('test');
      expect(validContext.session.userId).toBe('user-1');
      expect(validContext.immediate.currentTopic).toBe('greeting');
    });
    
    it('should enforce readonly properties where appropriate', () => {
      // System context should have readonly arrays
      expectTypeOf<SystemContext['capabilities']>().toEqualTypeOf<readonly string[]>();
      
      // Session topics should be readonly
      expectTypeOf<SessionContext['topics']>().toEqualTypeOf<readonly string[]>();
      
      // User interests should be readonly
      expectTypeOf<UserProfile['interests']>().toEqualTypeOf<readonly string[]>();
    });
    
    it('should enforce strict emotion state types', () => {
      const emotionState: EmotionState = {
        primary: 'happy',
        intensity: 0.8,
        confidence: 0.9,
        indicators: ['smile', 'positive_words'],
        timestamp: new Date()
      };
      
      expectTypeOf(emotionState.indicators).toEqualTypeOf<readonly string[]>();
      expectTypeOf(emotionState.intensity).toEqualTypeOf<number>();
      expectTypeOf(emotionState.confidence).toEqualTypeOf<number>();
      
      // Intensity and confidence should be between 0 and 1
      expect(emotionState.intensity).toBeGreaterThanOrEqual(0);
      expect(emotionState.intensity).toBeLessThanOrEqual(1);
      expect(emotionState.confidence).toBeGreaterThanOrEqual(0);
      expect(emotionState.confidence).toBeLessThanOrEqual(1);
    });
  });
  
  describe('Branded Types', () => {
    it('should create unique branded types', () => {
      // Define branded types for better type safety
      type UserId = string & { readonly __brand: 'UserId' };
      type SessionId = string & { readonly __brand: 'SessionId' };
      type MessageId = string & { readonly __brand: 'MessageId' };
      
      // Helper functions to create branded types
      const createUserId = (id: string): UserId => id as UserId;
      const createSessionId = (id: string): SessionId => id as SessionId;
      const createMessageId = (id: string): MessageId => id as MessageId;
      
      const userId = createUserId('user-123');
      const sessionId = createSessionId('session-456');
      const messageId = createMessageId('msg-789');
      
      // Types should be distinct
      expectTypeOf(userId).not.toEqualTypeOf<SessionId>();
      expectTypeOf(sessionId).not.toEqualTypeOf<MessageId>();
      expectTypeOf(messageId).not.toEqualTypeOf<UserId>();
      
      // But still be strings at runtime
      expect(typeof userId).toBe('string');
      expect(typeof sessionId).toBe('string');
      expect(typeof messageId).toBe('string');
    });
    
    it('should enforce numeric ranges with branded types', () => {
      // Define branded numeric types with constraints
      type Percentage = number & { readonly __brand: 'Percentage' };
      type Timestamp = number & { readonly __brand: 'Timestamp' };
      type Score = number & { readonly __brand: 'Score' };
      
      const createPercentage = (value: number): Percentage => {
        if (value < 0 || value > 1) {
          throw new Error('Percentage must be between 0 and 1');
        }
        return value as Percentage;
      };
      
      const createScore = (value: number): Score => {
        if (value < 0 || value > 100) {
          throw new Error('Score must be between 0 and 100');
        }
        return value as Score;
      };
      
      const percentage = createPercentage(0.75);
      const score = createScore(85);
      
      expectTypeOf(percentage).toEqualTypeOf<Percentage>();
      expectTypeOf(score).toEqualTypeOf<Score>();
      
      expect(percentage).toBe(0.75);
      expect(score).toBe(85);
      
      // Should throw for invalid values
      expect(() => createPercentage(1.5)).toThrow();
      expect(() => createScore(150)).toThrow();
    });
  });
  
  describe('Utility Types', () => {
    it('should create strict utility types', () => {
      // Strict Pick that ensures all keys exist
      type StrictPick<T, K extends keyof T> = Pick<T, K>;
      
      // Require at least one property
      type RequireAtLeastOne<T> = {
        [K in keyof T]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<keyof T, K>>>;
      }[keyof T];
      
      // Exact type that doesn't allow extra properties
      type Exact<T, U extends T> = T & Record<Exclude<keyof U, keyof T>, never>;
      
      interface TestInterface {
        a: string;
        b?: number;
        c?: boolean;
      }
      
      // Test StrictPick
      type PickedType = StrictPick<TestInterface, 'a' | 'b'>;
      expectTypeOf<PickedType>().toEqualTypeOf<{ a: string; b?: number }>();
      
      // Test RequireAtLeastOne
      type RequiredType = RequireAtLeastOne<TestInterface>;
      const validRequired: RequiredType = { a: 'test' };
      expectTypeOf(validRequired).toEqualTypeOf<RequiredType>();
      
      // Test Exact
      type ExactType = Exact<TestInterface, { a: string; b: number }>;
      const exactValue: ExactType = { a: 'test', b: 42 };
      expectTypeOf(exactValue).toEqualTypeOf<ExactType>();
    });
    
    it('should create conditional types for better type inference', () => {
      // Conditional type based on message sender
      type MessageContent<T extends ChatMessage['sender']> = T extends 'user'
        ? { userInput: string; timestamp: number }
        : { response: string; confidence: number };
      
      type UserMessageContent = MessageContent<'user'>;
      type AssistantMessageContent = MessageContent<'assistant'>;
      
      expectTypeOf<UserMessageContent>().toEqualTypeOf<{ userInput: string; timestamp: number }>();
      expectTypeOf<AssistantMessageContent>().toEqualTypeOf<{ response: string; confidence: number }>();
      
      const userContent: UserMessageContent = {
        userInput: 'Hello',
        timestamp: Date.now()
      };
      
      const assistantContent: AssistantMessageContent = {
        response: 'Hi there!',
        confidence: 0.95
      };
      
      expect(userContent.userInput).toBe('Hello');
      expect(assistantContent.response).toBe('Hi there!');
    });
  });
  
  describe('Generic Constraints', () => {
    it('should enforce generic constraints properly', () => {
      // Generic function with constraints
      function processMessage<T extends ChatMessage>(
        message: T,
        processor: (msg: T) => T
      ): T {
        return processor(message);
      }
      
      const userMessage: ChatMessage = {
        id: '1',
        content: 'Hello',
        timestamp: Date.now(),
        sender: 'user'
      };
      
      const processedMessage = processMessage(userMessage, (msg) => ({
        ...msg,
        content: msg.content.toUpperCase()
      }));
      
      expectTypeOf(processedMessage).toEqualTypeOf<ChatMessage>();
      expect(processedMessage.content).toBe('HELLO');
    });
    
    it('should enforce keyof constraints', () => {
      // Function that only accepts valid context keys
      function getContextProperty<T extends Context, K extends keyof T>(
        context: T,
        key: K
      ): T[K] {
        return context[key];
      }
      
      const context: Context = {
        system: {
          timestamp: new Date(),
          environment: 'test',
          version: '1.0.0',
          capabilities: [],
          resources: { cpu: 0.5, memory: 0.3, network: 0.2 }
        },
        session: {} as SessionContext,
        immediate: {} as ImmediateContext
      };
      
      const systemContext = getContextProperty(context, 'system');
      expectTypeOf(systemContext).toEqualTypeOf<SystemContext>();
      
      // Should not allow invalid keys
      // @ts-expect-error - 'invalid' is not a key of Context
      // const invalid = getContextProperty(context, 'invalid');
    });
  });
  
  describe('Mapped Types', () => {
    it('should create readonly versions of types', () => {
      // Create readonly version of any type
      type DeepReadonly<T> = {
        readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
      };
      
      type ReadonlyContext = DeepReadonly<Context>;
      
      // Should make all properties readonly
      expectTypeOf<ReadonlyContext['system']['timestamp']>().toEqualTypeOf<readonly Date>();
      expectTypeOf<ReadonlyContext['session']['topics']>().toEqualTypeOf<readonly string[]>();
    });
    
    it('should create optional versions of types', () => {
      // Make all properties optional
      type PartialDeep<T> = {
        [P in keyof T]?: T[P] extends object ? PartialDeep<T[P]> : T[P];
      };
      
      type PartialMessage = PartialDeep<ChatMessage>;
      
      const partialMessage: PartialMessage = {
        id: '1'
        // All other properties are optional
      };
      
      expectTypeOf(partialMessage).toEqualTypeOf<PartialMessage>();
      expect(partialMessage.id).toBe('1');
    });
  });
  
  describe('Type Guards', () => {
    it('should create effective type guards', () => {
      // Type guard for message sender
      function isUserMessage(message: ChatMessage): message is ChatMessage & { sender: 'user' } {
        return message.sender === 'user';
      }
      
      function isAssistantMessage(message: ChatMessage): message is ChatMessage & { sender: 'assistant' } {
        return message.sender === 'assistant';
      }
      
      const userMessage: ChatMessage = {
        id: '1',
        content: 'Hello',
        timestamp: Date.now(),
        sender: 'user'
      };
      
      const assistantMessage: ChatMessage = {
        id: '2',
        content: 'Hi there',
        timestamp: Date.now(),
        sender: 'assistant'
      };
      
      expect(isUserMessage(userMessage)).toBe(true);
      expect(isUserMessage(assistantMessage)).toBe(false);
      expect(isAssistantMessage(assistantMessage)).toBe(true);
      expect(isAssistantMessage(userMessage)).toBe(false);
      
      // Type narrowing should work
      if (isUserMessage(userMessage)) {
        expectTypeOf(userMessage.sender).toEqualTypeOf<'user'>();
      }
      
      if (isAssistantMessage(assistantMessage)) {
        expectTypeOf(assistantMessage.sender).toEqualTypeOf<'assistant'>();
      }
    });
    
    it('should validate object shapes with type guards', () => {
      // Type guard for context validation
      function isValidContext(obj: any): obj is Context {
        return (
          obj &&
          typeof obj === 'object' &&
          obj.system &&
          obj.session &&
          obj.immediate &&
          typeof obj.system.timestamp === 'object' &&
          typeof obj.session.id === 'string' &&
          typeof obj.immediate.currentTopic === 'string'
        );
      }
      
      const validContext: Context = {
        system: {
          timestamp: new Date(),
          environment: 'test',
          version: '1.0.0',
          capabilities: [],
          resources: { cpu: 0.5, memory: 0.3, network: 0.2 }
        },
        session: {
          id: 'session-1',
          userId: 'user-1',
          startTime: new Date(),
          messageCount: 0,
          conversationPhase: 'greeting',
          topics: [],
          userProfile: {} as UserProfile
        },
        immediate: {
          currentMessage: {
            id: '1',
            content: 'test',
            timestamp: Date.now(),
            sender: 'user'
          },
          recentMessages: [],
          currentTopic: 'test',
          userIntent: 'test',
          emotionalState: {
            primary: 'neutral',
            intensity: 0.5,
            confidence: 0.8,
            indicators: [],
            timestamp: new Date()
          },
          urgency: 'normal',
          contextClues: [],
          environmentData: {
            location: 'test',
            timeOfDay: 'morning',
            weather: 'clear',
            deviceType: 'desktop',
            platform: 'web'
          },
          userState: {
            isTyping: false,
            lastActive: new Date(),
            attention: 'focused',
            mood: 'neutral',
            energy: 'normal'
          },
          conversationFlow: {
            stage: 'active',
            momentum: 'building',
            direction: 'forward',
            coherence: 0.8
          },
          relevantMemories: [],
          activeProcesses: [],
          temporaryData: {}
        }
      };
      
      const invalidContext = { invalid: 'object' };
      
      expect(isValidContext(validContext)).toBe(true);
      expect(isValidContext(invalidContext)).toBe(false);
      expect(isValidContext(null)).toBe(false);
      expect(isValidContext(undefined)).toBe(false);
    });
  });
  
  describe('Error Handling Types', () => {
    it('should create typed error results', () => {
      // Result type for error handling
      type Result<T, E = Error> = 
        | { success: true; data: T }
        | { success: false; error: E };
      
      function processMessageSafely(message: ChatMessage): Result<ChatMessage, string> {
        if (!message.content.trim()) {
          return { success: false, error: 'Message content cannot be empty' };
        }
        
        return {
          success: true,
          data: {
            ...message,
            content: message.content.trim()
          }
        };
      }
      
      const validMessage: ChatMessage = {
        id: '1',
        content: '  Hello  ',
        timestamp: Date.now(),
        sender: 'user'
      };
      
      const invalidMessage: ChatMessage = {
        id: '2',
        content: '   ',
        timestamp: Date.now(),
        sender: 'user'
      };
      
      const validResult = processMessageSafely(validMessage);
      const invalidResult = processMessageSafely(invalidMessage);
      
      expect(validResult.success).toBe(true);
      if (validResult.success) {
        expect(validResult.data.content).toBe('Hello');
      }
      
      expect(invalidResult.success).toBe(false);
      if (!invalidResult.success) {
        expect(invalidResult.error).toBe('Message content cannot be empty');
      }
    });
  });
}); 