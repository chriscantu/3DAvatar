import React from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AvatarProps {
  position?: [number, number, number];
  isSpeaking?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ position = [0, 1, 0], isSpeaking = false }) => {
  const headRef = React.useRef<THREE.Mesh>(null);
  const mouthRef = React.useRef<THREE.Mesh>(null);
  const tailRef = React.useRef<THREE.Mesh>(null);

  // Simple breathing and tail wagging animation
  useFrame((state) => {
    if (headRef.current) {
      headRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.02;
    }
    
    // Mouth animation when speaking
    if (mouthRef.current && isSpeaking) {
      mouthRef.current.scale.y = 0.5 + Math.sin(state.clock.elapsedTime * 10) * 0.3;
    } else if (mouthRef.current) {
      mouthRef.current.scale.y = 0.5;
    }
    
    // Tail wagging animation
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.3;
    }
  });

  return (
    <group position={position}>
      {/* Head - positioned at front of body */}
      <mesh ref={headRef} position={[0, 0, 0.7]} castShadow>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Snout */}
      <mesh position={[0, -0.1, 1.0]} castShadow>
        <sphereGeometry args={[0.25, 12, 12]} />
        <meshStandardMaterial color="#A0522D" />
      </mesh>
      
      {/* Nose */}
      <mesh position={[0, -0.1, 1.2]} castShadow>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[-0.15, 0.1, 1.0]} castShadow>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0.15, 0.1, 1.0]} castShadow>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Pupils */}
      <mesh position={[-0.15, 0.1, 1.05]} castShadow>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.15, 0.1, 1.05]} castShadow>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* Ears - properly attached to head */}
      <mesh position={[-0.25, 0.1, 0.7]} castShadow>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0.25, 0.1, 0.7]} castShadow>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Mouth */}
      <mesh ref={mouthRef} position={[0, -0.2, 1.1]} castShadow>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#FF69B4" />
      </mesh>
      
      {/* Body - longer dog body */}
      <mesh position={[0, -0.8, 0]} castShadow>
        <boxGeometry args={[0.6, 0.4, 1.2]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Front legs - at the front of the body */}
      <mesh position={[-0.2, -1.2, 0.4]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.8, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0.2, -1.2, 0.4]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.8, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Back legs - at the back of the body */}
      <mesh position={[-0.2, -1.2, -0.4]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.8, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0.2, -1.2, -0.4]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.8, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Front paws */}
      <mesh position={[-0.2, -1.6, 0.4]} castShadow>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0.2, -1.6, 0.4]} castShadow>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Back paws */}
      <mesh position={[-0.2, -1.6, -0.4]} castShadow>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0.2, -1.6, -0.4]} castShadow>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Tail - properly attached to back of body */}
      <mesh ref={tailRef} position={[0, -0.6, -0.7]} castShadow>
        <cylinderGeometry args={[0.08, 0.06, 0.5, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Tail tip */}
      <mesh position={[0, -0.6, -0.95]} castShadow>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Collar - positioned at neck area */}
      <mesh position={[0, -0.4, 0.5]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.1, 8]} />
        <meshStandardMaterial color="#FF69B4" />
      </mesh>
      
      {/* Collar tag */}
      <mesh position={[0.2, -0.4, 0.5]} castShadow>
        <boxGeometry args={[0.08, 0.06, 0.02]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
    </group>
  );
};

export default Avatar; 