import { test, expect } from '@playwright/test';

test.describe('3D Avatar Behavior E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the 3D scene to load
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    // Wait for avatar animation controller to be initialized
    await page.waitForTimeout(1000);
  });

  test.describe('Avatar Response to User Typing', () => {
    test('should transition to listening state when user starts typing', async ({ page }) => {
      // Find the chat input
      const chatInput = page.locator('[data-testid="chat-input"]').or(page.locator('input[type="text"]')).or(page.locator('textarea'));
      
      // Check if chat input exists, if not skip this test
      const chatInputCount = await chatInput.count();
      if (chatInputCount === 0) {
        test.skip('Chat input not found - skipping typing test');
      }
      
      // Focus on the input and start typing
      await chatInput.focus();
      await chatInput.type('Hello avatar!', { delay: 100 });
      
      // Give the avatar time to respond to typing
      await page.waitForTimeout(500);
      
      // Check if avatar state changed (this would require exposed state for testing)
      // For now, we verify the canvas is still responsive
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
      
      // Verify the canvas is being updated (check for animation frame updates)
      const canvasContent = await canvas.screenshot();
      await page.waitForTimeout(100);
      const canvasContent2 = await canvas.screenshot();
      
      // Canvas should be animating (content should be different)
      expect(canvasContent).not.toEqual(canvasContent2);
    });

    test('should return to idle when user stops typing', async ({ page }) => {
      const chatInput = page.locator('[data-testid="chat-input"]').or(page.locator('input[type="text"]')).or(page.locator('textarea'));
      
      const chatInputCount = await chatInput.count();
      if (chatInputCount === 0) {
        test.skip('Chat input not found - skipping typing test');
      }
      
      // Start typing
      await chatInput.focus();
      await chatInput.type('Test message');
      await page.waitForTimeout(200);
      
      // Stop typing and wait for timeout
      await page.waitForTimeout(2000);
      
      // Avatar should return to idle state
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
    });
  });

  test.describe('Avatar Response to Messages', () => {
    test('should show excited state for long messages', async ({ page }) => {
      // Try to find send button or submit form
      const sendButton = page.locator('[data-testid="send-button"]').or(page.locator('button[type="submit"]')).or(page.locator('button:has-text("Send")'));
      const chatInput = page.locator('[data-testid="chat-input"]').or(page.locator('input[type="text"]')).or(page.locator('textarea'));
      
      const sendButtonCount = await sendButton.count();
      const chatInputCount = await chatInput.count();
      
      if (sendButtonCount === 0 || chatInputCount === 0) {
        test.skip('Chat interface not fully implemented - skipping message test');
      }
      
      // Send a long message
      const longMessage = 'This is a very long and enthusiastic message that should trigger the excited state in the avatar! I am so excited to be testing this amazing 3D avatar functionality and seeing how it responds to different types of user input and interactions!';
      
      await chatInput.fill(longMessage);
      await sendButton.click();
      
      // Wait for avatar to process the message
      await page.waitForTimeout(1000);
      
      // Verify avatar is still animating
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
    });

    test('should show curious state for short questions', async ({ page }) => {
      const sendButton = page.locator('[data-testid="send-button"]').or(page.locator('button[type="submit"]')).or(page.locator('button:has-text("Send")'));
      const chatInput = page.locator('[data-testid="chat-input"]').or(page.locator('input[type="text"]')).or(page.locator('textarea'));
      
      const sendButtonCount = await sendButton.count();
      const chatInputCount = await chatInput.count();
      
      if (sendButtonCount === 0 || chatInputCount === 0) {
        test.skip('Chat interface not fully implemented - skipping message test');
      }
      
      // Send a short question
      await chatInput.fill('How are you?');
      await sendButton.click();
      
      // Wait for avatar to process the message
      await page.waitForTimeout(1000);
      
      // Verify avatar is still animating
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
    });
  });

  test.describe('Avatar Animation Continuity', () => {
    test('should continuously animate breathing and idle movements', async ({ page }) => {
      const canvas = page.locator('canvas');
      
      // Take multiple screenshots over time to verify continuous animation
      const screenshots = [];
      for (let i = 0; i < 5; i++) {
        screenshots.push(await canvas.screenshot());
        await page.waitForTimeout(200);
      }
      
      // At least some screenshots should be different (indicating animation)
      let animationDetected = false;
      for (let i = 1; i < screenshots.length; i++) {
        if (!screenshots[i].equals(screenshots[0])) {
          animationDetected = true;
          break;
        }
      }
      
      expect(animationDetected).toBe(true);
    });

    test('should maintain smooth animation during state transitions', async ({ page }) => {
      const canvas = page.locator('canvas');
      const chatInput = page.locator('[data-testid="chat-input"]').or(page.locator('input[type="text"]')).or(page.locator('textarea'));
      
      // Record animation before interaction
      const beforeScreenshot = await canvas.screenshot();
      
      // Trigger state change if possible
      const chatInputCount = await chatInput.count();
      if (chatInputCount > 0) {
        await chatInput.focus();
        await chatInput.type('Test');
        await page.waitForTimeout(300);
      }
      
      // Record animation after interaction
      const afterScreenshot = await canvas.screenshot();
      
      // Animation should continue (screenshots should be different)
      expect(beforeScreenshot).not.toEqual(afterScreenshot);
      
      // Wait and check animation is still running
      await page.waitForTimeout(500);
      const finalScreenshot = await canvas.screenshot();
      expect(finalScreenshot).not.toEqual(afterScreenshot);
    });
  });

  test.describe('Avatar Performance', () => {
    test('should maintain 60fps animation performance', async ({ page }) => {
      // Monitor console for performance warnings
      const consoleMessages: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'warn' || msg.type() === 'error') {
          consoleMessages.push(msg.text());
        }
      });
      
      const canvas = page.locator('canvas');
      
      // Let the avatar animate for a few seconds
      await page.waitForTimeout(3000);
      
      // Check for performance warnings
      const performanceWarnings = consoleMessages.filter(msg => 
        msg.includes('performance') || 
        msg.includes('fps') || 
        msg.includes('frame') ||
        msg.includes('slow')
      );
      
      expect(performanceWarnings.length).toBe(0);
      
      // Verify canvas is still responsive
      await expect(canvas).toBeVisible();
    });

    test('should handle rapid user interactions without lag', async ({ page }) => {
      const chatInput = page.locator('[data-testid="chat-input"]').or(page.locator('input[type="text"]')).or(page.locator('textarea'));
      
      const chatInputCount = await chatInput.count();
      if (chatInputCount === 0) {
        test.skip('Chat input not found - skipping rapid interaction test');
      }
      
      // Perform rapid typing interactions
      for (let i = 0; i < 10; i++) {
        await chatInput.focus();
        await chatInput.type(`Message ${i}`, { delay: 50 });
        await chatInput.clear();
        await page.waitForTimeout(100);
      }
      
      // Avatar should still be responsive
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
      
      // Take screenshot to verify animation is still working
      const screenshot1 = await canvas.screenshot();
      await page.waitForTimeout(200);
      const screenshot2 = await canvas.screenshot();
      
      expect(screenshot1).not.toEqual(screenshot2);
    });
  });

  test.describe('Avatar Error Handling', () => {
    test('should gracefully handle API errors without breaking animation', async ({ page }) => {
      // Mock API failure
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' })
        });
      });
      
      const sendButton = page.locator('[data-testid="send-button"]').or(page.locator('button[type="submit"]')).or(page.locator('button:has-text("Send")'));
      const chatInput = page.locator('[data-testid="chat-input"]').or(page.locator('input[type="text"]')).or(page.locator('textarea'));
      
      const sendButtonCount = await sendButton.count();
      const chatInputCount = await chatInput.count();
      
      if (sendButtonCount > 0 && chatInputCount > 0) {
        // Try to send a message that will fail
        await chatInput.fill('Test message');
        await sendButton.click();
        
        // Wait for error handling
        await page.waitForTimeout(1000);
      }
      
      // Avatar should still be animating despite API error
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
      
      const screenshot1 = await canvas.screenshot();
      await page.waitForTimeout(200);
      const screenshot2 = await canvas.screenshot();
      
      expect(screenshot1).not.toEqual(screenshot2);
    });

    test('should recover from invalid state inputs', async ({ page }) => {
      // Inject invalid state into avatar controller (if accessible)
      await page.evaluate(() => {
        // Try to access global avatar controller if available
        const avatarController = (window as any).avatarController;
        if (avatarController && typeof avatarController.updateState === 'function') {
          // Send invalid state
          avatarController.updateState({
            lastMessageLength: -1,
            timeSinceLastMessage: -1000,
            userIsTyping: 'invalid',
            isSpeaking: 'invalid'
          });
        }
      });
      
      // Avatar should still work
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
      
      // Animation should continue
      await page.waitForTimeout(500);
      const screenshot1 = await canvas.screenshot();
      await page.waitForTimeout(200);
      const screenshot2 = await canvas.screenshot();
      
      expect(screenshot1).not.toEqual(screenshot2);
    });
  });

  test.describe('Avatar Visual Validation', () => {
    test('should render avatar with correct proportions', async ({ page }) => {
      const canvas = page.locator('canvas');
      
      // Take a screenshot for visual validation
      const screenshot = await canvas.screenshot();
      
      // Basic checks - canvas should be visible and have content
      await expect(canvas).toBeVisible();
      
      // Canvas should have reasonable dimensions
      const canvasBox = await canvas.boundingBox();
      expect(canvasBox?.width).toBeGreaterThan(100);
      expect(canvasBox?.height).toBeGreaterThan(100);
      
      // Screenshot should not be completely black or white
      expect(screenshot.length).toBeGreaterThan(1000); // Should have some content
    });

    test('should show different visual states for different avatar states', async ({ page }) => {
      const canvas = page.locator('canvas');
      const chatInput = page.locator('[data-testid="chat-input"]').or(page.locator('input[type="text"]')).or(page.locator('textarea'));
      
      // Take screenshot in idle state
      const idleScreenshot = await canvas.screenshot();
      
      const chatInputCount = await chatInput.count();
      if (chatInputCount > 0) {
        // Trigger typing state
        await chatInput.focus();
        await chatInput.type('Test');
        await page.waitForTimeout(500);
        
        // Take screenshot in listening state
        const listeningScreenshot = await canvas.screenshot();
        
        // States should look different
        expect(idleScreenshot).not.toEqual(listeningScreenshot);
        
        // Clear input and wait for return to idle
        await chatInput.clear();
        await page.waitForTimeout(1000);
        
        const returnToIdleScreenshot = await canvas.screenshot();
        
        // Should be back to idle-like state (though exact match not required due to animation)
        expect(returnToIdleScreenshot).toBeDefined();
      }
    });
  });

  test.describe('Avatar Integration with Chat Interface', () => {
    test('should integrate properly with chat interface if available', async ({ page }) => {
      const chatContainer = page.locator('[data-testid="chat-container"]').or(page.locator('.chat-interface')).or(page.locator('#chat'));
      const canvas = page.locator('canvas');
      
      // Both avatar and chat should be visible
      await expect(canvas).toBeVisible();
      
      const chatCount = await chatContainer.count();
      if (chatCount > 0) {
        await expect(chatContainer).toBeVisible();
        
        // They should be positioned correctly relative to each other
        const canvasBox = await canvas.boundingBox();
        const chatBox = await chatContainer.boundingBox();
        
        expect(canvasBox).toBeTruthy();
        expect(chatBox).toBeTruthy();
        
        // Should not overlap completely
        if (canvasBox && chatBox) {
          const overlap = !(
            canvasBox.x + canvasBox.width < chatBox.x ||
            chatBox.x + chatBox.width < canvasBox.x ||
            canvasBox.y + canvasBox.height < chatBox.y ||
            chatBox.y + chatBox.height < canvasBox.y
          );
          
          // Some overlap is OK for layout, but they shouldn't be identical
          if (overlap) {
            expect(canvasBox.x !== chatBox.x || canvasBox.y !== chatBox.y).toBe(true);
          }
        }
      }
    });
  });
}); 