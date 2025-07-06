import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Avatar from './Avatar';

interface ThreeDRoomProps {
  isAvatarSpeaking?: boolean;
}

const Room = ({ isAvatarSpeaking = false }: { isAvatarSpeaking?: boolean }) => (
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
    {/* Front wall with window cutout */}
    <mesh position={[0, 2, 5]} receiveShadow>
      <boxGeometry args={[10, 4, 0.1]} />
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
      <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
    </mesh>
    
    {/* Bed */}
    <mesh position={[-3, 0.5, -2]} receiveShadow>
      <boxGeometry args={[2.5, 1, 3]} />
      <meshStandardMaterial color="#FF69B4" />
    </mesh>
    
    {/* Bed pillow */}
    <mesh position={[-3, 1.2, -0.5]} receiveShadow>
      <boxGeometry args={[2, 0.3, 0.8]} />
      <meshStandardMaterial color="#FFF0F5" />
    </mesh>
    
    {/* Rug with paw print pattern */}
    <mesh position={[0, 0.01, 0]} receiveShadow>
      <cylinderGeometry args={[1.5, 1.5, 0.1, 32]} />
      <meshStandardMaterial color="#DDA0DD" />
    </mesh>
    
    {/* Posters */}
    {/* Inuyasha Poster */}
    <mesh position={[-4.95, 2.5, -2]} receiveShadow>
      <planeGeometry args={[1.5, 2]} />
      <meshStandardMaterial color="#FF6B6B" />
    </mesh>
    
    {/* Pokemon Poster */}
    <mesh position={[4.95, 2.5, 2]} receiveShadow>
      <planeGeometry args={[1.5, 2]} />
      <meshStandardMaterial color="#4ECDC4" />
    </mesh>
    
    {/* Dogs Poster */}
    <mesh position={[0, 2.5, -4.95]} receiveShadow>
      <planeGeometry args={[2, 1.5]} />
      <meshStandardMaterial color="#FFE66D" />
    </mesh>
    
    {/* Small desk */}
    <mesh position={[3, 0.5, -3]} receiveShadow>
      <boxGeometry args={[1.5, 1, 0.8]} />
      <meshStandardMaterial color="#8B4513" />
    </mesh>
    
    {/* Trophy on desk */}
    <mesh position={[3, 1.2, -3]} receiveShadow>
      <cylinderGeometry args={[0.1, 0.1, 0.3, 8]} />
      <meshStandardMaterial color="#FFD700" />
    </mesh>
    
    {/* Dog plushie on bed */}
    <mesh position={[-3, 1.5, -1]} receiveShadow>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial color="#8B4513" />
    </mesh>
    
    {/* Plushie ears */}
    <mesh position={[-3, 1.8, -1]} receiveShadow>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial color="#8B4513" />
    </mesh>
    <mesh position={[-2.8, 1.8, -1]} receiveShadow>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial color="#8B4513" />
    </mesh>
    
    {/* Lighting */}
    <ambientLight intensity={0.6} />
    <directionalLight position={[5, 10, 7.5]} intensity={0.8} castShadow />
    <pointLight position={[0, 4, 0]} intensity={0.5} color="#E6E6FA" />
    
    {/* Avatar */}
    <Avatar position={[0, 1.5, 0]} isSpeaking={isAvatarSpeaking} />
  </>
);

const ThreeDRoom: React.FC<ThreeDRoomProps> = ({ isAvatarSpeaking = false }) => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#222' }}>
      <Canvas shadows camera={{ position: [0, 3, 12], fov: 50 }}>
        <Room isAvatarSpeaking={isAvatarSpeaking} />
        <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} />
      </Canvas>
    </div>
  );
};

export default ThreeDRoom; 