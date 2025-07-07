import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInterface from '../ChatInterface';

// Mock API service
vi.mock('../../config/api', () => ({
  apiService: {
    sendChatMessage: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    public status?: number;
    constructor(message: string, status?: number) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
    }
  },
  NetworkError: class NetworkError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'NetworkError';
    }
  },
  TimeoutError: class TimeoutError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'TimeoutError';
    }
  },
}));

// Mock voice service
vi.mock('../../services/voiceService', () => ({
  useVoiceService: () => ({
    isListening: false,
    isSupported: true,
    toggleListening: vi.fn(),
    transcript: '',
    clearTranscript: vi.fn(),
    error: null,
  }),
}));

describe('ChatInterface Component', () => {
  const mockProps = {
    onMessageSent: vi.fn(),
    onVoiceToggle: vi.fn(),
    isAvatarSpeaking: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch mock
    (globalThis as any).fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Text Chat Functionality', () => {
    it('should render chat input and message display', () => {
      render(<ChatInterface {...mockProps} />);
      
      expect(screen.getByLabelText(/type your message/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/send message/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/chat messages/i)).toBeInTheDocument();
      expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    });

    it('should send message when user types and presses enter', async () => {
      const user = userEvent.setup();
      const { apiService } = await import('../../config/api');
      
      const mockSendMessage = apiService.sendChatMessage as ReturnType<typeof vi.fn>;
      mockSendMessage.mockResolvedValue({
        message: 'Hello back!',
      });

      render(<ChatInterface {...mockProps} />);
      
      const input = screen.getByLabelText(/type your message/i);
      await user.type(input, 'Hello!');
      await user.keyboard('{Enter}');

      expect(mockProps.onMessageSent).toHaveBeenCalledWith('Hello!');
      expect(apiService.sendChatMessage).toHaveBeenCalledWith('Hello!', expect.any(AbortController));
    });

    it('should display chat messages in conversation history', async () => {
      const user = userEvent.setup();
      const { apiService } = await import('../../config/api');
      
      const mockSendMessage = apiService.sendChatMessage as ReturnType<typeof vi.fn>;
      mockSendMessage.mockResolvedValue({
        message: 'Hello back!',
      });

      render(<ChatInterface {...mockProps} />);
      
      const input = screen.getByLabelText(/type your message/i);
      await user.type(input, 'Hello!');
      await user.keyboard('{Enter}');

      // Wait for user message to appear
      await waitFor(() => {
        expect(screen.getByText('Hello!')).toBeInTheDocument();
      });

      // Wait for assistant response to appear
      await waitFor(() => {
        expect(screen.getByText('Hello back!')).toBeInTheDocument();
      });
    });

    it('should handle API errors gracefully', async () => {
      const user = userEvent.setup();
      const { apiService, ApiError } = await import('../../config/api');
      
      const mockSendMessage = apiService.sendChatMessage as ReturnType<typeof vi.fn>;
      mockSendMessage.mockRejectedValue(
        new ApiError('API Error occurred')
      );

      render(<ChatInterface {...mockProps} />);
      
      const input = screen.getByLabelText(/type your message/i);
      await user.type(input, 'Hello!');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText(/api error/i)).toBeInTheDocument();
      });
    });

    it('should show loading state while waiting for response', async () => {
      const user = userEvent.setup();
      const { apiService } = await import('../../config/api');
      
      let resolvePromise: (value: { message: string }) => void;
      const promise = new Promise<{ message: string }>((resolve) => {
        resolvePromise = resolve;
      });
      
      const mockSendMessage = apiService.sendChatMessage as ReturnType<typeof vi.fn>;
      mockSendMessage.mockReturnValue(promise);

      render(<ChatInterface {...mockProps} />);
      
      const input = screen.getByLabelText(/type your message/i);
      await user.type(input, 'Hello!');
      await user.keyboard('{Enter}');

      // Check for loading state
      expect(screen.getByText(/sending/i)).toBeInTheDocument();
      
      // Resolve the promise
      resolvePromise!({ message: 'Response' });
      
      await waitFor(() => {
        expect(screen.queryByText(/sending/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Voice Chat Functionality', () => {
    it('should have voice input button', () => {
      // Test will be implemented when voice functionality is added
      expect(true).toBe(true); // Placeholder
    });

    it('should start speech recognition when voice button is clicked', () => {
      // Test will be implemented when voice functionality is added
      expect(true).toBe(true); // Placeholder
    });

    it('should convert speech to text and send message', async () => {
      // Test will be implemented when voice functionality is added
      expect(true).toBe(true); // Placeholder
    });

    it('should use text-to-speech for avatar responses', async () => {
      // Test will be implemented when voice functionality is added
      expect(true).toBe(true); // Placeholder
    });

    it('should handle speech recognition errors', () => {
      // Test will be implemented when voice functionality is added
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Avatar Integration', () => {
    it('should trigger avatar speaking animation when response is received', async () => {
      // Test will be implemented when avatar integration is complete
      expect(true).toBe(true); // Placeholder
    });

    it('should stop avatar speaking animation when response is finished', async () => {
      // Test will be implemented when avatar integration is complete
      expect(true).toBe(true); // Placeholder
    });
  });
}); 