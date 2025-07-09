/**
 * Avatar Manual QA Framework
 * 
 * This framework provides structured checklists and scoring systems for manual
 * validation of avatar quality, focusing on user experience and visual appeal.
 */

export interface QAChecklistItem {
  id: string;
  description: string;
  category: 'visual' | 'animation' | 'interaction' | 'performance';
  priority: 'critical' | 'high' | 'medium' | 'low';
  expectedBehavior: string;
  testSteps: string[];
  passCriteria: string;
  failCriteria: string;
  notes?: string;
}

export interface QATestResult {
  itemId: string;
  passed: boolean;
  score: number; // 0-100
  notes: string;
  timestamp: Date;
  tester: string;
  screenshots?: string[];
}

export interface QASession {
  id: string;
  date: Date;
  tester: string;
  version: string;
  environment: string;
  results: QATestResult[];
  overallScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  summary: string;
  recommendations: string[];
}

export class AvatarManualQAFramework {
  private checklists: Map<string, QAChecklistItem[]> = new Map();
  private sessions: QASession[] = [];

  constructor() {
    this.initializeChecklists();
  }

  private initializeChecklists(): void {
    // Visual Quality Checklist
    const visualChecklist: QAChecklistItem[] = [
      {
        id: 'visual-001',
        description: 'Avatar appears as a friendly, appealing puppy character',
        category: 'visual',
        priority: 'critical',
        expectedBehavior: 'The avatar should look like a cute, friendly puppy that users would want to interact with',
        testSteps: [
          'Load the application',
          'Observe the avatar appearance',
          'Check for puppy-like features (ears, tail, proportions)',
          'Assess overall appeal and friendliness'
        ],
        passCriteria: 'Avatar clearly resembles a puppy, looks friendly and appealing',
        failCriteria: 'Avatar looks scary, unnatural, or not puppy-like',
        notes: 'First impressions are critical for user engagement'
      },
      {
        id: 'visual-002',
        description: 'Avatar colors are natural and appropriate for a puppy',
        category: 'visual',
        priority: 'high',
        expectedBehavior: 'Colors should be warm, natural, and suitable for a puppy character',
        testSteps: [
          'Examine avatar color palette',
          'Check for natural fur colors',
          'Verify no jarring or unnatural colors',
          'Assess color harmony and appeal'
        ],
        passCriteria: 'Colors are natural, warm, and puppy-appropriate',
        failCriteria: 'Colors are unnatural, jarring, or inappropriate'
      },
      {
        id: 'visual-003',
        description: 'Avatar proportions are anatomically reasonable for a puppy',
        category: 'visual',
        priority: 'high',
        expectedBehavior: 'Body proportions should look natural and not distorted',
        testSteps: [
          'Check head-to-body ratio',
          'Verify leg proportions',
          'Assess overall body shape',
          'Look for any distortions or unnatural scaling'
        ],
        passCriteria: 'Proportions look natural and puppy-like',
        failCriteria: 'Proportions are distorted or unnatural'
      },
      {
        id: 'visual-004',
        description: 'Avatar renders clearly without visual artifacts',
        category: 'visual',
        priority: 'high',
        expectedBehavior: 'Clean, clear rendering without glitches or artifacts',
        testSteps: [
          'Look for texture issues',
          'Check for polygon gaps or tears',
          'Verify smooth edges and surfaces',
          'Test different viewing angles'
        ],
        passCriteria: 'Clean rendering with no visible artifacts',
        failCriteria: 'Visible glitches, tears, or rendering issues'
      }
    ];

    // Animation Quality Checklist
    const animationChecklist: QAChecklistItem[] = [
      {
        id: 'anim-001',
        description: 'Avatar breathes naturally and continuously',
        category: 'animation',
        priority: 'critical',
        expectedBehavior: 'Smooth, rhythmic breathing that looks natural and alive',
        testSteps: [
          'Observe avatar for 30 seconds',
          'Count breathing cycles',
          'Check for smooth chest/body movement',
          'Verify consistent rhythm'
        ],
        passCriteria: '10-20 breaths per minute, smooth and natural',
        failCriteria: 'No breathing, erratic breathing, or unnatural movement'
      },
      {
        id: 'anim-002',
        description: 'Avatar shows subtle idle movements that feel lifelike',
        category: 'animation',
        priority: 'high',
        expectedBehavior: 'Small, natural movements that prevent static appearance',
        testSteps: [
          'Watch avatar in idle state for 60 seconds',
          'Note any subtle movements (ear twitches, head shifts)',
          'Verify movements are natural and not repetitive',
          'Check that movements enhance liveliness'
        ],
        passCriteria: 'Subtle, natural movements that enhance liveliness',
        failCriteria: 'No idle movements or unnatural repetitive motions'
      },
      {
        id: 'anim-003',
        description: 'Avatar transitions smoothly between animation states',
        category: 'animation',
        priority: 'critical',
        expectedBehavior: 'No jarring jumps or glitches when changing states',
        testSteps: [
          'Start typing in chat',
          'Stop typing and send message',
          'Observe transitions between idle, listening, and speaking',
          'Check for smooth, natural state changes'
        ],
        passCriteria: 'All transitions are smooth and natural',
        failCriteria: 'Jarring jumps, glitches, or unnatural state changes'
      },
      {
        id: 'anim-004',
        description: 'Avatar animation runs at smooth 60fps without stuttering',
        category: 'animation',
        priority: 'high',
        expectedBehavior: 'Consistently smooth animation without frame drops',
        testSteps: [
          'Enable browser dev tools performance monitoring',
          'Observe avatar animation for 2 minutes',
          'Check for frame rate consistency',
          'Note any stuttering or lag'
        ],
        passCriteria: 'Consistent 55+ fps with no noticeable stuttering',
        failCriteria: 'Frequent frame drops or noticeable stuttering'
      }
    ];

    // Interaction Response Checklist
    const interactionChecklist: QAChecklistItem[] = [
      {
        id: 'interact-001',
        description: 'Avatar responds immediately when user starts typing',
        category: 'interaction',
        priority: 'critical',
        expectedBehavior: 'Visible response within 100ms of typing start',
        testSteps: [
          'Focus on chat input',
          'Start typing',
          'Observe avatar response time',
          'Check for increased attention/engagement'
        ],
        passCriteria: 'Immediate response, avatar appears more attentive',
        failCriteria: 'No response or delayed response (>200ms)'
      },
      {
        id: 'interact-002',
        description: 'Avatar shows appropriate excitement for long messages',
        category: 'interaction',
        priority: 'high',
        expectedBehavior: 'More animated behavior for longer, enthusiastic messages',
        testSteps: [
          'Send short message (5-10 words)',
          'Observe avatar response',
          'Send long message (50+ words)',
          'Compare animation intensity'
        ],
        passCriteria: 'Clearly more animated for longer messages',
        failCriteria: 'No difference in animation intensity'
      },
      {
        id: 'interact-003',
        description: 'Avatar returns to calm idle state after interaction ends',
        category: 'interaction',
        priority: 'medium',
        expectedBehavior: 'Gradual return to baseline animation after activity',
        testSteps: [
          'Engage in active conversation',
          'Stop all interaction',
          'Wait 5 seconds',
          'Observe return to idle state'
        ],
        passCriteria: 'Smooth, gradual return to calm idle state',
        failCriteria: 'Abrupt stopping or failure to return to idle'
      },
      {
        id: 'interact-004',
        description: 'Avatar maintains engagement during active conversation',
        category: 'interaction',
        priority: 'high',
        expectedBehavior: 'Sustained high energy during back-and-forth conversation',
        testSteps: [
          'Start rapid conversation (type, send, repeat)',
          'Continue for 1 minute',
          'Observe avatar energy levels',
          'Check for fatigue or decreased responsiveness'
        ],
        passCriteria: 'Maintains high engagement throughout conversation',
        failCriteria: 'Shows fatigue or decreased responsiveness'
      }
    ];

    // Performance Checklist
    const performanceChecklist: QAChecklistItem[] = [
      {
        id: 'perf-001',
        description: 'Avatar loads quickly without blocking the interface',
        category: 'performance',
        priority: 'high',
        expectedBehavior: 'Avatar appears within 2 seconds of page load',
        testSteps: [
          'Refresh the page',
          'Time avatar appearance',
          'Check if interface remains responsive during load',
          'Verify no loading errors'
        ],
        passCriteria: 'Avatar loads within 2 seconds, interface stays responsive',
        failCriteria: 'Slow loading (>3 seconds) or interface blocking'
      },
      {
        id: 'perf-002',
        description: 'Avatar does not cause system performance issues',
        category: 'performance',
        priority: 'critical',
        expectedBehavior: 'System remains responsive with avatar running',
        testSteps: [
          'Open system performance monitor',
          'Run avatar for 5 minutes',
          'Check CPU and memory usage',
          'Test system responsiveness'
        ],
        passCriteria: 'CPU <30%, memory <100MB, system stays responsive',
        failCriteria: 'High resource usage or system slowdown'
      },
      {
        id: 'perf-003',
        description: 'Avatar works consistently across different devices',
        category: 'performance',
        priority: 'medium',
        expectedBehavior: 'Consistent performance on desktop, tablet, and mobile',
        testSteps: [
          'Test on desktop browser',
          'Test on tablet',
          'Test on mobile device',
          'Compare performance and appearance'
        ],
        passCriteria: 'Consistent experience across all devices',
        failCriteria: 'Significant differences or failures on any device'
      }
    ];

    this.checklists.set('visual', visualChecklist);
    this.checklists.set('animation', animationChecklist);
    this.checklists.set('interaction', interactionChecklist);
    this.checklists.set('performance', performanceChecklist);
  }

  /**
   * Get all checklist items for a specific category
   */
  getChecklist(category: string): QAChecklistItem[] {
    return this.checklists.get(category) || [];
  }

  /**
   * Get all checklist items across all categories
   */
  getAllChecklists(): QAChecklistItem[] {
    const allItems: QAChecklistItem[] = [];
    for (const items of this.checklists.values()) {
      allItems.push(...items);
    }
    return allItems;
  }

  /**
   * Start a new QA testing session
   */
  startSession(tester: string, version: string, environment: string): string {
    const sessionId = `qa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const session: QASession = {
      id: sessionId,
      date: new Date(),
      tester,
      version,
      environment,
      results: [],
      overallScore: 0,
      grade: 'F',
      summary: '',
      recommendations: []
    };
    
    this.sessions.push(session);
    return sessionId;
  }

  /**
   * Record a test result for a checklist item
   */
  recordResult(sessionId: string, result: Omit<QATestResult, 'timestamp'>): void {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const fullResult: QATestResult = {
      ...result,
      timestamp: new Date()
    };

    session.results.push(fullResult);
  }

  /**
   * Complete a QA session and calculate final scores
   */
  completeSession(sessionId: string, summary: string, recommendations: string[]): QASession {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Calculate overall score
    const totalPoints = session.results.reduce((sum, result) => sum + result.score, 0);
    const maxPoints = session.results.length * 100;
    session.overallScore = Math.round((totalPoints / maxPoints) * 100);

    // Assign grade
    if (session.overallScore >= 90) session.grade = 'A';
    else if (session.overallScore >= 80) session.grade = 'B';
    else if (session.overallScore >= 70) session.grade = 'C';
    else if (session.overallScore >= 60) session.grade = 'D';
    else session.grade = 'F';

    session.summary = summary;
    session.recommendations = recommendations;

    return session;
  }

  /**
   * Generate a comprehensive QA report
   */
  generateReport(sessionId: string): string {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const report = `
# Avatar Quality Assurance Report

## Session Information
- **Session ID**: ${session.id}
- **Date**: ${session.date.toLocaleDateString()}
- **Tester**: ${session.tester}
- **Version**: ${session.version}
- **Environment**: ${session.environment}

## Overall Results
- **Score**: ${session.overallScore}/100
- **Grade**: ${session.grade}
- **Status**: ${session.grade <= 'C' ? 'PASS' : 'FAIL'}

## Category Breakdown
${this.generateCategoryBreakdown(session)}

## Detailed Results
${this.generateDetailedResults(session)}

## Summary
${session.summary}

## Recommendations
${session.recommendations.map(rec => `- ${rec}`).join('\n')}

## Critical Issues
${this.generateCriticalIssues(session)}

---
*Report generated on ${new Date().toLocaleString()}*
    `.trim();

    return report;
  }

  private generateCategoryBreakdown(session: QASession): string {
    const categories = ['visual', 'animation', 'interaction', 'performance'];
    const breakdown = categories.map(category => {
      const categoryResults = session.results.filter(r => {
        const item = this.getAllChecklists().find(i => i.id === r.itemId);
        return item?.category === category;
      });

      if (categoryResults.length === 0) return `- **${category}**: No tests conducted`;

      const avgScore = categoryResults.reduce((sum, r) => sum + r.score, 0) / categoryResults.length;
      const passCount = categoryResults.filter(r => r.passed).length;
      
      return `- **${category}**: ${Math.round(avgScore)}/100 (${passCount}/${categoryResults.length} passed)`;
    });

    return breakdown.join('\n');
  }

  private generateDetailedResults(session: QASession): string {
    return session.results.map(result => {
      const item = this.getAllChecklists().find(i => i.id === result.itemId);
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      
      return `
### ${item?.description || result.itemId}
- **Status**: ${status}
- **Score**: ${result.score}/100
- **Priority**: ${item?.priority || 'unknown'}
- **Notes**: ${result.notes}
      `.trim();
    }).join('\n\n');
  }

  private generateCriticalIssues(session: QASession): string {
    const criticalFailures = session.results.filter(r => {
      const item = this.getAllChecklists().find(i => i.id === r.itemId);
      return item?.priority === 'critical' && !r.passed;
    });

    if (criticalFailures.length === 0) {
      return 'No critical issues found.';
    }

    return criticalFailures.map(failure => {
      const item = this.getAllChecklists().find(i => i.id === failure.itemId);
      return `- **${item?.description}**: ${failure.notes}`;
    }).join('\n');
  }

  /**
   * Get session statistics
   */
  getSessionStats(sessionId: string): {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    criticalIssues: number;
    averageScore: number;
  } {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const criticalIssues = session.results.filter(r => {
      const item = this.getAllChecklists().find(i => i.id === r.itemId);
      return item?.priority === 'critical' && !r.passed;
    }).length;

    return {
      totalTests: session.results.length,
      passedTests: session.results.filter(r => r.passed).length,
      failedTests: session.results.filter(r => !r.passed).length,
      criticalIssues,
      averageScore: session.overallScore
    };
  }

  /**
   * Export session data as JSON
   */
  exportSession(sessionId: string): string {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    return JSON.stringify(session, null, 2);
  }

  /**
   * Get all sessions
   */
  getAllSessions(): QASession[] {
    return [...this.sessions];
  }
}

// Export singleton instance
export const avatarQAFramework = new AvatarManualQAFramework(); 