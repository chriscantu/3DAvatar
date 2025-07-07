import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AvatarProps {
  position?: [number, number, number];
  isSpeaking?: boolean;
}

// Avatar color configuration for easy customization
const AVATAR_COLORS = {
  PRIMARY_FUR: '#8B4513',
  SECONDARY_FUR: '#A0522D', 
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  PINK: '#FF69B4',
  GOLD: '#FFD700'
} as const;

// Shared geometry configurations to reduce memory usage
const GEOMETRY_CONFIG = {
  SPHERE_SEGMENTS: 16,
  CYLINDER_SEGMENTS: 8,
  LOW_POLY_SEGMENTS: 8
} as const;

const Avatar: React.FC<AvatarProps> = ({ 
  position = [0, 1, 0], 
  isSpeaking = false 
}) => {
  // Refs for animated parts
  const headRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Memoize materials to prevent recreation on every render
  const materials = useMemo(() => {
    return {
      primaryFur: new THREE.MeshStandardMaterial({ 
        color: AVATAR_COLORS.PRIMARY_FUR,
        roughness: 0.8,
        metalness: 0.1
      }),
      secondaryFur: new THREE.MeshStandardMaterial({ 
        color: AVATAR_COLORS.SECONDARY_FUR,
        roughness: 0.8,
        metalness: 0.1
      }),
      black: new THREE.MeshStandardMaterial({ 
        color: AVATAR_COLORS.BLACK,
        roughness: 0.9,
        metalness: 0.0
      }),
      white: new THREE.MeshStandardMaterial({ 
        color: AVATAR_COLORS.WHITE,
        roughness: 0.7,
        metalness: 0.0
      }),
      pink: new THREE.MeshStandardMaterial({ 
        color: AVATAR_COLORS.PINK,
        roughness: 0.6,
        metalness: 0.0
      }),
      gold: new THREE.MeshStandardMaterial({ 
        color: AVATAR_COLORS.GOLD,
        roughness: 0.3,
        metalness: 0.7
      })
    };
  }, []);

  // Memoize geometries to prevent recreation
  const geometries = useMemo(() => {
    return {
      // Head and body parts
      head: new THREE.SphereGeometry(0.4, GEOMETRY_CONFIG.SPHERE_SEGMENTS, GEOMETRY_CONFIG.SPHERE_SEGMENTS),
      snout: new THREE.SphereGeometry(0.25, GEOMETRY_CONFIG.LOW_POLY_SEGMENTS, GEOMETRY_CONFIG.LOW_POLY_SEGMENTS),
      nose: new THREE.SphereGeometry(0.08, GEOMETRY_CONFIG.LOW_POLY_SEGMENTS, GEOMETRY_CONFIG.LOW_POLY_SEGMENTS),
      eye: new THREE.SphereGeometry(0.08, GEOMETRY_CONFIG.LOW_POLY_SEGMENTS, GEOMETRY_CONFIG.LOW_POLY_SEGMENTS),
      pupil: new THREE.SphereGeometry(0.04, GEOMETRY_CONFIG.LOW_POLY_SEGMENTS, GEOMETRY_CONFIG.LOW_POLY_SEGMENTS),
      ear: new THREE.SphereGeometry(0.12, GEOMETRY_CONFIG.LOW_POLY_SEGMENTS, GEOMETRY_CONFIG.LOW_POLY_SEGMENTS),
      mouth: new THREE.SphereGeometry(0.1, GEOMETRY_CONFIG.LOW_POLY_SEGMENTS, GEOMETRY_CONFIG.LOW_POLY_SEGMENTS),
      
      // Body
      body: new THREE.BoxGeometry(0.6, 0.4, 1.2),
      
      // Legs and paws
      leg: new THREE.CylinderGeometry(0.08, 0.08, 0.8, GEOMETRY_CONFIG.CYLINDER_SEGMENTS),
      paw: new THREE.SphereGeometry(0.1, GEOMETRY_CONFIG.LOW_POLY_SEGMENTS, GEOMETRY_CONFIG.LOW_POLY_SEGMENTS),
      
      // Tail
      tail: new THREE.CylinderGeometry(0.08, 0.06, 0.5, GEOMETRY_CONFIG.CYLINDER_SEGMENTS),
      tailTip: new THREE.SphereGeometry(0.08, GEOMETRY_CONFIG.LOW_POLY_SEGMENTS, GEOMETRY_CONFIG.LOW_POLY_SEGMENTS),
      
      // Accessories
      collar: new THREE.CylinderGeometry(0.35, 0.35, 0.1, GEOMETRY_CONFIG.CYLINDER_SEGMENTS),
      collarTag: new THREE.BoxGeometry(0.08, 0.06, 0.02)
    };
  }, []);

  // Cleanup materials and geometries on unmount
  useEffect(() => {
    return () => {
      // Dispose materials safely
      Object.values(materials).forEach(material => {
        if (material && typeof material.dispose === 'function') {
          material.dispose();
        }
      });
      
      // Dispose geometries safely
      Object.values(geometries).forEach(geometry => {
        if (geometry && typeof geometry.dispose === 'function') {
          geometry.dispose();
        }
      });
    };
  }, [materials, geometries]);

  // Optimized animation frame with better performance
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Breathing animation - subtle head movement
    if (headRef.current) {
      headRef.current.position.y = Math.sin(time * 2) * 0.02;
    }
    
    // Mouth animation when speaking - more realistic
    if (mouthRef.current) {
      if (isSpeaking) {
        const mouthScale = 0.5 + Math.sin(time * 10) * 0.3;
        mouthRef.current.scale.setY(Math.max(0.2, mouthScale));
      } else {
        // Gradually return to normal size
        const currentScale = mouthRef.current.scale.y;
        const targetScale = 0.5;
        mouthRef.current.scale.setY(
          THREE.MathUtils.lerp(currentScale, targetScale, 0.1)
        );
      }
    }
    
    // Tail wagging animation - more natural
    if (tailRef.current) {
      const wagIntensity = isSpeaking ? 0.5 : 0.3;
      tailRef.current.rotation.z = Math.sin(time * 3) * wagIntensity;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Head - positioned at front of body */}
      <mesh ref={headRef} position={[0, 0, 0.7]} geometry={geometries.head} material={materials.primaryFur} castShadow />
      
      {/* Snout */}
      <mesh position={[0, -0.1, 1.0]} geometry={geometries.snout} material={materials.secondaryFur} castShadow />
      
      {/* Nose */}
      <mesh position={[0, -0.1, 1.2]} geometry={geometries.nose} material={materials.black} castShadow />
      
      {/* Eyes */}
      <mesh position={[-0.15, 0.1, 1.0]} geometry={geometries.eye} material={materials.white} castShadow />
      <mesh position={[0.15, 0.1, 1.0]} geometry={geometries.eye} material={materials.white} castShadow />
      
      {/* Pupils */}
      <mesh position={[-0.15, 0.1, 1.05]} geometry={geometries.pupil} material={materials.black} castShadow />
      <mesh position={[0.15, 0.1, 1.05]} geometry={geometries.pupil} material={materials.black} castShadow />
      
      {/* Ears - properly attached to head */}
      <mesh position={[-0.25, 0.1, 0.7]} geometry={geometries.ear} material={materials.primaryFur} castShadow />
      <mesh position={[0.25, 0.1, 0.7]} geometry={geometries.ear} material={materials.primaryFur} castShadow />
      
      {/* Mouth */}
      <mesh ref={mouthRef} position={[0, -0.2, 1.1]} geometry={geometries.mouth} material={materials.pink} castShadow />
      
      {/* Body - longer dog body */}
      <mesh position={[0, -0.8, 0]} geometry={geometries.body} material={materials.primaryFur} castShadow />
      
      {/* Front legs - at the front of the body */}
      <mesh position={[-0.2, -1.2, 0.4]} geometry={geometries.leg} material={materials.primaryFur} castShadow />
      <mesh position={[0.2, -1.2, 0.4]} geometry={geometries.leg} material={materials.primaryFur} castShadow />
      
      {/* Back legs - at the back of the body */}
      <mesh position={[-0.2, -1.2, -0.4]} geometry={geometries.leg} material={materials.primaryFur} castShadow />
      <mesh position={[0.2, -1.2, -0.4]} geometry={geometries.leg} material={materials.primaryFur} castShadow />
      
      {/* Front paws */}
      <mesh position={[-0.2, -1.6, 0.4]} geometry={geometries.paw} material={materials.primaryFur} castShadow />
      <mesh position={[0.2, -1.6, 0.4]} geometry={geometries.paw} material={materials.primaryFur} castShadow />
      
      {/* Back paws */}
      <mesh position={[-0.2, -1.6, -0.4]} geometry={geometries.paw} material={materials.primaryFur} castShadow />
      <mesh position={[0.2, -1.6, -0.4]} geometry={geometries.paw} material={materials.primaryFur} castShadow />
      
      {/* Tail - properly attached to back of body */}
      <mesh ref={tailRef} position={[0, -0.6, -0.7]} geometry={geometries.tail} material={materials.primaryFur} castShadow />
      
      {/* Tail tip */}
      <mesh position={[0, -0.6, -0.95]} geometry={geometries.tailTip} material={materials.primaryFur} castShadow />
      
      {/* Collar - positioned at neck area */}
      <mesh position={[0, -0.4, 0.5]} geometry={geometries.collar} material={materials.pink} castShadow />
      
      {/* Collar tag */}
      <mesh position={[0.2, -0.4, 0.5]} geometry={geometries.collarTag} material={materials.gold} castShadow />
    </group>
  );
};

export default React.memo(Avatar); 