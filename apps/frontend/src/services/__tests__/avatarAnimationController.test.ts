import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AvatarAnimationController } from '../avatarAnimationController';
import type { MovementIntensity } from '../avatarAnimationController';

describe('AvatarAnimationController', () => {
  let controller: AvatarAnimationController;

  beforeEach(() => {
    controller = new AvatarAnimationController();
  });

  afterEach(() => {
    controller.destroy();
  });

  describe('Initialization', () => {
    it('should initialize with idle state', () => {
      const state = controller.getCurrentState();
      expect(state.state).toBe('idle');
      expect(state.intensity).toBe('subtle');
      expect(state.isSpeaking).toBe(false);
      expect(state.userIsTyping).toBe(false);
    });

    it('should provide initial movement pattern', () => {
      const pattern = controller.getCurrentMovementPattern();
      expect(pattern).toBeDefined();
      expect(pattern.headRotation).toEqual({ x: 0, y: 0, z: 0 });
      expect(pattern.breathingIntensity).toBeGreaterThan(0);
    });
  });

  describe('State Transitions', () => {
    it('should transition to speaking state when isSpeaking is true', () => {
      const mockEmit = vi.spyOn(controller, 'emit');
      
      controller.updateState({ isSpeaking: true });
      
      const state = controller.getCurrentState();
      expect(state.state).toBe('speaking');
      expect(mockEmit).toHaveBeenCalledWith('stateChange', expect.objectContaining({
        from: 'idle',
        to: 'speaking'
      }));
    });

    it('should transition to listening state when userIsTyping is true', () => {
      controller.updateState({ userIsTyping: true });
      
      const state = controller.getCurrentState();
      expect(state.state).toBe('listening');
    });

    it('should transition to excited state for long messages', () => {
      controller.updateState({ 
        lastMessageLength: 150,
        timeSinceLastMessage: 2000
      });
      
      const state = controller.getCurrentState();
      expect(state.state).toBe('excited');
    });

    it('should transition to curious state for short messages', () => {
      controller.updateState({ 
        lastMessageLength: 30,
        timeSinceLastMessage: 5000
      });
      
      const state = controller.getCurrentState();
      expect(state.state).toBe('curious');
    });

    it('should transition to thinking state during processing', () => {
      controller.updateState({ 
        timeSinceLastMessage: 2000
      });
      
      const state = controller.getCurrentState();
      expect(state.state).toBe('thinking');
    });

    it('should prioritize speaking over other states', () => {
      controller.updateState({ 
        isSpeaking: true,
        userIsTyping: true,
        lastMessageLength: 150
      });
      
      const state = controller.getCurrentState();
      expect(state.state).toBe('speaking');
    });
  });

  describe('Movement Patterns', () => {
    it('should provide different patterns for different states', () => {
      const idlePattern = controller.getCurrentMovementPattern();
      
      controller.updateState({ isSpeaking: true });
      const speakingPattern = controller.getCurrentMovementPattern();
      
      expect(speakingPattern.tailWag.intensity).toBeGreaterThan(idlePattern.tailWag.intensity);
      expect(speakingPattern.headBob.frequency).toBeGreaterThan(idlePattern.headBob.frequency);
    });

    it('should apply intensity modifiers correctly', () => {
      controller.updateState({ intensity: 'animated' });
      const animatedPattern = controller.getCurrentMovementPattern();
      
      controller.updateState({ intensity: 'subtle' });
      const subtlePattern = controller.getCurrentMovementPattern();
      
      expect(animatedPattern.breathingIntensity).toBeGreaterThan(subtlePattern.breathingIntensity);
    });

    it('should handle ear movements for listening state', () => {
      controller.updateState({ userIsTyping: true });
      const pattern = controller.getCurrentMovementPattern();
      
      expect(pattern.earRotation.left).toBeGreaterThan(0);
      expect(pattern.earRotation.right).toBeGreaterThan(0);
      expect(pattern.earTwitch.frequency).toBeGreaterThan(0);
    });

    it('should handle paw gestures for different states', () => {
      controller.updateState({ isSpeaking: true });
      const speakingPattern = controller.getCurrentMovementPattern();
      expect(speakingPattern.pawGesture).toBe('point');
      
      controller.updateState({ 
        lastMessageLength: 150,
        timeSinceLastMessage: 2000
      });
      const excitedPattern = controller.getCurrentMovementPattern();
      expect(excitedPattern.pawGesture).toBe('wave');
    });
  });

  describe('Transition Interpolation', () => {
    it('should smoothly interpolate between states', async () => {
      const initialPattern = controller.getCurrentMovementPattern();
      
      controller.updateState({ isSpeaking: true });
      
      // Check interpolation during transition
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          controller.updateTransition();
          const transitionPattern = controller.getCurrentMovementPattern();
          
          // Should be between initial and target values
          expect(transitionPattern.tailWag.intensity).toBeGreaterThan(initialPattern.tailWag.intensity);
          expect(transitionPattern.tailWag.intensity).toBeLessThan(0.5); // Speaking intensity
          
          resolve();
        }, 100);
      });
    });

    it('should complete transitions after duration', async () => {
      const mockEmit = vi.spyOn(controller, 'emit');
      
      controller.updateState({ isSpeaking: true });
      
      // Simulate transition completion
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          for (let i = 0; i < 10; i++) {
            controller.updateTransition();
          }
          
          expect(mockEmit).toHaveBeenCalledWith('transitionComplete', 'speaking');
          resolve();
        }, 900); // Slightly more than transition duration
      });
    });
  });

  describe('Force State', () => {
    it('should force a specific state immediately', () => {
      controller.forceState('excited', 'animated');
      
      const state = controller.getCurrentState();
      expect(state.state).toBe('excited');
      expect(state.intensity).toBe('animated');
      
      const pattern = controller.getCurrentMovementPattern();
      expect(pattern.pawGesture).toBe('wave');
    });

    it('should emit stateForced event', () => {
      const mockEmit = vi.spyOn(controller, 'emit');
      
      controller.forceState('curious');
      
      expect(mockEmit).toHaveBeenCalledWith('stateForced', 'curious');
    });
  });

  describe('Reset to Idle', () => {
    it('should reset to idle state', () => {
      controller.updateState({ isSpeaking: true });
      expect(controller.getCurrentState().state).toBe('speaking');
      
      controller.resetToIdle();
      
      // Should transition back to idle
      const state = controller.getCurrentState();
      expect(state.userIsTyping).toBe(false);
      expect(state.isSpeaking).toBe(false);
    });
  });

  describe('Performance', () => {
    it('should handle rapid state updates efficiently', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        controller.updateState({ 
          userIsTyping: i % 2 === 0,
          lastMessageLength: i * 10,
          timeSinceLastMessage: i * 100
        });
        controller.updateTransition();
        controller.getCurrentMovementPattern();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });

    it('should provide consistent movement patterns', () => {
      controller.updateState({ isSpeaking: true });
      
      const pattern1 = controller.getCurrentMovementPattern();
      const pattern2 = controller.getCurrentMovementPattern();
      
      expect(pattern1).toEqual(pattern2);
    });
  });

  describe('Cleanup', () => {
    it('should clean up resources on destroy', () => {
      const mockRemoveAllListeners = vi.spyOn(controller, 'removeAllListeners');
      
      controller.destroy();
      
      expect(mockRemoveAllListeners).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid state updates gracefully', () => {
      expect(() => {
        controller.updateState({ 
          lastMessageLength: -1,
          timeSinceLastMessage: -1000
        });
      }).not.toThrow();
    });

    it('should handle extreme intensity values', () => {
      controller.updateState({ intensity: 'animated' as MovementIntensity });
      
      const pattern = controller.getCurrentMovementPattern();
      expect(pattern.breathingIntensity).toBeGreaterThan(0);
      expect(pattern.breathingIntensity).toBeLessThan(10); // Reasonable upper bound
    });

    it('should maintain state consistency during rapid transitions', () => {
      // Rapid state changes
      controller.updateState({ isSpeaking: true });
      controller.updateState({ userIsTyping: true });
      controller.updateState({ isSpeaking: false });
      controller.updateState({ userIsTyping: false });
      
      const state = controller.getCurrentState();
      expect(['idle', 'thinking', 'listening', 'speaking']).toContain(state.state);
    });
  });
}); 