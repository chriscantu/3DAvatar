import * as THREE from 'three';

// Avatar Quality Standards
export interface AvatarQualityStandards {
  realism: {
    anatomicalProportions: {
      headToBodyRatio: { min: 0.3, max: 0.5 }; // Puppy heads are proportionally larger
      legToBodyRatio: { min: 0.4, max: 0.8 }; // Leg length relative to body
      earToHeadRatio: { min: 0.8, max: 1.2 }; // Ear size relative to head
      tailToBodyRatio: { min: 0.6, max: 1.0 }; // Tail length relative to body
      eyeToHeadRatio: { min: 0.15, max: 0.35 }; // Eye size relative to head
    };
    colorConsistency: {
      primaryColor: string; // Main body color
      secondaryColors: string[]; // Accent colors (ears, paws, etc.)
      maxColorVariance: number; // Maximum allowed color difference
    };
    materialQuality: {
      roughnessRange: { min: 0.7, max: 1.0 }; // Fur-like materials
      metalnessRange: { min: 0.0, max: 0.1 }; // Non-metallic for organic look
    };
  };
  interactivity: {
    animationStates: string[]; // Required animation states
    transitionSmoothness: number; // Minimum smoothness score
    responsiveness: number; // Maximum response time in ms
  };
  performance: {
    maxVertices: number; // Maximum vertex count
    maxDrawCalls: number; // Maximum draw calls
    targetFPS: number; // Target frame rate
  };
}

export const PUPPY_AVATAR_STANDARDS: AvatarQualityStandards = {
  realism: {
    anatomicalProportions: {
      headToBodyRatio: { min: 0.3, max: 0.5 },
      legToBodyRatio: { min: 0.4, max: 0.8 },
      earToHeadRatio: { min: 0.8, max: 1.2 },
      tailToBodyRatio: { min: 0.6, max: 1.0 },
      eyeToHeadRatio: { min: 0.15, max: 0.35 }
    },
    colorConsistency: {
      primaryColor: '#D2B48C', // Tan/brown
      secondaryColors: ['#8B4513', '#F5F5DC', '#2F2F2F', '#000000'],
      maxColorVariance: 0.2
    },
    materialQuality: {
      roughnessRange: { min: 0.7, max: 1.0 },
      metalnessRange: { min: 0.0, max: 0.1 }
    }
  },
  interactivity: {
    animationStates: ['idle', 'excited', 'speaking', 'listening'],
    transitionSmoothness: 0.8,
    responsiveness: 200
  },
  performance: {
    maxVertices: 50000,
    maxDrawCalls: 20,
    targetFPS: 60
  }
};

// Validation Result Types
export interface ValidationResult {
  passed: boolean;
  score: number; // 0-1 scale
  issues: ValidationIssue[];
  recommendations: string[];
}

export interface ValidationIssue {
  category: 'realism' | 'interactivity' | 'performance';
  severity: 'critical' | 'major' | 'minor';
  message: string;
  component?: string;
  suggestedFix?: string;
}

// Avatar Component Analysis
export interface AvatarComponent {
  name: string;
  type: 'mesh' | 'group';
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  position: THREE.Vector3;
  scale: THREE.Vector3;
  rotation: THREE.Euler;
  children?: AvatarComponent[];
}

export class AvatarValidator {
  private standards: AvatarQualityStandards;
  private components: AvatarComponent[] = [];

  constructor(standards: AvatarQualityStandards = PUPPY_AVATAR_STANDARDS) {
    this.standards = standards;
  }

  // Main validation method
  public validateAvatar(avatarGroup: THREE.Group): ValidationResult {
    this.analyzeComponents(avatarGroup);
    
    const realismResult = this.validateRealism();
    const interactivityResult = this.validateInteractivity();
    const performanceResult = this.validatePerformance();

    const allIssues = [
      ...realismResult.issues,
      ...interactivityResult.issues,
      ...performanceResult.issues
    ];

    const overallScore = (
      realismResult.score * 0.5 +
      interactivityResult.score * 0.3 +
      performanceResult.score * 0.2
    );

    const passed = allIssues.filter(i => i.severity === 'critical').length === 0 && overallScore >= 0.7;

    return {
      passed,
      score: overallScore,
      issues: allIssues,
      recommendations: this.generateRecommendations(allIssues)
    };
  }

  // Analyze avatar components
  private analyzeComponents(object: THREE.Object3D, parentName = 'root'): void {
    object.children.forEach((child, index) => {
      if (child instanceof THREE.Mesh) {
        this.components.push({
          name: `${parentName}_mesh_${index}`,
          type: 'mesh',
          geometry: child.geometry,
          material: child.material as THREE.Material,
          position: child.position,
          scale: child.scale,
          rotation: child.rotation
        });
      } else if (child instanceof THREE.Group) {
        this.components.push({
          name: `${parentName}_group_${index}`,
          type: 'group',
          geometry: new THREE.BufferGeometry(),
          material: new THREE.MeshBasicMaterial(),
          position: child.position,
          scale: child.scale,
          rotation: child.rotation
        });
        this.analyzeComponents(child, `${parentName}_group_${index}`);
      }
    });
  }

  // Validate realism aspects
  private validateRealism(): ValidationResult {
    const issues: ValidationIssue[] = [];
    let score = 1.0;

    // Check anatomical proportions
    const proportionIssues = this.checkAnatomicalProportions();
    issues.push(...proportionIssues);
    score -= proportionIssues.length * 0.15;

    // Check color consistency
    const colorIssues = this.checkColorConsistency();
    issues.push(...colorIssues);
    score -= colorIssues.length * 0.1;

    // Check material quality
    const materialIssues = this.checkMaterialQuality();
    issues.push(...materialIssues);
    score -= materialIssues.length * 0.05;

    return {
      passed: issues.filter(i => i.severity === 'critical').length === 0,
      score: Math.max(0, score),
      issues,
      recommendations: []
    };
  }

  // Check anatomical proportions
  private checkAnatomicalProportions(): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Find key components
    const headComponents = this.components.filter(c => c.name.includes('head'));
    const bodyComponents = this.components.filter(c => c.name.includes('body'));
    const legComponents = this.components.filter(c => c.name.includes('leg'));
    const earComponents = this.components.filter(c => c.name.includes('ear'));

    // Check head-to-body ratio
    if (headComponents.length > 0 && bodyComponents.length > 0) {
      const headSize = this.getComponentSize(headComponents[0]);
      const bodySize = this.getComponentSize(bodyComponents[0]);
      const ratio = headSize / bodySize;
      
      const { min, max } = this.standards.realism.anatomicalProportions.headToBodyRatio;
      if (ratio < min || ratio > max) {
        issues.push({
          category: 'realism',
          severity: 'major',
          message: `Head-to-body ratio ${ratio.toFixed(2)} outside realistic range (${min}-${max})`,
          component: 'head',
          suggestedFix: `Adjust head size to be ${min * bodySize}-${max * bodySize} relative to body`
        });
      }
    }

    // Check leg proportions
    if (legComponents.length > 0 && bodyComponents.length > 0) {
      const legLength = this.getComponentSize(legComponents[0]);
      const bodySize = this.getComponentSize(bodyComponents[0]);
      const ratio = legLength / bodySize;
      
      const { min, max } = this.standards.realism.anatomicalProportions.legToBodyRatio;
      if (ratio < min || ratio > max) {
        issues.push({
          category: 'realism',
          severity: 'major',
          message: `Leg-to-body ratio ${ratio.toFixed(2)} outside realistic range (${min}-${max})`,
          component: 'legs',
          suggestedFix: `Adjust leg length to be ${min * bodySize}-${max * bodySize} relative to body`
        });
      }
    }

    return issues;
  }

  // Check color consistency
  private checkColorConsistency(): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const colors = new Set<string>();
    
    this.components.forEach(component => {
      if (component.material instanceof THREE.MeshStandardMaterial) {
        const color = component.material.color.getHexString();
        colors.add(`#${color.toUpperCase()}`);
      }
    });

    // Check if colors are within expected palette
    const expectedColors = [
      this.standards.realism.colorConsistency.primaryColor,
      ...this.standards.realism.colorConsistency.secondaryColors
    ];

    colors.forEach(color => {
      const isExpected = expectedColors.some(expected => 
        this.colorDistance(color, expected) <= this.standards.realism.colorConsistency.maxColorVariance
      );
      
      if (!isExpected) {
        issues.push({
          category: 'realism',
          severity: 'minor',
          message: `Unexpected color ${color} found in avatar`,
          suggestedFix: `Use colors from the approved palette: ${expectedColors.join(', ')}`
        });
      }
    });

    return issues;
  }

  // Check material quality
  private checkMaterialQuality(): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    this.components.forEach(component => {
      if (component.material instanceof THREE.MeshStandardMaterial) {
        const roughness = component.material.roughness;
        const metalness = component.material.metalness;
        
        const { min: minRough, max: maxRough } = this.standards.realism.materialQuality.roughnessRange;
        const { min: minMetal, max: maxMetal } = this.standards.realism.materialQuality.metalnessRange;
        
        if (roughness < minRough || roughness > maxRough) {
          issues.push({
            category: 'realism',
            severity: 'minor',
            message: `Material roughness ${roughness} outside realistic range (${minRough}-${maxRough})`,
            component: component.name,
            suggestedFix: `Adjust roughness to ${minRough}-${maxRough} for organic fur-like appearance`
          });
        }
        
        if (metalness < minMetal || metalness > maxMetal) {
          issues.push({
            category: 'realism',
            severity: 'minor',
            message: `Material metalness ${metalness} outside realistic range (${minMetal}-${maxMetal})`,
            component: component.name,
            suggestedFix: `Adjust metalness to ${minMetal}-${maxMetal} for organic appearance`
          });
        }
      }
    });

    return issues;
  }

  // Validate interactivity (placeholder - would need animation system integration)
  private validateInteractivity(): ValidationResult {
    const issues: ValidationIssue[] = [];
    let score = 0.5; // Placeholder score since we don't have animation system yet

    issues.push({
      category: 'interactivity',
      severity: 'major',
      message: 'Animation system not implemented',
      suggestedFix: 'Implement PuppyAnimationController integration'
    });

    return {
      passed: false,
      score,
      issues,
      recommendations: []
    };
  }

  // Validate performance
  private validatePerformance(): ValidationResult {
    const issues: ValidationIssue[] = [];
    let score = 1.0;

    // Count vertices
    let totalVertices = 0;
    this.components.forEach(component => {
      if (component.geometry.attributes.position) {
        totalVertices += component.geometry.attributes.position.count;
      }
    });

    if (totalVertices > this.standards.performance.maxVertices) {
      issues.push({
        category: 'performance',
        severity: 'major',
        message: `Total vertices ${totalVertices} exceeds maximum ${this.standards.performance.maxVertices}`,
        suggestedFix: 'Reduce geometry complexity or use LOD (Level of Detail) system'
      });
      score -= 0.3;
    }

    // Count draw calls (approximation)
    const drawCalls = this.components.filter(c => c.type === 'mesh').length;
    if (drawCalls > this.standards.performance.maxDrawCalls) {
      issues.push({
        category: 'performance',
        severity: 'minor',
        message: `Draw calls ${drawCalls} exceeds maximum ${this.standards.performance.maxDrawCalls}`,
        suggestedFix: 'Combine meshes or use instancing to reduce draw calls'
      });
      score -= 0.1;
    }

    return {
      passed: issues.filter(i => i.severity === 'critical').length === 0,
      score: Math.max(0, score),
      issues,
      recommendations: []
    };
  }

  // Helper methods
  private getComponentSize(component: AvatarComponent): number {
    if (component.geometry.boundingBox) {
      component.geometry.computeBoundingBox();
    }
    
    const box = component.geometry.boundingBox;
    if (!box) return 0;
    
    return Math.max(
      box.max.x - box.min.x,
      box.max.y - box.min.y,
      box.max.z - box.min.z
    );
  }

  private colorDistance(color1: string, color2: string): number {
    const c1 = new THREE.Color(color1);
    const c2 = new THREE.Color(color2);
    
    return Math.sqrt(
      Math.pow(c1.r - c2.r, 2) +
      Math.pow(c1.g - c2.g, 2) +
      Math.pow(c1.b - c2.b, 2)
    );
  }

  private generateRecommendations(issues: ValidationIssue[]): string[] {
    const recommendations: string[] = [];
    
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    const majorIssues = issues.filter(i => i.severity === 'major');
    
    if (criticalIssues.length > 0) {
      recommendations.push('🚨 Critical issues must be fixed before deployment');
    }
    
    if (majorIssues.length > 0) {
      recommendations.push('⚠️ Major issues significantly impact avatar quality');
    }
    
    // Group recommendations by category
    const realismIssues = issues.filter(i => i.category === 'realism');
    const interactivityIssues = issues.filter(i => i.category === 'interactivity');
    const performanceIssues = issues.filter(i => i.category === 'performance');
    
    if (realismIssues.length > 0) {
      recommendations.push('🎨 Focus on anatomical proportions and visual consistency');
    }
    
    if (interactivityIssues.length > 0) {
      recommendations.push('🎮 Implement animation system for better user engagement');
    }
    
    if (performanceIssues.length > 0) {
      recommendations.push('⚡ Optimize geometry and materials for better performance');
    }
    
    return recommendations;
  }
}

// Convenience function for quick validation
export function validatePuppyAvatar(avatarGroup: THREE.Group): ValidationResult {
  const validator = new AvatarValidator();
  return validator.validateAvatar(avatarGroup);
} 