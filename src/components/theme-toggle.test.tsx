import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from './theme-toggle';

const { mockUseTheme } = vi.hoisted(() => ({ mockUseTheme: vi.fn() }));

vi.mock('next-themes', () => ({ useTheme: mockUseTheme }));

describe('ThemeToggle', () => {
  beforeEach(() => {
    mockUseTheme.mockReset();
  });

  it('switches from light to dark on click', () => {
    const setTheme = vi.fn();
    mockUseTheme.mockReturnValue({ theme: 'light', setTheme });
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle theme' }));
    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('switches from dark to light on click', () => {
    const setTheme = vi.fn();
    mockUseTheme.mockReturnValue({ theme: 'dark', setTheme });
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle theme' }));
    expect(setTheme).toHaveBeenCalledWith('light');
  });
});
