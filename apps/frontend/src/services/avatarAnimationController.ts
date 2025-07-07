// Avatar Animation Controller for the 3D Avatar project
// Manages avatar movement states and transitions based on conversation context

import { EventEmitter } from 'events';

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

export class AvatarAnimationController extends EventEmitter {
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
      headBob: { amplitude: 0.02, frequency: 2 },
      earRotation: { left: 0, right: 0 },
      earTwitch: { frequency: 0.5, intensity: 0.1 },
      bodyLean: { forward: 0, side: 0 },
      bodyRotation: 0,
      tailWag: { intensity: 0.3, frequency: 3 },
      tailPosition: 0,
      frontPaws: { left: 0, right: 0 },
      pawGesture: 'rest',
      breathingIntensity: 1.0,
      idleMovements: true
    },
    
    listening: {
      headRotation: { x: 0, y: 0.1, z: 0 },
      headTilt: 0.15,
      headBob: { amplitude: 0.01, frequency: 1.5 },
      earRotation: { left: 0.2, right: 0.2 },
      earTwitch: { frequency: 1.5, intensity: 0.2 },
      bodyLean: { forward: 0.1, side: 0 },
      bodyRotation: 0.05,
      tailWag: { intensity: 0.2, frequency: 2 },
      tailPosition: 0.1,
      frontPaws: { left: 0, right: 0 },
      pawGesture: 'none',
      breathingIntensity: 0.8,
      idleMovements: false
    },
    
    thinking: {
      headRotation: { x: 0, y: -0.1, z: 0 },
      headTilt: -0.2,
      headBob: { amplitude: 0.015, frequency: 1 },
      earRotation: { left: -0.1, right: 0.1 },
      earTwitch: { frequency: 2, intensity: 0.3 },
      bodyLean: { forward: 0.05, side: 0.05 },
      bodyRotation: -0.03,
      tailWag: { intensity: 0.1, frequency: 1.5 },
      tailPosition: -0.05,
      frontPaws: { left: 0.1, right: 0 },
      pawGesture: 'none',
      breathingIntensity: 0.7,
      idleMovements: false
    },
    
    speaking: {
      headRotation: { x: 0, y: 0.05, z: 0 },
      headTilt: 0.1,
      headBob: { amplitude: 0.03, frequency: 4 },
      earRotation: { left: 0.1, right: 0.1 },
      earTwitch: { frequency: 3, intensity: 0.4 },
      bodyLean: { forward: 0.15, side: 0 },
      bodyRotation: 0.1,
      tailWag: { intensity: 0.5, frequency: 4 },
      tailPosition: 0.2,
      frontPaws: { left: 0.2, right: 0.1 },
      pawGesture: 'point',
      breathingIntensity: 1.2,
      idleMovements: false
    },
    
    excited: {
      headRotation: { x: 0.1, y: 0.1, z: 0.05 },
      headTilt: 0.2,
      headBob: { amplitude: 0.05, frequency: 6 },
      earRotation: { left: 0.3, right: 0.3 },
      earTwitch: { frequency: 4, intensity: 0.5 },
      bodyLean: { forward: 0.2, side: 0.1 },
      bodyRotation: 0.15,
      tailWag: { intensity: 0.8, frequency: 6 },
      tailPosition: 0.3,
      frontPaws: { left: 0.3, right: 0.3 },
      pawGesture: 'wave',
      breathingIntensity: 1.5,
      idleMovements: false
    },
    
    curious: {
      headRotation: { x: 0, y: 0.2, z: 0 },
      headTilt: 0.25,
      headBob: { amplitude: 0.02, frequency: 3 },
      earRotation: { left: 0.4, right: 0.4 },
      earTwitch: { frequency: 2.5, intensity: 0.4 },
      bodyLean: { forward: 0.25, side: 0 },
      bodyRotation: 0.2,
      tailWag: { intensity: 0.4, frequency: 3.5 },
      tailPosition: 0.15,
      frontPaws: { left: 0.1, right: 0.2 },
      pawGesture: 'point',
      breathingIntensity: 1.1,
      idleMovements: false
    }
  };

  constructor() {
    super();
    
    // Initialize with idle state
    this.currentState = {
      state: 'idle',
      intensity: 'subtle',
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
      this.currentState = newState;
    }
  }

  /**
   * Determine avatar state based on conversation context
   */
  private determineAvatarState(state: AvatarAnimationState): AvatarState {
    // Priority order: speaking > thinking > listening > excited > curious > idle
    
    if (state.isSpeaking) {
      return 'speaking';
    }
    
    if (state.userIsTyping) {
      return 'listening';
    }
    
    // Check for excitement based on message length and recency
    if (state.lastMessageLength > 100 && state.timeSinceLastMessage < 5000) {
      return 'excited';
    }
    
    // Check for curiosity based on question patterns or short messages
    if (state.lastMessageLength > 0 && state.lastMessageLength < 50 && state.timeSinceLastMessage < 10000) {
      return 'curious';
    }
    
    // Thinking state for processing time
    if (state.timeSinceLastMessage > 1000 && state.timeSinceLastMessage < 3000) {
      return 'thinking';
    }
    
    return 'idle';
  }

  /**
   * Transition to a new avatar state
   */
  private transitionToState(newState: AvatarState, stateData: AvatarAnimationState): void {
    this.targetState = { ...stateData, state: newState };
    this.isTransitioning = true;
    this.transitionStartTime = Date.now();
    
    this.emit('stateChange', {
      from: this.currentState.state,
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