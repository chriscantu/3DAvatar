import { vi, beforeEach, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { QUALITY_GATES, PERFORMANCE_BENCHMARKS } from './phase3-test-config';

/**
 * Phase 3 Test Setup
 * Enhanced test environment with performance monitoring and type safety
 */

// Global test setup
beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();
  
  // Reset performance monitoring
  if (typeof performance !== 'undefined' && performance.clearMarks) {
    performance.clearMarks();
    performance.clearMeasures();
  }
  
  // Reset console to catch warnings/errors
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  console.error = vi.fn((...args) => {
    // Fail tests on console.error unless explicitly allowed
    if (!args[0]?.includes('Warning: ReactDOM.render is no longer supported')) {
      throw new Error(`Console error: ${args.join(' ')}`);
    }
    originalConsoleError(...args);
  });
  
  console.warn = vi.fn((...args) => {
    // Log warnings but don't fail tests
    originalConsoleWarn(...args);
  });
});

afterEach(() => {
  // Cleanup React Testing Library
  cleanup();
  
  // Restore console
  vi.restoreAllMocks();
  
  // Clean up any remaining timers
  vi.clearAllTimers();
});

// Enhanced WebGL mocking for better 3D testing
const createEnhancedWebGLMock = () => {
  const canvas = document.createElement('canvas');
  const context = {
    // WebGL context methods
    createShader: vi.fn(() => ({})),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    getShaderParameter: vi.fn(() => true),
    createProgram: vi.fn(() => ({})),
    attachShader: vi.fn(),
    linkProgram: vi.fn(),
    getProgramParameter: vi.fn(() => true),
    useProgram: vi.fn(),
    createBuffer: vi.fn(() => ({})),
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    vertexAttribPointer: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    getUniformLocation: vi.fn(() => ({})),
    uniform1f: vi.fn(),
    uniform1i: vi.fn(),
    uniform2f: vi.fn(),
    uniform3f: vi.fn(),
    uniform4f: vi.fn(),
    uniformMatrix4fv: vi.fn(),
    drawArrays: vi.fn(),
    drawElements: vi.fn(),
    viewport: vi.fn(),
    clear: vi.fn(),
    clearColor: vi.fn(),
    enable: vi.fn(),
    disable: vi.fn(),
    depthFunc: vi.fn(),
    blendFunc: vi.fn(),
    createTexture: vi.fn(() => ({})),
    bindTexture: vi.fn(),
    texImage2D: vi.fn(),
    texParameteri: vi.fn(),
    generateMipmap: vi.fn(),
    deleteTexture: vi.fn(),
    deleteBuffer: vi.fn(),
    deleteProgram: vi.fn(),
    deleteShader: vi.fn(),
    
    // WebGL constants
    VERTEX_SHADER: 35633,
    FRAGMENT_SHADER: 35632,
    ARRAY_BUFFER: 34962,
    ELEMENT_ARRAY_BUFFER: 34963,
    STATIC_DRAW: 35044,
    DYNAMIC_DRAW: 35048,
    FLOAT: 5126,
    TRIANGLES: 4,
    DEPTH_TEST: 2929,
    BLEND: 3042,
    SRC_ALPHA: 770,
    ONE_MINUS_SRC_ALPHA: 771,
    TEXTURE_2D: 3553,
    RGBA: 6408,
    UNSIGNED_BYTE: 5121,
    TEXTURE_MAG_FILTER: 10240,
    TEXTURE_MIN_FILTER: 10241,
    LINEAR: 9729,
    NEAREST: 9728
  };
  
  canvas.getContext = vi.fn((contextType: string) => {
    if (contextType === 'webgl' || contextType === 'webgl2') {
      return context;
    }
    return null;
  });
  
  return { canvas, context };
};

// Mock HTMLCanvasElement
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn((contextType: string) => {
    if (contextType === 'webgl' || contextType === 'webgl2') {
      return createEnhancedWebGLMock().context;
    }
    if (contextType === '2d') {
      return {
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        getImageData: vi.fn(() => ({
          data: new Uint8ClampedArray(4),
          width: 1,
          height: 1
        })),
        putImageData: vi.fn(),
        createImageData: vi.fn(() => ({
          data: new Uint8ClampedArray(4),
          width: 1,
          height: 1
        })),
        setTransform: vi.fn(),
        drawImage: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),
      };
    }
    return null;
  }),
  configurable: true
});

// Enhanced ResizeObserver mock
global.ResizeObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn((element) => {
    // Simulate resize observation
    callback([{
      target: element,
      contentRect: {
        width: 800,
        height: 600,
        top: 0,
        left: 0,
        bottom: 600,
        right: 800
      }
    }]);
  }),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Enhanced IntersectionObserver mock
global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn((element) => {
    // Simulate intersection
    callback([{
      target: element,
      isIntersecting: true,
      intersectionRatio: 1,
      boundingClientRect: {
        width: 800,
        height: 600,
        top: 0,
        left: 0,
        bottom: 600,
        right: 800
      },
      intersectionRect: {
        width: 800,
        height: 600,
        top: 0,
        left: 0,
        bottom: 600,
        right: 800
      },
      rootBounds: {
        width: 800,
        height: 600,
        top: 0,
        left: 0,
        bottom: 600,
        right: 800
      }
    }]);
  }),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Performance monitoring setup
const performanceMonitor = {
  startTest: (testName: string) => {
    performance.mark(`${testName}-start`);
  },
  
  endTest: (testName: string) => {
    performance.mark(`${testName}-end`);
    performance.measure(testName, `${testName}-start`, `${testName}-end`);
    
    const measure = performance.getEntriesByName(testName)[0];
    const benchmark = PERFORMANCE_BENCHMARKS.componentRender[testName as keyof typeof PERFORMANCE_BENCHMARKS.componentRender];
    
    if (benchmark && measure.duration > benchmark.maxTime) {
      console.warn(`Performance warning: ${testName} took ${measure.duration}ms (max: ${benchmark.maxTime}ms)`);
    }
    
    return {
      duration: measure.duration,
      benchmark: benchmark?.maxTime || 0
    };
  }
};

// Enhanced Speech API mocks
Object.defineProperty(window, 'speechSynthesis', {
  value: {
    speak: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn(() => []),
    speaking: false,
    pending: false,
    paused: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  },
  configurable: true
});

Object.defineProperty(window, 'SpeechSynthesisUtterance', {
  value: vi.fn().mockImplementation((text) => ({
    text,
    voice: null,
    volume: 1,
    rate: 1,
    pitch: 1,
    lang: 'en-US',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  })),
  configurable: true
});

// Enhanced Web Speech API mock
Object.defineProperty(window, 'webkitSpeechRecognition', {
  value: vi.fn().mockImplementation(() => ({
    continuous: false,
    interimResults: false,
    lang: 'en-US',
    maxAlternatives: 1,
    serviceURI: '',
    grammars: null,
    start: vi.fn(),
    stop: vi.fn(),
    abort: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  })),
  configurable: true
});

// Mock URL.createObjectURL for file handling
Object.defineProperty(URL, 'createObjectURL', {
  value: vi.fn(() => 'blob:mock-url'),
  configurable: true
});

Object.defineProperty(URL, 'revokeObjectURL', {
  value: vi.fn(),
  configurable: true
});

// Enhanced localStorage mock with size limits
const localStorageMock = {
  store: new Map<string, string>(),
  
  getItem: vi.fn((key: string) => {
    return localStorageMock.store.get(key) || null;
  }),
  
  setItem: vi.fn((key: string, value: string) => {
    // Simulate storage quota
    const totalSize = Array.from(localStorageMock.store.values()).join('').length;
    if (totalSize + value.length > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('QuotaExceededError');
    }
    localStorageMock.store.set(key, value);
  }),
  
  removeItem: vi.fn((key: string) => {
    localStorageMock.store.delete(key);
  }),
  
  clear: vi.fn(() => {
    localStorageMock.store.clear();
  }),
  
  key: vi.fn((index: number) => {
    const keys = Array.from(localStorageMock.store.keys());
    return keys[index] || null;
  }),
  
  get length() {
    return localStorageMock.store.size;
  }
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  configurable: true
});

// Enhanced sessionStorage mock
const sessionStorageMock = {
  store: new Map<string, string>(),
  
  getItem: vi.fn((key: string) => {
    return sessionStorageMock.store.get(key) || null;
  }),
  
  setItem: vi.fn((key: string, value: string) => {
    sessionStorageMock.store.set(key, value);
  }),
  
  removeItem: vi.fn((key: string) => {
    sessionStorageMock.store.delete(key);
  }),
  
  clear: vi.fn(() => {
    sessionStorageMock.store.clear();
  }),
  
  key: vi.fn((index: number) => {
    const keys = Array.from(sessionStorageMock.store.keys());
    return keys[index] || null;
  }),
  
  get length() {
    return sessionStorageMock.store.size;
  }
};

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  configurable: true
});

// Export test utilities
export {
  performanceMonitor,
  createEnhancedWebGLMock,
  localStorageMock,
  sessionStorageMock,
  QUALITY_GATES,
  PERFORMANCE_BENCHMARKS
}; 