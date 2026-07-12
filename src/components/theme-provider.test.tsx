import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from './theme-provider';

const { mockNextThemesProvider } = vi.hoisted(() => ({
  mockNextThemesProvider: vi.fn(
    ({ children }: { children: React.ReactNode }) => <div data-testid="next-themes">{children}</div>
  ),
}));

vi.mock('next-themes', () => ({
  ThemeProvider: mockNextThemesProvider,
}));

describe('ThemeProvider', () => {
  beforeEach(() => {
    mockNextThemesProvider.mockClear();
  });

  it('renders children through next-themes ThemeProvider', () => {
    render(
      <ThemeProvider attribute="class">
        <p>content</p>
      </ThemeProvider>
    );
    expect(screen.getByTestId('next-themes')).toHaveTextContent('content');
  });

  it('forwards props to next-themes ThemeProvider', () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <p>content</p>
      </ThemeProvider>
    );
    const [calledProps] = mockNextThemesProvider.mock.calls[0] as [Record<string, unknown>];
    expect(calledProps).toMatchObject({ attribute: 'class', defaultTheme: 'dark' });
  });
});
