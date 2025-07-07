import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { apiService, ApiError, NetworkError, TimeoutError } from '../config/api';
import { useVoiceService } from '../services/voiceService';
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

// Memoized Message component for better performance
const Message = React.memo<{ message: Message }>(({ message }) => {
  const messageClass = useMemo(() => {
    const baseClass = 'message';
    const senderClass = message.sender === 'user' ? 'user' : 'assistant';
    const errorClass = message.error ? 'error' : '';
    return `${baseClass} ${senderClass} ${errorClass}`.trim();
  }, [message.sender, message.error]);

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
          <p>{message.content}</p>
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

// Custom hook for chat state management
const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isTyping,
    error,
    setIsTyping,
    setError,
    addMessage,
    clearError,
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
  }, [addMessage, clearError, onMessageSent]);

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
        <h3 id="chat-title">Chat with AI Avatar</h3>
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