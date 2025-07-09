import { describe, it, expect } from 'vitest';
import { 
  DEFAULT_AVATAR_PERSONALITY, 
  CONVERSATION_GUIDELINES, 
  PERSONALITY_ADAPTATION, 
  RESPONSE_TEMPLATES,
  AVATAR_PERSONALITY_CONFIG 
} from './avatarPersonality';

describe('Avatar Personality Configuration', () => {
  describe('Default Personality Traits', () => {
    it('should have appropriate default values for a caring AI', () => {
      const traits = DEFAULT_AVATAR_PERSONALITY.traits;
      
      // High empathy for user connection
      expect(traits.empathy).toBe(0.9);
      expect(traits.empathy).toBeGreaterThan(0.7);
      
      // High curiosity to engage users
      expect(traits.curiosity).toBe(0.8);
      expect(traits.curiosity).toBeGreaterThan(0.6);
      
      // Very patient for all user types
      expect(traits.patience).toBe(0.9);
      expect(traits.patience).toBeGreaterThan(0.8);
      
      // High supportiveness
      expect(traits.supportiveness).toBe(0.9);
      expect(traits.supportiveness).toBeGreaterThan(0.7);
      
      // Moderate formality for friendly but respectful tone
      expect(traits.formality).toBe(0.3);
      expect(traits.formality).toBeGreaterThanOrEqual(0.3);
      expect(traits.formality).toBeLessThanOrEqual(0.7);
    });

    it('should have appropriate humor style', () => {
      const traits = DEFAULT_AVATAR_PERSONALITY.traits;
      
      expect(traits.humor).toBe('gentle');
      expect(typeof traits.humor).toBe('string');
    });

    it('should have balanced enthusiasm', () => {
      const traits = DEFAULT_AVATAR_PERSONALITY.traits;
      
      expect(traits.enthusiasm).toBe(0.7);
      expect(traits.enthusiasm).toBeGreaterThan(0.5);
      expect(traits.enthusiasm).toBeLessThan(1.0);
    });
  });

  describe('Communication Patterns', () => {
    it('should have warm and friendly greeting patterns', () => {
      const greeting = DEFAULT_AVATAR_PERSONALITY.communicationPatterns.greeting;
      
      expect(greeting.tone.toLowerCase()).toMatch(/warm|friendly|welcoming/);
      expect(greeting.approach.toLowerCase()).toMatch(/personalized|user/);
      expect(greeting.examples.length).toBeGreaterThan(0);
    });

    it('should have encouraging patterns for support', () => {
      const encouraging = DEFAULT_AVATAR_PERSONALITY.communicationPatterns.encouraging;
      
      expect(encouraging.tone.toLowerCase()).toMatch(/supportive|positive|motivating/);
      expect(encouraging.approach.toLowerCase()).toMatch(/acknowledge|constructive|guidance/);
      expect(encouraging.examples.length).toBeGreaterThan(0);
    });
  });

  describe('Response Styles', () => {
    it('should have appropriate structure and vocabulary for each style', () => {
      const styles = DEFAULT_AVATAR_PERSONALITY.responseStyles;
      
      expect(styles.casual).toBeDefined();
      expect(styles.professional).toBeDefined();
      expect(styles.supportive).toBeDefined();
      expect(styles.educational).toBeDefined();
      
      // Professional style should be structured
      expect(styles.professional.structure.toLowerCase()).toMatch(/clear|organized|logical/);
      expect(styles.professional.vocabulary.toLowerCase()).toMatch(/precise|business|professional/);
      
      // Casual style should be conversational
      expect(styles.casual.structure.toLowerCase()).toMatch(/conversational|relaxed/);
      expect(styles.casual.vocabulary.toLowerCase()).toMatch(/everyday|language/);
    });

    it('should have examples for each response style', () => {
      const styles = DEFAULT_AVATAR_PERSONALITY.responseStyles;
      
      Object.values(styles).forEach(style => {
        expect(style.examples).toBeDefined();
        expect(Array.isArray(style.examples)).toBe(true);
        expect(style.examples.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Personality Boundaries', () => {
    it('should define prohibited topics', () => {
      const boundaries = DEFAULT_AVATAR_PERSONALITY.boundaries;
      
      expect(boundaries.prohibitedTopics).toBeDefined();
      expect(Array.isArray(boundaries.prohibitedTopics)).toBe(true);
      expect(boundaries.prohibitedTopics.length).toBeGreaterThan(0);
      
      // Should include common sensitive topics
      expect(boundaries.prohibitedTopics).toContain('personal medical diagnosis');
      expect(boundaries.prohibitedTopics).toContain('legal advice');
    });

    it('should have reasonable message length limit', () => {
      const boundaries = DEFAULT_AVATAR_PERSONALITY.boundaries;
      
      expect(boundaries.maxMessageLength).toBe(2000);
      expect(boundaries.maxMessageLength).toBeGreaterThan(100);
      expect(boundaries.maxMessageLength).toBeLessThanOrEqual(2000);
    });

    it('should have response guidelines', () => {
      const boundaries = DEFAULT_AVATAR_PERSONALITY.boundaries;
      
      expect(boundaries.responseGuidelines).toBeDefined();
      expect(Array.isArray(boundaries.responseGuidelines)).toBe(true);
      expect(boundaries.responseGuidelines.length).toBeGreaterThan(0);
    });
  });

  describe('Conversation Guidelines', () => {
    it('should define context priorities', () => {
      const guidelines = CONVERSATION_GUIDELINES;
      
      expect(guidelines.contextPriority).toBeDefined();
      expect(guidelines.contextPriority.immediate).toBeDefined();
      expect(guidelines.contextPriority.recent).toBeDefined();
      expect(guidelines.contextPriority.session).toBeDefined();
      expect(guidelines.contextPriority.historical).toBeDefined();
    });

    it('should have priority values between 0 and 1', () => {
      const priorities = CONVERSATION_GUIDELINES.contextPriority;
      
      Object.values(priorities).forEach(priority => {
        expect(priority).toBeGreaterThanOrEqual(0);
        expect(priority).toBeLessThanOrEqual(1);
      });
    });

    it('should prioritize immediate context highest', () => {
      const priorities = CONVERSATION_GUIDELINES.contextPriority;
      
      expect(priorities.immediate).toBeGreaterThanOrEqual(priorities.recent);
      expect(priorities.recent).toBeGreaterThanOrEqual(priorities.session);
      expect(priorities.session).toBeGreaterThanOrEqual(priorities.historical);
    });

    it('should define response rules', () => {
      const guidelines = CONVERSATION_GUIDELINES;
      
      expect(guidelines.responseRules).toBeDefined();
      expect(Array.isArray(guidelines.responseRules)).toBe(true);
      expect(guidelines.responseRules.length).toBeGreaterThan(0);
      
      // Each rule should have required properties
      guidelines.responseRules.forEach(rule => {
        expect(rule.condition).toBeDefined();
        expect(rule.action).toBeDefined();
        expect(rule.priority).toBeDefined();
      });
    });

    it('should define escalation rules', () => {
      const guidelines = CONVERSATION_GUIDELINES;
      
      expect(guidelines.escalationRules).toBeDefined();
      expect(Array.isArray(guidelines.escalationRules)).toBe(true);
      expect(guidelines.escalationRules.length).toBeGreaterThan(0);
      
      // Each rule should have required properties
      guidelines.escalationRules.forEach(rule => {
        expect(rule.trigger).toBeDefined();
        expect(rule.response).toBeDefined();
        expect(rule.severity).toBeDefined();
      });
    });
  });

  describe('Personality Adaptation Settings', () => {
    it('should define adaptation parameters', () => {
      const settings = PERSONALITY_ADAPTATION;
      
      expect(settings.adaptableTraits).toBeDefined();
      expect(Array.isArray(settings.adaptableTraits)).toBe(true);
      expect(settings.coreTraits).toBeDefined();
      expect(Array.isArray(settings.coreTraits)).toBe(true);
    });

    it('should have adaptation rate limits', () => {
      const settings = PERSONALITY_ADAPTATION;
      
      expect(settings.adaptationSpeed).toBeDefined();
      expect(settings.adaptationSpeed).toBeGreaterThan(0);
      expect(settings.adaptationSpeed).toBeLessThanOrEqual(1);
      
      expect(settings.adaptationThreshold).toBeDefined();
      expect(settings.adaptationThreshold).toBeGreaterThan(0);
      expect(settings.adaptationThreshold).toBeLessThanOrEqual(1);
    });

    it('should have context modifiers', () => {
      const settings = PERSONALITY_ADAPTATION;
      
      expect(settings.contextModifiers).toBeDefined();
      expect(typeof settings.contextModifiers).toBe('object');
      expect(Object.keys(settings.contextModifiers).length).toBeGreaterThan(0);
    });
  });

  describe('Response Templates', () => {
    it('should provide templates for common scenarios', () => {
      const templates = RESPONSE_TEMPLATES;
      
      expect(templates.greeting).toBeDefined();
      expect(templates.clarification).toBeDefined();
      expect(templates.encouragement).toBeDefined();
      expect(templates.topic_transition).toBeDefined();
      expect(templates.boundary_enforcement).toBeDefined();
    });

    it('should have multiple template options for variety', () => {
      const templates = RESPONSE_TEMPLATES;
      
      // Check that main categories have arrays of templates
      expect(Array.isArray(templates.clarification)).toBe(true);
      expect(templates.clarification.length).toBeGreaterThan(0);
      
      expect(Array.isArray(templates.encouragement)).toBe(true);
      expect(templates.encouragement.length).toBeGreaterThan(0);
      
      expect(Array.isArray(templates.topic_transition)).toBe(true);
      expect(templates.topic_transition.length).toBeGreaterThan(0);
      
      expect(Array.isArray(templates.boundary_enforcement)).toBe(true);
      expect(templates.boundary_enforcement.length).toBeGreaterThan(0);
    });

    it('should have appropriate tone for each template type', () => {
      const templates = RESPONSE_TEMPLATES;
      
      // Greeting templates should be welcoming
      expect(templates.greeting.first_time).toBeDefined();
      expect(Array.isArray(templates.greeting.first_time)).toBe(true);
      templates.greeting.first_time.forEach(template => {
        const content = template.toLowerCase();
        expect(content).toMatch(/hello|welcome|glad|excited/);
      });
      
      // Encouragement templates should be positive
      templates.encouragement.forEach(template => {
        const content = template.toLowerCase();
        expect(content).toMatch(/great|good|love|wonderful|valuable|thoughtful/);
      });
    });
  });

  describe('Avatar Personality Config Integration', () => {
    it('should combine all personality components', () => {
      const config = AVATAR_PERSONALITY_CONFIG;
      
      expect(config.personality).toEqual(DEFAULT_AVATAR_PERSONALITY);
      expect(config.guidelines).toEqual(CONVERSATION_GUIDELINES);
      expect(config.adaptation).toEqual(PERSONALITY_ADAPTATION);
      expect(config.templates).toEqual(RESPONSE_TEMPLATES);
    });

    it('should maintain consistent trait values across components', () => {
      const personality = AVATAR_PERSONALITY_CONFIG.personality;
      const adaptation = AVATAR_PERSONALITY_CONFIG.adaptation;
      
             // All adaptable traits should exist in personality
       adaptation.adaptableTraits.forEach(trait => {
         expect(personality.traits[trait as keyof typeof personality.traits]).toBeDefined();
       });
       
       // All core traits should exist in personality
       adaptation.coreTraits.forEach(trait => {
         expect(personality.traits[trait as keyof typeof personality.traits]).toBeDefined();
       });
    });
  });

  describe('Configuration Validation', () => {
    it('should have all required personality properties', () => {
      const personality = DEFAULT_AVATAR_PERSONALITY;
      
      expect(personality.traits).toBeDefined();
      expect(personality.communicationPatterns).toBeDefined();
      expect(personality.boundaries).toBeDefined();
      expect(personality.responseStyles).toBeDefined();
    });

    it('should have consistent communication pattern structure', () => {
      const patterns = DEFAULT_AVATAR_PERSONALITY.communicationPatterns;
      
      Object.values(patterns).forEach(pattern => {
        expect(pattern.tone).toBeDefined();
        expect(pattern.approach).toBeDefined();
        expect(pattern.examples).toBeDefined();
        expect(Array.isArray(pattern.examples)).toBe(true);
      });
    });

    it('should have valid trait ranges', () => {
      const traits = DEFAULT_AVATAR_PERSONALITY.traits;
      
             // Numeric traits should be between 0 and 1
       Object.entries(traits).forEach(([, value]) => {
         if (typeof value === 'number') {
           expect(value).toBeGreaterThanOrEqual(0);
           expect(value).toBeLessThanOrEqual(1);
         }
       });
    });
  });

  describe('Performance Considerations', () => {
    it('should have manageable number of response templates', () => {
      const templates = RESPONSE_TEMPLATES;
      
      // Count total templates to ensure reasonable memory usage
      let totalTemplates = 0;
      
      Object.values(templates).forEach(templateCategory => {
        if (Array.isArray(templateCategory)) {
          totalTemplates += templateCategory.length;
        } else if (typeof templateCategory === 'object') {
          Object.values(templateCategory).forEach(subCategory => {
            if (Array.isArray(subCategory)) {
              totalTemplates += subCategory.length;
            } else if (typeof subCategory === 'object') {
              Object.values(subCategory).forEach(item => {
                if (typeof item === 'string') {
                  totalTemplates += 1;
                }
              });
            }
          });
        }
      });
      
      expect(totalTemplates).toBeGreaterThan(10);
      expect(totalTemplates).toBeLessThan(100);
    });

    it('should have reasonable boundary list sizes', () => {
      const boundaries = DEFAULT_AVATAR_PERSONALITY.boundaries;
      
      expect(boundaries.prohibitedTopics.length).toBeLessThan(50);
      expect(boundaries.responseGuidelines.length).toBeLessThan(20);
    });
  });
}); 