import { render } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GLTFPuppyAvatar from '../GLTFPuppyAvatar';
import { AVATAR_ANIMATION } from '../../config/breathingAnimationConstants';
import { AVATAR_CONFIG } from '../../config/roomConstants';

// Mock the GLTF loader
const mockGLTF = {
  scene: {
    traverse: vi.fn()
  },
  animations: []
};

vi.mock('@react-three/drei', () => ({
  useGLTF: vi.fn(() => mockGLTF),
  useAnimations: vi.fn(() => ({
    actions: {},
    mixer: {}
  }))
}));

// Mock the breathing controller
const mockController = {
  update: vi.fn(() => ({
    intensity: 0.5,
    shoulderOffset: 0.1,
    phase: 'inhale'
  })),
  updateParams: vi.fn()
};

const MockedBreathingController = vi.fn(() => mockController);
MockedBreathingController.presets = {
  RESTING: { baseRate: 0.25, amplitude: 0.6 },
  ALERT: { baseRate: 0.4, amplitude: 0.7 },
  EXCITED: { baseRate: 0.6, amplitude: 0.8 }
};

vi.mock('../../services/breathingController', () => ({
  BreathingController: MockedBreathingController
}));

describe('GLTFPuppyAvatar Scale Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GLTF Avatar Scale Consistency', () => {
    it('should use the same scale as geometric avatar', () => {
      // Both avatars should use the same scale for consistency
      expect(AVATAR_ANIMATION.SCALE.GLTF_BASE_SCALE).toBe(AVATAR_CONFIG.SCALE);
      expect(AVATAR_ANIMATION.SCALE.GLTF_BASE_SCALE).toBe(0.3);
    });

    it('should have reduced scale from original 0.5 to 0.3', () => {
      const originalScale = 0.5;
      const reductionPercentage = 0.4;
      const expectedScale = originalScale * (1 - reductionPercentage);
      
      expect(AVATAR_ANIMATION.SCALE.GLTF_BASE_SCALE).toBe(expectedScale);
    });

    it('should maintain valid scale range', () => {
      expect(AVATAR_ANIMATION.SCALE.GLTF_BASE_SCALE).toBeGreaterThan(0);
      expect(AVATAR_ANIMATION.SCALE.GLTF_BASE_SCALE).toBeLessThanOrEqual(1);
      expect(typeof AVATAR_ANIMATION.SCALE.GLTF_BASE_SCALE).toBe('number');
    });
  });

  describe('GLTF Model Loading with Scale', () => {
    it('should render without errors when GLTF loads successfully', () => {
      const { container } = render(
        <Canvas>
          <GLTFPuppyAvatar />
        </Canvas>
      );

      expect(container).toBeInTheDocument();
    });

    it('should handle different positions with consistent scale', () => {
      const testPosition: [number, number, number] = [1, 2, 3];
      
      const { container } = render(
        <Canvas>
          <GLTFPuppyAvatar position={testPosition} />
        </Canvas>
      );

      expect(container).toBeInTheDocument();
    });

    it('should apply scale uniformly to all axes', () => {
      // The scale should be applied equally to X, Y, and Z axes
      const scale = AVATAR_ANIMATION.SCALE.GLTF_BASE_SCALE;
      expect(scale).toBe(0.3);
      
      // Breathing factors should be much smaller than base scale
      expect(AVATAR_ANIMATION.SCALE.GLTF_BREATHING_X_FACTOR).toBeLessThan(scale);
      expect(AVATAR_ANIMATION.SCALE.GLTF_BREATHING_Z_FACTOR).toBeLessThan(scale);
    });
  });

  describe('Breathing Animation Scale Factors', () => {
    it('should have appropriate breathing scale factors for reduced avatar', () => {
      // Breathing factors should be proportional to the smaller avatar
      expect(AVATAR_ANIMATION.SCALE.GLTF_BREATHING_X_FACTOR).toBe(0.06);
      expect(AVATAR_ANIMATION.SCALE.GLTF_BREATHING_Z_FACTOR).toBe(0.04);
      
      // These should be small relative to the base scale
      expect(AVATAR_ANIMATION.SCALE.GLTF_BREATHING_X_FACTOR).toBeLessThan(AVATAR_ANIMATION.SCALE.GLTF_BASE_SCALE);
      expect(AVATAR_ANIMATION.SCALE.GLTF_BREATHING_Z_FACTOR).toBeLessThan(AVATAR_ANIMATION.SCALE.GLTF_BASE_SCALE);
    });

    it('should maintain breathing animation proportions', () => {
      // X breathing should be larger than Z breathing for natural chest expansion
      expect(AVATAR_ANIMATION.SCALE.GLTF_BREATHING_X_FACTOR).toBeGreaterThan(AVATAR_ANIMATION.SCALE.GLTF_BREATHING_Z_FACTOR);
    });
  });

  describe('Avatar State Management with Scale', () => {
    it('should initialize breathing controller regardless of scale', () => {
      render(
        <Canvas>
          <GLTFPuppyAvatar />
        </Canvas>
      );

      expect(MockedBreathingController).toHaveBeenCalledWith(
        MockedBreathingController.presets.RESTING
      );
    });

    it('should handle speaking state with scaled avatar', () => {
      render(
        <Canvas>
          <GLTFPuppyAvatar isSpeaking={true} />
        </Canvas>
      );

      expect(mockController.updateParams).toHaveBeenCalledWith(
        MockedBreathingController.presets.EXCITED
      );
    });

    it('should handle typing state with scaled avatar', () => {
      render(
        <Canvas>
          <GLTFPuppyAvatar userIsTyping={true} />
        </Canvas>
      );

      expect(mockController.updateParams).toHaveBeenCalledWith(
        MockedBreathingController.presets.ALERT
      );
    });

    it('should handle different movement intensities', () => {
      const intensities: Array<'subtle' | 'animated' | 'energetic'> = ['subtle', 'animated', 'energetic'];
      
      intensities.forEach(intensity => {
        const { container } = render(
          <Canvas>
            <GLTFPuppyAvatar movementIntensity={intensity} />
          </Canvas>
        );
        
        expect(container).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling with Scale', () => {
    it('should handle GLTF loading errors gracefully', () => {
      // Mock a failed GLTF load
      const mockUseGLTF = vi.mocked(useGLTF);
      mockUseGLTF.mockImplementation(() => {
        throw new Error('Failed to load GLTF');
      });

      expect(() => {
        render(
          <Canvas>
            <GLTFPuppyAvatar />
          </Canvas>
        );
      }).toThrow('Failed to load GLTF');
    });
  });

  describe('Scale Configuration Validation', () => {
    it('should have scale configuration that matches room constants', () => {
      expect(AVATAR_ANIMATION.SCALE.GLTF_BASE_SCALE).toBe(AVATAR_CONFIG.SCALE);
    });

    it('should have consistent scale types', () => {
      expect(typeof AVATAR_ANIMATION.SCALE.GLTF_BASE_SCALE).toBe('number');
      expect(typeof AVATAR_CONFIG.SCALE).toBe('number');
    });

    it('should represent the intended 40% reduction', () => {
      const originalScale = 0.5;
      const currentScale = AVATAR_ANIMATION.SCALE.GLTF_BASE_SCALE;
      const actualReduction = (originalScale - currentScale) / originalScale;
      
      expect(actualReduction).toBeCloseTo(0.4, 2); // 40% reduction with 2 decimal precision
    });
  });
}); 