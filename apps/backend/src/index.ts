import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '3DAvatar Backend is running'
  });
});

// Chat endpoint
app.post('/api/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    if (!process.env.OPENAI_API_KEY) {
      res.status(500).json({ error: 'OpenAI API key not configured' });
      return;
    }

    if (!openai) {
      res.status(500).json({ error: 'OpenAI client not initialized' });
      return;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant in a 3D virtual room. Keep responses concise and friendly.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    res.json({
      response: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({
      error: 'Failed to process chat request',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 3DAvatar Backend server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
  });
}

export default app; 