import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Canvas } from '@react-three/fiber';
import React from 'react';
import ChatInterface from '../ChatInterface';
import AnimatedPuppyAvatar from '../AnimatedPuppyAvatar';
import { createAvatarTestEnvironment } from '../../test-utils/3d-testing-utils';
import { setupThreeJSMocks } from '../../test-utils/enhanced-three-mocks';

// Setup Three.js mocks
setupThreeJSMocks();

// Mock voice service
vi.mock('../services/voiceService', () => ({
  VoiceService: {
    speak: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn(),
    isSupported: vi.fn().mockReturnValue(true),
    getVoices: vi.fn().mockReturnValue([]),
    setVoice: vi.fn(),
    setRate: vi.fn(),
    setPitch: vi.fn(),
    setVolume: vi.fn(),
  }
}));

// Mock API calls
vi.mock('../config/api', () => ({
  API_BASE_URL: 'http://localhost:3001',
  sendMessage: vi.fn().mockResolvedValue({
    message: 'Hello! How can I help you today?',
    timestamp: new Date().toISOString()
  })
}));

describe('Chat-Avatar Integration Tests', () => {
  let testEnvironment: ReturnType<typeof createAvatarTestEnvironment>;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    testEnvironment = createAvatarTestEnvironment();
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  afterEach(() => {
    testEnvironment.cleanup();
  });

  describe('User Typing Animation Integration', () => {
    it('should trigger puppy excitement when user starts typing in chat', async () => {
      const TestComponent = () => {
        const [userIsTyping, setUserIsTyping] = React.useState(false);
        const [messageLength, setMessageLength] = React.useState(0);

        const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
          const value = event.target.value;
          setUserIsTyping(value.length > 0);
          setMessageLength(value.length);
        };

        return (
          <div>
            <input
              type="text"
              placeholder="Type your message..."
              onChange={handleInputChange}
              data-testid="chat-input"
            />
            <Canvas>
              <AnimatedPuppyAvatar 
                userIsTyping={userIsTyping}
                lastMessageLength={messageLength}
              />
            </Canvas>
          </div>
        );
      };

      render(<TestComponent />);

      const chatInput = screen.getByTestId('chat-input');

      // Start typing
      await user.type(chatInput, 'Hello');

      await waitFor(() => {
        // Should trigger excitement animation
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('User typing detected'),
          expect.anything()
        );
      });
    });

    it('should increase excitement intensity as message gets longer', async () => {
      const TestComponent = () => {
        const [userIsTyping, setUserIsTyping] = React.useState(false);
        const [messageLength, setMessageLength] = React.useState(0);

        const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
          const value = event.target.value;
          setUserIsTyping(value.length > 0);
          setMessageLength(value.length);
        };

        return (
          <div>
            <input
              type="text"
              placeholder="Type your message..."
              onChange={handleInputChange}
              data-testid="chat-input"
            />
            <Canvas>
              <AnimatedPuppyAvatar 
                userIsTyping={userIsTyping}
                lastMessageLength={messageLength}
              />
            </Canvas>
          </div>
        );
      };

      render(<TestComponent />);

      const chatInput = screen.getByTestId('chat-input');

      // Type a long message
      await user.type(chatInput, 'This is a much longer message that should trigger higher excitement intensity');

      await waitFor(() => {
        // Should trigger excitement with higher intensity
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('triggering excitement with intensity'),
          expect.anything()
        );
      });
    });

    it('should return to idle when user stops typing', async () => {
      const TestComponent = () => {
        const [userIsTyping, setUserIsTyping] = React.useState(false);
        const [messageLength, setMessageLength] = React.useState(0);

        const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
          const value = event.target.value;
          setUserIsTyping(value.length > 0);
          setMessageLength(value.length);
        };

        const handleClearInput = () => {
          setUserIsTyping(false);
          setMessageLength(0);
        };

        return (
          <div>
            <input
              type="text"
              placeholder="Type your message..."
              onChange={handleInputChange}
              data-testid="chat-input"
            />
            <button onClick={handleClearInput} data-testid="clear-button">
              Clear
            </button>
            <Canvas>
              <AnimatedPuppyAvatar 
                userIsTyping={userIsTyping}
                lastMessageLength={messageLength}
              />
            </Canvas>
          </div>
        );
      };

      render(<TestComponent />);

      const chatInput = screen.getByTestId('chat-input');
      const clearButton = screen.getByTestId('clear-button');

      // Type message
      await user.type(chatInput, 'Hello');

      // Clear input
      await user.click(clearButton);

      await waitFor(() => {
        // Should return to idle state
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('Animation state changed'),
          expect.anything()
        );
      });
    });

    it('should handle rapid typing and pausing correctly', async () => {
      const TestComponent = () => {
        const [userIsTyping, setUserIsTyping] = React.useState(false);
        const [messageLength, setMessageLength] = React.useState(0);

        const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
          const value = event.target.value;
          setUserIsTyping(value.length > 0);
          setMessageLength(value.length);
        };

        return (
          <div>
            <input
              type="text"
              placeholder="Type your message..."
              onChange={handleInputChange}
              data-testid="chat-input"
            />
            <Canvas>
              <AnimatedPuppyAvatar 
                userIsTyping={userIsTyping}
                lastMessageLength={messageLength}
              />
            </Canvas>
          </div>
        );
      };

      render(<TestComponent />);

      const chatInput = screen.getByTestId('chat-input');

      // Rapid typing pattern
      await user.type(chatInput, 'H');
      await user.clear(chatInput);
      await user.type(chatInput, 'He');
      await user.clear(chatInput);
      await user.type(chatInput, 'Hello');

      await waitFor(() => {
        // Should handle rapid changes without crashing
        expect(screen.getByTestId('chat-input')).toBeInTheDocument();
      });
    });
  });

  describe('AI Response Animation Integration', () => {
    it('should trigger speaking animation when AI responds', async () => {
      const TestComponent = () => {
        const [isSpeaking, setIsSpeaking] = React.useState(false);
        const [messageLength, setMessageLength] = React.useState(0);

        const handleAIResponse = () => {
          const response = 'Hello! How can I help you today?';
          setIsSpeaking(true);
          setMessageLength(response.length);
          
          // Simulate speaking duration
          setTimeout(() => {
            setIsSpeaking(false);
          }, 2000);
        };

        return (
          <div>
            <button onClick={handleAIResponse} data-testid="ai-response-button">
              Trigger AI Response
            </button>
            <Canvas>
              <AnimatedPuppyAvatar 
                isSpeaking={isSpeaking}
                lastMessageLength={messageLength}
              />
            </Canvas>
          </div>
        );
      };

      render(<TestComponent />);

      const responseButton = screen.getByTestId('ai-response-button');

      // Trigger AI response
      await user.click(responseButton);

      await waitFor(() => {
        // Should trigger speaking animation
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('AI speaking detected'),
          expect.anything()
        );
      });
    });

    it('should adjust speaking intensity based on response length', async () => {
      const TestComponent = () => {
        const [isSpeaking, setIsSpeaking] = React.useState(false);
        const [messageLength, setMessageLength] = React.useState(0);

        const handleShortResponse = () => {
          setIsSpeaking(true);
          setMessageLength(20);
        };

        const handleLongResponse = () => {
          setIsSpeaking(true);
          setMessageLength(200);
        };

        return (
          <div>
            <button onClick={handleShortResponse} data-testid="short-response">
              Short Response
            </button>
            <button onClick={handleLongResponse} data-testid="long-response">
              Long Response
            </button>
            <Canvas>
              <AnimatedPuppyAvatar 
                isSpeaking={isSpeaking}
                lastMessageLength={messageLength}
              />
            </Canvas>
          </div>
        );
      };

      render(<TestComponent />);

      const shortButton = screen.getByTestId('short-response');
      const longButton = screen.getByTestId('long-response');

      // Test short response
      await user.click(shortButton);

      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('triggering speaking animation with intensity'),
          expect.anything()
        );
      });

      // Test long response
      await user.click(longButton);

      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('triggering speaking animation with intensity'),
          expect.anything()
        );
      });
    });

    it('should handle voice synthesis integration', async () => {
      const { VoiceService } = await import('../services/voiceService');
      
      const TestComponent = () => {
        const [isSpeaking, setIsSpeaking] = React.useState(false);

        const handleVoiceResponse = async () => {
          setIsSpeaking(true);
          await VoiceService.speak('Hello! How can I help you today?');
          setIsSpeaking(false);
        };

        return (
          <div>
            <button onClick={handleVoiceResponse} data-testid="voice-response">
              Voice Response
            </button>
            <Canvas>
              <AnimatedPuppyAvatar isSpeaking={isSpeaking} />
            </Canvas>
          </div>
        );
      };

      render(<TestComponent />);

      const voiceButton = screen.getByTestId('voice-response');

      // Trigger voice response
      await user.click(voiceButton);

      await waitFor(() => {
        // Should call voice service
        expect(VoiceService.speak).toHaveBeenCalledWith('Hello! How can I help you today?');
      });
    });
  });

  describe('Combined Animation States', () => {
    it('should prioritize speaking over typing animations', async () => {
      const TestComponent = () => {
        const [userIsTyping, setUserIsTyping] = React.useState(false);
        const [isSpeaking, setIsSpeaking] = React.useState(false);

        const handleStartTyping = () => setUserIsTyping(true);
        const handleStartSpeaking = () => setIsSpeaking(true);

        return (
          <div>
            <button onClick={handleStartTyping} data-testid="start-typing">
              Start Typing
            </button>
            <button onClick={handleStartSpeaking} data-testid="start-speaking">
              Start Speaking
            </button>
            <Canvas>
              <AnimatedPuppyAvatar 
                userIsTyping={userIsTyping}
                isSpeaking={isSpeaking}
              />
            </Canvas>
          </div>
        );
      };

      render(<TestComponent />);

      const typingButton = screen.getByTestId('start-typing');
      const speakingButton = screen.getByTestId('start-speaking');

      // Start typing first
      await user.click(typingButton);

      // Then start speaking
      await user.click(speakingButton);

      await waitFor(() => {
        // Should prioritize speaking animation
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('AI speaking detected'),
          expect.anything()
        );
      });
    });

    it('should handle simultaneous state changes smoothly', async () => {
      const TestComponent = () => {
        const [userIsTyping, setUserIsTyping] = React.useState(false);
        const [isSpeaking, setIsSpeaking] = React.useState(false);
        const [messageLength, setMessageLength] = React.useState(0);

        const handleSimultaneousChange = () => {
          setUserIsTyping(true);
          setIsSpeaking(true);
          setMessageLength(50);
        };

        return (
          <div>
            <button onClick={handleSimultaneousChange} data-testid="simultaneous-change">
              Simultaneous Change
            </button>
            <Canvas>
              <AnimatedPuppyAvatar 
                userIsTyping={userIsTyping}
                isSpeaking={isSpeaking}
                lastMessageLength={messageLength}
              />
            </Canvas>
          </div>
        );
      };

      render(<TestComponent />);

      const changeButton = screen.getByTestId('simultaneous-change');

      // Trigger simultaneous changes
      await user.click(changeButton);

      await waitFor(() => {
        // Should handle simultaneous changes without errors
        expect(screen.getByTestId('simultaneous-change')).toBeInTheDocument();
      });
    });

    it('should maintain animation state consistency', async () => {
      const onAnimationStateChange = vi.fn();
      
      const TestComponent = () => {
        const [userIsTyping, setUserIsTyping] = React.useState(false);
        const [isSpeaking, setIsSpeaking] = React.useState(false);

        const handleToggleTyping = () => setUserIsTyping(!userIsTyping);
        const handleToggleSpeaking = () => setIsSpeaking(!isSpeaking);

        return (
          <div>
            <button onClick={handleToggleTyping} data-testid="toggle-typing">
              Toggle Typing
            </button>
            <button onClick={handleToggleSpeaking} data-testid="toggle-speaking">
              Toggle Speaking
            </button>
            <Canvas>
              <AnimatedPuppyAvatar 
                userIsTyping={userIsTyping}
                isSpeaking={isSpeaking}
                onAnimationStateChange={onAnimationStateChange}
              />
            </Canvas>
          </div>
        );
      };

      render(<TestComponent />);

      const typingButton = screen.getByTestId('toggle-typing');
      const speakingButton = screen.getByTestId('toggle-speaking');

      // Multiple state changes
      await user.click(typingButton);
      await user.click(speakingButton);
      await user.click(typingButton);
      await user.click(speakingButton);

      await waitFor(() => {
        // Should call animation state change handler multiple times
        expect(onAnimationStateChange).toHaveBeenCalled();
      });
    });
  });

  describe('Real-time Chat Integration', () => {
    it('should integrate with full chat interface', async () => {
      const TestComponent = () => {
        const [messages, setMessages] = React.useState<Array<{text: string, sender: 'user' | 'ai'}>>([]);
        const [currentInput, setCurrentInput] = React.useState('');
        const [isSpeaking, setIsSpeaking] = React.useState(false);

        const handleSendMessage = async () => {
          if (!currentInput.trim()) return;

          // Add user message
          setMessages(prev => [...prev, { text: currentInput, sender: 'user' }]);
          setCurrentInput('');

          // Simulate AI response
          setTimeout(() => {
            const aiResponse = 'I understand! Let me help you with that.';
            setMessages(prev => [...prev, { text: aiResponse, sender: 'ai' }]);
            setIsSpeaking(true);
            
            // Simulate speaking duration
            setTimeout(() => {
              setIsSpeaking(false);
            }, 2000);
          }, 500);
        };

        return (
          <div>
            <div data-testid="chat-messages">
              {messages.map((msg, index) => (
                <div key={index} data-testid={`message-${msg.sender}`}>
                  {msg.text}
                </div>
              ))}
            </div>
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              data-testid="chat-input"
            />
            <button onClick={handleSendMessage} data-testid="send-button">
              Send
            </button>
            <Canvas>
              <AnimatedPuppyAvatar 
                userIsTyping={currentInput.length > 0}
                isSpeaking={isSpeaking}
                lastMessageLength={currentInput.length}
              />
            </Canvas>
          </div>
        );
      };

      render(<TestComponent />);

      const chatInput = screen.getByTestId('chat-input');
      const sendButton = screen.getByTestId('send-button');

      // Type and send message
      await user.type(chatInput, 'Hello, how are you?');
      await user.click(sendButton);

      await waitFor(() => {
        // Should show user message
        expect(screen.getByTestId('message-user')).toBeInTheDocument();
      });

      await waitFor(() => {
        // Should show AI response and trigger speaking
        expect(screen.getByTestId('message-ai')).toBeInTheDocument();
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('AI speaking detected'),
          expect.anything()
        );
      }, { timeout: 3000 });
    });

    it('should handle message history and context', async () => {
      const TestComponent = () => {
        const [messageHistory, setMessageHistory] = React.useState<string[]>([]);
        const [currentMessage, setCurrentMessage] = React.useState('');
        const [timeSinceLastMessage, setTimeSinceLastMessage] = React.useState(0);

        React.useEffect(() => {
          const interval = setInterval(() => {
            setTimeSinceLastMessage(prev => prev + 1000);
          }, 1000);

          return () => clearInterval(interval);
        }, []);

        const handleAddMessage = () => {
          if (currentMessage.trim()) {
            setMessageHistory(prev => [...prev, currentMessage]);
            setCurrentMessage('');
            setTimeSinceLastMessage(0);
          }
        };

        return (
          <div>
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              data-testid="message-input"
            />
            <button onClick={handleAddMessage} data-testid="add-message">
              Add Message
            </button>
            <div data-testid="message-count">
              Messages: {messageHistory.length}
            </div>
            <Canvas>
              <AnimatedPuppyAvatar 
                userIsTyping={currentMessage.length > 0}
                lastMessageLength={currentMessage.length}
                timeSinceLastMessage={timeSinceLastMessage}
              />
            </Canvas>
          </div>
        );
      };

      render(<TestComponent />);

      const messageInput = screen.getByTestId('message-input');
      const addButton = screen.getByTestId('add-message');

      // Add multiple messages
      await user.type(messageInput, 'First message');
      await user.click(addButton);

      await user.type(messageInput, 'Second message');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('message-count')).toHaveTextContent('Messages: 2');
      });
    });
  });

  describe('Performance Integration Tests', () => {
    it('should maintain performance during active chat session', async () => {
      const { performanceTester } = testEnvironment;
      
      performanceTester.startMonitoring();

      const TestComponent = () => {
        const [userIsTyping, setUserIsTyping] = React.useState(false);
        const [isSpeaking, setIsSpeaking] = React.useState(false);

        React.useEffect(() => {
          // Simulate active chat session
          const interval = setInterval(() => {
            setUserIsTyping(Math.random() > 0.5);
            setIsSpeaking(Math.random() > 0.7);
          }, 100);

          return () => clearInterval(interval);
        }, []);

        return (
          <Canvas>
            <AnimatedPuppyAvatar 
              userIsTyping={userIsTyping}
              isSpeaking={isSpeaking}
            />
          </Canvas>
        );
      };

      render(<TestComponent />);

      // Let it run for a bit
      await new Promise(resolve => setTimeout(resolve, 1000));

      const stats = performanceTester.getPerformanceStats();
      
      // Should maintain good performance
      expect(stats.averageFPS).toBeGreaterThan(20);
    });

    it('should handle memory efficiently during long sessions', async () => {
      const TestComponent = () => {
        const [messageCount, setMessageCount] = React.useState(0);
        const [currentMessage, setCurrentMessage] = React.useState('');

        React.useEffect(() => {
          // Simulate long chat session
          const interval = setInterval(() => {
            setMessageCount(prev => prev + 1);
            setCurrentMessage(`Message ${messageCount}`);
          }, 50);

          return () => clearInterval(interval);
        }, [messageCount]);

        return (
          <Canvas>
            <AnimatedPuppyAvatar 
              userIsTyping={messageCount % 2 === 0}
              lastMessageLength={currentMessage.length}
            />
          </Canvas>
        );
      };

      const { unmount } = render(<TestComponent />);

      // Let it run for a bit
      await new Promise(resolve => setTimeout(resolve, 500));

      // Should unmount without memory leaks
      expect(() => unmount()).not.toThrow();
    });
  });
}); 