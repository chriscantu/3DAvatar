import React, { useState, useCallback } from 'react';
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

  const handleMessageSent = useCallback((message: string) => {
    console.log('Message sent:', message);
    // This will trigger avatar speaking animation
    setIsAvatarSpeaking(true);
    
    // Simulate avatar speaking duration
    setTimeout(() => {
      setIsAvatarSpeaking(false);
    }, 3000);
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
              <ThreeDRoom isAvatarSpeaking={isAvatarSpeaking} />
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
