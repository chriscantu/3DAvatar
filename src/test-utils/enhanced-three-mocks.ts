import { vi } from 'vitest';

/**
 * Enhanced Three.js mocks with complete geometry and material support
 */

// Base geometry mock
const createGeometryMock = (type: string) => vi.fn(() => ({
  type,
  dispose: vi.fn(),
  scale: vi.fn(),
  translate: vi.fn(),
  rotateX: vi.fn(),
  rotateY: vi.fn(),
  rotateZ: vi.fn(),
  parameters: {},
  uuid: Math.random().toString(36).substr(2, 9),
  attributes: {
    position: { count: 100 },
    normal: { count: 100 },
    uv: { count: 100 }
  }
}));

// Base material mock
const createMaterialMock = (type: string) => vi.fn((params: any = {}) => ({
  type,
  dispose: vi.fn(),
  clone: vi.fn(),
  uuid: Math.random().toString(36).substr(2, 9),
  color: params.color || '#ffffff',
  roughness: params.roughness || 0.5,
  metalness: params.metalness || 0.0,
  opacity: params.opacity || 1.0,
  transparent: params.transparent || false,
  visible: params.visible !== false,
  side: params.side || 0, // FrontSide
  ...params
}));

// Object3D base mock
const createObject3DMock = (type: string) => ({
  type,
  uuid: Math.random().toString(36).substr(2, 9),
  position: {
    x: 0,
    y: 0,
    z: 0,
    set: vi.fn(),
    copy: vi.fn(),
    add: vi.fn(),
    sub: vi.fn(),
    distanceTo: vi.fn(() => 0),
    clone: vi.fn(() => ({ x: 0, y: 0, z: 0 }))
  },
  rotation: {
    x: 0,
    y: 0,
    z: 0,
    set: vi.fn(),
    copy: vi.fn(),
    setFromEuler: vi.fn()
  },
  scale: {
    x: 1,
    y: 1,
    z: 1,
    set: vi.fn(),
    copy: vi.fn(),
    multiplyScalar: vi.fn()
  },
  visible: true,
  castShadow: false,
  receiveShadow: false,
  children: [],
  parent: null,
  add: vi.fn(),
  remove: vi.fn(),
  traverse: vi.fn(),
  getObjectByName: vi.fn(),
  lookAt: vi.fn(),
  updateMatrix: vi.fn(),
  updateMatrixWorld: vi.fn(),
  clone: vi.fn(),
  copy: vi.fn(),
  dispose: vi.fn()
});

/**
 * Comprehensive Three.js mocks
 */
export const enhancedThreeJSMocks = {
  // Core classes
  Scene: vi.fn(() => ({
    ...createObject3DMock('Scene'),
    background: null,
    fog: null,
    overrideMaterial: null,
    autoUpdate: true,
    traverse: vi.fn((callback) => {
      // Mock traverse functionality
      const mockObjects = [
        { type: 'Mesh', material: { type: 'MeshStandardMaterial' }, geometry: { type: 'BoxGeometry' } },
        { type: 'Light' },
        { type: 'Camera' }
      ];
      mockObjects.forEach(callback);
    }),
    getObjectByName: vi.fn((name) => {
      // Return a mock object for testing
      return {
        ...createObject3DMock('Mesh'),
        name,
        material: createMaterialMock('MeshStandardMaterial')(),
        geometry: createGeometryMock('BoxGeometry')()
      };
    })
  })),

  Group: vi.fn(() => ({
    ...createObject3DMock('Group'),
    isGroup: true
  })),

  Object3D: vi.fn(() => createObject3DMock('Object3D')),

  // Cameras
  PerspectiveCamera: vi.fn((fov, aspect, near, far) => ({
    ...createObject3DMock('PerspectiveCamera'),
    fov: fov || 50,
    aspect: aspect || 1,
    near: near || 0.1,
    far: far || 2000,
    zoom: 1,
    focus: 10,
    filmGauge: 35,
    filmOffset: 0,
    updateProjectionMatrix: vi.fn(),
    setViewOffset: vi.fn(),
    clearViewOffset: vi.fn(),
    getEffectiveFOV: vi.fn(() => 50),
    getFilmWidth: vi.fn(() => 35),
    getFilmHeight: vi.fn(() => 24),
    setFocalLength: vi.fn(),
    getFocalLength: vi.fn(() => 50)
  })),

  OrthographicCamera: vi.fn((left, right, top, bottom, near, far) => ({
    ...createObject3DMock('OrthographicCamera'),
    left: left || -1,
    right: right || 1,
    top: top || 1,
    bottom: bottom || -1,
    near: near || 0.1,
    far: far || 2000,
    zoom: 1,
    view: null,
    updateProjectionMatrix: vi.fn(),
    setViewOffset: vi.fn(),
    clearViewOffset: vi.fn()
  })),

  // Geometries - All the missing ones that caused test failures
  BoxGeometry: createGeometryMock('BoxGeometry'),
  SphereGeometry: createGeometryMock('SphereGeometry'),
  CylinderGeometry: createGeometryMock('CylinderGeometry'),
  CapsuleGeometry: createGeometryMock('CapsuleGeometry'),
  PlaneGeometry: createGeometryMock('PlaneGeometry'),
  CircleGeometry: createGeometryMock('CircleGeometry'),
  ConeGeometry: createGeometryMock('ConeGeometry'),
  TorusGeometry: createGeometryMock('TorusGeometry'),
  RingGeometry: createGeometryMock('RingGeometry'),
  BufferGeometry: createGeometryMock('BufferGeometry'),

  // Materials - All the missing ones that caused test failures
  MeshBasicMaterial: createMaterialMock('MeshBasicMaterial'),
  MeshStandardMaterial: createMaterialMock('MeshStandardMaterial'),
  MeshLambertMaterial: createMaterialMock('MeshLambertMaterial'),
  MeshPhongMaterial: createMaterialMock('MeshPhongMaterial'),
  MeshToonMaterial: createMaterialMock('MeshToonMaterial'),
  MeshNormalMaterial: createMaterialMock('MeshNormalMaterial'),
  MeshMatcapMaterial: createMaterialMock('MeshMatcapMaterial'),
  MeshDepthMaterial: createMaterialMock('MeshDepthMaterial'),
  MeshDistanceMaterial: createMaterialMock('MeshDistanceMaterial'),
  LineBasicMaterial: createMaterialMock('LineBasicMaterial'),
  LineDashedMaterial: createMaterialMock('LineDashedMaterial'),
  PointsMaterial: createMaterialMock('PointsMaterial'),
  SpriteMaterial: createMaterialMock('SpriteMaterial'),

  // Mesh and related
  Mesh: vi.fn((geometry, material) => ({
    ...createObject3DMock('Mesh'),
    geometry: geometry || null,
    material: material || null,
    isMesh: true,
    morphTargetInfluences: [],
    morphTargetDictionary: {},
    updateMorphTargets: vi.fn(),
    raycast: vi.fn()
  })),

  // Lights
  AmbientLight: vi.fn((color, intensity) => ({
    ...createObject3DMock('AmbientLight'),
    color: color || 0x404040,
    intensity: intensity || 1,
    isAmbientLight: true
  })),

  DirectionalLight: vi.fn((color, intensity) => ({
    ...createObject3DMock('DirectionalLight'),
    color: color || 0xffffff,
    intensity: intensity || 1,
    target: createObject3DMock('Object3D'),
    shadow: {
      camera: null,
      bias: 0,
      normalBias: 0,
      radius: 1,
      mapSize: { width: 512, height: 512 }
    },
    isDirectionalLight: true
  })),

  PointLight: vi.fn((color, intensity, distance, decay) => ({
    ...createObject3DMock('PointLight'),
    color: color || 0xffffff,
    intensity: intensity || 1,
    distance: distance || 0,
    decay: decay || 1,
    shadow: {
      camera: null,
      bias: 0,
      normalBias: 0,
      radius: 1,
      mapSize: { width: 512, height: 512 }
    },
    isPointLight: true
  })),

  SpotLight: vi.fn((color, intensity, distance, angle, penumbra, decay) => ({
    ...createObject3DMock('SpotLight'),
    color: color || 0xffffff,
    intensity: intensity || 1,
    distance: distance || 0,
    angle: angle || Math.PI / 3,
    penumbra: penumbra || 0,
    decay: decay || 1,
    target: createObject3DMock('Object3D'),
    shadow: {
      camera: null,
      bias: 0,
      normalBias: 0,
      radius: 1,
      mapSize: { width: 512, height: 512 }
    },
    isSpotLight: true
  })),

  // Renderer
  WebGLRenderer: vi.fn((parameters = {}) => ({
    domElement: document.createElement('canvas'),
    context: null,
    capabilities: {},
    extensions: {},
    properties: {},
    renderLists: {},
    shadowMap: {
      enabled: false,
      type: null,
      autoUpdate: true,
      needsUpdate: false
    },
    info: {
      memory: { geometries: 0, textures: 0 },
      render: { frame: 0, calls: 0, triangles: 0, points: 0, lines: 0 },
      programs: []
    },
    setSize: vi.fn(),
    setPixelRatio: vi.fn(),
    setViewport: vi.fn(),
    setScissor: vi.fn(),
    setScissorTest: vi.fn(),
    render: vi.fn(),
    dispose: vi.fn(),
    setClearColor: vi.fn(),
    getClearColor: vi.fn(),
    setClearAlpha: vi.fn(),
    getClearAlpha: vi.fn(),
    clear: vi.fn(),
    clearColor: vi.fn(),
    clearDepth: vi.fn(),
    clearStencil: vi.fn(),
    getContext: vi.fn(),
    getContextAttributes: vi.fn(),
    forceContextLoss: vi.fn(),
    getMaxAnisotropy: vi.fn(() => 16),
    getPrecision: vi.fn(() => 'highp'),
    getPixelRatio: vi.fn(() => 1),
    getSize: vi.fn(() => ({ width: 800, height: 600 })),
    setAnimationLoop: vi.fn(),
    compile: vi.fn(),
    ...parameters
  })),

  // Animation
  AnimationMixer: vi.fn((root) => ({
    time: 0,
    timeScale: 1,
    root: root || null,
    clipAction: vi.fn(),
    existingAction: vi.fn(),
    stopAllAction: vi.fn(),
    update: vi.fn(),
    setTime: vi.fn(),
    getRoot: vi.fn(),
    uncacheClip: vi.fn(),
    uncacheRoot: vi.fn(),
    uncacheAction: vi.fn()
  })),

  Clock: vi.fn(() => ({
    autoStart: true,
    startTime: 0,
    oldTime: 0,
    elapsedTime: 0,
    running: false,
    start: vi.fn(),
    stop: vi.fn(),
    getElapsedTime: vi.fn(() => 0),
    getDelta: vi.fn(() => 0.016)
  })),

  // Math utilities
  Vector3: vi.fn((x = 0, y = 0, z = 0) => ({
    x,
    y,
    z,
    set: vi.fn(),
    copy: vi.fn(),
    add: vi.fn(),
    sub: vi.fn(),
    multiply: vi.fn(),
    divide: vi.fn(),
    multiplyScalar: vi.fn(),
    divideScalar: vi.fn(),
    length: vi.fn(() => Math.sqrt(x * x + y * y + z * z)),
    lengthSq: vi.fn(() => x * x + y * y + z * z),
    normalize: vi.fn(),
    distanceTo: vi.fn(() => 0),
    distanceToSquared: vi.fn(() => 0),
    dot: vi.fn(() => 0),
    cross: vi.fn(),
    lerp: vi.fn(),
    clone: vi.fn(() => ({ x, y, z })),
    equals: vi.fn(() => true)
  })),

  Color: vi.fn((color = 0xffffff) => ({
    r: 1,
    g: 1,
    b: 1,
    set: vi.fn(),
    setHex: vi.fn(),
    setRGB: vi.fn(),
    setHSL: vi.fn(),
    setStyle: vi.fn(),
    clone: vi.fn(),
    copy: vi.fn(),
    copyGammaToLinear: vi.fn(),
    copyLinearToGamma: vi.fn(),
    convertGammaToLinear: vi.fn(),
    convertLinearToGamma: vi.fn(),
    getHex: vi.fn(() => 0xffffff),
    getHexString: vi.fn(() => 'ffffff'),
    getHSL: vi.fn(),
    getStyle: vi.fn(() => 'rgb(255,255,255)'),
    offsetHSL: vi.fn(),
    add: vi.fn(),
    addColors: vi.fn(),
    addScalar: vi.fn(),
    sub: vi.fn(),
    multiply: vi.fn(),
    multiplyScalar: vi.fn(),
    lerp: vi.fn(),
    lerpHSL: vi.fn(),
    equals: vi.fn(() => true)
  })),

  MathUtils: {
    lerp: vi.fn((a, b, t) => a + (b - a) * t),
    clamp: vi.fn((value, min, max) => Math.max(min, Math.min(max, value))),
    randFloat: vi.fn(() => Math.random()),
    randFloatSpread: vi.fn((range) => range * (0.5 - Math.random())),
    degToRad: vi.fn((degrees) => degrees * Math.PI / 180),
    radToDeg: vi.fn((radians) => radians * 180 / Math.PI),
    isPowerOfTwo: vi.fn((value) => (value & (value - 1)) === 0),
    nearestPowerOfTwo: vi.fn((value) => Math.pow(2, Math.round(Math.log(value) / Math.LN2))),
    nextPowerOfTwo: vi.fn((value) => Math.pow(2, Math.ceil(Math.log(value) / Math.LN2)))
  },

  // Constants
  PCFSoftShadowMap: 2,
  BasicShadowMap: 0,
  PCFShadowMap: 1,
  VSMShadowMap: 3,
  
  FrontSide: 0,
  BackSide: 1,
  DoubleSide: 2,
  
  NoBlending: 0,
  NormalBlending: 1,
  AdditiveBlending: 2,
  SubtractiveBlending: 3,
  MultiplyBlending: 4,
  CustomBlending: 5
};

/**
 * Setup function to mock Three.js for testing
 */
export function setupThreeJSMocks() {
  // Mock the entire three module
  vi.mock('three', () => enhancedThreeJSMocks);
  
  // Mock @react-three/fiber useFrame hook
  vi.mock('@react-three/fiber', async () => {
    const actual = await vi.importActual('@react-three/fiber');
    return {
      ...actual,
      useFrame: vi.fn((callback) => {
        // Mock useFrame by calling the callback once with mock state
        const mockState = {
          clock: {
            elapsedTime: 0,
            getDelta: () => 0.016
          },
          scene: enhancedThreeJSMocks.Scene(),
          camera: enhancedThreeJSMocks.PerspectiveCamera(),
          gl: enhancedThreeJSMocks.WebGLRenderer()
        };
        callback(mockState, 0.016);
      })
    };
  });
}

export default enhancedThreeJSMocks; 