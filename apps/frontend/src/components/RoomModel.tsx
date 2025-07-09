import React, { useRef, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { Group, Mesh } from 'three';
import { 
  DEFAULT_SCALES, 
  ERROR_MESSAGES, 
  CONSOLE_MESSAGES, 
  MATERIAL_PROPERTIES 
} from '../config/roomConstants';

interface RoomModelProps {
  modelUrl: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number] | number;
  name?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

const RoomModel: React.FC<RoomModelProps> = ({
  modelUrl,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = DEFAULT_SCALES.UNIFORM,
  name = 'room-model',
  onLoad,
  onError,
}) => {
  const groupRef = useRef<Group>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  console.log(`${CONSOLE_MESSAGES.ATTEMPTING_TO_LOAD}:`, modelUrl);
  
  // Always call useGLTF hook
  const gltf = useGLTF(modelUrl);
  const scene = gltf?.scene;
  
  // Handle model loading and setup
  useEffect(() => {
    if (scene && !modelLoaded && !hasError) {
      try {
        console.log(CONSOLE_MESSAGES.SETTING_UP_MODEL);
        
        // Configure shadows for all meshes in the model
        scene.traverse((child) => {
          if ((child as Mesh).isMesh) {
            const mesh = child as Mesh;
            mesh.castShadow = MATERIAL_PROPERTIES.SHADOW.CAST_SHADOW;
            mesh.receiveShadow = MATERIAL_PROPERTIES.SHADOW.RECEIVE_SHADOW;
          }
        });
        
        setModelLoaded(true);
        console.log(CONSOLE_MESSAGES.MODEL_LOADED_SUCCESS);
        onLoad?.();
      } catch (error) {
        console.error(`${ERROR_MESSAGES.FAILED_TO_LOAD_MODEL}:`, error);
        const errorObj = error instanceof Error ? error : new Error(ERROR_MESSAGES.MODEL_NOT_FOUND);
        setHasError(true);
        onError?.(errorObj);
      }
    }
  }, [scene, modelLoaded, hasError, onLoad, onError]);

  // Handle positioning and scaling
  useEffect(() => {
    if (groupRef.current && scene && modelLoaded && !hasError) {
      console.log(CONSOLE_MESSAGES.MODEL_POSITIONED);
      groupRef.current.position.set(...position);
      groupRef.current.rotation.set(...rotation);
      
      if (typeof scale === 'number') {
        groupRef.current.scale.setScalar(scale);
      } else {
        groupRef.current.scale.set(...scale);
      }
    }
  }, [position, rotation, scale, scene, modelLoaded, hasError]);

  // Handle loading errors
  useEffect(() => {
    if (!scene && !hasError) {
      const error = new Error(ERROR_MESSAGES.MODEL_NOT_FOUND);
      console.error(`${ERROR_MESSAGES.FAILED_TO_LOAD_MODEL}:`, error);
      setHasError(true);
      onError?.(error);
    }
  }, [scene, hasError, onError]);

  if (hasError || !scene) {
    return null;
  }

  return (
    <group ref={groupRef} name={name}>
      <primitive object={scene} />
    </group>
  );
};

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

// Pre-configured room model components
export const Bed: React.FC<Omit<RoomModelProps, 'modelUrl'>> = (props) => (
  <RoomModel modelUrl="/models/room/bed.glb" {...props} />
);

export const Desk: React.FC<Omit<RoomModelProps, 'modelUrl'>> = (props) => (
  <RoomModel modelUrl="/models/room/desk.glb" {...props} />
);

export const Chair: React.FC<Omit<RoomModelProps, 'modelUrl'>> = (props) => (
  <RoomModel modelUrl="/models/room/chair.glb" {...props} />
);

export const Bookshelf: React.FC<Omit<RoomModelProps, 'modelUrl'>> = (props) => (
  <RoomModel modelUrl="/models/room/bookshelf.glb" {...props} />
);

export const Rug: React.FC<Omit<RoomModelProps, 'modelUrl'>> = (props) => (
  <RoomModel modelUrl="/models/room/rug.glb" {...props} />
);

export const BedroomComplete: React.FC<Omit<RoomModelProps, 'modelUrl'>> = (props) => (
  <RoomModel modelUrl="/models/room/bedroom-complete.glb" {...props} />
);

export const ModernChair: React.FC<Omit<RoomModelProps, 'modelUrl'>> = (props) => (
  <RoomModel modelUrl="/models/room/modern-chair.glb" {...props} />
);

export const Plant: React.FC<Omit<RoomModelProps, 'modelUrl'>> = (props) => (
  <RoomModel modelUrl="/models/room/plant.glb" {...props} />
);

export default RoomModel; 