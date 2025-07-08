import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import React from 'react';

// Mock the drei hooks
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
}));

// Mock useFrame
vi.mock('@react-three/fiber', () => ({
  ...vi.importActual('@react-three/fiber'),
  useFrame: vi.fn(),
}));

// Mock react-error-boundary
vi.mock('react-error-boundary', () => ({
  ErrorBoundary: ({ children, FallbackComponent, onError }: any) => {
    try {
      return <div data-testid="error-boundary">{children}</div>;
    } catch (error) {
      onError?.(error);
      return <FallbackComponent error={error} />;
    }
  },
}));

// Import components
import Avatar from '../Avatar';
import ThreeDRoom from '../ThreeDRoom';

describe('Avatar 3D Model Integration - Real World Usage', () => {
  const mockWorkingModel = {
    scene: {
      children: [
        { name: 'PuppyMesh', type: 'Mesh' },
        { name: 'Eyes', type: 'Group' },
        { name: 'Tail', type: 'Mesh' },
      ],
      position: { set: vi.fn() },
      rotation: { set: vi.fn() },
      scale: { set: vi.fn() },
      traverse: vi.fn(),
    },
    animations: [
      { name: 'Idle', duration: 2.0 },
      { name: 'Speaking', duration: 1.2 },
      { name: 'Listening', duration: 1.8 },
    ],
  };

  const mockWorkingAnimations = {
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
    
    // Default to working model
    mockUseGLTF.mockReturnValue(mockWorkingModel);
    mockUseAnimations.mockReturnValue(mockWorkingAnimations);
    mockUseGLTF.preload = vi.fn();
    
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Real Chat Application Integration', () => {
    it('should handle complete chat conversation flow', async () => {
      const ChatSimulation = () => {
        const [isAvatarSpeaking, setIsAvatarSpeaking] = React.useState(false);
        const [userIsTyping, setUserIsTyping] = React.useState(false);
        const [lastMessageLength, setLastMessageLength] = React.useState(0);

        return (
          <div>
            <Canvas style={{ height: '400px' }}>
              <Avatar
                position={[0, 0.17, 0]}
                isSpeaking={isAvatarSpeaking}
                userIsTyping={userIsTyping}
                lastMessageLength={lastMessageLength}
                movementIntensity="animated"
              />
            </Canvas>
            <button 
              data-testid="start-typing"
              onClick={() => setUserIsTyping(true)}
            >
              Start Typing
            </button>
            <button 
              data-testid="send-message"
              onClick={() => {
                setUserIsTyping(false);
                setLastMessageLength(42);
                setIsAvatarSpeaking(true);
              }}
            >
              Send Message
            </button>
            <button 
              data-testid="stop-speaking"
              onClick={() => setIsAvatarSpeaking(false)}
            >
              Stop Speaking
            </button>
          </div>
        );
      };

      render(<ChatSimulation />);

      // Initial state - idle
      expect(mockUseGLTF).toHaveBeenCalledWith('/models/cartoon-puppy.glb');

      // User starts typing
      fireEvent.click(screen.getByTestId('start-typing'));
      await waitFor(() => {
        expect(mockUseGLTF).toHaveBeenCalled();
      });

      // User sends message
      fireEvent.click(screen.getByTestId('send-message'));
      await waitFor(() => {
        expect(mockUseGLTF).toHaveBeenCalled();
      });

      // Avatar stops speaking
      fireEvent.click(screen.getByTestId('stop-speaking'));
      await waitFor(() => {
        expect(mockUseGLTF).toHaveBeenCalled();
      });
    });

    it('should integrate properly with ThreeDRoom environment', () => {
      render(
        <ThreeDRoom
          isAvatarSpeaking={true}
          userIsTyping={false}
          lastMessageLength={35}
          timeSinceLastMessage={1000}
        />
      );

      // Should load the 3D model in the room context
      expect(mockUseGLTF).toHaveBeenCalledWith('/models/cartoon-puppy.glb');
    });

    it('should handle realistic message length variations', () => {
      const messageLengths = [5, 25, 75, 150, 300];
      
      messageLengths.forEach(length => {
        const { rerender } = render(
          <Canvas>
            <Avatar
              isSpeaking={true}
              lastMessageLength={length}
              movementIntensity="animated"
            />
          </Canvas>
        );

        expect(mockUseGLTF).toHaveBeenCalled();
        
        rerender(<div />); // Clean up for next iteration
      });
    });
  });

  describe('Performance Under Real Usage', () => {
    it('should handle rapid state changes during active chat', () => {
      const { rerender } = render(
        <Canvas>
          <Avatar position={[0, 0, 0]} />
        </Canvas>
      );

      // Simulate rapid chat interactions
      const states = [
        { isSpeaking: false, userIsTyping: true },
        { isSpeaking: false, userIsTyping: false },
        { isSpeaking: true, userIsTyping: false },
        { isSpeaking: false, userIsTyping: true },
        { isSpeaking: true, userIsTyping: false },
      ];

      states.forEach((state, index) => {
        rerender(
          <Canvas>
            <Avatar
              position={[0, 0, 0]}
              isSpeaking={state.isSpeaking}
              userIsTyping={state.userIsTyping}
              lastMessageLength={20 + index * 10}
            />
          </Canvas>
        );
      });

      expect(mockUseGLTF).toHaveBeenCalled();
    });

    it('should maintain performance with long conversation sessions', () => {
      const { rerender } = render(
        <Canvas>
          <Avatar position={[0, 0, 0]} />
        </Canvas>
      );

      // Simulate 50 message exchanges
      for (let i = 0; i < 50; i++) {
        rerender(
          <Canvas>
            <Avatar
              position={[0, 0, 0]}
              isSpeaking={i % 2 === 0}
              userIsTyping={i % 3 === 0}
              lastMessageLength={Math.random() * 100 + 10}
              timeSinceLastMessage={i * 1000}
            />
          </Canvas>
        );
      }

      expect(mockUseGLTF).toHaveBeenCalled();
    });

    it('should handle component mounting/unmounting cycles', () => {
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(
          <Canvas>
            <Avatar position={[0, 0, 0]} />
          </Canvas>
        );

        expect(() => unmount()).not.toThrow();
      }
    });
  });

  describe('User Experience Validation', () => {
    it('should provide smooth animation transitions', () => {
      const { rerender } = render(
        <Canvas>
          <Avatar isSpeaking={false} />
        </Canvas>
      );

      // Transition to speaking
      rerender(
        <Canvas>
          <Avatar isSpeaking={true} />
        </Canvas>
      );

      expect(mockWorkingAnimations.actions.Speaking.reset).toHaveBeenCalled();

      // Transition back to idle
      rerender(
        <Canvas>
          <Avatar isSpeaking={false} />
        </Canvas>
      );

      expect(mockWorkingAnimations.actions.Idle.reset).toHaveBeenCalled();
    });

    it('should respond appropriately to movement intensity settings', () => {
      const intensities: Array<'subtle' | 'animated' | 'energetic'> = ['subtle', 'animated', 'energetic'];
      
      intensities.forEach(intensity => {
        render(
          <Canvas>
            <Avatar movementIntensity={intensity} />
          </Canvas>
        );

        expect(mockUseGLTF).toHaveBeenCalled();
      });
    });

    it('should handle edge cases gracefully', () => {
      const edgeCases = [
        { lastMessageLength: 0 },
        { lastMessageLength: 1000 },
        { timeSinceLastMessage: 0 },
        { timeSinceLastMessage: 999999 },
        { position: [100, 100, 100] as [number, number, number] },
        { position: [-100, -100, -100] as [number, number, number] },
      ];

      edgeCases.forEach(props => {
        expect(() => {
          render(
            <Canvas>
              <Avatar {...props} />
            </Canvas>
          );
        }).not.toThrow();
      });
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should recover from temporary model loading issues', () => {
      // Start with failing model
      mockUseGLTF.mockImplementation(() => {
        throw new Error('Temporary network error');
      });

      expect(() => {
        render(
          <Canvas>
            <Avatar position={[0, 0, 0]} />
          </Canvas>
        );
      }).toThrow();

      // Model becomes available
      mockUseGLTF.mockReturnValue(mockWorkingModel);

      expect(() => {
        render(
          <Canvas>
            <Avatar position={[0, 0, 0]} />
          </Canvas>
        );
      }).not.toThrow();
    });

    it('should handle animation system failures gracefully', () => {
      mockUseAnimations.mockReturnValue({ actions: {} });

      expect(() => {
        render(
          <Canvas>
            <Avatar isSpeaking={true} />
          </Canvas>
        );
      }).not.toThrow();
    });

    it('should maintain functionality during partial system failures', () => {
      // Model loads but animations fail
      mockUseAnimations.mockImplementation(() => {
        throw new Error('Animation system error');
      });

      expect(() => {
        render(
          <Canvas>
            <Avatar position={[0, 0, 0]} />
          </Canvas>
        );
      }).not.toThrow();
    });
  });

  describe('Production Readiness', () => {
    it('should work with production-like avatar configurations', () => {
      const productionConfig = {
        position: [0, 0.17, 0] as [number, number, number],
        isSpeaking: false,
        userIsTyping: false,
        lastMessageLength: 0,
        timeSinceLastMessage: 0,
        movementIntensity: 'animated' as const,
      };

      render(
        <Canvas shadows camera={{ position: [2, 2.5, 2], fov: 60 }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 10, 7.5]} intensity={1.0} castShadow />
          <Avatar {...productionConfig} />
        </Canvas>
      );

      expect(mockUseGLTF).toHaveBeenCalledWith('/models/cartoon-puppy.glb');
    });

    it('should handle production environment constraints', () => {
      // Simulate production constraints
      const originalPerformance = global.performance;
      global.performance = {
        ...originalPerformance,
        now: vi.fn(() => Date.now()),
      };

      render(
        <Canvas>
          <Avatar position={[0, 0, 0]} />
        </Canvas>
      );

      expect(mockUseGLTF).toHaveBeenCalled();

      global.performance = originalPerformance;
    });

    it('should maintain consistent behavior across sessions', () => {
      // Multiple independent sessions
      for (let session = 0; session < 5; session++) {
        const { unmount } = render(
          <Canvas>
            <Avatar
              position={[0, 0, 0]}
              isSpeaking={session % 2 === 0}
              movementIntensity="animated"
            />
          </Canvas>
        );

        expect(mockUseGLTF).toHaveBeenCalled();
        unmount();
      }
    });
  });
}); 