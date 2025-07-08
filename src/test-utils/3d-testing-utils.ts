import * as THREE from 'three';
import { render, RenderResult } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import React from 'react';
import { vi } from 'vitest';

// Extend Performance interface for memory testing
declare global {
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
}

/**
 * Enhanced WebGL context for testing
 */
export class TestWebGLContext {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private renderer: THREE.WebGLRenderer;

  constructor() {
    // Create a real canvas element for testing
    this.canvas = document.createElement('canvas');
    this.canvas.width = 800;
    this.canvas.height = 600;
    
    // Get WebGL context with proper settings
    const gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl');
    if (!gl) {
      throw new Error('WebGL not supported in test environment');
    }
    this.gl = gl as WebGLRenderingContext;
    
    // Create Three.js renderer
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: this.canvas,
      context: this.gl,
      antialias: true,
      preserveDrawingBuffer: true // Important for capturing frames
    });
    this.renderer.setSize(800, 600);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  getContext(): WebGLRenderingContext {
    return this.gl;
  }

  /**
   * Capture the current frame as image data
   */
  captureFrame(): ImageData {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const pixels = new Uint8ClampedArray(width * height * 4);
    
    this.gl.readPixels(0, 0, width, height, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);
    
    return new ImageData(pixels, width, height);
  }

  /**
   * Render a scene and capture the result
   */
  renderScene(scene: THREE.Scene, camera: THREE.Camera): ImageData {
    this.renderer.render(scene, camera);
    return this.captureFrame();
  }

  dispose(): void {
    this.renderer.dispose();
  }
}

/**
 * 3D Scene Inspector for validating scene composition
 */
export class SceneInspector {
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  /**
   * Find all meshes in the scene
   */
  findMeshes(): THREE.Mesh[] {
    const meshes: THREE.Mesh[] = [];
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        meshes.push(object);
      }
    });
    return meshes;
  }

  /**
   * Find meshes by material type
   */
  findMeshesByMaterial(materialType: string): THREE.Mesh[] {
    return this.findMeshes().filter(mesh => 
      mesh.material && mesh.material.type === materialType
    );
  }

  /**
   * Find meshes by geometry type
   */
  findMeshesByGeometry(geometryType: string): THREE.Mesh[] {
    return this.findMeshes().filter(mesh => 
      mesh.geometry && mesh.geometry.type === geometryType
    );
  }

  /**
   * Get scene statistics
   */
  getSceneStats(): {
    totalObjects: number;
    meshes: number;
    lights: number;
    cameras: number;
    groups: number;
    materials: Set<string>;
    geometries: Set<string>;
  } {
    let totalObjects = 0;
    let meshes = 0;
    let lights = 0;
    let cameras = 0;
    let groups = 0;
    const materials = new Set<string>();
    const geometries = new Set<string>();

    this.scene.traverse((object) => {
      totalObjects++;
      
      if (object instanceof THREE.Mesh) {
        meshes++;
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(mat => materials.add(mat.type));
          } else {
            materials.add(object.material.type);
          }
        }
        if (object.geometry) {
          geometries.add(object.geometry.type);
        }
      } else if (object instanceof THREE.Light) {
        lights++;
      } else if (object instanceof THREE.Camera) {
        cameras++;
      } else if (object instanceof THREE.Group) {
        groups++;
      }
    });

    return {
      totalObjects,
      meshes,
      lights,
      cameras,
      groups,
      materials,
      geometries
    };
  }

  /**
   * Validate object positioning
   */
  validateObjectPosition(
    objectName: string, 
    expectedPosition: THREE.Vector3, 
    tolerance: number = 0.01
  ): boolean {
    const object = this.scene.getObjectByName(objectName);
    if (!object) {
      throw new Error(`Object '${objectName}' not found in scene`);
    }

    const distance = object.position.distanceTo(expectedPosition);
    return distance <= tolerance;
  }

  /**
   * Validate material properties
   */
  validateMaterialColor(
    meshName: string, 
    expectedColor: THREE.Color
  ): boolean {
    const mesh = this.scene.getObjectByName(meshName) as THREE.Mesh;
    if (!mesh || !mesh.material) {
      throw new Error(`Mesh '${meshName}' or its material not found`);
    }

    const material = mesh.material as THREE.MeshStandardMaterial;
    if (!material.color) {
      return false;
    }

    return material.color.equals(expectedColor);
  }
}

/**
 * Animation Validator for testing avatar animations
 */
export class AnimationValidator {
  private mixer: THREE.AnimationMixer | null = null;
  private clock: THREE.Clock;

  constructor() {
    this.clock = new THREE.Clock();
  }

  setMixer(mixer: THREE.AnimationMixer): void {
    this.mixer = mixer;
  }

  /**
   * Advance animation by specified time
   */
  advanceTime(deltaTime: number): void {
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }
  }

  /**
   * Get current animation state
   */
  getCurrentAnimationState(): {
    activeActions: number;
    time: number;
  } {
    if (!this.mixer) {
      return { activeActions: 0, time: 0 };
    }

    // This is a simplified version - in a real implementation,
    // you'd need to track animation actions
    return {
      activeActions: 0, // Would count active actions
      time: this.clock.getElapsedTime()
    };
  }

  /**
   * Test animation smoothness
   */
  testAnimationSmoothness(
    duration: number, 
    frameRate: number = 60
  ): { averageFPS: number; frameDrops: number } {
    const targetFrameTime = 1000 / frameRate;
    const frames: number[] = [];
    let frameDrops = 0;
    
    const startTime = performance.now();
    let lastFrameTime = startTime;
    
    while (performance.now() - startTime < duration * 1000) {
      const currentTime = performance.now();
      const frameTime = currentTime - lastFrameTime;
      
      frames.push(frameTime);
      
      if (frameTime > targetFrameTime * 1.5) {
        frameDrops++;
      }
      
      this.advanceTime(frameTime / 1000);
      lastFrameTime = currentTime;
    }
    
    const averageFPS = 1000 / (frames.reduce((a, b) => a + b, 0) / frames.length);
    
    return { averageFPS, frameDrops };
  }
}

/**
 * Visual Regression Tester
 */
export class VisualRegressionTester {
  private webglContext: TestWebGLContext;
  private baselineImages: Map<string, ImageData> = new Map();

  constructor() {
    this.webglContext = new TestWebGLContext();
  }

  /**
   * Capture baseline image for comparison
   */
  captureBaseline(
    testName: string, 
    scene: THREE.Scene, 
    camera: THREE.Camera
  ): ImageData {
    const imageData = this.webglContext.renderScene(scene, camera);
    this.baselineImages.set(testName, imageData);
    return imageData;
  }

  /**
   * Compare current render with baseline
   */
  compareWithBaseline(
    testName: string, 
    scene: THREE.Scene, 
    camera: THREE.Camera,
    threshold: number = 0.01
  ): {
    match: boolean;
    difference: number;
    imageData: ImageData;
  } {
    const baseline = this.baselineImages.get(testName);
    if (!baseline) {
      throw new Error(`No baseline found for test '${testName}'`);
    }

    const current = this.webglContext.renderScene(scene, camera);
    const difference = this.calculateImageDifference(baseline, current);
    
    return {
      match: difference <= threshold,
      difference,
      imageData: current
    };
  }

  /**
   * Calculate difference between two images
   */
  private calculateImageDifference(img1: ImageData, img2: ImageData): number {
    if (img1.width !== img2.width || img1.height !== img2.height) {
      return 1; // 100% different
    }

    let totalDifference = 0;
    const pixelCount = img1.width * img1.height;

    for (let i = 0; i < img1.data.length; i += 4) {
      const r1 = img1.data[i];
      const g1 = img1.data[i + 1];
      const b1 = img1.data[i + 2];
      const a1 = img1.data[i + 3];

      const r2 = img2.data[i];
      const g2 = img2.data[i + 1];
      const b2 = img2.data[i + 2];
      const a2 = img2.data[i + 3];

      const pixelDifference = Math.sqrt(
        Math.pow(r1 - r2, 2) + 
        Math.pow(g1 - g2, 2) + 
        Math.pow(b1 - b2, 2) + 
        Math.pow(a1 - a2, 2)
      ) / (255 * 2); // Normalize to 0-1

      totalDifference += pixelDifference;
    }

    return totalDifference / pixelCount;
  }

  dispose(): void {
    this.webglContext.dispose();
  }
}

/**
 * Performance Tester for 3D rendering
 */
export class PerformanceTester {
  private frameTimeHistory: number[] = [];
  private memoryUsageHistory: number[] = [];

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    this.frameTimeHistory = [];
    this.memoryUsageHistory = [];
  }

  /**
   * Record frame time
   */
  recordFrameTime(frameTime: number): void {
    this.frameTimeHistory.push(frameTime);
    
    // Keep only last 1000 frames
    if (this.frameTimeHistory.length > 1000) {
      this.frameTimeHistory.shift();
    }
  }

  /**
   * Record memory usage
   */
  recordMemoryUsage(): void {
    if (performance.memory) {
      this.memoryUsageHistory.push(performance.memory.usedJSHeapSize);
    }
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): {
    averageFPS: number;
    minFPS: number;
    maxFPS: number;
    frameTimeVariance: number;
    memoryUsage: {
      current: number;
      peak: number;
      average: number;
    };
  } {
    const frameTimes = this.frameTimeHistory;
    const fps = frameTimes.map(time => 1000 / time);
    
    const averageFPS = fps.reduce((a, b) => a + b, 0) / fps.length;
    const minFPS = Math.min(...fps);
    const maxFPS = Math.max(...fps);
    
    const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    const frameTimeVariance = frameTimes.reduce((acc, time) => 
      acc + Math.pow(time - avgFrameTime, 2), 0
    ) / frameTimes.length;

    const memoryUsage = {
      current: this.memoryUsageHistory[this.memoryUsageHistory.length - 1] || 0,
      peak: Math.max(...this.memoryUsageHistory),
      average: this.memoryUsageHistory.reduce((a, b) => a + b, 0) / this.memoryUsageHistory.length
    };

    return {
      averageFPS,
      minFPS,
      maxFPS,
      frameTimeVariance,
      memoryUsage
    };
  }
}

/**
 * Enhanced render function for 3D components
 */
export function render3DComponent(
  component: React.ReactElement,
  options: {
    camera?: THREE.Camera;
    lights?: THREE.Light[];
    scene?: THREE.Scene;
  } = {}
): RenderResult & {
  scene: THREE.Scene;
  camera: THREE.Camera;
  inspector: SceneInspector;
  webglContext: TestWebGLContext;
} {
  const webglContext = new TestWebGLContext();
  const scene = options.scene || new THREE.Scene();
  const camera = options.camera || new THREE.PerspectiveCamera(75, 800/600, 0.1, 1000);
  
  // Add default lighting if none provided
  if (!options.lights) {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(ambientLight);
    scene.add(directionalLight);
  } else {
    options.lights.forEach(light => scene.add(light));
  }

  const wrappedComponent = React.createElement(Canvas, {
    gl: webglContext.getRenderer(),
    camera: { position: [0, 0, 5] },
    scene: scene
  }, component);

  const result = render(wrappedComponent);
  const inspector = new SceneInspector(scene);

  return {
    ...result,
    scene,
    camera,
    inspector,
    webglContext
  };
}

/**
 * Test helper for avatar component testing
 */
export function createAvatarTestEnvironment() {
  const webglContext = new TestWebGLContext();
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 800/600, 0.1, 1000);
  camera.position.set(0, 0, 5);

  // Add realistic lighting for avatar testing
  const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  directionalLight.castShadow = true;
  
  scene.add(ambientLight);
  scene.add(directionalLight);

  const inspector = new SceneInspector(scene);
  const animationValidator = new AnimationValidator();
  const visualTester = new VisualRegressionTester();
  const performanceTester = new PerformanceTester();

  return {
    scene,
    camera,
    webglContext,
    inspector,
    animationValidator,
    visualTester,
    performanceTester,
    cleanup: () => {
      webglContext.dispose();
      visualTester.dispose();
    }
  };
}

/**
 * Mock Three.js objects for testing
 */
export const mockThreeJS = {
  Scene: vi.fn(() => ({
    add: vi.fn(),
    remove: vi.fn(),
    traverse: vi.fn(),
    getObjectByName: vi.fn(),
    children: []
  })),
  
  PerspectiveCamera: vi.fn(() => ({
    position: { set: vi.fn(), x: 0, y: 0, z: 5 },
    lookAt: vi.fn(),
    updateProjectionMatrix: vi.fn()
  })),
  
  WebGLRenderer: vi.fn(() => ({
    setSize: vi.fn(),
    render: vi.fn(),
    dispose: vi.fn(),
    domElement: document.createElement('canvas'),
    shadowMap: {
      enabled: false,
      type: null
    }
  })),
  
  Mesh: vi.fn(() => ({
    position: { set: vi.fn(), x: 0, y: 0, z: 0 },
    rotation: { set: vi.fn(), x: 0, y: 0, z: 0 },
    scale: { set: vi.fn(), x: 1, y: 1, z: 1 },
    castShadow: false,
    receiveShadow: false,
    material: null,
    geometry: null
  })),
  
  Group: vi.fn(() => ({
    add: vi.fn(),
    remove: vi.fn(),
    position: { set: vi.fn(), x: 0, y: 0, z: 0 },
    rotation: { set: vi.fn(), x: 0, y: 0, z: 0 },
    scale: { set: vi.fn(), x: 1, y: 1, z: 1 },
    children: []
  }))
};

export default {
  TestWebGLContext,
  SceneInspector,
  AnimationValidator,
  VisualRegressionTester,
  PerformanceTester,
  render3DComponent,
  createAvatarTestEnvironment,
  mockThreeJS
}; 