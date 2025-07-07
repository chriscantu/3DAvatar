import { describe, it, expect } from 'vitest';
import type {
  Context,
  SystemContext,
  SessionContext,
  ImmediateContext,
  AvatarPersonality,
  UserProfile,
  MemoryLimits,
  EmotionState,
  ConversationPhase,
  ContextAnalysis,
  SignificantInteraction,
  LearnedPreference,
  ActiveProcess,
  ContextEvent,
  ContextEventType
} from '../context';

describe('Context Type Definitions', () => {
  describe('Core Context Types', () => {
    it('should validate Context interface structure', () => {
      const mockContext: Context = {
        system: {
          avatarPersonality: {
            traits: {
              empathy: 0.9,
              curiosity: 0.8,
              patience: 0.9,
              humor: 'gentle',
              supportiveness: 0.8,
              formality: 0.5,
              enthusiasm: 0.7
            },
            communicationPatterns: {
              greeting: { tone: 'warm', approach: 'friendly', examples: [] },
              questioning: { tone: 'curious', approach: 'gentle', examples: [] },
              explaining: { tone: 'clear', approach: 'patient', examples: [] },
              encouraging: { tone: 'supportive', approach: 'positive', examples: [] },
              farewells: { tone: 'warm', approach: 'caring', examples: [] }
            },
            boundaries: {
              prohibitedTopics: [],
              maxMessageLength: 500,
              responseGuidelines: []
            },
            responseStyles: {
              casual: { structure: 'relaxed', vocabulary: 'everyday', examples: [] },
              professional: { structure: 'formal', vocabulary: 'technical', examples: [] },
              supportive: { structure: 'empathetic', vocabulary: 'caring', examples: [] },
              educational: { structure: 'structured', vocabulary: 'informative', examples: [] }
            }
          },
          conversationGuidelines: {
            maxContextWindow: 10,
            contextPriority: {
              immediate: 1,
              recent: 0.8,
              session: 0.6,
              historical: 0.4
            },
            responseRules: [],
            escalationRules: []
          },
          technicalCapabilities: {
            supportedLanguages: ['en'],
            maxTokens: 2000,
            processingTimeout: 30000,
            cacheSize: 100,
            memoryLimits: {
              shortTerm: 50,
              longTerm: 1000,
              workingMemory: 20
            }
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
          messageCount: 1
        },
        immediate: {
          recentMessages: [],
          currentUserEmotion: 'neutral',
          conversationFlow: {
            currentPhase: 'greeting',
            flowState: {
              momentum: 0.5,
              depth: 0.3,
              engagement: 0.7,
              clarity: 0.8
            },
            transitionTriggers: []
          },
          activeTopics: ['greeting'],
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

      // Type check should pass
      expect(mockContext).toBeDefined();
      expect(mockContext.system).toBeDefined();
      expect(mockContext.session).toBeDefined();
      expect(mockContext.immediate).toBeDefined();
      expect(mockContext.timestamp).toBeDefined();
    });

    it('should validate SystemContext properties', () => {
      const systemContext: SystemContext = {
        avatarPersonality: {
          traits: {
            empathy: 0.9,
            curiosity: 0.8,
            patience: 0.9,
            humor: 'gentle',
            supportiveness: 0.8,
            formality: 0.5,
            enthusiasm: 0.7
          },
          communicationPatterns: {
            greeting: { tone: 'warm', approach: 'friendly', examples: [] },
            questioning: { tone: 'curious', approach: 'gentle', examples: [] },
            explaining: { tone: 'clear', approach: 'patient', examples: [] },
            encouraging: { tone: 'supportive', approach: 'positive', examples: [] },
            farewells: { tone: 'warm', approach: 'caring', examples: [] }
          },
          boundaries: {
            prohibitedTopics: [],
            maxMessageLength: 500,
            responseGuidelines: []
          },
          responseStyles: {
            casual: { structure: 'relaxed', vocabulary: 'everyday', examples: [] },
            professional: { structure: 'formal', vocabulary: 'technical', examples: [] },
            supportive: { structure: 'empathetic', vocabulary: 'caring', examples: [] },
            educational: { structure: 'structured', vocabulary: 'informative', examples: [] }
          }
        },
        conversationGuidelines: {
          maxContextWindow: 10,
          contextPriority: {
            immediate: 1,
            recent: 0.8,
            session: 0.6,
            historical: 0.4
          },
          responseRules: [],
          escalationRules: []
        },
        technicalCapabilities: {
          supportedLanguages: ['en'],
          maxTokens: 2000,
          processingTimeout: 30000,
          cacheSize: 100,
          memoryLimits: {
            shortTerm: 50,
            longTerm: 1000,
            workingMemory: 20
          }
        }
      };

      expect(systemContext.avatarPersonality).toBeDefined();
      expect(systemContext.conversationGuidelines).toBeDefined();
      expect(systemContext.technicalCapabilities).toBeDefined();
    });

    it('should validate SessionContext properties', () => {
      const sessionContext: SessionContext = {
        sessionId: 'test-session-123',
        userProfile: {
          userId: 'user-456',
          interactionHistory: [],
          preferences: {
            preferredResponseLength: 'short',
            formalityLevel: 0.3,
            topicDepth: 'surface',
            explanationStyle: 'simple'
          },
          communicationStyle: {
            directness: 0.8,
            emotionalExpressiveness: 0.4,
            questioningStyle: 'direct'
          },
          topicInterests: []
        },
        sessionObjectives: ['learn about AI'],
        conversationThemes: [],
        startTime: new Date(),
        messageCount: 5
      };

      expect(sessionContext.sessionId).toBe('test-session-123');
      expect(sessionContext.userProfile.userId).toBe('user-456');
      expect(sessionContext.messageCount).toBe(5);
      expect(sessionContext.startTime).toBeInstanceOf(Date);
    });

    it('should validate ImmediateContext properties', () => {
      const immediateContext: ImmediateContext = {
        recentMessages: [],
        currentUserEmotion: 'excited',
        conversationFlow: {
          currentPhase: 'deep_discussion',
          flowState: {
            momentum: 0.8,
            depth: 0.9,
            engagement: 0.7,
            clarity: 0.6
          },
          transitionTriggers: []
        },
        activeTopics: ['programming', 'AI', 'machine learning'],
        environmentData: {
          timeOfDay: 'afternoon',
          userTimezone: 'America/New_York',
          sessionDuration: 25,
          activeFeatures: ['voice', 'text'],
          deviceType: 'mobile',
          networkQuality: 'excellent'
        }
      };

      expect(immediateContext.currentUserEmotion).toBe('excited');
      expect(immediateContext.conversationFlow.currentPhase).toBe('deep_discussion');
      expect(immediateContext.activeTopics).toContain('AI');
      expect(immediateContext.environmentData.deviceType).toBe('mobile');
    });
  });

  describe('Emotion and Conversation Types', () => {
    it('should validate EmotionState values', () => {
      const validEmotions: EmotionState[] = [
        'happy',
        'sad',
        'excited',
        'calm',
        'frustrated',
        'confused',
        'curious',
        'neutral'
      ];

      validEmotions.forEach(emotion => {
        const emotionValue: EmotionState = emotion;
        expect(typeof emotionValue).toBe('string');
        expect(validEmotions).toContain(emotionValue);
      });
    });

    it('should validate ConversationPhase values', () => {
      const validPhases: ConversationPhase[] = [
        'greeting',
        'exploration',
        'deep_discussion',
        'problem_solving',
        'conclusion',
        'farewell'
      ];

      validPhases.forEach(phase => {
        const phaseValue: ConversationPhase = phase;
        expect(typeof phaseValue).toBe('string');
        expect(validPhases).toContain(phaseValue);
      });
    });

    it('should validate flow state values are between 0 and 1', () => {
      const flowState = {
        momentum: 0.7,
        depth: 0.8,
        engagement: 0.9,
        clarity: 0.6
      };

      Object.values(flowState).forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Memory System Types', () => {
    it('should validate MemoryLimits structure', () => {
      const memoryLimits: MemoryLimits = {
        shortTerm: 50,
        longTerm: 1000,
        workingMemory: 20
      };

      expect(memoryLimits.shortTerm).toBeGreaterThan(0);
      expect(memoryLimits.longTerm).toBeGreaterThan(0);
      expect(memoryLimits.workingMemory).toBeGreaterThan(0);
      
      expect(typeof memoryLimits.shortTerm).toBe('number');
      expect(typeof memoryLimits.longTerm).toBe('number');
      expect(typeof memoryLimits.workingMemory).toBe('number');
    });

    it('should validate SignificantInteraction structure', () => {
      const interaction: SignificantInteraction = {
        id: 'interaction-123',
        timestamp: new Date(),
        summary: 'User expressed interest in machine learning',
        impact: 0.8,
        emotionalResonance: 0.7,
        topics: ['machine learning', 'AI', 'education']
      };

      expect(interaction.id).toBeDefined();
      expect(interaction.timestamp).toBeInstanceOf(Date);
      expect(interaction.summary).toBeDefined();
      expect(interaction.impact).toBeGreaterThanOrEqual(0);
      expect(interaction.impact).toBeLessThanOrEqual(1);
      expect(interaction.emotionalResonance).toBeGreaterThanOrEqual(0);
      expect(interaction.emotionalResonance).toBeLessThanOrEqual(1);
      expect(Array.isArray(interaction.topics)).toBe(true);
    });

    it('should validate LearnedPreference structure', () => {
      const preference: LearnedPreference = {
        category: 'communication_style',
        preference: 'prefers_detailed_explanations',
        confidence: 0.8,
        evidence: ['Asked for more details', 'Requested examples'],
        lastUpdated: new Date()
      };

      expect(preference.category).toBeDefined();
      expect(preference.preference).toBeDefined();
      expect(preference.confidence).toBeGreaterThanOrEqual(0);
      expect(preference.confidence).toBeLessThanOrEqual(1);
      expect(Array.isArray(preference.evidence)).toBe(true);
      expect(preference.lastUpdated).toBeInstanceOf(Date);
    });

    it('should validate ActiveProcess structure', () => {
      const process: ActiveProcess = {
        id: 'process-456',
        type: 'context_analysis',
        status: 'running',
        progress: 0.6,
        data: {
          analysisType: 'emotion',
          inputData: 'user message content'
        }
      };

      expect(process.id).toBeDefined();
      expect(['context_analysis', 'response_generation', 'emotion_detection']).toContain(process.type);
      expect(['running', 'waiting', 'completed', 'failed']).toContain(process.status);
      expect(process.progress).toBeGreaterThanOrEqual(0);
      expect(process.progress).toBeLessThanOrEqual(1);
      expect(typeof process.data).toBe('object');
    });
  });

  describe('Analysis and Event Types', () => {
    it('should validate ContextAnalysis structure', () => {
      const analysis: ContextAnalysis = {
        relevanceScore: 0.8,
        emotionalTone: {
          primary: 'excited',
          intensity: 0.7,
          confidence: 0.9,
          triggers: ['new project', 'learning opportunity']
        },
        topicClassification: [
          {
            topic: 'machine learning',
            confidence: 0.9,
            category: 'technology',
            relevance: 0.8
          }
        ],
        userIntentAnalysis: {
          primaryIntent: 'learning',
          secondaryIntents: ['exploration'],
          confidence: 0.8,
          actionRequired: false,
          urgency: 'low'
        },
        responseRecommendations: [
          {
            type: 'information',
            priority: 0.8,
            suggestion: 'Provide detailed explanation',
            reasoning: 'User prefers comprehensive information'
          }
        ]
      };

      expect(analysis.relevanceScore).toBeGreaterThanOrEqual(0);
      expect(analysis.relevanceScore).toBeLessThanOrEqual(1);
      expect(analysis.emotionalTone).toBeDefined();
      expect(Array.isArray(analysis.topicClassification)).toBe(true);
      expect(analysis.userIntentAnalysis).toBeDefined();
      expect(Array.isArray(analysis.responseRecommendations)).toBe(true);
    });

    it('should validate ContextEvent structure', () => {
      const event: ContextEvent = {
        type: 'context_created',
        payload: {
          sessionId: 'test-session',
          messageId: 'msg-123',
          timestamp: new Date()
        },
        timestamp: new Date(),
        source: 'ContextManager'
      };

      expect(event.type).toBeDefined();
      expect(event.payload).toBeDefined();
      expect(event.timestamp).toBeInstanceOf(Date);
      expect(event.source).toBeDefined();
    });

    it('should validate ContextEventType values', () => {
      const validEventTypes: ContextEventType[] = [
        'context_created',
        'context_updated',
        'context_cached',
        'context_retrieved',
        'context_expired',
        'memory_updated',
        'personality_adjusted',
        'error_occurred'
      ];

      validEventTypes.forEach(eventType => {
        const typeValue: ContextEventType = eventType;
        expect(typeof typeValue).toBe('string');
        expect(validEventTypes).toContain(typeValue);
      });
    });
  });

  describe('User Profile Types', () => {
    it('should validate UserProfile structure completeness', () => {
      const userProfile: UserProfile = {
        userId: 'user-789',
        interactionHistory: [
          {
            date: new Date(),
            messageCount: 15,
            primaryTopics: ['AI', 'programming'],
            satisfaction: 0.9,
            duration: 45
          }
        ],
        preferences: {
          preferredResponseLength: 'long',
          formalityLevel: 0.7,
          topicDepth: 'deep',
          explanationStyle: 'technical'
        },
        communicationStyle: {
          directness: 0.6,
          emotionalExpressiveness: 0.8,
          questioningStyle: 'hypothetical'
        },
        topicInterests: [
          {
            topic: 'artificial intelligence',
            interest: 0.9,
            expertise: 0.6,
            lastDiscussed: new Date()
          }
        ]
      };

      expect(userProfile.userId).toBeDefined();
      expect(Array.isArray(userProfile.interactionHistory)).toBe(true);
      expect(userProfile.preferences).toBeDefined();
      expect(userProfile.communicationStyle).toBeDefined();
      expect(Array.isArray(userProfile.topicInterests)).toBe(true);

      // Validate nested structures
      if (userProfile.interactionHistory.length > 0) {
        const interaction = userProfile.interactionHistory[0];
        expect(interaction.satisfaction).toBeGreaterThanOrEqual(0);
        expect(interaction.satisfaction).toBeLessThanOrEqual(1);
      }

      if (userProfile.topicInterests.length > 0) {
        const interest = userProfile.topicInterests[0];
        expect(interest.interest).toBeGreaterThanOrEqual(0);
        expect(interest.interest).toBeLessThanOrEqual(1);
        expect(interest.expertise).toBeGreaterThanOrEqual(0);
        expect(interest.expertise).toBeLessThanOrEqual(1);
      }
    });

    it('should validate preference value constraints', () => {
      const preferences = {
        preferredResponseLength: 'medium' as const,
        formalityLevel: 0.5,
        topicDepth: 'moderate' as const,
        explanationStyle: 'detailed' as const
      };

      expect(['short', 'medium', 'long']).toContain(preferences.preferredResponseLength);
      expect(preferences.formalityLevel).toBeGreaterThanOrEqual(0);
      expect(preferences.formalityLevel).toBeLessThanOrEqual(1);
      expect(['surface', 'moderate', 'deep']).toContain(preferences.topicDepth);
      expect(['simple', 'detailed', 'technical']).toContain(preferences.explanationStyle);
    });

    it('should validate communication style constraints', () => {
      const communicationStyle = {
        directness: 0.7,
        emotionalExpressiveness: 0.6,
        questioningStyle: 'exploratory' as const
      };

      expect(communicationStyle.directness).toBeGreaterThanOrEqual(0);
      expect(communicationStyle.directness).toBeLessThanOrEqual(1);
      expect(communicationStyle.emotionalExpressiveness).toBeGreaterThanOrEqual(0);
      expect(communicationStyle.emotionalExpressiveness).toBeLessThanOrEqual(1);
      expect(['direct', 'exploratory', 'hypothetical']).toContain(communicationStyle.questioningStyle);
    });
  });

  describe('Avatar Personality Types', () => {
    it('should validate PersonalityTraits structure', () => {
      const traits = {
        empathy: 0.9,
        curiosity: 0.8,
        patience: 0.9,
        humor: 'gentle' as const,
        supportiveness: 0.8,
        formality: 0.5,
        enthusiasm: 0.7
      };

      // Numeric traits should be between 0 and 1
      expect(traits.empathy).toBeGreaterThanOrEqual(0);
      expect(traits.empathy).toBeLessThanOrEqual(1);
      expect(traits.curiosity).toBeGreaterThanOrEqual(0);
      expect(traits.curiosity).toBeLessThanOrEqual(1);
      expect(traits.patience).toBeGreaterThanOrEqual(0);
      expect(traits.patience).toBeLessThanOrEqual(1);
      expect(traits.supportiveness).toBeGreaterThanOrEqual(0);
      expect(traits.supportiveness).toBeLessThanOrEqual(1);
      expect(traits.formality).toBeGreaterThanOrEqual(0);
      expect(traits.formality).toBeLessThanOrEqual(1);
      expect(traits.enthusiasm).toBeGreaterThanOrEqual(0);
      expect(traits.enthusiasm).toBeLessThanOrEqual(1);

      // Humor should be valid option
      expect(['none', 'gentle', 'witty', 'playful']).toContain(traits.humor);
    });

    it('should validate CommunicationStyle structure', () => {
      const communicationStyle = {
        tone: 'warm',
        approach: 'friendly',
        examples: ['Hello there!', 'How can I help you today?']
      };

      expect(typeof communicationStyle.tone).toBe('string');
      expect(typeof communicationStyle.approach).toBe('string');
      expect(Array.isArray(communicationStyle.examples)).toBe(true);
      expect(communicationStyle.tone.length).toBeGreaterThan(0);
      expect(communicationStyle.approach.length).toBeGreaterThan(0);
    });

    it('should validate ResponsePattern structure', () => {
      const responsePattern = {
        structure: 'empathetic',
        vocabulary: 'caring',
        examples: ['I understand how you feel', 'That sounds challenging']
      };

      expect(typeof responsePattern.structure).toBe('string');
      expect(typeof responsePattern.vocabulary).toBe('string');
      expect(Array.isArray(responsePattern.examples)).toBe(true);
    });
  });

  describe('Type Safety and Constraints', () => {
    it('should enforce numeric range constraints', () => {
      // Test that numeric values are properly constrained
      const testRangeValue = (value: number) => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      };

      // Example values that should be in 0-1 range
      testRangeValue(0.5);
      testRangeValue(0.0);
      testRangeValue(1.0);
    });

    it('should validate string literal types', () => {
      // Test string literal type constraints
      const emotion: EmotionState = 'happy';
      const phase: ConversationPhase = 'greeting';
      const eventType: ContextEventType = 'context_created';

      expect(typeof emotion).toBe('string');
      expect(typeof phase).toBe('string');
      expect(typeof eventType).toBe('string');
    });

    it('should validate optional properties handling', () => {
      // Test that optional properties work correctly
      const minimalContext: Partial<Context> = {
        timestamp: new Date().toISOString()
      };

      expect(minimalContext.timestamp).toBeDefined();
    });

    it('should validate nested object structures', () => {
      // Test complex nested structures
      const complexStructure = {
        level1: {
          level2: {
            level3: {
              value: 'nested'
            }
          }
        }
      };

      expect(complexStructure.level1.level2.level3.value).toBe('nested');
    });
  });
}); 