import request from 'supertest';
import express from 'express';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock OpenAI
const mockOpenAI = {
  chat: {
    completions: {
      create: vi.fn(),
    },
  },
};

vi.mock('openai', () => ({
  default: vi.fn(() => mockOpenAI),
}));

// Import the app after mocking
let app: express.Application;

describe('Backend API', () => {
  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Set environment variables for testing
    process.env.OPENAI_API_KEY = 'test-api-key';
    
    // Dynamically import the app to ensure mocks are applied
    const appModule = await import('../index');
    app = appModule.default || appModule;
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'OK',
        message: '3DAvatar Backend is running'
      });
    });
  });

  describe('POST /api/chat', () => {
    it('should return a successful chat response', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Hello! How can I help you today?'
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'Hello' })
        .expect(200);

      expect(response.body).toHaveProperty('response', 'Hello! How can I help you today?');
      expect(response.body).toHaveProperty('timestamp');
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant in a 3D virtual room. Keep responses concise and friendly.'
          },
          {
            role: 'user',
            content: 'Hello'
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
      });
    });

    it('should return 400 when message is missing', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        error: 'Message is required'
      });
    });

    it('should return 500 when OpenAI API key is not configured', async () => {
      delete process.env.OPENAI_API_KEY;
      
      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'Hello' })
        .expect(500);

      expect(response.body).toEqual({
        error: 'OpenAI API key not configured'
      });
    });

    it('should handle OpenAI API errors', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Error'));

      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'Hello' })
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to process chat request');
      expect(response.body).toHaveProperty('details', 'API Error');
    });

    it('should handle empty response from OpenAI', async () => {
      const mockResponse = {
        choices: []
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'Hello' })
        .expect(200);

      expect(response.body).toHaveProperty('response', 'Sorry, I could not generate a response.');
    });
  });
}); 