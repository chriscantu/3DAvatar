// Avatar Animation Controller for the 3D Avatar project
// Manages avatar movement states and transitions based on conversation context

// Simple custom event emitter for browser compatibility
class SimpleEventEmitter {
  private listeners: { [event: string]: ((...args: unknown[]) => void)[] } = {};

  on(event: string, listener: (...args: unknown[]) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  emit(event: string, ...args: unknown[]): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(listener => listener(...args));
    }
  }

  removeAllListeners(): void {
    this.listeners = {};
  }
}

export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'excited' | 'curious';
export type MovementIntensity = 'subtle' | 'moderate' | 'animated';

export interface AvatarAnimationState {
  state: AvatarState;
  intensity: MovementIntensity;
  userIsTyping: boolean;
  isSpeaking: boolean;
  lastMessageLength: number;
  timeSinceLastMessage: number;
  transitionProgress: number;
}

export interface MovementPattern {
  // Head movements
  headRotation: { x: number; y: number; z: number };
  headTilt: number;
  headBob: { amplitude: number; frequency: number };
  
  // Ear movements
  earRotation: { left: number; right: number };
  earTwitch: { frequency: number; intensity: number };
  
  // Body posture
  bodyLean: { forward: number; side: number };
  bodyRotation: number;
  
  // Body bouncing (for excited state)
  bodyBounce: { height: number; frequency: number };
  
  // Tail animation
  tailWag: { intensity: number; frequency: number };
  tailPosition: number;
  
  // Paw gestures
  frontPaws: { left: number; right: number };
  pawGesture: 'none' | 'point' | 'wave' | 'clap' | 'rest';
  
  // Breathing and idle
  breathingIntensity: number;
  idleMovements: boolean;
}

export class AvatarAnimationController extends SimpleEventEmitter {
  private currentState: AvatarAnimationState;
  private targetState: AvatarAnimationState;
  private transitionDuration: number = 800; // ms
  private transitionStartTime: number = 0;
  private isTransitioning: boolean = false;
  
  // Movement patterns for each state
  private movementPatterns: Record<AvatarState, MovementPattern> = {
    idle: {
      headRotation: { x: 0, y: 0, z: 0 },
      headTilt: 0,
      headBob: { amplitude: 0.04, frequency: 1.2 }, // Reduced from 0.08 for subtlety
      earRotation: { left: 0, right: 0 },
      earTwitch: { frequency: 0.8, intensity: 0.08 }, // Reduced intensity
      bodyLean: { forward: 0, side: 0 },
      bodyRotation: 0,
      bodyBounce: { height: 0, frequency: 0 },
      tailWag: { intensity: 0.3, frequency: 1.8 }, // Reduced from 0.4
      tailPosition: 0,
      frontPaws: { left: 0, right: 0 },
      pawGesture: 'rest',
      breathingIntensity: 1.0, // Reduced from 1.2
      idleMovements: true
    },
    
    listening: {
      headRotation: { x: 0, y: 0.15, z: 0 }, // Reduced from 0.2
      headTilt: 0.2, // Reduced from 0.3
      headBob: { amplitude: 0.04, frequency: 1.5 }, // Reduced from 0.06
      earRotation: { left: 0.3, right: 0.3 }, // Reduced from 0.4
      earTwitch: { frequency: 2.0, intensity: 0.15 }, // Reduced from 0.25
      bodyLean: { forward: 0.15, side: 0 }, // Reduced from 0.2
      bodyRotation: 0.08, // Reduced from 0.1
      bodyBounce: { height: 0, frequency: 0 },
      tailWag: { intensity: 0.25, frequency: 2.0 }, // Reduced from 0.3
      tailPosition: 0.15, // Reduced from 0.2
      frontPaws: { left: 0, right: 0 },
      pawGesture: 'none',
      breathingIntensity: 0.9,
      idleMovements: false
    },
    
    thinking: {
      headRotation: { x: 0, y: -0.15, z: 0 }, // Reduced from -0.2
      headTilt: -0.3, // Reduced from -0.4
      headBob: { amplitude: 0.03, frequency: 0.6 }, // Reduced from 0.04
      earRotation: { left: -0.15, right: 0.15 }, // Reduced from -0.2, 0.2
      earTwitch: { frequency: 1.8, intensity: 0.2 }, // Reduced from 0.3
      bodyLean: { forward: 0.08, side: 0.08 }, // Reduced from 0.1
      bodyRotation: -0.04, // Reduced from -0.05
      bodyBounce: { height: 0, frequency: 0 },
      tailWag: { intensity: 0.12, frequency: 0.8 }, // Reduced from 0.15
      tailPosition: -0.08, // Reduced from -0.1
      frontPaws: { left: 0.15, right: 0 }, // Reduced from 0.2
      pawGesture: 'none',
      breathingIntensity: 0.8,
      idleMovements: false
    },
    
    speaking: {
      headRotation: { x: 0, y: 0.08, z: 0 }, // Reduced from 0.1
      headTilt: 0.15, // Reduced from 0.2
      headBob: { amplitude: 0.06, frequency: 3.0 }, // Reduced from 0.1
      earRotation: { left: 0.15, right: 0.15 }, // Reduced from 0.2
      earTwitch: { frequency: 3.0, intensity: 0.3 }, // Reduced from 0.4
      bodyLean: { forward: 0.2, side: 0 }, // Reduced from 0.25
      bodyRotation: 0.12, // Reduced from 0.15
      bodyBounce: { height: 0, frequency: 0 },
      tailWag: { intensity: 0.5, frequency: 3.5 }, // Reduced from 0.6
      tailPosition: 0.25, // Reduced from 0.3
      frontPaws: { left: 0.25, right: 0.15 }, // Reduced from 0.3, 0.2
      pawGesture: 'point',
      breathingIntensity: 1.1,
      idleMovements: false
    },
    
    excited: {
      headRotation: { x: 0.03, y: 0.03, z: 0.01 }, // Reduced from 0.05, 0.05, 0.02
      headTilt: 0.08, // Reduced from 0.1
      headBob: { amplitude: 0.02, frequency: 1.2 }, // Reduced from 0.03
      earRotation: { left: 0.25, right: 0.25 }, // Reduced from 0.3
      earTwitch: { frequency: 2.5, intensity: 0.25 }, // Reduced from 0.3
      bodyLean: { forward: 0.08, side: 0.04 }, // Reduced from 0.1, 0.05
      bodyRotation: 0.08, // Reduced from 0.1
      bodyBounce: { height: 0.3, frequency: 2.0 }, // Reduced from 0.4
      tailWag: { intensity: 0.7, frequency: 4.0 }, // Reduced from 0.8
      tailPosition: 0.15, // Reduced from 0.2
      frontPaws: { left: 0.15, right: 0.15 }, // Reduced from 0.2
      pawGesture: 'wave',
      breathingIntensity: 0.6,
      idleMovements: false
    },
    
    curious: {
      headRotation: { x: 0, y: 0.3, z: 0 }, // Reduced from 0.4
      headTilt: 0.4, // Reduced from 0.5
      headBob: { amplitude: 0.06, frequency: 2.5 }, // Reduced from 0.08
      earRotation: { left: 0.5, right: 0.5 }, // Reduced from 0.6
      earTwitch: { frequency: 3.5, intensity: 0.4 }, // Reduced from 0.5
      bodyLean: { forward: 0.3, side: 0 }, // Reduced from 0.4
      bodyRotation: 0.25, // Reduced from 0.3
      bodyBounce: { height: 0, frequency: 0 },
      tailWag: { intensity: 0.4, frequency: 4.0 }, // Reduced from 0.5
      tailPosition: 0.2, // Reduced from 0.25
      frontPaws: { left: 0.15, right: 0.3 }, // Reduced from 0.2, 0.4
      pawGesture: 'point',
      breathingIntensity: 1.2, // Reduced from 1.3
      idleMovements: false
    }
  };

  constructor() {
    super();
    
    // Initialize with idle state
    this.currentState = {
      state: 'idle',
      intensity: 'moderate', // Changed from 'subtle' to 'moderate' for more visible movement
      userIsTyping: false,
      isSpeaking: false,
      lastMessageLength: 0,
      timeSinceLastMessage: 0,
      transitionProgress: 1.0
    };
    
    this.targetState = { ...this.currentState };
  }

  /**
   * Update avatar state based on conversation context
   */
  updateState(updates: Partial<AvatarAnimationState>): void {
    const newState = { ...this.currentState, ...updates };
    
    // Determine the appropriate avatar state based on context
    const avatarState = this.determineAvatarState(newState);
    
    if (avatarState !== this.currentState.state) {
      this.transitionToState(avatarState, newState);
    } else {
      // Even if state doesn't change, update the current state data
      this.currentState = { ...newState, state: avatarState };
    }
  }

  /**
   * Determine avatar state based on conversation context
   */
  private determineAvatarState(state: AvatarAnimationState): AvatarState {
    // Priority order: speaking > listening > excited > curious > thinking > idle
    
    if (state.isSpeaking) {
      return 'speaking';
    }
    
    if (state.userIsTyping) {
      return 'listening';
    }
    
    // Check for excitement based on message length and recency
    if (state.lastMessageLength > 80 && state.timeSinceLastMessage <= 2000) {
      return 'excited';
    }
    
    // Check for curiosity based on question patterns or short messages
    if (state.lastMessageLength > 0 && state.lastMessageLength < 60 && state.timeSinceLastMessage <= 5000) {
      return 'curious';
    }
    
    // Thinking state for processing time
    if (state.timeSinceLastMessage > 500 && state.timeSinceLastMessage <= 2000) {
      return 'thinking';
    }
    
    return 'idle';
  }

  /**
   * Transition to a new avatar state
   */
  private transitionToState(newState: AvatarState, stateData: AvatarAnimationState): void {
    const previousState = this.currentState.state;
    
    this.targetState = { ...stateData, state: newState };
    
    // Immediately update the current state with the new avatar state
    // This allows tests and external code to see the state change immediately
    this.currentState = { ...stateData, state: newState, transitionProgress: 0 };
    
    this.isTransitioning = true;
    this.transitionStartTime = Date.now();
    
    this.emit('stateChange', {
      from: previousState,
      to: newState,
      duration: this.transitionDuration
    });
  }

  /**
   * Update transition progress and interpolate between states
   */
  updateTransition(): void {
    if (!this.isTransitioning) return;
    
    const elapsed = Date.now() - this.transitionStartTime;
    const progress = Math.min(elapsed / this.transitionDuration, 1.0);
    
    // Smooth easing function
    const easedProgress = this.easeInOutCubic(progress);
    
    this.currentState.transitionProgress = easedProgress;
    
    if (progress >= 1.0) {
      this.currentState = { ...this.targetState };
      this.isTransitioning = false;
      this.emit('transitionComplete', this.currentState.state);
    }
  }

  /**
   * Get current movement pattern with transition interpolation
   */
  getCurrentMovementPattern(): MovementPattern {
    const currentPattern = this.movementPatterns[this.currentState.state];
    
    if (!this.isTransitioning) {
      return this.applyIntensityModifier(currentPattern, this.currentState.intensity);
    }
    
    // Interpolate between current and target patterns
    const targetPattern = this.movementPatterns[this.targetState.state];
    const progress = this.currentState.transitionProgress;
    
    const interpolatedPattern = this.interpolatePatterns(currentPattern, targetPattern, progress);
    return this.applyIntensityModifier(interpolatedPattern, this.currentState.intensity);
  }

  /**
   * Apply intensity modifier to movement pattern
   */
  private applyIntensityModifier(pattern: MovementPattern, intensity: MovementIntensity): MovementPattern {
    const multiplier = intensity === 'subtle' ? 0.7 : intensity === 'animated' ? 1.3 : 1.0;
    
    return {
      ...pattern,
      headBob: { ...pattern.headBob, amplitude: pattern.headBob.amplitude * multiplier },
      earTwitch: { ...pattern.earTwitch, intensity: pattern.earTwitch.intensity * multiplier },
      bodyBounce: { ...pattern.bodyBounce, height: pattern.bodyBounce.height * multiplier },
      tailWag: { ...pattern.tailWag, intensity: pattern.tailWag.intensity * multiplier },
      breathingIntensity: pattern.breathingIntensity * multiplier
    };
  }

  /**
   * Interpolate between two movement patterns
   */
  private interpolatePatterns(from: MovementPattern, to: MovementPattern, progress: number): MovementPattern {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    
    return {
      headRotation: {
        x: lerp(from.headRotation.x, to.headRotation.x, progress),
        y: lerp(from.headRotation.y, to.headRotation.y, progress),
        z: lerp(from.headRotation.z, to.headRotation.z, progress)
      },
      headTilt: lerp(from.headTilt, to.headTilt, progress),
      headBob: {
        amplitude: lerp(from.headBob.amplitude, to.headBob.amplitude, progress),
        frequency: lerp(from.headBob.frequency, to.headBob.frequency, progress)
      },
      earRotation: {
        left: lerp(from.earRotation.left, to.earRotation.left, progress),
        right: lerp(from.earRotation.right, to.earRotation.right, progress)
      },
      earTwitch: {
        frequency: lerp(from.earTwitch.frequency, to.earTwitch.frequency, progress),
        intensity: lerp(from.earTwitch.intensity, to.earTwitch.intensity, progress)
      },
      bodyLean: {
        forward: lerp(from.bodyLean.forward, to.bodyLean.forward, progress),
        side: lerp(from.bodyLean.side, to.bodyLean.side, progress)
      },
      bodyRotation: lerp(from.bodyRotation, to.bodyRotation, progress),
      bodyBounce: {
        height: lerp(from.bodyBounce.height, to.bodyBounce.height, progress),
        frequency: lerp(from.bodyBounce.frequency, to.bodyBounce.frequency, progress)
      },
      tailWag: {
        intensity: lerp(from.tailWag.intensity, to.tailWag.intensity, progress),
        frequency: lerp(from.tailWag.frequency, to.tailWag.frequency, progress)
      },
      tailPosition: lerp(from.tailPosition, to.tailPosition, progress),
      frontPaws: {
        left: lerp(from.frontPaws.left, to.frontPaws.left, progress),
        right: lerp(from.frontPaws.right, to.frontPaws.right, progress)
      },
      pawGesture: progress > 0.5 ? to.pawGesture : from.pawGesture,
      breathingIntensity: lerp(from.breathingIntensity, to.breathingIntensity, progress),
      idleMovements: progress > 0.5 ? to.idleMovements : from.idleMovements
    };
  }

  /**
   * Smooth easing function for transitions
   */
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * Get current avatar state
   */
  getCurrentState(): AvatarAnimationState {
    return { ...this.currentState };
  }

  /**
   * Force a specific avatar state (for testing or special cases)
   */
  forceState(state: AvatarState, intensity: MovementIntensity = 'moderate'): void {
    this.currentState = {
      ...this.currentState,
      state,
      intensity
    };
    this.targetState = { ...this.currentState };
    this.isTransitioning = false;
    
    this.emit('stateForced', state);
  }

  /**
   * Reset to idle state
   */
  resetToIdle(): void {
    this.transitionToState('idle', {
      ...this.currentState,
      userIsTyping: false,
      isSpeaking: false,
      lastMessageLength: 0,
      timeSinceLastMessage: 0
    });
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.removeAllListeners();
    this.isTransitioning = false;
  }
} 