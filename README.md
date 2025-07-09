# 3DAvatar

A 3D virtual room with an AI-powered avatar that you can chat with using text or voice. Built with React, Three.js, and OpenAI API.

## 🚀 Features

- **3D Room**: Immersive 3D environment built with Three.js
- **AI Avatar**: Simple humanoid avatar powered by OpenAI
- **Dual Chat Interface**: Text and voice chat capabilities
- **Real-time Interaction**: Avatar responds with text-to-speech
- **Secure Backend**: Node.js/Express API proxy for OpenAI requests

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
- **React** - UI framework
- **Three.js** - 3D graphics library
- **Vite** - Build tool and dev server
- **Speech Recognition** - Voice input
- **Speech Synthesis** - Text-to-speech

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **OpenAI SDK** - AI integration
- **CORS** - Cross-origin resource sharing

### Testing
- **Jest** - Unit testing
- **React Testing Library** - Component testing
- **Playwright** - End-to-end testing

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/3DAvatar.git
cd 3DAvatar
```

### 2. Install dependencies
```bash
# Install frontend dependencies
cd apps/frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 3. Set up environment variables
```bash
# In apps/backend/.env
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Start development servers
```bash
# Start backend (from apps/backend)
npm run dev

# Start frontend (from apps/frontend)
npm run dev
```

## 🧪 Testing

### Avatar Testing Framework
The project uses a declarative testing approach focused on observable behavior:

```bash
# Run avatar behavioral tests
npm run test:avatar:visual      # Visual behavior tests
npm run test:avatar:performance # Performance behavior tests
npm run test:avatar:behavioral  # Behavioral state tests
npm run test:avatar:full        # All avatar tests
```

**Testing Documentation:**
- **[Avatar Testing Implementation Plan](./AVATAR_TESTING_IMPLEMENTATION_PLAN.md)** - Testing strategy and approach
- **[Avatar Testing Usage Guide](./AVATAR_TESTING_USAGE_GUIDE.md)** - Practical testing instructions

### Unit Tests
```bash
# Frontend tests
cd apps/frontend
npm test

# Backend tests
cd apps/backend
npm test
```

### End-to-End Tests
```bash
# Run e2e tests
npm run test:e2e
```

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy both frontend and backend

## 📚 Documentation

### Core Documentation
- **[Architecture Guide](./ARCHITECTURE.md)** - System architecture and technical design
- **[Design Guidelines](./DESIGN.md)** - UI/UX design principles and patterns
- **[Implementation Guide](./IMPLEMENTATION.md)** - Development best practices and standards
- **[Testing Strategy](./TESTING.md)** - Testing approach and guidelines
- **[Deployment Guide](./DEPLOYMENT.md)** - Deployment instructions and configuration

### Phase 2 Services
Advanced AI services for enhanced user experience:
- **[Phase 2 Quick Reference](./docs/PHASE2_QUICK_REFERENCE.md)** - Essential commands and configurations

**Phase 2 Services:**
- 🧠 **Emotional Intelligence** - Emotion detection and empathetic responses
- 🗜️ **Context Compression** - Intelligent conversation summarization
- 📊 **Feedback Collection** - Analytics and improvement recommendations
- ✅ **Context Validation** - Data integrity and health monitoring

**Status:** Production Ready ✅ (148/151 tests passing - 98% coverage)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🙏 Acknowledgments

- Three.js community for 3D graphics
- OpenAI for AI capabilities
- React team for the amazing framework 