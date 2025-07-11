import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock DOM APIs for testing environment
Element.prototype.scrollIntoView = vi.fn();

// Mock Three.js for testing
vi.mock('three', () => ({
  WebGLRenderer: vi.fn().mockImplementation(() => ({
    setSize: vi.fn(),
    render: vi.fn(),
    domElement: document.createElement('canvas'),
  })),
  Scene: vi.fn(),
  PerspectiveCamera: vi.fn(),
  BoxGeometry: vi.fn(),
  MeshBasicMaterial: vi.fn(),
  Mesh: vi.fn(),
  DirectionalLight: vi.fn(),
  AmbientLight: vi.fn(),
  PlaneGeometry: vi.fn(),
  MeshStandardMaterial: vi.fn(),
  SphereGeometry: vi.fn(),
  CylinderGeometry: vi.fn(),
  CapsuleGeometry: vi.fn(), // Added for snout geometry
  ConeGeometry: vi.fn(),    // Added for ear geometry
  Vector3: vi.fn(),
  MathUtils: {
    lerp: vi.fn((a, b, t) => a + (b - a) * t),
  },
}));

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  Canvas: vi.fn().mockImplementation(({ children }) => children),
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({
    camera: {},
    scene: {},
    gl: {},
  })),
}));

// Mock @react-three/drei
vi.mock('@react-three/drei', () => ({
  OrbitControls: vi.fn().mockImplementation(() => null),
}));

// Mock Web APIs
Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});

Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: {
    speak: vi.fn(),
    cancel: vi.fn(),
    getVoices: vi.fn(() => []),
  },
}); 