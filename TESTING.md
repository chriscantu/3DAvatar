# Testing Documentation

This document outlines the testing strategy and setup for the 3DAvatar project.

## Testing Strategy

Our testing approach follows a three-tier strategy:

1. **Unit Tests** - Test individual components and functions in isolation
2. **Integration Tests** - Test how components work together
3. **End-to-End Tests** - Test complete user workflows

## Current Test Status

### Test Metrics
- **Test Files**: 19 total (17 failed, 2 passed)
- **Test Cases**: 114 total (35 failed, 79 passed)
- **Structure**: Co-located tests for better maintainability
- **ESLint Issues**: Reduced from 78 to 43 problems

### Test Structure (Co-located)

```
3DAvatar/
├── apps/
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Avatar.tsx
│   │   │   │   ├── Avatar.test.tsx
│   │   │   │   ├── Avatar.behavioral.test.tsx
│   │   │   │   ├── Avatar.performance.test.tsx
│   │   │   │   ├── Avatar.visual.test.tsx
│   │   │   │   ├── ChatInterface.tsx
│   │   │   │   ├── ChatInterface.test.tsx
│   │   │   │   ├── ThreeDRoom.tsx
│   │   │   │   ├── ThreeDRoom.test.tsx
│   │   │   │   └── ThreeDRoom.camera.test.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useChat.ts
│   │   │   │   ├── useChat.test.ts
│   │   │   │   ├── useAvatar.ts
│   │   │   │   └── useAvatar.test.ts
│   │   │   ├── services/
│   │   │   │   ├── textToSpeechService.ts
│   │   │   │   ├── breathingController.ts
│   │   │   │   └── breathingController.test.ts
│   │   │   ├── config/
│   │   │   │   ├── avatarPersonality.ts
│   │   │   │   └── avatarPersonality.test.ts
│   │   │   └── test-utils/
│   │   │       ├── 3d-testing-utils.ts
│   │   │       ├── enhanced-three-mocks.ts
│   │   │       └── phase3-test-config.ts
│   │   └── vitest.config.ts
│   └── backend/
│       ├── src/
│       │   ├── index.ts
│       │   └── __tests__/
│       │       ├── setup.ts
│       │       └── index.test.ts
│       └── vitest.config.ts
├── tests/
│   └── e2e/
│       └── chat-interaction.spec.ts
├── playwright.config.ts
└── TESTING.md
```

## Running Tests

### Frontend Tests
```bash
# Run all frontend tests
npm run test:frontend

# Run tests in watch mode
cd apps/frontend && npm run test

# Run tests with UI
cd apps/frontend && npm run test:ui

# Run tests with coverage
cd apps/frontend && npm run test:coverage
```

### Backend Tests
```bash
# Run all backend tests
npm run test:backend

# Run tests in watch mode
cd apps/backend && npm run test:watch

# Run tests with coverage
cd apps/backend && npm run test:coverage
```

### End-to-End Tests
```bash
# Run all e2e tests
npm run test:e2e

# Run e2e tests with UI
npx playwright test --ui

# Run e2e tests for specific browser
npx playwright test --project=chromium
```

### All Tests
```bash
# Run all tests (unit, integration, e2e)
npm run test:all

# Run unit tests in watch mode
npm run test:watch

# Run all tests with coverage
npm run test:coverage
```

## Test Coverage

### Frontend Components

#### ✅ ThreeDRoom Component
- [x] Renders without crashing
- [x] Displays 3D canvas with proper styling
- [x] Includes OrbitControls for camera interaction
- [x] Renders Avatar component within the room
- [x] Has correct container structure
- [x] Camera controls and positioning

#### ✅ Avatar Component
- [x] Renders without crashing
- [x] Handles position props correctly
- [x] Manages speaking state animations
- [x] Sets up animation frame callbacks
- [x] Renders all avatar body parts
- [x] Handles animation state changes
- [x] Breathing animation system
- [x] Performance optimization tests
- [x] Visual behavior validation

#### ✅ ChatInterface Component
- [x] Text input and message display
- [x] Send messages with Enter key
- [x] Display conversation history
- [x] Handle API errors gracefully
- [x] Show loading states
- [x] Voice input functionality
- [x] Speech-to-text conversion
- [x] Text-to-speech for responses
- [x] Avatar animation integration

#### ✅ Hooks
- [x] useChat hook functionality
- [x] useAvatar hook behavior
- [x] useRoomModel hook testing
- [x] TTS integration testing

#### ✅ Services
- [x] Text-to-speech service
- [x] Breathing controller
- [x] Avatar personality configuration
- [x] Room constants validation

### Backend API

#### ✅ Core Endpoints
- [x] Health check endpoint
- [x] Chat endpoint with OpenAI integration
- [x] Request validation
- [x] Error handling
- [x] Environment configuration

#### ✅ Error Scenarios
- [x] Missing API key configuration
- [x] OpenAI API errors
- [x] Invalid request data
- [x] Empty responses from OpenAI

### 🔄 End-to-End Tests (In Progress)

#### User Interactions
- [x] 3D room loading
- [x] Chat interface display
- [x] Text message sending and receiving
- [ ] Voice input functionality (browser dependent)
- [x] Avatar animations during chat
- [x] Error handling in UI
- [ ] Conversation history persistence

## Test Utilities and Mocks

### Frontend Mocks
- **Three.js**: Enhanced mocks for component testing
- **@react-three/fiber**: Canvas and useFrame mocked
- **@react-three/drei**: OrbitControls mocked
- **Web APIs**: SpeechRecognition and speechSynthesis mocked
- **Custom 3D Testing Utils**: Specialized utilities for 3D component testing

### Backend Mocks
- **OpenAI API**: Complete mock implementation
- **Environment variables**: Test-specific configuration
- **Express app**: Supertest integration

## Test Configuration

### Vitest Configuration
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    globals: true,
    coverage: {
      reporter: ['text', 'json', 'html']
    }
  }
});
```

### Test Setup
```typescript
// setupTests.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Three.js
vi.mock('three', () => ({
  // Three.js mocks
}));

// Mock Web Speech API
Object.defineProperty(window, 'speechSynthesis', {
  value: mockSpeechSynthesis
});
```

## Known Issues and Solutions

### Current Test Failures
1. **Import Path Issues**: Some tests have incorrect import paths after co-location
2. **Three.js Mocking**: Complex 3D components require enhanced mocking
3. **Async Test Handling**: Some async operations need better timeout handling

### Solutions in Progress
- Fixing import paths with proper relative imports
- Enhancing Three.js mocks for better component testing
- Improving async test patterns and timeout handling

## Testing Best Practices

### Component Testing
- Use co-located test files for better maintainability
- Test user interactions, not implementation details
- Mock external dependencies appropriately
- Use descriptive test names and organize with describe blocks

### Service Testing
- Test all public methods and edge cases
- Mock external APIs and dependencies
- Test error handling scenarios
- Validate return types and data structures

### Integration Testing
- Test component interactions
- Validate data flow between services
- Test error propagation and handling
- Verify API contract compliance

## Continuous Integration

### GitHub Actions
- Run all tests on pull requests
- Generate coverage reports
- Run e2e tests in multiple browsers
- Deploy preview environments for testing

### Test Commands in CI
```yaml
- name: Run Frontend Tests
  run: npm run test:frontend
  
- name: Run Backend Tests
  run: npm run test:backend
  
- name: Run E2E Tests
  run: npm run test:e2e
```

## Future Improvements

### Planned Enhancements
- [ ] Increase test coverage to 95%+
- [ ] Add visual regression testing
- [ ] Implement performance benchmarking
- [ ] Add accessibility testing
- [ ] Enhance error boundary testing
- [ ] Add more comprehensive e2e scenarios 