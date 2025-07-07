import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { apiService, ApiError, NetworkError, TimeoutError } from '../config/api';
import { useVoiceService } from '../services/voiceService';
import { createContextManager } from '../services/contextManager';
import type { Context, ContextAnalysis } from '../types/context';
import type { ChatMessage } from '../types/common';
import './ChatInterface.css';

// Types for better type safety
interface Message {
  id: string;
  content: string;
  timestamp: number;
  sender: 'user' | 'assistant';
  isTyping?: boolean;
  error?: boolean;
}

interface ChatInterfaceProps {
  onMessageSent: (message: string) => void;
  onVoiceToggle: (isListening: boolean) => void;
  isAvatarSpeaking: boolean;
}

// Enhanced Message component with context awareness
const Message = React.memo<{ message: Message; emotion?: string; analysisData?: ContextAnalysis }>(({ message, emotion, analysisData }) => {
  const messageClass = useMemo(() => {
    const baseClass = 'message';
    const senderClass = message.sender === 'user' ? 'user' : 'assistant';
    const errorClass = message.error ? 'error' : '';
    const emotionClass = emotion ? `emotion-${emotion}` : '';
    return `${baseClass} ${senderClass} ${errorClass} ${emotionClass}`.trim();
  }, [message.sender, message.error, emotion]);

  const formattedTime = useMemo(() => {
    return new Date(message.timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, [message.timestamp]);

  return (
    <div 
      className={messageClass}
      role="log"
      aria-live="polite"
      aria-label={`${message.sender === 'user' ? 'You' : 'Assistant'} said: ${message.content}`}
    >
      <div className="message-content">
        {message.isTyping ? (
          <div className="typing-indicator" aria-label="Assistant is typing">
            <span></span>
            <span></span>
            <span></span>
          </div>
        ) : (
          <div className="message-text">
            {message.content.split('\n').map((line, index) => (
              <div key={index} className="message-line">
                {line}
              </div>
            ))}
          </div>
        )}
        {/* Context analysis indicator for development */}
        {analysisData && process.env.NODE_ENV === 'development' && (
          <div className="context-analysis" title={`Relevance: ${analysisData.relevanceScore.toFixed(2)}, Emotion: ${analysisData.emotionalTone.primary}`}>
            <span className="analysis-indicator">🧠</span>
          </div>
        )}
      </div>
      <div className="message-time" aria-label={`Sent at ${formattedTime}`}>
        {formattedTime}
      </div>
    </div>
  );
});

Message.displayName = 'Message';

// Memoized typing indicator component
const TypingIndicator = React.memo<{ isVisible: boolean }>(({ isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <div className="typing-indicator-container">
      <div className="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <span className="typing-text">Assistant is typing...</span>
    </div>
  );
});

TypingIndicator.displayName = 'TypingIndicator';

// Local storage keys
const CHAT_HISTORY_KEY = '3davatar_chat_history';

// Chat storage utilities
const chatStorage = {
  // Save messages to localStorage
  saveMessages: (messages: Message[]) => {
    try {
      const serialized = JSON.stringify(messages);
      localStorage.setItem(CHAT_HISTORY_KEY, serialized);
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  },

  // Load messages from localStorage
  loadMessages: (): Message[] => {
    try {
      const serialized = localStorage.getItem(CHAT_HISTORY_KEY);
      if (serialized) {
        return JSON.parse(serialized);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
    return [];
  },

  // Clear all chat history
  clearHistory: () => {
    try {
      localStorage.removeItem(CHAT_HISTORY_KEY);
    } catch (error) {
      console.error('Failed to clear chat history:', error);
    }
  },

  // Export chat history as JSON
  exportHistory: (messages: Message[]) => {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalMessages: messages.length,
      messages: messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp).toISOString(),
      })),
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `3davatar_chat_history_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Get chat statistics
  getStats: (messages: Message[]) => {
    const userMessages = messages.filter(m => m.sender === 'user');
    const assistantMessages = messages.filter(m => m.sender === 'assistant');
    const totalChars = messages.reduce((acc, m) => acc + m.content.length, 0);
    
    return {
      totalMessages: messages.length,
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length,
      totalCharacters: totalChars,
      firstMessage: messages.length > 0 ? new Date(messages[0].timestamp) : null,
      lastMessage: messages.length > 0 ? new Date(messages[messages.length - 1].timestamp) : null,
    };
  },
};

// Enhanced chat hook with context management
const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contextManager] = useState(() => createContextManager());
  const [currentContext, setCurrentContext] = useState<Context | null>(null);
  const [contextAnalysis, setContextAnalysis] = useState<ContextAnalysis | null>(null);

  // Load chat history on component mount
  useEffect(() => {
    const loadedMessages = chatStorage.loadMessages();
    if (loadedMessages.length > 0) {
      setMessages(loadedMessages);
      console.log(`Loaded ${loadedMessages.length} messages from chat history`);
    }
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      chatStorage.saveMessages(messages);
    }
  }, [messages]);

  // Process messages through context system
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
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
      contextManager.processMessage(chatMessage).then(context => {
        setCurrentContext(context);
        
        // Analyze context for insights
        const analysis = contextManager.analyzeContext(context);
        setContextAnalysis(analysis);
        
        console.log('Context updated:', {
          emotion: context.immediate.currentUserEmotion,
          topics: context.immediate.activeTopics,
          relevance: analysis.relevanceScore
        });
      }).catch(error => {
        console.error('Context processing error:', error);
      });
    }
  }, [messages, contextManager]);
  
  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    setMessages(prev => {
      const updated = [...prev, newMessage];
      return updated;
    });
    return newMessage.id;
  }, []);

  const clearHistory = useCallback(() => {
    setMessages([]);
    chatStorage.clearHistory();
    contextManager.clearSession(true); // Clear session but preserve user profile
    console.log('Chat history cleared');
  }, [contextManager]);

  const exportHistory = useCallback(() => {
    chatStorage.exportHistory(messages);
    console.log('Chat history exported');
  }, [messages]);

  const getStats = useCallback(() => {
    return chatStorage.getStats(messages);
  }, [messages]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const searchMessages = useCallback((query: string) => {
    if (!query.trim()) return messages;
    
    const lowercaseQuery = query.toLowerCase();
    return messages.filter(message => 
      message.content.toLowerCase().includes(lowercaseQuery)
    );
  }, [messages]);

  return {
    messages,
    isTyping,
    error,
    setIsTyping,
    setError,
    addMessage,
    clearError,
    clearHistory,
    exportHistory,
    getStats,
    searchMessages,
    contextManager,
    currentContext,
    contextAnalysis,
  };
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  onMessageSent, 
  onVoiceToggle, 
  isAvatarSpeaking 
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const {
    messages,
    isTyping,
    error,
    setIsTyping,
    setError,
    addMessage,
    clearError,
    clearHistory,
    exportHistory,
    contextManager,
    currentContext,
    contextAnalysis,
  } = useChat();

  const {
    isListening,
    isSupported,
    toggleListening,
    transcript,
    clearTranscript,
    error: voiceError,
  } = useVoiceService();

  // Memoized scroll to bottom function
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle voice transcript
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  // Handle voice toggle callback
  useEffect(() => {
    onVoiceToggle(isListening);
  }, [isListening, onVoiceToggle]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Show avatar speaking indicator
  useEffect(() => {
    if (isAvatarSpeaking) {
      console.log('Avatar is speaking...');
    }
  }, [isAvatarSpeaking]);

  // Memoized input validation
  const canSendMessage = useMemo(() => {
    return inputText.trim().length > 0 && !isLoading && !isTyping;
  }, [inputText, isLoading, isTyping]);

  // Memoized error message
  const displayError = useMemo(() => {
    if (error) return error;
    if (voiceError) return `Voice error: ${voiceError}`;
    return null;
  }, [error, voiceError]);

  // Optimized message sending
  const sendMessage = useCallback(async (messageText: string) => {
    const trimmedMessage = messageText.trim();
    if (!trimmedMessage) return;

    // Clear any existing errors
    clearError();
    
    // Add user message
    addMessage({
      content: trimmedMessage,
      sender: 'user',
    });

    // Clear input and call parent callback
    setInputText('');
    onMessageSent(trimmedMessage);

    // Set loading states
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController();

      // Send message to API
      const response = await apiService.sendChatMessage(trimmedMessage, {
        signal: abortControllerRef.current.signal,
      });

      // Add assistant response
      addMessage({
        content: response.message,
        sender: 'assistant',
      });

      // Speak the response using text-to-speech
      try {
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(response.message);
          utterance.rate = 0.9;
          utterance.pitch = 1;
          utterance.volume = 0.8;
          utterance.lang = 'en-US';
          
          speechSynthesis.speak(utterance);
        }
      } catch (speechError) {
        console.error('Text-to-speech error:', speechError);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorMessage = 'Failed to send message. Please try again.';
      
      if (error instanceof ApiError) {
        errorMessage = `API Error: ${error.message}`;
      } else if (error instanceof NetworkError) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error instanceof TimeoutError) {
        errorMessage = 'Request timeout. Please try again.';
      } else if (error instanceof Error && error.name === 'AbortError') {
        // Request was cancelled, don't show error
        return;
      }

      // Add error message
      addMessage({
        content: errorMessage,
        sender: 'assistant',
        error: true,
      });
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  }, [addMessage, clearError, onMessageSent, setError, setIsTyping]);

  // Optimized form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (canSendMessage) {
      sendMessage(inputText);
    }
  }, [inputText, canSendMessage, sendMessage]);

  // Optimized input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  }, []);

  // Optimized voice toggle
  const handleVoiceToggle = useCallback(() => {
    toggleListening();
    if (isListening) {
      clearTranscript();
    }
  }, [toggleListening, isListening, clearTranscript]);

  // Optimized key press handler
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSendMessage) {
        sendMessage(inputText);
      }
    }
  }, [inputText, canSendMessage, sendMessage]);

  // Memoized voice button class
  const voiceButtonClass = useMemo(() => {
    const baseClass = 'voice-button';
    const activeClass = isListening ? 'active' : '';
    const disabledClass = !isSupported ? 'disabled' : '';
    return `${baseClass} ${activeClass} ${disabledClass}`.trim();
  }, [isListening, isSupported]);

  // Memoized send button class
  const sendButtonClass = useMemo(() => {
    const baseClass = 'send-button';
    const disabledClass = !canSendMessage ? 'disabled' : '';
    return `${baseClass} ${disabledClass}`.trim();
  }, [canSendMessage]);

  return (
    <div className="chat-interface" role="main" aria-label="Chat interface">
      <div className="chat-header">
        <div className="header-left">
          <h3 id="chat-title">Chat with AI Avatar</h3>
          <div className="chat-stats" title={`${messages.length} messages total`}>
            {messages.length > 0 && (
              <span className="message-count">{messages.length} messages</span>
            )}
          </div>
        </div>
        <div className="header-right">
          <div className="chat-actions">
            {messages.length > 0 && (
              <>
                <button
                  onClick={exportHistory}
                  className="action-button export-button"
                  title="Export chat history"
                  aria-label="Export chat history as JSON file"
                >
                  📤
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
                      clearHistory();
                    }
                  }}
                  className="action-button clear-button"
                  title="Clear chat history"
                  aria-label="Clear all chat history"
                >
                  🗑️
                </button>
              </>
            )}
          </div>
          <div className="connection-status" aria-live="polite">
            <span 
              className={`status-indicator ${isLoading ? 'loading' : 'connected'}`}
              aria-hidden="true"
            />
            <span className="status-text">
              {isLoading ? 'Sending...' : 'Connected'}
            </span>
          </div>
        </div>
      </div>

      <div 
        className="messages-container"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'End') {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      >
        <div className="messages">
          {messages.length === 0 && (
            <div className="welcome-message" role="status">
              👋 Welcome! Start a conversation with your AI avatar. You can type or use voice input.
            </div>
          )}
          {messages.length > 0 && (
            <div className="history-indicator" role="status">
              💾 Chat history loaded - your conversations are automatically saved locally
            </div>
          )}
          {messages.map((message) => (
            <Message
              key={message.id}
              message={message}
            />
          ))}
          <TypingIndicator isVisible={isTyping} />
        </div>
        <div ref={messagesEndRef} />
      </div>

      {displayError && (
        <div 
          className="error-message"
          role="alert"
          aria-live="assertive"
        >
          <span className="error-icon" aria-hidden="true">⚠️</span>
          <span>{displayError}</span>
          <button 
            onClick={clearError} 
            className="error-dismiss"
            aria-label="Dismiss error message"
          >
            ×
          </button>
        </div>
      )}

      <form 
        onSubmit={handleSubmit} 
        className="input-form"
        role="form"
        aria-labelledby="chat-title"
      >
        <div className="input-container">
          <label htmlFor="message-input" className="sr-only">
            {isListening ? 'Listening for voice input...' : 'Type your message'}
          </label>
          <input
            id="message-input"
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={isListening ? 'Listening...' : 'Type your message...'}
            disabled={isLoading}
            className="message-input"
            maxLength={1000}
            aria-describedby={displayError ? 'error-message' : undefined}
            aria-required="true"
          />
          
          <div className="input-actions" role="group" aria-label="Message actions">
            {isSupported && (
              <button
                type="button"
                onClick={handleVoiceToggle}
                className={voiceButtonClass}
                disabled={isLoading}
                aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                aria-pressed={isListening}
              >
                <span aria-hidden="true">{isListening ? '🔴' : '🎤'}</span>
              </button>
            )}
            
            <button
              type="submit"
              disabled={!canSendMessage}
              className={sendButtonClass}
              aria-label="Send message"
            >
              <span aria-hidden="true">{isLoading ? '⏳' : '➤'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default React.memo(ChatInterface); 