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

  describe('Phase 2 Integration - Emotional Intelligence Types', () => {
    it('should validate EmotionalAnalysis interface', () => {
      const emotionalAnalysis: EmotionalAnalysis = {
        detectedEmotion: 'excited',
        confidence: 0.85,
        suggestedResponse: {
          tone: 'enthusiastic',
          adjustments: {
            warmth: 0.8,
            energy: 0.7,
            formality: -0.2,
            empathy: 0.5
          },
          suggestedPhrases: ['That\'s wonderful!', 'How exciting!'],
          avoidPhrases: ['Calm down', 'Don\'t get too excited']
        },
        emotionalContext: {
          primary: 'excited',
          secondary: 'curious',
          intensity: 0.8,
          confidence: 0.85,
          indicators: ['excited', 'wonderful', 'amazing'],
          trend: 'improving'
        }
      };

      expect(emotionalAnalysis.detectedEmotion).toBeDefined();
      expect(emotionalAnalysis.confidence).toBeGreaterThanOrEqual(0);
      expect(emotionalAnalysis.confidence).toBeLessThanOrEqual(1);
      expect(emotionalAnalysis.suggestedResponse).toBeDefined();
      expect(emotionalAnalysis.emotionalContext).toBeDefined();
      
      // Validate tone adjustments
      expect(emotionalAnalysis.suggestedResponse.adjustments.warmth).toBeGreaterThanOrEqual(-1);
      expect(emotionalAnalysis.suggestedResponse.adjustments.warmth).toBeLessThanOrEqual(1);
      expect(emotionalAnalysis.suggestedResponse.adjustments.energy).toBeGreaterThanOrEqual(-1);
      expect(emotionalAnalysis.suggestedResponse.adjustments.energy).toBeLessThanOrEqual(1);
      
      // Validate emotional context
      expect(emotionalAnalysis.emotionalContext.intensity).toBeGreaterThanOrEqual(0);
      expect(emotionalAnalysis.emotionalContext.intensity).toBeLessThanOrEqual(1);
      expect(Array.isArray(emotionalAnalysis.emotionalContext.indicators)).toBe(true);
      expect(['improving', 'declining', 'stable']).toContain(emotionalAnalysis.emotionalContext.trend);
    });

    it('should validate EmotionalState values', () => {
      const validEmotions: EmotionalState[] = [
        'happy', 'sad', 'excited', 'calm', 'frustrated', 'confused', 'curious', 'neutral'
      ];

      validEmotions.forEach(emotion => {
        expect(typeof emotion).toBe('string');
        expect(emotion.length).toBeGreaterThan(0);
      });
    });

    it('should validate ResponseToneAdjustment structure', () => {
      const toneAdjustment = {
        tone: 'supportive',
        adjustments: {
          warmth: 0.9,
          energy: -0.3,
          formality: -0.1,
          empathy: 0.9
        },
        suggestedPhrases: ['I\'m here for you', 'That sounds difficult'],
        avoidPhrases: ['Cheer up!', 'Look on the bright side']
      };

      expect(typeof toneAdjustment.tone).toBe('string');
      expect(typeof toneAdjustment.adjustments).toBe('object');
      expect(Array.isArray(toneAdjustment.suggestedPhrases)).toBe(true);
      expect(Array.isArray(toneAdjustment.avoidPhrases)).toBe(true);
      
      // Validate adjustment ranges
      Object.values(toneAdjustment.adjustments).forEach(value => {
        expect(value).toBeGreaterThanOrEqual(-1);
        expect(value).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Phase 2 Integration - Context Compression Types', () => {
    it('should validate CompressionResult interface', () => {
      const compressionResult = {
        originalSize: 2048,
        compressedSize: 1024,
        compressionRatio: 0.5,
        summary: 'User discussed learning TypeScript for web development',
        keyPoints: [
          'User wants to learn TypeScript',
          'Focus on web development',
          'Needs beginner-friendly resources'
        ],
        retainedMessages: [
          {
            id: 'msg-1',
            content: 'I want to learn TypeScript',
            role: 'user',
            timestamp: new Date().toISOString()
          }
        ],
        metadata: {
          timestamp: new Date(),
          method: 'extractive',
          qualityScore: 0.85,
          topicsRetained: ['TypeScript', 'web development'],
          emotionalTone: 'curious',
          confidenceScore: 0.8
        }
      };

      expect(typeof compressionResult.originalSize).toBe('number');
      expect(typeof compressionResult.compressedSize).toBe('number');
      expect(compressionResult.compressionRatio).toBeGreaterThanOrEqual(0);
      expect(compressionResult.compressionRatio).toBeLessThanOrEqual(1);
      expect(typeof compressionResult.summary).toBe('string');
      expect(Array.isArray(compressionResult.keyPoints)).toBe(true);
      expect(Array.isArray(compressionResult.retainedMessages)).toBe(true);
      expect(compressionResult.metadata).toBeDefined();
      
      // Validate metadata
      expect(compressionResult.metadata.qualityScore).toBeGreaterThanOrEqual(0);
      expect(compressionResult.metadata.qualityScore).toBeLessThanOrEqual(1);
      expect(['extractive', 'abstractive', 'hybrid']).toContain(compressionResult.metadata.method);
    });

    it('should validate ConversationSummary interface', () => {
      const conversationSummary = {
        summary: 'User sought help with programming concepts',
        keyPoints: ['Programming help requested', 'TypeScript interest expressed'],
        participants: ['user', 'assistant'],
        startTime: new Date(Date.now() - 600000),
        endTime: new Date(),
        duration: 600,
        messageCount: 8,
        topics: ['programming', 'TypeScript', 'learning'],
        emotionalArc: {
          startEmotion: 'confused',
          endEmotion: 'excited',
          peaks: [
            {
              timestamp: new Date(),
              emotion: 'frustrated',
              intensity: 0.7
            }
          ],
          overallTrend: 'positive'
        },
        significantMoments: [
          {
            timestamp: new Date(),
            type: 'insight',
            description: 'User understood TypeScript benefits',
            importance: 0.9
          }
        ],
        actionItems: ['Find TypeScript tutorial', 'Set up development environment']
      };

      expect(typeof conversationSummary.summary).toBe('string');
      expect(Array.isArray(conversationSummary.keyPoints)).toBe(true);
      expect(Array.isArray(conversationSummary.participants)).toBe(true);
      expect(conversationSummary.startTime).toBeInstanceOf(Date);
      expect(conversationSummary.endTime).toBeInstanceOf(Date);
      expect(typeof conversationSummary.duration).toBe('number');
      expect(typeof conversationSummary.messageCount).toBe('number');
      expect(Array.isArray(conversationSummary.topics)).toBe(true);
      expect(conversationSummary.emotionalArc).toBeDefined();
      expect(Array.isArray(conversationSummary.significantMoments)).toBe(true);
      expect(Array.isArray(conversationSummary.actionItems)).toBe(true);
      
      // Validate emotional arc
      expect(['positive', 'negative', 'neutral', 'mixed']).toContain(conversationSummary.emotionalArc.overallTrend);
    });

    it('should validate EmotionalArc structure', () => {
      const emotionalArc = {
        startEmotion: 'neutral',
        endEmotion: 'happy',
        peaks: [
          {
            timestamp: new Date(),
            emotion: 'excited',
            intensity: 0.8
          }
        ],
        overallTrend: 'positive' as const
      };

      expect(typeof emotionalArc.startEmotion).toBe('string');
      expect(typeof emotionalArc.endEmotion).toBe('string');
      expect(Array.isArray(emotionalArc.peaks)).toBe(true);
      expect(['positive', 'negative', 'neutral', 'mixed']).toContain(emotionalArc.overallTrend);
      
      if (emotionalArc.peaks.length > 0) {
        const peak = emotionalArc.peaks[0];
        expect(peak.timestamp).toBeInstanceOf(Date);
        expect(typeof peak.emotion).toBe('string');
        expect(peak.intensity).toBeGreaterThanOrEqual(0);
        expect(peak.intensity).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Phase 2 Integration - Feedback Collection Types', () => {
    it('should validate FeedbackMetrics interface', () => {
      const feedbackMetrics = {
        totalFeedback: 50,
        averageRating: 4.2,
        satisfactionScore: 0.84,
        categoryBreakdown: {
          response_quality: { count: 20, averageRating: 4.1 },
          helpfulness: { count: 15, averageRating: 4.3 },
          accuracy: { count: 10, averageRating: 4.0 },
          personality_fit: { count: 3, averageRating: 4.5 },
          conversation_flow: { count: 2, averageRating: 3.8 }
        },
        trends: {
          ratingTrend: 'improving',
          satisfactionTrend: 'stable',
          engagementTrend: 'improving'
        },
        insights: [
          {
            category: 'response_quality',
            insight: 'Users appreciate detailed explanations',
            confidence: 0.85,
            actionable: true
          }
        ],
        improvementAreas: ['conversation_flow', 'personality_fit'],
        totalInteractions: 200
      };

      expect(typeof feedbackMetrics.totalFeedback).toBe('number');
      expect(typeof feedbackMetrics.averageRating).toBe('number');
      expect(feedbackMetrics.averageRating).toBeGreaterThanOrEqual(1);
      expect(feedbackMetrics.averageRating).toBeLessThanOrEqual(5);
      expect(feedbackMetrics.satisfactionScore).toBeGreaterThanOrEqual(0);
      expect(feedbackMetrics.satisfactionScore).toBeLessThanOrEqual(1);
      expect(typeof feedbackMetrics.categoryBreakdown).toBe('object');
      expect(typeof feedbackMetrics.trends).toBe('object');
      expect(Array.isArray(feedbackMetrics.insights)).toBe(true);
      expect(Array.isArray(feedbackMetrics.improvementAreas)).toBe(true);
      expect(typeof feedbackMetrics.totalInteractions).toBe('number');
      
      // Validate trends
      expect(['improving', 'declining', 'stable']).toContain(feedbackMetrics.trends.ratingTrend);
      expect(['improving', 'declining', 'stable']).toContain(feedbackMetrics.trends.satisfactionTrend);
      expect(['improving', 'declining', 'stable']).toContain(feedbackMetrics.trends.engagementTrend);
    });

    it('should validate FeedbackCategory values', () => {
      const validCategories = [
        'response_quality',
        'personality_fit', 
        'helpfulness',
        'accuracy',
        'conversation_flow',
        'emotional_support'
      ];

      validCategories.forEach(category => {
        expect(typeof category).toBe('string');
        expect(category.length).toBeGreaterThan(0);
      });
    });

    it('should validate BehavioralMetrics structure', () => {
      const behavioralMetrics = {
        responseTime: 1200,
        messageLength: 150,
        typoCount: 2,
        editCount: 1,
        pauseDuration: 500,
        clarificationRequests: 0,
        topicChanges: 1,
        emotionalExpressions: 3,
        questionCount: 2,
        followUpQuestions: 1
      };

      Object.entries(behavioralMetrics).forEach(([key, value]) => {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThanOrEqual(0);
      });
    });

    it('should validate ImprovementRecommendation structure', () => {
      const recommendation = {
        category: 'response_quality',
        priority: 'high',
        recommendation: 'Improve response clarity and structure',
        expectedImpact: 'High - will significantly improve user satisfaction',
        effort: 'medium',
        timeline: '2-3 weeks',
        metrics: ['user_satisfaction', 'response_quality_rating']
      };

      expect(typeof recommendation.category).toBe('string');
      expect(['high', 'medium', 'low']).toContain(recommendation.priority);
      expect(typeof recommendation.recommendation).toBe('string');
      expect(typeof recommendation.expectedImpact).toBe('string');
      expect(['low', 'medium', 'high']).toContain(recommendation.effort);
      expect(typeof recommendation.timeline).toBe('string');
      expect(Array.isArray(recommendation.metrics)).toBe(true);
    });
  });

  describe('Phase 2 Integration - Context Validation Types', () => {
    it('should validate ValidationResult interface', () => {
      const validationResult = {
        isValid: true,
        score: 0.92,
        errors: [],
        warnings: [
          {
            field: 'session.messageCount',
            type: 'consistency_warning',
            message: 'Message count slightly inconsistent with actual messages',
            severity: 'warning'
          }
        ],
        metadata: {
          validationTime: 15,
          rulesApplied: 12,
          coverage: {
            fieldsValidated: 45,
            totalFields: 50,
            percentage: 90
          }
        }
      };

      expect(typeof validationResult.isValid).toBe('boolean');
      expect(typeof validationResult.score).toBe('number');
      expect(validationResult.score).toBeGreaterThanOrEqual(0);
      expect(validationResult.score).toBeLessThanOrEqual(1);
      expect(Array.isArray(validationResult.errors)).toBe(true);
      expect(Array.isArray(validationResult.warnings)).toBe(true);
      expect(validationResult.metadata).toBeDefined();
      
      // Validate metadata
      expect(typeof validationResult.metadata.validationTime).toBe('number');
      expect(typeof validationResult.metadata.rulesApplied).toBe('number');
      expect(validationResult.metadata.coverage).toBeDefined();
    });

    it('should validate ValidationError structure', () => {
      const validationError = {
        field: 'immediate.currentUserEmotion',
        type: 'type_error',
        message: 'Invalid emotion state value',
        severity: 'error'
      };

      expect(typeof validationError.field).toBe('string');
      expect(typeof validationError.type).toBe('string');
      expect(typeof validationError.message).toBe('string');
      expect(['error', 'warning', 'info']).toContain(validationError.severity);
    });

    it('should validate HealthCheckResult interface', () => {
      const healthCheck = {
        overall: 'healthy',
        score: 0.88,
        issues: [
          {
            category: 'performance',
            severity: 'warning',
            description: 'Context size approaching limit',
            recommendation: 'Consider enabling compression',
            impact: 'medium'
          }
        ],
        recommendations: [
          {
            issue: 'Large context size',
            recommendation: 'Enable automatic compression',
            priority: 'medium'
          }
        ],
        categories: {
          critical: 0,
          warning: 1,
          info: 2
        },
        lastCheck: new Date()
      };

      expect(['healthy', 'warning', 'critical']).toContain(healthCheck.overall);
      expect(typeof healthCheck.score).toBe('number');
      expect(healthCheck.score).toBeGreaterThanOrEqual(0);
      expect(healthCheck.score).toBeLessThanOrEqual(1);
      expect(Array.isArray(healthCheck.issues)).toBe(true);
      expect(Array.isArray(healthCheck.recommendations)).toBe(true);
      expect(typeof healthCheck.categories).toBe('object');
      expect(healthCheck.lastCheck).toBeInstanceOf(Date);
      
      // Validate issue categories
      expect(typeof healthCheck.categories.critical).toBe('number');
      expect(typeof healthCheck.categories.warning).toBe('number');
      expect(typeof healthCheck.categories.info).toBe('number');
    });

    it('should validate ValidationRule interface', () => {
      const validationRule = {
        name: 'emotion_state_validation',
        description: 'Validates that emotion states are valid values',
        validate: (context: Context) => {
          const validEmotions = ['happy', 'sad', 'excited', 'calm', 'frustrated', 'confused', 'curious', 'neutral'];
          if (!validEmotions.includes(context.immediate.currentUserEmotion)) {
            return {
              isValid: false,
              error: {
                field: 'immediate.currentUserEmotion',
                type: 'invalid_value',
                message: 'Invalid emotion state',
                severity: 'error'
              }
            };
          }
          return { isValid: true };
        }
      };

      expect(typeof validationRule.name).toBe('string');
      expect(typeof validationRule.description).toBe('string');
      expect(typeof validationRule.validate).toBe('function');
    });
  });

  describe('Phase 2 Integration - Type Compatibility', () => {
    it('should ensure Phase 2 types integrate with existing Context interface', () => {
      // Test that new Phase 2 types can be used with existing Context
      const contextWithPhase2: Context = {
        system: {
          avatarPersonality: {
            traits: {
              empathy: 0.9,
              curiosity: 0.8,
              patience: 0.7,
              supportiveness: 0.8,
              playfulness: 0.6,
              wisdom: 0.7
            },
            communicationStyle: {
              warmth: 0.8,
              formality: 0.3,
              directness: 0.6,
              enthusiasm: 0.7,
              supportiveness: 0.9
            },
            coreValues: ['helpfulness', 'empathy'],
            interests: ['technology', 'learning'],
            boundaries: {
              topics: ['no harmful content'],
              tone: ['respectful']
            },
            responsePatterns: {
              greeting: {
                structure: 'warm',
                vocabulary: 'friendly',
                examples: ['Hello!']
              }
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
          userId: 'test-user',
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
          currentUserEmotion: 'excited', // Phase 2 EmotionalState
          conversationFlow: {
            currentPhase: 'greeting',
            flowState: {
              momentum: 0.8,
              depth: 0.3,
              engagement: 0.9,
              clarity: 0.8
            },
            transitionTriggers: []
          },
          activeTopics: ['learning'],
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

      expect(contextWithPhase2.immediate.currentUserEmotion).toBe('excited');
      expect(contextWithPhase2.system).toBeDefined();
      expect(contextWithPhase2.session).toBeDefined();
      expect(contextWithPhase2.immediate).toBeDefined();
    });

    it('should validate type safety across Phase 2 interfaces', () => {
      // Test that Phase 2 types maintain type safety
      const emotionalAnalysis: EmotionalAnalysis = {
        detectedEmotion: 'happy',
        confidence: 0.9,
        suggestedResponse: {
          tone: 'enthusiastic',
          adjustments: { warmth: 0.8, energy: 0.7, formality: -0.2, empathy: 0.5 },
          suggestedPhrases: ['Great!'],
          avoidPhrases: ['Calm down']
        },
        emotionalContext: {
          primary: 'happy',
          intensity: 0.8,
          confidence: 0.9,
          indicators: ['great', 'wonderful'],
          trend: 'improving'
        }
      };

      // Should be compatible with existing emotion detection
      const emotionState: EmotionalState = emotionalAnalysis.detectedEmotion;
      expect(emotionState).toBe('happy');
    });
  });
}); 