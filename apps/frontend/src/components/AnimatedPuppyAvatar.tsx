import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BreathingController } from '../services/breathingController';
import { 
  AVATAR_ANIMATION,
  ANIMATION_TIMING,
  MATH_CONSTANTS
} from '../config/breathingAnimationConstants';
import { AVATAR_CONFIG } from '../config/roomConstants';

interface AnimatedPuppyAvatarProps {
  position?: [number, number, number];
  isSpeaking?: boolean;
  userIsTyping?: boolean;
  lastMessageLength?: number;
  movementIntensity?: 'subtle' | 'animated' | 'energetic';
}

const AnimatedPuppyAvatar: React.FC<AnimatedPuppyAvatarProps> = ({
  position = [0, 0, 0],
  isSpeaking = false,
  userIsTyping = false,
  lastMessageLength = 0,
  movementIntensity = 'subtle'
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const chestRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const breathingController = useRef<BreathingController | null>(null);

  // Initialize breathing controller
  useEffect(() => {
    if (!breathingController.current) {
      const breathingParams = isSpeaking ? 
        BreathingController.presets.EXCITED : 
        userIsTyping ? 
          BreathingController.presets.ALERT : 
          BreathingController.presets.RESTING;
      
      breathingController.current = new BreathingController(breathingParams);
    }
  }, [isSpeaking, userIsTyping]); // Add dependencies since we use them in the effect

  // Update breathing parameters based on avatar state
  useEffect(() => {
    if (!breathingController.current) return;

    const breathingParams = isSpeaking ? 
      BreathingController.presets.EXCITED : 
      userIsTyping ? 
        BreathingController.presets.ALERT : 
        BreathingController.presets.RESTING;
    
    breathingController.current.updateParams(breathingParams);
  }, [isSpeaking, userIsTyping]);

  useEffect(() => {
    // Scale the body to be more dog-like: elongated, not spherical
    if (bodyRef.current) {
      bodyRef.current.scale.set(
        AVATAR_ANIMATION.SCALE.BODY_BASE_X, 
        AVATAR_ANIMATION.SCALE.BODY_BASE_Y, 
        AVATAR_ANIMATION.SCALE.BODY_BASE_Z
      );
    }
  }, []);

  // Animation loop for breathing and other animations
  useFrame((state) => {
    if (!groupRef.current || !breathingController.current) return;

    const time = state.clock.getElapsedTime();
    const deltaTime = state.clock.getDelta();
    
    // Update breathing animation
    const breathingState = breathingController.current.update(deltaTime);
    
    // Calculate animation intensity based on movement setting
    const targetIntensity = movementIntensity === 'energetic' ? 
      AVATAR_ANIMATION.MOVEMENT_INTENSITY.ENERGETIC : 
      movementIntensity === 'animated' ? 
        AVATAR_ANIMATION.MOVEMENT_INTENSITY.ANIMATED : 
        AVATAR_ANIMATION.MOVEMENT_INTENSITY.SUBTLE;

    // Apply breathing animation to body and chest (more realistic)
    if (bodyRef.current && chestRef.current) {
      const breathingIntensity = breathingState.intensity * AVATAR_ANIMATION.BREATHING_SCALE.OVERALL_INTENSITY;
      
      // Body breathing (subtle torso expansion, mainly in X and Z)
      bodyRef.current.scale.x = AVATAR_ANIMATION.SCALE.BODY_BASE_X * (1 + breathingIntensity * AVATAR_ANIMATION.BREATHING_SCALE.BODY_X_FACTOR);
      bodyRef.current.scale.z = AVATAR_ANIMATION.SCALE.BODY_BASE_Z * (1 + breathingIntensity * AVATAR_ANIMATION.BREATHING_SCALE.BODY_Z_FACTOR);
      bodyRef.current.scale.y = AVATAR_ANIMATION.SCALE.BODY_BASE_Y; // Keep Y scale constant
      
      // Chest breathing (more pronounced expansion)
      chestRef.current.scale.x = AVATAR_ANIMATION.SCALE.CHEST_BASE * (1 + breathingIntensity * AVATAR_ANIMATION.BREATHING_SCALE.CHEST_X_FACTOR);
      chestRef.current.scale.z = AVATAR_ANIMATION.SCALE.CHEST_BASE * (1 + breathingIntensity * AVATAR_ANIMATION.BREATHING_SCALE.CHEST_Z_FACTOR);
      chestRef.current.scale.y = AVATAR_ANIMATION.SCALE.CHEST_BASE * (1 + breathingIntensity * AVATAR_ANIMATION.BREATHING_SCALE.CHEST_Y_FACTOR);
      
      // Subtle chest position adjustment for breathing
      const chestOffset = breathingIntensity * AVATAR_ANIMATION.POSITION.CHEST_OFFSET_FACTOR;
      chestRef.current.position.y = AVATAR_ANIMATION.POSITION.CHEST_BASE_Y + chestOffset;
      chestRef.current.position.z = AVATAR_ANIMATION.POSITION.CHEST_BASE_Z + chestOffset * AVATAR_ANIMATION.POSITION.CHEST_OFFSET_Z_FACTOR;
    }

    // Apply subtle shoulder/head movement for breathing
    if (headRef.current) {
      const shoulderOffset = breathingState.shoulderOffset * AVATAR_ANIMATION.BREATHING_SCALE.SHOULDER_FACTOR;
      headRef.current.position.y = AVATAR_ANIMATION.POSITION.HEAD_BASE_Y + shoulderOffset;
    }

    // Speaking animation - head movement (modulated by breathing)
    if (isSpeaking && headRef.current) {
      const speakingIntensity = Math.min(lastMessageLength / ANIMATION_TIMING.SPEAKING.INTENSITY_DIVISOR, 1.0);
      const breathingModifier = 1 - (breathingState.intensity * ANIMATION_TIMING.SPEAKING.BREATHING_MODIFIER);
      headRef.current.rotation.y = Math.sin(time * ANIMATION_TIMING.SPEAKING.FREQUENCY_MULTIPLIER) * ANIMATION_TIMING.SPEAKING.ROTATION_Y_FACTOR * speakingIntensity * breathingModifier;
      headRef.current.rotation.x = Math.sin(time * (ANIMATION_TIMING.SPEAKING.FREQUENCY_MULTIPLIER - 1)) * ANIMATION_TIMING.SPEAKING.ROTATION_X_FACTOR * speakingIntensity * breathingModifier;
    } else if (headRef.current) {
      // Idle animation - gentle swaying combined with breathing
      const idleIntensity = targetIntensity * (1 - breathingState.intensity * ANIMATION_TIMING.IDLE.BREATHING_INTENSITY_FACTOR);
      headRef.current.rotation.y = Math.sin(time * ANIMATION_TIMING.IDLE.FREQUENCY_Y) * ANIMATION_TIMING.IDLE.ROTATION_Y_FACTOR * idleIntensity;
      headRef.current.rotation.x = Math.sin(time * ANIMATION_TIMING.IDLE.FREQUENCY_X) * ANIMATION_TIMING.IDLE.ROTATION_X_FACTOR * idleIntensity;
    }

    // User typing response - slight head tilt (modulated by breathing)
    if (userIsTyping && headRef.current) {
      const typingIntensity = 1 - (breathingState.intensity * ANIMATION_TIMING.TYPING.BREATHING_MODIFIER);
      headRef.current.rotation.z = Math.sin(time * ANIMATION_TIMING.TYPING.FREQUENCY_MULTIPLIER) * ANIMATION_TIMING.TYPING.ROTATION_Z_FACTOR * typingIntensity;
    } else if (headRef.current) {
      headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, 0, MATH_CONSTANTS.LERP_FACTOR);
    }

    // Add subtle breathing-based head movement
    if (!isSpeaking && !userIsTyping && headRef.current) {
      const breathingHeadMovement = breathingState.intensity * AVATAR_ANIMATION.BREATHING_SCALE.HEAD_BREATHING_FACTOR;
      headRef.current.rotation.x += breathingHeadMovement;
    }

    // Keep the whole avatar group at the correct position (prevent legs from going below floor)
    if (groupRef.current) {
      // Ensure the avatar stays at the correct position without vertical movement
      groupRef.current.position.set(position[0], position[1], position[2]);
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[AVATAR_CONFIG.SCALE, AVATAR_CONFIG.SCALE, AVATAR_CONFIG.SCALE]}>
      {/* Body */}
      <mesh ref={bodyRef} position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Chest */}
      <mesh ref={chestRef} position={[0, AVATAR_CONFIG.POSITION.CHEST_BASE_Y, AVATAR_CONFIG.POSITION.CHEST_BASE_Z]}>
        <boxGeometry args={[0.8, 0.6, 0.8]} />
        <meshStandardMaterial color="#A0522D" />
      </mesh>

      {/* Head */}
      <mesh ref={headRef} position={[0, AVATAR_CONFIG.POSITION.HEAD_BASE_Y, 0.6]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.2, 0.9, 0.9]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.2, 0.9, 0.9]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 0.75, 1.1]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Ears */}
      <mesh position={[-0.4, 1.1, 0.4]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.3, 0.5, 0.1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[0.4, 1.1, 0.4]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.3, 0.5, 0.1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Tail */}
      <mesh position={[0, 0.2, -0.8]} rotation={[0.5, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 0.8, 8]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.3, -0.6, 0.3]}>
        <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0.3, -0.6, 0.3]}>
        <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[-0.3, -0.6, -0.3]}>
        <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0.3, -0.6, -0.3]}>
        <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </group>
  );
};

export default AnimatedPuppyAvatar; 