import React, { useState } from 'react';
import ThreeDRoom from './components/ThreeDRoom';
import ChatInterface from './components/ChatInterface';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

const App: React.FC = () => {
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);

  const handleMessageSent = (message: string) => {
    console.log('Message sent:', message);
    // This will trigger avatar speaking animation
    setIsAvatarSpeaking(true);
    
    // Simulate avatar speaking duration
    setTimeout(() => {
      setIsAvatarSpeaking(false);
    }, 3000);
  };

  const handleVoiceToggle = (isListening: boolean) => {
    console.log('Voice toggle:', isListening);
    // This will be implemented when voice functionality is added
  };

  const handleError = (error: Error) => {
    // Log errors for monitoring
    console.error('App Error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
    
    // In production, send to error reporting service
    // Example: Sentry.captureException(error);
  };

  return (
    <ErrorBoundary onError={handleError}>
      <div className="app">
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
    </ErrorBoundary>
  );
};

export default App;
