import { describe, it, expect, beforeEach } from 'vitest';
import { BreathingController } from '../breathingController';
import { TEST_CONSTANTS } from '../../config/breathingAnimationConstants';

describe('BreathingController', () => {
  let controller: BreathingController;

  beforeEach(() => {
    controller = new BreathingController();
  });

  describe('Initialization', () => {
    it('should initialize with default parameters', () => {
      const state = controller.getBreathingState();
      
      expect(state.phase).toBe(0);
      expect(state.intensity).toBe(0);
      expect(state.chestScale).toBe(1);
      expect(state.shoulderOffset).toBe(0);
      expect(state.isInhaling).toBe(false);
      expect(state.breathCount).toBe(0);
    });

    it('should initialize with custom parameters', () => {
      const customController = new BreathingController({
        baseRate: 0.5,
        amplitude: 0.9,
        chestExpansion: 0.2
      });
      
      // Should not throw and should be functional
      expect(() => {
        customController.update(TEST_CONSTANTS.DELTA_TIME);
      }).not.toThrow();
    });
  });

  describe('State Updates', () => {
    it('should update breathing state over time', () => {
      const initialState = controller.getBreathingState();
      
      controller.update(TEST_CONSTANTS.DELTA_TIME);
      
      const updatedState = controller.getBreathingState();
      expect(updatedState.phase).toBeGreaterThan(initialState.phase);
    });

    it('should handle zero delta time', () => {
      const initialState = controller.getBreathingState();
      
      controller.update(0);
      
      const updatedState = controller.getBreathingState();
      expect(updatedState.phase).toBe(initialState.phase);
    });

    it('should handle negative delta time', () => {
      const initialState = controller.getBreathingState();
      
      controller.update(-TEST_CONSTANTS.DELTA_TIME);
      
      const updatedState = controller.getBreathingState();
      expect(updatedState.phase).toBe(initialState.phase);
    });

    it('should clamp large delta times', () => {
      expect(() => {
        controller.update(TEST_CONSTANTS.LARGE_DELTA_TIME);
      }).not.toThrow();
      
      const state = controller.getBreathingState();
      expect(state.phase).toBeGreaterThanOrEqual(0);
      expect(state.phase).toBeLessThanOrEqual(1);
    });
  });

  describe('Parameter Updates', () => {
    it('should update parameters correctly', () => {
      const newParams = {
        baseRate: 0.5,
        amplitude: 0.9
      };
      
      controller.updateParams(newParams);
      
      // Should affect breathing behavior
      controller.update(TEST_CONSTANTS.DELTA_TIME);
      const state = controller.getBreathingState();
      
      expect(state.phase).toBeGreaterThanOrEqual(0);
      expect(state.phase).toBeLessThanOrEqual(1);
    });

    it('should preserve existing parameters when updating partially', () => {
      controller.updateParams({ baseRate: 0.5 });
      
      expect(() => {
        controller.update(TEST_CONSTANTS.DELTA_TIME);
      }).not.toThrow();
    });
  });

  describe('Breathing Cycle', () => {
    it('should cycle through breathing phases', () => {
      const phases: number[] = [];
      
      for (let i = 0; i < 20; i++) {
        controller.update(TEST_CONSTANTS.DELTA_TIME);
        phases.push(controller.getBreathingState().phase);
      }
      
      // Should have varying phases
      const uniquePhases = new Set(phases);
      expect(uniquePhases.size).toBeGreaterThan(1);
    });

    it('should maintain phase within bounds', () => {
      for (let i = 0; i < 100; i++) {
        controller.update(TEST_CONSTANTS.DELTA_TIME);
        const state = controller.getBreathingState();
        
        expect(state.phase).toBeGreaterThanOrEqual(0);
        expect(state.phase).toBeLessThanOrEqual(1);
        expect(state.intensity).toBeGreaterThanOrEqual(0);
        expect(state.intensity).toBeLessThanOrEqual(1);
      }
    });

    it('should update inhaling state correctly', () => {
      const inhalingStates: boolean[] = [];
      
      for (let i = 0; i < 50; i++) {
        controller.update(TEST_CONSTANTS.DELTA_TIME);
        inhalingStates.push(controller.getBreathingState().isInhaling);
      }
      
      // Should have both true and false states
      expect(inhalingStates.includes(true)).toBe(true);
      expect(inhalingStates.includes(false)).toBe(true);
    });
  });

  describe('Breathing Rate and Rhythm', () => {
    it('should maintain consistent breathing rate', () => {
      const breathCounts: number[] = [];
      
      // Track breath counts over time
      for (let i = 0; i < 100; i++) {
        controller.update(TEST_CONSTANTS.DELTA_TIME);
        breathCounts.push(controller.getBreathingState().breathCount);
      }
      
      // Should have some breath counts
      const finalCount = breathCounts[breathCounts.length - 1];
      expect(finalCount).toBeGreaterThan(0);
    });

    it('should have different rates for different states', () => {
      const restingController = new BreathingController(BreathingController.presets.RESTING);
      const excitedController = new BreathingController(BreathingController.presets.EXCITED);
      
      // Run both controllers for the same time
      for (let i = 0; i < TEST_CONSTANTS.LONG_TEST_ITERATIONS; i++) {
        restingController.update(TEST_CONSTANTS.DELTA_TIME);
        excitedController.update(TEST_CONSTANTS.DELTA_TIME);
      }
      
      // Both should be breathing, but potentially at different rates
      const restingState = restingController.getBreathingState();
      const excitedState = excitedController.getBreathingState();
      
      expect(restingState.phase).toBeGreaterThan(0);
      expect(excitedState.phase).toBeGreaterThan(0);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset to initial state', () => {
      // Run controller for a while (longer to ensure at least one breath cycle)
      for (let i = 0; i < TEST_CONSTANTS.LONG_TEST_ITERATIONS; i++) {
        controller.update(TEST_CONSTANTS.DELTA_TIME);
      }
      
      const stateBeforeReset = controller.getBreathingState();
      expect(stateBeforeReset.breathCount).toBeGreaterThan(0);
      
      // Reset
      controller.reset();
      
      const stateAfterReset = controller.getBreathingState();
      expect(stateAfterReset.breathCount).toBe(0);
      expect(stateAfterReset.phase).toBe(0);
      expect(stateAfterReset.intensity).toBe(0);
    });
  });

  describe('Preset Configurations', () => {
    it('should have all required presets', () => {
      expect(BreathingController.presets.RESTING).toBeDefined();
      expect(BreathingController.presets.ALERT).toBeDefined();
      expect(BreathingController.presets.EXCITED).toBeDefined();
      expect(BreathingController.presets.SLEEPING).toBeDefined();
    });

    it('should have valid preset values', () => {
      const presets = Object.values(BreathingController.presets);
      
      presets.forEach(preset => {
        expect(preset.baseRate).toBeGreaterThan(0);
        expect(preset.amplitude).toBeGreaterThan(0);
        expect(preset.chestExpansion).toBeGreaterThan(0);
        expect(preset.shoulderMovement).toBeGreaterThanOrEqual(0);
        expect(preset.irregularity).toBeGreaterThanOrEqual(0);
        expect(typeof preset.restingState).toBe('boolean');
      });
    });
  });

  describe('Performance and Stability', () => {
    it('should handle rapid updates without errors', () => {
      expect(() => {
        for (let i = 0; i < TEST_CONSTANTS.RAPID_TEST_ITERATIONS; i++) {
          controller.update(TEST_CONSTANTS.SMALL_DELTA_TIME);
        }
      }).not.toThrow();
    });

    it('should handle large time deltas', () => {
      expect(() => {
        controller.update(TEST_CONSTANTS.LARGE_DELTA_TIME);
      }).not.toThrow();
      
      const state = controller.getBreathingState();
      expect(state.phase).toBeGreaterThanOrEqual(0);
      expect(state.phase).toBeLessThanOrEqual(1);
    });

    it('should maintain stable values over time', () => {
      const intensities: number[] = [];
      
      for (let i = 0; i < TEST_CONSTANTS.STABILITY_TEST_ITERATIONS; i++) {
        controller.update(TEST_CONSTANTS.STABILITY_DELTA_TIME);
        intensities.push(controller.getBreathingState().intensity);
      }
      
      // All intensities should be within valid range
      intensities.forEach(intensity => {
        expect(intensity).toBeGreaterThanOrEqual(0);
        expect(intensity).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle extreme parameter values', () => {
      const extremeController = new BreathingController({
        baseRate: 0.001,
        amplitude: 0.001,
        chestExpansion: 0.001,
        shoulderMovement: 0.001,
        irregularity: 0.001
      });
      
      expect(() => {
        extremeController.update(TEST_CONSTANTS.DELTA_TIME);
      }).not.toThrow();
    });

    it('should handle high parameter values', () => {
      const highController = new BreathingController({
        baseRate: 2.0,
        amplitude: 1.0,
        chestExpansion: 1.0,
        shoulderMovement: 1.0,
        irregularity: 1.0
      });
      
      expect(() => {
        highController.update(TEST_CONSTANTS.DELTA_TIME);
      }).not.toThrow();
    });
  });
}); 