import type { Context, SystemContext, SessionContext, ImmediateContext } from '../types/context';
import type { ChatMessage } from '../types/common';

/**
 * Context Validation Service for Avatar System
 * 
 * Provides comprehensive validation of context data to ensure system reliability,
 * data integrity, and optimal performance.
 */

export interface ValidationConfig {
  strictMode: boolean;
  validateTypes: boolean;
  validateRanges: boolean;
  validateRequired: boolean;
  maxErrors: number;
  logLevel: 'none' | 'errors' | 'warnings' | 'all';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number; // 0-1 overall quality score
  summary: ValidationSummary;
  recommendations: ValidationRecommendation[];
}

export interface ValidationError {
  id: string;
  field: string;
  type: ValidationErrorType;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  expectedValue?: any;
  actualValue?: any;
  suggestion?: string;
}

export interface ValidationWarning {
  id: string;
  field: string;
  type: ValidationWarningType;
  message: string;
  impact: 'performance' | 'quality' | 'usability';
  suggestion: string;
}

export type ValidationErrorType = 
  | 'missing_required'
  | 'invalid_type'
  | 'out_of_range'
  | 'invalid_format'
  | 'inconsistent_data'
  | 'circular_reference'
  | 'size_limit_exceeded'
  | 'invalid_relationship';

export type ValidationWarningType =
  | 'suboptimal_value'
  | 'deprecated_field'
  | 'performance_concern'
  | 'best_practice_violation'
  | 'potential_issue';

export interface ValidationSummary {
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  warningsCount: number;
  criticalErrors: number;
  validationTime: number; // milliseconds
  coverage: number; // 0-1 percentage of context validated
}

export interface ValidationRecommendation {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'data_quality' | 'performance' | 'consistency' | 'completeness';
  action: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
}

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  category: 'required' | 'type' | 'range' | 'format' | 'consistency' | 'performance';
  severity: 'error' | 'warning';
  enabled: boolean;
  validator: (context: Context) => ValidationResult | null;
}

export interface ContextHealthCheck {
  timestamp: Date;
  contextId: string;
  healthScore: number; // 0-1
  issues: HealthIssue[];
  performance: PerformanceMetrics;
  recommendations: string[];
}

export interface HealthIssue {
  type: 'data_quality' | 'performance' | 'consistency' | 'security';
  severity: 'info' | 'warning' | 'error' | 'critical';
  description: string;
  affectedComponents: string[];
  resolution: string;
}

export interface PerformanceMetrics {
  contextSize: number;
  processingTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  validationOverhead: number;
}

export class ContextValidator {
  private config: ValidationConfig;
  private rules: Map<string, ValidationRule> = new Map();
  private validationHistory: ValidationResult[] = [];
  private performanceMetrics: PerformanceMetrics[] = [];

  constructor(config?: Partial<ValidationConfig>) {
    this.config = this.createDefaultConfig(config);
    this.initializeDefaultRules();
  }

  /**
   * Validate a complete context object
   */
  validateContext(context: Context): ValidationResult {
    const startTime = Date.now();
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let checksPerformed = 0;
    let checksPassed = 0;

    try {
      // Validate system context
      const systemResult = this.validateSystemContext(context.system);
      errors.push(...systemResult.errors);
      warnings.push(...systemResult.warnings);
      checksPerformed += systemResult.summary.totalChecks;
      checksPassed += systemResult.summary.passedChecks;

      // Validate session context
      const sessionResult = this.validateSessionContext(context.session);
      errors.push(...sessionResult.errors);
      warnings.push(...sessionResult.warnings);
      checksPerformed += sessionResult.summary.totalChecks;
      checksPassed += sessionResult.summary.passedChecks;

      // Validate immediate context
      const immediateResult = this.validateImmediateContext(context.immediate);
      errors.push(...immediateResult.errors);
      warnings.push(...immediateResult.warnings);
      checksPerformed += immediateResult.summary.totalChecks;
      checksPassed += immediateResult.summary.passedChecks;

      // Validate cross-context consistency
      const consistencyResult = this.validateContextConsistency(context);
      errors.push(...consistencyResult.errors);
      warnings.push(...consistencyResult.warnings);
      checksPerformed += consistencyResult.summary.totalChecks;
      checksPassed += consistencyResult.summary.passedChecks;

      // Run custom validation rules
      const customResult = this.runCustomValidationRules(context);
      errors.push(...customResult.errors);
      warnings.push(...customResult.warnings);
      checksPerformed += customResult.summary.totalChecks;
      checksPassed += customResult.summary.passedChecks;

      const validationTime = Date.now() - startTime;
      const isValid = errors.filter(e => e.severity === 'critical' || e.severity === 'high').length === 0;
      const score = this.calculateValidationScore(checksPerformed, checksPassed, errors, warnings);

      const result: ValidationResult = {
        isValid,
        errors,
        warnings,
        score,
        summary: {
          totalChecks: checksPerformed,
          passedChecks: checksPassed,
          failedChecks: checksPerformed - checksPassed,
          warningsCount: warnings.length,
          criticalErrors: errors.filter(e => e.severity === 'critical').length,
          validationTime,
          coverage: this.calculateCoverage(context)
        },
        recommendations: this.generateRecommendations(errors, warnings)
      };

      this.recordValidationResult(result);
      return result;

    } catch (error) {
      return this.createErrorResult(error as Error, Date.now() - startTime);
    }
  }

  /**
   * Validate system context
   */
  validateSystemContext(systemContext: SystemContext): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let checks = 0;
    let passed = 0;

    // Validate avatar personality
    if (!systemContext.avatarPersonality) {
      errors.push(this.createError('system.avatarPersonality', 'missing_required', 'Avatar personality is required', 'critical'));
    } else {
      checks++;
      passed++;
      
      // Validate personality traits
      const traits = systemContext.avatarPersonality.traits;
      if (traits) {
        Object.entries(traits).forEach(([trait, value]) => {
          checks++;
          if (typeof value === 'number' && (value < 0 || value > 1)) {
            errors.push(this.createError(`system.avatarPersonality.traits.${trait}`, 'out_of_range', 
              `Trait ${trait} must be between 0 and 1`, 'medium', value, '0-1 range'));
          } else {
            passed++;
          }
        });
      }
    }

    // Validate conversation guidelines
    if (!systemContext.conversationGuidelines) {
      errors.push(this.createError('system.conversationGuidelines', 'missing_required', 
        'Conversation guidelines are required', 'high'));
    } else {
      checks++;
      passed++;
    }

    // Validate technical capabilities
    if (!systemContext.technicalCapabilities) {
      errors.push(this.createError('system.technicalCapabilities', 'missing_required', 
        'Technical capabilities are required', 'medium'));
    } else {
      checks++;
      passed++;
    }

    return this.createValidationResult(errors, warnings, checks, passed);
  }

  /**
   * Validate session context
   */
  validateSessionContext(sessionContext: SessionContext): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let checks = 0;
    let passed = 0;

    // Validate session ID
    checks++;
    if (!sessionContext.sessionId || sessionContext.sessionId.trim() === '') {
      errors.push(this.createError('session.sessionId', 'missing_required', 'Session ID is required', 'critical'));
    } else {
      passed++;
    }

    // Validate user profile
    checks++;
    if (!sessionContext.userProfile) {
      errors.push(this.createError('session.userProfile', 'missing_required', 'User profile is required', 'high'));
    } else {
      passed++;
      
      // Validate user ID
      checks++;
      if (!sessionContext.userProfile.userId) {
        errors.push(this.createError('session.userProfile.userId', 'missing_required', 'User ID is required', 'critical'));
      } else {
        passed++;
      }
    }

    // Validate message count
    checks++;
    if (sessionContext.messageCount < 0) {
      errors.push(this.createError('session.messageCount', 'out_of_range', 'Message count cannot be negative', 'medium'));
    } else {
      passed++;
    }

    // Validate start time
    checks++;
    if (!sessionContext.startTime || isNaN(sessionContext.startTime.getTime())) {
      errors.push(this.createError('session.startTime', 'invalid_format', 'Start time must be a valid date', 'medium'));
    } else {
      passed++;
      
      // Check if start time is in the future
      if (sessionContext.startTime > new Date()) {
        warnings.push(this.createWarning('session.startTime', 'suboptimal_value', 
          'Start time is in the future', 'quality', 'Verify the session start time is correct'));
      }
    }

    return this.createValidationResult(errors, warnings, checks, passed);
  }

  /**
   * Validate immediate context
   */
  validateImmediateContext(immediateContext: ImmediateContext): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let checks = 0;
    let passed = 0;

    // Validate recent messages
    checks++;
    if (!Array.isArray(immediateContext.recentMessages)) {
      errors.push(this.createError('immediate.recentMessages', 'invalid_type', 'Recent messages must be an array', 'high'));
    } else {
      passed++;
      
      // Validate message structure
      immediateContext.recentMessages.forEach((message, index) => {
        checks++;
        if (!this.isValidMessage(message)) {
          errors.push(this.createError(`immediate.recentMessages[${index}]`, 'invalid_format', 
            'Invalid message format', 'medium'));
        } else {
          passed++;
        }
      });

      // Check message count
      if (immediateContext.recentMessages.length > 50) {
        warnings.push(this.createWarning('immediate.recentMessages', 'performance_concern',
          'Large number of recent messages may impact performance', 'performance',
          'Consider implementing message compression or limiting recent message count'));
      }
    }

    // Validate current user emotion
    checks++;
    const validEmotions = ['happy', 'sad', 'excited', 'calm', 'frustrated', 'confused', 'curious', 'neutral'];
    if (!validEmotions.includes(immediateContext.currentUserEmotion)) {
      errors.push(this.createError('immediate.currentUserEmotion', 'invalid_format', 
        'Invalid emotion state', 'low', immediateContext.currentUserEmotion, validEmotions.join(', ')));
    } else {
      passed++;
    }

    // Validate conversation flow
    checks++;
    if (!immediateContext.conversationFlow) {
      errors.push(this.createError('immediate.conversationFlow', 'missing_required', 
        'Conversation flow is required', 'medium'));
    } else {
      passed++;
    }

    // Validate active topics
    checks++;
    if (!Array.isArray(immediateContext.activeTopics)) {
      errors.push(this.createError('immediate.activeTopics', 'invalid_type', 'Active topics must be an array', 'low'));
    } else {
      passed++;
    }

    // Validate environment data
    checks++;
    if (!immediateContext.environmentData) {
      errors.push(this.createError('immediate.environmentData', 'missing_required', 
        'Environment data is required', 'low'));
    } else {
      passed++;
    }

    return this.createValidationResult(errors, warnings, checks, passed);
  }

  /**
   * Validate context consistency across different sections
   */
  validateContextConsistency(context: Context): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let checks = 0;
    let passed = 0;

    // Check timestamp consistency
    checks++;
    if (!context.timestamp) {
      errors.push(this.createError('context.timestamp', 'missing_required', 'Context timestamp is required', 'medium'));
    } else {
      passed++;
      
      const contextTime = new Date(context.timestamp);
      const sessionTime = context.session.startTime;
      
      if (contextTime < sessionTime) {
        errors.push(this.createError('context.timestamp', 'inconsistent_data', 
          'Context timestamp is before session start time', 'medium'));
      }
    }

    // Check message count consistency
    checks++;
    const actualMessageCount = context.immediate.recentMessages.length;
    const reportedMessageCount = context.session.messageCount;
    
    if (actualMessageCount > reportedMessageCount) {
      warnings.push(this.createWarning('context.messageCount', 'potential_issue',
        'Recent messages count exceeds reported session message count', 'quality',
        'Verify message counting logic'));
    } else {
      passed++;
    }

    // Check user profile consistency
    checks++;
    if (context.session.userProfile && context.session.userProfile.userId) {
      // Validate user profile completeness
      const profile = context.session.userProfile;
      if (!profile.preferences || !profile.communicationStyle) {
        warnings.push(this.createWarning('session.userProfile', 'suboptimal_value',
          'User profile is incomplete', 'quality', 'Complete user profile for better personalization'));
      }
      passed++;
    }

    return this.createValidationResult(errors, warnings, checks, passed);
  }

  /**
   * Run custom validation rules
   */
  runCustomValidationRules(context: Context): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let checks = 0;
    let passed = 0;

    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;
      
      checks++;
      try {
        const result = rule.validator(context);
        if (result) {
          if (result.errors.length > 0) {
            errors.push(...result.errors);
          } else {
            passed++;
          }
          warnings.push(...result.warnings);
        } else {
          passed++;
        }
      } catch (error) {
        errors.push(this.createError(rule.id, 'invalid_format', 
          `Custom rule ${rule.name} failed: ${(error as Error).message}`, 'low'));
      }
    }

    return this.createValidationResult(errors, warnings, checks, passed);
  }

  /**
   * Perform health check on context
   */
  performHealthCheck(context: Context): ContextHealthCheck {
    const validation = this.validateContext(context);
    const issues: HealthIssue[] = [];
    
    // Convert errors to health issues
    validation.errors.forEach(error => {
      issues.push({
        type: this.mapErrorToHealthType(error.type),
        severity: this.mapSeverityToHealth(error.severity),
        description: error.message,
        affectedComponents: [error.field],
        resolution: error.suggestion || 'Review and fix the identified issue'
      });
    });

    // Convert warnings to health issues
    validation.warnings.forEach(warning => {
      issues.push({
        type: this.mapWarningToHealthType(warning.type),
        severity: 'warning',
        description: warning.message,
        affectedComponents: [warning.field],
        resolution: warning.suggestion
      });
    });

    return {
      timestamp: new Date(),
      contextId: context.session.sessionId,
      healthScore: validation.score,
      issues,
      performance: {
        contextSize: this.calculateContextSize(context),
        processingTime: validation.summary.validationTime,
        memoryUsage: 0, // Would need actual memory measurement
        cacheHitRate: 0, // Would need cache statistics
        validationOverhead: validation.summary.validationTime
      },
      recommendations: validation.recommendations.map(r => r.action)
    };
  }

  /**
   * Add custom validation rule
   */
  addValidationRule(rule: ValidationRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Remove validation rule
   */
  removeValidationRule(ruleId: string): void {
    this.rules.delete(ruleId);
  }

  /**
   * Get validation statistics
   */
  getValidationStats(): ValidationStats {
    const recentResults = this.validationHistory.slice(-100);
    
    return {
      totalValidations: this.validationHistory.length,
      averageScore: recentResults.reduce((sum, r) => sum + r.score, 0) / Math.max(recentResults.length, 1),
      averageValidationTime: recentResults.reduce((sum, r) => sum + r.summary.validationTime, 0) / Math.max(recentResults.length, 1),
      errorRate: recentResults.filter(r => r.errors.length > 0).length / Math.max(recentResults.length, 1),
      mostCommonErrors: this.getMostCommonErrors(recentResults),
      performanceTrend: this.calculatePerformanceTrend(recentResults)
    };
  }

  private createDefaultConfig(config?: Partial<ValidationConfig>): ValidationConfig {
    return {
      strictMode: config?.strictMode ?? false,
      validateTypes: config?.validateTypes ?? true,
      validateRanges: config?.validateRanges ?? true,
      validateRequired: config?.validateRequired ?? true,
      maxErrors: config?.maxErrors ?? 50,
      logLevel: config?.logLevel ?? 'warnings'
    };
  }

  private initializeDefaultRules(): void {
    // Add default validation rules
    this.addValidationRule({
      id: 'context_size_limit',
      name: 'Context Size Limit',
      description: 'Ensures context size is within acceptable limits',
      category: 'performance',
      severity: 'warning',
      enabled: true,
      validator: (context: Context) => {
        const size = this.calculateContextSize(context);
        if (size > 100000) { // 100KB limit
          return {
            isValid: false,
            errors: [this.createError('context.size', 'size_limit_exceeded', 
              'Context size exceeds recommended limit', 'medium', size, '< 100KB')],
            warnings: [],
            score: 0.5,
            summary: { totalChecks: 1, passedChecks: 0, failedChecks: 1, warningsCount: 0, criticalErrors: 0, validationTime: 0, coverage: 1 },
            recommendations: []
          };
        }
        return null;
      }
    });

    this.addValidationRule({
      id: 'message_freshness',
      name: 'Message Freshness',
      description: 'Ensures recent messages are actually recent',
      category: 'consistency',
      severity: 'warning',
      enabled: true,
      validator: (context: Context) => {
        const messages = context.immediate.recentMessages;
        const now = Date.now();
        const oldMessages = messages.filter(msg => now - msg.timestamp > 24 * 60 * 60 * 1000); // 24 hours
        
        if (oldMessages.length > 0) {
          return {
            isValid: true,
            errors: [],
            warnings: [this.createWarning('immediate.recentMessages', 'potential_issue',
              `${oldMessages.length} messages are older than 24 hours`, 'quality',
              'Consider cleaning up old messages from recent context')],
            score: 0.8,
            summary: { totalChecks: 1, passedChecks: 0, failedChecks: 0, warningsCount: 1, criticalErrors: 0, validationTime: 0, coverage: 1 },
            recommendations: []
          };
        }
        return null;
      }
    });
  }

  private createError(
    field: string,
    type: ValidationErrorType,
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    actualValue?: any,
    expectedValue?: any,
    suggestion?: string
  ): ValidationError {
    return {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      field,
      type,
      message,
      severity,
      actualValue,
      expectedValue,
      suggestion
    };
  }

  private createWarning(
    field: string,
    type: ValidationWarningType,
    message: string,
    impact: 'performance' | 'quality' | 'usability',
    suggestion: string
  ): ValidationWarning {
    return {
      id: `warning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      field,
      type,
      message,
      impact,
      suggestion
    };
  }

  private createValidationResult(
    errors: ValidationError[],
    warnings: ValidationWarning[],
    totalChecks: number,
    passedChecks: number
  ): ValidationResult {
    return {
      isValid: errors.filter(e => e.severity === 'critical' || e.severity === 'high').length === 0,
      errors,
      warnings,
      score: this.calculateValidationScore(totalChecks, passedChecks, errors, warnings),
      summary: {
        totalChecks,
        passedChecks,
        failedChecks: totalChecks - passedChecks,
        warningsCount: warnings.length,
        criticalErrors: errors.filter(e => e.severity === 'critical').length,
        validationTime: 0,
        coverage: 1
      },
      recommendations: this.generateRecommendations(errors, warnings)
    };
  }

  private createErrorResult(error: Error, validationTime: number): ValidationResult {
    return {
      isValid: false,
      errors: [this.createError('validation', 'invalid_format', `Validation failed: ${error.message}`, 'critical')],
      warnings: [],
      score: 0,
      summary: {
        totalChecks: 1,
        passedChecks: 0,
        failedChecks: 1,
        warningsCount: 0,
        criticalErrors: 1,
        validationTime,
        coverage: 0
      },
      recommendations: [{
        id: 'fix_validation_error',
        priority: 'critical',
        category: 'data_quality',
        action: 'Fix validation error',
        description: 'Address the validation system error',
        impact: 'System reliability',
        effort: 'medium'
      }]
    };
  }

  private calculateValidationScore(
    totalChecks: number,
    passedChecks: number,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): number {
    if (totalChecks === 0) return 0;
    
    let score = passedChecks / totalChecks;
    
    // Penalize for errors
    const criticalErrors = errors.filter(e => e.severity === 'critical').length;
    const highErrors = errors.filter(e => e.severity === 'high').length;
    const mediumErrors = errors.filter(e => e.severity === 'medium').length;
    
    score -= criticalErrors * 0.3;
    score -= highErrors * 0.2;
    score -= mediumErrors * 0.1;
    score -= warnings.length * 0.05;
    
    return Math.max(0, Math.min(1, score));
  }

  private calculateCoverage(context: Context): number {
    // Simple coverage calculation based on non-null fields
    let totalFields = 0;
    let validatedFields = 0;
    
    const countFields = (obj: any, path = ''): void => {
      if (obj === null || obj === undefined) return;
      
      if (typeof obj === 'object' && !Array.isArray(obj)) {
        Object.keys(obj).forEach(key => {
          totalFields++;
          if (obj[key] !== null && obj[key] !== undefined) {
            validatedFields++;
          }
          countFields(obj[key], path ? `${path}.${key}` : key);
        });
      }
    };
    
    countFields(context);
    return totalFields > 0 ? validatedFields / totalFields : 1;
  }

  private generateRecommendations(errors: ValidationError[], warnings: ValidationWarning[]): ValidationRecommendation[] {
    const recommendations: ValidationRecommendation[] = [];
    
    // Generate recommendations based on errors
    const criticalErrors = errors.filter(e => e.severity === 'critical');
    if (criticalErrors.length > 0) {
      recommendations.push({
        id: 'fix_critical_errors',
        priority: 'critical',
        category: 'data_quality',
        action: 'Fix critical validation errors',
        description: `Address ${criticalErrors.length} critical errors that prevent system operation`,
        impact: 'System functionality',
        effort: 'high'
      });
    }
    
    // Generate recommendations based on warnings
    const performanceWarnings = warnings.filter(w => w.impact === 'performance');
    if (performanceWarnings.length > 0) {
      recommendations.push({
        id: 'optimize_performance',
        priority: 'medium',
        category: 'performance',
        action: 'Optimize performance issues',
        description: `Address ${performanceWarnings.length} performance-related warnings`,
        impact: 'System performance',
        effort: 'medium'
      });
    }
    
    return recommendations;
  }

  private isValidMessage(message: any): boolean {
    return message &&
           typeof message.id === 'string' &&
           typeof message.content === 'string' &&
           typeof message.sender === 'string' &&
           typeof message.timestamp === 'number';
  }

  private calculateContextSize(context: Context): number {
    return JSON.stringify(context).length;
  }

  private mapErrorToHealthType(errorType: ValidationErrorType): 'data_quality' | 'performance' | 'consistency' | 'security' {
    switch (errorType) {
      case 'size_limit_exceeded':
        return 'performance';
      case 'inconsistent_data':
        return 'consistency';
      case 'missing_required':
      case 'invalid_type':
      case 'invalid_format':
        return 'data_quality';
      default:
        return 'data_quality';
    }
  }

  private mapSeverityToHealth(severity: string): 'info' | 'warning' | 'error' | 'critical' {
    switch (severity) {
      case 'low': return 'info';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'critical';
      default: return 'info';
    }
  }

  private mapWarningToHealthType(warningType: ValidationWarningType): 'data_quality' | 'performance' | 'consistency' | 'security' {
    switch (warningType) {
      case 'performance_concern':
        return 'performance';
      case 'suboptimal_value':
      case 'potential_issue':
        return 'consistency';
      default:
        return 'data_quality';
    }
  }

  private recordValidationResult(result: ValidationResult): void {
    this.validationHistory.push(result);
    
    // Keep only last 1000 results
    if (this.validationHistory.length > 1000) {
      this.validationHistory = this.validationHistory.slice(-1000);
    }
  }

  private getMostCommonErrors(results: ValidationResult[]): { type: ValidationErrorType; count: number }[] {
    const errorCounts = new Map<ValidationErrorType, number>();
    
    results.forEach(result => {
      result.errors.forEach(error => {
        errorCounts.set(error.type, (errorCounts.get(error.type) || 0) + 1);
      });
    });
    
    return Array.from(errorCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private calculatePerformanceTrend(results: ValidationResult[]): 'improving' | 'declining' | 'stable' {
    if (results.length < 10) return 'stable';
    
    const recent = results.slice(-10);
    const older = results.slice(-20, -10);
    
    const recentAvg = recent.reduce((sum, r) => sum + r.score, 0) / recent.length;
    const olderAvg = older.reduce((sum, r) => sum + r.score, 0) / older.length;
    
    const difference = recentAvg - olderAvg;
    
    if (difference > 0.05) return 'improving';
    if (difference < -0.05) return 'declining';
    return 'stable';
  }
}

export interface ValidationStats {
  totalValidations: number;
  averageScore: number;
  averageValidationTime: number;
  errorRate: number;
  mostCommonErrors: { type: ValidationErrorType; count: number }[];
  performanceTrend: 'improving' | 'declining' | 'stable';
}

export function createContextValidator(config?: Partial<ValidationConfig>): ContextValidator {
  return new ContextValidator(config);
} 