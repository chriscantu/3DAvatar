/**
 * Room Configuration Constants
 * 
 * MANDATORY RULE: NO HARDCODED VALUES IN COMPONENTS
 * All numeric values, strings, and configuration should be defined here
 * and imported where needed. This ensures maintainability and consistency.
 */

// Room Dimensions
export const ROOM_DIMENSIONS = {
  WIDTH: 10,
  HEIGHT: 4,
  DEPTH: 10,
  FLOOR_THICKNESS: 1,
  WALL_THICKNESS: 0.1,
} as const;

// Room Positions
export const ROOM_POSITIONS = {
  FLOOR: [0, -0.5, 0] as [number, number, number],
  BACK_WALL: [0, 2, -5] as [number, number, number],
  LEFT_WALL: [-5, 2, 0] as [number, number, number],
  RIGHT_WALL: [5, 2, 0] as [number, number, number],
  
  // Window sections
  WINDOW_LEFT_SECTION: [-3.75, 2, 5] as [number, number, number],
  WINDOW_RIGHT_SECTION: [3.75, 2, 5] as [number, number, number],
  WINDOW_TOP_SECTION: [0, 3.5, 5] as [number, number, number],
  WINDOW_BOTTOM_SECTION: [0, 0.5, 5] as [number, number, number],
  WINDOW_FRAME_OUTER: [0, 2, 5.1] as [number, number, number],
  WINDOW_FRAME_INNER: [0, 2, 5.12] as [number, number, number],
  WINDOW_GLASS: [0, 2, 5.13] as [number, number, number],
  WINDOW_CROSS_VERTICAL: [0, 2, 5.14] as [number, number, number],
  WINDOW_CROSS_HORIZONTAL: [0, 2, 5.14] as [number, number, number],
} as const;

// Room Colors
export const ROOM_COLORS = {
  FLOOR: "#8B5FBF",
  WALLS: "#E6E6FA",
  WINDOW_FRAME_OUTER: "#4A4A4A",
  WINDOW_FRAME_INNER: "#2F4F4F",
  WINDOW_GLASS: "#87CEEB",
  WINDOW_CROSS: "#2F4F4F",
} as const;

// Furniture Positions
export const FURNITURE_POSITIONS = {
  BED: [-3.5, 0.5, -2] as [number, number, number],
  BED_PILLOW: [-3.5, 1.15, -0.8] as [number, number, number],
  DESK: [3.5, 0.5, -3] as [number, number, number],
  CHAIR: [3.5, 0, -2] as [number, number, number],
  TROPHY: [3.5, 1.15, -3] as [number, number, number],
  RUG: [0, 0.01, 0] as [number, number, number],
  PLUSHIE: [-3.5, 1.3, -1] as [number, number, number],
  PLUSHIE_EAR_1: [-3.5, 1.6, -1] as [number, number, number],
  PLUSHIE_EAR_2: [-3.3, 1.6, -1] as [number, number, number],
  BOOKSHELF: [-4.5, 0, 3] as [number, number, number],
} as const;

// Furniture Dimensions
export const FURNITURE_DIMENSIONS = {
  BED: [2, 1, 3] as [number, number, number],
  BED_PILLOW: [1.8, 0.3, 0.8] as [number, number, number],
  DESK: [1.5, 1, 0.8] as [number, number, number],
  TROPHY: [0.1, 0.1, 0.3] as [number, number, number],
  RUG_RADIUS: [1.5, 1.5, 0.1] as [number, number, number],
  PLUSHIE: [0.3, 16, 16] as [number, number, number],
  PLUSHIE_EAR: [0.1, 8, 8] as [number, number, number],
} as const;

// Furniture Colors
export const FURNITURE_COLORS = {
  BED: "#FF69B4",
  BED_PILLOW: "#FFF0F5",
  DESK: "#8B4513",
  TROPHY: "#FFD700",
  RUG: "#DDA0DD",
  PLUSHIE: "#8B4513",
} as const;

// Poster Positions
export const POSTER_POSITIONS = {
  INUYASHA: [-4.99, 2.5, -2] as [number, number, number],
  POKEMON: [4.99, 2.5, 2] as [number, number, number],
  DOGS: [0, 2.5, -4.99] as [number, number, number],
} as const;

// Poster Dimensions
export const POSTER_DIMENSIONS = {
  INUYASHA: [1.5, 2] as [number, number],
  POKEMON: [1.5, 2] as [number, number],
  DOGS: [2, 1.5] as [number, number],
} as const;

// Poster Colors
export const POSTER_COLORS = {
  INUYASHA: "#FF6B6B",
  POKEMON: "#4ECDC4",
  DOGS: "#FFE66D",
} as const;

// Poster Rotations
export const POSTER_ROTATIONS = {
  INUYASHA: [0, Math.PI / 2, 0] as [number, number, number],
  POKEMON: [0, -Math.PI / 2, 0] as [number, number, number],
  DOGS: [0, 0, 0] as [number, number, number],
} as const;

// Window Dimensions
export const WINDOW_DIMENSIONS = {
  LEFT_SECTION: [2.5, 4, 0.1] as [number, number, number],
  RIGHT_SECTION: [2.5, 4, 0.1] as [number, number, number],
  TOP_SECTION: [2.5, 1, 0.1] as [number, number, number],
  BOTTOM_SECTION: [2.5, 1, 0.1] as [number, number, number],
  FRAME_OUTER: [2.5, 2, 0.15] as [number, number, number],
  FRAME_INNER: [2.3, 1.8, 0.05] as [number, number, number],
  GLASS: [2.1, 1.6, 0.02] as [number, number, number],
  CROSS_VERTICAL: [0.05, 1.8, 0.02] as [number, number, number],
  CROSS_HORIZONTAL: [2.1, 0.05, 0.02] as [number, number, number],
} as const;

// Lighting Configuration
export const LIGHTING_CONFIG = {
  AMBIENT_INTENSITY: 0.8,
  DIRECTIONAL_POSITION: [5, 10, 7.5] as [number, number, number],
  DIRECTIONAL_INTENSITY: 1.0,
  POINT_POSITION: [0, 4, 0] as [number, number, number],
  POINT_INTENSITY: 0.7,
  POINT_COLOR: "#E6E6FA",
} as const;

// Avatar Configuration
export const AVATAR_CONFIG = {
  POSITION: [0, 0.17, 0] as [number, number, number],
  MOVEMENT_INTENSITY: "animated" as const,
  SCALE: 0.3, // Avatar scale relative to room (reduced by 40% from original 0.5)
} as const;

// Camera Configuration
export const CAMERA_CONFIG = {
  POSITION: [0, 0.45, 1.8] as [number, number, number], // Front-facing position at avatar eye level
  FOV: 65, // Slightly wider FOV for better room context
  TARGET: [0, 0.4, 0] as [number, number, number], // Target avatar body/head area
  MIN_DISTANCE: 1.2, // Allow getting closer to avatar
  MAX_DISTANCE: 5, // Reduced max distance for more intimate viewing
  MAX_POLAR_ANGLE: Math.PI / 2.1,
} as const;

// Model Paths
export const MODEL_PATHS = {
  ROOM: {
    BED: "/models/room/bed.glb",
    DESK: "/models/room/desk.glb",
    CHAIR: "/models/room/chair.glb",
    BOOKSHELF: "/models/room/bookshelf.glb",
    RUG: "/models/room/rug.glb",
    BEDROOM_COMPLETE: "/models/room/bedroom-complete.glb",
    MODERN_CHAIR: "/models/room/modern-chair.glb",
    PLANT: "/models/room/plant.glb",
  },
  AVATAR: {
    PUPPY: "/models/cartoon-puppy.glb",
  },
} as const;

// Default Scales
export const DEFAULT_SCALES = {
  UNIFORM: 1,
  SMALL: 0.8,
  LARGE: 1.2,
  EXTRA_LARGE: 1.5,
} as const;

// UI Configuration
export const UI_CONFIG = {
  BACKGROUND_COLOR: "#222",
  CONTROL_PANEL: {
    POSITION: {
      TOP: "20px",
      LEFT: "20px",
    },
    Z_INDEX: 1000,
    BACKGROUND: "rgba(0, 0, 0, 0.8)",
    PADDING: "15px",
    BORDER_RADIUS: "8px",
    COLOR: "white",
    FONT_FAMILY: "Arial, sans-serif",
  },
} as const;

// Geometry Segments
export const GEOMETRY_SEGMENTS = {
  CYLINDER_RADIAL: 32,
  CYLINDER_HEIGHT: 1,
  SPHERE_WIDTH: 16,
  SPHERE_HEIGHT: 16,
  TROPHY_SEGMENTS: 8,
} as const;

// Material Properties
export const MATERIAL_PROPERTIES = {
  WINDOW_GLASS: {
    TRANSPARENT: true,
    OPACITY: 0.3,
  },
  SHADOW: {
    CAST_SHADOW: true,
    RECEIVE_SHADOW: true,
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  MODEL_NOT_FOUND: "Model not found",
  FAILED_TO_LOAD_MODEL: "Failed to load room model",
  FALLING_BACK_TO_GEOMETRIC: "falling back to geometric room",
} as const;

// Console Messages
export const CONSOLE_MESSAGES = {
  ROOM_MODEL_LOADED: "Room model loaded successfully",
  MODEL_POSITIONED: "3D model positioned and scaled",
  ATTEMPTING_TO_LOAD: "Attempting to load 3D model from",
  MODEL_LOADED_SUCCESS: "3D model loaded successfully",
  SETTING_UP_MODEL: "Setting up 3D model...",
} as const; 