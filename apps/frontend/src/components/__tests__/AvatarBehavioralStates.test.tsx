import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import React from 'react';
import Avatar from '../Avatar';
import { AvatarQAValidator } from '../../utils/avatar-qa-validator';

describe('Avatar Behavioral States - User Interaction Response', () => {
  let qaValidator: AvatarQAValidator;
  let mockCanvas: HTMLCanvasElement;

  beforeEach(() => {
    qaValidator = new AvatarQAValidator();
    
    // Create a mock canvas for testing
    mockCanvas = document.createElement('canvas');
    mockCanvas.width = 800;
    mockCanvas.height = 600;
    document.body.appendChild(mockCanvas);
  });

  afterEach(() => {
    document.body.removeChild(mockCanvas);
  });

  describe('Idle State Behavior', () => {
    it('should display calm, natural idle behavior when no interaction is occurring', async () => {
      // BEHAVIOR: Avatar should look relaxed and natural when user is not interacting
      // EXPECTATION: Gentle breathing, occasional subtle movements, peaceful demeanor
      
      render(
        <Canvas>
          <Avatar 
            position={[0, 0, 0]} 
            isSpeaking={false}
            userIsTyping={false}
            timeSinceLastMessage={5000}
          />
        </Canvas>
      );

      const idleBehavior = await qaValidator.analyzeBehavioralState(mockCanvas, 'idle', 3000);
      
      expect(idleBehavior.state).toBe('idle');
      expect(idleBehavior.calmness).toBeGreaterThan(0.8);
      expect(idleBehavior.hasBreathing).toBe(true);
      expect(idleBehavior.hasSubtleMovements).toBe(true);
      expect(idleBehavior.energyLevel).toBeLessThan(0.4); // Low energy, relaxed
      expect(idleBehavior.naturalness).toBeGreaterThan(0.8);
    });

    it('should maintain idle state consistently without random energy spikes', async () => {
      // BEHAVIOR: Avatar should stay calm and consistent in idle state
      // EXPECTATION: No sudden movements or energy changes without user interaction
      
      render(
        <Canvas>
          <Avatar 
            position={[0, 0, 0]} 
            isSpeaking={false}
            userIsTyping={false}
            timeSinceLastMessage={10000}
          />
        </Canvas>
      );

      const consistencyAnalysis = await qaValidator.analyzeBehavioralConsistency(mockCanvas, 'idle', 5000);
      
      expect(consistencyAnalysis.isConsistent).toBe(true);
      expect(consistencyAnalysis.energyVariation).toBeLessThan(0.2); // Minimal variation
      expect(consistencyAnalysis.hasUnexpectedSpikes).toBe(false);
      expect(consistencyAnalysis.stateStability).toBeGreaterThan(0.9);
    });

    it('should gradually return to idle state after interaction ends', async () => {
      // BEHAVIOR: Avatar should smoothly transition back to calm state after activity
      // EXPECTATION: Gradual energy decrease, not abrupt stopping
      
      const { rerender } = render(
        <Canvas>
          <Avatar 
            position={[0, 0, 0]} 
            isSpeaking={true}
            userIsTyping={false}
          />
        </Canvas>
      );

      // Capture active state
      const activeState = await qaValidator.analyzeBehavioralState(mockCanvas, 'speaking', 1000);
      
      // End interaction
      rerender(
        <Canvas>
          <Avatar 
            position={[0, 0, 0]} 
            isSpeaking={false}
            userIsTyping={false}
            timeSinceLastMessage={0}
          />
        </Canvas>
      );

      const transitionAnalysis = await qaValidator.analyzeStateTransition(mockCanvas, 'speaking', 'idle', 3000);
      
      expect(transitionAnalysis.isGradual).toBe(true);
      expect(transitionAnalysis.transitionSmoothness).toBeGreaterThan(0.8);
      expect(transitionAnalysis.reachesTargetState).toBe(true);
      expect(transitionAnalysis.transitionTime).toBeLessThan(2000); // Within 2 seconds
    });
  });

  describe('Listening State Behavior', () => {
    it('should show attentive, focused behavior when user is typing', async () => {
      // BEHAVIOR: Avatar should appear engaged and ready to respond when user types
      // EXPECTATION: More upright posture, focused attention, anticipatory energy
      
      render(
        <Canvas>
          <Avatar 
            position={[0, 0, 0]} 
            isSpeaking={false}
            userIsTyping={true}
          />
        </Canvas>
      );

      const listeningBehavior = await qaValidator.analyzeBehavioralState(mockCanvas, 'listening', 2000);
      
      expect(listeningBehavior.state).toBe('listening');
      expect(listeningBehavior.attentiveness).toBeGreaterThan(0.7);
      expect(listeningBehavior.anticipation).toBeGreaterThan(0.6);
      expect(listeningBehavior.energyLevel).toBeGreaterThan(0.5); // More energy than idle
      expect(listeningBehavior.focusLevel).toBeGreaterThan(0.7);
    });

    it('should maintain listening state consistently while user continues typing', async () => {
      // BEHAVIOR: Avatar should stay attentive throughout typing session
      // EXPECTATION: Sustained attention without fatigue or distraction
      
      render(
        <Canvas>
          <Avatar 
            position={[0, 0, 0]} 
            isSpeaking={false}
            userIsTyping={true}
          />
        </Canvas>
      );

      const sustainedListening = await qaValidator.analyzeBehavioralConsistency(mockCanvas, 'listening', 4000);
      
      expect(sustainedListening.isConsistent).toBe(true);
      expect(sustainedListening.attentionMaintained).toBe(true);
      expect(sustainedListening.showsFatigue).toBe(false);
      expect(sustainedListening.engagementLevel).toBeGreaterThan(0.6);
    });

    it('should show increased anticipation as user types longer messages', async () => {
      // BEHAVIOR: Avatar should show more engagement for longer input
      // EXPECTATION: Growing anticipation and interest as message length increases
      
      const { rerender } = render(
        <Canvas>
          <Avatar 
            position={[0, 0, 0]} 
            userIsTyping={true}
            timeSinceLastMessage={1000}
          />
        </Canvas>
      );

      const shortTyping = await qaValidator.analyzeBehavioralState(mockCanvas, 'listening', 1000);
      
      // Simulate longer typing session
      rerender(
        <Canvas>
          <Avatar 
            position={[0, 0, 0]} 
            userIsTyping={true}
            timeSinceLastMessage={5000}
          />
        </Canvas>
      );

      const longTyping = await qaValidator.analyzeBehavioralState(mockCanvas, 'listening', 1000);
      
      expect(longTyping.anticipation).toBeGreaterThan(shortTyping.anticipation);
      expect(longTyping.engagementLevel).toBeGreaterThan(shortTyping.engagementLevel);
      expect(longTyping.energyLevel).toBeGreaterThan(shortTyping.energyLevel);
    });
  });

  describe('Speaking State Behavior', () => {
    it('should display animated, expressive behavior when avatar is speaking', async () => {
      // BEHAVIOR: Avatar should be lively and expressive during speech
      // EXPECTATION: Dynamic movements, facial expressions, engaging presence
      
      render(
        <Canvas>
          <Avatar 
            position={[0, 0, 0]} 
            isSpeaking={true}
            userIsTyping={false}
          />
        </Canvas>
      );

      const speakingBehavior = await qaValidator.analyzeBehavioralState(mockCanvas, 'speaking', 3000);
      
      expect(speakingBehavior.state).toBe('speaking');
      expect(speakingBehavior.expressiveness).toBeGreaterThan(0.7);
      expect(speakingBehavior.dynamism).toBeGreaterThan(0.6);
      expect(speakingBehavior.energyLevel).toBeGreaterThan(0.6);
      expect(speakingBehavior.hasMovement).toBe(true);
      expect(speakingBehavior.engagementLevel).toBeGreaterThan(0.7);
    });

    it('should adjust speaking animation intensity based on message length', async () => {
      // BEHAVIOR: Avatar should be more animated for longer, more enthusiastic messages
      // EXPECTATION: Energy and movement should scale with message content
      
      const { rerender } = render(
        <Canvas>
          <Avatar 
            position={[0, 0, 0]} 
            isSpeaking={true}
            lastMessageLength={20}
          />
        </Canvas>
      );

      const shortMessage = await qaValidator.analyzeBehavioralState(mockCanvas, 'speaking', 1500);
      
      rerender(
        <Canvas>
          <Avatar 
            position={[0, 0, 0]} 
            isSpeaking={true}
            lastMessageLength={150}
          />
        </Canvas>
      );

      const longMessage = await qaValidator.analyzeBehavioralState(mockCanvas, 'speaking', 1500);
      
      expect(longMessage.energyLevel).toBeGreaterThan(shortMessage.energyLevel);
      expect(longMessage.expressiveness).toBeGreaterThan(shortMessage.expressiveness);
      expect(longMessage.movementIntensity).toBeGreaterThan(shortMessage.movementIntensity);
    });

    it('should maintain speaking animation smoothly without interruption', async () => {
      // BEHAVIOR: Avatar should speak smoothly without glitches or stops
      // EXPECTATION: Continuous, fluid animation throughout speaking duration
      
      render(
        <Canvas>
          <Avatar 
            position={[0, 0, 0]} 
            isSpeaking={true}
            lastMessageLength={100}
          />
        </Canvas>
      );

      const speakingContinuity = await qaValidator.analyzeBehavioralConsistency(mockCanvas, 'speaking', 4000);
      
      expect(speakingContinuity.isConsistent).toBe(true);
      expect(speakingContinuity.hasContinuousAnimation).toBe(true);
      expect(speakingContinuity.hasInterruptions).toBe(false);
      expect(speakingContinuity.smoothness).toBeGreaterThan(0.8);
    });
  });

  describe('Interactive State Behavior', () => {
    it('should show heightened engagement when both typing and speaking occur', async () => {
      // BEHAVIOR: Avatar should be most animated during active conversation
      // EXPECTATION: Peak energy and engagement when both user and avatar are active
      
      render(
        <Canvas>
          <Avatar 
            position={[0, 0, 0]} 
            isSpeaking={true}
            userIsTyping={true}
            lastMessageLength={75}
          />
        </Canvas>
      );

      const interactiveBehavior = await qaValidator.analyzeBehavioralState(mockCanvas, 'interactive', 2000);
      
      expect(interactiveBehavior.state).toBe('interactive');
      expect(interactiveBehavior.energyLevel).toBeGreaterThan(0.8);
      expect(interactiveBehavior.engagementLevel).toBeGreaterThan(0.8);
      expect(interactiveBehavior.responsiveness).toBeGreaterThan(0.7);
      expect(interactiveBehavior.dynamism).toBeGreaterThan(0.7);
    });

    it('should handle rapid state changes during active conversation gracefully', async () => {
      // BEHAVIOR: Avatar should smoothly adapt to quick conversation changes
      // EXPECTATION: No jarring transitions during natural conversation flow
      
      const { rerender } = render(
        <Canvas>
          <Avatar position={[0, 0, 0]} />
        </Canvas>
      );

      const conversationStates = [
        { isSpeaking: false, userIsTyping: true },
        { isSpeaking: true, userIsTyping: false },
        { isSpeaking: false, userIsTyping: true },
        { isSpeaking: true, userIsTyping: true },
        { isSpeaking: false, userIsTyping: false }
      ];

      for (let i = 0; i < conversationStates.length; i++) {
        rerender(
          <Canvas>
            <Avatar position={[0, 0, 0]} {...conversationStates[i]} />
          </Canvas>
        );
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const stateAnalysis = await qaValidator.analyzeBehavioralState(mockCanvas, 'transition', 500);
        expect(stateAnalysis.smoothness).toBeGreaterThan(0.7);
        expect(stateAnalysis.hasJarringMovements).toBe(false);
      }
    });
  });

  describe('Emotional Response Behavior', () => {
    it('should show curiosity and interest for questions and short messages', async () => {
      // BEHAVIOR: Avatar should appear curious and engaged when asked questions
      // EXPECTATION: Inquisitive posture, head tilting, attentive expression
      
      render(
        <Canvas>
          <Avatar 
            position={[0, 0, 0]} 
            isSpeaking={true}
            lastMessageLength={25} // Short message suggesting question
          />
        </Canvas>
      );

      const curiousBehavior = await qaValidator.analyzeBehavioralState(mockCanvas, 'curious', 2000);
      
      expect(curiousBehavior.curiosity).toBeGreaterThan(0.6);
      expect(curiousBehavior.attentiveness).toBeGreaterThan(0.7);
      expect(curiousBehavior.hasInquisitiveMovements).toBe(true);
      expect(curiousBehavior.engagementLevel).toBeGreaterThan(0.6);
    });

    it('should display enthusiasm and excitement for long, energetic messages', async () => {
      // BEHAVIOR: Avatar should match user's energy level in responses
      // EXPECTATION: More animated, bouncy, enthusiastic behavior for excited messages
      
      render(
        <Canvas>
          <Avatar 
            position={[0, 0, 0]} 
            isSpeaking={true}
            lastMessageLength={200} // Long message suggesting enthusiasm
          />
        </Canvas>
      );

      const enthusiasticBehavior = await qaValidator.analyzeBehavioralState(mockCanvas, 'enthusiastic', 2000);
      
      expect(enthusiasticBehavior.enthusiasm).toBeGreaterThan(0.7);
      expect(enthusiasticBehavior.energyLevel).toBeGreaterThan(0.8);
      expect(enthusiasticBehavior.movementIntensity).toBeGreaterThan(0.6);
      expect(enthusiasticBehavior.hasBouncyMovements).toBe(true);
    });

    it('should show appropriate emotional transitions based on conversation context', async () => {
      // BEHAVIOR: Avatar should adapt emotional state to conversation flow
      // EXPECTATION: Natural emotional progression that matches conversation tone
      
      const { rerender } = render(
        <Canvas>
          <Avatar 
            position={[0, 0, 0]} 
            isSpeaking={true}
            lastMessageLength={30} // Start with curious state
          />
        </Canvas>
      );

      const initialEmotion = await qaValidator.analyzeBehavioralState(mockCanvas, 'curious', 1000);
      
      // Transition to enthusiastic response
      rerender(
        <Canvas>
          <Avatar 
            position={[0, 0, 0]} 
            isSpeaking={true}
            lastMessageLength={180} // Long enthusiastic message
          />
        </Canvas>
      );

      const emotionalTransition = await qaValidator.analyzeEmotionalTransition(
        mockCanvas, 
        'curious', 
        'enthusiastic', 
        2000
      );
      
      expect(emotionalTransition.isNatural).toBe(true);
      expect(emotionalTransition.transitionSmoothness).toBeGreaterThan(0.7);
      expect(emotionalTransition.reachesTargetEmotion).toBe(true);
      expect(emotionalTransition.isAppropriate).toBe(true);
    });
  });

  describe('Behavioral State Machine Integrity', () => {
    it('should maintain clear behavioral distinctions between different states', async () => {
      // BEHAVIOR: Each state should be visually distinct and recognizable
      // EXPECTATION: Clear differences between idle, listening, speaking, and interactive states
      
      const states = [
        { name: 'idle', props: { isSpeaking: false, userIsTyping: false, timeSinceLastMessage: 5000 } },
        { name: 'listening', props: { isSpeaking: false, userIsTyping: true } },
        { name: 'speaking', props: { isSpeaking: true, userIsTyping: false, lastMessageLength: 50 } },
        { name: 'interactive', props: { isSpeaking: true, userIsTyping: true, lastMessageLength: 75 } }
      ];

      const stateSignatures = [];

      for (const state of states) {
        const { rerender } = render(
          <Canvas>
            <Avatar position={[0, 0, 0]} {...state.props} />
          </Canvas>
        );

        const stateAnalysis = await qaValidator.analyzeBehavioralState(mockCanvas, state.name, 1500);
        stateSignatures.push({
          name: state.name,
          signature: stateAnalysis
        });
      }

      // Verify each state is distinct
      for (let i = 0; i < stateSignatures.length; i++) {
        for (let j = i + 1; j < stateSignatures.length; j++) {
          const distinctness = qaValidator.compareStateBehaviors(
            stateSignatures[i].signature,
            stateSignatures[j].signature
          );
          
          expect(distinctness.areDistinct).toBe(true);
          expect(distinctness.distinctionLevel).toBeGreaterThan(0.5);
        }
      }
    });

    it('should handle edge cases and invalid states gracefully', async () => {
      // BEHAVIOR: Avatar should handle unusual state combinations without breaking
      // EXPECTATION: Graceful fallback behavior for edge cases
      
      const edgeCases = [
        { isSpeaking: true, userIsTyping: true, lastMessageLength: 0 }, // Speaking with no message
        { isSpeaking: false, userIsTyping: false, lastMessageLength: 1000 }, // Idle with huge message
        { isSpeaking: true, userIsTyping: true, timeSinceLastMessage: 0 } // Simultaneous everything
      ];

      for (const edgeCase of edgeCases) {
        const { rerender } = render(
          <Canvas>
            <Avatar position={[0, 0, 0]} {...edgeCase} />
          </Canvas>
        );

        const edgeAnalysis = await qaValidator.analyzeBehavioralState(mockCanvas, 'edge_case', 1000);
        
        expect(edgeAnalysis.isStable).toBe(true);
        expect(edgeAnalysis.hasErrors).toBe(false);
        expect(edgeAnalysis.fallbackBehavior).toBe('graceful');
      }
    });
  });
}); 