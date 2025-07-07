import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AvatarAnimationController } from '../services/avatarAnimationController';
import type { AvatarState, MovementIntensity } from '../services/avatarAnimationController';

interface AvatarProps {
  position?: [number, number, number];
  isSpeaking?: boolean;
  conversationState?: AvatarState;
  userIsTyping?: boolean;
  movementIntensity?: MovementIntensity;
  lastMessageLength?: number;
  timeSinceLastMessage?: number;
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
  isSpeaking = false,
  userIsTyping = false,
  movementIntensity = 'moderate',
  lastMessageLength = 0,
  timeSinceLastMessage = 0
}) => {
  // Refs for animated parts
  const headRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const leftEarRef = useRef<THREE.Mesh>(null);
  const rightEarRef = useRef<THREE.Mesh>(null);
  const leftPawRef = useRef<THREE.Mesh>(null);
  const rightPawRef = useRef<THREE.Mesh>(null);

  // Animation controller
  const [animationController] = useState(() => new AvatarAnimationController());

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

  // Update animation controller with current state
  useEffect(() => {
    animationController.updateState({
      isSpeaking,
      userIsTyping,
      intensity: movementIntensity,
      lastMessageLength,
      timeSinceLastMessage
    });
  }, [animationController, isSpeaking, userIsTyping, movementIntensity, lastMessageLength, timeSinceLastMessage]);

  // Cleanup animation controller on unmount
  useEffect(() => {
    return () => {
      animationController.destroy();
    };
  }, [animationController]);

  // Enhanced animation frame with movement patterns
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Update animation controller transitions
    animationController.updateTransition();
    
    // Get current movement pattern
    const pattern = animationController.getCurrentMovementPattern();
    
    // Apply head animations
    if (headRef.current) {
      // Breathing animation
      const breathingOffset = Math.sin(time * pattern.headBob.frequency) * pattern.headBob.amplitude * pattern.breathingIntensity;
      headRef.current.position.y = breathingOffset;
      
      // Head rotation and tilt
      headRef.current.rotation.x = pattern.headRotation.x + Math.sin(time * 0.5) * 0.02;
      headRef.current.rotation.y = pattern.headRotation.y;
      headRef.current.rotation.z = pattern.headTilt + Math.sin(time * 0.3) * 0.01;
    }
    
    // Apply ear animations
    if (leftEarRef.current) {
      const twitchOffset = Math.sin(time * pattern.earTwitch.frequency) * pattern.earTwitch.intensity;
      leftEarRef.current.rotation.z = pattern.earRotation.left + twitchOffset;
    }
    if (rightEarRef.current) {
      const twitchOffset = Math.sin(time * pattern.earTwitch.frequency + Math.PI) * pattern.earTwitch.intensity;
      rightEarRef.current.rotation.z = -pattern.earRotation.right + twitchOffset;
    }
    
    // Apply mouth animation when speaking
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
    
    // Apply tail animation
    if (tailRef.current) {
      const wagOffset = Math.sin(time * pattern.tailWag.frequency) * pattern.tailWag.intensity;
      tailRef.current.rotation.z = pattern.tailPosition + wagOffset;
    }
    
    // Apply body posture
    if (groupRef.current) {
      // Body lean
      groupRef.current.rotation.x = pattern.bodyLean.forward * 0.1;
      groupRef.current.rotation.y = pattern.bodyRotation;
      groupRef.current.rotation.z = pattern.bodyLean.side * 0.05;
    }
    
    // Apply paw gestures
    if (leftPawRef.current) {
      const gestureOffset = pattern.pawGesture === 'wave' ? Math.sin(time * 4) * 0.2 : 0;
      leftPawRef.current.rotation.x = pattern.frontPaws.left + gestureOffset;
    }
    if (rightPawRef.current) {
      const gestureOffset = pattern.pawGesture === 'point' ? Math.sin(time * 2) * 0.1 : 0;
      rightPawRef.current.rotation.x = pattern.frontPaws.right + gestureOffset;
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
      <mesh ref={leftEarRef} position={[-0.25, 0.1, 0.7]} geometry={geometries.ear} material={materials.primaryFur} castShadow />
      <mesh ref={rightEarRef} position={[0.25, 0.1, 0.7]} geometry={geometries.ear} material={materials.primaryFur} castShadow />
      
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
      <mesh ref={leftPawRef} position={[-0.2, -1.6, 0.4]} geometry={geometries.paw} material={materials.primaryFur} castShadow />
      <mesh ref={rightPawRef} position={[0.2, -1.6, 0.4]} geometry={geometries.paw} material={materials.primaryFur} castShadow />
      
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