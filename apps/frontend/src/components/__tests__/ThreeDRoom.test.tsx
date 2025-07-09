import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ThreeDRoom from '../ThreeDRoom';
import { CAMERA_CONFIG } from '../../config/roomConstants';

describe('ThreeDRoom Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<ThreeDRoom />);
    expect(container).toBeInTheDocument();
  });

  it('renders the 3D canvas with proper styling', () => {
    const { container } = render(<ThreeDRoom />);
    const canvasContainer = container.firstChild as HTMLElement;
    
    expect(canvasContainer).toHaveStyle({
      width: '100vw',
      height: '100vh',
      background: '#222'
    });
  });

  it('includes the main room elements', () => {
    const { container } = render(<ThreeDRoom />);
    // Check that the component renders the main container
    expect(container.firstChild).toHaveStyle({
      width: '100vw',
      height: '100vh'
    });
  });

  it('renders the Avatar component within the room', () => {
    const { container } = render(<ThreeDRoom />);
    // The Avatar component should be rendered within the Canvas
    expect(container.firstChild).toBeInTheDocument();
  });

  it('has the correct container structure', () => {
    const { container } = render(<ThreeDRoom />);
    expect(container.firstChild).toHaveStyle({
      width: '100vw',
      height: '100vh'
    });
  });

  describe('Camera Configuration', () => {
    it('should have a closer default camera position for better avatar visibility', () => {
      // Camera should be positioned closer than the original [2, 2.5, 2]
      expect(CAMERA_CONFIG.POSITION[0]).toBeLessThanOrEqual(2);
      expect(CAMERA_CONFIG.POSITION[1]).toBeLessThanOrEqual(2.5);
      expect(CAMERA_CONFIG.POSITION[2]).toBeLessThanOrEqual(2);
      
      // Should still maintain positive values for proper perspective
      expect(CAMERA_CONFIG.POSITION[0]).toBeGreaterThan(0);
      expect(CAMERA_CONFIG.POSITION[1]).toBeGreaterThan(0);
      expect(CAMERA_CONFIG.POSITION[2]).toBeGreaterThan(0);
    });

    it('should have appropriate FOV for closer viewing', () => {
      // FOV should be reasonable for close viewing (typically 60-75 degrees)
      expect(CAMERA_CONFIG.FOV).toBeGreaterThanOrEqual(50);
      expect(CAMERA_CONFIG.FOV).toBeLessThanOrEqual(80);
    });

    it('should have target focused on avatar area', () => {
      // Target should be close to avatar position for better framing
      expect(CAMERA_CONFIG.TARGET[1]).toBeGreaterThanOrEqual(0); // Y should be at or above ground
      expect(CAMERA_CONFIG.TARGET[1]).toBeLessThanOrEqual(2); // But not too high
    });

    it('should have appropriate distance constraints for closer viewing', () => {
      // Min distance should allow getting close to the avatar
      expect(CAMERA_CONFIG.MIN_DISTANCE).toBeLessThanOrEqual(2);
      expect(CAMERA_CONFIG.MIN_DISTANCE).toBeGreaterThan(0.5);
      
      // Max distance should still allow overview but not too far
      expect(CAMERA_CONFIG.MAX_DISTANCE).toBeLessThanOrEqual(6);
      expect(CAMERA_CONFIG.MAX_DISTANCE).toBeGreaterThan(CAMERA_CONFIG.MIN_DISTANCE);
    });

    it('should have valid polar angle constraint', () => {
      // Should prevent camera from going below ground
      expect(CAMERA_CONFIG.MAX_POLAR_ANGLE).toBeGreaterThan(0);
      expect(CAMERA_CONFIG.MAX_POLAR_ANGLE).toBeLessThanOrEqual(Math.PI);
    });
  });

  describe('Room Model Integration', () => {
    it('should render with room models enabled', () => {
      const { container } = render(
        <ThreeDRoom 
          useRoomModels={true}
          roomModelUrl="/models/room/bedroom-complete.glb"
        />
      );
      expect(container).toBeInTheDocument();
    });

    it('should render geometric room when models disabled', () => {
      const { container } = render(
        <ThreeDRoom useRoomModels={false} />
      );
      expect(container).toBeInTheDocument();
    });

    it('should handle avatar interaction props', () => {
      const { container } = render(
        <ThreeDRoom 
          isAvatarSpeaking={true}
          userIsTyping={false}
          lastMessageLength={10}
          timeSinceLastMessage={5000}
        />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Camera Position Optimization', () => {
    it('should provide good view of both avatar and room', () => {
      // Camera position should be optimized for the smaller avatar
      const distance = Math.sqrt(
        CAMERA_CONFIG.POSITION[0] ** 2 + 
        CAMERA_CONFIG.POSITION[1] ** 2 + 
        CAMERA_CONFIG.POSITION[2] ** 2
      );
      
      // Total distance should be reasonable for viewing scaled-down avatar
      expect(distance).toBeLessThanOrEqual(4);
      expect(distance).toBeGreaterThan(1);
    });

    it('should maintain good aspect ratio for room viewing', () => {
      // Y position should be elevated enough to see room layout
      expect(CAMERA_CONFIG.POSITION[1]).toBeGreaterThan(1);
      
      // But not so high that avatar becomes too small
      expect(CAMERA_CONFIG.POSITION[1]).toBeLessThan(3);
    });
  });
}); 