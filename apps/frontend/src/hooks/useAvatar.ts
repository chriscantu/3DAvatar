import { useState, useEffect, useCallback, useRef } from 'react';

export type MovementIntensity = 'subtle' | 'animated' | 'energetic';
export type AvatarState = 'idle' | 'speaking' | 'listening' | 'interactive';

interface AvatarConfig {
  movementIntensity?: MovementIntensity;
  use3DModel?: boolean;
  speakingTimeout?: number;
  typingTimeout?: number;
}

interface UseAvatarReturn {
  // Core state
  isSpeaking: boolean;
  userIsTyping: boolean;
  lastMessageLength: number;
  timeSinceLastMessage: number;
  movementIntensity: MovementIntensity;
  use3DModel: boolean;
  modelError: boolean;
  
  // Calculated state
  avatarState: AvatarState;
  calculatedMovementIntensity: MovementIntensity;
  
  // Actions
  setIsSpeaking: (speaking: boolean) => void;
  setUserIsTyping: (typing: boolean) => void;
  setLastMessageLength: (length: number) => void;
  updateLastMessageTime: () => void;
  setMovementIntensity: (intensity: MovementIntensity) => void;
  setUse3DModel: (use3D: boolean) => void;
  handleModelError: () => void;
  resetModelError: () => void;
}

const DEFAULT_CONFIG: Required<AvatarConfig> = {
  movementIntensity: 'subtle',
  use3DModel: true,
  speakingTimeout: 5000, // 5 seconds
  typingTimeout: 3000,   // 3 seconds
};

/**
 * Custom hook for managing avatar state and behavior
 * Handles speaking, typing, movement intensity, and 3D model state
 */
export const useAvatar = (config: AvatarConfig = {}): UseAvatarReturn => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Core state
  const [isSpeaking, setIsSpeakingState] = useState(false);
  const [userIsTyping, setUserIsTypingState] = useState(false);
  const [lastMessageLength, setLastMessageLength] = useState(0);
  const [lastMessageTime, setLastMessageTime] = useState(Date.now());
  const [timeSinceLastMessage, setTimeSinceLastMessage] = useState(0);
  const [movementIntensity, setMovementIntensity] = useState<MovementIntensity>(finalConfig.movementIntensity);
  const [use3DModel, setUse3DModel] = useState(finalConfig.use3DModel);
  const [modelError, setModelError] = useState(false);
  
  // Refs for timeouts
  const speakingTimeoutRef = useRef<NodeJS.Timeout>();
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const timeTrackingIntervalRef = useRef<NodeJS.Timeout>();
  
  // Update time since last message
  useEffect(() => {
    const updateTimer = () => {
      setTimeSinceLastMessage(Date.now() - lastMessageTime);
    };
    
    timeTrackingIntervalRef.current = setInterval(updateTimer, 1000);
    
    return () => {
      if (timeTrackingIntervalRef.current) {
        clearInterval(timeTrackingIntervalRef.current);
      }
    };
  }, [lastMessageTime]);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (speakingTimeoutRef.current) {
        clearTimeout(speakingTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (timeTrackingIntervalRef.current) {
        clearInterval(timeTrackingIntervalRef.current);
      }
    };
  }, []);
  
  // Calculate avatar state based on current conditions
  const avatarState: AvatarState = (() => {
    if (isSpeaking && userIsTyping) return 'interactive';
    if (isSpeaking) return 'speaking';
    if (userIsTyping) return 'listening';
    return 'idle';
  })();
  
  // Calculate movement intensity based on various factors
  const calculatedMovementIntensity: MovementIntensity = (() => {
    // Base intensity from user setting
    let intensity = movementIntensity;
    
    // Increase intensity based on message length
    if (lastMessageLength > 150) {
      intensity = 'energetic';
    } else if (lastMessageLength > 75) {
      intensity = 'animated';
    }
    
    // Increase intensity when speaking and typing simultaneously
    if (isSpeaking && userIsTyping) {
      intensity = 'energetic';
    } else if (isSpeaking) {
      intensity = intensity === 'subtle' ? 'animated' : intensity;
    }
    
    return intensity;
  })();
  
  // Set speaking state with automatic timeout
  const setIsSpeaking = useCallback((speaking: boolean) => {
    setIsSpeakingState(speaking);
    
    // Clear existing timeout
    if (speakingTimeoutRef.current) {
      clearTimeout(speakingTimeoutRef.current);
    }
    
    // Set new timeout if speaking
    if (speaking) {
      speakingTimeoutRef.current = setTimeout(() => {
        setIsSpeakingState(false);
      }, finalConfig.speakingTimeout);
    }
  }, [finalConfig.speakingTimeout]);
  
  // Set typing state with automatic timeout
  const setUserIsTyping = useCallback((typing: boolean) => {
    setUserIsTypingState(typing);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout if typing
    if (typing) {
      typingTimeoutRef.current = setTimeout(() => {
        setUserIsTypingState(false);
      }, finalConfig.typingTimeout);
    }
  }, [finalConfig.typingTimeout]);
  
  // Update last message time
  const updateLastMessageTime = useCallback(() => {
    const now = Date.now();
    setLastMessageTime(now);
    setTimeSinceLastMessage(0);
  }, []);
  
  // Handle model loading errors
  const handleModelError = useCallback(() => {
    console.warn('3D model failed to load, falling back to geometric avatar');
    setUse3DModel(false);
    setModelError(true);
  }, []);
  
  // Reset model error state
  const resetModelError = useCallback(() => {
    setModelError(false);
  }, []);
  
  return {
    // Core state
    isSpeaking,
    userIsTyping,
    lastMessageLength,
    timeSinceLastMessage,
    movementIntensity,
    use3DModel,
    modelError,
    
    // Calculated state
    avatarState,
    calculatedMovementIntensity,
    
    // Actions
    setIsSpeaking,
    setUserIsTyping,
    setLastMessageLength,
    updateLastMessageTime,
    setMovementIntensity,
    setUse3DModel,
    handleModelError,
    resetModelError,
  };
}; 