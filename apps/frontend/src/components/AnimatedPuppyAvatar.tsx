import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface AnimatedPuppyAvatarProps {
  position?: [number, number, number];
}

const AnimatedPuppyAvatar: React.FC<AnimatedPuppyAvatarProps> = ({
  position = [0, 0, 0]
}) => {
  const bodyRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    // Scale the body to be more dog-like: elongated, not spherical
    if (bodyRef.current) {
      bodyRef.current.scale.set(1.2, 0.8, 2.2); // More elongated and realistic
    }
  }, []);

  return (
    <group position={position} scale={[1.5, 1.5, 1.5]}>
      {/* BODY - More realistic dog body shape - properly elevated */}
      <mesh ref={bodyRef} position={[0, 0.45, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#D2B48C" roughness={0.9} metalness={0.0} />
      </mesh>

      {/* CHEST - Subtle, naturally positioned */}
      <mesh position={[0, 0.35, 0.4]} castShadow>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color="#F5F5DC" roughness={0.9} metalness={0.0} />
      </mesh>

      {/* NECK - Smoother transition */}
      <mesh position={[0, 0.65, 0.45]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 0.25, 8]} />
        <meshStandardMaterial color="#D2B48C" roughness={0.9} metalness={0.0} />
      </mesh>

      {/* HEAD - More realistic proportions */}
      <mesh position={[0, 0.8, 0.6]} castShadow receiveShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#D2B48C" roughness={0.9} metalness={0.0} />
      </mesh>

      {/* SNOUT - Realistic tapered cone shape */}
      <mesh position={[0, 0.75, 0.95]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.14, 0.35, 12]} />
        <meshStandardMaterial color="#F5F5DC" roughness={0.9} metalness={0.0} />
      </mesh>

      {/* NOSE - Positioned at snout tip */}
      <mesh position={[0, 0.75, 1.125]} castShadow>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#000000" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* EYES - Properly positioned on head */}
      <mesh position={[-0.15, 0.85, 0.72]} castShadow>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.1} metalness={0.0} />
      </mesh>
      <mesh position={[0.15, 0.85, 0.72]} castShadow>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.1} metalness={0.0} />
      </mesh>

      {/* IRIS - Brown colored iris with proper Z separation */}
      <mesh position={[-0.15, 0.85, 0.775]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color="#8B4513" roughness={0.2} metalness={0.0} />
      </mesh>
      <mesh position={[0.15, 0.85, 0.775]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color="#8B4513" roughness={0.2} metalness={0.0} />
      </mesh>

      {/* PUPILS - Clear Z separation to prevent flickering */}
      <mesh position={[-0.15, 0.85, 0.795]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#000000" roughness={0.1} metalness={0.0} />
      </mesh>
      <mesh position={[0.15, 0.85, 0.795]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#000000" roughness={0.1} metalness={0.0} />
      </mesh>

      {/* EARS - More natural positioning */}
      <mesh 
        position={[-0.22, 0.95, 0.5]} 
        rotation={[0.3, 0, -0.4]} 
        castShadow
      >
        <cylinderGeometry args={[0.04, 0.08, 0.25, 8]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} metalness={0.0} />
      </mesh>
      <mesh 
        position={[0.22, 0.95, 0.5]} 
        rotation={[0.3, 0, 0.4]} 
        castShadow
      >
        <cylinderGeometry args={[0.04, 0.08, 0.25, 8]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} metalness={0.0} />
      </mesh>

      {/* INNER EARS - Pink detail */}
      <mesh 
        position={[-0.2, 0.92, 0.53]} 
        rotation={[0.3, 0, -0.4]} 
      >
        <cylinderGeometry args={[0.02, 0.04, 0.15, 6]} />
        <meshStandardMaterial color="#FFB6C1" roughness={0.7} metalness={0.0} />
      </mesh>
      <mesh 
        position={[0.2, 0.92, 0.53]} 
        rotation={[0.3, 0, 0.4]} 
      >
        <cylinderGeometry args={[0.02, 0.04, 0.15, 6]} />
        <meshStandardMaterial color="#FFB6C1" roughness={0.7} metalness={0.0} />
      </mesh>

      {/* LEGS - Properly positioned to support body weight */}
      <mesh position={[-0.25, 0.225, 0.4]} castShadow>
        <cylinderGeometry args={[0.06, 0.07, 0.45, 8]} />
        <meshStandardMaterial color="#D2B48C" roughness={0.9} metalness={0.0} />
      </mesh>
      <mesh position={[0.25, 0.225, 0.4]} castShadow>
        <cylinderGeometry args={[0.06, 0.07, 0.45, 8]} />
        <meshStandardMaterial color="#D2B48C" roughness={0.9} metalness={0.0} />
      </mesh>
      <mesh position={[-0.25, 0.225, -0.4]} castShadow>
        <cylinderGeometry args={[0.06, 0.07, 0.45, 8]} />
        <meshStandardMaterial color="#D2B48C" roughness={0.9} metalness={0.0} />
      </mesh>
      <mesh position={[0.25, 0.225, -0.4]} castShadow>
        <cylinderGeometry args={[0.06, 0.07, 0.45, 8]} />
        <meshStandardMaterial color="#D2B48C" roughness={0.9} metalness={0.0} />
      </mesh>

      {/* PAWS - Exactly at ground level (y=0) */}
      <mesh position={[-0.25, 0.09, 0.4]} castShadow>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial color="#2F2F2F" roughness={0.8} metalness={0.0} />
      </mesh>
      <mesh position={[0.25, 0.09, 0.4]} castShadow>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial color="#2F2F2F" roughness={0.8} metalness={0.0} />
      </mesh>
      <mesh position={[-0.25, 0.09, -0.4]} castShadow>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial color="#2F2F2F" roughness={0.8} metalness={0.0} />
      </mesh>
      <mesh position={[0.25, 0.09, -0.4]} castShadow>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial color="#2F2F2F" roughness={0.8} metalness={0.0} />
      </mesh>

      {/* TAIL - More realistic positioning */}
      <mesh 
        position={[0, 0.55, -0.8]} 
        rotation={[-0.2, 0, 0]} 
        castShadow
      >
        <cylinderGeometry args={[0.03, 0.06, 0.4, 8]} />
        <meshStandardMaterial color="#D2B48C" roughness={0.9} metalness={0.0} />
      </mesh>

      {/* MOUTH - Subtle indication */}
      <mesh position={[0, 0.7, 1.1]} castShadow>
        <sphereGeometry args={[0.02, 6, 6]} />
        <meshStandardMaterial color="#2F2F2F" roughness={0.8} metalness={0.0} />
      </mesh>
    </group>
  );
};

export default AnimatedPuppyAvatar; 