import * as THREE from 'three';

export interface VisualTestResult {
  passed: boolean;
  differences: number; // Percentage of pixels that differ
  screenshot: string; // Base64 encoded image
  referenceImage: string; // Base64 encoded reference
  diffImage?: string; // Base64 encoded diff highlighting
}

export interface VisualTestConfig {
  width: number;
  height: number;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  backgroundColor: string;
  lighting: {
    ambient: { color: string; intensity: number };
    directional: { color: string; intensity: number; position: [number, number, number] };
  };
  tolerance: number; // Acceptable difference percentage (0-100)
}

export const DEFAULT_VISUAL_TEST_CONFIG: VisualTestConfig = {
  width: 800,
  height: 600,
  cameraPosition: [0, 0, 3],
  cameraTarget: [0, 0, 0],
  backgroundColor: '#f0f0f0',
  lighting: {
    ambient: { color: '#ffffff', intensity: 0.4 },
    directional: { color: '#ffffff', intensity: 0.8, position: [1, 1, 1] }
  },
  tolerance: 2.0 // 2% difference tolerance
};

export class VisualRegressionTester {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private config: VisualTestConfig;

  constructor(config: VisualTestConfig = DEFAULT_VISUAL_TEST_CONFIG) {
    this.config = config;
    this.setupRenderer();
    this.setupScene();
    this.setupCamera();
    this.setupLighting();
  }

  private setupRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      preserveDrawingBuffer: true,
      alpha: true 
    });
    this.renderer.setSize(this.config.width, this.config.height);
    this.renderer.setClearColor(this.config.backgroundColor);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  private setupScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.config.backgroundColor);
  }

  private setupCamera(): void {
    this.camera = new THREE.PerspectiveCamera(
      75, 
      this.config.width / this.config.height, 
      0.1, 
      1000
    );
    this.camera.position.set(...this.config.cameraPosition);
    this.camera.lookAt(new THREE.Vector3(...this.config.cameraTarget));
  }

  private setupLighting(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(
      this.config.lighting.ambient.color,
      this.config.lighting.ambient.intensity
    );
    this.scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(
      this.config.lighting.directional.color,
      this.config.lighting.directional.intensity
    );
    directionalLight.position.set(...this.config.lighting.directional.position);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
  }

  public async captureAvatar(avatarGroup: THREE.Group): Promise<string> {
    // Clear scene and add avatar
    this.scene.clear();
    this.setupLighting();
    this.scene.add(avatarGroup);

    // Render the scene
    this.renderer.render(this.scene, this.camera);

    // Capture screenshot
    const canvas = this.renderer.domElement;
    return canvas.toDataURL('image/png');
  }

  public async compareWithReference(
    avatarGroup: THREE.Group,
    referenceImage: string
  ): Promise<VisualTestResult> {
    const screenshot = await this.captureAvatar(avatarGroup);
    
    // In a real implementation, you would use a library like pixelmatch
    // For now, we'll simulate the comparison
    const differences = await this.calculateDifferences(screenshot, referenceImage);
    
    const passed = differences <= this.config.tolerance;
    
    return {
      passed,
      differences,
      screenshot,
      referenceImage,
      diffImage: passed ? undefined : await this.generateDiffImage(screenshot, referenceImage)
    };
  }

  private async calculateDifferences(image1: string, image2: string): Promise<number> {
    // Placeholder implementation
    // In a real system, you would:
    // 1. Convert base64 to ImageData
    // 2. Use pixelmatch or similar library to compare
    // 3. Return percentage of different pixels
    
    if (image1 === image2) return 0;
    
    // Simulate some difference calculation
    const hash1 = this.simpleHash(image1);
    const hash2 = this.simpleHash(image2);
    
    return Math.abs(hash1 - hash2) / Math.max(hash1, hash2) * 100;
  }

  private async generateDiffImage(image1: string, image2: string): Promise<string> {
    // Placeholder implementation
    // In a real system, you would generate a diff image highlighting differences
    return image1; // Return original for now
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  public dispose(): void {
    this.renderer.dispose();
  }
}

// Test scenarios for comprehensive visual validation
export interface VisualTestScenario {
  name: string;
  description: string;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  expectedFeatures: string[];
}

export const PUPPY_AVATAR_VISUAL_TESTS: VisualTestScenario[] = [
  {
    name: 'front_view',
    description: 'Front view showing face, eyes, nose, and body proportions',
    cameraPosition: [0, 0, 3],
    cameraTarget: [0, 0, 0],
    expectedFeatures: ['eyes', 'nose', 'ears', 'snout', 'body']
  },
  {
    name: 'side_view',
    description: 'Side view showing body length, leg proportions, and tail',
    cameraPosition: [3, 0, 0],
    cameraTarget: [0, 0, 0],
    expectedFeatures: ['body_length', 'legs', 'tail', 'head_profile']
  },
  {
    name: 'three_quarter_view',
    description: 'Three-quarter view showing overall proportions and depth',
    cameraPosition: [2, 1, 2],
    cameraTarget: [0, 0, 0],
    expectedFeatures: ['overall_proportions', 'depth', 'shadows']
  },
  {
    name: 'top_view',
    description: 'Top view showing ear placement and body width',
    cameraPosition: [0, 3, 0],
    cameraTarget: [0, 0, 0],
    expectedFeatures: ['ear_placement', 'body_width', 'paw_positions']
  }
];

export class PuppyAvatarVisualValidator {
  private tester: VisualRegressionTester;
  private referenceImages: Map<string, string> = new Map();

  constructor() {
    this.tester = new VisualRegressionTester();
  }

  public async setReferenceImage(scenarioName: string, imageData: string): Promise<void> {
    this.referenceImages.set(scenarioName, imageData);
  }

  public async validateAllScenarios(avatarGroup: THREE.Group): Promise<Map<string, VisualTestResult>> {
    const results = new Map<string, VisualTestResult>();

    for (const scenario of PUPPY_AVATAR_VISUAL_TESTS) {
      // Update camera position for this scenario
      this.tester = new VisualRegressionTester({
        ...DEFAULT_VISUAL_TEST_CONFIG,
        cameraPosition: scenario.cameraPosition,
        cameraTarget: scenario.cameraTarget
      });

      const referenceImage = this.referenceImages.get(scenario.name);
      if (referenceImage) {
        const result = await this.tester.compareWithReference(avatarGroup, referenceImage);
        results.set(scenario.name, result);
      } else {
        // If no reference image, capture one for future use
        const screenshot = await this.tester.captureAvatar(avatarGroup);
        console.warn(`No reference image for scenario '${scenario.name}'. Captured screenshot for future reference.`);
        await this.setReferenceImage(scenario.name, screenshot);
        
        results.set(scenario.name, {
          passed: true,
          differences: 0,
          screenshot,
          referenceImage: screenshot
        });
      }
    }

    return results;
  }

  public generateVisualReport(results: Map<string, VisualTestResult>): string {
    let report = '# Visual Regression Test Report\n\n';
    
    const passedTests = Array.from(results.entries()).filter(([_, result]) => result.passed);
    const failedTests = Array.from(results.entries()).filter(([_, result]) => !result.passed);
    
    report += `## Summary\n`;
    report += `- **Total Tests**: ${results.size}\n`;
    report += `- **Passed**: ${passedTests.length}\n`;
    report += `- **Failed**: ${failedTests.length}\n\n`;
    
    if (failedTests.length > 0) {
      report += `## Failed Tests\n\n`;
      failedTests.forEach(([name, result]) => {
        report += `### ${name}\n`;
        report += `- **Difference**: ${result.differences.toFixed(2)}%\n`;
        report += `- **Status**: ❌ FAILED\n\n`;
      });
    }
    
    if (passedTests.length > 0) {
      report += `## Passed Tests\n\n`;
      passedTests.forEach(([name, result]) => {
        report += `### ${name}\n`;
        report += `- **Difference**: ${result.differences.toFixed(2)}%\n`;
        report += `- **Status**: ✅ PASSED\n\n`;
      });
    }
    
    return report;
  }

  public dispose(): void {
    this.tester.dispose();
  }
}

// Utility functions for integration with existing systems
export async function validateAvatarVisually(
  avatarGroup: THREE.Group,
  referenceImages?: Map<string, string>
): Promise<{ passed: boolean; report: string; results: Map<string, VisualTestResult> }> {
  const validator = new PuppyAvatarVisualValidator();
  
  // Set reference images if provided
  if (referenceImages) {
    for (const [scenario, image] of referenceImages) {
      await validator.setReferenceImage(scenario, image);
    }
  }
  
  const results = await validator.validateAllScenarios(avatarGroup);
  const report = validator.generateVisualReport(results);
  
  const passed = Array.from(results.values()).every(result => result.passed);
  
  validator.dispose();
  
  return { passed, report, results };
} 