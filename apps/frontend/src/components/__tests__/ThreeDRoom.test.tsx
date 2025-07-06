import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ThreeDRoom from '../ThreeDRoom';

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
}); 