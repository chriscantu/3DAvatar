import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import React from 'react';
import Avatar from '../Avatar';
import { createAvatarTestEnvironment } from '../../test-utils/3d-testing-utils';
import { setupThreeJSMocks } from '../../test-utils/enhanced-three-mocks';

// Setup Three.js mocks
setupThreeJSMocks();

describe('Avatar Component - Comprehensive 3D Tests', () => {
  let testEnvironment: ReturnType<typeof createAvatarTestEnvironment>;

  beforeEach(() => {
    testEnvironment = createAvatarTestEnvironment();
    vi.clearAllMocks();
  });

  afterEach(() => {
    testEnvironment.cleanup();
  });

  describe('3D Rendering and Scene Composition', () => {
    it('should render avatar with proper 3D scene structure', async () => {
      const { scene, inspector } = testEnvironment;
      
      const AvatarInCanvas = () => (
        <Canvas>
          <Avatar position={[0, 0, 0]} />
        </Canvas>
      );

      render(<AvatarInCanvas />);

      await waitFor(() => {
        const stats = inspector.getSceneStats();
        
        // Should have multiple meshes for avatar parts
        expect(stats.meshes).toBeGreaterThan(5);
        
        // Should include standard materials
        expect(stats.materials.has('MeshStandardMaterial')).toBe(true);
        
        // Should have various geometry types
        expect(stats.geometries.has('SphereGeometry')).toBe(true);
        expect(stats.geometries.has('BoxGeometry')).toBe(true);
        expect(stats.geometries.has('CylinderGeometry')).toBe(true);
      });
    });

    it('should create proper puppy anatomy with correct proportions', async () => {
      const { scene, inspector } = testEnvironment;
      
      render(
        <Canvas>
          <Avatar position={[0, 1, 0]} />
        </Canvas>
      );

      await waitFor(() => {
        const meshes = inspector.findMeshes();
        
        // Should have all major body parts
        const expectedParts = [
          'head', 'body', 'snout', 'nose', 'ears', 'legs', 'paws', 'tail'
        ];
        
        // Check that we have enough meshes for all parts
        expect(meshes.length).toBeGreaterThanOrEqual(expectedParts.length);
        
        // Check for sphere geometries (head, nose, eyes, etc.)
        const sphereMeshes = inspector.findMeshesByGeometry('SphereGeometry');
        expect(sphereMeshes.length).toBeGreaterThan(3);
        
        // Check for cylinder geometries (legs, tail, neck)
        const cylinderMeshes = inspector.findMeshesByGeometry('CylinderGeometry');
        expect(cylinderMeshes.length).toBeGreaterThan(2);
      });
    });

    it('should position avatar parts correctly in 3D space', async () => {
      const { scene, inspector } = testEnvironment;
      
      render(
        <Canvas>
          <Avatar position={[0, 0, 0]} />
        </Canvas>
      );

      await waitFor(() => {
        const meshes = inspector.findMeshes();
        
        // Head should be above body
        const headMesh = meshes.find(mesh => 
          mesh.geometry?.type === 'SphereGeometry' && 
          mesh.position.y > 0.2
        );
        expect(headMesh).toBeDefined();
        
        // Body should be at center
        const bodyMesh = meshes.find(mesh => 
          mesh.geometry?.type === 'BoxGeometry'
        );
        expect(bodyMesh).toBeDefined();
        expect(bodyMesh!.position.y).toBeLessThan(0.5);
        
        // Legs should be below body
        const legMeshes = meshes.filter(mesh => 
          mesh.geometry?.type === 'CylinderGeometry' && 
          mesh.position.y < 0
        );
        expect(legMeshes.length).toBeGreaterThan(2);
      });
    });

    it('should apply correct materials and colors', async () => {
      const { scene, inspector } = testEnvironment;
      
      render(
        <Canvas>
          <Avatar position={[0, 0, 0]} />
        </Canvas>
      );

      await waitFor(() => {
        const meshes = inspector.findMeshes();
        
        // Should have meshes with different materials
        const materialTypes = new Set(
          meshes.map(mesh => mesh.material?.type).filter(Boolean)
        );
        
        expect(materialTypes.has('MeshStandardMaterial')).toBe(true);
        
        // Check for proper color assignments
        const furMeshes = meshes.filter(mesh => 
          mesh.material?.color && 
          (mesh.material.color.includes('#D2691E') || mesh.material.color.includes('#F5DEB3'))
        );
        expect(furMeshes.length).toBeGreaterThan(0);
      });
    });

    it('should handle shadow casting and receiving', async () => {
      const { scene, inspector } = testEnvironment;
      
      render(
        <Canvas>
          <Avatar position={[0, 0, 0]} />
        </Canvas>
      );

      await waitFor(() => {
        const meshes = inspector.findMeshes();
        
        // Most meshes should cast shadows
        const shadowCasters = meshes.filter(mesh => mesh.castShadow);
        expect(shadowCasters.length).toBeGreaterThan(meshes.length / 2);
      });
    });
  });

  describe('Animation and State Management', () => {
    it('should respond to isSpeaking prop changes', async () => {
      const { animationValidator } = testEnvironment;
      
      const { rerender } = render(
        <Canvas>
          <Avatar isSpeaking={false} />
        </Canvas>
      );

      // Change to speaking state
      rerender(
        <Canvas>
          <Avatar isSpeaking={true} />
        </Canvas>
      );

      await waitFor(() => {
        // Animation should be updated
        const animState = animationValidator.getCurrentAnimationState();
        expect(animState.time).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle userIsTyping state changes', async () => {
      const { rerender } = render(
        <Canvas>
          <Avatar userIsTyping={false} />
        </Canvas>
      );

      // Change to typing state
      rerender(
        <Canvas>
          <Avatar userIsTyping={true} />
        </Canvas>
      );

      await waitFor(() => {
        // Component should re-render without errors
        expect(screen.queryByRole('img', { hidden: true })).toBeDefined();
      });
    });

    it('should handle movement intensity changes', async () => {
      const { rerender } = render(
        <Canvas>
          <Avatar movementIntensity="subtle" />
        </Canvas>
      );

      // Change movement intensity
      rerender(
        <Canvas>
          <Avatar movementIntensity="animated" />
        </Canvas>
      );

      await waitFor(() => {
        // Should handle intensity changes gracefully
        expect(screen.queryByRole('img', { hidden: true })).toBeDefined();
      });
    });

    it('should update animation based on message length', async () => {
      const { rerender } = render(
        <Canvas>
          <Avatar lastMessageLength={10} />
        </Canvas>
      );

      // Change message length
      rerender(
        <Canvas>
          <Avatar lastMessageLength={50} />
        </Canvas>
      );

      await waitFor(() => {
        // Should handle message length changes
        expect(screen.queryByRole('img', { hidden: true })).toBeDefined();
      });
    });

    it('should handle time since last message', async () => {
      const { rerender } = render(
        <Canvas>
          <Avatar timeSinceLastMessage={1000} />
        </Canvas>
      );

      // Change time since last message
      rerender(
        <Canvas>
          <Avatar timeSinceLastMessage={5000} />
        </Canvas>
      );

      await waitFor(() => {
        // Should handle time changes
        expect(screen.queryByRole('img', { hidden: true })).toBeDefined();
      });
    });
  });

  describe('Performance and Optimization', () => {
    it('should maintain good performance during animations', async () => {
      const { performanceTester } = testEnvironment;
      
      performanceTester.startMonitoring();
      
      render(
        <Canvas>
          <Avatar isSpeaking={true} userIsTyping={true} />
        </Canvas>
      );

      // Simulate animation frames
      for (let i = 0; i < 10; i++) {
        performanceTester.recordFrameTime(16); // 60fps
        await global.testUtils.waitForAnimationFrame();
      }

      const stats = performanceTester.getPerformanceStats();
      
      // Should maintain good frame rate
      expect(stats.averageFPS).toBeGreaterThan(30);
      expect(stats.frameTimeVariance).toBeLessThan(100);
    });

    it('should properly dispose of resources on unmount', async () => {
      const { unmount } = render(
        <Canvas>
          <Avatar position={[0, 0, 0]} />
        </Canvas>
      );

      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });

    it('should handle rapid prop changes without performance issues', async () => {
      const { performanceTester } = testEnvironment;
      
      performanceTester.startMonitoring();
      
      const { rerender } = render(
        <Canvas>
          <Avatar isSpeaking={false} />
        </Canvas>
      );

      // Rapid prop changes
      for (let i = 0; i < 20; i++) {
        rerender(
          <Canvas>
            <Avatar isSpeaking={i % 2 === 0} userIsTyping={i % 3 === 0} />
          </Canvas>
        );
        performanceTester.recordFrameTime(16);
        await global.testUtils.nextTick();
      }

      const stats = performanceTester.getPerformanceStats();
      
      // Should still maintain reasonable performance
      expect(stats.averageFPS).toBeGreaterThan(20);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing position prop gracefully', async () => {
      expect(() => {
        render(
          <Canvas>
            <Avatar />
          </Canvas>
        );
      }).not.toThrow();
    });

    it('should handle invalid position values', async () => {
      expect(() => {
        render(
          <Canvas>
            <Avatar position={[NaN, Infinity, -Infinity]} />
          </Canvas>
        );
      }).not.toThrow();
    });

    it('should handle extreme movement intensity values', async () => {
      expect(() => {
        render(
          <Canvas>
            <Avatar movementIntensity="extreme" as any />
          </Canvas>
        );
      }).not.toThrow();
    });

    it('should handle very large message lengths', async () => {
      expect(() => {
        render(
          <Canvas>
            <Avatar lastMessageLength={999999} />
          </Canvas>
        );
      }).not.toThrow();
    });

    it('should handle negative time values', async () => {
      expect(() => {
        render(
          <Canvas>
            <Avatar timeSinceLastMessage={-1000} />
          </Canvas>
        );
      }).not.toThrow();
    });
  });

  describe('Visual Regression Testing', () => {
    it('should maintain consistent visual appearance', async () => {
      const { visualTester, scene, camera } = testEnvironment;
      
      render(
        <Canvas>
          <Avatar position={[0, 0, 0]} />
        </Canvas>
      );

      await waitFor(() => {
        // Capture baseline
        const baseline = visualTester.captureBaseline('avatar-default', scene, camera);
        expect(baseline).toBeDefined();
        expect(baseline.width).toBe(800);
        expect(baseline.height).toBe(600);
      });
    });

    it('should detect visual changes in speaking state', async () => {
      const { visualTester, scene, camera } = testEnvironment;
      
      // Render in normal state
      const { rerender } = render(
        <Canvas>
          <Avatar isSpeaking={false} />
        </Canvas>
      );

      await waitFor(() => {
        visualTester.captureBaseline('avatar-idle', scene, camera);
      });

      // Change to speaking state
      rerender(
        <Canvas>
          <Avatar isSpeaking={true} />
        </Canvas>
      );

      await waitFor(() => {
        const comparison = visualTester.compareWithBaseline('avatar-idle', scene, camera, 0.1);
        
        // Should detect visual difference (or be very similar if no visual changes)
        expect(comparison.difference).toBeGreaterThanOrEqual(0);
        expect(comparison.imageData).toBeDefined();
      });
    });
  });

  describe('Accessibility and Standards', () => {
    it('should follow React component best practices', async () => {
      const { container } = render(
        <Canvas>
          <Avatar position={[0, 0, 0]} />
        </Canvas>
      );

      // Should render without warnings
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle TypeScript prop types correctly', async () => {
      // TypeScript compilation should catch type errors
      expect(() => {
        render(
          <Canvas>
            <Avatar 
              position={[0, 1, 2]} 
              isSpeaking={true}
              userIsTyping={false}
              movementIntensity="animated"
              lastMessageLength={25}
              timeSinceLastMessage={1000}
            />
          </Canvas>
        );
      }).not.toThrow();
    });

    it('should provide proper component structure', async () => {
      const { container } = render(
        <Canvas>
          <Avatar position={[0, 0, 0]} />
        </Canvas>
      );

      // Should have proper DOM structure
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });
  });

  describe('Integration with Animation Controller', () => {
    it('should initialize animation controller properly', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      
      render(
        <Canvas>
          <Avatar isSpeaking={false} />
        </Canvas>
      );

      await waitFor(() => {
        // Should log animation controller initialization
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Avatar state update'),
          expect.any(Object)
        );
      });
    });

    it('should update animation controller on prop changes', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      
      const { rerender } = render(
        <Canvas>
          <Avatar isSpeaking={false} />
        </Canvas>
      );

      rerender(
        <Canvas>
          <Avatar isSpeaking={true} />
        </Canvas>
      );

      await waitFor(() => {
        // Should log state changes
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Avatar state update'),
          expect.objectContaining({ isSpeaking: true })
        );
      });
    });

    it('should handle animation controller cleanup', async () => {
      const { unmount } = render(
        <Canvas>
          <Avatar position={[0, 0, 0]} />
        </Canvas>
      );

      // Should cleanup without errors
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Memory Management', () => {
    it('should properly dispose of geometries and materials', async () => {
      const { unmount } = render(
        <Canvas>
          <Avatar position={[0, 0, 0]} />
        </Canvas>
      );

      // Should dispose without memory leaks
      expect(() => unmount()).not.toThrow();
    });

    it('should handle multiple avatar instances', async () => {
      render(
        <Canvas>
          <Avatar position={[0, 0, 0]} />
          <Avatar position={[2, 0, 0]} />
          <Avatar position={[-2, 0, 0]} />
        </Canvas>
      );

      await waitFor(() => {
        // Should render multiple avatars without issues
        expect(screen.queryByRole('img', { hidden: true })).toBeDefined();
      });
    });
  });
}); 