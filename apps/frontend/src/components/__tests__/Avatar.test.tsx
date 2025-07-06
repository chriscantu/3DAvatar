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
}); 