import { describe, it, expect, vi } from 'vitest';
import {
  ContractValidator,
  ContractBuilder,
  isAvatarContract,
  isChatInterfaceContract,
  isThreeDRoomContract,
  enforceContract,
  type AvatarComponentContract,
  type ChatInterfaceComponentContract,
  type ThreeDRoomComponentContract,
  type ValidationResult,
  type FurnitureModel,
  type UserSettings
} from './ComponentContracts';

describe('Component Contracts', () => {
  describe('ContractValidator', () => {
    describe('validateAvatarContract', () => {
      it('should validate valid avatar contract', () => {
        const validContract: Partial<AvatarComponentContract> = {
          displayName: 'Avatar',
          version: '1.0.0',
          position: [0, 0, 0],
          movementIntensity: 'subtle',
          modelUrl: 'https://example.com/model.glb'
        };
        
        const result = ContractValidator.validateAvatarContract(validContract);
        
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.score).toBeGreaterThan(0.8);
      });
      
      it('should reject invalid position', () => {
        const invalidContract: Partial<AvatarComponentContract> = {
          position: [0, 0] as [number, number] // Invalid - should be 3 elements
        };
        
        const result = ContractValidator.validateAvatarContract(invalidContract);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].code).toBe('INVALID_POSITION');
        expect(result.errors[0].field).toBe('position');
      });
      
      it('should reject invalid movement intensity', () => {
        const invalidContract: Partial<AvatarComponentContract> = {
          movementIntensity: 'invalid' as 'subtle' // Type assertion for invalid value
        };
        
        const result = ContractValidator.validateAvatarContract(invalidContract);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].code).toBe('INVALID_MOVEMENT_INTENSITY');
        expect(result.errors[0].field).toBe('movementIntensity');
      });
      
      it('should warn about invalid model URL', () => {
        const contractWithWarning: Partial<AvatarComponentContract> = {
          modelUrl: 'not-a-valid-url'
        };
        
        const result = ContractValidator.validateAvatarContract(contractWithWarning);
        
        expect(result.isValid).toBe(true); // Warnings don't make it invalid
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].code).toBe('INVALID_MODEL_URL');
        expect(result.warnings[0].field).toBe('modelUrl');
      });
    });
    
    describe('validateChatInterfaceContract', () => {
      it('should validate valid chat interface contract', () => {
        const validContract: Partial<ChatInterfaceComponentContract> = {
          displayName: 'ChatInterface',
          version: '1.0.0',
          onMessageSent: vi.fn(),
          maxMessageLength: 1000,
          inputPlaceholder: 'Type here...'
        };
        
        const result = ContractValidator.validateChatInterfaceContract(validContract);
        
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.score).toBeGreaterThan(0.8);
      });
      
      it('should require message handler', () => {
        const invalidContract: Partial<ChatInterfaceComponentContract> = {
          displayName: 'ChatInterface'
          // Missing onMessageSent
        };
        
        const result = ContractValidator.validateChatInterfaceContract(invalidContract);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].code).toBe('MISSING_MESSAGE_HANDLER');
        expect(result.errors[0].field).toBe('onMessageSent');
      });
      
      it('should validate message length limits', () => {
        const invalidContract: Partial<ChatInterfaceComponentContract> = {
          onMessageSent: vi.fn(),
          maxMessageLength: 0 // Invalid - must be > 0
        };
        
        const result = ContractValidator.validateChatInterfaceContract(invalidContract);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].code).toBe('INVALID_MESSAGE_LENGTH');
        expect(result.errors[0].field).toBe('maxMessageLength');
      });
      
      it('should warn about long placeholder', () => {
        const contractWithWarning: Partial<ChatInterfaceComponentContract> = {
          onMessageSent: vi.fn(),
          inputPlaceholder: 'A'.repeat(150) // Very long placeholder
        };
        
        const result = ContractValidator.validateChatInterfaceContract(contractWithWarning);
        
        expect(result.isValid).toBe(true);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].code).toBe('LONG_PLACEHOLDER');
        expect(result.warnings[0].field).toBe('inputPlaceholder');
      });
    });
    
    describe('validateThreeDRoomContract', () => {
      it('should validate valid 3D room contract', () => {
        const validContract: Partial<ThreeDRoomComponentContract> = {
          displayName: 'ThreeDRoom',
          version: '1.0.0',
          cameraPosition: [0, 2, 5],
          qualityLevel: 'medium',
          furnitureModels: [
            {
              url: 'https://example.com/chair.glb',
              position: [1, 0, 1],
              name: 'chair'
            }
          ]
        };
        
        const result = ContractValidator.validateThreeDRoomContract(validContract);
        
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.score).toBeGreaterThan(0.8);
      });
      
      it('should reject invalid camera position', () => {
        const invalidContract: Partial<ThreeDRoomComponentContract> = {
          cameraPosition: [0, 2] as [number, number] // Invalid - should be 3 elements
        };
        
        const result = ContractValidator.validateThreeDRoomContract(invalidContract);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].code).toBe('INVALID_CAMERA_POSITION');
        expect(result.errors[0].field).toBe('cameraPosition');
      });
      
      it('should reject invalid quality level', () => {
        const invalidContract: Partial<ThreeDRoomComponentContract> = {
          qualityLevel: 'invalid' as 'low' // Type assertion for invalid value
        };
        
        const result = ContractValidator.validateThreeDRoomContract(invalidContract);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].code).toBe('INVALID_QUALITY_LEVEL');
        expect(result.errors[0].field).toBe('qualityLevel');
      });
      
      it('should validate furniture models', () => {
        const invalidContract: Partial<ThreeDRoomComponentContract> = {
          furnitureModels: [
            {
              url: '', // Missing URL
              position: [1, 0, 1],
              name: 'chair'
            },
            {
              url: 'https://example.com/table.glb',
              position: [1, 0] as [number, number], // Invalid position
              name: 'table'
            }
          ]
        };
        
        const result = ContractValidator.validateThreeDRoomContract(invalidContract);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(2);
        
        const urlError = result.errors.find(e => e.code === 'MISSING_MODEL_URL');
        const positionError = result.errors.find(e => e.code === 'INVALID_MODEL_POSITION');
        
        expect(urlError).toBeDefined();
        expect(urlError?.field).toBe('furnitureModels[0].url');
        
        expect(positionError).toBeDefined();
        expect(positionError?.field).toBe('furnitureModels[1].position');
      });
    });
  });
  
  describe('ContractBuilder', () => {
    describe('createAvatarContract', () => {
      it('should create default avatar contract', () => {
        const contract = ContractBuilder.createAvatarContract();
        
        expect(contract.displayName).toBe('Avatar');
        expect(contract.version).toBe('1.0.0');
        expect(contract.position).toEqual([0, 0, 0]);
        expect(contract.movementIntensity).toBe('subtle');
        expect(contract.modelType).toBe('3d');
        expect(contract.breathingEnabled).toBe(true);
        expect(contract.animationEnabled).toBe(true);
        expect(contract.testMode).toBe(false);
      });
      
      it('should apply overrides', () => {
        const overrides: Partial<AvatarComponentContract> = {
          position: [1, 2, 3],
          movementIntensity: 'energetic',
          testMode: true
        };
        
        const contract = ContractBuilder.createAvatarContract(overrides);
        
        expect(contract.position).toEqual([1, 2, 3]);
        expect(contract.movementIntensity).toBe('energetic');
        expect(contract.testMode).toBe(true);
        
        // Should keep defaults for non-overridden properties
        expect(contract.displayName).toBe('Avatar');
        expect(contract.breathingEnabled).toBe(true);
      });
    });
    
    describe('createChatInterfaceContract', () => {
      it('should create default chat interface contract', () => {
        const contract = ContractBuilder.createChatInterfaceContract();
        
        expect(contract.displayName).toBe('ChatInterface');
        expect(contract.version).toBe('1.0.0');
        expect(contract.messages).toEqual([]);
        expect(contract.isTyping).toBe(false);
        expect(contract.inputPlaceholder).toBe('Type your message...');
        expect(contract.maxMessageLength).toBe(1000);
        expect(contract.autoScroll).toBe(true);
        expect(contract.theme).toBe('auto');
      });
      
      it('should apply overrides', () => {
        const overrides: Partial<ChatInterfaceComponentContract> = {
          inputPlaceholder: 'Custom placeholder',
          maxMessageLength: 500,
          theme: 'dark'
        };
        
        const contract = ContractBuilder.createChatInterfaceContract(overrides);
        
        expect(contract.inputPlaceholder).toBe('Custom placeholder');
        expect(contract.maxMessageLength).toBe(500);
        expect(contract.theme).toBe('dark');
        
        // Should keep defaults for non-overridden properties
        expect(contract.displayName).toBe('ChatInterface');
        expect(contract.autoScroll).toBe(true);
      });
    });
    
    describe('createThreeDRoomContract', () => {
      it('should create default 3D room contract', () => {
        const contract = ContractBuilder.createThreeDRoomContract();
        
        expect(contract.displayName).toBe('ThreeDRoom');
        expect(contract.version).toBe('1.0.0');
        expect(contract.useRoomModels).toBe(false);
        expect(contract.roomPreset).toBe('geometric');
        expect(contract.furnitureModels).toEqual([]);
        expect(contract.lightingPreset).toBe('natural');
        expect(contract.cameraPosition).toEqual([0, 2, 5]);
        expect(contract.qualityLevel).toBe('medium');
        expect(contract.shadowsEnabled).toBe(true);
      });
      
      it('should apply overrides', () => {
        const furnitureModels: FurnitureModel[] = [
          {
            url: 'https://example.com/chair.glb',
            position: [1, 0, 1],
            name: 'chair'
          }
        ];
        
        const overrides: Partial<ThreeDRoomComponentContract> = {
          useRoomModels: true,
          roomPreset: 'modern',
          furnitureModels,
          qualityLevel: 'high'
        };
        
        const contract = ContractBuilder.createThreeDRoomContract(overrides);
        
        expect(contract.useRoomModels).toBe(true);
        expect(contract.roomPreset).toBe('modern');
        expect(contract.furnitureModels).toEqual(furnitureModels);
        expect(contract.qualityLevel).toBe('high');
        
        // Should keep defaults for non-overridden properties
        expect(contract.displayName).toBe('ThreeDRoom');
        expect(contract.shadowsEnabled).toBe(true);
      });
    });
  });
  
  describe('Type Guards', () => {
    it('should identify avatar contract', () => {
      const avatarContract = ContractBuilder.createAvatarContract();
      const notContract = { someProperty: 'value' };
      
      expect(isAvatarContract(avatarContract)).toBe(true);
      expect(isAvatarContract(notContract)).toBe(false);
      expect(isAvatarContract(null)).toBe(false);
      expect(isAvatarContract(undefined)).toBe(false);
    });
    
    it('should identify chat interface contract', () => {
      const chatContract = ContractBuilder.createChatInterfaceContract();
      const notContract = { someProperty: 'value' };
      
      expect(isChatInterfaceContract(chatContract)).toBe(true);
      expect(isChatInterfaceContract(notContract)).toBe(false);
      expect(isChatInterfaceContract(null)).toBe(false);
      expect(isChatInterfaceContract(undefined)).toBe(false);
    });
    
    it('should identify 3D room contract', () => {
      const roomContract = ContractBuilder.createThreeDRoomContract();
      const notContract = { someProperty: 'value' };
      
      expect(isThreeDRoomContract(roomContract)).toBe(true);
      expect(isThreeDRoomContract(notContract)).toBe(false);
      expect(isThreeDRoomContract(null)).toBe(false);
      expect(isThreeDRoomContract(undefined)).toBe(false);
    });
  });
  
  describe('Contract Enforcement', () => {
    it('should enforce valid contract', () => {
      const mockValidator = vi.fn().mockReturnValue({
        isValid: true,
        errors: [],
        warnings: [],
        score: 1.0
      });
      
      class TestComponent {
        @enforceContract(Object as unknown, mockValidator)
        render(props: Record<string, unknown>) {
          return props;
        }
      }
      
      const component = new TestComponent();
      const props = { displayName: 'Test' };
      
      expect(() => component.render(props)).not.toThrow();
      expect(mockValidator).toHaveBeenCalledWith(props);
    });
    
    it('should enforce invalid contract in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const mockValidator = vi.fn().mockReturnValue({
        isValid: false,
        errors: [{ code: 'TEST_ERROR', message: 'Test error', severity: 'error' }],
        warnings: [],
        score: 0.0
      });
      
      class TestComponent {
        @enforceContract(Object as unknown, mockValidator)
        render(props: Record<string, unknown>) {
          return props;
        }
      }
      
      const component = new TestComponent();
      const props = { displayName: 'Test' };
      
      expect(() => component.render(props)).toThrow('Contract validation failed');
      expect(mockValidator).toHaveBeenCalledWith(props);
      
      process.env.NODE_ENV = originalEnv;
    });
    
    it('should not throw in production even with invalid contract', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const mockValidator = vi.fn().mockReturnValue({
        isValid: false,
        errors: [{ code: 'TEST_ERROR', message: 'Test error', severity: 'error' }],
        warnings: [],
        score: 0.0
      });
      
      class TestComponent {
        @enforceContract(Object as unknown, mockValidator)
        render(props: Record<string, unknown>) {
          return props;
        }
      }
      
      const component = new TestComponent();
      const props = { displayName: 'Test' };
      
      expect(() => component.render(props)).not.toThrow();
      expect(mockValidator).toHaveBeenCalledWith(props);
      
      process.env.NODE_ENV = originalEnv;
    });
  });
  
  describe('Validation Result Structure', () => {
    it('should have correct validation result structure', () => {
      const result = ContractValidator.validateAvatarContract({});
      
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
      expect(result).toHaveProperty('score');
      
      expect(typeof result.isValid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
      expect(typeof result.score).toBe('number');
    });
    
    it('should have correct error structure', () => {
      const result = ContractValidator.validateAvatarContract({
        position: [0, 0] as [number, number] // Invalid position
      });
      
      expect(result.errors).toHaveLength(1);
      
      const error = result.errors[0];
      expect(error).toHaveProperty('code');
      expect(error).toHaveProperty('message');
      expect(error).toHaveProperty('field');
      expect(error).toHaveProperty('severity');
      
      expect(typeof error.code).toBe('string');
      expect(typeof error.message).toBe('string');
      expect(typeof error.field).toBe('string');
      expect(typeof error.severity).toBe('string');
    });
    
    it('should have correct warning structure', () => {
      const result = ContractValidator.validateAvatarContract({
        modelUrl: 'invalid-url'
      });
      
      expect(result.warnings).toHaveLength(1);
      
      const warning = result.warnings[0];
      expect(warning).toHaveProperty('code');
      expect(warning).toHaveProperty('message');
      expect(warning).toHaveProperty('field');
      expect(warning).toHaveProperty('suggestion');
      
      expect(typeof warning.code).toBe('string');
      expect(typeof warning.message).toBe('string');
      expect(typeof warning.field).toBe('string');
      expect(typeof warning.suggestion).toBe('string');
    });
  });
  
  describe('Performance', () => {
    it('should validate contracts quickly', () => {
      const start = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        ContractValidator.validateAvatarContract({
          displayName: `Avatar${i}`,
          position: [i, i, i],
          movementIntensity: 'subtle'
        });
      }
      
      const end = performance.now();
      const duration = end - start;
      
      // Should complete 1000 validations in under 100ms
      expect(duration).toBeLessThan(100);
    });
    
    it('should create contracts quickly', () => {
      const start = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        ContractBuilder.createAvatarContract({
          position: [i, i, i],
          testMode: i % 2 === 0
        });
      }
      
      const end = performance.now();
      const duration = end - start;
      
      // Should create 1000 contracts in under 50ms
      expect(duration).toBeLessThan(50);
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle null and undefined props', () => {
      expect(() => ContractValidator.validateAvatarContract(null as unknown)).not.toThrow();
      expect(() => ContractValidator.validateAvatarContract(undefined as unknown)).not.toThrow();
      expect(() => ContractValidator.validateChatInterfaceContract(null as unknown)).not.toThrow();
      expect(() => ContractValidator.validateThreeDRoomContract(null as unknown)).not.toThrow();
    });
    
    it('should handle empty objects', () => {
      const avatarResult = ContractValidator.validateAvatarContract({});
      const chatResult = ContractValidator.validateChatInterfaceContract({});
      const roomResult = ContractValidator.validateThreeDRoomContract({});
      
      expect(avatarResult.isValid).toBe(true);
      expect(chatResult.isValid).toBe(false); // Should fail due to missing onMessageSent
      expect(roomResult.isValid).toBe(true);
    });
    
    it('should handle contracts with extra properties', () => {
      const contractWithExtra = {
        displayName: 'Avatar',
        position: [0, 0, 0],
        extraProperty: 'should be ignored',
        anotherExtra: 123
      };
      
      const result = ContractValidator.validateAvatarContract(contractWithExtra);
      expect(result.isValid).toBe(true);
    });
  });
}); 