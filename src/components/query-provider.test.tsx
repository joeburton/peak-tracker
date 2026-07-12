import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryProvider } from './query-provider';

vi.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: () => <div data-testid="rq-devtools" />,
}));

describe('QueryProvider', () => {
  it('renders children wrapped in a QueryClientProvider', () => {
    render(
      <QueryProvider>
        <p>content</p>
      </QueryProvider>
    );
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('shows devtools in development', () => {
    const original = process.env.NODE_ENV;
    vi.stubEnv('NODE_ENV', 'development');
    render(
      <QueryProvider>
        <p>content</p>
      </QueryProvider>
    );
    expect(screen.getByTestId('rq-devtools')).toBeInTheDocument();
    vi.stubEnv('NODE_ENV', original ?? 'test');
  });

  it('hides devtools outside development', () => {
    const original = process.env.NODE_ENV;
    vi.stubEnv('NODE_ENV', 'production');
    render(
      <QueryProvider>
        <p>content</p>
      </QueryProvider>
    );
    expect(screen.queryByTestId('rq-devtools')).not.toBeInTheDocument();
    vi.stubEnv('NODE_ENV', original ?? 'test');
  });
});
