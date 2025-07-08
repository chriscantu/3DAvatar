import { describe, it, expect, vi, beforeEach } from 'vitest';
import { idealDogSpecs, createReferenceAvatar, validateAvatarAgainstReference } from '../../utils/generateReferenceImage';

// Mock THREE.js to avoid WebGL context issues
vi.mock('three', () => ({
  Group: vi.fn(() => ({ children: [], add: vi.fn(), name: '' })),
  Mesh: vi.fn(() => ({ position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, name: '' })),
  SphereGeometry: vi.fn(),
  CylinderGeometry: vi.fn(),
  MeshStandardMaterial: vi.fn(),
  Object3D: vi.fn(() => ({ position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } }))
}));

interface MockAvatarComponent {
  name: string;
  scale?: { x: number; y: number; z: number };
  position: { x: number; y: number; z: number };
}

interface MockAvatar {
  children: MockAvatarComponent[];
}

describe('Avatar Reference Validation', () => {
  describe('Ideal Dog Specifications', () => {
    it('should have proper body proportions', () => {
      const { body } = idealDogSpecs;
      
      // Body should be elongated (length > width > height)
      expect(body.length).toBeGreaterThan(body.width);
      expect(body.width).toBeGreaterThan(body.height);
      
      // Body should be elevated above ground
      expect(body.position[1]).toBeGreaterThan(0);
    });

    it('should have realistic snout dimensions', () => {
      const { snout, head } = idealDogSpecs;
      
      // Snout should be proportional to head
      expect(snout.length).toBeGreaterThan(0.3);
      expect(snout.length).toBeLessThan(head.diameter);
      
      // Snout should taper (tip < base)
      expect(snout.tipWidth).toBeLessThan(snout.baseWidth);
      
      // Snout should be positioned forward of head
      expect(snout.position[2]).toBeGreaterThan(head.position[2]);
    });

    it('should have chest positioned naturally', () => {
      const { chest, body } = idealDogSpecs;
      
      // Chest should be smaller than body
      expect(chest.width).toBeLessThan(body.width);
      expect(chest.depth).toBeLessThan(body.length);
      
      // Chest should be positioned forward of body center
      expect(chest.position[2]).toBeGreaterThan(body.position[2]);
    });

    it('should have paws at ground level', () => {
      const { paws } = idealDogSpecs;
      
      paws.forEach((paw) => {
        // All paws should be at ground level (y close to 0)
        expect(paw.position[1]).toBeGreaterThan(0);
        expect(paw.position[1]).toBeLessThan(0.2);
      });
    });

    it('should have proper leg support structure', () => {
      const { legs, body } = idealDogSpecs;
      
      // Should have 4 legs
      expect(legs).toHaveLength(4);
      
      legs.forEach((leg) => {
        // Legs should be positioned to support body
        expect(leg.position[1]).toBeLessThan(body.position[1]);
        expect(leg.length).toBeGreaterThan(0.3);
      });
    });
  });

  describe('Avatar Validation Against Reference', () => {
    let mockAvatar: MockAvatar;
    let mockReference: MockAvatar;

    beforeEach(() => {
      // Create mock avatar with realistic components
      mockAvatar = {
        children: [
          { name: 'body', scale: { x: 1.2, y: 0.8, z: 2.2 }, position: { x: 0, y: 0.45, z: 0 } },
          { name: 'head', position: { x: 0, y: 0.8, z: 0.6 } },
          { name: 'snout', position: { x: 0, y: 0.75, z: 0.95 } },
          { name: 'chest', position: { x: 0, y: 0.35, z: 0.4 } },
          { name: 'paw-0', position: { x: -0.25, y: 0.09, z: 0.4 } },
          { name: 'paw-1', position: { x: 0.25, y: 0.09, z: 0.4 } },
          { name: 'paw-2', position: { x: -0.25, y: 0.09, z: -0.4 } },
          { name: 'paw-3', position: { x: 0.25, y: 0.09, z: -0.4 } }
        ]
      };

      // Create mock reference
      mockReference = {
        children: [
          { name: 'reference-body', scale: { x: 0.8, y: 1.0, z: 1.5 }, position: { x: 0, y: 0.45, z: 0 } },
          { name: 'reference-head', position: { x: 0, y: 0.8, z: 0.6 } },
          { name: 'reference-snout', position: { x: 0, y: 0.75, z: 0.95 } },
          { name: 'reference-chest', position: { x: 0, y: 0.4, z: 0.3 } },
          { name: 'reference-paw-0', position: { x: -0.25, y: 0.09, z: 0.4 } },
          { name: 'reference-paw-1', position: { x: 0.25, y: 0.09, z: 0.4 } },
          { name: 'reference-paw-2', position: { x: -0.25, y: 0.09, z: -0.4 } },
          { name: 'reference-paw-3', position: { x: 0.25, y: 0.09, z: -0.4 } }
        ]
      };
    });

    it('should validate realistic body proportions', () => {
      const result = validateAvatarAgainstReference(mockAvatar as never, mockReference as never);
      
      // Body should be elongated (z > y)
      expect(result.measurements.bodyScale.avatar.z).toBeGreaterThan(result.measurements.bodyScale.avatar.y);
      
      // Should not have the "spherical body" issue
      expect(result.issues.filter(issue => issue.includes('spherical'))).toHaveLength(0);
    });

    it('should validate proper ground contact', () => {
      const result = validateAvatarAgainstReference(mockAvatar as never, mockReference as never);
      
      // Paws should be close to ground level
      expect(result.measurements.groundContact.lowestPawY).toBeLessThan(0.15);
      expect(result.measurements.groundContact.lowestPawY).toBeGreaterThan(0);
      
      // Should not be floating
      expect(result.issues.filter(issue => issue.includes('floating'))).toHaveLength(0);
    });

    it('should validate snout positioning', () => {
      const result = validateAvatarAgainstReference(mockAvatar as never, mockReference as never);
      
      // Snout should be present and positioned correctly
      expect(result.measurements.snoutPosition).toBeDefined();
      expect(result.measurements.snoutPosition.z).toBeGreaterThan(0.8); // Forward of head
      
      // Should not have missing snout issue
      expect(result.issues.filter(issue => issue.includes('Missing snout'))).toHaveLength(0);
    });

    it('should detect floating avatar issues', () => {
      // Create floating avatar
      const floatingAvatar = {
        ...mockAvatar,
        children: mockAvatar.children.map((child: MockAvatarComponent) => 
          child.name?.includes('paw') 
            ? { ...child, position: { ...child.position, y: 0.3 } } // Floating paws
            : child
        )
      };

      const result = validateAvatarAgainstReference(floatingAvatar as never, mockReference as never);
      
      expect(result.isValid).toBe(false);
      expect(result.issues.some(issue => issue.includes('floating'))).toBe(true);
    });

    it('should detect spherical body issues', () => {
      // Create spherical body avatar
      const sphericalAvatar = {
        ...mockAvatar,
        children: mockAvatar.children.map((child: MockAvatarComponent) => 
          child.name === 'body' 
            ? { ...child, scale: { x: 1, y: 1, z: 1 } } // Spherical proportions
            : child
        )
      };

      const result = validateAvatarAgainstReference(sphericalAvatar as never, mockReference as never);
      
      expect(result.isValid).toBe(false);
      expect(result.issues.some(issue => issue.includes('elongated'))).toBe(true);
    });

    it('should detect missing snout issues', () => {
      // Create avatar without snout
      const noSnoutAvatar = {
        ...mockAvatar,
        children: mockAvatar.children.filter((child: MockAvatarComponent) => !child.name?.includes('snout'))
      };

      const result = validateAvatarAgainstReference(noSnoutAvatar as never, mockReference as never);
      
      expect(result.isValid).toBe(false);
      expect(result.issues.some(issue => issue.includes('Missing snout'))).toBe(true);
    });

    it('should pass validation for properly constructed avatar', () => {
      const result = validateAvatarAgainstReference(mockAvatar as never, mockReference as never);
      
      // Should be valid if all components are properly positioned
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });
  });

  describe('Reference Image Generation', () => {
    it('should have proper reference specifications', () => {
      // Test that our reference specs follow realistic proportions
      expect(idealDogSpecs.body.length).toBeGreaterThan(idealDogSpecs.body.height);
      expect(idealDogSpecs.snout.length).toBeGreaterThan(0.3);
      expect(idealDogSpecs.chest.width).toBeLessThan(idealDogSpecs.body.width);
      
      // Test ground contact
      idealDogSpecs.paws.forEach(paw => {
        expect(paw.position[1]).toBeLessThan(0.15); // Close to ground
        expect(paw.position[1]).toBeGreaterThan(0); // Above ground
      });
    });

    it('should create reference avatar with proper structure', () => {
      const reference = createReferenceAvatar(idealDogSpecs);
      
      expect(reference).toBeDefined();
      expect(reference.add).toBeDefined(); // Should be a THREE.Group
    });
  });

  describe('Realism Quality Metrics', () => {
    it('should measure anatomical correctness', () => {
      const { body, head, snout, legs } = idealDogSpecs;
      
      // Head-to-body ratio should be realistic
      const headToBodyRatio = head.diameter / body.width;
      expect(headToBodyRatio).toBeGreaterThan(0.6);
      expect(headToBodyRatio).toBeLessThan(1.0);
      
      // Snout-to-head ratio should be realistic
      const snoutToHeadRatio = snout.length / head.diameter;
      expect(snoutToHeadRatio).toBeGreaterThan(0.4);
      expect(snoutToHeadRatio).toBeLessThan(0.6);
      
      // Leg-to-body ratio should support body
      const legToBodyRatio = legs[0].length / body.height;
      expect(legToBodyRatio).toBeGreaterThan(0.4);
      expect(legToBodyRatio).toBeLessThan(0.6);
    });

    it('should validate proportional scaling', () => {
      const specs = idealDogSpecs;
      
      // All components should be proportionally scaled
      expect(specs.chest.width).toBeLessThan(specs.body.width);
      expect(specs.snout.tipWidth).toBeLessThan(specs.snout.baseWidth);
      expect(specs.paws[0].diameter).toBeLessThan(specs.legs[0].width * 2);
    });

    it('should ensure natural positioning', () => {
      const { body, head, snout, chest, legs, paws } = idealDogSpecs;
      
      // Head should be above body
      expect(head.position[1]).toBeGreaterThan(body.position[1]);
      
      // Snout should be forward of head
      expect(snout.position[2]).toBeGreaterThan(head.position[2]);
      
      // Chest should be forward of body center
      expect(chest.position[2]).toBeGreaterThan(body.position[2]);
      
      // Legs should support body (below body, above paws)
      legs.forEach((leg, index) => {
        expect(leg.position[1]).toBeLessThan(body.position[1]);
        expect(leg.position[1]).toBeGreaterThan(paws[index].position[1]);
      });
    });
  });
}); 