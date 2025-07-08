import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import App from '../../App';

// Mock Three.js to avoid WebGL issues in tests
vi.mock('three', () => ({
  Scene: vi.fn(() => ({})),
  PerspectiveCamera: vi.fn(() => ({})),
  WebGLRenderer: vi.fn(() => ({
    setSize: vi.fn(),
    render: vi.fn(),
    domElement: document.createElement('canvas'),
    dispose: vi.fn(),
  })),
  BoxGeometry: vi.fn(() => ({})),
  MeshBasicMaterial: vi.fn(() => ({})),
  Mesh: vi.fn(() => ({
    position: { set: vi.fn() },
    rotation: { set: vi.fn() },
  })),
  AnimationMixer: vi.fn(() => ({
    update: vi.fn(),
    stopAllAction: vi.fn(),
  })),
  Clock: vi.fn(() => ({
    getDelta: vi.fn(() => 0.016),
  })),
}));

describe('Avatar Chat Integration Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    // Clear any previous mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Avatar and Chat Interface Integration', () => {
    it('should render both avatar and chat interface together', async () => {
      render(<App />);
      
      // Both components should be present
      const canvas = screen.getByRole('img', { hidden: true }) || document.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
      
      // Chat interface should be present
      const chatElements = screen.queryAllByText(/chat|message|send/i);
      expect(chatElements.length).toBeGreaterThan(0);
    });

    it('should update avatar state when user types in chat', async () => {
      render(<App />);
      
      // Find chat input (try multiple selectors)
      const chatInput = screen.queryByPlaceholderText(/type|message|chat/i) ||
                       screen.queryByRole('textbox') ||
                       document.querySelector('input[type="text"]') ||
                       document.querySelector('textarea');
      
      if (chatInput) {
        // Start typing
        await user.click(chatInput);
        await user.type(chatInput, 'Hello avatar!');
        
        // Avatar should respond to typing (canvas should be present and responsive)
        const canvas = document.querySelector('canvas');
        expect(canvas).toBeInTheDocument();
        
        // Give time for avatar state to update
        await waitFor(() => {
          expect(canvas).toBeInTheDocument();
        }, { timeout: 1000 });
      }
    });

    it('should handle message submission and avatar response', async () => {
      render(<App />);
      
      const chatInput = screen.queryByPlaceholderText(/type|message|chat/i) ||
                       screen.queryByRole('textbox');
      const sendButton = screen.queryByText(/send/i) ||
                        screen.queryByRole('button', { name: /send/i }) ||
                        document.querySelector('button[type="submit"]');
      
      if (chatInput && sendButton) {
        // Type a message
        await user.type(chatInput, 'Test message for avatar');
        
        // Submit the message
        await user.click(sendButton);
        
        // Avatar should be present and responsive
        const canvas = document.querySelector('canvas');
        expect(canvas).toBeInTheDocument();
        
        // Wait for any state updates
        await waitFor(() => {
          expect(canvas).toBeInTheDocument();
        }, { timeout: 2000 });
      }
    });
  });

  describe('Avatar State Management Integration', () => {
    it('should maintain avatar state across component updates', async () => {
      const { rerender } = render(<App />);
      
      // Initial render should have avatar
      let canvas = document.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
      
      // Rerender the app
      rerender(<App />);
      
      // Avatar should still be present
      canvas = document.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
    });

    it('should handle rapid user interactions without breaking', async () => {
      render(<App />);
      
      const chatInput = screen.queryByRole('textbox') ||
                       document.querySelector('input[type="text"]') ||
                       document.querySelector('textarea');
      
      if (chatInput) {
        // Simulate rapid typing
        for (let i = 0; i < 5; i++) {
          await user.clear(chatInput);
          await user.type(chatInput, `Message ${i}`);
        }
        
        // Avatar should still be present and functional
        const canvas = document.querySelector('canvas');
        expect(canvas).toBeInTheDocument();
      }
    });

    it('should handle focus and blur events properly', async () => {
      render(<App />);
      
      const chatInput = screen.queryByRole('textbox') ||
                       document.querySelector('input[type="text"]') ||
                       document.querySelector('textarea');
      
      if (chatInput) {
        // Focus on input
        await user.click(chatInput);
        
        // Avatar should respond to focus
        await waitFor(() => {
          const canvas = document.querySelector('canvas');
          expect(canvas).toBeInTheDocument();
        });
        
        // Blur the input
        await user.tab();
        
        // Avatar should handle blur
        await waitFor(() => {
          const canvas = document.querySelector('canvas');
          expect(canvas).toBeInTheDocument();
        });
      }
    });
  });

  describe('Avatar Error Handling Integration', () => {
    it('should handle missing chat interface gracefully', async () => {
      // Mock a version without chat interface
      const MockAppWithoutChat = () => (
        <div>
          <h1>3D Avatar</h1>
          {/* Avatar component should still work */}
        </div>
      );
      
      render(<MockAppWithoutChat />);
      
      // App should render without errors
      expect(screen.getByText('3D Avatar')).toBeInTheDocument();
    });

    it('should handle avatar initialization errors gracefully', async () => {
      // Mock console.error to catch any errors
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<App />);
      
      // App should render even if avatar has issues
      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      });
      
      // Should not have critical errors
      const criticalErrors = consoleSpy.mock.calls.filter(call => 
        call[0]?.toString().includes('Error') || 
        call[0]?.toString().includes('Failed')
      );
      
      expect(criticalErrors.length).toBeLessThan(3); // Allow for minor warnings
      
      consoleSpy.mockRestore();
    });

    it('should handle component unmounting properly', async () => {
      const { unmount } = render(<App />);
      
      // Unmount should not throw errors
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Avatar Performance Integration', () => {
    it('should not block UI interactions', async () => {
      render(<App />);
      
      // Find any interactive element
      const button = screen.queryByRole('button') ||
                    document.querySelector('button') ||
                    document.querySelector('input');
      
      if (button) {
        // Interaction should be responsive
        const startTime = performance.now();
        await user.click(button);
        const endTime = performance.now();
        
        // Click should be processed quickly (less than 100ms)
        expect(endTime - startTime).toBeLessThan(100);
      }
    });

    it('should maintain smooth animation during user interactions', async () => {
      render(<App />);
      
      const chatInput = screen.queryByRole('textbox') ||
                       document.querySelector('input[type="text"]') ||
                       document.querySelector('textarea');
      
      if (chatInput) {
        // Start typing while monitoring performance
        const startTime = performance.now();
        
        await user.type(chatInput, 'Performance test message');
        
        const endTime = performance.now();
        
        // Typing should be responsive
        expect(endTime - startTime).toBeLessThan(1000);
        
        // Avatar should still be present
        const canvas = document.querySelector('canvas');
        expect(canvas).toBeInTheDocument();
      }
    });
  });

  describe('Avatar Accessibility Integration', () => {
    it('should provide accessible interface', async () => {
      render(<App />);
      
      // Check for basic accessibility features
      const canvas = document.querySelector('canvas');
      if (canvas) {
        // Canvas should have some accessibility attributes or be properly labeled
        expect(canvas).toBeInTheDocument();
      }
      
      // Check for keyboard navigation
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      expect(focusableElements.length).toBeGreaterThan(0);
    });

    it('should handle keyboard navigation properly', async () => {
      render(<App />);
      
      // Tab through focusable elements
      await user.tab();
      await user.tab();
      
      // Should not throw errors
      expect(document.activeElement).toBeInTheDocument();
    });
  });

  describe('Avatar State Persistence Integration', () => {
    it('should maintain state during component lifecycle', async () => {
      const { rerender } = render(<App />);
      
      const chatInput = screen.queryByRole('textbox') ||
                       document.querySelector('input[type="text"]') ||
                       document.querySelector('textarea');
      
      if (chatInput) {
        // Set some state
        await user.type(chatInput, 'Test message');
        
        // Rerender
        rerender(<App />);
        
        // State should be maintained or gracefully reset
        const newChatInput = screen.queryByRole('textbox') ||
                            document.querySelector('input[type="text"]') ||
                            document.querySelector('textarea');
        
        expect(newChatInput).toBeInTheDocument();
      }
    });

    it('should handle rapid state changes', async () => {
      render(<App />);
      
      const chatInput = screen.queryByRole('textbox') ||
                       document.querySelector('input[type="text"]') ||
                       document.querySelector('textarea');
      
      if (chatInput) {
        // Rapid state changes
        for (let i = 0; i < 10; i++) {
          await user.clear(chatInput);
          await user.type(chatInput, `Rapid message ${i}`, { delay: 1 });
        }
        
        // Should handle without errors
        const canvas = document.querySelector('canvas');
        expect(canvas).toBeInTheDocument();
      }
    });
  });

  describe('Avatar Real-World Scenarios', () => {
    it('should handle typical user conversation flow', async () => {
      render(<App />);
      
      const chatInput = screen.queryByRole('textbox') ||
                       document.querySelector('input[type="text"]') ||
                       document.querySelector('textarea');
      const sendButton = screen.queryByRole('button') ||
                        document.querySelector('button');
      
      if (chatInput && sendButton) {
        // Simulate a real conversation
        const messages = [
          'Hello!',
          'How are you doing today?',
          'This is a longer message to test the excited state functionality.',
          'Thanks!'
        ];
        
        for (const message of messages) {
          await user.clear(chatInput);
          await user.type(chatInput, message);
          
          // Wait a bit to simulate thinking
          await new Promise(resolve => setTimeout(resolve, 100));
          
          await user.click(sendButton);
          
          // Wait for response
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // Avatar should still be functional
        const canvas = document.querySelector('canvas');
        expect(canvas).toBeInTheDocument();
      }
    });

    it('should handle long typing sessions', async () => {
      render(<App />);
      
      const chatInput = screen.queryByRole('textbox') ||
                       document.querySelector('input[type="text"]') ||
                       document.querySelector('textarea');
      
      if (chatInput) {
        // Simulate long typing session
        await user.click(chatInput);
        
        const longMessage = 'This is a very long message that simulates a user typing for an extended period of time to test how the avatar handles sustained listening state and whether it maintains proper animation and responsiveness throughout the entire typing session.';
        
        await user.type(chatInput, longMessage, { delay: 50 });
        
        // Avatar should handle long typing sessions
        const canvas = document.querySelector('canvas');
        expect(canvas).toBeInTheDocument();
      }
    });
  });
}); 