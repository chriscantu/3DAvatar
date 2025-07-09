// Component contracts for type safety and validation
// Defines clear interfaces and validation for all components

import type { ReactNode } from 'react';

// Base contract for all components
export interface ComponentContract {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
  testId?: string;
}

// Contract for components with error handling
export interface ErrorHandlingContract {
  onError?: (error: Error) => void;
  fallback?: ReactNode;
  retryable?: boolean;
  maxRetries?: number;
}

// Contract for components with loading states
export interface LoadingStateContract {
  isLoading?: boolean;
  loadingText?: string;
  loadingComponent?: ReactNode;
}

// Contract for components with accessibility features
export interface AccessibilityContract {
  ariaLabel?: string;
  ariaDescribedBy?: string;
  role?: string;
  tabIndex?: number;
}

// Contract for components with animations
export interface AnimationContract {
  animate?: boolean;
  animationDuration?: number;
  animationDelay?: number;
  animationEasing?: string;
}

// Contract for components with theme support
export interface ThemeContract {
  theme?: 'light' | 'dark' | 'auto';
  colorScheme?: string;
}

// Avatar component contract
export interface AvatarComponentContract extends ComponentContract, ErrorHandlingContract, LoadingStateContract, AccessibilityContract, AnimationContract, ThemeContract {
  // Position and transform properties
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  
  // State properties
  isVisible?: boolean;
  isInteractive?: boolean;
  isAnimating?: boolean;
  
  // Behavior properties
  lookAtTarget?: [number, number, number];
  followMouse?: boolean;
  autoRotate?: boolean;
  
  // Model properties
  modelUrl?: string;
  modelType?: 'gltf' | 'fbx' | 'obj' | 'geometric';
  geometryType?: 'sphere' | 'box' | 'cylinder' | 'cone';
  
  // Animation settings
  idleAnimation?: string;
  talkingAnimation?: string;
  listeningAnimation?: string;
  breathingIntensity?: number;
  
  // Event handlers
  onLoad?: () => void;
  onLoadError?: (error: Error) => void;
  onAnimationComplete?: (animationName: string) => void;
  onInteraction?: (interactionType: string) => void;
  
  // Performance options
  renderDistance?: number;
  levelOfDetail?: boolean;
  frustumCulling?: boolean;
}

// Chat interface component contract
export interface ChatInterfaceComponentContract extends ComponentContract, ErrorHandlingContract, LoadingStateContract, AccessibilityContract, ThemeContract {
  // Core functionality
  messages?: Array<{
    id: string;
    content: string;
    sender: 'user' | 'assistant';
    timestamp: number;
  }>;
  isTyping?: boolean;
  isConnected?: boolean;
  
  // Input properties
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  autoFocus?: boolean;
  
  // Voice properties
  voiceEnabled?: boolean;
  voiceLanguage?: string;
  voiceRate?: number;
  
  // Context properties
  contextEnabled?: boolean;
  contextDepth?: number;
  memoryEnabled?: boolean;
  
  // Event handlers
  onSendMessage?: (message: string) => void;
  onVoiceStart?: () => void;
  onVoiceEnd?: () => void;
  onClearChat?: () => void;
  onExportChat?: () => void;
  
  // Configuration options
  showTimestamps?: boolean;
  showTypingIndicator?: boolean;
  enableMarkdown?: boolean;
  enableEmoji?: boolean;
  enableFileUpload?: boolean;
  maxFileSize?: number;
  allowedFileTypes?: string[];
}

// 3D Room component contract
export interface ThreeDRoomComponentContract extends ComponentContract, ErrorHandlingContract, LoadingStateContract, AccessibilityContract, AnimationContract, ThemeContract {
  // Avatar properties
  avatarPosition?: [number, number, number];
  avatarScale?: number;
  avatarVisible?: boolean;
  
  // Room properties
  roomType?: 'office' | 'living' | 'studio' | 'outdoor';
  roomSize?: [number, number, number];
  wallColor?: string;
  floorColor?: string;
  ceilingColor?: string;
  
  // Furniture properties
  furnitureEnabled?: boolean;
  furnitureStyle?: 'modern' | 'classic' | 'minimal';
  furnitureColor?: string;
  
  // Lighting properties
  ambientLight?: boolean;
  ambientIntensity?: number;
  directionalLight?: boolean;
  directionalIntensity?: number;
  lightPosition?: [number, number, number];
  shadowsEnabled?: boolean;
  
  // Camera properties
  cameraPosition?: [number, number, number];
  cameraTarget?: [number, number, number];
  cameraControls?: boolean;
  autoRotate?: boolean;
  zoomEnabled?: boolean;
  panEnabled?: boolean;
  
  // Performance settings
  antialiasing?: boolean;
  shadows?: boolean;
  fog?: boolean;
  pixelRatio?: number;
  
  // Event handlers
  onSceneLoad?: () => void;
  onCameraMove?: (position: [number, number, number]) => void;
  onObjectClick?: (objectName: string) => void;
}

// Error boundary component contract
export interface ErrorBoundaryComponentContract extends ComponentContract {
  fallback?: ReactNode | ((error: Error, errorInfo: React.ErrorInfo) => ReactNode);
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  retryable?: boolean;
  maxRetries?: number;
  autoRetry?: boolean;
  showErrorDetails?: boolean;
  logErrors?: boolean;
  reportErrors?: boolean;
}

// Settings component contract
export interface SettingsComponentContract extends ComponentContract, ErrorHandlingContract, LoadingStateContract, AccessibilityContract, ThemeContract {
  // General settings
  autoSave?: boolean;
  resetToDefaults?: boolean;
  exportSettings?: boolean;
  importSettings?: boolean;
  
  // Avatar settings
  avatarEnabled?: boolean;
  avatarModel?: string;
  avatarScale?: number;
  avatarPosition?: [number, number, number];
  
  // Chat settings
  chatEnabled?: boolean;
  voiceEnabled?: boolean;
  contextEnabled?: boolean;
  memoryEnabled?: boolean;
  
  // Room settings
  roomEnabled?: boolean;
  roomType?: string;
  lightingEnabled?: boolean;
  shadowsEnabled?: boolean;
  
  // Performance settings
  qualityLevel?: 'low' | 'medium' | 'high' | 'ultra';
  antialiasing?: boolean;
  renderDistance?: number;
  
  // Event handlers
  onSettingsChange?: (settings: Record<string, unknown>) => void;
  onReset?: () => void;
  onExport?: () => void;
  onImport?: (settings: Record<string, unknown>) => void;
}

// Validation functions
export class ContractValidator {
  static validateComponentContract(contract: ComponentContract): boolean {
    return typeof contract === 'object' && contract !== null;
  }

  static validateAvatarContract(contract: AvatarComponentContract): boolean {
    if (!this.validateComponentContract(contract)) return false;
    
    // Validate position array
    if (contract.position && (!Array.isArray(contract.position) || contract.position.length !== 3)) {
      return false;
    }
    
    // Validate rotation array
    if (contract.rotation && (!Array.isArray(contract.rotation) || contract.rotation.length !== 3)) {
      return false;
    }
    
    // Validate scale array
    if (contract.scale && (!Array.isArray(contract.scale) || contract.scale.length !== 3)) {
      return false;
    }
    
    return true;
  }

  static validateChatInterfaceContract(contract: ChatInterfaceComponentContract): boolean {
    if (!this.validateComponentContract(contract)) return false;
    
    // Validate messages array
    if (contract.messages && !Array.isArray(contract.messages)) {
      return false;
    }
    
    // Validate message structure
    if (contract.messages) {
      for (const message of contract.messages) {
        if (!message.id || !message.content || !message.sender || !message.timestamp) {
          return false;
        }
        if (!['user', 'assistant'].includes(message.sender)) {
          return false;
        }
      }
    }
    
    return true;
  }

  static validateThreeDRoomContract(contract: ThreeDRoomComponentContract): boolean {
    if (!this.validateComponentContract(contract)) return false;
    
    // Validate avatar position
    if (contract.avatarPosition && (!Array.isArray(contract.avatarPosition) || contract.avatarPosition.length !== 3)) {
      return false;
    }
    
    // Validate room size
    if (contract.roomSize && (!Array.isArray(contract.roomSize) || contract.roomSize.length !== 3)) {
      return false;
    }
    
    // Validate camera position
    if (contract.cameraPosition && (!Array.isArray(contract.cameraPosition) || contract.cameraPosition.length !== 3)) {
      return false;
    }
    
    return true;
  }

  static validateErrorBoundaryContract(contract: ErrorBoundaryComponentContract): boolean {
    if (!this.validateComponentContract(contract)) return false;
    
    // Validate maxRetries
    if (contract.maxRetries && (typeof contract.maxRetries !== 'number' || contract.maxRetries < 0)) {
      return false;
    }
    
    return true;
  }

  static validateSettingsContract(contract: SettingsComponentContract): boolean {
    if (!this.validateComponentContract(contract)) return false;
    
    // Validate quality level
    if (contract.qualityLevel && !['low', 'medium', 'high', 'ultra'].includes(contract.qualityLevel)) {
      return false;
    }
    
    // Validate avatar position
    if (contract.avatarPosition && (!Array.isArray(contract.avatarPosition) || contract.avatarPosition.length !== 3)) {
      return false;
    }
    
    return true;
  }
}

// Builder pattern for creating contracts
export class ContractBuilder {
  static createAvatarContract(overrides: Partial<AvatarComponentContract> = {}): AvatarComponentContract {
    return {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      isVisible: true,
      isInteractive: true,
      isAnimating: false,
      modelType: 'geometric',
      geometryType: 'sphere',
      breathingIntensity: 0.5,
      renderDistance: 100,
      levelOfDetail: true,
      frustumCulling: true,
      ...overrides
    };
  }

  static createChatInterfaceContract(overrides: Partial<ChatInterfaceComponentContract> = {}): ChatInterfaceComponentContract {
    return {
      messages: [],
      isTyping: false,
      isConnected: true,
      placeholder: 'Type your message...',
      maxLength: 1000,
      multiline: true,
      autoFocus: false,
      voiceEnabled: false,
      contextEnabled: true,
      contextDepth: 10,
      memoryEnabled: true,
      showTimestamps: true,
      showTypingIndicator: true,
      enableMarkdown: true,
      enableEmoji: true,
      enableFileUpload: false,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedFileTypes: ['image/*', 'text/*'],
      ...overrides
    };
  }

  static createThreeDRoomContract(overrides: Partial<ThreeDRoomComponentContract> = {}): ThreeDRoomComponentContract {
    return {
      avatarPosition: [0, 0, 0],
      avatarScale: 1,
      avatarVisible: true,
      roomType: 'office',
      roomSize: [10, 3, 10],
      wallColor: '#f0f0f0',
      floorColor: '#8b4513',
      ceilingColor: '#ffffff',
      furnitureEnabled: true,
      furnitureStyle: 'modern',
      furnitureColor: '#8b4513',
      ambientLight: true,
      ambientIntensity: 0.6,
      directionalLight: true,
      directionalIntensity: 0.8,
      lightPosition: [10, 10, 5],
      shadowsEnabled: true,
      cameraPosition: [0, 5, 10],
      cameraTarget: [0, 0, 0],
      cameraControls: true,
      autoRotate: false,
      zoomEnabled: true,
      panEnabled: true,
      antialiasing: true,
      shadows: true,
      fog: false,
      pixelRatio: window.devicePixelRatio,
      ...overrides
    };
  }

  static createErrorBoundaryContract(overrides: Partial<ErrorBoundaryComponentContract> = {}): ErrorBoundaryComponentContract {
    return {
      retryable: true,
      maxRetries: 3,
      autoRetry: false,
      showErrorDetails: process.env.NODE_ENV === 'development',
      logErrors: true,
      reportErrors: true,
      ...overrides
    };
  }

  static createSettingsContract(overrides: Partial<SettingsComponentContract> = {}): SettingsComponentContract {
    return {
      autoSave: true,
      resetToDefaults: false,
      exportSettings: true,
      importSettings: true,
      avatarEnabled: true,
      avatarModel: 'default',
      avatarScale: 1,
      avatarPosition: [0, 0, 0],
      chatEnabled: true,
      voiceEnabled: false,
      contextEnabled: true,
      memoryEnabled: true,
      roomEnabled: true,
      roomType: 'office',
      lightingEnabled: true,
      shadowsEnabled: true,
      qualityLevel: 'medium',
      antialiasing: true,
      renderDistance: 100,
      ...overrides
    };
  }
}

// Type guards
export function isAvatarContract(contract: unknown): contract is AvatarComponentContract {
  return ContractValidator.validateAvatarContract(contract as AvatarComponentContract);
}

export function isChatInterfaceContract(contract: unknown): contract is ChatInterfaceComponentContract {
  return ContractValidator.validateChatInterfaceContract(contract as ChatInterfaceComponentContract);
}

export function isThreeDRoomContract(contract: unknown): contract is ThreeDRoomComponentContract {
  return ContractValidator.validateThreeDRoomContract(contract as ThreeDRoomComponentContract);
}

export function isErrorBoundaryContract(contract: unknown): contract is ErrorBoundaryComponentContract {
  return ContractValidator.validateErrorBoundaryContract(contract as ErrorBoundaryComponentContract);
}

export function isSettingsContract(contract: unknown): contract is SettingsComponentContract {
  return ContractValidator.validateSettingsContract(contract as SettingsComponentContract);
}

// Contract enforcement decorator (for development)
export function enforceContract<T extends ComponentContract>(
  contractValidator: (contract: T) => boolean
) {
  return function <P extends T>(
    target: React.ComponentType<P>,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    if (process.env.NODE_ENV === 'development') {
      const originalMethod = descriptor.value;
      descriptor.value = function (this: React.Component<P>, ...args: Parameters<typeof originalMethod>) {
        if (!contractValidator(this.props as T)) {
          console.warn(`Contract validation failed for component ${target.name}`);
        }
        return originalMethod.apply(this, args);
      };
    }
    return descriptor;
  };
} 