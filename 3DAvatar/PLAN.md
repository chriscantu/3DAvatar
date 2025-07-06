# 3DAvatar Project Plan

## Overview
Build a 3D room in React using Three.js, featuring a simple humanoid avatar that users can chat with via text or voice. The avatar is powered by the OpenAI API, with a secure backend proxy. The project will include unit and end-to-end tests, and be deployable on Vercel.

---

## Clarified Requirements
- **Frontend**: React
- **3D Engine**: Three.js
- **Avatar**: Simple 3D humanoid (procedural/basic mesh)
- **Chat Interface**: Text box and voice chat (speech-to-text, text-to-speech)
- **OpenAI API Key**: Provided via environment variable/config file
- **Backend**: Node.js/Express (API proxy)
- **Deployment**: Vercel
- **Testing**: Unit and e2e tests

---

## Step-by-Step Plan

### 1. Project Setup
- [ ] Initialize monorepo or folder structure for frontend (React) and backend (Node.js/Express)
- [ ] Add dependencies:
  - Frontend: React, Three.js, speech-to-text, text-to-speech, axios/fetch
  - Backend: Express, OpenAI SDK, dotenv, CORS
  - Testing: Jest, React Testing Library, Playwright/Cypress

### 2. 3D Room (Frontend)
- [ ] Set up Three.js canvas in React
- [ ] Build a simple 3D room (walls, floor, lighting)

### 3. Avatar (Frontend)
- [ ] Create a simple humanoid avatar using Three.js primitives
- [ ] Place the avatar in the room

### 4. Chat UI (Frontend)
- [ ] Implement chat overlay (text input, message display)
- [ ] Add voice input (speech-to-text)
- [ ] Add text-to-speech for avatar responses

### 5. Backend (Node.js/Express)
- [ ] Set up API endpoint to proxy chat messages to OpenAI
- [ ] Secure endpoint with API key from environment variables

### 6. OpenAI Integration
- [ ] Connect frontend chat UI to backend API
- [ ] Display responses in chat and trigger avatar speech/animation

### 7. Avatar Animation
- [ ] Animate avatar (mouth movement, gestures) when speaking/responding

### 8. Testing
- [ ] **Unit Tests**: React components, backend API, utilities
- [ ] **E2E Tests**: Simulate user chatting (text/voice), verify responses/UI updates

### 9. Deployment
- [ ] Configure Vercel for frontend and backend
- [ ] Add environment variable instructions for OpenAI API key

### 10. Documentation
- [ ] Write README with setup, usage, and deployment instructions

---

## Notes
- Prioritize code readability and maintainability
- Use a highly structured, step-by-step process for all code changes
- Document all major changes and architectural decisions 