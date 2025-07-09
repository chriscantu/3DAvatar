import React from 'react';
import ThreeDRoom from './ThreeDRoom';
import { FURNITURE_POSITIONS, MODEL_PATHS } from '../config/roomConstants';

export interface RoomPresetProps {
  isAvatarSpeaking?: boolean;
  userIsTyping?: boolean;
  lastMessageLength?: number;
  timeSinceLastMessage?: number;
}

// Geometric room (no 3D models)
export const GeometricRoom: React.FC<RoomPresetProps> = (props) => (
  <ThreeDRoom
    useRoomModels={false}
    {...props}
  />
);

// Basic furniture setup
export const BasicFurnitureRoom: React.FC<RoomPresetProps> = (props) => (
  <ThreeDRoom
    useRoomModels={true}
    furnitureModels={[
      {
        url: MODEL_PATHS.ROOM.BED,
        position: FURNITURE_POSITIONS.BED,
        name: 'bed'
      },
      {
        url: MODEL_PATHS.ROOM.DESK,
        position: FURNITURE_POSITIONS.DESK,
        name: 'desk'
      },
      {
        url: MODEL_PATHS.ROOM.CHAIR,
        position: FURNITURE_POSITIONS.CHAIR,
        name: 'chair'
      }
    ]}
    {...props}
  />
);

// Complete room with all furniture
export const CompleteRoom: React.FC<RoomPresetProps> = (props) => (
  <ThreeDRoom
    useRoomModels={true}
    furnitureModels={[
      {
        url: MODEL_PATHS.ROOM.BED,
        position: FURNITURE_POSITIONS.BED,
        name: 'bed'
      },
      {
        url: MODEL_PATHS.ROOM.DESK,
        position: FURNITURE_POSITIONS.DESK,
        name: 'desk'
      },
      {
        url: MODEL_PATHS.ROOM.CHAIR,
        position: FURNITURE_POSITIONS.CHAIR,
        name: 'chair'
      },
      {
        url: MODEL_PATHS.ROOM.BOOKSHELF,
        position: FURNITURE_POSITIONS.BOOKSHELF,
        name: 'bookshelf'
      },
      {
        url: MODEL_PATHS.ROOM.RUG,
        position: FURNITURE_POSITIONS.RUG,
        name: 'rug'
      }
    ]}
    {...props}
  />
);

// Complete room environment (single model)
export const CompleteRoomEnvironment: React.FC<RoomPresetProps> = (props) => (
  <ThreeDRoom
    useRoomModels={true}
    roomModelUrl={MODEL_PATHS.ROOM.BEDROOM_COMPLETE}
    {...props}
  />
);

// Modern room setup
export const ModernRoom: React.FC<RoomPresetProps> = (props) => (
  <ThreeDRoom
    useRoomModels={true}
    furnitureModels={[
      {
        url: MODEL_PATHS.ROOM.MODERN_CHAIR,
        position: FURNITURE_POSITIONS.CHAIR,
        name: 'modern-chair'
      },
      {
        url: MODEL_PATHS.ROOM.DESK,
        position: FURNITURE_POSITIONS.DESK,
        name: 'modern-desk'
      },
      {
        url: MODEL_PATHS.ROOM.PLANT,
        position: FURNITURE_POSITIONS.BOOKSHELF,
        name: 'plant'
      }
    ]}
    {...props}
  />
);

// Custom room builder
export const CustomRoom: React.FC<RoomPresetProps & {
  roomModelUrl?: string;
  furnitureModels?: Array<{
    url: string;
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number] | number;
    name?: string;
  }>;
}> = ({ roomModelUrl, furnitureModels, ...props }) => (
  <ThreeDRoom
    useRoomModels={true}
    roomModelUrl={roomModelUrl}
    furnitureModels={furnitureModels}
    {...props}
  />
);

// Export all presets as a collection
export const RoomPresets = {
  Geometric: GeometricRoom,
  BasicFurniture: BasicFurnitureRoom,
  Complete: CompleteRoom,
  CompleteEnvironment: CompleteRoomEnvironment,
  Modern: ModernRoom,
  Custom: CustomRoom,
} as const; 