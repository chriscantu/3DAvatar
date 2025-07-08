import React, { useState, Suspense } from 'react';
import GLTFPuppyAvatar from './GLTFPuppyAvatar';
import AnimatedPuppyAvatar from './AnimatedPuppyAvatar';
import { ErrorBoundary } from 'react-error-boundary';

interface AvatarProps {
  position?: [number, number, number];
  isSpeaking?: boolean;
  userIsTyping?: boolean;
  lastMessageLength?: number;
  timeSinceLastMessage?: number;
  movementIntensity?: 'subtle' | 'animated' | 'energetic';
}

const Avatar: React.FC<AvatarProps> = (props) => {
  // Enable 3D model loading
  const [use3DModel, setUse3DModel] = useState(true);

  // Log props for debugging
  console.log('Avatar props received:', {
    isSpeaking: props.isSpeaking,
    userIsTyping: props.userIsTyping,
    lastMessageLength: props.lastMessageLength,
    timeSinceLastMessage: props.timeSinceLastMessage,
    movementIntensity: props.movementIntensity
  });

  // Handle 3D model loading errors
  const handleModelError = () => {
    console.warn('3D model failed to load, falling back to geometric avatar');
    setUse3DModel(false);
  };

  // Error fallback component
  const ErrorFallback = () => {
    console.warn('3D model loading failed, using geometric avatar');
    return <AnimatedPuppyAvatar position={props.position} />;
  };

  // Try 3D model first, fallback to geometric avatar
  if (use3DModel) {
    return (
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onError={handleModelError}
      >
        <Suspense fallback={<AnimatedPuppyAvatar position={props.position} />}>
          <GLTFPuppyAvatar 
            {...props}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  // Fallback to geometric avatar
  return (
    <AnimatedPuppyAvatar 
      position={props.position}
    />
  );
};

export default Avatar; 