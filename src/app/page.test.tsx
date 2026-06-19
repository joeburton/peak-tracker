import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from './page';

describe('Home page', () => {
  it('renders the app heading', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: /peak tracker uk/i })).toBeInTheDocument();
  });
});
