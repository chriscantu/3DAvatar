import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import RoomModel from './RoomModel';

const RoomModelExample: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <Canvas
        camera={{ position: [0, 5, 10], fov: 75 }}
        shadows
      >
        <Environment preset="apartment" />
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        <RoomModel
          modelUrl="/models/room/bedroom-complete.glb"
          position={[0, 0, 0]}
          scale={1}
          name="bedroom-example"
        />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
};

export default RoomModelExample; 