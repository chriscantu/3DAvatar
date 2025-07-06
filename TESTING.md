# Testing Documentation

This document outlines the testing strategy and setup for the 3DAvatar project.

## Testing Strategy

Our testing approach follows a three-tier strategy:

1. **Unit Tests** - Test individual components and functions in isolation
2. **Integration Tests** - Test how components work together
3. **End-to-End Tests** - Test complete user workflows

## Test Structure

```
3DAvatar/
├── apps/
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   └── __tests__/
│   │   │   │       ├── ThreeDRoom.test.tsx
│   │   │   │       ├── Avatar.test.tsx
│   │   │   │       └── ChatInterface.test.tsx
│   │   │   └── setupTests.ts
│   │   └── vite.config.ts
│   └── backend/
│       ├── src/
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

#### ThreeDRoom Component
- ✅ Renders without crashing
- ✅ Displays 3D canvas with proper styling
- ✅ Includes OrbitControls for camera interaction
- ✅ Renders Avatar component within the room
- ✅ Has correct container structure

#### Avatar Component
- ✅ Renders without crashing
- ✅ Handles position props correctly
- ✅ Manages speaking state animations
- ✅ Sets up animation frame callbacks
- ✅ Renders all dog body parts
- ✅ Handles animation state changes

#### ChatInterface Component (Planned)
- 🔄 Text input and message display
- 🔄 Send messages with Enter key
- 🔄 Display conversation history
- 🔄 Handle API errors gracefully
- 🔄 Show loading states
- 🔄 Voice input functionality
- 🔄 Speech-to-text conversion
- 🔄 Text-to-speech for responses
- 🔄 Avatar animation integration

### Backend API

#### Core Endpoints
- ✅ Health check endpoint
- ✅ Chat endpoint with OpenAI integration
- ✅ Request validation
- ✅ Error handling
- ✅ Environment configuration

#### Error Scenarios
- ✅ Missing API key configuration
- ✅ OpenAI API errors
- ✅ Invalid request data
- ✅ Empty responses from OpenAI

### End-to-End Tests

#### User Interactions
- 🔄 3D room loading
- 🔄 Chat interface display
- 🔄 Text message sending and receiving
- 🔄 Voice input functionality
- 🔄 Avatar animations during chat
- 🔄 Error handling in UI
- 🔄 Conversation history persistence

## Test Utilities and Mocks

### Frontend Mocks
- **Three.js**: Mocked for component testing
- **@react-three/fiber**: Canvas and useFrame mocked
- **@react-three/drei**: OrbitControls mocked
- **Web APIs**: SpeechRecognition and speechSynthesis mocked

### Backend Mocks
- **OpenAI API**: Complete mock implementation
- **Environment variables**: Test-specific configuration
- **Express app**: Supertest integration

## Test Data and Fixtures

### Chat Messages
```typescript
const mockChatMessages = [
  { role: 'user', content: 'Hello' },
  { role: 'assistant', content: 'Hi there! How can I help you?' }
];
```

### Avatar States
```typescript
const avatarStates = {
  idle: { isSpeaking: false, animation: 'breathing' },
  speaking: { isSpeaking: true, animation: 'talking' }
};
```

## Continuous Integration

### GitHub Actions (Planned)
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

## Testing Best Practices

1. **Test Naming**: Use descriptive test names that explain the expected behavior
2. **Test Structure**: Follow Arrange-Act-Assert pattern
3. **Mocking**: Mock external dependencies and APIs
4. **Coverage**: Aim for 80%+ test coverage
5. **Isolation**: Each test should be independent
6. **Performance**: Keep tests fast and focused

## Future Test Enhancements

- [ ] Visual regression testing for 3D scenes
- [ ] Performance testing for Three.js rendering
- [ ] Accessibility testing for chat interface
- [ ] Mobile device testing
- [ ] Voice recognition accuracy testing
- [ ] Load testing for backend API
- [ ] Security testing for API endpoints

## Troubleshooting

### Common Issues

1. **Three.js Tests Failing**: Ensure proper mocking in setupTests.ts
2. **API Tests Timing Out**: Check mock configurations and async handling
3. **E2E Tests Flaky**: Increase timeouts and add proper wait conditions
4. **Coverage Not Generating**: Verify test configuration and file paths

### Debug Commands
```bash
# Run tests with debug output
npm run test:frontend -- --reporter=verbose

# Run specific test file
npm run test:frontend -- Avatar.test.tsx

# Run e2e tests with debug
npx playwright test --debug
```

## Legend
- ✅ Implemented and passing
- 🔄 Planned/In progress
- ❌ Failed/Needs attention
- 📋 Placeholder/Template 