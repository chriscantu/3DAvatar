/**
 * Breathing Animation Constants
 * All hard-coded values for breathing animation system
 */

// Default breathing parameters
export const DEFAULT_BREATHING_PARAMS = {
  BASE_RATE: 0.25,              // 15 breaths per minute (realistic resting rate)
  AMPLITUDE: 0.8,               // Default breathing amplitude
  CHEST_EXPANSION: 0.15,        // Default chest expansion factor
  SHOULDER_MOVEMENT: 0.05,      // Default shoulder movement factor
  IRREGULARITY: 0.1,            // Default breathing irregularity
  RESTING_STATE: true           // Default resting state
} as const;

// Breathing cycle phases
export const BREATHING_PHASES = {
  INHALE_DURATION: 0.4,         // 40% of breathing cycle
  HOLD_DURATION: 0.2,           // 20% of breathing cycle (0.4 to 0.6)
  EXHALE_DURATION: 0.4,         // 40% of breathing cycle (0.6 to 1.0)
  HOLD_THRESHOLD: 0.6,          // When exhale phase starts
  BREATH_COUNT_THRESHOLD_LOW: 0.1,  // Lower threshold for breath counting
  BREATH_COUNT_THRESHOLD_HIGH: 0.9  // Upper threshold for breath counting
} as const;

// Breathing intensity modifiers
export const BREATHING_INTENSITY = {
  RESTING_MULTIPLIER: 1.0,      // Base multiplier for resting state
  ACTIVE_MULTIPLIER: 1.5,       // Multiplier for active (non-resting) state
  IRREGULARITY_FREQUENCY: 0.1,  // Frequency for irregularity calculation
  DELTA_TIME_CLAMP: 0.1,        // Maximum delta time to prevent large jumps
  LERP_FACTOR: 0.05             // Lerp factor for smooth transitions
} as const;

// Breathing presets
export const BREATHING_PRESETS = {
  RESTING: {
    baseRate: 0.25,
    amplitude: 0.6,
    chestExpansion: 0.08,
    shoulderMovement: 0.03,
    irregularity: 0.08,
    restingState: true
  },
  ALERT: {
    baseRate: 0.4,
    amplitude: 0.7,
    chestExpansion: 0.12,
    shoulderMovement: 0.05,
    irregularity: 0.12,
    restingState: false
  },
  EXCITED: {
    baseRate: 0.6,
    amplitude: 0.8,
    chestExpansion: 0.15,
    shoulderMovement: 0.07,
    irregularity: 0.15,
    restingState: false
  },
  SLEEPING: {
    baseRate: 0.2,
    amplitude: 0.4,
    chestExpansion: 0.05,
    shoulderMovement: 0.02,
    irregularity: 0.03,
    restingState: true
  }
} as const;

// Avatar animation constants
export const AVATAR_ANIMATION = {
  // Movement intensity multipliers
  MOVEMENT_INTENSITY: {
    SUBTLE: 0.3,
    ANIMATED: 0.6,
    ENERGETIC: 1.0
  },
  
  // Breathing animation scaling factors
  BREATHING_SCALE: {
    OVERALL_INTENSITY: 0.3,       // Overall breathing intensity reduction
    BODY_X_FACTOR: 0.05,          // Body X-axis breathing factor
    BODY_Z_FACTOR: 0.03,          // Body Z-axis breathing factor
    CHEST_X_FACTOR: 0.08,         // Chest X-axis breathing factor
    CHEST_Z_FACTOR: 0.06,         // Chest Z-axis breathing factor
    CHEST_Y_FACTOR: 0.04,         // Chest Y-axis breathing factor
    SHOULDER_FACTOR: 0.015,       // Shoulder movement factor
    HEAD_BREATHING_FACTOR: 0.005  // Head breathing movement factor
  },
  
  // Position constants
  POSITION: {
    CHEST_BASE_Y: 0.35,           // Base Y position for chest
    CHEST_BASE_Z: 0.4,            // Base Z position for chest
    CHEST_OFFSET_FACTOR: 0.02,    // Chest position offset factor
    CHEST_OFFSET_Z_FACTOR: 0.5,   // Chest Z offset factor
    HEAD_BASE_Y: 0.8,             // Base Y position for head
    BREATHING_OFFSET_FACTOR: 0.01 // General breathing offset factor
  },
  
  // Scale constants
  SCALE: {
    BODY_BASE_X: 1.2,             // Base X scale for body
    BODY_BASE_Y: 0.8,             // Base Y scale for body
    BODY_BASE_Z: 2.2,             // Base Z scale for body
    CHEST_BASE: 1.0,              // Base scale for chest
    GLTF_BASE_SCALE: 0.3,         // Base scale for GLTF models (reduced by 40% from 0.5)
    GLTF_BREATHING_X_FACTOR: 0.06, // GLTF X-axis breathing factor
    GLTF_BREATHING_Z_FACTOR: 0.04  // GLTF Z-axis breathing factor
  }
} as const;

// Animation timing constants
export const ANIMATION_TIMING = {
  SPEAKING: {
    FREQUENCY_MULTIPLIER: 4,      // Speaking animation frequency multiplier
    INTENSITY_DIVISOR: 100,       // Message length to intensity conversion
    ROTATION_Y_FACTOR: 0.1,       // Y rotation factor for speaking
    ROTATION_X_FACTOR: 0.05,      // X rotation factor for speaking
    BREATHING_MODIFIER: 0.2,      // Breathing modifier for speaking
    GLTF_ROTATION_Y_FACTOR: 0.08, // GLTF Y rotation factor for speaking
    GLTF_ROTATION_X_FACTOR: 0.04  // GLTF X rotation factor for speaking
  },
  
  IDLE: {
    FREQUENCY_Y: 0.5,             // Idle Y rotation frequency
    FREQUENCY_X: 0.3,             // Idle X rotation frequency
    ROTATION_Y_FACTOR: 0.03,      // Y rotation factor for idle
    ROTATION_X_FACTOR: 0.02,      // X rotation factor for idle
    BREATHING_INTENSITY_FACTOR: 0.1, // Breathing intensity factor for idle
    GLTF_FREQUENCY_Y: 0.5,        // GLTF idle Y rotation frequency
    GLTF_FREQUENCY_X: 0.3,        // GLTF idle X rotation frequency
    GLTF_ROTATION_Y_FACTOR: 0.025, // GLTF Y rotation factor for idle
    GLTF_ROTATION_X_FACTOR: 0.015, // GLTF X rotation factor for idle
    GLTF_BREATHING_INTENSITY_FACTOR: 0.15 // GLTF breathing intensity factor for idle
  },
  
  TYPING: {
    FREQUENCY_MULTIPLIER: 2,      // Typing animation frequency multiplier
    ROTATION_Z_FACTOR: 0.05,      // Z rotation factor for typing
    BREATHING_MODIFIER: 0.1,      // Breathing modifier for typing
    GLTF_ROTATION_Z_FACTOR: 0.04  // GLTF Z rotation factor for typing
  }
} as const;

// Math constants
export const MATH_CONSTANTS = {
  PI_HALF: Math.PI * 0.5,        // π/2 for sine calculations
  LERP_FACTOR: 0.1,              // General lerp factor
  POSITION_Y_FACTOR: 0.5         // Position Y calculation factor
} as const;

// Test constants
export const TEST_CONSTANTS = {
  DELTA_TIME: 0.1,               // Standard delta time for tests
  LONG_TEST_ITERATIONS: 50,      // Iterations for longer tests
  RAPID_TEST_ITERATIONS: 1000,   // Iterations for rapid tests
  STABILITY_TEST_ITERATIONS: 100, // Iterations for stability tests
  SMALL_DELTA_TIME: 0.001,       // Small delta time for rapid tests
  LARGE_DELTA_TIME: 10,          // Large delta time for edge case tests
  STABILITY_DELTA_TIME: 0.05     // Delta time for stability tests
} as const; 