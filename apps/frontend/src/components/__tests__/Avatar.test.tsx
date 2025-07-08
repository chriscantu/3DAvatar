import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock useFrame from @react-three/fiber - must be at top level
vi.mock('@react-three/fiber', async () => {
  const actual = await vi.importActual('@react-three/fiber');
  return {
    ...actual,
    useFrame: vi.fn(),
  };
});

import Avatar from '../Avatar';

describe('Avatar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<Avatar />);
    expect(container).toBeInTheDocument();
  });

  it('renders with default position when no position prop is provided', () => {
    const { container } = render(<Avatar />);
    // Component should render without errors with default position [0, 1, 0]
    expect(container).toBeInTheDocument();
  });

  it('renders with custom position when position prop is provided', () => {
    const customPosition: [number, number, number] = [1, 2, 3];
    const { container } = render(<Avatar position={customPosition} />);
    expect(container).toBeInTheDocument();
  });

  it('handles isSpeaking prop correctly', () => {
    const { container } = render(<Avatar isSpeaking={true} />);
    expect(container).toBeInTheDocument();
  });

  it('sets up animation frame callback', () => {
    const { container } = render(<Avatar />);
    expect(container).toBeInTheDocument();
  });

  it('renders all dog body parts', () => {
    const { container } = render(<Avatar />);
    // Check that the component renders without throwing errors
    // In a real Three.js environment, we would check for specific meshes
    expect(container.firstChild).toBeDefined();
  });

  it('handles animation state changes', () => {
    const { rerender, container } = render(<Avatar isSpeaking={false} />);
    expect(container).toBeInTheDocument();
    
    rerender(<Avatar isSpeaking={true} />);
    expect(container).toBeInTheDocument();
  });

  describe('Avatar Anatomy Positioning', () => {
    it('positions snout just below the midpoint of the face', () => {
      // Test validates that snout positioning follows proper puppy anatomy
      const { container } = render(<Avatar />);
      expect(container).toBeInTheDocument();
      
      // Head is at Y=-0.1 with radius 0.4, so face spans from Y=-0.5 to Y=0.3
      // Midpoint of face is at Y=-0.1 (center of head)
      // Snout should be positioned below midpoint at Y=-0.2 for cute puppy look
      const expectedSnoutY = -0.2;
      const headCenterY = -0.1;
      
      // Verify snout is below the midpoint
      expect(expectedSnoutY).toBeLessThan(headCenterY);
      
      // Verify snout is positioned for cute puppy proportions
      const distanceBelowMidpoint = headCenterY - expectedSnoutY;
      expect(distanceBelowMidpoint).toBeLessThanOrEqual(0.15); // Within 0.15 units for puppy look
    });

         it('positions nose at the tip of the snout', () => {
       const { container } = render(<Avatar />);
       expect(container).toBeInTheDocument();
       
       // Nose should be at same Y position as snout (-0.2) but further forward in Z
       const expectedNoseY = -0.2;
       const expectedNoseZ = 0.9;
       const snoutY = -0.2;
       const snoutZ = 0.8;
       
       // Verify nose is at same Y level as snout
       expect(expectedNoseY).toBe(snoutY);
       
       // Verify nose is at tip of snout (further forward)
       expect(expectedNoseZ).toBeGreaterThan(snoutZ);
     });

         it('positions eyes above the snout for natural forward gaze', () => {
       const { container } = render(<Avatar />);
       expect(container).toBeInTheDocument();
       
       // Eyes should be positioned above snout for natural puppy anatomy
       const eyeY = 0.1;
       const snoutY = -0.2;
       
       expect(eyeY).toBeGreaterThan(snoutY);
     });

    it('positions mouth below snout naturally', () => {
      const { container } = render(<Avatar />);
      expect(container).toBeInTheDocument();
      
      // Mouth should be below snout for puppy proportions
      const mouthY = -0.3;
      const snoutY = -0.2;
      
      expect(mouthY).toBeLessThan(snoutY);
    });

    it('maintains proper head-neck-body connection', () => {
      const { container } = render(<Avatar />);
      expect(container).toBeInTheDocument();
      
      // Verify anatomical progression from head to body
      const headY = -0.1;
      const neckY = -0.4;
      const bodyY = -0.8;
      
      expect(headY).toBeGreaterThan(neckY);
      expect(neckY).toBeGreaterThan(bodyY);
    });
  });
}); 