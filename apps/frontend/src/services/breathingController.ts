import React from 'react';
import { 
  DEFAULT_BREATHING_PARAMS,
  BREATHING_PHASES,
  BREATHING_INTENSITY,
  BREATHING_PRESETS,
  MATH_CONSTANTS
} from '../config/breathingAnimationConstants';

export interface BreathingParams {
  baseRate: number;        // Base breathing rate in breaths per second
  amplitude: number;       // Breathing amplitude (0-1)
  chestExpansion: number;  // How much the chest expands (0-1)
  shoulderMovement: number; // How much shoulders move (0-1)
  irregularity: number;    // Adds natural irregularity (0-1)
  restingState: boolean;   // Whether in resting state (slower breathing)
}

export interface BreathingState {
  phase: number;           // Current breathing phase (0-1)
  intensity: number;       // Current breathing intensity (0-1)
  chestScale: number;      // Scale factor for chest expansion
  shoulderOffset: number;  // Shoulder position offset
  isInhaling: boolean;     // Whether currently inhaling
  breathCount: number;     // Number of breaths taken
}

export class BreathingController {
  private params: BreathingParams;
  private state: BreathingState;
  private elapsedTime: number;
  private lastBreathPhase: number;
  private irregularityOffset: number;

  constructor(params: Partial<BreathingParams> = {}) {
    this.params = {
      baseRate: DEFAULT_BREATHING_PARAMS.BASE_RATE,
      amplitude: DEFAULT_BREATHING_PARAMS.AMPLITUDE,
      chestExpansion: DEFAULT_BREATHING_PARAMS.CHEST_EXPANSION,
      shoulderMovement: DEFAULT_BREATHING_PARAMS.SHOULDER_MOVEMENT,
      irregularity: DEFAULT_BREATHING_PARAMS.IRREGULARITY,
      restingState: DEFAULT_BREATHING_PARAMS.RESTING_STATE,
      ...params
    };

    this.state = {
      phase: 0,
      intensity: 0,
      chestScale: 1,
      shoulderOffset: 0,
      isInhaling: false,
      breathCount: 0
    };

    this.elapsedTime = 0;
    this.lastBreathPhase = 0;
    this.irregularityOffset = 0;
  }

  updateParams(newParams: Partial<BreathingParams>): void {
    this.params = { ...this.params, ...newParams };
  }

  update(deltaTime: number): BreathingState {
    // Handle edge cases
    if (deltaTime <= 0) {
      return { ...this.state };
    }

    // Clamp delta time to prevent large jumps
    deltaTime = Math.min(deltaTime, BREATHING_INTENSITY.DELTA_TIME_CLAMP);
    
    this.elapsedTime += deltaTime;

    // Calculate breathing rate with irregularity
    const baseRate = this.params.restingState ? 
      this.params.baseRate : 
      this.params.baseRate * BREATHING_INTENSITY.ACTIVE_MULTIPLIER;
    
    const irregularityFactor = BREATHING_INTENSITY.RESTING_MULTIPLIER + 
      Math.sin(this.elapsedTime * BREATHING_INTENSITY.IRREGULARITY_FREQUENCY) * this.params.irregularity;
    
    const actualRate = baseRate * irregularityFactor;

    // Calculate breathing phase (0-1 cycle)
    const breathCycle = (this.elapsedTime * actualRate) % 1;
    
    // Create more realistic breathing curve (not just sine wave)
    let breathingIntensity: number;
    if (breathCycle < BREATHING_PHASES.INHALE_DURATION) {
      // Inhale phase
      breathingIntensity = Math.sin((breathCycle / BREATHING_PHASES.INHALE_DURATION) * MATH_CONSTANTS.PI_HALF);
      this.state.isInhaling = true;
    } else if (breathCycle < BREATHING_PHASES.HOLD_THRESHOLD) {
      // Hold phase
      breathingIntensity = 1;
      this.state.isInhaling = false;
    } else {
      // Exhale phase
      breathingIntensity = Math.cos(((breathCycle - BREATHING_PHASES.HOLD_THRESHOLD) / BREATHING_PHASES.EXHALE_DURATION) * MATH_CONSTANTS.PI_HALF);
      this.state.isInhaling = false;
    }

    // Apply amplitude
    breathingIntensity *= this.params.amplitude;

    // Update state
    this.state.phase = breathCycle;
    this.state.intensity = breathingIntensity;
    this.state.chestScale = 1 + (breathingIntensity * this.params.chestExpansion);
    this.state.shoulderOffset = breathingIntensity * this.params.shoulderMovement;

    // Count breaths (when phase cycles from high to low)
    if (breathCycle < BREATHING_PHASES.BREATH_COUNT_THRESHOLD_LOW && 
        this.lastBreathPhase > BREATHING_PHASES.BREATH_COUNT_THRESHOLD_HIGH) {
      this.state.breathCount++;
    }
    this.lastBreathPhase = breathCycle;

    return { ...this.state };
  }

  getBreathingState(): BreathingState {
    return { ...this.state };
  }

  reset(): void {
    this.elapsedTime = 0;
    this.lastBreathPhase = 0;
    this.state.breathCount = 0;
    this.state.phase = 0;
    this.state.intensity = 0;
  }

  // Preset configurations
  static presets = BREATHING_PRESETS;
}

// Hook for easy use in React components
export const useBreathing = (params?: Partial<BreathingParams>) => {
  const controllerRef = React.useRef<BreathingController | null>(null);
  
  if (!controllerRef.current) {
    controllerRef.current = new BreathingController(params);
  }

  React.useEffect(() => {
    if (params && controllerRef.current) {
      controllerRef.current.updateParams(params);
    }
  }, [params]);

  return controllerRef.current;
}; 