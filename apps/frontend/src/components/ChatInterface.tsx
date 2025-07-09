import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useVoiceService } from '../services/voiceService';
import { useChat } from '../hooks/useChat';
import type { ContextAnalysis } from '../types/context';
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
  onUserTyping?: (isTyping: boolean) => void;
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

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  onMessageSent, 
  onVoiceToggle, 
  onUserTyping,
  isAvatarSpeaking 
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use our new custom hook
  const {
    messages,
    isTyping,
    error,
    sendMessage,
    clearHistory,
    exportHistory,
    clearError,
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

  // Show avatar speaking indicator
  useEffect(() => {
    if (isAvatarSpeaking) {
      console.log('Avatar is speaking...');
    }
  }, [isAvatarSpeaking]);

  // Memoized input validation
  const canSendMessage = useMemo(() => {
    return inputText.trim().length > 0 && !isTyping;
  }, [inputText, isTyping]);

  // Memoized error message
  const displayError = useMemo(() => {
    if (error) return error;
    if (voiceError) return `Voice error: ${voiceError}`;
    return null;
  }, [error, voiceError]);

  // Handle typing indicator
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputText(value);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Show typing indicator
    if (onUserTyping && value.length > 0) {
      onUserTyping(true);
      
      // Hide typing indicator after 1 second of no typing
      typingTimeoutRef.current = setTimeout(() => {
        onUserTyping(false);
      }, 1000);
    }
  }, [onUserTyping]);

  // Handle message send
  const handleSendMessage = useCallback(async () => {
    if (!canSendMessage) return;
    
    const messageText = inputText.trim();
    
    // Clear typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (onUserTyping) {
      onUserTyping(false);
    }
    
    // Clear input
    setInputText('');
    
    // Clear voice transcript
    clearTranscript();
    
    // Send message through hook
    await sendMessage(messageText);
    
    // Notify parent
    onMessageSent(messageText);
    
    // Focus input
    inputRef.current?.focus();
  }, [canSendMessage, inputText, onUserTyping, clearTranscript, sendMessage, onMessageSent]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Handle voice toggle
  const handleVoiceToggle = useCallback(() => {
    toggleListening();
    if (isListening) {
      clearTranscript();
    }
  }, [toggleListening, isListening, clearTranscript]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h2>Chat with 3D Avatar</h2>
        <div className="chat-controls">
          <button 
            onClick={clearHistory}
            className="control-button clear-button"
            title="Clear chat history"
            aria-label="Clear chat history"
          >
            🗑️
          </button>
          <button 
            onClick={exportHistory}
            className="control-button export-button"
            title="Export chat history"
            aria-label="Export chat history"
          >
            📥
          </button>
        </div>
      </div>

      <div className="messages-container">
        <div className="messages-list" role="log" aria-live="polite">
          {messages.map((message) => (
            <Message 
              key={message.id} 
              message={message} 
              emotion={contextAnalysis?.emotionalTone.primary}
              analysisData={contextAnalysis || undefined}
            />
          ))}
          <TypingIndicator isVisible={isTyping} />
        </div>
        <div ref={messagesEndRef} />
      </div>

      {displayError && (
        <div className="error-message" role="alert">
          <span className="error-text">{displayError}</span>
          <button 
            onClick={clearError}
            className="error-close"
            aria-label="Close error message"
          >
            ×
          </button>
        </div>
      )}

      <div className="input-container">
        <div className="input-row">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="message-input"
            disabled={isTyping}
            aria-label="Type your message"
            aria-describedby={displayError ? "error-message" : undefined}
          />
          
          {isSupported && (
            <button
              onClick={handleVoiceToggle}
              className={`voice-button ${isListening ? 'listening' : ''}`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
              aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
              aria-pressed={isListening}
            >
              🎤
            </button>
          )}
          
          <button
            onClick={handleSendMessage}
            disabled={!canSendMessage}
            className="send-button"
            title="Send message"
            aria-label="Send message"
          >
            Send
          </button>
        </div>
        
        {isListening && (
          <div className="voice-status" aria-live="polite">
            🎤 Listening... {transcript && `"${transcript}"`}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface; 