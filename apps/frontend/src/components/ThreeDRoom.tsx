import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Avatar from './Avatar';

interface ThreeDRoomProps {
  isAvatarSpeaking?: boolean;
  userIsTyping?: boolean;
  lastMessageLength?: number;
  timeSinceLastMessage?: number;
}

const Room = ({ 
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
    <mesh receiveShadow position={[0, -0.5, 0]}>
      <boxGeometry args={[10, 1, 10]} />
      <meshStandardMaterial color="#8B5FBF" />
    </mesh>
    
    {/* Walls - Light purple */}
    {/* Back wall */}
    <mesh position={[0, 2, -5]} receiveShadow>
      <boxGeometry args={[10, 4, 0.1]} />
      <meshStandardMaterial color="#E6E6FA" />
    </mesh>
    
    {/* Front wall with window cutout - split into sections */}
    {/* Left section of front wall */}
    <mesh position={[-3.75, 2, 5]} receiveShadow>
      <boxGeometry args={[2.5, 4, 0.1]} />
      <meshStandardMaterial color="#E6E6FA" />
    </mesh>
    {/* Right section of front wall */}
    <mesh position={[3.75, 2, 5]} receiveShadow>
      <boxGeometry args={[2.5, 4, 0.1]} />
      <meshStandardMaterial color="#E6E6FA" />
    </mesh>
    {/* Top section of front wall (above window) */}
    <mesh position={[0, 3.5, 5]} receiveShadow>
      <boxGeometry args={[2.5, 1, 0.1]} />
      <meshStandardMaterial color="#E6E6FA" />
    </mesh>
    {/* Bottom section of front wall (below window) */}
    <mesh position={[0, 0.5, 5]} receiveShadow>
      <boxGeometry args={[2.5, 1, 0.1]} />
      <meshStandardMaterial color="#E6E6FA" />
    </mesh>
    
    {/* Left wall */}
    <mesh position={[-5, 2, 0]} receiveShadow>
      <boxGeometry args={[0.1, 4, 10]} />
      <meshStandardMaterial color="#E6E6FA" />
    </mesh>
    {/* Right wall */}
    <mesh position={[5, 2, 0]} receiveShadow>
      <boxGeometry args={[0.1, 4, 10]} />
      <meshStandardMaterial color="#E6E6FA" />
    </mesh>
    
    {/* Window frame - outer */}
    <mesh position={[0, 2, 5.1]}>
      <boxGeometry args={[2.5, 2, 0.15]} />
      <meshStandardMaterial color="#4A4A4A" />
    </mesh>
    
    {/* Window frame - inner */}
    <mesh position={[0, 2, 5.12]}>
      <boxGeometry args={[2.3, 1.8, 0.05]} />
      <meshStandardMaterial color="#2F4F4F" />
    </mesh>
    
    {/* Window glass */}
    <mesh position={[0, 2, 5.13]} receiveShadow>
      <boxGeometry args={[2.1, 1.6, 0.02]} />
      <meshStandardMaterial color="#87CEEB" transparent opacity={0.3} />
    </mesh>
    
    {/* Window cross bars */}
    <mesh position={[0, 2, 5.14]}>
      <boxGeometry args={[0.05, 1.8, 0.02]} />
      <meshStandardMaterial color="#2F4F4F" />
    </mesh>
    <mesh position={[0, 2, 5.14]}>
      <boxGeometry args={[2.1, 0.05, 0.02]} />
      <meshStandardMaterial color="#2F4F4F" />
    </mesh>
    
    {/* Bed - positioned against left wall */}
    <mesh position={[-3.5, 0.5, -2]} receiveShadow>
      <boxGeometry args={[2, 1, 3]} />
      <meshStandardMaterial color="#FF69B4" />
    </mesh>
    
    {/* Bed pillow */}
    <mesh position={[-3.5, 1.15, -0.8]} receiveShadow>
      <boxGeometry args={[1.8, 0.3, 0.8]} />
      <meshStandardMaterial color="#FFF0F5" />
    </mesh>
    
    {/* Rug with paw print pattern - centered in room */}
    <mesh position={[0, 0.01, 0]} receiveShadow>
      <cylinderGeometry args={[1.5, 1.5, 0.1, 32]} />
      <meshStandardMaterial color="#DDA0DD" />
    </mesh>
    
    {/* Posters - flush with walls */}
    {/* Inuyasha Poster - on left wall */}
    <mesh position={[-4.99, 2.5, -2]} receiveShadow rotation={[0, Math.PI/2, 0]}>
      <planeGeometry args={[1.5, 2]} />
      <meshStandardMaterial color="#FF6B6B" />
    </mesh>
    
    {/* Pokemon Poster - on right wall */}
    <mesh position={[4.99, 2.5, 2]} receiveShadow rotation={[0, -Math.PI/2, 0]}>
      <planeGeometry args={[1.5, 2]} />
      <meshStandardMaterial color="#4ECDC4" />
    </mesh>
    
    {/* Dogs Poster - on back wall */}
    <mesh position={[0, 2.5, -4.99]} receiveShadow>
      <planeGeometry args={[2, 1.5]} />
      <meshStandardMaterial color="#FFE66D" />
    </mesh>
    
    {/* Small desk - positioned against right wall */}
    <mesh position={[3.5, 0.5, -3]} receiveShadow>
      <boxGeometry args={[1.5, 1, 0.8]} />
      <meshStandardMaterial color="#8B4513" />
    </mesh>
    
    {/* Trophy on desk - properly centered */}
    <mesh position={[3.5, 1.15, -3]} receiveShadow>
      <cylinderGeometry args={[0.1, 0.1, 0.3, 8]} />
      <meshStandardMaterial color="#FFD700" />
    </mesh>
    
    {/* Dog plushie on bed - properly positioned */}
    <mesh position={[-3.5, 1.3, -1]} receiveShadow>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial color="#8B4513" />
    </mesh>
    
    {/* Plushie ears - properly aligned */}
    <mesh position={[-3.5, 1.6, -1]} receiveShadow>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial color="#8B4513" />
    </mesh>
    <mesh position={[-3.3, 1.6, -1]} receiveShadow>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial color="#8B4513" />
    </mesh>
    
    {/* Lighting */}
    <ambientLight intensity={0.6} />
    <directionalLight position={[5, 10, 7.5]} intensity={0.8} castShadow />
    <pointLight position={[0, 4, 0]} intensity={0.5} color="#E6E6FA" />
    
    {/* Avatar - standing on the floor */}
    <Avatar 
      position={[0, 1.6, 0]} 
      isSpeaking={isAvatarSpeaking}
      userIsTyping={userIsTyping}
      lastMessageLength={lastMessageLength}
      timeSinceLastMessage={timeSinceLastMessage}
    />
  </>
);

const ThreeDRoom: React.FC<ThreeDRoomProps> = ({ 
  isAvatarSpeaking = false,
  userIsTyping = false,
  lastMessageLength = 0,
  timeSinceLastMessage = 0
}) => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#222' }}>
      <Canvas shadows camera={{ position: [2, 2.5, 2], fov: 60 }}>
        <Room 
          isAvatarSpeaking={isAvatarSpeaking}
          userIsTyping={userIsTyping}
          lastMessageLength={lastMessageLength}
          timeSinceLastMessage={timeSinceLastMessage}
        />
        <OrbitControls 
          enablePan={false} 
          maxPolarAngle={Math.PI / 2.1}
          target={[0, 1, 0]}
          minDistance={3}
          maxDistance={8}
        />
      </Canvas>
    </div>
  );
};

export default ThreeDRoom; 