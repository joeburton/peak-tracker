import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFound from './not-found';

describe('NotFound', () => {
  it('renders a 404 message with a link back home', () => {
    render(<NotFound />);
    expect(screen.getByText('Page not found')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Back to peak lists' });
    expect(link).toHaveAttribute('href', '/');
  });
});
