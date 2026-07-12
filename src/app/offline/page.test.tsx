import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import OfflinePage from './page';

describe('OfflinePage', () => {
  it('renders an offline message with a link back home', () => {
    render(<OfflinePage />);
    expect(screen.getByText('You are offline')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Return to home' });
    expect(link).toHaveAttribute('href', '/');
  });
});
