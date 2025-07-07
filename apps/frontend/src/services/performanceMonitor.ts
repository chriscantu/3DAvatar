// Performance monitoring and optimization for Phase 2 AI services

export interface PerformanceMetrics {
  timestamp: number;
  service: string;
  operation: string;
  duration: number;
  memoryUsage: number;
  inputSize: number;
  outputSize: number;
  cacheHit: boolean;
  errorOccurred: boolean;
}

export interface OptimizationRecommendation {
  service: string;
  issue: string;
  recommendation: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedImpact: string;
  implementation: string;
}

export interface PerformanceThresholds {
  maxResponseTime: number; // milliseconds
  maxMemoryUsage: number; // bytes
  minCacheHitRate: number; // percentage
  maxErrorRate: number; // percentage
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetricsHistory = 1000;
  private readonly thresholds: PerformanceThresholds;
  private alertCallbacks: Array<(alert: PerformanceAlert) => void> = [];

  constructor(thresholds?: Partial<PerformanceThresholds>) {
    this.thresholds = {
      maxResponseTime: thresholds?.maxResponseTime ?? 1000, // 1 second
      maxMemoryUsage: thresholds?.maxMemoryUsage ?? 50 * 1024 * 1024, // 50MB
      minCacheHitRate: thresholds?.minCacheHitRate ?? 0.7, // 70%
      maxErrorRate: thresholds?.maxErrorRate ?? 0.05 // 5%
    };
  }

  /**
   * Start monitoring a service operation
   */
  startOperation(service: string, operation: string, inputSize: number = 0): OperationTracker {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();

    return {
      service,
      operation,
      startTime,
      startMemory,
      inputSize,
      finish: (outputSize: number = 0, cacheHit: boolean = false, error?: Error) => {
        const endTime = performance.now();
        const endMemory = this.getMemoryUsage();
        
        const metric: PerformanceMetrics = {
          timestamp: Date.now(),
          service,
          operation,
          duration: endTime - startTime,
          memoryUsage: endMemory - startMemory,
          inputSize,
          outputSize,
          cacheHit,
          errorOccurred: !!error
        };

        this.recordMetric(metric);
        this.checkThresholds(metric);
        
        return metric;
      }
    };
  }

  /**
   * Record a performance metric
   */
  private recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Keep metrics history manageable
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics.shift();
    }
  }

  /**
   * Check if metrics exceed thresholds and trigger alerts
   */
  private checkThresholds(metric: PerformanceMetrics): void {
    const alerts: PerformanceAlert[] = [];

    if (metric.duration > this.thresholds.maxResponseTime) {
      alerts.push({
        type: 'slow_response',
        service: metric.service,
        operation: metric.operation,
        value: metric.duration,
        threshold: this.thresholds.maxResponseTime,
        severity: metric.duration > this.thresholds.maxResponseTime * 2 ? 'critical' : 'warning',
        timestamp: metric.timestamp
      });
    }

    if (metric.memoryUsage > this.thresholds.maxMemoryUsage) {
      alerts.push({
        type: 'high_memory',
        service: metric.service,
        operation: metric.operation,
        value: metric.memoryUsage,
        threshold: this.thresholds.maxMemoryUsage,
        severity: 'warning',
        timestamp: metric.timestamp
      });
    }

    // Check cache hit rate for recent operations
    const recentMetrics = this.getRecentMetrics(metric.service, 10);
    const cacheHitRate = recentMetrics.filter(m => m.cacheHit).length / recentMetrics.length;
    
    if (cacheHitRate < this.thresholds.minCacheHitRate) {
      alerts.push({
        type: 'low_cache_hit',
        service: metric.service,
        operation: 'cache_performance',
        value: cacheHitRate,
        threshold: this.thresholds.minCacheHitRate,
        severity: 'info',
        timestamp: metric.timestamp
      });
    }

    // Trigger alerts
    alerts.forEach(alert => {
      this.alertCallbacks.forEach(callback => callback(alert));
    });
  }

  /**
   * Get performance statistics for a service
   */
  getServiceStats(service: string, timeWindow: number = 3600000): ServicePerformanceStats {
    const cutoff = Date.now() - timeWindow;
    const serviceMetrics = this.metrics.filter(m => 
      m.service === service && m.timestamp >= cutoff
    );

    if (serviceMetrics.length === 0) {
      return this.getEmptyStats(service);
    }

    const durations = serviceMetrics.map(m => m.duration);
    const memoryUsages = serviceMetrics.map(m => m.memoryUsage);
    const errorCount = serviceMetrics.filter(m => m.errorOccurred).length;
    const cacheHits = serviceMetrics.filter(m => m.cacheHit).length;

    return {
      service,
      timeWindow,
      operationCount: serviceMetrics.length,
      averageResponseTime: this.calculateAverage(durations),
      p95ResponseTime: this.calculatePercentile(durations, 0.95),
      averageMemoryUsage: this.calculateAverage(memoryUsages),
      peakMemoryUsage: Math.max(...memoryUsages),
      errorRate: errorCount / serviceMetrics.length,
      cacheHitRate: cacheHits / serviceMetrics.length,
      throughput: serviceMetrics.length / (timeWindow / 1000), // ops per second
      lastUpdated: Date.now()
    };
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations(): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];
    const services = ['emotionalIntelligence', 'contextCompression', 'feedbackCollection', 'contextValidation'];

    services.forEach(service => {
      const stats = this.getServiceStats(service);
      
      // Slow response time recommendations
      if (stats.averageResponseTime > this.thresholds.maxResponseTime) {
        recommendations.push({
          service,
          issue: `Average response time (${stats.averageResponseTime.toFixed(2)}ms) exceeds threshold`,
          recommendation: 'Implement result caching, optimize algorithms, or reduce processing complexity',
          priority: stats.averageResponseTime > this.thresholds.maxResponseTime * 2 ? 'critical' : 'high',
          estimatedImpact: `${((this.thresholds.maxResponseTime / stats.averageResponseTime) * 100).toFixed(1)}% faster response times`,
          implementation: 'Add memoization to expensive operations, implement LRU cache for results'
        });
      }

      // High memory usage recommendations
      if (stats.averageMemoryUsage > this.thresholds.maxMemoryUsage * 0.7) {
        recommendations.push({
          service,
          issue: `Memory usage (${(stats.averageMemoryUsage / 1024 / 1024).toFixed(2)}MB) is high`,
          recommendation: 'Implement object pooling, reduce data copying, optimize data structures',
          priority: 'medium',
          estimatedImpact: '30-50% reduction in memory usage',
          implementation: 'Use WeakMap for caching, implement data streaming for large objects'
        });
      }

      // Low cache hit rate recommendations
      if (stats.cacheHitRate < this.thresholds.minCacheHitRate) {
        recommendations.push({
          service,
          issue: `Cache hit rate (${(stats.cacheHitRate * 100).toFixed(1)}%) is below optimal`,
          recommendation: 'Improve cache key generation, increase cache size, or adjust TTL',
          priority: 'medium',
          estimatedImpact: `${((this.thresholds.minCacheHitRate - stats.cacheHitRate) * 100).toFixed(1)}% improvement in cache efficiency`,
          implementation: 'Implement smarter cache eviction policies, use composite cache keys'
        });
      }

      // High error rate recommendations
      if (stats.errorRate > this.thresholds.maxErrorRate) {
        recommendations.push({
          service,
          issue: `Error rate (${(stats.errorRate * 100).toFixed(1)}%) exceeds threshold`,
          recommendation: 'Improve input validation, add fallback mechanisms, enhance error handling',
          priority: 'high',
          estimatedImpact: `${((this.thresholds.maxErrorRate / stats.errorRate) * 100).toFixed(1)}% reduction in errors`,
          implementation: 'Add circuit breaker pattern, implement graceful degradation'
        });
      }
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Add performance alert callback
   */
  onAlert(callback: (alert: PerformanceAlert) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * Get recent metrics for a service
   */
  private getRecentMetrics(service: string, count: number): PerformanceMetrics[] {
    return this.metrics
      .filter(m => m.service === service)
      .slice(-count);
  }

  /**
   * Get memory usage (approximate)
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as Performance & { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize;
    }
    return 0; // Fallback for environments without memory API
  }

  /**
   * Calculate average of array
   */
  private calculateAverage(values: number[]): number {
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }

  /**
   * Calculate percentile of array
   */
  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * percentile) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Get empty stats for a service
   */
  private getEmptyStats(service: string): ServicePerformanceStats {
    return {
      service,
      timeWindow: 3600000,
      operationCount: 0,
      averageResponseTime: 0,
      p95ResponseTime: 0,
      averageMemoryUsage: 0,
      peakMemoryUsage: 0,
      errorRate: 0,
      cacheHitRate: 0,
      throughput: 0,
      lastUpdated: Date.now()
    };
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = 'timestamp,service,operation,duration,memoryUsage,inputSize,outputSize,cacheHit,errorOccurred\n';
      const rows = this.metrics.map(m => 
        `${m.timestamp},${m.service},${m.operation},${m.duration},${m.memoryUsage},${m.inputSize},${m.outputSize},${m.cacheHit},${m.errorOccurred}`
      ).join('\n');
      return headers + rows;
    }
    
    return JSON.stringify(this.metrics, null, 2);
  }

  /**
   * Clear metrics history
   */
  clearMetrics(): void {
    this.metrics = [];
  }
}

// Supporting interfaces
export interface OperationTracker {
  service: string;
  operation: string;
  startTime: number;
  startMemory: number;
  inputSize: number;
  finish: (outputSize?: number, cacheHit?: boolean, error?: Error) => PerformanceMetrics;
}

export interface PerformanceAlert {
  type: 'slow_response' | 'high_memory' | 'low_cache_hit' | 'high_error_rate';
  service: string;
  operation: string;
  value: number;
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
  timestamp: number;
}

export interface ServicePerformanceStats {
  service: string;
  timeWindow: number;
  operationCount: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  averageMemoryUsage: number;
  peakMemoryUsage: number;
  errorRate: number;
  cacheHitRate: number;
  throughput: number;
  lastUpdated: number;
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Helper function to monitor async operations
export async function monitorAsync<T>(
  service: string,
  operation: string,
  fn: () => Promise<T>,
  inputSize: number = 0
): Promise<T> {
  const tracker = performanceMonitor.startOperation(service, operation, inputSize);
  
  try {
    const result = await fn();
    const outputSize = typeof result === 'string' ? result.length : 
                     typeof result === 'object' ? JSON.stringify(result).length : 0;
    tracker.finish(outputSize, false);
    return result;
  } catch (error) {
    tracker.finish(0, false, error as Error);
    throw error;
  }
}

// Helper function to monitor sync operations
export function monitorSync<T>(
  service: string,
  operation: string,
  fn: () => T,
  inputSize: number = 0
): T {
  const tracker = performanceMonitor.startOperation(service, operation, inputSize);
  
  try {
    const result = fn();
    const outputSize = typeof result === 'string' ? result.length : 
                     typeof result === 'object' ? JSON.stringify(result).length : 0;
    tracker.finish(outputSize, false);
    return result;
  } catch (error) {
    tracker.finish(0, false, error as Error);
    throw error;
  }
} 