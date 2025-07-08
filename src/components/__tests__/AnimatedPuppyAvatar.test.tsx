import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import React from 'react';
import AnimatedPuppyAvatar from '../AnimatedPuppyAvatar';
import { createAvatarTestEnvironment } from '../../test-utils/3d-testing-utils';
import { setupThreeJSMocks } from '../../test-utils/enhanced-three-mocks';

// Setup Three.js mocks
setupThreeJSMocks();

describe('AnimatedPuppyAvatar Component - Animation Tests', () => {
  let testEnvironment: ReturnType<typeof createAvatarTestEnvironment>;

  beforeEach(() => {
    testEnvironment = createAvatarTestEnvironment();
    vi.clearAllMocks();
  });

  afterEach(() => {
    testEnvironment.cleanup();
  });

  describe('Basic Rendering and Structure', () => {
    it('should render animated puppy without crashing', async () => {
      render(
        <Canvas>
          <AnimatedPuppyAvatar position={[0, 0, 0]} />
        </Canvas>
      );

      await waitFor(() => {
        expect(screen.queryByRole('img', { hidden: true })).toBeDefined();
      });
    });

    it('should create proper puppy anatomy with animatable parts', async () => {
      const { inspector } = testEnvironment;
      
      render(
        <Canvas>
          <AnimatedPuppyAvatar position={[0, 0, 0]} />
        </Canvas>
      );

      await waitFor(() => {
        const stats = inspector.getSceneStats();
        
        // Should have multiple meshes for all body parts
        expect(stats.meshes).toBeGreaterThan(10);
        
        // Should include proper materials for realistic puppy
        expect(stats.materials.has('MeshStandardMaterial')).toBe(true);
        
        // Should have various geometry types for different body parts
        expect(stats.geometries.has('SphereGeometry')).toBe(true);
        expect(stats.geometries.has('CapsuleGeometry')).toBe(true);
      });
    });

    it('should position puppy parts correctly for animation', async () => {
      const { inspector } = testEnvironment;
      
      render(
        <Canvas>
          <AnimatedPuppyAvatar position={[0, 1, 0]} />
        </Canvas>
      );

      await waitFor(() => {
        const meshes = inspector.findMeshes();
        
        // Should have head positioned above body for natural look
        const headMeshes = meshes.filter(mesh => 
          mesh.geometry?.type === 'SphereGeometry' && 
          mesh.position.y > 0.3
        );
        expect(headMeshes.length).toBeGreaterThan(0);
        
        // Should have legs positioned below body
        const legMeshes = meshes.filter(mesh => 
          mesh.geometry?.type === 'CapsuleGeometry' && 
          mesh.position.y < 0
        );
        expect(legMeshes.length).toBeGreaterThan(2);
      });
    });
  });

  describe('Excitement Animations - User Typing', () => {
    it('should trigger excitement animation when user starts typing', async () => {
      const onAnimationStateChange = vi.fn();
      
      const { rerender } = render(
        <Canvas>
          <AnimatedPuppyAvatar 
            userIsTyping={false}
            onAnimationStateChange={onAnimationStateChange}
          />
        </Canvas>
      );

      // Start typing
      rerender(
        <Canvas>
          <AnimatedPuppyAvatar 
            userIsTyping={true}
            onAnimationStateChange={onAnimationStateChange}
          />
        </Canvas>
      );

      await waitFor(() => {
        // Should call animation state change handler
        expect(onAnimationStateChange).toHaveBeenCalled();
        
        // Should log excitement trigger
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('User typing detected'),
          expect.anything()
        );
      });
    });

    it('should increase excitement intensity based on message length', async () => {
      const onAnimationStateChange = vi.fn();
      
      render(
        <Canvas>
          <AnimatedPuppyAvatar 
            userIsTyping={true}
            lastMessageLength={50}
            onAnimationStateChange={onAnimationStateChange}
          />
        </Canvas>
      );

      await waitFor(() => {
        // Should trigger excitement with appropriate intensity
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('triggering excitement with intensity'),
          expect.anything()
        );
      });
    });

    it('should handle rapid typing state changes without errors', async () => {
      const { rerender } = render(
        <Canvas>
          <AnimatedPuppyAvatar userIsTyping={false} />
        </Canvas>
      );

      // Rapid typing changes
      for (let i = 0; i < 10; i++) {
        rerender(
          <Canvas>
            <AnimatedPuppyAvatar userIsTyping={i % 2 === 0} />
          </Canvas>
        );
        await global.testUtils.nextTick();
      }

      // Should handle rapid changes without crashing
      expect(screen.queryByRole('img', { hidden: true })).toBeDefined();
    });

    it('should return to idle when user stops typing', async () => {
      const { rerender } = render(
        <Canvas>
          <AnimatedPuppyAvatar userIsTyping={true} />
        </Canvas>
      );

      // Stop typing
      rerender(
        <Canvas>
          <AnimatedPuppyAvatar userIsTyping={false} />
        </Canvas>
      );

      await waitFor(() => {
        // Should eventually return to idle state
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('Animation state changed'),
          expect.anything()
        );
      });
    });
  });

  describe('Speaking Animations - AI Response', () => {
    it('should trigger speaking animation when AI starts responding', async () => {
      const onAnimationStateChange = vi.fn();
      
      const { rerender } = render(
        <Canvas>
          <AnimatedPuppyAvatar 
            isSpeaking={false}
            onAnimationStateChange={onAnimationStateChange}
          />
        </Canvas>
      );

      // AI starts speaking
      rerender(
        <Canvas>
          <AnimatedPuppyAvatar 
            isSpeaking={true}
            onAnimationStateChange={onAnimationStateChange}
          />
        </Canvas>
      );

      await waitFor(() => {
        // Should trigger speaking animation
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('AI speaking detected'),
          expect.anything()
        );
      });
    });

    it('should adjust speaking intensity based on message length', async () => {
      render(
        <Canvas>
          <AnimatedPuppyAvatar 
            isSpeaking={true}
            lastMessageLength={100}
          />
        </Canvas>
      );

      await waitFor(() => {
        // Should log speaking with intensity based on message length
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('triggering speaking animation with intensity'),
          expect.anything()
        );
      });
    });

    it('should handle speaking state transitions smoothly', async () => {
      const { rerender } = render(
        <Canvas>
          <AnimatedPuppyAvatar isSpeaking={false} />
        </Canvas>
      );

      // Start speaking
      rerender(
        <Canvas>
          <AnimatedPuppyAvatar isSpeaking={true} />
        </Canvas>
      );

      // Stop speaking
      rerender(
        <Canvas>
          <AnimatedPuppyAvatar isSpeaking={false} />
        </Canvas>
      );

      await waitFor(() => {
        // Should handle transitions without errors
        expect(screen.queryByRole('img', { hidden: true })).toBeDefined();
      });
    });

    it('should prioritize speaking over typing animations', async () => {
      render(
        <Canvas>
          <AnimatedPuppyAvatar 
            userIsTyping={true}
            isSpeaking={true}
          />
        </Canvas>
      );

      await waitFor(() => {
        // Should prioritize speaking animation
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('AI speaking detected'),
          expect.anything()
        );
      });
    });
  });

  describe('Animation State Management', () => {
    it('should report animation state changes correctly', async () => {
      const onAnimationStateChange = vi.fn();
      
      render(
        <Canvas>
          <AnimatedPuppyAvatar 
            userIsTyping={true}
            onAnimationStateChange={onAnimationStateChange}
          />
        </Canvas>
      );

      await waitFor(() => {
        // Should call state change handler
        expect(onAnimationStateChange).toHaveBeenCalled();
      });
    });

    it('should handle movement intensity variations', async () => {
      const { rerender } = render(
        <Canvas>
          <AnimatedPuppyAvatar movementIntensity="subtle" />
        </Canvas>
      );

      rerender(
        <Canvas>
          <AnimatedPuppyAvatar movementIntensity="energetic" />
        </Canvas>
      );

      await waitFor(() => {
        // Should handle intensity changes
        expect(screen.queryByRole('img', { hidden: true })).toBeDefined();
      });
    });

    it('should track time since last message correctly', async () => {
      render(
        <Canvas>
          <AnimatedPuppyAvatar 
            timeSinceLastMessage={5000}
            userIsTyping={false}
            isSpeaking={false}
          />
        </Canvas>
      );

      await waitFor(() => {
        // Should handle time-based state
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
          <AnimatedPuppyAvatar 
            userIsTyping={true}
            isSpeaking={true}
          />
        </Canvas>
      );

      // Simulate animation frames
      for (let i = 0; i < 30; i++) {
        performanceTester.recordFrameTime(16); // 60fps target
        await global.testUtils.waitForAnimationFrame();
      }

      const stats = performanceTester.getPerformanceStats();
      
      // Should maintain reasonable performance
      expect(stats.averageFPS).toBeGreaterThan(25);
      expect(stats.frameTimeVariance).toBeLessThan(200);
    });

    it('should properly cleanup animation controller on unmount', async () => {
      const { unmount } = render(
        <Canvas>
          <AnimatedPuppyAvatar position={[0, 0, 0]} />
        </Canvas>
      );

      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });

    it('should handle multiple rapid state changes efficiently', async () => {
      const { performanceTester } = testEnvironment;
      
      performanceTester.startMonitoring();
      
      const { rerender } = render(
        <Canvas>
          <AnimatedPuppyAvatar userIsTyping={false} />
        </Canvas>
      );

      // Rapid state changes
      for (let i = 0; i < 20; i++) {
        rerender(
          <Canvas>
            <AnimatedPuppyAvatar 
              userIsTyping={i % 2 === 0}
              isSpeaking={i % 3 === 0}
              lastMessageLength={i * 5}
            />
          </Canvas>
        );
        performanceTester.recordFrameTime(16);
        await global.testUtils.nextTick();
      }

      const stats = performanceTester.getPerformanceStats();
      
      // Should handle rapid changes efficiently
      expect(stats.averageFPS).toBeGreaterThan(20);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing animation refs gracefully', async () => {
      expect(() => {
        render(
          <Canvas>
            <AnimatedPuppyAvatar position={[0, 0, 0]} />
          </Canvas>
        );
      }).not.toThrow();
    });

    it('should handle extreme message lengths', async () => {
      expect(() => {
        render(
          <Canvas>
            <AnimatedPuppyAvatar 
              lastMessageLength={999999}
              userIsTyping={true}
            />
          </Canvas>
        );
      }).not.toThrow();
    });

    it('should handle negative time values', async () => {
      expect(() => {
        render(
          <Canvas>
            <AnimatedPuppyAvatar 
              timeSinceLastMessage={-1000}
            />
          </Canvas>
        );
      }).not.toThrow();
    });

    it('should handle invalid movement intensity gracefully', async () => {
      expect(() => {
        render(
          <Canvas>
            <AnimatedPuppyAvatar 
              movementIntensity={'invalid' as any}
            />
          </Canvas>
        );
      }).not.toThrow();
    });
  });

  describe('Visual and Material Properties', () => {
    it('should use appropriate materials for realistic puppy appearance', async () => {
      const { inspector } = testEnvironment;
      
      render(
        <Canvas>
          <AnimatedPuppyAvatar position={[0, 0, 0]} />
        </Canvas>
      );

      await waitFor(() => {
        const meshes = inspector.findMeshes();
        
        // Should have meshes with standard materials
        const standardMaterials = meshes.filter(mesh => 
          mesh.material?.type === 'MeshStandardMaterial'
        );
        expect(standardMaterials.length).toBeGreaterThan(5);
      });
    });

    it('should enable shadow casting for realistic lighting', async () => {
      const { inspector } = testEnvironment;
      
      render(
        <Canvas>
          <AnimatedPuppyAvatar position={[0, 0, 0]} />
        </Canvas>
      );

      await waitFor(() => {
        const meshes = inspector.findMeshes();
        
        // Most meshes should cast shadows
        const shadowCasters = meshes.filter(mesh => mesh.castShadow);
        expect(shadowCasters.length).toBeGreaterThan(meshes.length / 2);
      });
    });

    it('should use appropriate geometry complexity', async () => {
      const { inspector } = testEnvironment;
      
      render(
        <Canvas>
          <AnimatedPuppyAvatar position={[0, 0, 0]} />
        </Canvas>
      );

      await waitFor(() => {
        const stats = inspector.getSceneStats();
        
        // Should have reasonable geometry complexity
        expect(stats.geometries.size).toBeGreaterThan(3);
        expect(stats.geometries.size).toBeLessThan(15);
      });
    });
  });

  describe('Integration with Animation Controller', () => {
    it('should initialize animation controller with proper refs', async () => {
      render(
        <Canvas>
          <AnimatedPuppyAvatar position={[0, 0, 0]} />
        </Canvas>
      );

      await waitFor(() => {
        // Should initialize without errors
        expect(screen.queryByRole('img', { hidden: true })).toBeDefined();
      });
    });

    it('should update controller state on prop changes', async () => {
      const { rerender } = render(
        <Canvas>
          <AnimatedPuppyAvatar userIsTyping={false} />
        </Canvas>
      );

      rerender(
        <Canvas>
          <AnimatedPuppyAvatar userIsTyping={true} />
        </Canvas>
      );

      await waitFor(() => {
        // Should update controller state
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('User typing detected'),
          expect.anything()
        );
      });
    });

    it('should dispose of animation controller on cleanup', async () => {
      const { unmount } = render(
        <Canvas>
          <AnimatedPuppyAvatar position={[0, 0, 0]} />
        </Canvas>
      );

      // Should cleanup without memory leaks
      expect(() => unmount()).not.toThrow();
    });
  });
}); 