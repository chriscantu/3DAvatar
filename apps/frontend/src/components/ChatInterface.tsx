import React, { useState, useRef, useEffect } from 'react';
import { apiService, API_CONFIG } from '../config/api';
import { voiceService } from '../services/voiceService';
import './ChatInterface.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'avatar';
  timestamp: Date;
}

interface ChatInterfaceProps {
  onMessageSent?: (message: string) => void;
  onVoiceToggle?: (isListening: boolean) => void;
  isAvatarSpeaking?: boolean;
  className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onMessageSent,
  onVoiceToggle,
  isAvatarSpeaking = false,
  className = ''
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addMessage = (text: string, sender: 'user' | 'avatar') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    addMessage(userMessage, 'user');
    setIsLoading(true);

    try {
      // Call the callback to handle message sending
      if (onMessageSent) {
        onMessageSent(userMessage);
      }

      // Connect to the backend API
      const data = await apiService.post(API_CONFIG.ENDPOINTS.CHAT, { 
        message: userMessage 
      });
      
      const avatarResponse = data.response || 'Sorry, I could not generate a response.';
      addMessage(avatarResponse, 'avatar');
      
      // Speak the avatar's response
      if (voiceService.isSupported) {
        try {
          await voiceService.speak(avatarResponse);
        } catch (error) {
          console.error('Text-to-speech error:', error);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('Sorry, there was a connection error. Please try again.', 'avatar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceToggle = () => {
    if (!voiceService.isSupported) {
      alert('Voice functionality is not supported in this browser');
      return;
    }

    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
    } else {
      voiceService.startListening(
        (transcript) => {
          setInputValue(transcript);
          setIsListening(false);
        },
        (error) => {
          console.error('Voice recognition error:', error);
          setIsListening(false);
          alert('Voice recognition error: ' + error);
        }
      );
      setIsListening(true);
    }

    if (onVoiceToggle) {
      onVoiceToggle(!isListening);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`chat-interface ${className}`}>
      <div className="chat-header">
        <h3>Chat with Avatar</h3>
        <div className="chat-status">
          {isAvatarSpeaking && <span className="speaking-indicator">🔊 Avatar is speaking</span>}
          {isListening && <span className="listening-indicator">🎤 Listening...</span>}
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <p>👋 Hi! I'm your AI avatar. Ask me anything!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender === 'user' ? 'user-message' : 'avatar-message'}`}
            >
              <div className="message-content">
                <div className="message-text">{message.text}</div>
                <div className="message-time">{formatTime(message.timestamp)}</div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="message avatar-message">
            <div className="message-content">
              <div className="message-text typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <div className="input-row">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="message-input"
          />
          <button
            onClick={handleVoiceToggle}
            className={`voice-button ${isListening ? 'listening' : ''}`}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            🎤
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="send-button"
          >
            {isLoading ? '⏳' : '➤'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface; 