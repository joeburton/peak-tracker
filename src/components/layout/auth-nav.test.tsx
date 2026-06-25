import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@clerk/nextjs', () => ({
  useAuth: vi.fn(),
  UserButton: () => <button aria-label="Open user button">User</button>,
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import { useAuth } from '@clerk/nextjs';
import { AuthNav } from './auth-nav';

const mockUseAuth = vi.mocked(useAuth);

describe('AuthNav', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  it('renders nothing while Clerk is loading', () => {
    mockUseAuth.mockReturnValue({ isLoaded: false, isSignedIn: undefined } as ReturnType<typeof useAuth>);
    const { container } = render(<AuthNav />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders UserButton when authenticated', () => {
    mockUseAuth.mockReturnValue({ isLoaded: true, isSignedIn: true } as ReturnType<typeof useAuth>);
    render(<AuthNav />);
    expect(screen.getByRole('button', { name: /open user button/i })).toBeInTheDocument();
  });

  it('renders sign-in link when unauthenticated', () => {
    mockUseAuth.mockReturnValue({ isLoaded: true, isSignedIn: false } as ReturnType<typeof useAuth>);
    render(<AuthNav />);
    const link = screen.getByRole('link', { name: /sign in/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/sign-in');
  });
});
