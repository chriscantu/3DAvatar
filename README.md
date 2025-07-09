# 3DAvatar

A 3D virtual room with an AI-powered avatar that you can chat with using text or voice. Built with React, Three.js, and OpenAI API.

## 🚀 Features

- **3D Room**: Immersive 3D environment built with Three.js
- **AI Avatar**: Simple humanoid avatar powered by OpenAI
- **Dual Chat Interface**: Text and voice chat capabilities
- **Real-time Interaction**: Avatar responds with text-to-speech
- **Secure Backend**: Node.js/Express API proxy for OpenAI requests
- **Child Voice**: Configured with child-like voice characteristics
- **Co-located Tests**: Modern test structure for better maintainability

## 🏗️ Architecture

```
3DAvatar/
├── apps/
│   ├── frontend/     # React + Three.js application
│   └── backend/      # Node.js/Express API
├── packages/         # Shared utilities (if needed)
└── docs/            # Documentation
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework with TypeScript
- **Three.js** - 3D graphics library
- **Vite** - Build tool and dev server
- **Web Speech API** - Voice input and text-to-speech
- **Vitest** - Testing framework

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **OpenAI SDK** - AI integration
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment configuration

### Testing
- **Vitest** - Unit testing framework
- **React Testing Library** - Component testing
- **Playwright** - End-to-end testing
- **Co-located Tests** - Tests alongside source files

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/chriscantu/3DAvatar.git
cd 3DAvatar
```

### 2. Install dependencies
```bash
# Install all dependencies from root
npm install
```

### 3. Set up environment variables
```bash
# In apps/backend/.env
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Start development servers
```bash
# Start both frontend and backend concurrently
npm run dev

# Frontend: http://localhost:5173
# Backend: http://localhost:3001
```

## 🧪 Testing

### Current Test Status
- **Test Files**: 19 total (17 failed, 2 passed)
- **Test Cases**: 114 total (35 failed, 79 passed)
- **Structure**: Co-located tests for better maintainability
- **ESLint Issues**: Reduced from 78 to 43 problems

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run frontend tests only
cd apps/frontend && npm test

# Run backend tests only
cd apps/backend && npm test
```

### End-to-End Tests
```bash
# Run e2e tests
npm run test:e2e
```

## 🚀 Deployment

### Vercel Deployment (Configured)
The project is configured for Vercel deployment with:
- Automatic frontend/backend builds
- Environment variable configuration
- Static file serving
- API route handling

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard:
   - `OPENAI_API_KEY`: Your OpenAI API key
3. Deploy automatically on push to main branch

## 📚 Documentation

### Core Documentation
- **[Architecture Guide](./ARCHITECTURE.md)** - System architecture and technical design
- **[Design Guidelines](./DESIGN.md)** - UI/UX design principles and patterns
- **[Implementation Guide](./IMPLEMENTATION.md)** - Development best practices and current status
- **[Testing Strategy](./TESTING.md)** - Testing approach and guidelines
- **[Deployment Guide](./DEPLOYMENT.md)** - Deployment instructions and configuration

### Current Implementation Status

#### ✅ Completed Features
- **Monorepo Structure**: Clean separation between frontend and backend
- **3D Avatar Visualization**: Three.js-based avatar with breathing animations
- **Chat Interface**: Real-time chat with AI responses
- **Text-to-Speech Integration**: Child voice characteristics with Web Speech API
- **API Communication**: Working backend API with proper error handling
- **Test Infrastructure**: Co-located test files following modern best practices
- **Development Environment**: Concurrent frontend/backend development with hot reload

#### 🔄 In Progress
- **Test Reliability**: Fixing remaining test failures and import issues
- **Performance Optimization**: 3D rendering and component optimization
- **Security Measures**: Rate limiting and input validation
- **Monitoring**: Comprehensive error tracking and metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Use co-located test structure
- Follow existing code patterns
- Update documentation as needed

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🙏 Acknowledgments

- Three.js community for 3D graphics
- OpenAI for AI capabilities
- React team for the amazing framework
- Vite for fast development experience 