# Design Best Practices for 3D Avatar Project

## Overview

This document outlines comprehensive design principles, user experience guidelines, and visual design standards for the 3D Avatar project. It focuses on creating an engaging, accessible, and intuitive interface that enhances user interaction with AI-powered avatars in a 3D environment.

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [User Experience Principles](#user-experience-principles)
3. [Visual Design System](#visual-design-system)
4. [3D Environment Design](#3d-environment-design)
5. [Avatar Design Guidelines](#avatar-design-guidelines)
6. [Interface Design Patterns](#interface-design-patterns)
7. [Accessibility Standards](#accessibility-standards)
8. [Performance Considerations](#performance-considerations)
9. [Interaction Design](#interaction-design)
10. [Testing and Validation](#testing-and-validation)

## Design Philosophy

### 1. Human-Centered Design

```typescript
// User Journey Mapping
interface UserJourney {
  phase: 'discovery' | 'onboarding' | 'interaction' | 'engagement' | 'retention';
  goals: string[];
  painPoints: string[];
  opportunities: string[];
  touchpoints: string[];
}

const userJourneys: UserJourney[] = [
  {
    phase: 'discovery',
    goals: ['Understand what the avatar can do', 'Assess trustworthiness'],
    painPoints: ['Unclear capabilities', 'Complex interface'],
    opportunities: ['Clear value proposition', 'Intuitive first impression'],
    touchpoints: ['Landing page', 'Demo video', 'Initial avatar appearance']
  },
  {
    phase: 'onboarding',
    goals: ['Learn how to interact', 'Customize experience'],
    painPoints: ['Overwhelming options', 'Unclear instructions'],
    opportunities: ['Guided tour', 'Progressive disclosure', 'Smart defaults'],
    touchpoints: ['Setup wizard', 'Avatar introduction', 'First conversation']
  }
];
```

### 2. Emotional Connection

```css
/* Emotion-based color palette */
:root {
  /* Trust & Reliability */
  --trust-primary: #2563eb;
  --trust-secondary: #3b82f6;
  
  /* Warmth & Friendliness */
  --warmth-primary: #f59e0b;
  --warmth-secondary: #fbbf24;
  
  /* Calm & Serenity */
  --calm-primary: #10b981;
  --calm-secondary: #34d399;
  
  /* Energy & Excitement */
  --energy-primary: #ef4444;
  --energy-secondary: #f87171;
  
  /* Sophistication */
  --neutral-dark: #1f2937;
  --neutral-medium: #6b7280;
  --neutral-light: #f9fafb;
}
```

### 3. Contextual Awareness

```typescript
// Context-aware design system
interface DesignContext {
  userEmotion: 'happy' | 'sad' | 'excited' | 'calm' | 'frustrated';
  conversationTopic: 'casual' | 'work' | 'learning' | 'support';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  userExperience: 'new' | 'returning' | 'expert';
}

class ContextualDesignAdapter {
  adaptInterface(context: DesignContext): InterfaceConfiguration {
    return {
      colorScheme: this.getContextualColors(context),
      layout: this.getContextualLayout(context),
      animations: this.getContextualAnimations(context),
      typography: this.getContextualTypography(context)
    };
  }

  private getContextualColors(context: DesignContext): ColorScheme {
    const baseColors = {
      happy: 'var(--warmth-primary)',
      sad: 'var(--calm-primary)',
      excited: 'var(--energy-primary)',
      calm: 'var(--trust-primary)',
      frustrated: 'var(--calm-primary)'
    };

    return {
      primary: baseColors[context.userEmotion],
      accent: this.getAccentColor(context),
      background: this.getBackgroundColor(context)
    };
  }
}
```

## User Experience Principles

### 1. Progressive Disclosure

```typescript
// Information Architecture
interface InformationHierarchy {
  essential: string[];      // Always visible
  contextual: string[];     // Shown when relevant
  advanced: string[];       // Available on demand
  expert: string[];         // Hidden by default
}

const chatInterfaceHierarchy: InformationHierarchy = {
  essential: [
    'Message input',
    'Send button',
    'Avatar response',
    'Voice toggle'
  ],
  contextual: [
    'Conversation history',
    'Emotion indicator',
    'Context suggestions',
    'Quick actions'
  ],
  advanced: [
    'Voice settings',
    'Personality adjustment',
    'Export options',
    'Analytics dashboard'
  ],
  expert: [
    'API configuration',
    'Debug information',
    'Performance metrics',
    'System logs'
  ]
};
```

### 2. Feedback and Affordances

```css
/* Interactive feedback system */
.interactive-element {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  
  /* Hover state */
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  /* Active state */
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  /* Focus state */
  &:focus {
    outline: 2px solid var(--trust-primary);
    outline-offset: 2px;
  }
  
  /* Disabled state */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
}

/* Loading states */
.loading {
  position: relative;
  pointer-events: none;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    border: 2px solid transparent;
    border-top: 2px solid var(--trust-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}
```

### 3. Error Prevention and Recovery

```typescript
// Error prevention patterns
interface ErrorPrevention {
  validation: ValidationRule[];
  constraints: InputConstraint[];
  warnings: WarningCondition[];
  recovery: RecoveryAction[];
}

const messageInputErrorPrevention: ErrorPrevention = {
  validation: [
    { rule: 'maxLength', value: 1000, message: 'Message too long' },
    { rule: 'minLength', value: 1, message: 'Message cannot be empty' },
    { rule: 'profanity', value: false, message: 'Please keep it friendly' }
  ],
  constraints: [
    { type: 'rateLimit', value: 10, period: 'minute' },
    { type: 'characterSet', value: 'unicode', exclude: ['<script>', '<iframe>'] }
  ],
  warnings: [
    { condition: 'length > 500', message: 'Long messages may take more time to process' },
    { condition: 'allCaps', message: 'Consider using normal case for better readability' }
  ],
  recovery: [
    { error: 'networkError', action: 'retry', maxAttempts: 3 },
    { error: 'serverError', action: 'saveLocal', message: 'Message saved locally' }
  ]
};
```

## Visual Design System

### 1. Color System

```css
/* Comprehensive color palette */
:root {
  /* Primary Colors */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-200: #bfdbfe;
  --primary-300: #93c5fd;
  --primary-400: #60a5fa;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  --primary-800: #1e40af;
  --primary-900: #1e3a8a;

  /* Semantic Colors */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
  
  /* Neutral Colors */
  --neutral-0: #ffffff;
  --neutral-50: #f9fafb;
  --neutral-100: #f3f4f6;
  --neutral-200: #e5e7eb;
  --neutral-300: #d1d5db;
  --neutral-400: #9ca3af;
  --neutral-500: #6b7280;
  --neutral-600: #4b5563;
  --neutral-700: #374151;
  --neutral-800: #1f2937;
  --neutral-900: #111827;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --background: var(--neutral-900);
    --foreground: var(--neutral-100);
    --card: var(--neutral-800);
    --border: var(--neutral-700);
  }
}
```

### 2. Typography System

```css
/* Typography scale */
:root {
  --font-family-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  --font-family-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  
  /* Font sizes */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */
  --text-5xl: 3rem;       /* 48px */
  
  /* Line heights */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
  
  /* Font weights */
  --font-thin: 100;
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
  --font-black: 900;
}

/* Typography components */
.text-display {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: -0.025em;
}

.text-heading {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
}

.text-body {
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
}

.text-caption {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
  color: var(--neutral-600);
}
```

### 3. Spacing and Layout

```css
/* Spacing scale */
:root {
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */
  --space-32: 8rem;     /* 128px */
}

/* Layout utilities */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

.stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.cluster {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  justify-content: flex-start;
  align-items: center;
}

.sidebar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.sidebar > :first-child {
  flex-basis: 20rem;
  flex-grow: 1;
}

.sidebar > :last-child {
  flex-basis: 0;
  flex-grow: 999;
  min-width: 50%;
}
```

## 3D Environment Design

### 1. Spatial Design Principles

```typescript
// 3D Environment Configuration
interface EnvironmentConfig {
  lighting: LightingSetup;
  materials: MaterialPalette;
  layout: SpatialLayout;
  atmosphere: AtmosphericSettings;
}

const roomEnvironment: EnvironmentConfig = {
  lighting: {
    ambient: { intensity: 0.4, color: '#ffffff' },
    directional: { intensity: 0.8, color: '#ffffff', position: [5, 10, 5] },
    point: { intensity: 0.6, color: '#ffa500', position: [0, 3, 0] }
  },
  materials: {
    walls: { color: '#f5f5f5', roughness: 0.8, metalness: 0.1 },
    floor: { color: '#8b4513', roughness: 0.6, metalness: 0.0 },
    furniture: { color: '#654321', roughness: 0.4, metalness: 0.2 }
  },
  layout: {
    roomSize: { width: 8, height: 4, depth: 8 },
    avatarPosition: [0, 1.6, 0],
    cameraPosition: [2, 2.5, 2],
    interactionZone: { radius: 3, center: [0, 0, 0] }
  },
  atmosphere: {
    fog: { enabled: true, density: 0.02, color: '#e0e0e0' },
    skybox: { type: 'gradient', colors: ['#87CEEB', '#ffffff'] }
  }
};
```

### 2. Visual Hierarchy in 3D

```typescript
// 3D Visual Hierarchy
interface VisualHierarchy3D {
  primary: SceneElement[];    // Main focus points
  secondary: SceneElement[];  // Supporting elements
  tertiary: SceneElement[];   // Background elements
  interactive: SceneElement[]; // User-interactive objects
}

const sceneHierarchy: VisualHierarchy3D = {
  primary: [
    { type: 'avatar', importance: 1.0, scale: 1.0, lighting: 'enhanced' },
    { type: 'speech-bubble', importance: 0.9, scale: 1.0, lighting: 'bright' }
  ],
  secondary: [
    { type: 'furniture', importance: 0.6, scale: 1.0, lighting: 'normal' },
    { type: 'decorations', importance: 0.4, scale: 0.8, lighting: 'subtle' }
  ],
  tertiary: [
    { type: 'walls', importance: 0.3, scale: 1.0, lighting: 'ambient' },
    { type: 'floor', importance: 0.2, scale: 1.0, lighting: 'ambient' }
  ],
  interactive: [
    { type: 'settings-button', importance: 0.7, scale: 1.1, lighting: 'highlight' },
    { type: 'object-details', importance: 0.5, scale: 1.0, lighting: 'normal' }
  ]
};
```

### 3. Camera and Navigation

```typescript
// Camera Control System
interface CameraControls {
  mode: 'orbit' | 'first-person' | 'cinematic' | 'focus';
  constraints: CameraConstraints;
  transitions: CameraTransitions;
  presets: CameraPreset[];
}

const cameraSystem: CameraControls = {
  mode: 'orbit',
  constraints: {
    distance: { min: 2, max: 10, default: 5 },
    angle: { vertical: { min: -30, max: 60 }, horizontal: { min: -180, max: 180 } },
    pan: { enabled: true, sensitivity: 0.8 },
    zoom: { enabled: true, sensitivity: 0.5 }
  },
  transitions: {
    duration: 1.5,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    smoothing: 0.1
  },
  presets: [
    { name: 'conversation', position: [2, 2.5, 2], target: [0, 1.6, 0] },
    { name: 'room-overview', position: [0, 6, 6], target: [0, 0, 0] },
    { name: 'avatar-focus', position: [0, 1.8, 3], target: [0, 1.6, 0] }
  ]
};
```

## Avatar Design Guidelines

### 1. Character Design Principles

```typescript
// Avatar Design System
interface AvatarDesign {
  personality: PersonalityTraits;
  appearance: AppearanceConfig;
  animations: AnimationSet;
  expressions: ExpressionMap;
}

const avatarDesignSystem: AvatarDesign = {
  personality: {
    friendliness: 0.9,
    professionalism: 0.7,
    playfulness: 0.6,
    empathy: 0.8,
    confidence: 0.7
  },
  appearance: {
    species: 'dog',
    breed: 'golden-retriever',
    colors: {
      primary: '#d4af37',
      secondary: '#ffffff',
      accent: '#8b4513'
    },
    proportions: {
      head: 1.2,  // Slightly larger for approachability
      eyes: 1.1,  // Larger eyes for expressiveness
      ears: 1.0,
      body: 1.0
    }
  },
  animations: {
    idle: { duration: 3, loop: true, intensity: 0.3 },
    talking: { duration: 0.5, loop: true, intensity: 0.8 },
    listening: { duration: 2, loop: true, intensity: 0.4 },
    thinking: { duration: 1, loop: true, intensity: 0.6 }
  },
  expressions: {
    happy: { eyebrows: 'raised', mouth: 'smile', ears: 'up' },
    sad: { eyebrows: 'down', mouth: 'frown', ears: 'down' },
    excited: { eyebrows: 'high', mouth: 'open', ears: 'perked' },
    confused: { eyebrows: 'furrowed', mouth: 'neutral', ears: 'tilted' }
  }
};
```

### 2. Emotional Expression System

```typescript
// Emotional Animation System
class EmotionalExpressionSystem {
  private currentEmotion: EmotionState = 'neutral';
  private transitionSpeed: number = 0.5;

  updateExpression(emotion: EmotionState, intensity: number = 1.0): void {
    const targetExpression = this.calculateExpression(emotion, intensity);
    this.animateToExpression(targetExpression);
  }

  private calculateExpression(emotion: EmotionState, intensity: number): ExpressionData {
    const baseExpressions: Record<EmotionState, ExpressionData> = {
      happy: { eyebrows: 0.8, mouth: 0.9, ears: 0.7, tail: 0.9 },
      sad: { eyebrows: -0.6, mouth: -0.7, ears: -0.5, tail: -0.8 },
      excited: { eyebrows: 0.9, mouth: 0.8, ears: 0.9, tail: 1.0 },
      calm: { eyebrows: 0.2, mouth: 0.3, ears: 0.4, tail: 0.5 },
      neutral: { eyebrows: 0.0, mouth: 0.0, ears: 0.0, tail: 0.0 }
    };

    const baseExpression = baseExpressions[emotion];
    
    // Apply intensity scaling
    return Object.entries(baseExpression).reduce((acc, [key, value]) => {
      acc[key] = value * intensity;
      return acc;
    }, {} as ExpressionData);
  }

  private animateToExpression(target: ExpressionData): void {
    // Smooth transition to target expression
    // Implementation would use animation framework
  }
}
```

## Interface Design Patterns

### 1. Conversational Interface

```typescript
// Chat Interface Design System
interface ChatInterfaceDesign {
  layout: ChatLayout;
  messageDesign: MessageDesign;
  inputDesign: InputDesign;
  stateDesign: StateDesign;
}

const chatDesign: ChatInterfaceDesign = {
  layout: {
    type: 'sidebar',
    position: 'right',
    width: { min: 300, max: 400, default: 350 },
    height: '100%',
    padding: 20,
    spacing: 16
  },
  messageDesign: {
    userMessage: {
      alignment: 'right',
      background: 'var(--primary-500)',
      color: 'white',
      borderRadius: [18, 18, 4, 18],
      padding: [12, 16],
      maxWidth: '75%'
    },
    avatarMessage: {
      alignment: 'left',
      background: 'white',
      color: 'var(--neutral-800)',
      borderRadius: [18, 18, 18, 4],
      padding: [12, 16],
      maxWidth: '75%',
      shadow: 'soft'
    }
  },
  inputDesign: {
    type: 'expandable',
    background: 'white',
    border: '2px solid var(--neutral-200)',
    borderRadius: 25,
    padding: [12, 16],
    fontSize: 'var(--text-base)',
    placeholder: 'Type your message...',
    maxHeight: 120
  },
  stateDesign: {
    typing: {
      indicator: 'animated-dots',
      position: 'bottom-left',
      message: 'Avatar is typing...'
    },
    loading: {
      indicator: 'pulse',
      overlay: true,
      message: 'Processing...'
    },
    error: {
      indicator: 'alert-icon',
      color: 'var(--error)',
      message: 'Something went wrong'
    }
  }
};
```

### 2. Responsive Design Patterns

```css
/* Responsive Chat Interface */
.chat-interface {
  /* Desktop */
  @media (min-width: 1024px) {
    position: fixed;
    right: 0;
    top: 0;
    width: 400px;
    height: 100vh;
    border-left: 1px solid var(--neutral-200);
  }
  
  /* Tablet */
  @media (max-width: 1023px) and (min-width: 768px) {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50vh;
    border-top: 1px solid var(--neutral-200);
  }
  
  /* Mobile */
  @media (max-width: 767px) {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60vh;
    border-top: 1px solid var(--neutral-200);
    
    /* Collapsible on mobile */
    &.collapsed {
      height: 60px;
      
      .chat-messages {
        display: none;
      }
      
      .chat-input {
        border-radius: 0;
        margin: 0;
      }
    }
  }
}

/* 3D Viewport Responsive */
.three-d-viewport {
  /* Desktop */
  @media (min-width: 1024px) {
    width: calc(100vw - 400px);
    height: 100vh;
  }
  
  /* Tablet */
  @media (max-width: 1023px) and (min-width: 768px) {
    width: 100vw;
    height: 50vh;
  }
  
  /* Mobile */
  @media (max-width: 767px) {
    width: 100vw;
    height: 40vh;
  }
}
```

## Accessibility Standards

### 1. WCAG Compliance

```typescript
// Accessibility Configuration
interface AccessibilityConfig {
  colorContrast: ContrastRatios;
  keyboardNavigation: KeyboardConfig;
  screenReader: ScreenReaderConfig;
  reducedMotion: MotionConfig;
}

const accessibilityStandards: AccessibilityConfig = {
  colorContrast: {
    normalText: 4.5,    // WCAG AA
    largeText: 3.0,     // WCAG AA
    interactive: 4.5,   // WCAG AA
    nonText: 3.0        // WCAG AA
  },
  keyboardNavigation: {
    tabOrder: 'logical',
    focusIndicator: 'visible',
    skipLinks: true,
    escapeKey: 'close-dialogs',
    arrowKeys: 'navigate-menus'
  },
  screenReader: {
    landmarks: true,
    headingStructure: true,
    altText: 'descriptive',
    ariaLabels: 'comprehensive',
    liveRegions: 'appropriate'
  },
  reducedMotion: {
    respectPreference: true,
    alternativeIndicators: true,
    essentialMotionOnly: true
  }
};
```

### 2. Inclusive Design Patterns

```css
/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  :root {
    --primary-500: #0000ff;
    --background: #ffffff;
    --foreground: #000000;
    --border: #000000;
  }
  
  .avatar-message {
    border: 2px solid var(--foreground);
  }
  
  .interactive-element {
    outline: 2px solid var(--foreground);
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .avatar-animations {
    animation: none;
  }
  
  .smooth-scroll {
    scroll-behavior: auto;
  }
}

/* Focus Management */
.focus-trap {
  &:focus-within {
    .focus-trap-start:focus,
    .focus-trap-end:focus {
      outline: none;
    }
  }
}

/* Screen Reader Only Content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

## Performance Considerations

### 1. Rendering Optimization

```typescript
// Performance Optimization Strategy
interface PerformanceConfig {
  rendering: RenderingConfig;
  assets: AssetConfig;
  interactions: InteractionConfig;
  memory: MemoryConfig;
}

const performanceOptimization: PerformanceConfig = {
  rendering: {
    frameRate: { target: 60, adaptive: true },
    levelOfDetail: { enabled: true, distances: [5, 10, 20] },
    culling: { frustum: true, occlusion: true },
    shadows: { quality: 'adaptive', cascade: true }
  },
  assets: {
    textures: { compression: 'draco', mipmaps: true },
    models: { optimization: 'automatic', simplification: true },
    loading: { progressive: true, prioritization: 'viewport' }
  },
  interactions: {
    debouncing: { input: 100, resize: 250 },
    throttling: { scroll: 16, mouse: 16 },
    batching: { updates: true, renders: true }
  },
  memory: {
    pooling: { objects: true, textures: true },
    cleanup: { automatic: true, interval: 30000 },
    limits: { textures: 512, geometries: 100 }
  }
};
```

### 2. Loading States and Skeleton UI

```css
/* Skeleton Loading UI */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-text {
  height: 1em;
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-text:nth-child(odd) {
  width: 80%;
}

.skeleton-text:nth-child(even) {
  width: 60%;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.skeleton-message {
  width: 200px;
  height: 60px;
  border-radius: 18px;
}
```

## Testing and Validation

### 1. Design System Testing

```typescript
// Visual Regression Testing
interface DesignTestSuite {
  components: ComponentTest[];
  interactions: InteractionTest[];
  responsive: ResponsiveTest[];
  accessibility: AccessibilityTest[];
}

const designTests: DesignTestSuite = {
  components: [
    { name: 'ChatMessage', variants: ['user', 'avatar', 'system'] },
    { name: 'Avatar', states: ['idle', 'talking', 'listening'] },
    { name: 'InputField', states: ['default', 'focused', 'error'] }
  ],
  interactions: [
    { name: 'MessageSending', steps: ['type', 'send', 'receive'] },
    { name: 'AvatarInteraction', steps: ['hover', 'click', 'respond'] }
  ],
  responsive: [
    { breakpoint: 'mobile', viewport: [375, 667] },
    { breakpoint: 'tablet', viewport: [768, 1024] },
    { breakpoint: 'desktop', viewport: [1200, 800] }
  ],
  accessibility: [
    { test: 'colorContrast', threshold: 4.5 },
    { test: 'keyboardNavigation', coverage: 'complete' },
    { test: 'screenReader', compatibility: 'NVDA, JAWS, VoiceOver' }
  ]
};
```

### 2. User Testing Framework

```typescript
// User Testing Protocol
interface UserTestingProtocol {
  scenarios: TestScenario[];
  metrics: UsabilityMetric[];
  demographics: UserDemographic[];
  methodology: TestingMethodology;
}

const userTestingFramework: UserTestingProtocol = {
  scenarios: [
    {
      name: 'First-time user onboarding',
      steps: ['Land on page', 'Understand purpose', 'Start conversation'],
      success: 'User successfully sends first message',
      metrics: ['time-to-first-message', 'error-rate', 'satisfaction']
    },
    {
      name: 'Extended conversation',
      steps: ['Engage in 10+ message exchange', 'Use voice features'],
      success: 'User maintains engagement throughout',
      metrics: ['conversation-length', 'feature-usage', 'drop-off-rate']
    }
  ],
  metrics: [
    { name: 'task-completion-rate', target: 0.9 },
    { name: 'time-on-task', target: 120 },
    { name: 'error-rate', target: 0.1 },
    { name: 'satisfaction-score', target: 4.5 }
  ],
  demographics: [
    { age: '18-65', techSavvy: 'mixed', disabilities: 'inclusive' }
  ],
  methodology: {
    type: 'moderated-remote',
    sampleSize: 20,
    duration: 45,
    recording: true
  }
};
```

## Design System Governance

### 1. Design Tokens

```typescript
// Design Token System
interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  motion: MotionTokens;
  elevation: ElevationTokens;
}

const designTokens: DesignTokens = {
  colors: {
    brand: {
      primary: '#3b82f6',
      secondary: '#10b981',
      tertiary: '#f59e0b'
    },
    semantic: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      // ... complete scale
      900: '#111827'
    }
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Menlo', 'monospace']
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      // ... complete scale
      '5xl': '3rem'
    }
  },
  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    // ... complete scale
    32: '8rem'
  },
  motion: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)'
    }
  },
  elevation: {
    1: '0 1px 3px rgba(0, 0, 0, 0.1)',
    2: '0 4px 6px rgba(0, 0, 0, 0.1)',
    3: '0 10px 15px rgba(0, 0, 0, 0.1)',
    4: '0 20px 25px rgba(0, 0, 0, 0.1)'
  }
};
```

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Establish design system foundation
- [ ] Create component library
- [ ] Implement responsive layouts
- [ ] Set up accessibility standards

### Phase 2: 3D Environment (Weeks 3-4)
- [ ] Design 3D environment layout
- [ ] Create avatar design system
- [ ] Implement camera controls
- [ ] Add lighting and materials

### Phase 3: Interaction Design (Weeks 5-6)
- [ ] Design conversational interface
- [ ] Create animation system
- [ ] Implement feedback mechanisms
- [ ] Add state management

### Phase 4: Polish and Testing (Weeks 7-8)
- [ ] Conduct user testing
- [ ] Implement accessibility features
- [ ] Optimize performance
- [ ] Create documentation

---

*This design guide should be used in conjunction with the technical implementation outlined in `implementation.md` and the context engineering practices in `IMPLEMENTATION.md`.* 