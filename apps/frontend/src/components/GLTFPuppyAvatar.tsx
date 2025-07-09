import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import type { GLTF } from 'three-stdlib';
import { BreathingController } from '../services/breathingController';
import { 
  AVATAR_ANIMATION,
  ANIMATION_TIMING,
  MATH_CONSTANTS,
  BREATHING_INTENSITY
} from '../config/breathingAnimationConstants';

interface GLTFPuppyAvatarProps {
  position?: [number, number, number];
  isSpeaking?: boolean;
  userIsTyping?: boolean;
  lastMessageLength?: number;
  movementIntensity?: 'subtle' | 'animated' | 'energetic';
}

// Model URL - will fall back to geometric avatar if not found
const PUPPY_MODEL_URL = '/models/cartoon-puppy.glb';

const GLTFPuppyModel: React.FC<GLTFPuppyAvatarProps> = ({
  position = [0, 0, 0],
  isSpeaking = false,
  userIsTyping = false,
  lastMessageLength = 0,
  movementIntensity = 'subtle'
}) => {
  const group = useRef<THREE.Group>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  
  // Breathing controller
  const breathingController = useRef<BreathingController | null>(null);
  
  // Always call hooks at the top level
  let gltf: GLTF | null = null;
  let animations: ReturnType<typeof useAnimations> | null = null;
  
  try {
    console.log('Attempting to load 3D model from:', PUPPY_MODEL_URL);
    gltf = useGLTF(PUPPY_MODEL_URL);
    console.log('3D model loaded successfully:', gltf);
  } catch (error) {
    console.warn('Failed to load GLTF model:', error);
    setModelError('Failed to load 3D model');
    // This will cause the component to return null and trigger fallback
    throw error;
  }

  // Always call useAnimations hook
  animations = useAnimations(gltf?.animations || [], group);
  
  // Log animations if available
  useEffect(() => {
    if (gltf?.animations && gltf.animations.length > 0) {
      console.log('Animations loaded:', gltf.animations.length);
    }
  }, [gltf]);

  // Animation state management
  const [currentAnimation, setCurrentAnimation] = useState<string | null>(null);
  const animationIntensity = useRef(0);

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
    if (gltf && gltf.scene) {
      console.log('Setting up 3D model...');
      setModelLoaded(true);
      
      // Scale and position the model appropriately
      if (group.current) {
        group.current.scale.set(
          AVATAR_ANIMATION.SCALE.GLTF_BASE_SCALE, 
          AVATAR_ANIMATION.SCALE.GLTF_BASE_SCALE, 
          AVATAR_ANIMATION.SCALE.GLTF_BASE_SCALE
        );
        group.current.position.set(...position);
        
        // Ensure model is above ground
        const bbox = new THREE.Box3().setFromObject(gltf.scene);
        group.current.position.y = position[1] + Math.abs(bbox.min.y) * MATH_CONSTANTS.POSITION_Y_FACTOR;
        console.log('3D model positioned and scaled');
      }
    }
  }, [gltf, position]);

  // Handle animations based on props
  useEffect(() => {
    if (!animations || !animations.actions) return;

    const availableAnimations = Object.keys(animations.actions);
    console.log('Available animations:', availableAnimations);
    
    if (isSpeaking && availableAnimations.includes('Speaking')) {
      setCurrentAnimation('Speaking');
    } else if (userIsTyping && availableAnimations.includes('Listening')) {
      setCurrentAnimation('Listening');
    } else if (availableAnimations.includes('Idle')) {
      setCurrentAnimation('Idle');
    } else if (availableAnimations.length > 0) {
      setCurrentAnimation(availableAnimations[0]);
    }
  }, [isSpeaking, userIsTyping, animations]);

  // Play the current animation
  useEffect(() => {
    if (!animations || !animations.actions || !currentAnimation) return;

    const action = animations.actions[currentAnimation];
    if (action) {
      console.log('Playing animation:', currentAnimation);
      action.reset().fadeIn(0.5).play();
      
      return () => {
        action.fadeOut(0.5);
      };
    }
  }, [currentAnimation, animations]);

  // Animation loop for procedural animations and breathing
  useFrame((state) => {
    if (!group.current || !modelLoaded || !breathingController.current) return;

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
    
    animationIntensity.current = THREE.MathUtils.lerp(
      animationIntensity.current, 
      targetIntensity, 
      BREATHING_INTENSITY.LERP_FACTOR
    );

    // Enhanced breathing animation with realistic chest expansion
    const breathingIntensity = breathingState.intensity * AVATAR_ANIMATION.BREATHING_SCALE.OVERALL_INTENSITY;
    
    // Apply breathing to the model's scale more realistically
    // Focus on X and Z expansion (chest width/depth) rather than Y stretching
    const baseScale = AVATAR_ANIMATION.SCALE.GLTF_BASE_SCALE;
    group.current.scale.x = baseScale * (1 + breathingIntensity * AVATAR_ANIMATION.SCALE.GLTF_BREATHING_X_FACTOR);
    group.current.scale.z = baseScale * (1 + breathingIntensity * AVATAR_ANIMATION.SCALE.GLTF_BREATHING_Z_FACTOR);
    group.current.scale.y = baseScale; // Keep Y scale constant to prevent stretching
    
    // Subtle model position adjustment for breathing (chest movement)
    const breathingOffset = breathingIntensity * AVATAR_ANIMATION.POSITION.BREATHING_OFFSET_FACTOR;
    const baseY = position[1] + Math.abs(AVATAR_ANIMATION.SCALE.GLTF_BASE_SCALE) * MATH_CONSTANTS.POSITION_Y_FACTOR;
    group.current.position.y = baseY + breathingOffset;
    group.current.position.z = position[2] + breathingOffset * AVATAR_ANIMATION.POSITION.CHEST_OFFSET_Z_FACTOR;

    // Speaking animation - head movement (reduced when breathing is active)
    if (isSpeaking) {
      const speakingIntensity = Math.min(lastMessageLength / ANIMATION_TIMING.SPEAKING.INTENSITY_DIVISOR, 1.0);
      const breathingModifier = 1 - (breathingState.intensity * ANIMATION_TIMING.SPEAKING.BREATHING_MODIFIER);
      group.current.rotation.y = Math.sin(time * ANIMATION_TIMING.SPEAKING.FREQUENCY_MULTIPLIER) * ANIMATION_TIMING.SPEAKING.GLTF_ROTATION_Y_FACTOR * speakingIntensity * breathingModifier;
      group.current.rotation.x = Math.sin(time * (ANIMATION_TIMING.SPEAKING.FREQUENCY_MULTIPLIER - 1)) * ANIMATION_TIMING.SPEAKING.GLTF_ROTATION_X_FACTOR * speakingIntensity * breathingModifier;
    } else {
      // Idle animation - gentle swaying combined with breathing
      const idleIntensity = animationIntensity.current * (1 - breathingState.intensity * ANIMATION_TIMING.IDLE.GLTF_BREATHING_INTENSITY_FACTOR);
      group.current.rotation.y = Math.sin(time * ANIMATION_TIMING.IDLE.GLTF_FREQUENCY_Y) * ANIMATION_TIMING.IDLE.GLTF_ROTATION_Y_FACTOR * idleIntensity;
      group.current.rotation.x = Math.sin(time * ANIMATION_TIMING.IDLE.GLTF_FREQUENCY_X) * ANIMATION_TIMING.IDLE.GLTF_ROTATION_X_FACTOR * idleIntensity;
    }

    // User typing response - slight head tilt (modulated by breathing)
    if (userIsTyping) {
      const typingIntensity = 1 - (breathingState.intensity * ANIMATION_TIMING.TYPING.BREATHING_MODIFIER);
      group.current.rotation.z = Math.sin(time * ANIMATION_TIMING.TYPING.FREQUENCY_MULTIPLIER) * ANIMATION_TIMING.TYPING.GLTF_ROTATION_Z_FACTOR * typingIntensity;
    } else {
      group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, 0, MATH_CONSTANTS.LERP_FACTOR);
    }

    // Add subtle breathing-based head movement
    if (!isSpeaking && !userIsTyping) {
      const breathingHeadMovement = breathingState.intensity * AVATAR_ANIMATION.BREATHING_SCALE.HEAD_BREATHING_FACTOR;
      group.current.rotation.x += breathingHeadMovement;
    }
  });

  // If model failed to load or there's an error, throw to trigger fallback
  if (modelError || !gltf || !gltf.scene) {
    console.warn('3D model not available, will use fallback');
    throw new Error('3D model not available');
  }

  return (
    <group ref={group} position={position}>
      <primitive object={gltf.scene} />
    </group>
  );
};

// Error boundary wrapper component
const GLTFPuppyAvatar: React.FC<GLTFPuppyAvatarProps> = (props) => {
  return <GLTFPuppyModel {...props} />;
};

export default GLTFPuppyAvatar; 