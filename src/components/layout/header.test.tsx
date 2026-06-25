import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from './header';

vi.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <button aria-label="Toggle theme">Theme</button>,
}));

vi.mock('./auth-nav', () => ({
  AuthNav: () => <div data-testid="auth-nav" />,
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('Header', () => {
  it('has the banner landmark role', () => {
    render(<Header />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders the app name linking to home', () => {
    render(<Header />);
    const link = screen.getByRole('link', { name: /peak tracker uk home/i });
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders the main navigation landmark', () => {
    render(<Header />);
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
  });

  it('renders a Peak Lists nav link', () => {
    render(<Header />);
    expect(screen.getByRole('link', { name: /peak lists/i })).toBeInTheDocument();
  });

  it('renders the theme toggle', () => {
    render(<Header />);
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
  });

  it('renders the auth nav', () => {
    render(<Header />);
    expect(screen.getByTestId('auth-nav')).toBeInTheDocument();
  });
});
