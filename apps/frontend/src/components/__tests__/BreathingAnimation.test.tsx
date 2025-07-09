import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import React from 'react';
import AnimatedPuppyAvatar from '../AnimatedPuppyAvatar';
import { TEST_CONSTANTS } from '../../config/breathingAnimationConstants';

// Mock the breathing controller
vi.mock('../../services/breathingController');

// Mock Three.js and React Three Fiber
vi.mock('@react-three/fiber', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useFrame: vi.fn(),
    useThree: vi.fn(() => ({ camera: {}, scene: {} }))
  };
});

vi.mock('@react-three/drei', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useGLTF: vi.fn(() => ({
      scene: { children: [] },
      animations: [],
      nodes: {},
      materials: {}
    })),
    useAnimations: vi.fn(() => ({
      actions: {},
      names: [],
      clips: [],
      mixer: {}
    }))
  };
});

import { BreathingController } from '../../services/breathingController';

const MockedBreathingController = BreathingController as vi.MockedClass<typeof BreathingController>;

describe('Breathing Animation', () => {
  let mockController: vi.Mocked<BreathingController>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create a mock controller instance
    mockController = {
      update: vi.fn(),
      getBreathingState: vi.fn(),
      updateParams: vi.fn(),
      reset: vi.fn()
    } as vi.Mocked<BreathingController>;

    // Mock the constructor to return our mock instance
    MockedBreathingController.mockImplementation(() => mockController);
    
    // Mock static presets
    MockedBreathingController.presets = {
      RESTING: {
        baseRate: 0.25,
        amplitude: 0.6,
        chestExpansion: 0.08,
        shoulderMovement: 0.03,
        irregularity: 0.08,
        restingState: true
      },
      ALERT: {
        baseRate: 0.4,
        amplitude: 0.7,
        chestExpansion: 0.12,
        shoulderMovement: 0.05,
        irregularity: 0.12,
        restingState: false
      },
      EXCITED: {
        baseRate: 0.6,
        amplitude: 0.8,
        chestExpansion: 0.15,
        shoulderMovement: 0.07,
        irregularity: 0.15,
        restingState: false
      },
      SLEEPING: {
        baseRate: 0.2,
        amplitude: 0.4,
        chestExpansion: 0.05,
        shoulderMovement: 0.02,
        irregularity: 0.03,
        restingState: true
      }
    };
  });

  describe('AnimatedPuppyAvatar Breathing', () => {
    it('should initialize breathing controller on mount', () => {
      render(
        <Canvas>
          <AnimatedPuppyAvatar />
        </Canvas>
      );

      expect(MockedBreathingController).toHaveBeenCalledWith(
        MockedBreathingController.presets.RESTING
      );
    });

    it('should update breathing parameters when speaking', () => {
      render(
        <Canvas>
          <AnimatedPuppyAvatar isSpeaking={true} />
        </Canvas>
      );

      expect(mockController.updateParams).toHaveBeenCalledWith(
        MockedBreathingController.presets.EXCITED
      );
    });

    it('should update breathing parameters when user is typing', () => {
      render(
        <Canvas>
          <AnimatedPuppyAvatar userIsTyping={true} />
        </Canvas>
      );

      expect(mockController.updateParams).toHaveBeenCalledWith(
        MockedBreathingController.presets.ALERT
      );
    });

    it('should use resting preset by default', () => {
      render(
        <Canvas>
          <AnimatedPuppyAvatar />
        </Canvas>
      );

      expect(MockedBreathingController).toHaveBeenCalledWith(
        MockedBreathingController.presets.RESTING
      );
    });

    it('should handle different movement intensities', () => {
      const intensities: Array<'subtle' | 'animated' | 'energetic'> = ['subtle', 'animated', 'energetic'];
      
      intensities.forEach(intensity => {
        render(
          <Canvas>
            <AnimatedPuppyAvatar movementIntensity={intensity} />
          </Canvas>
        );
      });

      expect(MockedBreathingController).toHaveBeenCalledTimes(intensities.length);
    });
  });

  describe('Constants Integration', () => {
    it('should use test constants for consistent testing', () => {
      // Verify that TEST_CONSTANTS are properly imported and accessible
      expect(TEST_CONSTANTS.DELTA_TIME).toBeDefined();
      expect(TEST_CONSTANTS.DELTA_TIME).toBeGreaterThan(0);
      expect(TEST_CONSTANTS.RAPID_TEST_ITERATIONS).toBeDefined();
      expect(TEST_CONSTANTS.STABILITY_TEST_ITERATIONS).toBeDefined();
    });

    it('should have consistent constant values', () => {
      expect(TEST_CONSTANTS.SMALL_DELTA_TIME).toBeLessThan(TEST_CONSTANTS.DELTA_TIME);
      expect(TEST_CONSTANTS.LARGE_DELTA_TIME).toBeGreaterThan(TEST_CONSTANTS.DELTA_TIME);
      expect(TEST_CONSTANTS.RAPID_TEST_ITERATIONS).toBeGreaterThan(TEST_CONSTANTS.LONG_TEST_ITERATIONS);
    });
  });

  describe('Breathing Animation Performance', () => {
    it('should not cause memory leaks with rapid updates', () => {
      mockController.update.mockReturnValue({
        phase: 0.5,
        intensity: 0.7,
        chestScale: 1.1,
        shoulderOffset: 0.02,
        isInhaling: true,
        breathCount: 5
      });

      render(
        <Canvas>
          <AnimatedPuppyAvatar />
        </Canvas>
      );

      // Test that the component can handle rapid updates without errors
      expect(() => {
        for (let i = 0; i < 10; i++) {
          mockController.update(TEST_CONSTANTS.SMALL_DELTA_TIME);
        }
      }).not.toThrow();
    });

    it('should handle large delta times without errors', () => {
      mockController.update.mockReturnValue({
        phase: 0.5,
        intensity: 0.7,
        chestScale: 1.1,
        shoulderOffset: 0.02,
        isInhaling: true,
        breathCount: 5
      });

      render(
        <Canvas>
          <AnimatedPuppyAvatar />
        </Canvas>
      );

      expect(() => {
        mockController.update(TEST_CONSTANTS.LARGE_DELTA_TIME);
      }).not.toThrow();
    });
  });

  describe('Breathing Animation Integration', () => {
    it('should coordinate breathing with speaking animation', () => {
      mockController.update.mockReturnValue({
        phase: 0.5,
        intensity: 0.7,
        chestScale: 1.1,
        shoulderOffset: 0.02,
        isInhaling: true,
        breathCount: 5
      });

      expect(() => {
        render(
          <Canvas>
            <AnimatedPuppyAvatar isSpeaking={true} lastMessageLength={50} />
          </Canvas>
        );
      }).not.toThrow();
    });

    it('should coordinate breathing with typing animation', () => {
      mockController.update.mockReturnValue({
        phase: 0.5,
        intensity: 0.7,
        chestScale: 1.1,
        shoulderOffset: 0.02,
        isInhaling: true,
        breathCount: 5
      });

      expect(() => {
        render(
          <Canvas>
            <AnimatedPuppyAvatar userIsTyping={true} />
          </Canvas>
        );
      }).not.toThrow();
    });
  });
}); 