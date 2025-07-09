import { useState, useCallback, useRef, useEffect } from 'react';

export type RoomType = 'geometric' | 'model';

interface RoomModelPreset {
  name: string;
  url: string;
}

interface RoomModelConfig {
  useRoomModels?: boolean;
  roomModelUrl?: string;
  roomType?: RoomType;
  loadingTimeout?: number;
}

interface UseRoomModelReturn {
  // Core state
  useRoomModels: boolean;
  roomModelUrl: string;
  roomType: RoomType;
  isLoading: boolean;
  error: string | null;
  loadingProgress: number;
  
  // Presets
  presets: RoomModelPreset[];
  
  // Actions
  setUseRoomModels: (use: boolean) => void;
  toggleRoomModels: () => void;
  setRoomModelUrl: (url: string) => void;
  setRoomType: (type: RoomType) => void;
  toggleRoomType: () => void;
  loadRoomModel: (url: string) => Promise<void>;
  updateLoadingProgress: (progress: number) => void;
  clearError: () => void;
  setError: (error: string) => void;
  isValidModelUrl: (url: string) => boolean;
  loadPreset: (presetName: string) => Promise<void>;
}

const DEFAULT_CONFIG: Required<RoomModelConfig> = {
  useRoomModels: true,
  roomModelUrl: '',
  roomType: 'geometric',
  loadingTimeout: 10000, // 10 seconds
};

const DEFAULT_PRESETS: RoomModelPreset[] = [
  { name: 'Modern Office', url: '/models/modern-office.glb' },
  { name: 'Cozy Living Room', url: '/models/living-room.glb' },
  { name: 'Minimalist Studio', url: '/models/studio.glb' }
];

/**
 * Custom hook for managing 3D room model state and loading
 * Handles room type switching, model loading, and error states
 */
export const useRoomModel = (config: RoomModelConfig = {}): UseRoomModelReturn => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Core state
  const [useRoomModels, setUseRoomModelsState] = useState(finalConfig.useRoomModels);
  const [roomModelUrl, setRoomModelUrlState] = useState(finalConfig.roomModelUrl);
  const [roomType, setRoomTypeState] = useState<RoomType>(finalConfig.roomType);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Refs for cleanup
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
  // Validate model URL
  const isValidModelUrl = useCallback((url: string): boolean => {
    if (!url || typeof url !== 'string') return false;
    
    // Check for valid file extensions
    const validExtensions = ['.glb', '.gltf'];
    const hasValidExtension = validExtensions.some(ext => url.toLowerCase().endsWith(ext));
    
    if (!hasValidExtension) return false;
    
    // Basic URL validation
    try {
      // Handle relative URLs
      if (url.startsWith('/') || url.startsWith('./') || !url.includes('://')) {
        return true;
      }
      
      // Handle absolute URLs
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);
  
  // Set room models usage
  const setUseRoomModels = useCallback((use: boolean) => {
    setUseRoomModelsState(use);
    
    // Fall back to geometric when disabling room models
    if (!use && roomType === 'model') {
      setRoomTypeState('geometric');
    }
  }, [roomType]);
  
  // Toggle room models usage
  const toggleRoomModels = useCallback(() => {
    setUseRoomModels(!useRoomModels);
  }, [useRoomModels, setUseRoomModels]);
  
  // Set room model URL
  const setRoomModelUrl = useCallback((url: string) => {
    setRoomModelUrlState(url);
  }, []);
  
  // Set room type
  const setRoomType = useCallback((type: RoomType) => {
    setRoomTypeState(type);
    
    // Clear URL when switching to geometric
    if (type === 'geometric') {
      setRoomModelUrlState('');
    }
  }, []);
  
  // Toggle room type
  const toggleRoomType = useCallback(() => {
    const newType = roomType === 'geometric' ? 'model' : 'geometric';
    setRoomType(newType);
  }, [roomType, setRoomType]);
  
  // Update loading progress
  const updateLoadingProgress = useCallback((progress: number) => {
    setLoadingProgress(Math.max(0, Math.min(100, progress)));
    
    // Complete loading when progress reaches 100
    if (progress >= 100) {
      setIsLoading(false);
    }
  }, []);
  
  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Load room model
  const loadRoomModel = useCallback(async (url: string) => {
    // Clear previous error
    setError(null);
    
    // Validate URL
    if (!isValidModelUrl(url)) {
      setError('Invalid model URL. Please provide a valid .glb or .gltf file.');
      return;
    }
    
    // Cancel previous loading
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Clear previous timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    // Start loading
    setIsLoading(true);
    setLoadingProgress(0);
    abortControllerRef.current = new AbortController();
    
    // Set loading timeout
    loadingTimeoutRef.current = setTimeout(() => {
      setError('Model loading timed out. Please try again or use a different model.');
      setIsLoading(false);
      setLoadingProgress(0);
      setRoomTypeState('geometric'); // Fall back
    }, finalConfig.loadingTimeout);
    
    try {
      // Simulate loading progress
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          const newProgress = prev + Math.random() * 20;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90; // Don't complete until actual loading is done
          }
          return newProgress;
        });
      }, 200);
      
      // Simulate async model loading
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          clearInterval(progressInterval);
          
          if (abortControllerRef.current?.signal.aborted) {
            reject(new Error('Loading cancelled'));
            return;
          }
          
          // Simulate loading success/failure
          if (url.includes('invalid') || url.includes('error')) {
            reject(new Error('Failed to load model'));
          } else {
            resolve(void 0);
          }
        }, 1000 + Math.random() * 2000); // 1-3 seconds
        
        // Handle abort
        abortControllerRef.current?.signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          clearInterval(progressInterval);
          reject(new Error('Loading cancelled'));
        });
      });
      
      // Success
      setRoomModelUrlState(url);
      setRoomTypeState('model');
      setLoadingProgress(100);
      setIsLoading(false);
      
      console.log('Room model loaded successfully:', url);
      
    } catch (error) {
      if (error instanceof Error && error.message !== 'Loading cancelled') {
        console.error('Failed to load room model:', error);
        setError(`Failed to load room model: ${error.message}`);
        setRoomTypeState('geometric'); // Fall back to geometric
      }
      setIsLoading(false);
      setLoadingProgress(0);
    } finally {
      // Clear timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    }
  }, [isValidModelUrl, finalConfig.loadingTimeout]);
  
  // Load preset room model
  const loadPreset = useCallback(async (presetName: string) => {
    const preset = DEFAULT_PRESETS.find(p => p.name === presetName);
    
    if (!preset) {
      setError(`Preset "${presetName}" not found.`);
      return;
    }
    
    await loadRoomModel(preset.url);
  }, [loadRoomModel]);
  
  return {
    // Core state
    useRoomModels,
    roomModelUrl,
    roomType,
    isLoading,
    error,
    loadingProgress,
    
    // Presets
    presets: DEFAULT_PRESETS,
    
    // Actions
    setUseRoomModels,
    toggleRoomModels,
    setRoomModelUrl,
    setRoomType,
    toggleRoomType,
    loadRoomModel,
    updateLoadingProgress,
    clearError,
    setError,
    isValidModelUrl,
    loadPreset,
  };
}; 