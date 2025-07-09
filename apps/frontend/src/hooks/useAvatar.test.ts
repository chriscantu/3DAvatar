import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAvatar } from './';

describe('useAvatar Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default avatar state', () => {
      const { result } = renderHook(() => useAvatar());
      
      expect(result.current.isSpeaking).toBe(false);
      expect(result.current.userIsTyping).toBe(false);
      expect(result.current.lastMessageLength).toBe(0);
      expect(result.current.timeSinceLastMessage).toBe(0);
      expect(result.current.movementIntensity).toBe('subtle');
      expect(result.current.use3DModel).toBe(true);
    });

    it('should accept initial configuration', () => {
      const initialConfig = {
        movementIntensity: 'energetic' as const,
        use3DModel: false
      };
      
      const { result } = renderHook(() => useAvatar(initialConfig));
      
      expect(result.current.movementIntensity).toBe('energetic');
      expect(result.current.use3DModel).toBe(false);
    });
  });

  describe('Speaking State Management', () => {
    it('should update speaking state', () => {
      const { result } = renderHook(() => useAvatar());
      
      act(() => {
        result.current.setIsSpeaking(true);
      });
      
      expect(result.current.isSpeaking).toBe(true);
    });

    it('should automatically stop speaking after timeout', () => {
      vi.useFakeTimers();
      
      const { result } = renderHook(() => useAvatar());
      
      act(() => {
        result.current.setIsSpeaking(true);
      });
      
      expect(result.current.isSpeaking).toBe(true);
      
      // Fast forward time
      act(() => {
        vi.advanceTimersByTime(5000); // 5 seconds
      });
      
      expect(result.current.isSpeaking).toBe(false);
      
      vi.useRealTimers();
    });

    it('should clear speaking timeout when manually stopped', () => {
      vi.useFakeTimers();
      
      const { result } = renderHook(() => useAvatar());
      
      act(() => {
        result.current.setIsSpeaking(true);
      });
      
      act(() => {
        result.current.setIsSpeaking(false);
      });
      
      // Fast forward time - should not change state
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      expect(result.current.isSpeaking).toBe(false);
      
      vi.useRealTimers();
    });
  });

  describe('Typing State Management', () => {
    it('should update typing state', () => {
      const { result } = renderHook(() => useAvatar());
      
      act(() => {
        result.current.setUserIsTyping(true);
      });
      
      expect(result.current.userIsTyping).toBe(true);
    });

    it('should automatically stop typing after timeout', () => {
      vi.useFakeTimers();
      
      const { result } = renderHook(() => useAvatar());
      
      act(() => {
        result.current.setUserIsTyping(true);
      });
      
      expect(result.current.userIsTyping).toBe(true);
      
      // Fast forward time
      act(() => {
        vi.advanceTimersByTime(3000); // 3 seconds
      });
      
      expect(result.current.userIsTyping).toBe(false);
      
      vi.useRealTimers();
    });
  });

  describe('Message Length Tracking', () => {
    it('should update last message length', () => {
      const { result } = renderHook(() => useAvatar());
      
      act(() => {
        result.current.setLastMessageLength(150);
      });
      
      expect(result.current.lastMessageLength).toBe(150);
    });

    it('should calculate movement intensity based on message length', () => {
      const { result } = renderHook(() => useAvatar());
      
      act(() => {
        result.current.setLastMessageLength(200); // Long message
      });
      
      expect(result.current.calculatedMovementIntensity).toBe('energetic');
    });

    it('should use base movement intensity for short messages', () => {
      const { result } = renderHook(() => useAvatar());
      
      act(() => {
        result.current.setLastMessageLength(50); // Short message
      });
      
      expect(result.current.calculatedMovementIntensity).toBe('subtle');
    });
  });

  describe('Time Since Last Message', () => {
    it('should track time since last message', () => {
      vi.useFakeTimers();
      
      const { result } = renderHook(() => useAvatar());
      
      act(() => {
        result.current.updateLastMessageTime();
      });
      
      // Fast forward time
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      
      expect(result.current.timeSinceLastMessage).toBe(2000);
      
      vi.useRealTimers();
    });

    it('should reset time when new message is received', () => {
      vi.useFakeTimers();
      
      const { result } = renderHook(() => useAvatar());
      
      act(() => {
        result.current.updateLastMessageTime();
      });
      
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      
      expect(result.current.timeSinceLastMessage).toBe(2000);
      
      // New message resets timer
      act(() => {
        result.current.updateLastMessageTime();
      });
      
      expect(result.current.timeSinceLastMessage).toBe(0);
      
      vi.useRealTimers();
    });
  });

  describe('Movement Intensity', () => {
    it('should update movement intensity', () => {
      const { result } = renderHook(() => useAvatar());
      
      act(() => {
        result.current.setMovementIntensity('animated');
      });
      
      expect(result.current.movementIntensity).toBe('animated');
    });

    it('should calculate intensity based on speaking and typing state', () => {
      const { result } = renderHook(() => useAvatar());
      
      act(() => {
        result.current.setIsSpeaking(true);
        result.current.setUserIsTyping(true);
      });
      
      expect(result.current.calculatedMovementIntensity).toBe('energetic');
    });

    it('should use moderate intensity when only speaking', () => {
      const { result } = renderHook(() => useAvatar());
      
      act(() => {
        result.current.setIsSpeaking(true);
        result.current.setUserIsTyping(false);
      });
      
      expect(result.current.calculatedMovementIntensity).toBe('animated');
    });
  });

  describe('3D Model Management', () => {
    it('should toggle 3D model usage', () => {
      const { result } = renderHook(() => useAvatar());
      
      expect(result.current.use3DModel).toBe(true);
      
      act(() => {
        result.current.setUse3DModel(false);
      });
      
      expect(result.current.use3DModel).toBe(false);
    });

    it('should handle model loading errors', () => {
      const { result } = renderHook(() => useAvatar());
      
      act(() => {
        result.current.handleModelError();
      });
      
      expect(result.current.use3DModel).toBe(false);
      expect(result.current.modelError).toBe(true);
    });

    it('should reset model error state', () => {
      const { result } = renderHook(() => useAvatar());
      
      act(() => {
        result.current.handleModelError();
      });
      
      expect(result.current.modelError).toBe(true);
      
      act(() => {
        result.current.resetModelError();
      });
      
      expect(result.current.modelError).toBe(false);
    });
  });

  describe('Avatar State Calculation', () => {
    it('should calculate correct avatar state for idle', () => {
      const { result } = renderHook(() => useAvatar());
      
      expect(result.current.avatarState).toBe('idle');
    });

    it('should calculate correct avatar state for speaking', () => {
      const { result } = renderHook(() => useAvatar());
      
      act(() => {
        result.current.setIsSpeaking(true);
      });
      
      expect(result.current.avatarState).toBe('speaking');
    });

    it('should calculate correct avatar state for listening', () => {
      const { result } = renderHook(() => useAvatar());
      
      act(() => {
        result.current.setUserIsTyping(true);
      });
      
      expect(result.current.avatarState).toBe('listening');
    });

    it('should calculate correct avatar state for interactive', () => {
      const { result } = renderHook(() => useAvatar());
      
      act(() => {
        result.current.setIsSpeaking(true);
        result.current.setUserIsTyping(true);
      });
      
      expect(result.current.avatarState).toBe('interactive');
    });
  });

  describe('Cleanup', () => {
    it('should clean up timers on unmount', () => {
      vi.useFakeTimers();
      
      const { result, unmount } = renderHook(() => useAvatar());
      
      act(() => {
        result.current.setIsSpeaking(true);
        result.current.setUserIsTyping(true);
      });
      
      unmount();
      
      // Should not throw errors after unmount
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      
      vi.useRealTimers();
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      const { result, rerender } = renderHook(() => useAvatar());
      
      const initialState = result.current;
      
      // Rerender without changes
      rerender();
      
      // State object should be stable
      expect(result.current).toBe(initialState);
    });

    it('should handle rapid state changes efficiently', () => {
      const { result } = renderHook(() => useAvatar());
      
      // Rapid state changes
      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.setIsSpeaking(i % 2 === 0);
          result.current.setUserIsTyping(i % 3 === 0);
        }
      });
      
      // Should settle to final state
      expect(result.current.isSpeaking).toBe(false);
      expect(result.current.userIsTyping).toBe(false);
    });
  });
}); 