/**
 * Sketchfab Model Loader Service
 * Handles downloading and caching 3D models from Sketchfab
 */

export interface SketchfabModelInfo {
  id: string;
  name: string;
  description: string;
  downloadUrl: string;
  license: string;
  author: string;
  thumbnailUrl: string;
}

export interface ModelLoadingState {
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  progress: number;
}

class SketchfabModelLoader {
  private cache = new Map<string, Blob>();
  private modelInfo: SketchfabModelInfo | null = null;

  /**
   * Get model information from Sketchfab
   */
  async getModelInfo(modelId: string): Promise<SketchfabModelInfo> {
    if (this.modelInfo && this.modelInfo.id === modelId) {
      return this.modelInfo;
    }

    try {
      // For the specific puppy model
      if (modelId === '395efb909b1844dbbcd2f3fa3b60ed9b') {
        this.modelInfo = {
          id: modelId,
          name: '3D Cartoon Puppy',
          description: 'This is a 3D model of cartoon puppy which is brown in colour and has white dots. There are many formats available for downloading.',
          downloadUrl: this.getDirectDownloadUrl(modelId),
          license: 'CC Attribution',
          author: '3D Stocks',
          thumbnailUrl: `https://sketchfab.com/models/${modelId}/thumbnails/images/preview.jpg`
        };
        return this.modelInfo;
      }

      // For other models, you would implement the Sketchfab API call
      throw new Error('Model not found or not supported');
    } catch (error) {
      throw new Error(`Failed to get model info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get direct download URL for the model
   * In production, you would implement proper Sketchfab API authentication
   */
  private getDirectDownloadUrl(modelId: string): string {
    // For development, we'll use a placeholder path
    // In production, this would be the actual Sketchfab download URL
    return `/models/${modelId}/scene.glb`;
  }

  /**
   * Download model from Sketchfab
   */
  async downloadModel(
    modelId: string,
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    // Check cache first
    if (this.cache.has(modelId)) {
      const cachedModel = this.cache.get(modelId)!;
      onProgress?.(100);
      return cachedModel;
    }

    try {
      const modelInfo = await this.getModelInfo(modelId);
      
      const response = await fetch(modelInfo.downloadUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      let loaded = 0;

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;
        
        if (total > 0) {
          const progress = (loaded / total) * 100;
          onProgress?.(progress);
        }
      }

      const blob = new Blob(chunks);
      
      // Cache the model
      this.cache.set(modelId, blob);
      
      return blob;
    } catch (error) {
      throw new Error(`Failed to download model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create object URL for the downloaded model
   */
  async getModelUrl(modelId: string, onProgress?: (progress: number) => void): Promise<string> {
    try {
      const blob = await this.downloadModel(modelId, onProgress);
      return URL.createObjectURL(blob);
    } catch (error) {
      throw new Error(`Failed to create model URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clean up cached models and URLs
   */
  cleanup(): void {
    this.cache.clear();
    this.modelInfo = null;
  }

  /**
   * Get cache size in bytes
   */
  getCacheSize(): number {
    let size = 0;
    for (const blob of this.cache.values()) {
      size += blob.size;
    }
    return size;
  }

  /**
   * Check if model is cached
   */
  isModelCached(modelId: string): boolean {
    return this.cache.has(modelId);
  }
}

// Export singleton instance
export const sketchfabLoader = new SketchfabModelLoader();

/**
 * React hook for loading Sketchfab models
 */
export function useSketchfabModel(modelId: string) {
  const [state, setState] = React.useState<ModelLoadingState>({
    isLoading: false,
    isLoaded: false,
    error: null,
    progress: 0
  });
  
  const [modelUrl, setModelUrl] = React.useState<string | null>(null);
  const [modelInfo, setModelInfo] = React.useState<SketchfabModelInfo | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const loadModel = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        // Get model info
        const info = await sketchfabLoader.getModelInfo(modelId);
        if (cancelled) return;
        
        setModelInfo(info);

        // Download model
        const url = await sketchfabLoader.getModelUrl(modelId, (progress) => {
          if (!cancelled) {
            setState(prev => ({ ...prev, progress }));
          }
        });
        
        if (cancelled) return;

        setModelUrl(url);
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          isLoaded: true, 
          progress: 100 
        }));
      } catch (error) {
        if (!cancelled) {
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          }));
        }
      }
    };

    loadModel();

    return () => {
      cancelled = true;
      if (modelUrl) {
        URL.revokeObjectURL(modelUrl);
      }
    };
  }, [modelId]);

  return {
    modelUrl,
    modelInfo,
    ...state
  };
}

// Import React for the hook
import React from 'react'; 