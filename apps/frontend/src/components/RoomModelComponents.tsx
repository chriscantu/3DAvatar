import React from 'react';
import RoomModel from './RoomModel';

interface RoomModelProps {
  modelUrl: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number] | number;
  name?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

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