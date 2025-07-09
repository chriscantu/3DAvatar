/**
 * Phase 3 Test Configuration
 * Defines quality gates, standards, and testing requirements
 */

// Quality gate thresholds
export const QUALITY_GATES = {
  // Code coverage requirements
  coverage: {
    lines: 95,
    functions: 95,
    branches: 90,
    statements: 95
  },
  
  // Performance requirements
  performance: {
    componentRenderTime: 16, // 60fps = 16.67ms per frame
    apiResponseTime: 100,
    memoryUsage: 50 * 1024 * 1024, // 50MB
    bundleSize: 500 * 1024 // 500KB
  },
  
  // Accessibility requirements
  accessibility: {
    wcagLevel: 'AA',
    colorContrast: 4.5,
    focusManagement: true,
    keyboardNavigation: true
  },
  
  // Type safety requirements
  typeSafety: {
    noExplicitAny: true,
    strictNullChecks: true,
    noUnusedLocals: true,
    noUnusedParameters: true
  },
  
  // Linting requirements
  linting: {
    maxErrors: 0,
    maxWarnings: 0,
    enforceReactHooks: true,
    enforceTypeScript: true
  }
};

// Test categories and their requirements
export const TEST_CATEGORIES = {
  unit: {
    pattern: '**/*.test.{ts,tsx}',
    timeout: 5000,
    coverage: QUALITY_GATES.coverage,
    performance: {
      maxDuration: 100
    }
  },
  
  integration: {
    pattern: '**/*.integration.test.{ts,tsx}',
    timeout: 10000,
    coverage: {
      lines: 90,
      functions: 90,
      branches: 85,
      statements: 90
    },
    performance: {
      maxDuration: 500
    }
  },
  
  e2e: {
    pattern: '**/*.e2e.test.{ts,tsx}',
    timeout: 30000,
    coverage: {
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80
    },
    performance: {
      maxDuration: 2000
    }
  },
  
  visual: {
    pattern: '**/*Visual*.test.{ts,tsx}',
    timeout: 15000,
    requirements: {
      visualRegression: true,
      accessibility: QUALITY_GATES.accessibility
    }
  },
  
  performance: {
    pattern: '**/*Performance*.test.{ts,tsx}',
    timeout: 20000,
    requirements: QUALITY_GATES.performance
  }
};

// Linting error categories and their fixes
export const LINTING_ERROR_CATEGORIES = {
  'no-unused-vars': {
    severity: 'error',
    autoFixable: true,
    testRequired: true,
    description: 'Variables must be used in component logic or tests'
  },
  
  'no-explicit-any': {
    severity: 'error',
    autoFixable: false,
    testRequired: true,
    description: 'Replace any types with proper TypeScript interfaces'
  },
  
  'react-hooks/exhaustive-deps': {
    severity: 'warning',
    autoFixable: false,
    testRequired: true,
    description: 'React hooks must include all dependencies'
  },
  
  'react-refresh/only-export-components': {
    severity: 'warning',
    autoFixable: false,
    testRequired: false,
    description: 'Components should be the only exports for hot reload'
  }
};

// Test data templates
export const TEST_DATA_TEMPLATES = {
  chatMessage: {
    id: 'test-message-{timestamp}',
    content: 'Test message content',
    timestamp: '{timestamp}',
    sender: 'user',
    isTyping: false,
    error: false
  },
  
  avatarProps: {
    position: [0, 0, 0] as [number, number, number],
    isSpeaking: false,
    userIsTyping: false,
    movementIntensity: 'subtle' as const
  },
  
  contextData: {
    system: {
      avatarPersonality: {
        traits: {
          empathy: 0.8,
          curiosity: 0.7,
          patience: 0.9,
          humor: 'gentle' as const,
          supportiveness: 0.8,
          formality: 0.3,
          enthusiasm: 0.6
        }
      }
    }
  }
};

// Test environment setup
export const TEST_ENVIRONMENT = {
  jsdom: {
    url: 'http://localhost:3000',
    pretendToBeVisual: true,
    resources: 'usable'
  },
  
  globals: {
    IS_REACT_ACT_ENVIRONMENT: true,
    __DEV__: true
  },
  
  setupFiles: [
    './src/setupTests.ts',
    './src/test-utils/phase3-test-setup.ts'
  ],
  
  testMatch: [
    '**/*.(test|spec).{js,jsx,ts,tsx}'
  ],
  
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub'
  }
};

// Performance benchmarks
export const PERFORMANCE_BENCHMARKS = {
  componentRender: {
    Avatar: { maxTime: 16, baseline: 8 },
    ChatInterface: { maxTime: 20, baseline: 12 },
    ThreeDRoom: { maxTime: 50, baseline: 30 }
  },
  
  hookExecution: {
    useAvatar: { maxTime: 5, baseline: 2 },
    useChat: { maxTime: 10, baseline: 5 },
    useRoomModel: { maxTime: 15, baseline: 8 }
  },
  
  serviceOperations: {
    contextManager: { maxTime: 100, baseline: 50 },
    memorySystem: { maxTime: 50, baseline: 25 },
    emotionalIntelligence: { maxTime: 75, baseline: 40 }
  }
};

// Type safety validation rules
export const TYPE_SAFETY_RULES = {
  interfaces: {
    required: [
      'ChatMessage',
      'Context',
      'ContextAnalysis',
      'AvatarProps',
      'ServiceInterface'
    ],
    validation: {
      noAnyTypes: true,
      strictNullChecks: true,
      noImplicitReturns: true
    }
  },
  
  serviceContracts: {
    IContextManager: {
      methods: ['processMessage', 'analyzeContext', 'clearSession'],
      properties: ['name', 'version'],
      returnTypes: ['Promise<Context>', 'ContextAnalysis', 'void']
    },
    
    IMemorySystem: {
      methods: ['processMessage', 'getRelevantMemories', 'clearMemory'],
      properties: ['shortTermMemory', 'longTermMemory', 'workingMemory'],
      returnTypes: ['Promise<void>', 'Promise<RelevantMemoryResult>', 'Promise<void>']
    }
  }
};

// Error handling test scenarios
export const ERROR_SCENARIOS = {
  componentErrors: [
    {
      name: 'Render Error',
      trigger: 'throw new Error("Render failed")',
      expectedRecovery: 'error boundary fallback',
      testRequired: true
    },
    {
      name: 'Hook Error',
      trigger: 'invalid hook call',
      expectedRecovery: 'component unmount',
      testRequired: true
    }
  ],
  
  serviceErrors: [
    {
      name: 'API Error',
      trigger: 'network failure',
      expectedRecovery: 'retry mechanism',
      testRequired: true
    },
    {
      name: 'Memory Error',
      trigger: 'out of memory',
      expectedRecovery: 'memory cleanup',
      testRequired: true
    }
  ],
  
  userErrors: [
    {
      name: 'Invalid Input',
      trigger: 'malformed user input',
      expectedRecovery: 'input validation',
      testRequired: true
    }
  ]
};

// Test reporting configuration
export const TEST_REPORTING = {
  coverage: {
    reporter: ['text', 'html', 'lcov', 'json'],
    reportDir: 'coverage',
    exclude: [
      'node_modules/',
      'dist/',
      '**/*.d.ts',
      '**/*.test.{ts,tsx}',
      '**/test-utils/**'
    ]
  },
  
  performance: {
    reporter: 'json',
    outputFile: 'performance-report.json',
    includeBaseline: true,
    trackRegression: true
  },
  
  accessibility: {
    reporter: 'json',
    outputFile: 'accessibility-report.json',
    includeWCAG: true,
    trackViolations: true
  }
};

// Phase 3 specific test utilities
export const PHASE3_TEST_UTILS = {
  lintingFixes: {
    unusedVars: {
      strategy: 'test-coverage',
      implementation: 'create tests that use variables'
    },
    
    anyTypes: {
      strategy: 'type-replacement',
      implementation: 'replace with proper TypeScript interfaces'
    },
    
    hookDeps: {
      strategy: 'dependency-analysis',
      implementation: 'add missing dependencies or remove unused ones'
    }
  },
  
  performanceOptimization: {
    reactMemo: {
      candidates: ['Avatar', 'ChatInterface', 'ThreeDRoom'],
      criteria: 'expensive render operations'
    },
    
    useCallback: {
      candidates: ['event handlers', 'effect dependencies'],
      criteria: 'function recreated on every render'
    },
    
    useMemo: {
      candidates: ['computed values', 'expensive calculations'],
      criteria: 'expensive computation on every render'
    }
  }
};

export default {
  QUALITY_GATES,
  TEST_CATEGORIES,
  LINTING_ERROR_CATEGORIES,
  TEST_DATA_TEMPLATES,
  TEST_ENVIRONMENT,
  PERFORMANCE_BENCHMARKS,
  TYPE_SAFETY_RULES,
  ERROR_SCENARIOS,
  TEST_REPORTING,
  PHASE3_TEST_UTILS
}; 