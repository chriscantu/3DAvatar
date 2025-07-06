import React, { useState } from 'react';
import ThreeDRoom from './components/ThreeDRoom';
import ChatInterface from './components/ChatInterface';
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

  return (
    <div className="app">
      <div className="room-container">
        <ThreeDRoom isAvatarSpeaking={isAvatarSpeaking} />
      </div>
      <div className="chat-container">
        <ChatInterface
          onMessageSent={handleMessageSent}
          onVoiceToggle={handleVoiceToggle}
          isAvatarSpeaking={isAvatarSpeaking}
        />
      </div>
    </div>
  );
};

export default App;
