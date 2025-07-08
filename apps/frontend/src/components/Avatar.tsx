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

// Avatar color configuration for easy customization - puppy-like colors
const AVATAR_COLORS = {
  PRIMARY_FUR: '#D2691E',    // Warmer brown like the reference puppy
  SECONDARY_FUR: '#F5DEB3',  // Cream/beige for snout and chest
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  PINK: '#FFB6C1',          // Softer pink
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
  movementIntensity = 'animated', // Changed from 'moderate' to 'animated' for more expressive movement
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
  const leftPupilRef = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);

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
      // Head and body parts - puppy-like proportions
      head: new THREE.SphereGeometry(0.4, GEOMETRY_CONFIG.SPHERE_SEGMENTS, GEOMETRY_CONFIG.SPHERE_SEGMENTS), // Larger head for puppy look
      snout: new THREE.CapsuleGeometry(0.08, 0.2, 4, 8), // Shorter, cuter snout
      nose: new THREE.SphereGeometry(0.05, GEOMETRY_CONFIG.LOW_POLY_SEGMENTS, GEOMETRY_CONFIG.LOW_POLY_SEGMENTS),
      eye: new THREE.SphereGeometry(0.08, GEOMETRY_CONFIG.LOW_POLY_SEGMENTS, GEOMETRY_CONFIG.LOW_POLY_SEGMENTS), // Larger, more expressive eyes
      pupil: new THREE.SphereGeometry(0.04, GEOMETRY_CONFIG.LOW_POLY_SEGMENTS, GEOMETRY_CONFIG.LOW_POLY_SEGMENTS),
      ear: new THREE.SphereGeometry(0.12, GEOMETRY_CONFIG.LOW_POLY_SEGMENTS, GEOMETRY_CONFIG.LOW_POLY_SEGMENTS), // Floppy round ears
      mouth: new THREE.SphereGeometry(0.08, GEOMETRY_CONFIG.LOW_POLY_SEGMENTS, GEOMETRY_CONFIG.LOW_POLY_SEGMENTS),
      
      // Body
      body: new THREE.BoxGeometry(0.6, 0.4, 1.2),
      
      // Neck - connects head to body
      neck: new THREE.CylinderGeometry(0.18, 0.22, 0.4, GEOMETRY_CONFIG.CYLINDER_SEGMENTS),
      
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
    // Add debug logging to track state changes
    console.log('Avatar state update:', {
      isSpeaking,
      userIsTyping,
      movementIntensity,
      lastMessageLength,
      timeSinceLastMessage,
      timestamp: new Date().toLocaleTimeString()
    });
    
    animationController.updateState({
      isSpeaking,
      userIsTyping,
      intensity: movementIntensity,
      lastMessageLength,
      timeSinceLastMessage
    });
    
    // Log the determined state
    const currentState = animationController.getCurrentState();
    console.log('Avatar controller state:', currentState.state, currentState);
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
    const currentState = animationController.getCurrentState();
    
    // Add subtle idle behaviors when not in active states
    const isIdle = currentState.state === 'idle';
    const occasionalLookAround = isIdle ? Math.sin(time * 0.1) * 0.3 : 0; // Very slow head turns
    const microMovements = Math.sin(time * 2.3) * 0.005; // Tiny random movements
    
    // Log state changes for debugging (reduced frequency)
    if (time % 3 < 0.1) { // Log every 3 seconds
      console.log('Avatar frame update:', {
        avatarState: currentState.state,
        pattern: pattern.pawGesture,
        bodyBounce: pattern.bodyBounce.height,
        tailWag: pattern.tailWag.intensity,
        time: time.toFixed(1)
      });
    }
    
    // Apply head animations
    if (headRef.current) {
      // Remove the awkward up-and-down breathing animation
      // Keep head at stable Y position
      headRef.current.position.y = 0;
      
      // Smoother head rotation and tilt with easing and idle behaviors
      const targetRotationX = pattern.headRotation.x + Math.sin(time * 0.3) * 0.01 + microMovements;
      const targetRotationY = pattern.headRotation.y + Math.sin(time * 0.4) * 0.005 + occasionalLookAround;
      const targetRotationZ = pattern.headTilt + Math.sin(time * 0.25) * 0.008 + microMovements * 0.5;
      
      // Use lerp for smoother transitions
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetRotationX, 0.05);
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetRotationY, 0.05);
      headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, targetRotationZ, 0.05);
    }
    
    // Apply ear animations with improved natural movement
    if (leftEarRef.current) {
      const baseTwitchOffset = Math.sin(time * pattern.earTwitch.frequency) * pattern.earTwitch.intensity;
      const naturalEarSway = Math.sin(time * 0.6) * 0.02; // Gentle natural movement
      const targetRotation = pattern.earRotation.left + baseTwitchOffset + naturalEarSway;
      
      // Smooth ear movement with lerp
      leftEarRef.current.rotation.z = THREE.MathUtils.lerp(
        leftEarRef.current.rotation.z, 
        -0.3 + targetRotation, // Base angle + movement
        0.08
      );
    }
    if (rightEarRef.current) {
      const baseTwitchOffset = Math.sin(time * pattern.earTwitch.frequency + Math.PI) * pattern.earTwitch.intensity;
      const naturalEarSway = Math.sin(time * 0.8) * 0.02; // Slightly different frequency for asymmetry
      const targetRotation = pattern.earRotation.right + baseTwitchOffset + naturalEarSway;
      
      // Smooth ear movement with lerp
      rightEarRef.current.rotation.z = THREE.MathUtils.lerp(
        rightEarRef.current.rotation.z, 
        0.3 + targetRotation, // Base angle + movement
        0.08
      );
    }
    
    // Apply mouth animation when speaking - reduced frequency
    if (mouthRef.current) {
      if (isSpeaking) {
        const mouthScale = 0.5 + Math.sin(time * 6) * 0.2;
        mouthRef.current.scale.setY(Math.max(0.3, mouthScale));
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
    
    // Apply body posture and bouncing
    if (groupRef.current) {
      // Body lean
      groupRef.current.rotation.x = pattern.bodyLean.forward * 0.1;
      groupRef.current.rotation.y = pattern.bodyRotation;
      groupRef.current.rotation.z = pattern.bodyLean.side * 0.05;
      
      // Dog-like bouncing using pattern data
      if (pattern.bodyBounce.height > 0) {
        // Create natural excited dog bouncing - like bouncing on hind legs
        const bounceTime = time * pattern.bodyBounce.frequency;
        
        // Primary bounce (up and down)
        const primaryBounce = Math.sin(bounceTime) * pattern.bodyBounce.height;
        
        // Secondary bounce (slight forward/back rock)
        const rockMotion = Math.sin(bounceTime * 0.5) * (pattern.bodyBounce.height * 0.1);
        
        // Slight side-to-side wiggle (very subtle)
        const wiggle = Math.sin(bounceTime * 1.3) * (pattern.bodyBounce.height * 0.05);
        
        // Apply natural dog bounce - only upward bounces (excited dogs don't go below ground)
        groupRef.current.position.y = position[1] + Math.max(0, primaryBounce);
        groupRef.current.position.z = position[2] + rockMotion;
        groupRef.current.position.x = position[0] + wiggle;
        
        // Add slight rotation for more natural movement
        groupRef.current.rotation.x = Math.sin(bounceTime * 0.7) * 0.02;
      } else {
        // Smoothly return to original position
        const currentY = groupRef.current.position.y;
        const currentZ = groupRef.current.position.z;
        const currentX = groupRef.current.position.x;
        const currentRotX = groupRef.current.rotation.x;
        
        groupRef.current.position.y = THREE.MathUtils.lerp(currentY, position[1], 0.1);
        groupRef.current.position.z = THREE.MathUtils.lerp(currentZ, position[2], 0.1);
        groupRef.current.position.x = THREE.MathUtils.lerp(currentX, position[0], 0.1);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(currentRotX, pattern.bodyLean.forward * 0.1, 0.1);
      }
    }
    
    // Apply paw gestures - much more natural movement
    if (leftPawRef.current) {
      const gestureOffset = pattern.pawGesture === 'wave' ? Math.sin(time * 1.2) * 0.08 : 0;
      leftPawRef.current.rotation.x = pattern.frontPaws.left + gestureOffset;
    }
    if (rightPawRef.current) {
      const gestureOffset = pattern.pawGesture === 'point' ? Math.sin(time * 1.0) * 0.03 : 0;
      rightPawRef.current.rotation.x = pattern.frontPaws.right + gestureOffset;
    }
    
    // Apply subtle pupil movement to follow head rotation and prevent z-fighting
    if (leftPupilRef.current && headRef.current) {
      // Very subtle movement that follows head rotation
      const headRotY = headRef.current.rotation.y;
      const headRotX = headRef.current.rotation.x;
      
      // Pupils move slightly in the direction of head rotation for natural eye movement
      leftPupilRef.current.position.x = -0.15 + headRotY * 0.01;
      leftPupilRef.current.position.y = 0.1 - headRotX * 0.01;
    }
    if (rightPupilRef.current && headRef.current) {
      const headRotY = headRef.current.rotation.y;
      const headRotX = headRef.current.rotation.x;
      
      rightPupilRef.current.position.x = 0.15 + headRotY * 0.01;
      rightPupilRef.current.position.y = 0.1 - headRotX * 0.01;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Debug state indicator - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial 
            color={
              animationController.getCurrentState().state === 'listening' ? '#00ff00' :
              animationController.getCurrentState().state === 'speaking' ? '#ff0000' :
              animationController.getCurrentState().state === 'excited' ? '#ffff00' :
              animationController.getCurrentState().state === 'curious' ? '#00ffff' :
              animationController.getCurrentState().state === 'thinking' ? '#ff00ff' :
              '#ffffff'
            }
          />
        </mesh>
      )}
      
      {/* Neck - connects head to body naturally */}
      <mesh position={[0, -0.4, 0.3]} geometry={geometries.neck} material={materials.primaryFur} castShadow />
      
      {/* Head - positioned to connect naturally with neck but not too low */}
      <mesh ref={headRef} position={[0, -0.1, 0.6]} geometry={geometries.head} material={materials.primaryFur} castShadow />
      
      {/* Snout - shorter and cuter like the reference puppy */}
      <mesh position={[0, -0.2, 0.8]} rotation={[Math.PI / 2, 0, 0]} geometry={geometries.snout} material={materials.secondaryFur} castShadow />
      
      {/* Nose - positioned at tip of shorter snout */}
      <mesh position={[0, -0.2, 0.9]} geometry={geometries.nose} material={materials.black} castShadow />
      
      {/* Eyes - larger and more expressive like the reference puppy */}
      <mesh position={[-0.15, 0.1, 0.85]} geometry={geometries.eye} material={materials.white} castShadow />
      <mesh position={[0.15, 0.1, 0.85]} geometry={geometries.eye} material={materials.white} castShadow />
      
      {/* Pupils - positioned to match larger eyes */}
      <mesh ref={leftPupilRef} position={[-0.15, 0.1, 0.89]} geometry={geometries.pupil} material={materials.black} />
      <mesh ref={rightPupilRef} position={[0.15, 0.1, 0.89]} geometry={geometries.pupil} material={materials.black} />
      
      {/* Ears - floppy ears hanging down like in the reference image */}
      <mesh ref={leftEarRef} position={[-0.25, -0.05, 0.65]} rotation={[0.2, 0, -0.8]} geometry={geometries.ear} material={materials.primaryFur} castShadow />
      <mesh ref={rightEarRef} position={[0.25, -0.05, 0.65]} rotation={[0.2, 0, 0.8]} geometry={geometries.ear} material={materials.primaryFur} castShadow />
      
      {/* Mouth - positioned under shorter snout */}
      <mesh ref={mouthRef} position={[0, -0.3, 0.85]} geometry={geometries.mouth} material={materials.pink} castShadow />
      
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
      
      {/* Collar - positioned properly on the neck */}
      <mesh position={[0, -0.4, 0.3]} geometry={geometries.collar} material={materials.pink} castShadow />
      
      {/* Collar tag */}
      <mesh position={[0.2, -0.4, 0.3]} geometry={geometries.collarTag} material={materials.gold} castShadow />
    </group>
  );
};

export default React.memo(Avatar); 