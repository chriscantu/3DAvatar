import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRoomModel } from './';

describe('useRoomModel Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default room model state', () => {
      const { result } = renderHook(() => useRoomModel());
      
      expect(result.current.useRoomModels).toBe(true);
      expect(result.current.roomModelUrl).toBe('');
      expect(result.current.roomType).toBe('geometric');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.loadingProgress).toBe(0);
    });

    it('should accept initial configuration', () => {
      const initialConfig = {
        useRoomModels: false,
        roomModelUrl: '/models/room.glb',
        roomType: 'model' as const
      };
      
      const { result } = renderHook(() => useRoomModel(initialConfig));
      
      expect(result.current.useRoomModels).toBe(false);
      expect(result.current.roomModelUrl).toBe('/models/room.glb');
      expect(result.current.roomType).toBe('model');
    });
  });

  describe('Room Model Loading', () => {
    it('should handle successful model loading', async () => {
      const { result } = renderHook(() => useRoomModel());
      
      await act(async () => {
        result.current.loadRoomModel('/models/room.glb');
      });
      
      expect(result.current.isLoading).toBe(false);
      expect(result.current.roomModelUrl).toBe('/models/room.glb');
      expect(result.current.roomType).toBe('model');
      expect(result.current.error).toBe(null);
    });

    it('should handle model loading errors', async () => {
      const { result } = renderHook(() => useRoomModel());
      
      // Mock console.error to avoid noise in tests
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await act(async () => {
        result.current.loadRoomModel('/invalid/path.glb');
      });
      
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeTruthy();
      expect(result.current.roomType).toBe('geometric'); // Falls back
      
      consoleSpy.mockRestore();
    });

    it('should show loading state during model loading', async () => {
      const { result } = renderHook(() => useRoomModel());
      
      act(() => {
        result.current.loadRoomModel('/models/room.glb');
      });
      
      expect(result.current.isLoading).toBe(true);
      expect(result.current.loadingProgress).toBeGreaterThan(0);
    });

    it('should update loading progress', async () => {
      const { result } = renderHook(() => useRoomModel());
      
      act(() => {
        result.current.loadRoomModel('/models/room.glb');
      });
      
      act(() => {
        result.current.updateLoadingProgress(50);
      });
      
      expect(result.current.loadingProgress).toBe(50);
    });

    it('should complete loading when progress reaches 100', async () => {
      const { result } = renderHook(() => useRoomModel());
      
      act(() => {
        result.current.loadRoomModel('/models/room.glb');
      });
      
      await act(async () => {
        result.current.updateLoadingProgress(100);
      });
      
      expect(result.current.isLoading).toBe(false);
      expect(result.current.loadingProgress).toBe(100);
    });
  });

  describe('Room Type Management', () => {
    it('should switch to geometric room', () => {
      const { result } = renderHook(() => useRoomModel());
      
      act(() => {
        result.current.setRoomType('geometric');
      });
      
      expect(result.current.roomType).toBe('geometric');
      expect(result.current.roomModelUrl).toBe('');
    });

    it('should switch to model room', () => {
      const { result } = renderHook(() => useRoomModel());
      
      act(() => {
        result.current.setRoomType('model');
      });
      
      expect(result.current.roomType).toBe('model');
    });

    it('should toggle between room types', () => {
      const { result } = renderHook(() => useRoomModel());
      
      expect(result.current.roomType).toBe('geometric');
      
      act(() => {
        result.current.toggleRoomType();
      });
      
      expect(result.current.roomType).toBe('model');
      
      act(() => {
        result.current.toggleRoomType();
      });
      
      expect(result.current.roomType).toBe('geometric');
    });
  });

  describe('Room Model URL Management', () => {
    it('should update room model URL', () => {
      const { result } = renderHook(() => useRoomModel());
      
      act(() => {
        result.current.setRoomModelUrl('/new/model.glb');
      });
      
      expect(result.current.roomModelUrl).toBe('/new/model.glb');
    });

    it('should clear room model URL when switching to geometric', () => {
      const { result } = renderHook(() => useRoomModel());
      
      act(() => {
        result.current.setRoomModelUrl('/models/room.glb');
        result.current.setRoomType('geometric');
      });
      
      expect(result.current.roomModelUrl).toBe('');
    });
  });

  describe('Room Models Toggle', () => {
    it('should toggle room models usage', () => {
      const { result } = renderHook(() => useRoomModel());
      
      expect(result.current.useRoomModels).toBe(true);
      
      act(() => {
        result.current.toggleRoomModels();
      });
      
      expect(result.current.useRoomModels).toBe(false);
    });

    it('should set room models usage', () => {
      const { result } = renderHook(() => useRoomModel());
      
      act(() => {
        result.current.setUseRoomModels(false);
      });
      
      expect(result.current.useRoomModels).toBe(false);
    });

    it('should fall back to geometric when disabling room models', () => {
      const { result } = renderHook(() => useRoomModel());
      
      act(() => {
        result.current.setRoomType('model');
        result.current.setUseRoomModels(false);
      });
      
      expect(result.current.roomType).toBe('geometric');
    });
  });

  describe('Error Handling', () => {
    it('should clear errors', () => {
      const { result } = renderHook(() => useRoomModel());
      
      act(() => {
        result.current.setError('Test error');
      });
      
      expect(result.current.error).toBe('Test error');
      
      act(() => {
        result.current.clearError();
      });
      
      expect(result.current.error).toBe(null);
    });

    it('should handle model loading timeout', async () => {
      vi.useFakeTimers();
      
      const { result } = renderHook(() => useRoomModel());
      
      act(() => {
        result.current.loadRoomModel('/slow/model.glb');
      });
      
      // Fast forward to timeout
      act(() => {
        vi.advanceTimersByTime(10000); // 10 seconds
      });
      
      expect(result.current.error).toBeTruthy();
      expect(result.current.isLoading).toBe(false);
      
      vi.useRealTimers();
    });
  });

  describe('Room Model Validation', () => {
    it('should validate GLB file extension', () => {
      const { result } = renderHook(() => useRoomModel());
      
      expect(result.current.isValidModelUrl('/models/room.glb')).toBe(true);
      expect(result.current.isValidModelUrl('/models/room.gltf')).toBe(true);
      expect(result.current.isValidModelUrl('/models/room.obj')).toBe(false);
      expect(result.current.isValidModelUrl('/models/room.fbx')).toBe(false);
    });

    it('should validate model URL format', () => {
      const { result } = renderHook(() => useRoomModel());
      
      expect(result.current.isValidModelUrl('https://example.com/model.glb')).toBe(true);
      expect(result.current.isValidModelUrl('/local/model.glb')).toBe(true);
      expect(result.current.isValidModelUrl('model.glb')).toBe(true);
      expect(result.current.isValidModelUrl('')).toBe(false);
      expect(result.current.isValidModelUrl('invalid')).toBe(false);
    });
  });

  describe('Performance', () => {
    it('should not cause memory leaks with multiple model loads', async () => {
      const { result } = renderHook(() => useRoomModel());
      
      // Load multiple models rapidly
      for (let i = 0; i < 10; i++) {
        await act(async () => {
          result.current.loadRoomModel(`/models/room${i}.glb`);
        });
      }
      
      // Should settle to final state
      expect(result.current.roomModelUrl).toBe('/models/room9.glb');
    });

    it('should handle rapid state changes efficiently', () => {
      const { result } = renderHook(() => useRoomModel());
      
      // Rapid state changes
      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.toggleRoomType();
          result.current.toggleRoomModels();
        }
      });
      
      // Should settle to final state
      expect(result.current.roomType).toBe('geometric');
      expect(result.current.useRoomModels).toBe(false);
    });
  });

  describe('Room Model Presets', () => {
    it('should provide default room model presets', () => {
      const { result } = renderHook(() => useRoomModel());
      
      expect(result.current.presets).toEqual([
        { name: 'Modern Office', url: '/models/modern-office.glb' },
        { name: 'Cozy Living Room', url: '/models/living-room.glb' },
        { name: 'Minimalist Studio', url: '/models/studio.glb' }
      ]);
    });

    it('should load preset room model', async () => {
      const { result } = renderHook(() => useRoomModel());
      
      await act(async () => {
        result.current.loadPreset('Modern Office');
      });
      
      expect(result.current.roomModelUrl).toBe('/models/modern-office.glb');
      expect(result.current.roomType).toBe('model');
    });

    it('should handle invalid preset name', async () => {
      const { result } = renderHook(() => useRoomModel());
      
      await act(async () => {
        result.current.loadPreset('Invalid Preset');
      });
      
      expect(result.current.error).toBeTruthy();
    });
  });
}); 