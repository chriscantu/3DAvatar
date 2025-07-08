import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface RealisticPuppyAvatarProps {
  position?: [number, number, number];
  isSpeaking?: boolean;
}

const RealisticPuppyAvatar: React.FC<RealisticPuppyAvatarProps> = ({ 
  position = [0, 0, 0], 
  isSpeaking = false 
}) => {
  // Refs for animation
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const leftEarRef = useRef<THREE.Mesh>(null);
  const rightEarRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);

  // Create realistic puppy materials
  const materials = useMemo(() => {
    return {
      // Main fur - warm brown like the reference
      mainFur: new THREE.MeshLambertMaterial({ 
        color: '#D2B48C', // Tan color
      }),
      // White chest and face markings
      whiteFur: new THREE.MeshLambertMaterial({ 
        color: '#FFFFFF',
      }),
      // Darker brown for ears and back
      darkFur: new THREE.MeshLambertMaterial({ 
        color: '#8B4513',
      }),
      // Pink for nose and tongue
      pink: new THREE.MeshLambertMaterial({ 
        color: '#FFB6C1',
      }),
      // Black for eyes and nose details
      black: new THREE.MeshLambertMaterial({ 
        color: '#000000',
      }),
      // Eye material
      eyeWhite: new THREE.MeshLambertMaterial({ 
        color: '#FFFFFF',
      }),
    };
  }, []);

  // Create puppy geometries with better proportions
  const geometries = useMemo(() => {
    return {
      // Body parts with realistic puppy proportions
      body: new THREE.CapsuleGeometry(0.3, 0.6, 4, 8), // Puppy body
      head: new THREE.SphereGeometry(0.25, 16, 16), // Proportional head
      snout: new THREE.CapsuleGeometry(0.08, 0.15, 4, 8), // Short puppy snout
      
      // Ears - floppy and realistic
      ear: new THREE.SphereGeometry(0.1, 8, 8), // Rounded floppy ears
      
      // Eyes - large and expressive
      eye: new THREE.SphereGeometry(0.05, 8, 8),
      pupil: new THREE.SphereGeometry(0.025, 6, 6),
      
      // Nose and mouth
      nose: new THREE.SphereGeometry(0.03, 6, 6),
      
      // Legs - puppy proportions
      leg: new THREE.CapsuleGeometry(0.04, 0.2, 4, 8),
      paw: new THREE.SphereGeometry(0.05, 6, 6),
      
      // Tail
      tail: new THREE.CapsuleGeometry(0.02, 0.3, 4, 8),
    };
  }, []);

  // Animation loop
  useFrame((state) => {
    if (!headRef.current || !tailRef.current) return;

    const time = state.clock.getElapsedTime();
    
    // Head movements - gentle and puppy-like
    if (isSpeaking) {
      headRef.current.rotation.y = Math.sin(time * 4) * 0.1;
      headRef.current.rotation.x = Math.sin(time * 3) * 0.05;
    } else {
      headRef.current.rotation.y = Math.sin(time * 0.5) * 0.05;
      headRef.current.rotation.x = Math.sin(time * 0.3) * 0.02;
    }

    // Tail wagging - always happy puppy
    tailRef.current.rotation.z = Math.sin(time * 6) * 0.3;
    
    // Ear movements - subtle
    if (leftEarRef.current && rightEarRef.current) {
      leftEarRef.current.rotation.z = Math.sin(time * 2) * 0.1;
      rightEarRef.current.rotation.z = Math.sin(time * 2.5) * 0.1;
    }

    // Eye blinking
    if (leftEyeRef.current && rightEyeRef.current) {
      const blinkTime = Math.sin(time * 0.8);
      if (blinkTime > 0.95) {
        leftEyeRef.current.scale.y = 0.1;
        rightEyeRef.current.scale.y = 0.1;
      } else {
        leftEyeRef.current.scale.y = 1;
        rightEyeRef.current.scale.y = 1;
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Main body */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} geometry={geometries.body} material={materials.mainFur} castShadow />
      
      {/* Head */}
      <mesh ref={headRef} position={[0, 0.15, 0.4]} geometry={geometries.head} material={materials.mainFur} castShadow />
      
      {/* Snout */}
      <mesh position={[0, 0.05, 0.65]} rotation={[Math.PI / 2, 0, 0]} geometry={geometries.snout} material={materials.whiteFur} castShadow />
      
      {/* Nose */}
      <mesh position={[0, 0.05, 0.75]} geometry={geometries.nose} material={materials.black} castShadow />
      
      {/* Eyes */}
      <mesh ref={leftEyeRef} position={[-0.08, 0.2, 0.6]} geometry={geometries.eye} material={materials.eyeWhite} castShadow />
      <mesh ref={rightEyeRef} position={[0.08, 0.2, 0.6]} geometry={geometries.eye} material={materials.eyeWhite} castShadow />
      
      {/* Pupils */}
      <mesh position={[-0.08, 0.2, 0.63]} geometry={geometries.pupil} material={materials.black} />
      <mesh position={[0.08, 0.2, 0.63]} geometry={geometries.pupil} material={materials.black} />
      
      {/* Ears - floppy and hanging */}
      <mesh ref={leftEarRef} position={[-0.15, 0.25, 0.3]} rotation={[0.3, 0, -0.5]} geometry={geometries.ear} material={materials.darkFur} castShadow />
      <mesh ref={rightEarRef} position={[0.15, 0.25, 0.3]} rotation={[0.3, 0, 0.5]} geometry={geometries.ear} material={materials.darkFur} castShadow />
      
      {/* Legs */}
      <mesh position={[-0.15, -0.25, 0.2]} geometry={geometries.leg} material={materials.mainFur} castShadow />
      <mesh position={[0.15, -0.25, 0.2]} geometry={geometries.leg} material={materials.mainFur} castShadow />
      <mesh position={[-0.15, -0.25, -0.2]} geometry={geometries.leg} material={materials.mainFur} castShadow />
      <mesh position={[0.15, -0.25, -0.2]} geometry={geometries.leg} material={materials.mainFur} castShadow />
      
      {/* Paws */}
      <mesh position={[-0.15, -0.35, 0.2]} geometry={geometries.paw} material={materials.darkFur} castShadow />
      <mesh position={[0.15, -0.35, 0.2]} geometry={geometries.paw} material={materials.darkFur} castShadow />
      <mesh position={[-0.15, -0.35, -0.2]} geometry={geometries.paw} material={materials.darkFur} castShadow />
      <mesh position={[0.15, -0.35, -0.2]} geometry={geometries.paw} material={materials.darkFur} castShadow />
      
      {/* Tail */}
      <mesh ref={tailRef} position={[0, 0.1, -0.4]} rotation={[0.5, 0, 0]} geometry={geometries.tail} material={materials.mainFur} castShadow />
      
      {/* White chest marking */}
      <mesh position={[0, -0.05, 0.35]} geometry={new THREE.SphereGeometry(0.12, 8, 8)} material={materials.whiteFur} castShadow />
    </group>
  );
};

export default RealisticPuppyAvatar; 