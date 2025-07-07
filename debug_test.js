// Debug script to test immediate context validation
const { createContextValidator } = require('./apps/frontend/src/services/contextValidation.ts');

const createMockContext = () => ({
  system: {
    avatarPersonality: {
      traits: {
        empathy: 0.9,
        curiosity: 0.8,
        patience: 0.7,
        supportiveness: 0.8,
        humor: 'playful',
        formality: 0.6,
        enthusiasm: 0.7
      },
      communicationPatterns: {
        greeting: { tone: 'warm', approach: 'friendly', examples: ['Hello!'] },
        questioning: { tone: 'curious', approach: 'exploratory', examples: ['Tell me more'] },
        explaining: { tone: 'clear', approach: 'accessible', examples: ['Let me explain'] },
        encouraging: { tone: 'supportive', approach: 'empathetic', examples: ['You can do it'] },
        farewells: { tone: 'warm', approach: 'caring', examples: ['Take care!'] }
      },
      boundaries: {
        prohibitedTopics: ['harmful content'],
        maxMessageLength: 1000,
        responseGuidelines: ['be respectful']
      },
      responseStyles: {
        casual: { structure: 'relaxed', vocabulary: 'friendly', examples: ['Hey!'] },
        professional: { structure: 'structured', vocabulary: 'formal', examples: ['I recommend'] },
        supportive: { structure: 'empathetic', vocabulary: 'caring', examples: ['I understand'] },
        educational: { structure: 'clear', vocabulary: 'accessible', examples: ['Here\'s how'] }
      }
    },
    conversationGuidelines: {
      maxContextWindow: 10,
      contextPriority: { immediate: 1, recent: 0.8, session: 0.6, historical: 0.4 },
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
    sessionId: 'test-session',
    userProfile: {
      userId: 'test-user',
      interactionHistory: [],
      preferences: {
        preferredResponseLength: 'medium',
        formalityLevel: 0.5,
        topicDepth: 'moderate',
        explanationStyle: 'detailed'
      },
      communicationStyle: {
        directness: 0.7,
        emotionalExpressiveness: 0.6,
        questioningStyle: 'exploratory'
      },
      topicInterests: []
    },
    sessionObjectives: [],
    conversationThemes: [],
    startTime: new Date(),
    messageCount: 2
  },
  immediate: {
    recentMessages: [
      { id: 'msg-1', content: 'Hello', role: 'user', timestamp: new Date().toISOString() },
      { id: 'msg-2', content: 'Hi!', role: 'assistant', timestamp: new Date().toISOString() }
    ],
    currentUserEmotion: 'neutral',
    conversationFlow: {
      currentPhase: 'greeting',
      flowState: { momentum: 0.5, depth: 0.3, engagement: 0.7, clarity: 0.8 },
      transitionTriggers: []
    },
    activeTopics: ['greeting'],
    environmentData: {
      timeOfDay: 'morning',
      userTimezone: 'UTC',
      sessionDuration: 300,
      activeFeatures: ['text'],
      deviceType: 'desktop',
      networkQuality: 'good'
    }
  },
  timestamp: new Date().toISOString()
});

const contextValidator = createContextValidator();

const contextWithInvalidImmediate = {
  ...createMockContext(),
  immediate: {
    recentMessages: undefined,
    currentUserEmotion: 'invalid_emotion',
    conversationFlow: undefined,
    activeTopics: undefined,
    environmentData: undefined
  }
};

console.log('Testing invalid immediate context...');
const result = contextValidator.validateContext(contextWithInvalidImmediate);

console.log('Result isValid:', result.isValid);
console.log('Errors count:', result.errors.length);
console.log('Errors:');
result.errors.forEach(error => {
  console.log(`  - Field: ${error.field}, Type: ${error.type}, Severity: ${error.severity}, Message: ${error.message}`);
});

console.log('\nErrors with "immediate" in field:');
const immediateErrors = result.errors.filter(error => error.field.includes('immediate'));
console.log('Count:', immediateErrors.length);
immediateErrors.forEach(error => {
  console.log(`  - Field: ${error.field}, Type: ${error.type}, Severity: ${error.severity}, Message: ${error.message}`);
}); 