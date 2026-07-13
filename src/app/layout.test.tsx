import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RootLayout from './layout';

vi.mock('next/font/google', () => ({
  Geist: () => ({ variable: '--font-geist-sans' }),
  Geist_Mono: () => ({ variable: '--font-geist-mono' }),
}));

vi.mock('@clerk/nextjs', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('nuqs/adapters/next/app', () => ({
  NuqsAdapter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/theme-provider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/query-provider', () => ({
  QueryProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/layout/header', () => ({
  Header: () => <header data-testid="header" />,
}));

vi.mock('@/components/layout/footer', () => ({
  Footer: () => <footer data-testid="footer" />,
}));

vi.mock('@/components/sync-provider', () => ({
  SyncProvider: () => null,
}));

vi.mock('@/components/pwa/install-prompt', () => ({
  InstallPrompt: () => <div data-testid="install-prompt" />,
}));

vi.mock('@/components/pwa/sw-update-prompt', () => ({
  SwUpdatePrompt: () => <div data-testid="sw-update-prompt" />,
}));

describe('RootLayout', () => {
  it('renders a skip link targeting main content', () => {
    render(
      <RootLayout>
        <p>Page content</p>
      </RootLayout>
    );
    const skipLink = screen.getByRole('link', { name: /skip to content/i });
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('renders children inside the main landmark', () => {
    render(
      <RootLayout>
        <p>Page content</p>
      </RootLayout>
    );
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('id', 'main-content');
    expect(main).toHaveTextContent('Page content');
  });

  it('renders the header, footer, and PWA prompts', () => {
    render(
      <RootLayout>
        <p>Page content</p>
      </RootLayout>
    );
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('install-prompt')).toBeInTheDocument();
    expect(screen.getByTestId('sw-update-prompt')).toBeInTheDocument();
  });
});
