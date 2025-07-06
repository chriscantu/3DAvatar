# 3DAvatar Deployment Guide

## Deploying to Vercel

This guide will help you deploy the 3DAvatar application to Vercel.

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **OpenAI API Key**: Get your API key from [OpenAI](https://platform.openai.com/api-keys)
3. **Git Repository**: Push your code to GitHub, GitLab, or Bitbucket

### Step 1: Prepare Your Repository

1. Make sure all your code is committed and pushed to your Git repository
2. Ensure the `vercel.json` file is in your project root
3. Verify that your frontend build works locally:
   ```bash
   cd apps/frontend
   npm run build
   ```

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository
4. Vercel will automatically detect the project settings
5. Configure environment variables (see Step 3)
6. Click "Deploy"

#### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from project root:
   ```bash
   vercel
   ```

4. Follow the prompts to configure your project

### Step 3: Configure Environment Variables

In your Vercel project settings, add the following environment variables:

1. **OPENAI_API_KEY** (required)
   - Value: Your OpenAI API key
   - Used by: Backend API

2. **VITE_API_URL** (optional)
   - Value: Your custom API URL (if different from default)
   - Used by: Frontend

### Step 4: Configure Custom Domain (Optional)

1. In your Vercel project dashboard, go to "Settings" → "Domains"
2. Add your custom domain
3. Follow Vercel's instructions to configure DNS

### Step 5: Verify Deployment

1. Open your deployed URL
2. Test the 3D room loads correctly
3. Test the chat functionality
4. Test voice features (if supported by browser)

### Project Structure for Vercel

```
3DAvatar/
├── vercel.json              # Vercel configuration
├── apps/
│   ├── frontend/            # React frontend
│   │   ├── dist/           # Build output
│   │   └── package.json
│   └── backend/             # Node.js backend
│       ├── src/
│       │   └── index.ts    # API endpoints
│       └── package.json
└── package.json            # Root package.json
```

### Troubleshooting

#### Common Issues

1. **Build Fails**
   - Check that all dependencies are installed
   - Verify TypeScript compilation passes
   - Check for linting errors

2. **API Endpoints Not Working**
   - Verify `vercel.json` routes configuration
   - Check environment variables are set
   - Review function logs in Vercel dashboard

3. **Frontend Not Loading**
   - Check build output directory is correct
   - Verify static files are generated
   - Check browser console for errors

4. **Voice Features Not Working**
   - Voice features require HTTPS (automatic on Vercel)
   - Some browsers may require user interaction before enabling microphone
   - Check browser compatibility

#### Vercel-Specific Configuration

The `vercel.json` file handles:
- **Builds**: Configures how frontend and backend are built
- **Routes**: Maps API requests to backend, static files to frontend
- **Environment**: Sets up environment variables
- **Rewrites**: Handles SPA routing

### Performance Optimization

1. **Frontend**
   - Vite automatically optimizes the build
   - Three.js assets are bundled efficiently
   - CSS is minified and optimized

2. **Backend**
   - Serverless functions auto-scale
   - Cold start optimization via Vercel
   - OpenAI API calls are cached where appropriate

### Monitoring and Logs

1. **Vercel Dashboard**
   - View deployment status
   - Monitor function performance
   - Check real-time logs

2. **Analytics**
   - Enable Vercel Analytics for usage insights
   - Monitor API endpoint performance
   - Track user interactions

### Security Considerations

1. **API Keys**
   - Never commit API keys to version control
   - Use Vercel environment variables
   - Rotate keys regularly

2. **CORS**
   - Backend automatically handles CORS
   - Frontend and backend are on same domain

3. **Rate Limiting**
   - Consider implementing rate limiting for API endpoints
   - Monitor OpenAI API usage

### Scaling

1. **Vercel Pro Features**
   - Increased bandwidth and function execution time
   - Advanced analytics and monitoring
   - Priority support

2. **Performance Monitoring**
   - Use Vercel Analytics
   - Monitor OpenAI API costs
   - Track user engagement metrics

### Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **OpenAI Documentation**: [platform.openai.com/docs](https://platform.openai.com/docs)
- **Project Issues**: Use GitHub issues for bug reports

---

## Local Development

For local development, use:

```bash
# Install dependencies
npm install

# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:frontend
npm run dev:backend
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:3000`. 