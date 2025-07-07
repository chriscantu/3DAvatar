import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ContextValidator, createContextValidator } from '../contextValidation';
import type { Context, EmotionState, ValidationRule } from '../../types/context';
import type { ChatMessage } from '../../types/common';

// Mock context for testing
const createMockContext = (overrides: Partial<Context> = {}): Context => ({
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
        greeting: {
          tone: 'warm',
          approach: 'friendly',
          examples: ['Hello! How can I help you today?']
        },
        questioning: {
          tone: 'curious',
          approach: 'exploratory',
          examples: ['Can you tell me more about that?']
        },
        explaining: {
          tone: 'clear',
          approach: 'accessible',
          examples: ['Let me explain that clearly', 'Here\'s what I know about that']
        },
        encouraging: {
          tone: 'supportive',
          approach: 'empathetic',
          examples: ['I understand how you feel', 'That sounds challenging']
        },
        farewells: {
          tone: 'warm',
          approach: 'caring',
          examples: ['Take care!', 'I hope this was helpful']
        }
      },
      boundaries: {
        prohibitedTopics: ['no harmful content', 'no personal medical advice'],
        maxMessageLength: 1000,
        responseGuidelines: ['always respectful', 'supportive', 'encouraging']
      },
      responseStyles: {
        casual: {
          structure: 'relaxed',
          vocabulary: 'friendly',
          examples: ['Hey there!', 'That\'s cool!']
        },
        professional: {
          structure: 'structured',
          vocabulary: 'formal',
          examples: ['I would recommend', 'Based on my analysis']
        },
        supportive: {
          structure: 'empathetic',
          vocabulary: 'caring',
          examples: ['I understand how you feel', 'That sounds challenging']
        },
        educational: {
          structure: 'clear',
          vocabulary: 'accessible',
          examples: ['Let me explain that clearly', 'Here\'s what I know about that']
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
      {
        id: 'msg-1',
        content: 'Hello there!',
        role: 'user',
        timestamp: new Date().toISOString()
      },
      {
        id: 'msg-2',
        content: 'Hi! How can I help you?',
        role: 'assistant',
        timestamp: new Date().toISOString()
      }
    ],
    currentUserEmotion: 'neutral' as EmotionState,
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
      sessionDuration: 300,
      activeFeatures: ['text'],
      deviceType: 'desktop',
      networkQuality: 'good'
    }
  },
  timestamp: new Date().toISOString(),
  ...overrides
});

const createInvalidContext = (type: 'missing_required' | 'invalid_types' | 'invalid_ranges' | 'inconsistent_data'): Partial<Context> => {
  switch (type) {
    case 'missing_required':
      return {
        system: undefined as any,
        session: {
          sessionId: '',
          userId: '',
          userProfile: undefined as any,
          sessionObjectives: [],
          conversationThemes: [],
          startTime: new Date(),
          messageCount: 0
        },
        immediate: undefined as any,
        timestamp: ''
      };
    
    case 'invalid_types':
      return {
        system: 'invalid' as any,
        session: {
          sessionId: 123 as any,
          userId: null as any,
          userProfile: 'invalid' as any,
          sessionObjectives: 'invalid' as any,
          conversationThemes: 'invalid' as any,
          startTime: 'invalid' as any,
          messageCount: 'invalid' as any
        },
        immediate: {
          recentMessages: 'invalid' as any,
          currentUserEmotion: 'invalid_emotion' as any,
          conversationFlow: 'invalid' as any,
          activeTopics: 'invalid' as any,
          environmentData: 'invalid' as any
        },
        timestamp: 123 as any
      };
    
    case 'invalid_ranges':
      return {
        ...createMockContext(),
        system: {
          ...createMockContext().system,
          avatarPersonality: {
            ...createMockContext().system.avatarPersonality,
            traits: {
              empathy: 2.0, // Invalid range (should be 0-1)
              curiosity: -0.5, // Invalid range
              patience: 0.7,
              supportiveness: 0.8,
              playfulness: 0.6,
              wisdom: 0.7
            }
          }
        }
      };
    
    case 'inconsistent_data':
      return {
        ...createMockContext(),
        session: {
          ...createMockContext().session,
          messageCount: 10 // Inconsistent with actual message count
        },
        immediate: {
          ...createMockContext().immediate,
          recentMessages: [
            {
              id: 'msg-1',
              content: 'Hello',
              role: 'user',
              timestamp: new Date().toISOString()
            }
          ] // Only 1 message but session says 10
        }
      };
    
    default:
      return createMockContext();
  }
};

describe('ContextValidator Service', () => {
  let contextValidator: ContextValidator;

  beforeEach(() => {
    vi.clearAllMocks();
    contextValidator = createContextValidator();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Basic Validation', () => {
    it('should validate a complete valid context', () => {
      const validContext = createMockContext();
      
      const result = contextValidator.validateContext(validContext);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.score).toBeGreaterThan(0.8);
    });

    it('should detect missing required fields', () => {
      const invalidContext = createInvalidContext('missing_required');
      
      const result = contextValidator.validateContext(invalidContext);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.field === 'system')).toBe(true);
      expect(result.errors.some(error => error.field === 'immediate')).toBe(true);
    });

    it('should detect invalid data types', () => {
      const invalidContext = createInvalidContext('invalid_types');
      
      const result = contextValidator.validateContext(invalidContext);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.type === 'type_error')).toBe(true);
    });

    it('should detect values outside valid ranges', () => {
      const invalidContext = createInvalidContext('invalid_ranges');
      
      const result = contextValidator.validateContext(invalidContext);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.type === 'range_error')).toBe(true);
    });

    it('should detect inconsistent data', () => {
      const invalidContext = createInvalidContext('inconsistent_data');
      
      const result = contextValidator.validateContext(invalidContext);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.type === 'consistency_error')).toBe(true);
    });

    it('should handle empty context gracefully', () => {
      const emptyContext = {} as Context;
      
      const result = contextValidator.validateContext(emptyContext);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Validation Rules', () => {
    it('should validate system context structure', () => {
      const contextWithInvalidSystem = {
        ...createMockContext(),
        system: {
          avatarPersonality: undefined as any,
          conversationGuidelines: undefined as any,
          technicalCapabilities: undefined as any
        }
      };
      
      const result = contextValidator.validateContext(contextWithInvalidSystem);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.field.includes('system'))).toBe(true);
    });

    it('should validate session context structure', () => {
      const contextWithInvalidSession = {
        ...createMockContext(),
        session: {
          sessionId: '',
          userId: '',
          userProfile: undefined as any,
          sessionObjectives: undefined as any,
          conversationThemes: undefined as any,
          startTime: undefined as any,
          messageCount: -1
        }
      };
      
      const result = contextValidator.validateContext(contextWithInvalidSession);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.field.includes('session'))).toBe(true);
    });

    it('should validate immediate context structure', () => {
      const contextWithInvalidImmediate = {
        ...createMockContext(),
        immediate: {
          recentMessages: undefined as any,
          currentUserEmotion: 'invalid_emotion' as any,
          conversationFlow: undefined as any,
          activeTopics: undefined as any,
          environmentData: undefined as any
        }
      };
      
      const result = contextValidator.validateContext(contextWithInvalidImmediate);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.field.includes('immediate'))).toBe(true);
    });

    it('should validate personality traits are within 0-1 range', () => {
      const contextWithInvalidTraits = {
        ...createMockContext(),
        system: {
          ...createMockContext().system,
          avatarPersonality: {
            ...createMockContext().system.avatarPersonality,
            traits: {
              empathy: 1.5, // Invalid
              curiosity: -0.2, // Invalid
              patience: 0.7,
              supportiveness: 0.8,
              playfulness: 0.6,
              wisdom: 0.7
            }
          }
        }
      };
      
      const result = contextValidator.validateContext(contextWithInvalidTraits);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.field.includes('traits'))).toBe(true);
    });

    it('should validate flow state values are within 0-1 range', () => {
      const contextWithInvalidFlow = {
        ...createMockContext(),
        immediate: {
          ...createMockContext().immediate,
          conversationFlow: {
            currentPhase: 'greeting',
            flowState: {
              momentum: 1.5, // Invalid
              depth: -0.1, // Invalid
              engagement: 0.7,
              clarity: 0.8
            },
            transitionTriggers: []
          }
        }
      };
      
      const result = contextValidator.validateContext(contextWithInvalidFlow);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.field.includes('flowState'))).toBe(true);
    });

    it('should validate message structure', () => {
      const contextWithInvalidMessages = {
        ...createMockContext(),
        immediate: {
          ...createMockContext().immediate,
          recentMessages: [
            {
              id: '', // Invalid empty ID
              content: '', // Invalid empty content
              role: 'invalid_role' as any, // Invalid role
              timestamp: 'invalid_timestamp' // Invalid timestamp
            }
          ]
        }
      };
      
      const result = contextValidator.validateContext(contextWithInvalidMessages);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.field.includes('recentMessages'))).toBe(true);
    });
  });

  describe('Health Checks', () => {
    it('should perform comprehensive health check', () => {
      const validContext = createMockContext();
      
      const healthCheck = contextValidator.performHealthCheck(validContext);

      expect(healthCheck.overall).toBe('healthy');
      expect(healthCheck.score).toBeGreaterThan(0.8);
      expect(healthCheck.issues).toBeInstanceOf(Array);
      expect(healthCheck.recommendations).toBeInstanceOf(Array);
      expect(healthCheck.categories).toBeDefined();
    });

    it('should detect data quality issues', () => {
      const contextWithQualityIssues = {
        ...createMockContext(),
        immediate: {
          ...createMockContext().immediate,
          recentMessages: [], // Empty messages array
          activeTopics: [] // Empty topics array
        }
      };
      
      const healthCheck = contextValidator.performHealthCheck(contextWithQualityIssues);

      expect(healthCheck.issues.some(issue => issue.category === 'data_quality')).toBe(true);
    });

    it('should detect performance issues', () => {
      const contextWithPerformanceIssues = {
        ...createMockContext(),
        immediate: {
          ...createMockContext().immediate,
          recentMessages: Array.from({ length: 1000 }, (_, i) => ({
            id: `msg-${i}`,
            content: `Message ${i}`,
            role: 'user' as const,
            timestamp: new Date().toISOString()
          }))
        }
      };
      
      const healthCheck = contextValidator.performHealthCheck(contextWithPerformanceIssues);

      expect(healthCheck.issues.some(issue => issue.category === 'performance')).toBe(true);
    });

    it('should detect consistency issues', () => {
      const contextWithConsistencyIssues = createInvalidContext('inconsistent_data');
      
      const healthCheck = contextValidator.performHealthCheck(contextWithConsistencyIssues);

      expect(healthCheck.issues.some(issue => issue.category === 'consistency')).toBe(true);
    });

    it('should provide recommendations for issues', () => {
      const contextWithIssues = createInvalidContext('missing_required');
      
      const healthCheck = contextValidator.performHealthCheck(contextWithIssues);

      expect(healthCheck.recommendations.length).toBeGreaterThan(0);
      healthCheck.recommendations.forEach(rec => {
        expect(rec).toHaveProperty('issue');
        expect(rec).toHaveProperty('recommendation');
        expect(rec).toHaveProperty('priority');
      });
    });

    it('should categorize health issues by severity', () => {
      const contextWithVariousIssues = createInvalidContext('invalid_types');
      
      const healthCheck = contextValidator.performHealthCheck(contextWithVariousIssues);

      expect(healthCheck.categories.critical).toBeDefined();
      expect(healthCheck.categories.warning).toBeDefined();
      expect(healthCheck.categories.info).toBeDefined();
    });
  });

  describe('Custom Validation Rules', () => {
    it('should add custom validation rules', () => {
      const customRule: ValidationRule = {
        name: 'custom_test_rule',
        description: 'Test custom validation rule',
        validate: (context: Context) => {
          if (context.session.userId === 'test-user') {
            return {
              isValid: false,
              error: {
                field: 'session.userId',
                type: 'custom_error',
                message: 'Test user not allowed',
                severity: 'error'
              }
            };
          }
          return { isValid: true };
        }
      };

      contextValidator.addValidationRule(customRule);

      const context = createMockContext();
      const result = contextValidator.validateContext(context);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.type === 'custom_error')).toBe(true);
    });

    it('should remove custom validation rules', () => {
      const customRule: ValidationRule = {
        name: 'removable_rule',
        description: 'Test removable rule',
        validate: (context: Context) => ({ isValid: false, error: { field: 'test', type: 'test', message: 'test', severity: 'error' } })
      };

      contextValidator.addValidationRule(customRule);
      contextValidator.removeValidationRule('removable_rule');

      const context = createMockContext();
      const result = contextValidator.validateContext(context);

      expect(result.isValid).toBe(true); // Should pass since rule was removed
    });

    it('should handle multiple custom rules', () => {
      const rule1: ValidationRule = {
        name: 'rule1',
        description: 'First rule',
        validate: (context: Context) => ({ isValid: true })
      };

      const rule2: ValidationRule = {
        name: 'rule2',
        description: 'Second rule',
        validate: (context: Context) => ({ isValid: true })
      };

      contextValidator.addValidationRule(rule1);
      contextValidator.addValidationRule(rule2);

      const context = createMockContext();
      const result = contextValidator.validateContext(context);

      expect(result.isValid).toBe(true);
    });

    it('should handle custom rule errors gracefully', () => {
      const faultyRule: ValidationRule = {
        name: 'faulty_rule',
        description: 'Rule that throws error',
        validate: (context: Context) => {
          throw new Error('Rule error');
        }
      };

      contextValidator.addValidationRule(faultyRule);

      const context = createMockContext();
      
      expect(() => {
        contextValidator.validateContext(context);
      }).not.toThrow();
    });
  });

  describe('Validation Statistics', () => {
    it('should track validation statistics', () => {
      const context1 = createMockContext();
      const context2 = createInvalidContext('missing_required');

      contextValidator.validateContext(context1);
      contextValidator.validateContext(context2);

      const stats = contextValidator.getValidationStats();

      expect(stats.totalValidations).toBe(2);
      expect(stats.validCount).toBe(1);
      expect(stats.invalidCount).toBe(1);
      expect(stats.averageScore).toBeGreaterThan(0);
      expect(stats.commonIssues).toBeInstanceOf(Array);
    });

    it('should track performance metrics', () => {
      const context = createMockContext();
      
      contextValidator.validateContext(context);

      const stats = contextValidator.getValidationStats();

      expect(stats.averageValidationTime).toBeGreaterThan(0);
      expect(stats.performanceMetrics).toBeDefined();
    });

    it('should identify common validation issues', () => {
      // Create multiple contexts with similar issues
      const contexts = [
        createInvalidContext('missing_required'),
        createInvalidContext('missing_required'),
        createInvalidContext('invalid_types')
      ];

      contexts.forEach(context => {
        contextValidator.validateContext(context);
      });

      const stats = contextValidator.getValidationStats();

      expect(stats.commonIssues.length).toBeGreaterThan(0);
      expect(stats.commonIssues[0].count).toBeGreaterThan(1);
    });

    it('should calculate validation coverage', () => {
      const context = createMockContext();
      
      contextValidator.validateContext(context);

      const stats = contextValidator.getValidationStats();

      expect(stats.coverage).toBeDefined();
      expect(stats.coverage.fieldsValidated).toBeGreaterThan(0);
      expect(stats.coverage.totalFields).toBeGreaterThan(0);
      expect(stats.coverage.percentage).toBeGreaterThanOrEqual(0);
      expect(stats.coverage.percentage).toBeLessThanOrEqual(100);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle null context gracefully', () => {
      const nullContext = null as any;
      
      const result = contextValidator.validateContext(nullContext);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle undefined context gracefully', () => {
      const undefinedContext = undefined as any;
      
      const result = contextValidator.validateContext(undefinedContext);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle circular references in context', () => {
      const circularContext = createMockContext();
      // Create circular reference
      (circularContext as any).self = circularContext;
      
      expect(() => {
        contextValidator.validateContext(circularContext);
      }).not.toThrow();
    });

    it('should handle very large contexts efficiently', () => {
      const largeContext = {
        ...createMockContext(),
        immediate: {
          ...createMockContext().immediate,
          recentMessages: Array.from({ length: 10000 }, (_, i) => ({
            id: `msg-${i}`,
            content: `Message ${i}`,
            role: 'user' as const,
            timestamp: new Date().toISOString()
          }))
        }
      };
      
      const startTime = Date.now();
      const result = contextValidator.validateContext(largeContext);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(result.isValid).toBeDefined();
    });

    it('should handle contexts with special characters', () => {
      const contextWithSpecialChars = {
        ...createMockContext(),
        session: {
          ...createMockContext().session,
          userId: 'user-with-special-chars-!@#$%^&*()',
          sessionId: 'session-with-unicode-中文-العربية'
        }
      };
      
      const result = contextValidator.validateContext(contextWithSpecialChars);

      expect(result.isValid).toBe(true);
    });

    it('should handle concurrent validation requests', async () => {
      const contexts = Array.from({ length: 10 }, () => createMockContext());
      
      const promises = contexts.map(context => 
        Promise.resolve(contextValidator.validateContext(context))
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('Performance and Optimization', () => {
    it('should validate contexts quickly', () => {
      const context = createMockContext();
      
      const startTime = Date.now();
      const result = contextValidator.validateContext(context);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
      expect(result.isValid).toBe(true);
    });

    it('should cache validation results for identical contexts', () => {
      const context = createMockContext();
      
      const result1 = contextValidator.validateContext(context);
      const result2 = contextValidator.validateContext(context);

      expect(result1.isValid).toBe(result2.isValid);
      expect(result1.score).toBe(result2.score);
    });

    it('should handle memory efficiently with many validations', () => {
      // Perform many validations
      for (let i = 0; i < 1000; i++) {
        const context = createMockContext();
        contextValidator.validateContext(context);
      }

      // Should not cause memory issues
      const finalContext = createMockContext();
      expect(() => {
        contextValidator.validateContext(finalContext);
      }).not.toThrow();
    });
  });

  describe('Integration with Context Manager', () => {
    it('should return validation result in expected format', () => {
      const context = createMockContext();
      
      const result = contextValidator.validateContext(context);

      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
      expect(result).toHaveProperty('metadata');

      expect(result.errors).toBeInstanceOf(Array);
      expect(result.warnings).toBeInstanceOf(Array);
      expect(result.metadata).toHaveProperty('validationTime');
      expect(result.metadata).toHaveProperty('rulesApplied');
    });

    it('should return health check in expected format', () => {
      const context = createMockContext();
      
      const healthCheck = contextValidator.performHealthCheck(context);

      expect(healthCheck).toHaveProperty('overall');
      expect(healthCheck).toHaveProperty('score');
      expect(healthCheck).toHaveProperty('issues');
      expect(healthCheck).toHaveProperty('recommendations');
      expect(healthCheck).toHaveProperty('categories');
      expect(healthCheck).toHaveProperty('lastCheck');

      expect(healthCheck.overall).toMatch(/healthy|warning|critical/);
      expect(healthCheck.issues).toBeInstanceOf(Array);
      expect(healthCheck.recommendations).toBeInstanceOf(Array);
    });

    it('should maintain consistent validation across calls', () => {
      const context = createMockContext();
      
      const result1 = contextValidator.validateContext(context);
      const result2 = contextValidator.validateContext(context);

      expect(result1.isValid).toBe(result2.isValid);
      expect(result1.score).toBe(result2.score);
      expect(result1.errors.length).toBe(result2.errors.length);
    });
  });

  describe('Factory Function', () => {
    it('should create ContextValidator instance', () => {
      const validator = createContextValidator();

      expect(validator).toBeInstanceOf(ContextValidator);
      expect(validator.validateContext).toBeInstanceOf(Function);
      expect(validator.performHealthCheck).toBeInstanceOf(Function);
      expect(validator.addValidationRule).toBeInstanceOf(Function);
    });

    it('should create independent instances', () => {
      const validator1 = createContextValidator();
      const validator2 = createContextValidator();

      expect(validator1).not.toBe(validator2);
    });

    it('should accept configuration options', () => {
      const config = {
        strictMode: true,
        performanceChecks: true,
        customRules: []
      };

      const validator = createContextValidator(config);

      expect(validator).toBeInstanceOf(ContextValidator);
    });
  });
}); 