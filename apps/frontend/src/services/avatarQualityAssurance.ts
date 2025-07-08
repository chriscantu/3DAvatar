import * as THREE from 'three';
import { 
  AvatarValidator, 
  ValidationResult, 
  validatePuppyAvatar,
  PUPPY_AVATAR_STANDARDS 
} from './avatarValidation';
import { 
  PuppyAvatarVisualValidator, 
  VisualTestResult, 
  validateAvatarVisually 
} from './visualRegressionTesting';

export interface QualityAssuranceReport {
  overallScore: number; // 0-100 scale
  passed: boolean;
  timestamp: string;
  validation: ValidationResult;
  visualTests: Map<string, VisualTestResult>;
  recommendations: QualityRecommendation[];
  metrics: QualityMetrics;
}

export interface QualityRecommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'realism' | 'interactivity' | 'performance' | 'visual';
  title: string;
  description: string;
  actionItems: string[];
  estimatedImpact: number; // 0-100 scale
}

export interface QualityMetrics {
  realismScore: number;
  interactivityScore: number;
  performanceScore: number;
  visualConsistencyScore: number;
  anatomicalAccuracy: number;
  userExperienceScore: number;
}

export class AvatarQualityAssurance {
  private validator: AvatarValidator;
  private visualValidator: PuppyAvatarVisualValidator;
  private referenceImages: Map<string, string> = new Map();

  constructor() {
    this.validator = new AvatarValidator(PUPPY_AVATAR_STANDARDS);
    this.visualValidator = new PuppyAvatarVisualValidator();
  }

  public async setReferenceImages(images: Map<string, string>): Promise<void> {
    this.referenceImages = images;
    for (const [scenario, image] of images) {
      await this.visualValidator.setReferenceImage(scenario, image);
    }
  }

  public async assessAvatar(avatarGroup: THREE.Group): Promise<QualityAssuranceReport> {
    console.log('🔍 Starting comprehensive avatar quality assessment...');
    
    // Run validation checks
    const validation = this.validator.validateAvatar(avatarGroup);
    console.log(`✅ Validation complete: ${validation.passed ? 'PASSED' : 'FAILED'} (Score: ${(validation.score * 100).toFixed(1)}%)`);
    
    // Run visual tests
    const visualTests = await this.visualValidator.validateAllScenarios(avatarGroup);
    const visualPassed = Array.from(visualTests.values()).every(result => result.passed);
    console.log(`👁️ Visual tests complete: ${visualPassed ? 'PASSED' : 'FAILED'}`);
    
    // Calculate metrics
    const metrics = this.calculateMetrics(validation, visualTests);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(validation, visualTests, metrics);
    
    // Calculate overall score
    const overallScore = this.calculateOverallScore(metrics);
    
    // Determine if passed
    const passed = validation.passed && visualPassed && overallScore >= 70;
    
    return {
      overallScore,
      passed,
      timestamp: new Date().toISOString(),
      validation,
      visualTests,
      recommendations,
      metrics
    };
  }

  private calculateMetrics(
    validation: ValidationResult, 
    visualTests: Map<string, VisualTestResult>
  ): QualityMetrics {
    // Calculate realism score from validation
    const realismIssues = validation.issues.filter(i => i.category === 'realism');
    const realismScore = Math.max(0, 100 - (realismIssues.length * 15));
    
    // Calculate interactivity score
    const interactivityIssues = validation.issues.filter(i => i.category === 'interactivity');
    const interactivityScore = Math.max(0, 100 - (interactivityIssues.length * 20));
    
    // Calculate performance score
    const performanceIssues = validation.issues.filter(i => i.category === 'performance');
    const performanceScore = Math.max(0, 100 - (performanceIssues.length * 10));
    
    // Calculate visual consistency score
    const visualResults = Array.from(visualTests.values());
    const avgVisualDifference = visualResults.reduce((sum, result) => sum + result.differences, 0) / visualResults.length;
    const visualConsistencyScore = Math.max(0, 100 - (avgVisualDifference * 10));
    
    // Calculate anatomical accuracy
    const anatomicalIssues = validation.issues.filter(i => 
      i.message.includes('ratio') || i.message.includes('proportion')
    );
    const anatomicalAccuracy = Math.max(0, 100 - (anatomicalIssues.length * 25));
    
    // Calculate user experience score (combination of factors)
    const userExperienceScore = (
      realismScore * 0.3 +
      interactivityScore * 0.3 +
      visualConsistencyScore * 0.2 +
      anatomicalAccuracy * 0.2
    );
    
    return {
      realismScore,
      interactivityScore,
      performanceScore,
      visualConsistencyScore,
      anatomicalAccuracy,
      userExperienceScore
    };
  }

  private generateRecommendations(
    validation: ValidationResult,
    visualTests: Map<string, VisualTestResult>,
    metrics: QualityMetrics
  ): QualityRecommendation[] {
    const recommendations: QualityRecommendation[] = [];
    
    // Critical issues first
    const criticalIssues = validation.issues.filter(i => i.severity === 'critical');
    if (criticalIssues.length > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'realism',
        title: 'Fix Critical Issues',
        description: 'Critical issues prevent avatar from meeting minimum quality standards',
        actionItems: criticalIssues.map(issue => issue.suggestedFix || issue.message),
        estimatedImpact: 90
      });
    }
    
    // Anatomical proportion issues
    const proportionIssues = validation.issues.filter(i => 
      i.message.includes('ratio') || i.message.includes('proportion')
    );
    if (proportionIssues.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'realism',
        title: 'Improve Anatomical Proportions',
        description: 'Adjust body part sizes to match realistic puppy proportions',
        actionItems: [
          'Review head-to-body ratio (should be 0.3-0.5 for puppies)',
          'Ensure leg length is proportional to body size',
          'Check ear size relative to head',
          'Verify tail length matches body proportions'
        ],
        estimatedImpact: 80
      });
    }
    
    // Visual consistency issues
    const failedVisualTests = Array.from(visualTests.entries()).filter(([_, result]) => !result.passed);
    if (failedVisualTests.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'visual',
        title: 'Fix Visual Inconsistencies',
        description: 'Address visual differences from reference standards',
        actionItems: failedVisualTests.map(([scenario, _]) => 
          `Review ${scenario} view for visual accuracy`
        ),
        estimatedImpact: 70
      });
    }
    
    // Color consistency issues
    const colorIssues = validation.issues.filter(i => i.message.includes('color'));
    if (colorIssues.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'realism',
        title: 'Improve Color Consistency',
        description: 'Use approved color palette for realistic appearance',
        actionItems: [
          'Use tan/brown (#D2B48C) as primary body color',
          'Apply darker brown (#8B4513) for ears and paws',
          'Use cream (#F5F5DC) for chest and markings',
          'Ensure black (#000000) for nose and pupils'
        ],
        estimatedImpact: 60
      });
    }
    
    // Material quality issues
    const materialIssues = validation.issues.filter(i => 
      i.message.includes('roughness') || i.message.includes('metalness')
    );
    if (materialIssues.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'realism',
        title: 'Adjust Material Properties',
        description: 'Set material properties for realistic fur appearance',
        actionItems: [
          'Set roughness to 0.8-1.0 for fur-like texture',
          'Keep metalness at 0.0-0.1 for organic look',
          'Ensure consistent material properties across similar surfaces'
        ],
        estimatedImpact: 50
      });
    }
    
    // Performance optimization
    const performanceIssues = validation.issues.filter(i => i.category === 'performance');
    if (performanceIssues.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'performance',
        title: 'Optimize Performance',
        description: 'Reduce computational overhead for better performance',
        actionItems: [
          'Reduce geometry complexity where possible',
          'Combine similar meshes to reduce draw calls',
          'Use appropriate level of detail (LOD) for different viewing distances',
          'Optimize texture sizes and formats'
        ],
        estimatedImpact: 40
      });
    }
    
    // Interactivity improvements
    if (metrics.interactivityScore < 70) {
      recommendations.push({
        priority: 'high',
        category: 'interactivity',
        title: 'Implement Animation System',
        description: 'Add animations to improve user engagement',
        actionItems: [
          'Implement idle animation (subtle breathing, blinking)',
          'Add excited animation for user typing',
          'Create speaking animation for AI responses',
          'Add listening animation for user input',
          'Ensure smooth transitions between animation states'
        ],
        estimatedImpact: 85
      });
    }
    
    // Sort by priority and impact
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      return priorityDiff !== 0 ? priorityDiff : b.estimatedImpact - a.estimatedImpact;
    });
  }

  private calculateOverallScore(metrics: QualityMetrics): number {
    return (
      metrics.realismScore * 0.25 +
      metrics.interactivityScore * 0.20 +
      metrics.performanceScore * 0.15 +
      metrics.visualConsistencyScore * 0.20 +
      metrics.anatomicalAccuracy * 0.20
    );
  }

  public generateDetailedReport(report: QualityAssuranceReport): string {
    let output = '';
    
    output += '# 🐕 Puppy Avatar Quality Assessment Report\n\n';
    output += `**Generated:** ${new Date(report.timestamp).toLocaleString()}\n`;
    output += `**Overall Score:** ${report.overallScore.toFixed(1)}/100\n`;
    output += `**Status:** ${report.passed ? '✅ PASSED' : '❌ FAILED'}\n\n`;
    
    // Metrics breakdown
    output += '## 📊 Quality Metrics\n\n';
    output += `- **Realism Score:** ${report.metrics.realismScore.toFixed(1)}/100\n`;
    output += `- **Interactivity Score:** ${report.metrics.interactivityScore.toFixed(1)}/100\n`;
    output += `- **Performance Score:** ${report.metrics.performanceScore.toFixed(1)}/100\n`;
    output += `- **Visual Consistency:** ${report.metrics.visualConsistencyScore.toFixed(1)}/100\n`;
    output += `- **Anatomical Accuracy:** ${report.metrics.anatomicalAccuracy.toFixed(1)}/100\n`;
    output += `- **User Experience:** ${report.metrics.userExperienceScore.toFixed(1)}/100\n\n`;
    
    // Recommendations
    if (report.recommendations.length > 0) {
      output += '## 🎯 Recommendations\n\n';
      report.recommendations.forEach((rec, index) => {
        const priorityEmoji = {
          critical: '🚨',
          high: '⚠️',
          medium: '📋',
          low: '💡'
        };
        
        output += `### ${priorityEmoji[rec.priority]} ${rec.title}\n`;
        output += `**Priority:** ${rec.priority.toUpperCase()}\n`;
        output += `**Category:** ${rec.category}\n`;
        output += `**Impact:** ${rec.estimatedImpact}/100\n\n`;
        output += `${rec.description}\n\n`;
        output += '**Action Items:**\n';
        rec.actionItems.forEach(item => {
          output += `- ${item}\n`;
        });
        output += '\n';
      });
    }
    
    // Validation issues
    if (report.validation.issues.length > 0) {
      output += '## 🔍 Validation Issues\n\n';
      const groupedIssues = report.validation.issues.reduce((groups, issue) => {
        const key = `${issue.category}_${issue.severity}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(issue);
        return groups;
      }, {} as Record<string, typeof report.validation.issues>);
      
      Object.entries(groupedIssues).forEach(([key, issues]) => {
        const [category, severity] = key.split('_');
        output += `### ${category.toUpperCase()} - ${severity.toUpperCase()}\n`;
        issues.forEach(issue => {
          output += `- ${issue.message}\n`;
          if (issue.suggestedFix) {
            output += `  *Suggested fix: ${issue.suggestedFix}*\n`;
          }
        });
        output += '\n';
      });
    }
    
    // Visual test results
    output += '## 👁️ Visual Test Results\n\n';
    Array.from(report.visualTests.entries()).forEach(([scenario, result]) => {
      const status = result.passed ? '✅ PASSED' : '❌ FAILED';
      output += `- **${scenario}:** ${status} (${result.differences.toFixed(2)}% difference)\n`;
    });
    
    return output;
  }

  public dispose(): void {
    this.visualValidator.dispose();
  }
}

// Convenience function for quick quality assessment
export async function assessAvatarQuality(
  avatarGroup: THREE.Group,
  referenceImages?: Map<string, string>
): Promise<QualityAssuranceReport> {
  const qa = new AvatarQualityAssurance();
  
  if (referenceImages) {
    await qa.setReferenceImages(referenceImages);
  }
  
  const report = await qa.assessAvatar(avatarGroup);
  qa.dispose();
  
  return report;
}

// Quality gates for CI/CD integration
export function meetsQualityGate(report: QualityAssuranceReport): boolean {
  const criticalIssues = report.validation.issues.filter(i => i.severity === 'critical');
  const majorIssues = report.validation.issues.filter(i => i.severity === 'major');
  
  return (
    criticalIssues.length === 0 &&
    majorIssues.length <= 2 &&
    report.overallScore >= 70 &&
    report.metrics.realismScore >= 60 &&
    report.metrics.anatomicalAccuracy >= 70
  );
} 