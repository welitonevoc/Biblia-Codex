import { describe, expect, it, vi } from 'vitest';
import { Button } from './button';

vi.mock('react', () => ({
  ...vi.importActual('react'),
  forwardRef: vi.fn(),
  memo: vi.fn((c) => c),
}));

describe('Button Component', () => {
  it('should render with default props', () => {
    const button = Button({ children: 'Click me' });
    expect(button).toBeDefined();
  });

  it('should accept variant prop', () => {
    const button = Button({ variant: 'default', children: 'Primary' });
    expect(button).toBeDefined();
  });

  it('should accept size prop', () => {
    const button = Button({ size: 'lg', children: 'Large' });
    expect(button).toBeDefined();
  });
});
