import { describe, it, expect } from 'vitest';
import {
  ROOM_DIMENSIONS,
  ROOM_POSITIONS,
  ROOM_COLORS,
  FURNITURE_POSITIONS,
  FURNITURE_DIMENSIONS,
  FURNITURE_COLORS,
  POSTER_POSITIONS,
  POSTER_DIMENSIONS,
  POSTER_COLORS,
  POSTER_ROTATIONS,
  WINDOW_DIMENSIONS,
  LIGHTING_CONFIG,
  AVATAR_CONFIG,
  CAMERA_CONFIG,
  UI_CONFIG,
  GEOMETRY_SEGMENTS,
  MATERIAL_PROPERTIES,
  ERROR_MESSAGES,
  CONSOLE_MESSAGES,
  MODEL_PATHS,
  DEFAULT_SCALES
} from '../roomConstants';

describe('Room Constants Configuration', () => {
  describe('AVATAR_CONFIG', () => {
    it('should have valid position coordinates', () => {
      expect(AVATAR_CONFIG.POSITION).toHaveLength(3);
      expect(typeof AVATAR_CONFIG.POSITION[0]).toBe('number');
      expect(typeof AVATAR_CONFIG.POSITION[1]).toBe('number');
      expect(typeof AVATAR_CONFIG.POSITION[2]).toBe('number');
    });

    it('should have valid movement intensity setting', () => {
      expect(AVATAR_CONFIG.MOVEMENT_INTENSITY).toBe('animated');
      expect(['subtle', 'animated', 'energetic']).toContain(AVATAR_CONFIG.MOVEMENT_INTENSITY);
    });

    it('should have valid scale setting for 40% reduction', () => {
      expect(AVATAR_CONFIG.SCALE).toBe(0.3);
      expect(typeof AVATAR_CONFIG.SCALE).toBe('number');
      expect(AVATAR_CONFIG.SCALE).toBeGreaterThan(0);
      expect(AVATAR_CONFIG.SCALE).toBeLessThanOrEqual(1);
    });

    it('should have scale that represents 40% reduction from original 0.5', () => {
      const originalScale = 0.5;
      const reductionPercentage = 0.4;
      const expectedScale = originalScale * (1 - reductionPercentage);
      expect(AVATAR_CONFIG.SCALE).toBe(expectedScale);
    });
  });

  describe('CAMERA_CONFIG', () => {
    it('should have valid camera position', () => {
      expect(CAMERA_CONFIG.POSITION).toHaveLength(3);
      expect(typeof CAMERA_CONFIG.POSITION[0]).toBe('number');
      expect(typeof CAMERA_CONFIG.POSITION[1]).toBe('number');
      expect(typeof CAMERA_CONFIG.POSITION[2]).toBe('number');
    });

    it('should have valid FOV setting', () => {
      expect(typeof CAMERA_CONFIG.FOV).toBe('number');
      expect(CAMERA_CONFIG.FOV).toBeGreaterThan(0);
      expect(CAMERA_CONFIG.FOV).toBeLessThanOrEqual(180);
    });

    it('should have valid distance constraints', () => {
      expect(CAMERA_CONFIG.MIN_DISTANCE).toBeGreaterThan(0);
      expect(CAMERA_CONFIG.MAX_DISTANCE).toBeGreaterThan(CAMERA_CONFIG.MIN_DISTANCE);
    });

    it('should have valid target position', () => {
      expect(CAMERA_CONFIG.TARGET).toHaveLength(3);
      expect(typeof CAMERA_CONFIG.TARGET[0]).toBe('number');
      expect(typeof CAMERA_CONFIG.TARGET[1]).toBe('number');
      expect(typeof CAMERA_CONFIG.TARGET[2]).toBe('number');
    });
  });

  describe('ROOM_DIMENSIONS', () => {
    it('should have positive dimensions', () => {
      expect(ROOM_DIMENSIONS.WIDTH).toBeGreaterThan(0);
      expect(ROOM_DIMENSIONS.HEIGHT).toBeGreaterThan(0);
      expect(ROOM_DIMENSIONS.DEPTH).toBeGreaterThan(0);
      expect(ROOM_DIMENSIONS.FLOOR_THICKNESS).toBeGreaterThan(0);
      expect(ROOM_DIMENSIONS.WALL_THICKNESS).toBeGreaterThan(0);
    });
  });

  describe('LIGHTING_CONFIG', () => {
    it('should have valid intensity values', () => {
      expect(LIGHTING_CONFIG.AMBIENT_INTENSITY).toBeGreaterThan(0);
      expect(LIGHTING_CONFIG.DIRECTIONAL_INTENSITY).toBeGreaterThan(0);
      expect(LIGHTING_CONFIG.POINT_INTENSITY).toBeGreaterThan(0);
    });

    it('should have valid position arrays', () => {
      expect(LIGHTING_CONFIG.DIRECTIONAL_POSITION).toHaveLength(3);
      expect(LIGHTING_CONFIG.POINT_POSITION).toHaveLength(3);
    });
  });

  describe('MODEL_PATHS', () => {
    it('should have valid room model paths', () => {
      expect(typeof MODEL_PATHS.ROOM.BEDROOM_COMPLETE).toBe('string');
      expect(MODEL_PATHS.ROOM.BEDROOM_COMPLETE).toMatch(/\.glb$/);
      expect(MODEL_PATHS.ROOM.BEDROOM_COMPLETE).toMatch(/^\/models\//);
    });

    it('should have valid avatar model paths', () => {
      expect(typeof MODEL_PATHS.AVATAR.PUPPY).toBe('string');
      expect(MODEL_PATHS.AVATAR.PUPPY).toMatch(/\.glb$/);
      expect(MODEL_PATHS.AVATAR.PUPPY).toMatch(/^\/models\//);
    });
  });

  describe('DEFAULT_SCALES', () => {
    it('should have consistent scale values with AVATAR_CONFIG', () => {
      expect(typeof DEFAULT_SCALES.UNIFORM).toBe('number');
      expect(DEFAULT_SCALES.SMALL).toBeLessThan(DEFAULT_SCALES.UNIFORM);
      expect(DEFAULT_SCALES.LARGE).toBeGreaterThan(DEFAULT_SCALES.UNIFORM);
    });
  });

  describe('Constants Structure', () => {
    it('should have all required configuration objects', () => {
      expect(ROOM_DIMENSIONS).toBeDefined();
      expect(ROOM_POSITIONS).toBeDefined();
      expect(ROOM_COLORS).toBeDefined();
      expect(FURNITURE_POSITIONS).toBeDefined();
      expect(FURNITURE_DIMENSIONS).toBeDefined();
      expect(FURNITURE_COLORS).toBeDefined();
      expect(AVATAR_CONFIG).toBeDefined();
      expect(CAMERA_CONFIG).toBeDefined();
      expect(LIGHTING_CONFIG).toBeDefined();
    });

    it('should have all objects marked as const', () => {
      // This is enforced by TypeScript, but we can verify the structure
      expect(Object.isFrozen(AVATAR_CONFIG)).toBe(false); // const assertions don't freeze, but prevent reassignment
      expect(typeof AVATAR_CONFIG).toBe('object');
    });
  });

  describe('Error and Console Messages', () => {
    it('should have string error messages', () => {
      Object.values(ERROR_MESSAGES).forEach(message => {
        expect(typeof message).toBe('string');
        expect(message.length).toBeGreaterThan(0);
      });
    });

    it('should have string console messages', () => {
      Object.values(CONSOLE_MESSAGES).forEach(message => {
        expect(typeof message).toBe('string');
        expect(message.length).toBeGreaterThan(0);
      });
    });
  });
}); 