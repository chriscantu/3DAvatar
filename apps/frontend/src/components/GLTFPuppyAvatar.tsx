import React, { useRef, useEffect, useState, Suspense } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import AnimatedPuppyAvatar from './AnimatedPuppyAvatar';

interface GLTFPuppyAvatarProps {
  position?: [number, number, number];
  isSpeaking?: boolean;
  userIsTyping?: boolean;
  lastMessageLength?: number;
  timeSinceLastMessage?: number;
  movementIntensity?: 'subtle' | 'animated' | 'energetic';
}

// Model URL - will fall back to geometric avatar if not found
const PUPPY_MODEL_URL = '/models/cartoon-puppy.glb';

const GLTFPuppyModel: React.FC<GLTFPuppyAvatarProps> = ({
  position = [0, 0, 0],
  isSpeaking = false,
  userIsTyping = false,
  lastMessageLength = 0,
  timeSinceLastMessage = 0,
  movementIntensity = 'subtle'
}) => {
  const group = useRef<THREE.Group>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  
  // Try to load the GLTF model with error handling
  let gltf: any = null;
  let animations: any = null;
  
  try {
    console.log('Attempting to load 3D model from:', PUPPY_MODEL_URL);
    const result = useGLTF(PUPPY_MODEL_URL);
    gltf = result;
    console.log('3D model loaded successfully:', gltf);
    
    // Use animations if available
    if (gltf.animations && gltf.animations.length > 0) {
      animations = useAnimations(gltf.animations, group);
      console.log('Animations loaded:', gltf.animations.length);
    }
  } catch (error) {
    console.warn('Failed to load GLTF model:', error);
    setModelError('Failed to load 3D model');
    // This will cause the component to return null and trigger fallback
    throw error;
  }

  // Animation state management
  const [currentAnimation, setCurrentAnimation] = useState<string | null>(null);
  const animationIntensity = useRef(0);

  useEffect(() => {
    if (gltf && gltf.scene) {
      console.log('Setting up 3D model...');
      setModelLoaded(true);
      
      // Scale and position the model appropriately
      if (group.current) {
        group.current.scale.set(0.5, 0.5, 0.5); // Adjust scale as needed
        group.current.position.set(...position);
        
        // Ensure model is above ground
        const bbox = new THREE.Box3().setFromObject(gltf.scene);
        const modelHeight = bbox.max.y - bbox.min.y;
        group.current.position.y = position[1] + Math.abs(bbox.min.y) * 0.5;
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

  // Animation loop for procedural animations
  useFrame((state) => {
    if (!group.current || !modelLoaded) return;

    const time = state.clock.getElapsedTime();
    
    // Calculate animation intensity based on movement setting
    const targetIntensity = movementIntensity === 'energetic' ? 1.0 : 
                           movementIntensity === 'animated' ? 0.6 : 0.3;
    
    animationIntensity.current = THREE.MathUtils.lerp(
      animationIntensity.current, 
      targetIntensity, 
      0.05
    );

    // Subtle breathing animation
    const breathingScale = 1 + Math.sin(time * 2) * 0.02 * animationIntensity.current;
    group.current.scale.y = 0.5 * breathingScale;

    // Speaking animation - head movement
    if (isSpeaking) {
      const speakingIntensity = Math.min(lastMessageLength / 100, 1.0);
      group.current.rotation.y = Math.sin(time * 4) * 0.1 * speakingIntensity;
      group.current.rotation.x = Math.sin(time * 3) * 0.05 * speakingIntensity;
    } else {
      // Idle animation - gentle swaying
      group.current.rotation.y = Math.sin(time * 0.5) * 0.03 * animationIntensity.current;
      group.current.rotation.x = Math.sin(time * 0.3) * 0.02 * animationIntensity.current;
    }

    // User typing response - slight head tilt
    if (userIsTyping) {
      group.current.rotation.z = Math.sin(time * 2) * 0.05;
    } else {
      group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, 0, 0.1);
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

// Loading fallback component
const LoadingFallback: React.FC<{ position?: [number, number, number] }> = ({ position = [0, 0, 0] }) => {
  console.log('Showing loading fallback while 3D model loads...');
  return (
    <AnimatedPuppyAvatar position={position} />
  );
};

// Main component with error boundaries and fallbacks
const GLTFPuppyAvatar: React.FC<GLTFPuppyAvatarProps> = (props) => {
  const [hasError, setHasError] = useState(false);

  // Error boundary effect
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('GLTFPuppyAvatar Error:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // If there's an error, use the geometric fallback
  if (hasError) {
    console.log('Using geometric fallback due to error');
    return <AnimatedPuppyAvatar position={props.position} />;
  }

  return (
    <Suspense fallback={<LoadingFallback position={props.position} />}>
      <GLTFPuppyModel {...props} />
    </Suspense>
  );
};

// Preload the model (this will fail gracefully if model doesn't exist)
try {
  useGLTF.preload(PUPPY_MODEL_URL);
  console.log('Preloading 3D model...');
} catch (error) {
  console.warn('Model preload failed, will use fallback:', error);
}

export default GLTFPuppyAvatar; 