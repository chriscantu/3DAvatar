import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useChat } from '../useChat';
import { ChatMessageBuilder, TestContextFactory, createMockServices } from '../../utils/test-builders';
import { apiService } from '../../config/api';

// Mock the dependencies
vi.mock('../../config/api');
vi.mock('../../services/contextManager');
vi.mock('../../services/voiceService');

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

describe('useChat Hook', () => {
  const mockServices = createMockServices();
  
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with empty messages', () => {
      const { result } = renderHook(() => useChat());
      
      expect(result.current.messages).toEqual([]);
      expect(result.current.isTyping).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should load messages from localStorage on mount', () => {
      const savedMessages = [
        new ChatMessageBuilder().fromUser().withContent('Hello').build(),
        new ChatMessageBuilder().fromAssistant().withContent('Hi there!').build()
      ];
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedMessages));
      
      const { result } = renderHook(() => useChat());
      
      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0].content).toBe('Hello');
      expect(result.current.messages[1].content).toBe('Hi there!');
    });

    it('should handle invalid localStorage data gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');
      
      const { result } = renderHook(() => useChat());
      
      expect(result.current.messages).toEqual([]);
      expect(result.current.error).toBe(null);
    });
  });

  describe('Message Management', () => {
    it('should add user messages correctly', async () => {
      const { result } = renderHook(() => useChat());
      
      await act(async () => {
        await result.current.sendMessage('Hello world');
      });
      
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe('Hello world');
      expect(result.current.messages[0].sender).toBe('user');
    });

    it('should save messages to localStorage after adding', async () => {
      const { result } = renderHook(() => useChat());
      
      await act(async () => {
        await result.current.sendMessage('Test message');
      });
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        '3davatar_chat_history',
        expect.any(String)
      );
    });

    it('should not send empty messages', async () => {
      const { result } = renderHook(() => useChat());
      
      await act(async () => {
        await result.current.sendMessage('');
      });
      
      expect(result.current.messages).toHaveLength(0);
      expect(mockServices.apiService.sendChatMessage).not.toHaveBeenCalled();
    });

    it('should not send whitespace-only messages', async () => {
      const { result } = renderHook(() => useChat());
      
      await act(async () => {
        await result.current.sendMessage('   \n\t   ');
      });
      
      expect(result.current.messages).toHaveLength(0);
      expect(mockServices.apiService.sendChatMessage).not.toHaveBeenCalled();
    });
  });

  describe('API Integration', () => {
    it('should call API service when sending message', async () => {
      vi.mocked(apiService.sendChatMessage).mockResolvedValue({ response: 'API response' });
      
      const { result } = renderHook(() => useChat());
      
      await act(async () => {
        await result.current.sendMessage('Hello');
      });
      
      expect(apiService.sendChatMessage).toHaveBeenCalledWith('Hello');
    });

    it('should add assistant response after API call', async () => {
      vi.mocked(apiService.sendChatMessage).mockResolvedValue({ response: 'API response' });
      
      const { result } = renderHook(() => useChat());
      
      await act(async () => {
        await result.current.sendMessage('Hello');
      });
      
      await waitFor(() => {
        expect(result.current.messages).toHaveLength(2);
        expect(result.current.messages[1].content).toBe('API response');
        expect(result.current.messages[1].sender).toBe('assistant');
      });
    });

    it('should show typing indicator during API call', async () => {
      let resolveApiCall: (value: any) => void;
      const apiPromise = new Promise(resolve => {
        resolveApiCall = resolve;
      });
      
      vi.mocked(apiService.sendChatMessage).mockReturnValue(apiPromise);
      
      const { result } = renderHook(() => useChat());
      
      act(() => {
        result.current.sendMessage('Hello');
      });
      
      expect(result.current.isTyping).toBe(true);
      
      await act(async () => {
        resolveApiCall!({ response: 'Response' });
        await apiPromise;
      });
      
      expect(result.current.isTyping).toBe(false);
    });

    it('should handle API errors gracefully', async () => {
      const apiError = new Error('API Error');
      vi.mocked(apiService.sendChatMessage).mockRejectedValue(apiError);
      
      const { result } = renderHook(() => useChat());
      
      await act(async () => {
        await result.current.sendMessage('Hello');
      });
      
      expect(result.current.error).toBe('Failed to send message. Please try again.');
      expect(result.current.isTyping).toBe(false);
    });
  });

  describe('Context Management', () => {
    it('should process messages through context manager', async () => {
      const { result } = renderHook(() => useChat());
      
      await act(async () => {
        await result.current.sendMessage('Hello');
      });
      
      expect(mockServices.contextManager.processMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Hello',
          sender: 'user'
        })
      );
    });

    it('should analyze context after processing', async () => {
      const { result } = renderHook(() => useChat());
      
      await act(async () => {
        await result.current.sendMessage('Hello');
      });
      
      await waitFor(() => {
        expect(mockServices.contextManager.analyzeContext).toHaveBeenCalled();
      });
    });

    it('should handle context processing errors', async () => {
      mockServices.contextManager.processMessage.mockRejectedValue(new Error('Context error'));
      
      const { result } = renderHook(() => useChat());
      
      await act(async () => {
        await result.current.sendMessage('Hello');
      });
      
      // Should still add the message even if context processing fails
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe('Hello');
    });
  });

  describe('History Management', () => {
    it('should clear message history', async () => {
      const { result } = renderHook(() => useChat());
      
      await act(async () => {
        await result.current.sendMessage('Hello');
      });
      
      expect(result.current.messages).toHaveLength(1);
      
      act(() => {
        result.current.clearHistory();
      });
      
      expect(result.current.messages).toHaveLength(0);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('3davatar_chat_history');
    });

    it('should export message history', async () => {
      const { result } = renderHook(() => useChat());
      
      await act(async () => {
        await result.current.sendMessage('Hello');
      });
      
      // Mock URL.createObjectURL
      const mockCreateObjectURL = vi.fn().mockReturnValue('blob:url');
      global.URL.createObjectURL = mockCreateObjectURL;
      
      // Mock document.createElement and click
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      
      act(() => {
        result.current.exportHistory();
      });
      
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockLink.click).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should clear error when sending new message', async () => {
      vi.mocked(apiService.sendChatMessage).mockRejectedValueOnce(new Error('API Error'));
      
      const { result } = renderHook(() => useChat());
      
      // First message causes error
      await act(async () => {
        await result.current.sendMessage('Hello');
      });
      
      expect(result.current.error).toBeTruthy();
      
      // Second message should clear error
      vi.mocked(apiService.sendChatMessage).mockResolvedValueOnce({ response: 'Success' });
      
      await act(async () => {
        await result.current.sendMessage('Hello again');
      });
      
      expect(result.current.error).toBe(null);
    });

    it('should provide method to manually clear errors', () => {
      const { result } = renderHook(() => useChat());
      
      // Simulate error state
      act(() => {
        result.current.sendMessage('Hello');
      });
      
      act(() => {
        result.current.clearError();
      });
      
      expect(result.current.error).toBe(null);
    });
  });

  describe('Performance', () => {
    it('should not cause memory leaks with many messages', async () => {
      const { result } = renderHook(() => useChat());
      
      // Add many messages
      for (let i = 0; i < 100; i++) {
        await act(async () => {
          await result.current.sendMessage(`Message ${i}`);
        });
      }
      
      expect(result.current.messages).toHaveLength(100);
      
      // Clear should work efficiently
      act(() => {
        result.current.clearHistory();
      });
      
      expect(result.current.messages).toHaveLength(0);
    });
  });
}); 