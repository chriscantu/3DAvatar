/**
 * Avatar QA Validation Utility
 * 
 * This utility provides practical validation methods for 3D avatar quality assurance
 * that can be used immediately without complex setup.
 */

export interface AvatarQAResult {
  passed: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
  performance: PerformanceMetrics;
}

export interface PerformanceMetrics {
  averageFPS: number;
  memoryUsage: number;
  responseTime: number;
  stateChangeTime: number;
}

export interface AvatarLike {
  setState?: (state: string) => void;
}

export class AvatarQAValidator {
  private frameRateHistory: number[] = [];
  private memoryHistory: number[] = [];
  private stateChangeHistory: number[] = [];
  private startTime: number = 0;
  private frameCount: number = 0;

  /**
   * Start monitoring avatar performance
   */
  startMonitoring(): void {
    this.startTime = performance.now();
    this.frameCount = 0;
    this.frameRateHistory = [];
    this.memoryHistory = [];
    this.stateChangeHistory = [];

    // Monitor frame rate
    this.monitorFrameRate();
    
    // Monitor memory usage
    this.monitorMemoryUsage();
  }

  /**
   * Stop monitoring and generate QA report
   */
  generateQAReport(): AvatarQAResult {
    const performance = this.calculatePerformanceMetrics();
    const issues = this.detectIssues(performance);
    const recommendations = this.generateRecommendations(issues);
    const score = this.calculateQualityScore(performance, issues);

    return {
      passed: issues.length === 0 && score >= 80,
      score,
      issues,
      recommendations,
      performance
    };
  }

  /**
   * Test avatar state transitions
   */
  async testStateTransition(
    avatar: AvatarLike,
    fromState: string,
    toState: string
  ): Promise<{ success: boolean; duration: number; issues: string[] }> {
    const startTime = performance.now();
    const issues: string[] = [];

    try {
      // Set initial state
      if (avatar.setState) {
        avatar.setState(fromState);
      }

      // Wait for stabilization
      await this.waitForStabilization(500);

      // Trigger state change
      const transitionStart = performance.now();
      if (avatar.setState) {
        avatar.setState(toState);
      }

      // Wait for transition to complete
      await this.waitForStabilization(1000);
      const transitionEnd = performance.now();

      const duration = transitionEnd - transitionStart;
      this.stateChangeHistory.push(duration);

      // Validate transition
      if (duration > 1000) {
        issues.push(`State transition took ${duration}ms (expected <1000ms)`);
      }

      return {
        success: issues.length === 0,
        duration,
        issues
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      issues.push(`State transition failed: ${errorMessage}`);
      return {
        success: false,
        duration: performance.now() - startTime,
        issues
      };
    }
  }

  /**
   * Validate avatar visual quality (manual checklist)
   */
  getVisualQualityChecklist(): {
    category: string;
    items: { test: string; status: 'pending' | 'pass' | 'fail' }[];
  }[] {
    return [
      {
        category: 'Avatar Appearance',
        items: [
          { test: 'Avatar appears complete (no missing parts)', status: 'pending' },
          { test: 'Proportions look realistic and natural', status: 'pending' },
          { test: 'Colors and materials render correctly', status: 'pending' },
          { test: 'No visual glitches or artifacts', status: 'pending' },
          { test: 'Avatar is properly positioned (not floating/sinking)', status: 'pending' }
        ]
      },
      {
        category: 'Animation Quality',
        items: [
          { test: 'Speaking animation is smooth and natural', status: 'pending' },
          { test: 'Transitions between states are fluid', status: 'pending' },
          { test: 'Animation timing feels appropriate', status: 'pending' },
          { test: 'No jerky or robotic movements', status: 'pending' },
          { test: 'Avatar returns to neutral state correctly', status: 'pending' }
        ]
      },
      {
        category: 'Interaction Response',
        items: [
          { test: 'Responds to typing immediately', status: 'pending' },
          { test: 'Speaking animation matches message length', status: 'pending' },
          { test: 'State changes are appropriate to context', status: 'pending' },
          { test: 'No lag or delay in responses', status: 'pending' },
          { test: 'Handles rapid state changes gracefully', status: 'pending' }
        ]
      },
      {
        category: 'Performance',
        items: [
          { test: 'Avatar loads quickly (<3 seconds)', status: 'pending' },
          { test: 'Maintains smooth frame rate (>50 FPS)', status: 'pending' },
          { test: 'No memory leaks after extended use', status: 'pending' },
          { test: 'Responsive to user input', status: 'pending' },
          { test: 'Stable over extended usage (15+ minutes)', status: 'pending' }
        ]
      }
    ];
  }

  /**
   * Run automated performance test
   */
  async runPerformanceTest(duration: number = 30000): Promise<PerformanceMetrics> {
    this.startMonitoring();

    // Run test for specified duration
    await new Promise(resolve => setTimeout(resolve, duration));

    return this.calculatePerformanceMetrics();
  }

  /**
   * Test avatar under stress conditions
   */
  async runStressTest(avatar: AvatarLike, iterations: number = 100): Promise<{
    success: boolean;
    averageResponseTime: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    const responseTimes: number[] = [];
    const states = ['idle', 'speaking', 'listening', 'typing'];

    for (let i = 0; i < iterations; i++) {
      try {
        const startTime = performance.now();
        const randomState = states[Math.floor(Math.random() * states.length)];
        
        if (avatar.setState) {
          avatar.setState(randomState);
        }

        // Wait a short time
        await this.waitForStabilization(50);

        const responseTime = performance.now() - startTime;
        responseTimes.push(responseTime);

        if (responseTime > 100) {
          errors.push(`Slow response time: ${responseTime}ms on iteration ${i}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(`Error on iteration ${i}: ${errorMessage}`);
      }
    }

    const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

    return {
      success: errors.length === 0,
      averageResponseTime,
      errors
    };
  }

  /**
   * Generate comprehensive test report
   */
  generateTestReport(): {
    summary: string;
    performance: PerformanceMetrics;
    qualityScore: number;
    issues: string[];
    recommendations: string[];
    manualChecklist: Array<{
      category: string;
      items: Array<{ test: string; status: 'pending' | 'pass' | 'fail' }>;
    }>;
  } {
    const performance = this.calculatePerformanceMetrics();
    const issues = this.detectIssues(performance);
    const recommendations = this.generateRecommendations(issues);
    const qualityScore = this.calculateQualityScore(performance, issues);
    const manualChecklist = this.getVisualQualityChecklist();

    const summary = this.generateSummary(qualityScore, issues.length, performance);

    return {
      summary,
      performance,
      qualityScore,
      issues,
      recommendations,
      manualChecklist
    };
  }

  // Private helper methods

  private monitorFrameRate(): void {
    let lastTime = performance.now();
    let frameCount = 0;

    const countFrame = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = frameCount / ((currentTime - lastTime) / 1000);
        this.frameRateHistory.push(fps);
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(countFrame);
    };
    
    requestAnimationFrame(countFrame);
  }

  private monitorMemoryUsage(): void {
    const checkMemory = () => {
      if (performance.memory) {
        this.memoryHistory.push(performance.memory.usedJSHeapSize);
      }
      setTimeout(checkMemory, 1000);
    };
    
    checkMemory();
  }

  private calculatePerformanceMetrics(): PerformanceMetrics {
    const averageFPS = this.frameRateHistory.length > 0 
      ? this.frameRateHistory.reduce((a, b) => a + b, 0) / this.frameRateHistory.length
      : 0;

    const memoryUsage = this.memoryHistory.length > 0
      ? this.memoryHistory[this.memoryHistory.length - 1] - this.memoryHistory[0]
      : 0;

    const responseTime = this.stateChangeHistory.length > 0
      ? this.stateChangeHistory.reduce((a, b) => a + b, 0) / this.stateChangeHistory.length
      : 0;

    const stateChangeTime = this.stateChangeHistory.length > 0
      ? Math.max(...this.stateChangeHistory)
      : 0;

    return {
      averageFPS,
      memoryUsage,
      responseTime,
      stateChangeTime
    };
  }

  private detectIssues(performance: PerformanceMetrics): string[] {
    const issues: string[] = [];

    if (performance.averageFPS < 50) {
      issues.push(`Low frame rate: ${performance.averageFPS.toFixed(1)} FPS (expected >50)`);
    }

    if (performance.memoryUsage > 50 * 1024 * 1024) {
      issues.push(`High memory usage: ${(performance.memoryUsage / 1024 / 1024).toFixed(1)}MB (expected <50MB)`);
    }

    if (performance.responseTime > 100) {
      issues.push(`Slow response time: ${performance.responseTime.toFixed(1)}ms (expected <100ms)`);
    }

    if (performance.stateChangeTime > 1000) {
      issues.push(`Slow state changes: ${performance.stateChangeTime.toFixed(1)}ms (expected <1000ms)`);
    }

    return issues;
  }

  private generateRecommendations(issues: string[]): string[] {
    const recommendations: string[] = [];

    if (issues.some(issue => issue.includes('frame rate'))) {
      recommendations.push('Consider optimizing avatar geometry or reducing animation complexity');
    }

    if (issues.some(issue => issue.includes('memory usage'))) {
      recommendations.push('Check for memory leaks and optimize texture usage');
    }

    if (issues.some(issue => issue.includes('response time'))) {
      recommendations.push('Optimize state change logic and reduce computation in animation loops');
    }

    if (issues.some(issue => issue.includes('state changes'))) {
      recommendations.push('Simplify state transition animations and reduce transition duration');
    }

    if (recommendations.length === 0) {
      recommendations.push('Avatar performance is within acceptable parameters');
    }

    return recommendations;
  }

  private calculateQualityScore(performance: PerformanceMetrics, issues: string[]): number {
    let score = 100;

    // Deduct points for performance issues
    if (performance.averageFPS < 60) score -= 20;
    if (performance.averageFPS < 50) score -= 20;
    if (performance.averageFPS < 30) score -= 30;

    if (performance.memoryUsage > 20 * 1024 * 1024) score -= 10;
    if (performance.memoryUsage > 50 * 1024 * 1024) score -= 20;

    if (performance.responseTime > 50) score -= 10;
    if (performance.responseTime > 100) score -= 15;

    // Deduct points for issues
    score -= issues.length * 10;

    return Math.max(0, score);
  }

  private generateSummary(score: number, issueCount: number, performance: PerformanceMetrics): string {
    const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
    
    return `Avatar Quality Score: ${score}/100 (Grade: ${grade})
    Performance: ${performance.averageFPS.toFixed(1)} FPS average
    Memory Usage: ${(performance.memoryUsage / 1024 / 1024).toFixed(1)}MB
    Response Time: ${performance.responseTime.toFixed(1)}ms
    Issues Found: ${issueCount}`;
  }

  private async waitForStabilization(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Usage example and helper functions
export const createAvatarQAValidator = () => new AvatarQAValidator();

export const runQuickAvatarTest = async (avatar: AvatarLike): Promise<AvatarQAResult> => {
  const validator = new AvatarQAValidator();
  validator.startMonitoring();
  
  // Test state transitions if avatar supports it
  if (avatar.setState) {
    await validator.testStateTransition(avatar, 'idle', 'speaking');
  }
  
  // Run for 10 seconds
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  return validator.generateQAReport();
};

export const runAvatarStressTest = async (avatar: AvatarLike): Promise<{
  success: boolean;
  averageResponseTime: number;
  errors: string[];
}> => {
  const validator = new AvatarQAValidator();
  return await validator.runStressTest(avatar, 50);
};

// Export default validator instance
export default AvatarQAValidator; 