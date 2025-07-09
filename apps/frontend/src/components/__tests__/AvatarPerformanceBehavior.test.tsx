import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import React from 'react';
import Avatar from '../Avatar';
import { AvatarQAValidator } from '../../utils/avatar-qa-validator';

describe('Avatar Performance Behavior - Real-World Metrics', () => {
  let qaValidator: AvatarQAValidator;
  let mockCanvas: HTMLCanvasElement;
  let performanceObserver: PerformanceObserver;
  let performanceMetrics: PerformanceEntry[];

  beforeEach(() => {
    qaValidator = new AvatarQAValidator();
    performanceMetrics = [];
    
    // Create a mock canvas for testing
    mockCanvas = document.createElement('canvas');
    mockCanvas.width = 800;
    mockCanvas.height = 600;
    document.body.appendChild(mockCanvas);

    // Set up performance monitoring
    performanceObserver = new PerformanceObserver((list) => {
      performanceMetrics.push(...list.getEntries());
    });
    performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
  });

  afterEach(() => {
    document.body.removeChild(mockCanvas);
    performanceObserver.disconnect();
  });

  describe('Frame Rate Performance', () => {
    it('should maintain smooth 60fps animation during normal conversation', async () => {
      // BEHAVIOR: Avatar should animate smoothly without stuttering during typical use
      // EXPECTATION: Consistent 60fps that feels responsive and natural to users
      
      render(
        <Canvas>
          <Avatar 
            position={[0, 0, 0]} 
            isSpeaking={false}
            userIsTyping={false}
          />
        </Canvas>
      );

      const frameRateAnalysis = await qaValidator.monitorFrameRate(mockCanvas, 3000);
      
      expect(frameRateAnalysis.averageFPS).toBeGreaterThan(55);
      expect(frameRateAnalysis.minimumFPS).toBeGreaterThan(45);
      expect(frameRateAnalysis.frameDropPercentage).toBeLessThan(5);
      expect(frameRateAnalysis.smoothnessScore).toBeGreaterThan(0.9);
      
      // Performance should be graded as A or B
      expect(frameRateAnalysis.performanceGrade).toMatch(/^[AB]$/);
    });

    it('should maintain performance during active conversation with typing and speaking', async () => {
      // BEHAVIOR: Avatar should handle active conversation without performance degradation
      // EXPECTATION: No slowdown when user is typing and avatar is responding
      
      const { rerender } = render(
        <Canvas>
          <Avatar position={[0, 0, 0]} />
        </Canvas>
      );

      // Simulate active conversation
      const conversationStates = [
        { isSpeaking: false, userIsTyping: true, lastMessageLength: 50 },
        { isSpeaking: true, userIsTyping: false, lastMessageLength: 100 },
        { isSpeaking: false, userIsTyping: true, lastMessageLength: 25 },
        { isSpeaking: true, userIsTyping: false, lastMessageLength: 75 }
      ];

      for (const state of conversationStates) {
        rerender(
          <Canvas>
            <Avatar position={[0, 0, 0]} {...state} />
          </Canvas>
        );
        
        // Monitor performance during each state
        const statePerformance = await qaValidator.monitorFrameRate(mockCanvas, 1000);
        expect(statePerformance.averageFPS).toBeGreaterThan(50);
        expect(statePerformance.smoothnessScore).toBeGreaterThan(0.85);
      }
    });

    it('should handle rapid state changes without performance impact', async () => {
      // BEHAVIOR: Avatar should remain smooth during quick interaction changes
      // EXPECTATION: No frame drops or stuttering when states change rapidly
      
      const { rerender } = render(
        <Canvas>
          <Avatar position={[0, 0, 0]} />
        </Canvas>
      );

      // Rapidly change states to stress test
      const rapidStates = [
        { isSpeaking: true, userIsTyping: false },
        { isSpeaking: false, userIsTyping: true },
        { isSpeaking: true, userIsTyping: true },
        { isSpeaking: false, userIsTyping: false }
      ];

      // Start performance monitoring
      const startTime = performance.now();
      
      for (let i = 0; i < 20; i++) {
        const state = rapidStates[i % rapidStates.length];
        rerender(
          <Canvas>
            <Avatar position={[0, 0, 0]} {...state} />
          </Canvas>
        );
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      const stressTestPerformance = await qaValidator.monitorFrameRate(mockCanvas, 1000);
      
      expect(stressTestPerformance.averageFPS).toBeGreaterThan(45);
      expect(stressTestPerformance.frameDropPercentage).toBeLessThan(10);
      expect(stressTestPerformance.hasStuttering).toBe(false);
    });
  });

  describe('Memory Usage Behavior', () => {
    it('should use reasonable memory that does not impact system performance', async () => {
      // BEHAVIOR: Avatar should be memory efficient and not cause system slowdown
      // EXPECTATION: Memory usage under 100MB with no memory leaks over time
      
      render(
        <Canvas>
          <Avatar position={[0, 0, 0]} />
        </Canvas>
      );

      const memoryAnalysis = await qaValidator.monitorMemoryUsage(mockCanvas, 5000);
      
      expect(memoryAnalysis.peakMemoryMB).toBeLessThan(100);
      expect(memoryAnalysis.averageMemoryMB).toBeLessThan(75);
      expect(memoryAnalysis.memoryLeakDetected).toBe(false);
      expect(memoryAnalysis.memoryGrowthRate).toBeLessThan(0.1); // Less than 10% growth
    });

    it('should maintain stable memory usage during extended conversation', async () => {
      // BEHAVIOR: Avatar should not accumulate memory over long conversations
      // EXPECTATION: Stable memory usage even after many state changes
      
      const { rerender } = render(
        <Canvas>
          <Avatar position={[0, 0, 0]} />
        </Canvas>
      );

      // Simulate extended conversation
      for (let i = 0; i < 50; i++) {
        rerender(
          <Canvas>
            <Avatar 
              position={[0, 0, 0]} 
              isSpeaking={i % 2 === 0}
              userIsTyping={i % 3 === 0}
              lastMessageLength={Math.floor(Math.random() * 100) + 10}
            />
          </Canvas>
        );
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const extendedMemoryAnalysis = await qaValidator.monitorMemoryUsage(mockCanvas, 2000);
      
      expect(extendedMemoryAnalysis.isStable).toBe(true);
      expect(extendedMemoryAnalysis.memoryLeakDetected).toBe(false);
      expect(extendedMemoryAnalysis.peakMemoryMB).toBeLessThan(120); // Allow slight increase
    });

    it('should clean up resources when avatar is unmounted', async () => {
      // BEHAVIOR: Avatar should properly release resources when no longer needed
      // EXPECTATION: Memory returns to baseline after avatar is removed
      
      const initialMemory = await qaValidator.measureMemoryUsage();
      
      const { unmount } = render(
        <Canvas>
          <Avatar position={[0, 0, 0]} />
        </Canvas>
      );

      // Let avatar run for a bit
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const duringMemory = await qaValidator.measureMemoryUsage();
      expect(duringMemory.totalMB).toBeGreaterThan(initialMemory.totalMB);
      
      // Unmount and check cleanup
      unmount();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const afterMemory = await qaValidator.measureMemoryUsage();
      const memoryDifference = afterMemory.totalMB - initialMemory.totalMB;
      
      expect(memoryDifference).toBeLessThan(10); // Most memory should be freed
    });
  });

  describe('Response Time Behavior', () => {
    it('should respond quickly to user typing with minimal delay', async () => {
      // BEHAVIOR: Avatar should show immediate response when user starts typing
      // EXPECTATION: Visual response within 100ms of typing state change
      
      const { rerender } = render(
        <Canvas>
          <Avatar position={[0, 0, 0]} userIsTyping={false} />
        </Canvas>
      );

      const startTime = performance.now();
      
      rerender(
        <Canvas>
          <Avatar position={[0, 0, 0]} userIsTyping={true} />
        </Canvas>
      );

      const responseAnalysis = await qaValidator.measureResponseTime(mockCanvas, 'typing');
      
      expect(responseAnalysis.responseTimeMs).toBeLessThan(100);
      expect(responseAnalysis.isResponsive).toBe(true);
      expect(responseAnalysis.userPerceivedDelay).toBe('none');
    });

    it('should transition smoothly to speaking state without delay', async () => {
      // BEHAVIOR: Avatar should immediately start speaking animation when message is sent
      // EXPECTATION: No noticeable delay between message send and avatar response
      
      const { rerender } = render(
        <Canvas>
          <Avatar position={[0, 0, 0]} isSpeaking={false} />
        </Canvas>
      );

      const startTime = performance.now();
      
      rerender(
        <Canvas>
          <Avatar position={[0, 0, 0]} isSpeaking={true} />
        </Canvas>
      );

      const speakingResponse = await qaValidator.measureResponseTime(mockCanvas, 'speaking');
      
      expect(speakingResponse.responseTimeMs).toBeLessThan(50);
      expect(speakingResponse.isResponsive).toBe(true);
      expect(speakingResponse.animationStartDelay).toBeLessThan(100);
    });

    it('should handle multiple rapid state changes without accumulating delay', async () => {
      // BEHAVIOR: Avatar should remain responsive even with rapid state changes
      // EXPECTATION: No delay accumulation that makes avatar feel sluggish
      
      const { rerender } = render(
        <Canvas>
          <Avatar position={[0, 0, 0]} />
        </Canvas>
      );

      const responseTimes: number[] = [];
      
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now();
        
        rerender(
          <Canvas>
            <Avatar 
              position={[0, 0, 0]} 
              isSpeaking={i % 2 === 0}
              userIsTyping={i % 3 === 0}
            />
          </Canvas>
        );

        const responseTime = await qaValidator.measureResponseTime(mockCanvas, 'state_change');
        responseTimes.push(responseTime.responseTimeMs);
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);
      
      expect(averageResponseTime).toBeLessThan(75);
      expect(maxResponseTime).toBeLessThan(150);
      expect(responseTimes.every(time => time < 200)).toBe(true);
    });
  });

  describe('Overall Performance Quality', () => {
    it('should achieve an overall performance grade of B or better', async () => {
      // BEHAVIOR: Avatar should provide good overall performance experience
      // EXPECTATION: Combined metrics should result in B grade (80+) or A grade (90+)
      
      render(
        <Canvas>
          <Avatar position={[0, 0, 0]} />
        </Canvas>
      );

      const overallPerformance = await qaValidator.evaluateOverallPerformance(mockCanvas, 5000);
      
      expect(overallPerformance.overallScore).toBeGreaterThan(80);
      expect(overallPerformance.grade).toMatch(/^[AB]$/);
      expect(overallPerformance.userExperienceRating).toMatch(/^(excellent|good)$/);
      
      // Individual metrics should meet minimums
      expect(overallPerformance.frameRateScore).toBeGreaterThan(75);
      expect(overallPerformance.memoryScore).toBeGreaterThan(75);
      expect(overallPerformance.responsivenessScore).toBeGreaterThan(75);
    });

    it('should maintain performance quality during stress conditions', async () => {
      // BEHAVIOR: Avatar should remain usable even under challenging conditions
      // EXPECTATION: Graceful degradation, not complete failure under stress
      
      const { rerender } = render(
        <Canvas>
          <Avatar position={[0, 0, 0]} />
        </Canvas>
      );

      // Create stress conditions
      const stressStates = [
        { isSpeaking: true, userIsTyping: true, lastMessageLength: 200 },
        { isSpeaking: false, userIsTyping: true, lastMessageLength: 150 },
        { isSpeaking: true, userIsTyping: false, lastMessageLength: 300 },
        { isSpeaking: true, userIsTyping: true, lastMessageLength: 250 }
      ];

      for (let i = 0; i < 30; i++) {
        const state = stressStates[i % stressStates.length];
        rerender(
          <Canvas>
            <Avatar position={[0, 0, 0]} {...state} />
          </Canvas>
        );
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      const stressPerformance = await qaValidator.evaluateOverallPerformance(mockCanvas, 3000);
      
      // Should maintain at least C grade (70+) under stress
      expect(stressPerformance.overallScore).toBeGreaterThan(70);
      expect(stressPerformance.grade).toMatch(/^[ABC]$/);
      expect(stressPerformance.isUsable).toBe(true);
      expect(stressPerformance.hasSystemImpact).toBe(false);
    });
  });
}); 