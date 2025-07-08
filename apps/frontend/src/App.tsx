import React, { useState, useCallback, useEffect, useRef } from 'react';
import ThreeDRoom from './components/ThreeDRoom';
import ChatInterface from './components/ChatInterface';
import ErrorBoundary from './components/ErrorBoundary';
import Settings from './components/Settings';
import type { UserSettings } from './types/common';
import './App.css';

const App: React.FC = () => {
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [userIsTyping, setUserIsTyping] = useState(false);
  const [lastMessageLength, setLastMessageLength] = useState(0);
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const [timeSinceLastMessage, setTimeSinceLastMessage] = useState(0);
  
  // Use ref to track the interval for time calculation
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update time since last message every 100ms for smooth avatar transitions
  useEffect(() => {
    if (lastMessageTime > 0) {
      const updateTime = () => {
        const now = Date.now();
        const timeDiff = now - lastMessageTime;
        setTimeSinceLastMessage(timeDiff);
        
        // Add debug logging
        console.log('Avatar state update:', {
          userIsTyping,
          isAvatarSpeaking,
          lastMessageLength,
          timeSinceLastMessage: timeDiff,
          lastMessageTime: new Date(lastMessageTime).toLocaleTimeString()
        });
      };
      
      // Update immediately
      updateTime();
      
      // Set up interval for continuous updates
      timeIntervalRef.current = setInterval(updateTime, 100);
      
      // Clear interval after 10 seconds to avoid unnecessary updates
      setTimeout(() => {
        if (timeIntervalRef.current) {
          clearInterval(timeIntervalRef.current);
          timeIntervalRef.current = null;
        }
      }, 10000);
    }
    
    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
        timeIntervalRef.current = null;
      }
    };
  }, [lastMessageTime, userIsTyping, isAvatarSpeaking, lastMessageLength]);

  const handleMessageSent = useCallback((message: string) => {
    console.log('Message sent:', message);
    const now = Date.now();
    
    // Update message tracking
    setLastMessageLength(message.length);
    setLastMessageTime(now);
    setTimeSinceLastMessage(0);
    setUserIsTyping(false);
    
    // This will trigger avatar speaking animation
    setIsAvatarSpeaking(true);
    
    // Simulate avatar speaking duration based on message length
    const speakingDuration = Math.max(2000, Math.min(8000, message.length * 50));
    setTimeout(() => {
      setIsAvatarSpeaking(false);
    }, speakingDuration);
  }, []);

  const handleUserTyping = useCallback((isTyping: boolean) => {
    console.log('User typing state changed:', isTyping);
    setUserIsTyping(isTyping);
  }, []);

  const handleVoiceToggle = useCallback((isListening: boolean) => {
    console.log('Voice toggle:', isListening);
    // This will be implemented when voice functionality is added
  }, []);

  const handleSettingsChange = useCallback((settings: UserSettings) => {
    setUserSettings(settings);
    
    // Apply theme changes
    if (settings.theme !== 'auto') {
      document.documentElement.setAttribute('data-theme', settings.theme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    
    // Apply font size changes
    document.documentElement.setAttribute('data-font-size', settings.fontSize);
    
    // Apply high contrast
    if (settings.highContrast) {
      document.documentElement.setAttribute('data-high-contrast', 'true');
    } else {
      document.documentElement.removeAttribute('data-high-contrast');
    }
    
    // Apply reduced motion
    if (settings.reducedMotion) {
      document.documentElement.setAttribute('data-reduced-motion', 'true');
    } else {
      document.documentElement.removeAttribute('data-reduced-motion');
    }
    
    console.log('Settings updated:', settings);
  }, []);

  const handleError = useCallback((error: Error) => {
    // Log errors for monitoring
    console.error('App Error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
    
    // In production, send to error reporting service
    // Example: Sentry.captureException(error);
  }, []);

  return (
    <ErrorBoundary onError={handleError}>
      <div className="app">
        <div className="app-header">
          <h1>3D Avatar Chat</h1>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="settings-button"
            aria-label="Open settings"
            title={userSettings ? `Theme: ${userSettings.theme}` : 'Open settings'}
          >
            ⚙️
          </button>
        </div>
        
        <div className="app-content">
          <div className="room-container">
            <ErrorBoundary 
              onError={handleError}
              fallback={
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%', 
                  background: '#222',
                  color: 'white',
                  fontSize: '1.2rem'
                }}>
                  🎮 3D Room temporarily unavailable
                </div>
              }
            >
              <ThreeDRoom 
                isAvatarSpeaking={isAvatarSpeaking}
                userIsTyping={userIsTyping}
                lastMessageLength={lastMessageLength}
                timeSinceLastMessage={timeSinceLastMessage}
              />
            </ErrorBoundary>
          </div>
          <div className="chat-container">
            <ErrorBoundary 
              onError={handleError}
              fallback={
                <div style={{ 
                  padding: '2rem', 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: '8px',
                  margin: '1rem'
                }}>
                  💬 Chat temporarily unavailable. Please refresh the page.
                </div>
              }
            >
              <ChatInterface
                onMessageSent={handleMessageSent}
                onVoiceToggle={handleVoiceToggle}
                onUserTyping={handleUserTyping}
                isAvatarSpeaking={isAvatarSpeaking}
              />
            </ErrorBoundary>
          </div>
        </div>

        <Settings
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onSettingsChange={handleSettingsChange}
        />
      </div>
    </ErrorBoundary>
  );
};

export default App;
