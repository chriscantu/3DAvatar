import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sketchfabLoader, useSketchfabModel } from '../sketchfabModelLoader';
import { renderHook, waitFor } from '@testing-library/react';

// Mock fetch
global.fetch = vi.fn();

describe('SketchfabModelLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sketchfabLoader.cleanup();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Model Info Retrieval', () => {
    it('should get model info for the puppy model', async () => {
      const modelId = '395efb909b1844dbbcd2f3fa3b60ed9b';
      
      const modelInfo = await sketchfabLoader.getModelInfo(modelId);
      
      expect(modelInfo).toEqual({
        id: modelId,
        name: '3D Cartoon Puppy',
        description: expect.stringContaining('cartoon puppy'),
        downloadUrl: expect.stringContaining(modelId),
        license: 'CC Attribution',
        author: '3D Stocks',
        thumbnailUrl: expect.stringContaining(modelId),
      });
    });

    it('should cache model info', async () => {
      const modelId = '395efb909b1844dbbcd2f3fa3b60ed9b';
      
      const info1 = await sketchfabLoader.getModelInfo(modelId);
      const info2 = await sketchfabLoader.getModelInfo(modelId);
      
      expect(info1).toBe(info2);
    });

    it('should throw error for unsupported model', async () => {
      const invalidModelId = 'invalid-model-id';
      
      await expect(sketchfabLoader.getModelInfo(invalidModelId)).rejects.toThrow(
        'Model not found or not supported'
      );
    });
  });

  describe('Model Download', () => {
    it('should download model successfully', async () => {
      const modelId = '395efb909b1844dbbcd2f3fa3b60ed9b';
      const mockBlob = new Blob(['model data'], { type: 'application/octet-stream' });
      
      const mockResponse = {
        ok: true,
        headers: new Map([['content-length', '1000']]),
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({ done: false, value: new Uint8Array([1, 2, 3]) })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      };
      
      (fetch as any).mockResolvedValue(mockResponse);
      
      const progressCallback = vi.fn();
      const blob = await sketchfabLoader.downloadModel(modelId, progressCallback);
      
      expect(blob).toBeInstanceOf(Blob);
      expect(progressCallback).toHaveBeenCalled();
    });

    it('should handle download errors', async () => {
      const modelId = '395efb909b1844dbbcd2f3fa3b60ed9b';
      
      (fetch as any).mockResolvedValue({
        ok: false,
        status: 404,
      });
      
      await expect(sketchfabLoader.downloadModel(modelId)).rejects.toThrow(
        'Failed to download model'
      );
    });

    it('should cache downloaded models', async () => {
      const modelId = '395efb909b1844dbbcd2f3fa3b60ed9b';
      const mockBlob = new Blob(['model data']);
      
      const mockResponse = {
        ok: true,
        headers: new Map([['content-length', '1000']]),
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({ done: false, value: new Uint8Array([1, 2, 3]) })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      };
      
      (fetch as any).mockResolvedValue(mockResponse);
      
      const progressCallback1 = vi.fn();
      const progressCallback2 = vi.fn();
      
      await sketchfabLoader.downloadModel(modelId, progressCallback1);
      await sketchfabLoader.downloadModel(modelId, progressCallback2);
      
      // Second call should use cache (progress callback called immediately)
      expect(progressCallback2).toHaveBeenCalledWith(100);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle progress tracking', async () => {
      const modelId = '395efb909b1844dbbcd2f3fa3b60ed9b';
      
      const mockResponse = {
        ok: true,
        headers: new Map([['content-length', '1000']]),
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({ done: false, value: new Uint8Array(500) })
              .mockResolvedValueOnce({ done: false, value: new Uint8Array(500) })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      };
      
      (fetch as any).mockResolvedValue(mockResponse);
      
      const progressCallback = vi.fn();
      await sketchfabLoader.downloadModel(modelId, progressCallback);
      
      expect(progressCallback).toHaveBeenCalledWith(50);
      expect(progressCallback).toHaveBeenCalledWith(100);
    });
  });

  describe('Model URL Generation', () => {
    it('should create object URL for model', async () => {
      const modelId = '395efb909b1844dbbcd2f3fa3b60ed9b';
      
      const mockResponse = {
        ok: true,
        headers: new Map(),
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({ done: false, value: new Uint8Array([1, 2, 3]) })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      };
      
      (fetch as any).mockResolvedValue(mockResponse);
      
      // Mock URL.createObjectURL
      global.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/model');
      
      const url = await sketchfabLoader.getModelUrl(modelId);
      
      expect(url).toBe('blob:http://localhost/model');
      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it('should handle URL creation errors', async () => {
      const modelId = '395efb909b1844dbbcd2f3fa3b60ed9b';
      
      (fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
      });
      
      await expect(sketchfabLoader.getModelUrl(modelId)).rejects.toThrow(
        'Failed to create model URL'
      );
    });
  });

  describe('Cache Management', () => {
    it('should check if model is cached', async () => {
      const modelId = '395efb909b1844dbbcd2f3fa3b60ed9b';
      
      expect(sketchfabLoader.isModelCached(modelId)).toBe(false);
      
      const mockResponse = {
        ok: true,
        headers: new Map(),
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({ done: false, value: new Uint8Array([1, 2, 3]) })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      };
      
      (fetch as any).mockResolvedValue(mockResponse);
      
      await sketchfabLoader.downloadModel(modelId);
      
      expect(sketchfabLoader.isModelCached(modelId)).toBe(true);
    });

    it('should calculate cache size', async () => {
      const modelId = '395efb909b1844dbbcd2f3fa3b60ed9b';
      
      expect(sketchfabLoader.getCacheSize()).toBe(0);
      
      const mockResponse = {
        ok: true,
        headers: new Map(),
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({ done: false, value: new Uint8Array(1000) })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      };
      
      (fetch as any).mockResolvedValue(mockResponse);
      
      await sketchfabLoader.downloadModel(modelId);
      
      expect(sketchfabLoader.getCacheSize()).toBe(1000);
    });

    it('should clear cache', async () => {
      const modelId = '395efb909b1844dbbcd2f3fa3b60ed9b';
      
      const mockResponse = {
        ok: true,
        headers: new Map(),
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({ done: false, value: new Uint8Array([1, 2, 3]) })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      };
      
      (fetch as any).mockResolvedValue(mockResponse);
      
      await sketchfabLoader.downloadModel(modelId);
      
      expect(sketchfabLoader.isModelCached(modelId)).toBe(true);
      
      sketchfabLoader.cleanup();
      
      expect(sketchfabLoader.isModelCached(modelId)).toBe(false);
      expect(sketchfabLoader.getCacheSize()).toBe(0);
    });
  });
});

describe('useSketchfabModel Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sketchfabLoader.cleanup();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should load model successfully', async () => {
    const modelId = '395efb909b1844dbbcd2f3fa3b60ed9b';
    
    const mockResponse = {
      ok: true,
      headers: new Map(),
      body: {
        getReader: () => ({
          read: vi.fn()
            .mockResolvedValueOnce({ done: false, value: new Uint8Array([1, 2, 3]) })
            .mockResolvedValueOnce({ done: true }),
        }),
      },
    };
    
    (fetch as any).mockResolvedValue(mockResponse);
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/model');
    
    const { result } = renderHook(() => useSketchfabModel(modelId));
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isLoaded).toBe(false);
    
    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.modelUrl).toBe('blob:http://localhost/model');
    expect(result.current.modelInfo).toEqual({
      id: modelId,
      name: '3D Cartoon Puppy',
      description: expect.stringContaining('cartoon puppy'),
      downloadUrl: expect.stringContaining(modelId),
      license: 'CC Attribution',
      author: '3D Stocks',
      thumbnailUrl: expect.stringContaining(modelId),
    });
  });

  it('should handle loading errors', async () => {
    const modelId = '395efb909b1844dbbcd2f3fa3b60ed9b';
    
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 404,
    });
    
    const { result } = renderHook(() => useSketchfabModel(modelId));
    
    expect(result.current.isLoading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isLoaded).toBe(false);
  });

  it('should track progress', async () => {
    const modelId = '395efb909b1844dbbcd2f3fa3b60ed9b';
    
    const mockResponse = {
      ok: true,
      headers: new Map([['content-length', '1000']]),
      body: {
        getReader: () => ({
          read: vi.fn()
            .mockResolvedValueOnce({ done: false, value: new Uint8Array(500) })
            .mockResolvedValueOnce({ done: false, value: new Uint8Array(500) })
            .mockResolvedValueOnce({ done: true }),
        }),
      },
    };
    
    (fetch as any).mockResolvedValue(mockResponse);
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/model');
    
    const { result } = renderHook(() => useSketchfabModel(modelId));
    
    await waitFor(() => {
      expect(result.current.progress).toBe(100);
    });
  });

  it('should cleanup on unmount', async () => {
    const modelId = '395efb909b1844dbbcd2f3fa3b60ed9b';
    
    const mockResponse = {
      ok: true,
      headers: new Map(),
      body: {
        getReader: () => ({
          read: vi.fn()
            .mockResolvedValueOnce({ done: false, value: new Uint8Array([1, 2, 3]) })
            .mockResolvedValueOnce({ done: true }),
        }),
      },
    };
    
    (fetch as any).mockResolvedValue(mockResponse);
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/model');
    global.URL.revokeObjectURL = vi.fn();
    
    const { result, unmount } = renderHook(() => useSketchfabModel(modelId));
    
    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });
    
    unmount();
    
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/model');
  });
}); 