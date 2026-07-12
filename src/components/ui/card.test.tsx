import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardContent, CardFooter } from './card';

describe('CardContent', () => {
  it('renders its children', () => {
    render(<CardContent>content</CardContent>);
    expect(screen.getByText('content')).toBeInTheDocument();
  });
});

describe('CardFooter', () => {
  it('renders its children', () => {
    render(<CardFooter>footer</CardFooter>);
    expect(screen.getByText('footer')).toBeInTheDocument();
  });
});
