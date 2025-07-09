import { describe, it, expect } from 'vitest';
import { 
  ROOM_CONSTANTS, 
  AVATAR_CONFIG, 
  AVATAR_ANIMATION,
  DEFAULT_SCALES,
  ERROR_MESSAGES,
  CONSOLE_MESSAGES
} from './roomConstants';

describe('Room Constants', () => {
  describe('ROOM_CONSTANTS', () => {
    it('should have valid room dimensions', () => {
      expect(ROOM_CONSTANTS.ROOM_WIDTH).toBeGreaterThan(0);
      expect(ROOM_CONSTANTS.ROOM_HEIGHT).toBeGreaterThan(0);
      expect(ROOM_CONSTANTS.ROOM_DEPTH).toBeGreaterThan(0);
    });

    it('should have valid wall thickness', () => {
      expect(ROOM_CONSTANTS.WALL_THICKNESS).toBeGreaterThan(0);
      expect(ROOM_CONSTANTS.WALL_THICKNESS).toBeLessThan(ROOM_CONSTANTS.ROOM_WIDTH / 2);
    });

    it('should have valid floor and ceiling positions', () => {
      expect(ROOM_CONSTANTS.FLOOR_Y).toBeLessThan(0);
      expect(ROOM_CONSTANTS.CEILING_Y).toBeGreaterThan(0);
      expect(ROOM_CONSTANTS.CEILING_Y).toBeGreaterThan(ROOM_CONSTANTS.FLOOR_Y);
    });
  });

  describe('AVATAR_CONFIG', () => {
    it('should have valid scale', () => {
      expect(AVATAR_CONFIG.SCALE).toBeGreaterThan(0);
      expect(AVATAR_CONFIG.SCALE).toBeLessThanOrEqual(1);
    });

    it('should have valid position coordinates', () => {
      expect(Array.isArray(AVATAR_CONFIG.POSITION)).toBe(true);
      expect(AVATAR_CONFIG.POSITION).toHaveLength(3);
      AVATAR_CONFIG.POSITION.forEach(coord => {
        expect(typeof coord).toBe('number');
      });
    });
  });

  describe('AVATAR_ANIMATION', () => {
    it('should have valid breathing rates', () => {
      expect(AVATAR_ANIMATION.BREATHING.RATE_MULTIPLIER.RESTING).toBeGreaterThan(0);
      expect(AVATAR_ANIMATION.BREATHING.RATE_MULTIPLIER.SPEAKING).toBeGreaterThan(0);
      expect(AVATAR_ANIMATION.BREATHING.RATE_MULTIPLIER.LISTENING).toBeGreaterThan(0);
    });

    it('should have valid scale factors', () => {
      expect(AVATAR_ANIMATION.SCALE.GLTF_BASE_SCALE).toBeGreaterThan(0);
      expect(AVATAR_ANIMATION.SCALE.GLTF_BREATHING_X_FACTOR).toBeGreaterThan(0);
      expect(AVATAR_ANIMATION.SCALE.GLTF_BREATHING_Z_FACTOR).toBeGreaterThan(0);
    });
  });

  describe('DEFAULT_SCALES', () => {
    it('should have valid uniform scale', () => {
      expect(DEFAULT_SCALES.UNIFORM).toBeGreaterThan(0);
    });
  });

  describe('ERROR_MESSAGES', () => {
    it('should have non-empty error messages', () => {
      Object.values(ERROR_MESSAGES).forEach(message => {
        expect(typeof message).toBe('string');
        expect(message.length).toBeGreaterThan(0);
      });
    });
  });

  describe('CONSOLE_MESSAGES', () => {
    it('should have non-empty console messages', () => {
      Object.values(CONSOLE_MESSAGES).forEach(message => {
        expect(typeof message).toBe('string');
        expect(message.length).toBeGreaterThan(0);
      });
    });
  });
}); 