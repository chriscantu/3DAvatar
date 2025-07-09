import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService, ApiError, NetworkError, TimeoutError } from '../config/api';
import { createContextManager } from '../services/contextManager';
import type { Context, ContextAnalysis } from '../types/context';
import type { ChatMessage } from '../types/common';

interface Message {
  id: string;
  content: string;
  timestamp: number;
  sender: 'user' | 'assistant';
  isTyping?: boolean;
  error?: boolean;
}

interface UseChatReturn {
  messages: Message[];
  isTyping: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => void;
  exportHistory: () => void;
  clearError: () => void;
  currentContext: Context | null;
  contextAnalysis: ContextAnalysis | null;
}

const STORAGE_KEY = '3davatar_chat_history';

/**
 * Custom hook for managing chat functionality
 * Handles message state, API calls, context processing, and persistence
 */
export const useChat = (): UseChatReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentContext, setCurrentContext] = useState<Context | null>(null);
  const [contextAnalysis, setContextAnalysis] = useState<ContextAnalysis | null>(null);
  
  const contextManagerRef = useRef(createContextManager());

  // Load chat history from localStorage on mount
  useEffect(() => {
    const loadChatHistory = () => {
      try {
        const savedHistory = localStorage.getItem(STORAGE_KEY);
        if (savedHistory) {
          const parsedHistory = JSON.parse(savedHistory);
          if (Array.isArray(parsedHistory)) {
            setMessages(parsedHistory);
          }
        }
      } catch (error) {
        console.warn('Failed to load chat history from localStorage:', error);
      }
    };

    loadChatHistory();
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (error) {
        console.warn('Failed to save chat history to localStorage:', error);
      }
    }
  }, [messages]);

  // Process messages through context system
  useEffect(() => {
    const processLatestMessage = async () => {
      if (messages.length === 0) return;

      const lastMessage = messages[messages.length - 1];
      if (lastMessage.isTyping) return;

      try {
        // Convert to ChatMessage format for context processing
        const chatMessage: ChatMessage = {
          id: lastMessage.id,
          content: lastMessage.content,
          timestamp: lastMessage.timestamp,
          sender: lastMessage.sender,
          isTyping: lastMessage.isTyping,
          error: lastMessage.error
        };

        // Process through context manager
        const context = await contextManagerRef.current.processMessage(chatMessage);
        setCurrentContext(context);

        // Analyze context for insights
        const analysis = contextManagerRef.current.analyzeContext(context);
        setContextAnalysis(analysis);

        console.log('Context updated:', {
          emotion: context.immediate.currentUserEmotion,
          topics: context.immediate.activeTopics,
          relevance: analysis.relevanceScore
        });
      } catch (error) {
        console.error('Context processing error:', error);
        // Don't set error state for context processing failures
      }
    };

    processLatestMessage();
  }, [messages]);

  // Add a new message to the chat
  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  }, []);

  // Send a message to the API and handle response
  const sendMessage = useCallback(async (content: string) => {
    // Clear any existing errors
    setError(null);

    // Validate input
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return;
    }

    try {
      // Add user message
      addMessage({
        content: trimmedContent,
        sender: 'user'
      });

      // Show typing indicator
      setIsTyping(true);
      
      // Add typing message
      const typingMessageId = addMessage({
        content: '',
        sender: 'assistant',
        isTyping: true
      });

      try {
        // Send to API
        const response = await apiService.sendChatMessage(trimmedContent);
        
        // Remove typing message
        setMessages(prev => prev.filter(msg => msg.id !== typingMessageId));
        
        // Add assistant response
        addMessage({
          content: response.response || 'I received your message but had trouble responding.',
          sender: 'assistant'
        });
        
      } catch (apiError) {
        // Remove typing message
        setMessages(prev => prev.filter(msg => msg.id !== typingMessageId));
        
        // Handle different types of API errors
        let errorMessage = 'Failed to send message. Please try again.';
        
        if (apiError instanceof NetworkError) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (apiError instanceof TimeoutError) {
          errorMessage = 'Request timed out. Please try again.';
        } else if (apiError instanceof ApiError) {
          errorMessage = `Server error: ${apiError.message}`;
        }
        
        setError(errorMessage);
        console.error('API Error:', apiError);
      }
      
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Unexpected error in sendMessage:', error);
    } finally {
      setIsTyping(false);
    }
  }, [addMessage]);

  // Clear chat history
  const clearHistory = useCallback(() => {
    setMessages([]);
    setCurrentContext(null);
    setContextAnalysis(null);
    setError(null);
    
    try {
      localStorage.removeItem(STORAGE_KEY);
      contextManagerRef.current.clearSession(true);
    } catch (error) {
      console.warn('Failed to clear chat history:', error);
    }
  }, []);

  // Export chat history as JSON file
  const exportHistory = useCallback(() => {
    try {
      const exportData = {
        messages,
        exportDate: new Date().toISOString(),
        messageCount: messages.length
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `3davatar-chat-history-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('Chat history exported successfully');
    } catch (error) {
      console.error('Failed to export chat history:', error);
      setError('Failed to export chat history. Please try again.');
    }
  }, [messages]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isTyping,
    error,
    sendMessage,
    clearHistory,
    exportHistory,
    clearError,
    currentContext,
    contextAnalysis
  };
}; 