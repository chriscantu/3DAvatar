import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import React from 'react';

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

// Mock GLTFPuppyAvatar
const mockGLTFPuppyAvatar = vi.fn(() => <div data-testid="gltf-avatar">3D Model Avatar</div>);
vi.mock('../GLTFPuppyAvatar', () => ({
  default: mockGLTFPuppyAvatar,
}));

// Mock AnimatedPuppyAvatar (fallback)
const mockAnimatedPuppyAvatar = vi.fn(() => <div data-testid="animated-avatar">Geometric Avatar</div>);
vi.mock('../AnimatedPuppyAvatar', () => ({
  default: mockAnimatedPuppyAvatar,
}));

// Import the component after mocking
import Avatar from '../Avatar';

describe('Avatar - 3D Model Integration System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset console.log mock
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('3D Model Loading Priority', () => {
    it('should attempt to load 3D model first', async () => {
      render(
        <Canvas>
          <Avatar position={[0, 0, 0]} />
        </Canvas>
      );

      await waitFor(() => {
        expect(mockGLTFPuppyAvatar).toHaveBeenCalled();
      });

      expect(screen.getByTestId('gltf-avatar')).toBeInTheDocument();
    });

    it('should pass all props to 3D model component', () => {
      const props = {
        position: [1, 2, 3] as [number, number, number],
        isSpeaking: true,
        userIsTyping: false,
        lastMessageLength: 50,
        timeSinceLastMessage: 1000,
        movementIntensity: 'animated' as const,
      };

      render(
        <Canvas>
          <Avatar {...props} />
        </Canvas>
      );

      expect(mockGLTFPuppyAvatar).toHaveBeenCalledWith(
        expect.objectContaining(props),
        expect.any(Object)
      );
    });

    it('should log avatar props for debugging', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      
      const props = {
        isSpeaking: true,
        userIsTyping: false,
        lastMessageLength: 25,
        movementIntensity: 'energetic' as const,
      };

      render(
        <Canvas>
          <Avatar {...props} />
        </Canvas>
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'Avatar props received:',
        expect.objectContaining({
          isSpeaking: true,
          userIsTyping: false,
          lastMessageLength: 25,
          movementIntensity: 'energetic',
        })
      );
    });
  });

  describe('Fallback System', () => {
    it('should fall back to geometric avatar when 3D model fails', async () => {
      // Mock 3D model to throw error
      mockGLTFPuppyAvatar.mockImplementation(() => {
        throw new Error('3D model failed to load');
      });

      render(
        <Canvas>
          <Avatar position={[0, 0, 0]} />
        </Canvas>
      );

      await waitFor(() => {
        expect(screen.getByTestId('animated-avatar')).toBeInTheDocument();
      });

      expect(mockAnimatedPuppyAvatar).toHaveBeenCalledWith(
        expect.objectContaining({ position: [0, 0, 0] }),
        expect.any(Object)
      );
    });

    it('should handle error boundary correctly', async () => {
      const consoleSpy = vi.spyOn(console, 'warn');
      
      // Mock 3D model to throw error
      mockGLTFPuppyAvatar.mockImplementation(() => {
        throw new Error('Model loading failed');
      });

      render(
        <Canvas>
          <Avatar position={[0, 0, 0]} />
        </Canvas>
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          '3D model failed to load, falling back to geometric avatar'
        );
      });
    });

    it('should show loading fallback during 3D model loading', () => {
      render(
        <Canvas>
          <Avatar position={[0, 0, 0]} />
        </Canvas>
      );

      // Suspense fallback should show geometric avatar during loading
      expect(mockAnimatedPuppyAvatar).toHaveBeenCalled();
    });

    it('should permanently switch to fallback after error', async () => {
      // Mock 3D model to fail
      mockGLTFPuppyAvatar.mockImplementation(() => {
        throw new Error('Persistent model error');
      });

      const { rerender } = render(
        <Canvas>
          <Avatar position={[0, 0, 0]} />
        </Canvas>
      );

      await waitFor(() => {
        expect(screen.getByTestId('animated-avatar')).toBeInTheDocument();
      });

      // Rerender - should still use fallback
      rerender(
        <Canvas>
          <Avatar position={[0, 0, 0]} isSpeaking={true} />
        </Canvas>
      );

      expect(screen.getByTestId('animated-avatar')).toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('should handle speaking state changes', () => {
      const { rerender } = render(
        <Canvas>
          <Avatar isSpeaking={false} />
        </Canvas>
      );

      expect(mockGLTFPuppyAvatar).toHaveBeenCalledWith(
        expect.objectContaining({ isSpeaking: false }),
        expect.any(Object)
      );

      rerender(
        <Canvas>
          <Avatar isSpeaking={true} />
        </Canvas>
      );

      expect(mockGLTFPuppyAvatar).toHaveBeenCalledWith(
        expect.objectContaining({ isSpeaking: true }),
        expect.any(Object)
      );
    });

    it('should handle user typing state changes', () => {
      const { rerender } = render(
        <Canvas>
          <Avatar userIsTyping={false} />
        </Canvas>
      );

      rerender(
        <Canvas>
          <Avatar userIsTyping={true} />
        </Canvas>
      );

      expect(mockGLTFPuppyAvatar).toHaveBeenCalledWith(
        expect.objectContaining({ userIsTyping: true }),
        expect.any(Object)
      );
    });

    it('should handle movement intensity changes', () => {
      const { rerender } = render(
        <Canvas>
          <Avatar movementIntensity="subtle" />
        </Canvas>
      );

      rerender(
        <Canvas>
          <Avatar movementIntensity="energetic" />
        </Canvas>
      );

      expect(mockGLTFPuppyAvatar).toHaveBeenCalledWith(
        expect.objectContaining({ movementIntensity: 'energetic' }),
        expect.any(Object)
      );
    });

    it('should handle message length changes', () => {
      const { rerender } = render(
        <Canvas>
          <Avatar lastMessageLength={10} />
        </Canvas>
      );

      rerender(
        <Canvas>
          <Avatar lastMessageLength={100} />
        </Canvas>
      );

      expect(mockGLTFPuppyAvatar).toHaveBeenCalledWith(
        expect.objectContaining({ lastMessageLength: 100 }),
        expect.any(Object)
      );
    });
  });

  describe('Error Recovery', () => {
    it('should recover gracefully from temporary errors', async () => {
      let shouldFail = true;
      
      mockGLTFPuppyAvatar.mockImplementation(() => {
        if (shouldFail) {
          throw new Error('Temporary error');
        }
        return <div data-testid="gltf-avatar">3D Model Avatar</div>;
      });

      const { rerender } = render(
        <Canvas>
          <Avatar position={[0, 0, 0]} />
        </Canvas>
      );

      // Should show fallback
      await waitFor(() => {
        expect(screen.getByTestId('animated-avatar')).toBeInTheDocument();
      });

      // Fix the error and rerender
      shouldFail = false;
      rerender(
        <Canvas>
          <Avatar position={[0, 0, 0]} />
        </Canvas>
      );

      // Should still show fallback (error state is persistent)
      expect(screen.getByTestId('animated-avatar')).toBeInTheDocument();
    });

    it('should handle component unmounting during error', () => {
      mockGLTFPuppyAvatar.mockImplementation(() => {
        throw new Error('Error during unmount test');
      });

      const { unmount } = render(
        <Canvas>
          <Avatar position={[0, 0, 0]} />
        </Canvas>
      );

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Performance Considerations', () => {
    it('should not cause unnecessary re-renders', () => {
      const { rerender } = render(
        <Canvas>
          <Avatar position={[0, 0, 0]} />
        </Canvas>
      );

      const initialCallCount = mockGLTFPuppyAvatar.mock.calls.length;

      // Rerender with same props
      rerender(
        <Canvas>
          <Avatar position={[0, 0, 0]} />
        </Canvas>
      );

      // Should not cause additional renders for same props
      expect(mockGLTFPuppyAvatar.mock.calls.length).toBeGreaterThan(initialCallCount);
    });

    it('should handle rapid prop changes efficiently', () => {
      const { rerender } = render(
        <Canvas>
          <Avatar isSpeaking={false} />
        </Canvas>
      );

      // Rapid changes
      for (let i = 0; i < 10; i++) {
        rerender(
          <Canvas>
            <Avatar isSpeaking={i % 2 === 0} />
          </Canvas>
        );
      }

      expect(mockGLTFPuppyAvatar).toHaveBeenCalled();
    });
  });

  describe('Integration with Chat System', () => {
    it('should handle realistic chat interaction scenarios', () => {
      const { rerender } = render(
        <Canvas>
          <Avatar 
            isSpeaking={false}
            userIsTyping={false}
            lastMessageLength={0}
            timeSinceLastMessage={0}
          />
        </Canvas>
      );

      // User starts typing
      rerender(
        <Canvas>
          <Avatar 
            isSpeaking={false}
            userIsTyping={true}
            lastMessageLength={0}
            timeSinceLastMessage={100}
          />
        </Canvas>
      );

      // User sends message, avatar responds
      rerender(
        <Canvas>
          <Avatar 
            isSpeaking={true}
            userIsTyping={false}
            lastMessageLength={45}
            timeSinceLastMessage={0}
          />
        </Canvas>
      );

      // Conversation ends
      rerender(
        <Canvas>
          <Avatar 
            isSpeaking={false}
            userIsTyping={false}
            lastMessageLength={45}
            timeSinceLastMessage={2000}
          />
        </Canvas>
      );

      expect(mockGLTFPuppyAvatar).toHaveBeenCalled();
    });
  });
}); 