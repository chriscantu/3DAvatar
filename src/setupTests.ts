import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';
import { setupThreeJSMocks } from './test-utils/enhanced-three-mocks';

// Setup comprehensive Three.js mocking
setupThreeJSMocks();

// Mock WebGL context for testing
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn((contextType: string) => {
    if (contextType === 'webgl' || contextType === 'webgl2') {
      return {
        // WebGL context mock
        canvas: document.createElement('canvas'),
        drawingBufferWidth: 800,
        drawingBufferHeight: 600,
        getParameter: vi.fn(() => 'WebGL 2.0'),
        getExtension: vi.fn(() => null),
        viewport: vi.fn(),
        clearColor: vi.fn(),
        clear: vi.fn(),
        enable: vi.fn(),
        disable: vi.fn(),
        depthFunc: vi.fn(),
        blendFunc: vi.fn(),
        createShader: vi.fn(),
        shaderSource: vi.fn(),
        compileShader: vi.fn(),
        createProgram: vi.fn(),
        attachShader: vi.fn(),
        linkProgram: vi.fn(),
        useProgram: vi.fn(),
        createBuffer: vi.fn(),
        bindBuffer: vi.fn(),
        bufferData: vi.fn(),
        createTexture: vi.fn(),
        bindTexture: vi.fn(),
        texImage2D: vi.fn(),
        texParameteri: vi.fn(),
        createFramebuffer: vi.fn(),
        bindFramebuffer: vi.fn(),
        framebufferTexture2D: vi.fn(),
        readPixels: vi.fn(),
        deleteBuffer: vi.fn(),
        deleteTexture: vi.fn(),
        deleteFramebuffer: vi.fn(),
        deleteProgram: vi.fn(),
        deleteShader: vi.fn(),
        getShaderParameter: vi.fn(() => true),
        getProgramParameter: vi.fn(() => true),
        getShaderInfoLog: vi.fn(() => ''),
        getProgramInfoLog: vi.fn(() => ''),
        // Add more WebGL methods as needed
        VERTEX_SHADER: 35633,
        FRAGMENT_SHADER: 35632,
        COMPILE_STATUS: 35713,
        LINK_STATUS: 35714,
        ARRAY_BUFFER: 34962,
        ELEMENT_ARRAY_BUFFER: 34963,
        STATIC_DRAW: 35044,
        DYNAMIC_DRAW: 35048,
        TEXTURE_2D: 3553,
        RGBA: 6408,
        UNSIGNED_BYTE: 5121,
        TEXTURE_MAG_FILTER: 10240,
        TEXTURE_MIN_FILTER: 10241,
        LINEAR: 9729,
        NEAREST: 9728,
        COLOR_BUFFER_BIT: 16384,
        DEPTH_BUFFER_BIT: 256,
        DEPTH_TEST: 2929,
        BLEND: 3042,
        SRC_ALPHA: 770,
        ONE_MINUS_SRC_ALPHA: 771,
        FRAMEBUFFER: 36160,
        COLOR_ATTACHMENT0: 36064,
        FRAMEBUFFER_COMPLETE: 36053
      };
    }
    return null;
  })
});

// Mock ResizeObserver for testing
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock requestAnimationFrame for testing
global.requestAnimationFrame = vi.fn((callback) => {
  setTimeout(callback, 16);
  return 1;
});

global.cancelAnimationFrame = vi.fn();

// Mock performance.now for consistent timing in tests
Object.defineProperty(global.performance, 'now', {
  value: vi.fn(() => Date.now()),
  writable: true
});

// Mock localStorage for testing
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock sessionStorage for testing
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
  writable: true
});

// Mock Speech Synthesis API
global.SpeechSynthesisUtterance = vi.fn().mockImplementation(() => ({
  text: '',
  voice: null,
  volume: 1,
  rate: 1,
  pitch: 1,
  onstart: null,
  onend: null,
  onerror: null,
  onpause: null,
  onresume: null,
  onmark: null,
  onboundary: null
}));

Object.defineProperty(global, 'speechSynthesis', {
  value: {
    speak: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn().mockReturnValue([]),
    speaking: false,
    pending: false,
    paused: false,
    onvoiceschanged: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn().mockReturnValue(true)
  },
  writable: true
});

// Mock Web Audio API
Object.defineProperty(window, 'AudioContext', {
  value: vi.fn().mockImplementation(() => ({
    createOscillator: vi.fn(() => ({
      frequency: { value: 440 },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn()
    })),
    createGain: vi.fn(() => ({
      gain: { value: 1 },
      connect: vi.fn()
    })),
    destination: {},
    currentTime: 0,
    sampleRate: 44100,
    state: 'running',
    suspend: vi.fn(),
    resume: vi.fn(),
    close: vi.fn()
  })),
  writable: true
});

// Mock MediaDevices API for voice testing
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: vi.fn().mockReturnValue([
        {
          stop: vi.fn(),
          enabled: true,
          kind: 'audio',
          label: 'Mock Audio Track'
        }
      ])
    }),
    enumerateDevices: vi.fn().mockResolvedValue([
      {
        deviceId: 'mock-device-id',
        kind: 'audioinput',
        label: 'Mock Microphone',
        groupId: 'mock-group-id'
      }
    ])
  },
  writable: true
});

// Mock IntersectionObserver for testing
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: []
}));

// Mock MutationObserver for testing
global.MutationObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn().mockReturnValue([])
}));

// Enhanced console methods for better test debugging
const originalConsole = { ...console };

// Override console methods to provide better test output
console.log = vi.fn((...args) => {
  if (process.env.NODE_ENV === 'test' && process.env.VERBOSE_TESTS) {
    originalConsole.log('[TEST LOG]', ...args);
  }
});

console.error = vi.fn((...args) => {
  if (process.env.NODE_ENV === 'test') {
    originalConsole.error('[TEST ERROR]', ...args);
  }
});

console.warn = vi.fn((...args) => {
  if (process.env.NODE_ENV === 'test' && process.env.VERBOSE_TESTS) {
    originalConsole.warn('[TEST WARN]', ...args);
  }
});

// Global test utilities
global.testUtils = {
  // Helper to wait for next tick
  nextTick: () => new Promise(resolve => setTimeout(resolve, 0)),
  
  // Helper to wait for animation frame
  waitForAnimationFrame: () => new Promise(resolve => requestAnimationFrame(resolve)),
  
  // Helper to wait for multiple frames
  waitForFrames: (count: number) => {
    return new Promise<void>(resolve => {
      let frameCount = 0;
      const frame = (_time: number) => {
        frameCount++;
        if (frameCount >= count) {
          resolve();
        } else {
          requestAnimationFrame(frame);
        }
      };
      requestAnimationFrame(frame);
    });
  },
  
  // Helper to simulate time passage
  advanceTime: (ms: number) => {
    vi.advanceTimersByTime(ms);
  },
  
  // Helper to restore all mocks
  restoreAllMocks: () => {
    vi.restoreAllMocks();
  },
  
  // Helper to clear all mocks
  clearAllMocks: () => {
    vi.clearAllMocks();
  }
};

// Setup fake timers for consistent testing
vi.useFakeTimers();

// Cleanup function to run after each test
export function setupTestCleanup() {
  // Clear all mocks after each test
  vi.clearAllMocks();
  
  // Reset fake timers
  vi.clearAllTimers();
  
  // Clear localStorage
  localStorageMock.clear();
  
  // Reset any global state
  if (global.testUtils) {
    global.testUtils.restoreAllMocks();
  }
}

// Auto-cleanup setup
afterEach(() => {
  setupTestCleanup();
});

// Global types for test utilities
declare global {
  namespace globalThis {
    var testUtils: {
      nextTick: () => Promise<void>;
      waitForAnimationFrame: () => Promise<void>;
      waitForFrames: (count: number) => Promise<void>;
      advanceTime: (ms: number) => void;
      restoreAllMocks: () => void;
      clearAllMocks: () => void;
    };
  }
}

export default {
  setupTestCleanup,
  localStorageMock
}; 