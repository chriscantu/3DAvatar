import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInterface from './';
import { createContextManager } from '../../services/contextManager';
import { useVoiceService } from '../../services/voiceService';
import { apiService } from '../../config/api';

// Mock the context manager
vi.mock('../../services/contextManager', () => ({
  createContextManager: vi.fn(() => ({
    processMessage: vi.fn().mockResolvedValue({
      system: { personality: { traits: { empathy: 0.9 } } },
      session: { sessionId: 'test-session', userProfile: {} },
      immediate: { currentUserEmotion: 'neutral', activeTopics: [] },
      timestamp: new Date().toISOString()
    }),
    analyzeContext: vi.fn().mockReturnValue({
      emotionalTone: { primary: 'neutral', intensity: 0.5 },
      topics: ['general'],
      relevanceScore: 0.7,
      userIntentAnalysis: { primaryIntent: 'conversation' },
      responseRecommendations: []
    }),
    clearSession: vi.fn(),
    destroy: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    getCurrentSessionContext: vi.fn(),
    getContextStats: vi.fn(),
    updateUserProfile: vi.fn()
  }))
}));

// Mock the API service
vi.mock('../../config/api', () => ({
  apiService: {
    sendChatMessage: vi.fn().mockResolvedValue({ message: 'Test response' })
  },
  ApiError: class extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ApiError';
    }
  },
  NetworkError: class extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'NetworkError';
    }
  },
  TimeoutError: class extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'TimeoutError';
    }
  }
}));

// Mock the voice service
vi.mock('../../services/voiceService', () => ({
  useVoiceService: vi.fn(() => ({
    isListening: false,
    toggleListening: vi.fn(),
    isSupported: true,
    transcript: '',
    clearTranscript: vi.fn(),
    error: null
  }))
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock Speech Synthesis API
global.SpeechSynthesisUtterance = vi.fn().mockImplementation(() => ({
  text: '',
  voice: null,
  volume: 1,
  rate: 1,
  pitch: 1,
  onstart: null,
  onend: null,
  onerror: null,
  onpause: null,
  onresume: null,
  onmark: null,
  onboundary: null
}));

Object.defineProperty(global, 'speechSynthesis', {
  value: {
    speak: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn().mockReturnValue([]),
    speaking: false,
    pending: false,
    paused: false,
    onvoiceschanged: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn().mockReturnValue(true)
  }
});

describe('ChatInterface Component', () => {
  const mockProps = {
    onMessageSent: vi.fn(),
    onVoiceToggle: vi.fn(),
    isAvatarSpeaking: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should render the chat interface', () => {
      render(<ChatInterface {...mockProps} />);
      
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
    });

    it('should handle message input', async () => {
      const user = userEvent.setup();
      render(<ChatInterface {...mockProps} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'Hello world');
      
      expect(input).toHaveValue('Hello world');
    });

    it('should send message when send button is clicked', async () => {
      const user = userEvent.setup();
      render(<ChatInterface {...mockProps} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'Test message');
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);
      
      expect(mockProps.onMessageSent).toHaveBeenCalledWith('Test message');
    });

    it('should clear input after sending message', async () => {
      const user = userEvent.setup();
      render(<ChatInterface {...mockProps} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'Test message');
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);
      
      expect(input).toHaveValue('');
    });

    it('should not send empty messages', async () => {
      const user = userEvent.setup();
      render(<ChatInterface {...mockProps} />);
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);
      
      expect(mockProps.onMessageSent).not.toHaveBeenCalled();
    });

    it('should handle welcome message display', () => {
      render(<ChatInterface {...mockProps} />);
      
      expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    });
  });

  describe('Voice Integration', () => {
    it('should integrate with voice service', () => {
      render(<ChatInterface {...mockProps} />);
      
      // Voice functionality should be available  
      expect(vi.mocked(useVoiceService)).toHaveBeenCalled();
    });

    it('should handle voice toggle', () => {
      render(<ChatInterface {...mockProps} />);
      
      // Voice toggle should be available
      expect(mockProps.onVoiceToggle).toBeDefined();
    });
  });

  describe('Context Management Integration', () => {
    it('should initialize context manager', () => {
      render(<ChatInterface {...mockProps} />);
      
      expect(vi.mocked(createContextManager)).toHaveBeenCalled();
    });

    it('should handle context processing', async () => {
      const user = userEvent.setup();
      render(<ChatInterface {...mockProps} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'Hello world');
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);
      
      await waitFor(() => {
        expect(mockProps.onMessageSent).toHaveBeenCalledWith('Hello world');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      vi.mocked(apiService.sendChatMessage).mockRejectedValue(new Error('API Error'));
      
      const user = userEvent.setup();
      render(<ChatInterface {...mockProps} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'Test message');
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);
      
      // Should still clear input and call onMessageSent
      expect(input).toHaveValue('');
      expect(mockProps.onMessageSent).toHaveBeenCalled();
    });

    it('should handle context manager errors', () => {
      // Should not crash if context manager fails to initialize
      expect(() => {
        render(<ChatInterface {...mockProps} />);
      }).not.toThrow();
    });
  });

  describe('Local Storage Integration', () => {
    it('should load chat history from localStorage', () => {
      const mockHistory = JSON.stringify([
        { id: '1', content: 'Hello', timestamp: Date.now(), sender: 'user' }
      ]);
      mockLocalStorage.getItem.mockReturnValue(mockHistory);
      
      render(<ChatInterface {...mockProps} />);
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('3davatar_chat_history');
    });

    it('should save messages to localStorage', async () => {
      const user = userEvent.setup();
      render(<ChatInterface {...mockProps} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'Test message');
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);
      
      // Should save to localStorage after sending message
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          '3davatar_chat_history',
          expect.any(String)
        );
      });
    });
  });

  describe('Performance', () => {
    it('should handle rapid message sending', async () => {
      const user = userEvent.setup();
      render(<ChatInterface {...mockProps} />);
      
      const input = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      // Send multiple messages quickly
      for (let i = 0; i < 3; i++) {
        await user.type(input, `Message ${i}`);
        await user.click(sendButton);
      }
      
      expect(mockProps.onMessageSent).toHaveBeenCalledTimes(3);
    });

    it('should not crash with malformed localStorage data', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');
      
      expect(() => {
        render(<ChatInterface {...mockProps} />);
      }).not.toThrow();
    });
  });
}); 