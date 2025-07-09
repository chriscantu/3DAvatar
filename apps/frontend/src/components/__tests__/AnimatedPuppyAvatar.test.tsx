import { describe, it, expect } from 'vitest';
import { AVATAR_CONFIG } from '../../config/roomConstants';
import { AVATAR_ANIMATION } from '../../config/breathingAnimationConstants';

describe('AnimatedPuppyAvatar', () => {
  describe('Avatar Scale Configuration', () => {
    it('should apply 30% scale reduction', () => {
      const avatarScale = AVATAR_CONFIG.SCALE;
      expect(avatarScale).toBe(0.3);
    });

    it('should use consistent scale across all dimensions', () => {
      const expectedScale = [0.3, 0.3, 0.3];
      expect(expectedScale).toEqual([
        AVATAR_CONFIG.SCALE,
        AVATAR_CONFIG.SCALE,
        AVATAR_CONFIG.SCALE
      ]);
    });

    it('should represent 40% size reduction from original', () => {
      const originalScale = 0.5;
      const reductionFactor = 0.6;
      const expectedScale = originalScale * reductionFactor;
      expect(AVATAR_CONFIG.SCALE).toBe(expectedScale);
    });

    it('should match GLTF base scale', () => {
      expect(AVATAR_CONFIG.SCALE).toBe(AVATAR_ANIMATION.SCALE.GLTF_BASE_SCALE);
    });
  });

  describe('Movement Intensity Levels', () => {
    it('should define subtle movement intensity', () => {
      expect(AVATAR_ANIMATION.MOVEMENT_INTENSITY.SUBTLE).toBe(0.3);
    });

    it('should define animated movement intensity', () => {
      expect(AVATAR_ANIMATION.MOVEMENT_INTENSITY.ANIMATED).toBe(0.6);
    });

    it('should define energetic movement intensity', () => {
      expect(AVATAR_ANIMATION.MOVEMENT_INTENSITY.ENERGETIC).toBe(1.0);
    });

    it('should increase intensity progressively', () => {
      const { SUBTLE, ANIMATED, ENERGETIC } = AVATAR_ANIMATION.MOVEMENT_INTENSITY;
      expect(SUBTLE).toBeLessThan(ANIMATED);
      expect(ANIMATED).toBeLessThan(ENERGETIC);
    });
  });

  describe('Breathing Animation Scale', () => {
    it('should apply overall breathing intensity reduction', () => {
      expect(AVATAR_ANIMATION.BREATHING_SCALE.OVERALL_INTENSITY).toBe(0.3);
    });

    it('should define body breathing factors', () => {
      expect(AVATAR_ANIMATION.BREATHING_SCALE.BODY_X_FACTOR).toBe(0.05);
      expect(AVATAR_ANIMATION.BREATHING_SCALE.BODY_Z_FACTOR).toBe(0.03);
    });

    it('should define chest breathing factors', () => {
      expect(AVATAR_ANIMATION.BREATHING_SCALE.CHEST_X_FACTOR).toBe(0.08);
      expect(AVATAR_ANIMATION.BREATHING_SCALE.CHEST_Z_FACTOR).toBe(0.06);
      expect(AVATAR_ANIMATION.BREATHING_SCALE.CHEST_Y_FACTOR).toBe(0.04);
    });

    it('should define shoulder movement factor', () => {
      expect(AVATAR_ANIMATION.BREATHING_SCALE.SHOULDER_FACTOR).toBe(0.015);
    });

    it('should define head breathing factor', () => {
      expect(AVATAR_ANIMATION.BREATHING_SCALE.HEAD_BREATHING_FACTOR).toBe(0.005);
    });
  });

  describe('Avatar Body Proportions', () => {
    it('should define body base dimensions', () => {
      expect(AVATAR_ANIMATION.SCALE.BODY_BASE_X).toBe(1.2);
      expect(AVATAR_ANIMATION.SCALE.BODY_BASE_Y).toBe(0.8);
      expect(AVATAR_ANIMATION.SCALE.BODY_BASE_Z).toBe(2.2);
    });

    it('should maintain proportional body shape', () => {
      const { BODY_BASE_X, BODY_BASE_Y, BODY_BASE_Z } = AVATAR_ANIMATION.SCALE;
      expect(BODY_BASE_Z).toBeGreaterThan(BODY_BASE_X);
      expect(BODY_BASE_X).toBeGreaterThan(BODY_BASE_Y);
    });
  });
}); 