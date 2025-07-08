import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { 
  AvatarValidator, 
  PUPPY_AVATAR_STANDARDS, 
  validatePuppyAvatar,
  ValidationResult,
  ValidationIssue 
} from '../avatarValidation';

describe('AvatarValidator', () => {
  let validator: AvatarValidator;
  let scene: THREE.Scene;
  let avatarGroup: THREE.Group;

  beforeEach(() => {
    validator = new AvatarValidator();
    scene = new THREE.Scene();
    avatarGroup = new THREE.Group();
    scene.add(avatarGroup);
  });

  describe('Anatomical Proportions', () => {
    it('should detect head-to-body ratio issues', () => {
      // Create oversized head
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(1.0), // Too large
        new THREE.MeshStandardMaterial({ color: '#D2B48C' })
      );
      head.name = 'head';
      
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.3), // Normal size
        new THREE.MeshStandardMaterial({ color: '#D2B48C' })
      );
      body.name = 'body';
      
      avatarGroup.add(head, body);
      
      const result = validator.validateAvatar(avatarGroup);
      
      expect(result.passed).toBe(false);
      expect(result.issues.some(issue => 
        issue.message.includes('Head-to-body ratio') && 
        issue.severity === 'major'
      )).toBe(true);
    });

    it('should accept correct head-to-body proportions', () => {
      // Create properly proportioned head and body
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.4), // Appropriate size
        new THREE.MeshStandardMaterial({ color: '#D2B48C' })
      );
      head.name = 'head';
      
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(1.0), // Base size
        new THREE.MeshStandardMaterial({ color: '#D2B48C' })
      );
      body.name = 'body';
      
      avatarGroup.add(head, body);
      
      const result = validator.validateAvatar(avatarGroup);
      
      const headBodyIssues = result.issues.filter(issue => 
        issue.message.includes('Head-to-body ratio')
      );
      expect(headBodyIssues.length).toBe(0);
    });

    it('should detect leg proportion issues', () => {
      // Create body and improperly sized legs
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(1.0),
        new THREE.MeshStandardMaterial({ color: '#D2B48C' })
      );
      body.name = 'body';
      
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.1), // Too short
        new THREE.MeshStandardMaterial({ color: '#D2B48C' })
      );
      leg.name = 'leg';
      
      avatarGroup.add(body, leg);
      
      const result = validator.validateAvatar(avatarGroup);
      
      expect(result.issues.some(issue => 
        issue.message.includes('Leg-to-body ratio') && 
        issue.severity === 'major'
      )).toBe(true);
    });
  });

  describe('Color Consistency', () => {
    it('should detect unexpected colors', () => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(1.0),
        new THREE.MeshStandardMaterial({ color: '#FF00FF' }) // Bright magenta - unexpected
      );
      
      avatarGroup.add(mesh);
      
      const result = validator.validateAvatar(avatarGroup);
      
      expect(result.issues.some(issue => 
        issue.message.includes('Unexpected color') && 
        issue.category === 'realism'
      )).toBe(true);
    });

    it('should accept approved color palette', () => {
      const approvedColors = [
        '#D2B48C', // Primary tan
        '#8B4513', // Brown
        '#F5F5DC', // Cream
        '#2F2F2F', // Dark gray
        '#000000'  // Black
      ];
      
      approvedColors.forEach((color, index) => {
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.5),
          new THREE.MeshStandardMaterial({ color })
        );
        mesh.name = `approved_${index}`;
        avatarGroup.add(mesh);
      });
      
      const result = validator.validateAvatar(avatarGroup);
      
      const colorIssues = result.issues.filter(issue => 
        issue.message.includes('Unexpected color')
      );
      expect(colorIssues.length).toBe(0);
    });
  });

  describe('Material Quality', () => {
    it('should detect inappropriate material properties', () => {
      // Create metallic material (inappropriate for fur)
      const metallicMesh = new THREE.Mesh(
        new THREE.SphereGeometry(1.0),
        new THREE.MeshStandardMaterial({ 
          color: '#D2B48C',
          metalness: 0.8, // Too metallic
          roughness: 0.1  // Too smooth
        })
      );
      
      avatarGroup.add(metallicMesh);
      
      const result = validator.validateAvatar(avatarGroup);
      
      expect(result.issues.some(issue => 
        issue.message.includes('metalness') && 
        issue.category === 'realism'
      )).toBe(true);
      
      expect(result.issues.some(issue => 
        issue.message.includes('roughness') && 
        issue.category === 'realism'
      )).toBe(true);
    });

    it('should accept appropriate fur-like materials', () => {
      const furMesh = new THREE.Mesh(
        new THREE.SphereGeometry(1.0),
        new THREE.MeshStandardMaterial({ 
          color: '#D2B48C',
          metalness: 0.05, // Appropriate for fur
          roughness: 0.9   // Appropriate for fur
        })
      );
      
      avatarGroup.add(furMesh);
      
      const result = validator.validateAvatar(avatarGroup);
      
      const materialIssues = result.issues.filter(issue => 
        issue.message.includes('metalness') || issue.message.includes('roughness')
      );
      expect(materialIssues.length).toBe(0);
    });
  });

  describe('Performance Validation', () => {
    it('should detect excessive vertex count', () => {
      // Create high-poly mesh
      const highPolyMesh = new THREE.Mesh(
        new THREE.SphereGeometry(1.0, 128, 128), // Very high detail
        new THREE.MeshStandardMaterial({ color: '#D2B48C' })
      );
      
      avatarGroup.add(highPolyMesh);
      
      const result = validator.validateAvatar(avatarGroup);
      
      expect(result.issues.some(issue => 
        issue.message.includes('vertices') && 
        issue.category === 'performance'
      )).toBe(true);
    });

    it('should detect excessive draw calls', () => {
      // Create many separate meshes
      for (let i = 0; i < 25; i++) {
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.1),
          new THREE.MeshStandardMaterial({ color: '#D2B48C' })
        );
        avatarGroup.add(mesh);
      }
      
      const result = validator.validateAvatar(avatarGroup);
      
      expect(result.issues.some(issue => 
        issue.message.includes('Draw calls') && 
        issue.category === 'performance'
      )).toBe(true);
    });
  });

  describe('Overall Validation', () => {
    it('should provide overall score and recommendations', () => {
      // Create a problematic avatar
      const badHead = new THREE.Mesh(
        new THREE.SphereGeometry(2.0), // Too large
        new THREE.MeshStandardMaterial({ 
          color: '#FF00FF', // Wrong color
          metalness: 0.8     // Too metallic
        })
      );
      badHead.name = 'head';
      
      const badBody = new THREE.Mesh(
        new THREE.SphereGeometry(0.5),
        new THREE.MeshStandardMaterial({ color: '#D2B48C' })
      );
      badBody.name = 'body';
      
      avatarGroup.add(badHead, badBody);
      
      const result = validator.validateAvatar(avatarGroup);
      
      expect(result.passed).toBe(false);
      expect(result.score).toBeLessThan(0.7);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should pass a well-constructed avatar', () => {
      // Create a properly proportioned avatar
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.4),
        new THREE.MeshStandardMaterial({ 
          color: '#D2B48C',
          metalness: 0.05,
          roughness: 0.9
        })
      );
      head.name = 'head';
      
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(1.0),
        new THREE.MeshStandardMaterial({ 
          color: '#D2B48C',
          metalness: 0.05,
          roughness: 0.9
        })
      );
      body.name = 'body';
      
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.6),
        new THREE.MeshStandardMaterial({ 
          color: '#D2B48C',
          metalness: 0.05,
          roughness: 0.9
        })
      );
      leg.name = 'leg';
      
      avatarGroup.add(head, body, leg);
      
      const result = validator.validateAvatar(avatarGroup);
      
      // Should have minimal issues (only interactivity since we don't have animations)
      const criticalIssues = result.issues.filter(i => i.severity === 'critical');
      expect(criticalIssues.length).toBe(0);
      
      const realismIssues = result.issues.filter(i => i.category === 'realism');
      expect(realismIssues.length).toBe(0);
    });
  });

  describe('Convenience Functions', () => {
    it('should work with validatePuppyAvatar function', () => {
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.4),
        new THREE.MeshStandardMaterial({ color: '#D2B48C' })
      );
      head.name = 'head';
      
      avatarGroup.add(head);
      
      const result = validatePuppyAvatar(avatarGroup);
      
      expect(result).toBeDefined();
      expect(typeof result.score).toBe('number');
      expect(Array.isArray(result.issues)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });
  });

  describe('Standards Configuration', () => {
    it('should use PUPPY_AVATAR_STANDARDS by default', () => {
      expect(PUPPY_AVATAR_STANDARDS.realism.anatomicalProportions.headToBodyRatio.min).toBe(0.3);
      expect(PUPPY_AVATAR_STANDARDS.realism.anatomicalProportions.headToBodyRatio.max).toBe(0.5);
      expect(PUPPY_AVATAR_STANDARDS.realism.colorConsistency.primaryColor).toBe('#D2B48C');
      expect(PUPPY_AVATAR_STANDARDS.performance.maxVertices).toBe(50000);
    });

    it('should accept custom standards', () => {
      const customStandards = {
        ...PUPPY_AVATAR_STANDARDS,
        realism: {
          ...PUPPY_AVATAR_STANDARDS.realism,
          anatomicalProportions: {
            ...PUPPY_AVATAR_STANDARDS.realism.anatomicalProportions,
            headToBodyRatio: { min: 0.4, max: 0.6 }
          }
        }
      };
      
      const customValidator = new AvatarValidator(customStandards);
      expect(customValidator).toBeDefined();
    });
  });
}); 