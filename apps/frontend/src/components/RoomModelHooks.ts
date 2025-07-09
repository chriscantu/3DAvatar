import { useState } from 'react';
import { ERROR_MESSAGES, CONSOLE_MESSAGES } from '../config/roomConstants';

// Hook for managing multiple room models
export const useRoomModels = (models: Array<{
  modelUrl: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number] | number;
  name?: string;
}>) => {
  const [loadedModels, setLoadedModels] = useState<Set<string>>(new Set());
  const [failedModels, setFailedModels] = useState<Set<string>>(new Set());

  const handleModelLoad = (modelUrl: string) => {
    console.log(`${CONSOLE_MESSAGES.MODEL_LOADED_SUCCESS}: ${modelUrl}`);
    setLoadedModels(prev => new Set(prev).add(modelUrl));
  };

  const handleModelError = (modelUrl: string) => {
    console.warn(`${ERROR_MESSAGES.FAILED_TO_LOAD_MODEL}: ${modelUrl}`);
    setFailedModels(prev => new Set(prev).add(modelUrl));
  };

  return {
    loadedModels,
    failedModels,
    handleModelLoad,
    handleModelError,
    totalModels: models.length,
    loadedCount: loadedModels.size,
    failedCount: failedModels.size,
  };
}; 