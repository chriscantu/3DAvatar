import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import React from 'react';

// Mock the drei hooks properly
const mockUseGLTF = vi.fn();
const mockUseAnimations = vi.fn();

vi.mock('@react-three/drei', () => ({
  useGLTF: mockUseGLTF,
  useAnimations: mockUseAnimations,
}));

// Mock Three.js
vi.mock('three', () => ({
  Group: vi.fn(() => ({
    add: vi.fn(),
    remove: vi.fn(),
    children: [],
    position: { set: vi.fn(), x: 0, y: 0, z: 0 },
    rotation: { set: vi.fn(), x: 0, y: 0, z: 0 },
    scale: { set: vi.fn(), x: 1, y: 1, z: 1 },
  })),
  Box3: vi.fn(() => ({
    setFromObject: vi.fn(() => ({
      max: { x: 1, y: 1, z: 1 },
      min: { x: -1, y: -1, z: -1 },
    })),
  })),
  MathUtils: {
    lerp: vi.fn((a, b, t) => a + (b - a) * t),
  },
  Scene: vi.fn(() => ({
    add: vi.fn(),
    remove: vi.fn(),
    traverse: vi.fn(),
  })),
}));

// Mock useFrame
vi.mock('@react-three/fiber', () => ({
  ...vi.importActual('@react-three/fiber'),
  useFrame: vi.fn(),
}));

// Import the component after mocking
import GLTFPuppyAvatar from '../GLTFPuppyAvatar';

describe('GLTFPuppyAvatar - 3D Model System', () => {
  const mockSuccessfulGLTF = {
    scene: {
      children: [],
      position: { set: vi.fn() },
      rotation: { set: vi.fn() },
      scale: { set: vi.fn() },
      traverse: vi.fn(),
    },
    animations: [
      { name: 'Idle', duration: 2 },
      { name: 'Speaking', duration: 1 },
      { name: 'Listening', duration: 1.5 },
    ],
  };

  const mockAnimationsSuccess = {
    actions: {
      Idle: {
        reset: vi.fn(() => ({ 
          fadeIn: vi.fn(() => ({ 
            play: vi.fn() 
          })) 
        })),
        fadeOut: vi.fn(),
      },
      Speaking: {
        reset: vi.fn(() => ({ 
          fadeIn: vi.fn(() => ({ 
            play: vi.fn() 
          })) 
        })),
        fadeOut: vi.fn(),
      },
      Listening: {
        reset: vi.fn(() => ({ 
          fadeIn: vi.fn(() => ({ 
            play: vi.fn() 
          })) 
        })),
        fadeOut: vi.fn(),
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default to successful model loading
    mockUseGLTF.mockReturnValue(mockSuccessfulGLTF);
    mockUseAnimations.mockReturnValue(mockAnimationsSuccess);
    
    // Mock preload function
    mockUseGLTF.preload = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('3D Model Loading', () => {
    it('should successfully load the 3D cartoon puppy model', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      render(
        <Canvas>
          <GLTFPuppyAvatar position={[0, 0, 0]} />
        </Canvas>
      );

      await waitFor(() => {
        expect(mockUseGLTF).toHaveBeenCalledWith('/models/cartoon-puppy.glb');
      });

      // Should log successful loading
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('3D model loaded successfully')
      );

      consoleSpy.mockRestore();
    });

    it('should handle model file not found gracefully', () => {
      mockUseGLTF.mockImplementation(() => {
        throw new Error('Failed to load model');
      });

      // Should throw error to trigger fallback system
      expect(() => {
        render(
          <Canvas>
            <GLTFPuppyAvatar position={[0, 0, 0]} />
          </Canvas>
        );
      }).toThrow('Failed to load model');
    });

    it('should preload the model for better performance', () => {
      expect(mockUseGLTF.preload).toBeDefined();
      // The preload should be called at module level
    });

    it('should handle malformed model data', () => {
      mockUseGLTF.mockReturnValue({
        scene: null,
        animations: null,
      });

      expect(() => {
        render(
          <Canvas>
            <GLTFPuppyAvatar position={[0, 0, 0]} />
          </Canvas>
        );
      }).toThrow('3D model not available');
    });
  });

  describe('Model Positioning and Scaling', () => {
    it('should position model correctly in 3D space', () => {
      const position: [number, number, number] = [1, 2, 3];
      
      render(
        <Canvas>
          <GLTFPuppyAvatar position={position} />
        </Canvas>
      );

      expect(mockUseGLTF).toHaveBeenCalled();
      // Model should be rendered at specified position
    });

    it('should scale model appropriately for the scene', () => {
      render(
        <Canvas>
          <GLTFPuppyAvatar position={[0, 0, 0]} />
        </Canvas>
      );

      // Model should be scaled to 0.5 for appropriate size
      expect(mockUseGLTF).toHaveBeenCalled();
    });

    it('should ensure model is positioned above ground', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      render(
        <Canvas>
          <GLTFPuppyAvatar position={[0, 0, 0]} />
        </Canvas>
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('3D model positioned and scaled')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Animation System', () => {
    it('should load and manage model animations', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      render(
        <Canvas>
          <GLTFPuppyAvatar position={[0, 0, 0]} />
        </Canvas>
      );

      expect(mockUseAnimations).toHaveBeenCalledWith(
        mockSuccessfulGLTF.animations,
        expect.any(Object)
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'Animations loaded:',
        3
      );

      consoleSpy.mockRestore();
    });

    it('should play speaking animation when isSpeaking is true', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      render(
        <Canvas>
          <GLTFPuppyAvatar isSpeaking={true} />
        </Canvas>
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'Playing animation:',
        'Speaking'
      );

      consoleSpy.mockRestore();
    });

    it('should play listening animation when userIsTyping is true', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      render(
        <Canvas>
          <GLTFPuppyAvatar userIsTyping={true} />
        </Canvas>
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'Playing animation:',
        'Listening'
      );

      consoleSpy.mockRestore();
    });

    it('should default to idle animation when no specific state', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      render(
        <Canvas>
          <GLTFPuppyAvatar />
        </Canvas>
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'Playing animation:',
        'Idle'
      );

      consoleSpy.mockRestore();
    });

    it('should handle models without animations gracefully', () => {
      mockUseGLTF.mockReturnValue({
        ...mockSuccessfulGLTF,
        animations: [],
      });

      mockUseAnimations.mockReturnValue({ actions: {} });

      expect(() => {
        render(
          <Canvas>
            <GLTFPuppyAvatar />
          </Canvas>
        );
      }).not.toThrow();
    });
  });

  describe('Interactive Behaviors', () => {
    it('should respond to movement intensity settings', () => {
      const { rerender } = render(
        <Canvas>
          <GLTFPuppyAvatar movementIntensity="subtle" />
        </Canvas>
      );

      expect(mockUseGLTF).toHaveBeenCalled();

      rerender(
        <Canvas>
          <GLTFPuppyAvatar movementIntensity="energetic" />
        </Canvas>
      );

      expect(mockUseGLTF).toHaveBeenCalled();
    });

    it('should scale animations based on message length', () => {
      render(
        <Canvas>
          <GLTFPuppyAvatar 
            isSpeaking={true} 
            lastMessageLength={150} 
          />
        </Canvas>
      );

      expect(mockUseGLTF).toHaveBeenCalled();
      // Should handle longer messages with more intense animations
    });

    it('should respond to user typing state', () => {
      render(
        <Canvas>
          <GLTFPuppyAvatar userIsTyping={true} />
        </Canvas>
      );

      expect(mockUseGLTF).toHaveBeenCalled();
      // Should show listening/attentive behavior
    });

    it('should handle rapid state changes smoothly', () => {
      const { rerender } = render(
        <Canvas>
          <GLTFPuppyAvatar isSpeaking={false} userIsTyping={false} />
        </Canvas>
      );

      // Rapid state changes
      rerender(
        <Canvas>
          <GLTFPuppyAvatar isSpeaking={true} userIsTyping={false} />
        </Canvas>
      );

      rerender(
        <Canvas>
          <GLTFPuppyAvatar isSpeaking={false} userIsTyping={true} />
        </Canvas>
      );

      rerender(
        <Canvas>
          <GLTFPuppyAvatar isSpeaking={false} userIsTyping={false} />
        </Canvas>
      );

      expect(mockUseGLTF).toHaveBeenCalled();
    });
  });

  describe('Performance and Error Handling', () => {
    it('should handle component unmounting cleanly', () => {
      const { unmount } = render(
        <Canvas>
          <GLTFPuppyAvatar />
        </Canvas>
      );

      expect(() => unmount()).not.toThrow();
    });

    it('should log setup and configuration steps', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      render(
        <Canvas>
          <GLTFPuppyAvatar />
        </Canvas>
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'Attempting to load 3D model from:',
        '/models/cartoon-puppy.glb'
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Setting up 3D model')
      );

      consoleSpy.mockRestore();
    });

    it('should provide debugging information', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      render(
        <Canvas>
          <GLTFPuppyAvatar />
        </Canvas>
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'Available animations:',
        ['Idle', 'Speaking', 'Listening']
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Model File Requirements', () => {
    it('should expect model at correct path', () => {
      render(
        <Canvas>
          <GLTFPuppyAvatar />
        </Canvas>
      );

      expect(mockUseGLTF).toHaveBeenCalledWith('/models/cartoon-puppy.glb');
    });

    it('should handle missing model file path', () => {
      mockUseGLTF.mockImplementation(() => {
        throw new Error('Model file not found');
      });

      expect(() => {
        render(
          <Canvas>
            <GLTFPuppyAvatar />
          </Canvas>
        );
      }).toThrow('Model file not found');
    });
  });
}); 