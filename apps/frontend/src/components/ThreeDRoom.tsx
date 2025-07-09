import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Avatar from './Avatar';
import RoomModel from './RoomModel';
import { useRoomModels } from './RoomModelHooks';
import {
  ROOM_DIMENSIONS,
  ROOM_POSITIONS,
  ROOM_COLORS,
  FURNITURE_POSITIONS,
  FURNITURE_DIMENSIONS,
  FURNITURE_COLORS,
  POSTER_POSITIONS,
  POSTER_DIMENSIONS,
  POSTER_COLORS,
  POSTER_ROTATIONS,
  WINDOW_DIMENSIONS,
  LIGHTING_CONFIG,
  AVATAR_CONFIG,
  CAMERA_CONFIG,
  UI_CONFIG,
  GEOMETRY_SEGMENTS,
  MATERIAL_PROPERTIES,
  ERROR_MESSAGES,
  CONSOLE_MESSAGES,
} from '../config/roomConstants';

export interface ThreeDRoomProps {
  isAvatarSpeaking?: boolean;
  userIsTyping?: boolean;
  lastMessageLength?: number;
  timeSinceLastMessage?: number;
  useRoomModels?: boolean; // New prop to enable/disable 3D models
  roomModelUrl?: string;   // URL to a complete room model
  furnitureModels?: Array<{
    url: string;
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number] | number;
    name?: string;
  }>;
}

// Geometric room fallback (existing room)
const GeometricRoom = ({ 
  isAvatarSpeaking = false, 
  userIsTyping = false, 
  lastMessageLength = 0, 
  timeSinceLastMessage = 0 
}: { 
  isAvatarSpeaking?: boolean; 
  userIsTyping?: boolean; 
  lastMessageLength?: number; 
  timeSinceLastMessage?: number; 
}) => (
  <>
    {/* Floor - Purple carpet */}
    <mesh receiveShadow position={ROOM_POSITIONS.FLOOR}>
      <boxGeometry args={[ROOM_DIMENSIONS.WIDTH, ROOM_DIMENSIONS.FLOOR_THICKNESS, ROOM_DIMENSIONS.DEPTH]} />
      <meshStandardMaterial color={ROOM_COLORS.FLOOR} />
    </mesh>
    
    {/* Walls - Light purple */}
    {/* Back wall */}
    <mesh position={ROOM_POSITIONS.BACK_WALL} receiveShadow>
      <boxGeometry args={[ROOM_DIMENSIONS.WIDTH, ROOM_DIMENSIONS.HEIGHT, ROOM_DIMENSIONS.WALL_THICKNESS]} />
      <meshStandardMaterial color={ROOM_COLORS.WALLS} />
    </mesh>
    
    {/* Front wall with window cutout - split into sections */}
    {/* Left section of front wall */}
    <mesh position={ROOM_POSITIONS.WINDOW_LEFT_SECTION} receiveShadow>
      <boxGeometry args={WINDOW_DIMENSIONS.LEFT_SECTION} />
      <meshStandardMaterial color={ROOM_COLORS.WALLS} />
    </mesh>
    {/* Right section of front wall */}
    <mesh position={ROOM_POSITIONS.WINDOW_RIGHT_SECTION} receiveShadow>
      <boxGeometry args={WINDOW_DIMENSIONS.RIGHT_SECTION} />
      <meshStandardMaterial color={ROOM_COLORS.WALLS} />
    </mesh>
    {/* Top section of front wall (above window) */}
    <mesh position={ROOM_POSITIONS.WINDOW_TOP_SECTION} receiveShadow>
      <boxGeometry args={WINDOW_DIMENSIONS.TOP_SECTION} />
      <meshStandardMaterial color={ROOM_COLORS.WALLS} />
    </mesh>
    {/* Bottom section of front wall (below window) */}
    <mesh position={ROOM_POSITIONS.WINDOW_BOTTOM_SECTION} receiveShadow>
      <boxGeometry args={WINDOW_DIMENSIONS.BOTTOM_SECTION} />
      <meshStandardMaterial color={ROOM_COLORS.WALLS} />
    </mesh>
    
    {/* Left wall */}
    <mesh position={ROOM_POSITIONS.LEFT_WALL} receiveShadow>
      <boxGeometry args={[ROOM_DIMENSIONS.WALL_THICKNESS, ROOM_DIMENSIONS.HEIGHT, ROOM_DIMENSIONS.DEPTH]} />
      <meshStandardMaterial color={ROOM_COLORS.WALLS} />
    </mesh>
    {/* Right wall */}
    <mesh position={ROOM_POSITIONS.RIGHT_WALL} receiveShadow>
      <boxGeometry args={[ROOM_DIMENSIONS.WALL_THICKNESS, ROOM_DIMENSIONS.HEIGHT, ROOM_DIMENSIONS.DEPTH]} />
      <meshStandardMaterial color={ROOM_COLORS.WALLS} />
    </mesh>
    
    {/* Window frame - outer */}
    <mesh position={ROOM_POSITIONS.WINDOW_FRAME_OUTER}>
      <boxGeometry args={WINDOW_DIMENSIONS.FRAME_OUTER} />
      <meshStandardMaterial color={ROOM_COLORS.WINDOW_FRAME_OUTER} />
    </mesh>
    
    {/* Window frame - inner */}
    <mesh position={ROOM_POSITIONS.WINDOW_FRAME_INNER}>
      <boxGeometry args={WINDOW_DIMENSIONS.FRAME_INNER} />
      <meshStandardMaterial color={ROOM_COLORS.WINDOW_FRAME_INNER} />
    </mesh>
    
    {/* Window glass */}
    <mesh position={ROOM_POSITIONS.WINDOW_GLASS} receiveShadow>
      <boxGeometry args={WINDOW_DIMENSIONS.GLASS} />
      <meshStandardMaterial 
        color={ROOM_COLORS.WINDOW_GLASS} 
        transparent={MATERIAL_PROPERTIES.WINDOW_GLASS.TRANSPARENT} 
        opacity={MATERIAL_PROPERTIES.WINDOW_GLASS.OPACITY} 
      />
    </mesh>
    
    {/* Window cross bars */}
    <mesh position={ROOM_POSITIONS.WINDOW_CROSS_VERTICAL}>
      <boxGeometry args={WINDOW_DIMENSIONS.CROSS_VERTICAL} />
      <meshStandardMaterial color={ROOM_COLORS.WINDOW_CROSS} />
    </mesh>
    <mesh position={ROOM_POSITIONS.WINDOW_CROSS_HORIZONTAL}>
      <boxGeometry args={WINDOW_DIMENSIONS.CROSS_HORIZONTAL} />
      <meshStandardMaterial color={ROOM_COLORS.WINDOW_CROSS} />
    </mesh>
    
    {/* Bed - positioned against left wall */}
    <mesh position={FURNITURE_POSITIONS.BED} receiveShadow>
      <boxGeometry args={FURNITURE_DIMENSIONS.BED} />
      <meshStandardMaterial color={FURNITURE_COLORS.BED} />
    </mesh>
    
    {/* Bed pillow */}
    <mesh position={FURNITURE_POSITIONS.BED_PILLOW} receiveShadow>
      <boxGeometry args={FURNITURE_DIMENSIONS.BED_PILLOW} />
      <meshStandardMaterial color={FURNITURE_COLORS.BED_PILLOW} />
    </mesh>
    
    {/* Rug with paw print pattern - centered in room */}
    <mesh position={FURNITURE_POSITIONS.RUG} receiveShadow>
      <cylinderGeometry args={[...FURNITURE_DIMENSIONS.RUG_RADIUS, GEOMETRY_SEGMENTS.CYLINDER_RADIAL]} />
      <meshStandardMaterial color={FURNITURE_COLORS.RUG} />
    </mesh>
    
    {/* Posters - flush with walls */}
    {/* Inuyasha Poster - on left wall */}
    <mesh position={POSTER_POSITIONS.INUYASHA} receiveShadow rotation={POSTER_ROTATIONS.INUYASHA}>
      <planeGeometry args={POSTER_DIMENSIONS.INUYASHA} />
      <meshStandardMaterial color={POSTER_COLORS.INUYASHA} />
    </mesh>
    
    {/* Pokemon Poster - on right wall */}
    <mesh position={POSTER_POSITIONS.POKEMON} receiveShadow rotation={POSTER_ROTATIONS.POKEMON}>
      <planeGeometry args={POSTER_DIMENSIONS.POKEMON} />
      <meshStandardMaterial color={POSTER_COLORS.POKEMON} />
    </mesh>
    
    {/* Dogs Poster - on back wall */}
    <mesh position={POSTER_POSITIONS.DOGS} receiveShadow>
      <planeGeometry args={POSTER_DIMENSIONS.DOGS} />
      <meshStandardMaterial color={POSTER_COLORS.DOGS} />
    </mesh>
    
    {/* Small desk - positioned against right wall */}
    <mesh position={FURNITURE_POSITIONS.DESK} receiveShadow>
      <boxGeometry args={FURNITURE_DIMENSIONS.DESK} />
      <meshStandardMaterial color={FURNITURE_COLORS.DESK} />
    </mesh>
    
    {/* Trophy on desk - properly centered */}
    <mesh position={FURNITURE_POSITIONS.TROPHY} receiveShadow>
      <cylinderGeometry args={[...FURNITURE_DIMENSIONS.TROPHY, GEOMETRY_SEGMENTS.TROPHY_SEGMENTS]} />
      <meshStandardMaterial color={FURNITURE_COLORS.TROPHY} />
    </mesh>
    
    {/* Dog plushie on bed - properly positioned */}
    <mesh position={FURNITURE_POSITIONS.PLUSHIE} receiveShadow>
      <sphereGeometry args={FURNITURE_DIMENSIONS.PLUSHIE} />
      <meshStandardMaterial color={FURNITURE_COLORS.PLUSHIE} />
    </mesh>
    
    {/* Plushie ears - properly aligned */}
    <mesh position={FURNITURE_POSITIONS.PLUSHIE_EAR_1} receiveShadow>
      <sphereGeometry args={FURNITURE_DIMENSIONS.PLUSHIE_EAR} />
      <meshStandardMaterial color={FURNITURE_COLORS.PLUSHIE} />
    </mesh>
    <mesh position={FURNITURE_POSITIONS.PLUSHIE_EAR_2} receiveShadow>
      <sphereGeometry args={FURNITURE_DIMENSIONS.PLUSHIE_EAR} />
      <meshStandardMaterial color={FURNITURE_COLORS.PLUSHIE} />
    </mesh>
    
    {/* Lighting - enhanced for better model visibility */}
    <ambientLight intensity={LIGHTING_CONFIG.AMBIENT_INTENSITY} />
    <directionalLight 
      position={LIGHTING_CONFIG.DIRECTIONAL_POSITION} 
      intensity={LIGHTING_CONFIG.DIRECTIONAL_INTENSITY} 
      castShadow 
    />
    <pointLight 
      position={LIGHTING_CONFIG.POINT_POSITION} 
      intensity={LIGHTING_CONFIG.POINT_INTENSITY} 
      color={LIGHTING_CONFIG.POINT_COLOR} 
    />
    
    {/* Animated Puppy Avatar - positioned on the floor with proper ground contact */}
    <Avatar 
      position={AVATAR_CONFIG.POSITION} 
      isSpeaking={isAvatarSpeaking}
      userIsTyping={userIsTyping}
      lastMessageLength={lastMessageLength}
      timeSinceLastMessage={timeSinceLastMessage}
      movementIntensity={AVATAR_CONFIG.MOVEMENT_INTENSITY}
    />
  </>
);

// 3D Model Room
const ModelRoom = ({ 
  isAvatarSpeaking = false, 
  userIsTyping = false, 
  lastMessageLength = 0, 
  timeSinceLastMessage = 0,
  roomModelUrl,
  furnitureModels = []
}: { 
  isAvatarSpeaking?: boolean; 
  userIsTyping?: boolean; 
  lastMessageLength?: number; 
  timeSinceLastMessage?: number; 
  roomModelUrl?: string;
  furnitureModels?: Array<{
    url: string;
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number] | number;
    name?: string;
  }>;
}) => {
  const [roomModelFailed, setRoomModelFailed] = useState(false);
  
  const modelManagement = useRoomModels(furnitureModels.map(model => ({
    modelUrl: model.url,
    position: model.position,
    rotation: model.rotation,
    scale: model.scale,
    name: model.name
  })));

  const handleRoomModelLoad = () => {
    console.log(CONSOLE_MESSAGES.ROOM_MODEL_LOADED);
  };

  const handleRoomModelError = (error: Error) => {
    console.warn(`${ERROR_MESSAGES.FAILED_TO_LOAD_MODEL}, ${ERROR_MESSAGES.FALLING_BACK_TO_GEOMETRIC}:`, error);
    setRoomModelFailed(true);
  };

  // If room model failed to load, fall back to geometric room
  if (roomModelFailed) {
    return (
      <GeometricRoom 
        isAvatarSpeaking={isAvatarSpeaking}
        userIsTyping={userIsTyping}
        lastMessageLength={lastMessageLength}
        timeSinceLastMessage={timeSinceLastMessage}
      />
    );
  }

  return (
    <>
      {/* Room environment model */}
      {roomModelUrl && (
        <RoomModel
          modelUrl={roomModelUrl}
          position={[0, 0, 0]}
          name="room-environment"
          onLoad={handleRoomModelLoad}
          onError={handleRoomModelError}
        />
      )}
      
      {/* Individual furniture models */}
      {furnitureModels.map((model, index) => (
        <RoomModel
          key={`furniture-${index}`}
          modelUrl={model.url}
          position={model.position}
          rotation={model.rotation}
          scale={model.scale}
          name={model.name || `furniture-${index}`}
          onLoad={() => modelManagement.handleModelLoad(model.url)}
          onError={() => modelManagement.handleModelError(model.url)}
        />
      ))}
      
      {/* Fallback geometric elements if no room model */}
      {!roomModelUrl && (
        <>
          {/* Simple floor */}
          <mesh receiveShadow position={ROOM_POSITIONS.FLOOR}>
            <boxGeometry args={[ROOM_DIMENSIONS.WIDTH, ROOM_DIMENSIONS.FLOOR_THICKNESS, ROOM_DIMENSIONS.DEPTH]} />
            <meshStandardMaterial color={ROOM_COLORS.FLOOR} />
          </mesh>
        </>
      )}
      
      {/* Lighting - enhanced for better model visibility */}
      <ambientLight intensity={LIGHTING_CONFIG.AMBIENT_INTENSITY} />
      <directionalLight 
        position={LIGHTING_CONFIG.DIRECTIONAL_POSITION} 
        intensity={LIGHTING_CONFIG.DIRECTIONAL_INTENSITY} 
        castShadow 
      />
      <pointLight 
        position={LIGHTING_CONFIG.POINT_POSITION} 
        intensity={LIGHTING_CONFIG.POINT_INTENSITY} 
        color={LIGHTING_CONFIG.POINT_COLOR} 
      />
      
      {/* Animated Puppy Avatar - positioned on the floor with proper ground contact */}
      <Avatar 
        position={AVATAR_CONFIG.POSITION} 
        isSpeaking={isAvatarSpeaking}
        userIsTyping={userIsTyping}
        lastMessageLength={lastMessageLength}
        timeSinceLastMessage={timeSinceLastMessage}
        movementIntensity={AVATAR_CONFIG.MOVEMENT_INTENSITY}
      />
    </>
  );
};

const ThreeDRoom: React.FC<ThreeDRoomProps> = ({ 
  isAvatarSpeaking = false,
  userIsTyping = false,
  lastMessageLength = 0,
  timeSinceLastMessage = 0,
  useRoomModels = false,
  roomModelUrl,
  furnitureModels = []
}) => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: UI_CONFIG.BACKGROUND_COLOR }}>
      <Canvas shadows camera={{ 
        position: CAMERA_CONFIG.POSITION, 
        fov: CAMERA_CONFIG.FOV 
      }}>
        {useRoomModels ? (
          <ModelRoom 
            isAvatarSpeaking={isAvatarSpeaking}
            userIsTyping={userIsTyping}
            lastMessageLength={lastMessageLength}
            timeSinceLastMessage={timeSinceLastMessage}
            roomModelUrl={roomModelUrl}
            furnitureModels={furnitureModels}
          />
        ) : (
          <GeometricRoom 
            isAvatarSpeaking={isAvatarSpeaking}
            userIsTyping={userIsTyping}
            lastMessageLength={lastMessageLength}
            timeSinceLastMessage={timeSinceLastMessage}
          />
        )}
        <OrbitControls 
          enablePan={false} 
          maxPolarAngle={CAMERA_CONFIG.MAX_POLAR_ANGLE}
          target={CAMERA_CONFIG.TARGET}
          minDistance={CAMERA_CONFIG.MIN_DISTANCE}
          maxDistance={CAMERA_CONFIG.MAX_DISTANCE}
        />
      </Canvas>
    </div>
  );
};

export default ThreeDRoom; 