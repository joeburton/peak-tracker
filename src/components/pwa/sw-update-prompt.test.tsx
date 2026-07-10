import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SwUpdatePrompt } from './sw-update-prompt';

vi.mock('@/hooks/use-sw-update', () => ({
  useSwUpdate: vi.fn(),
}));

import { useSwUpdate } from '@/hooks/use-sw-update';

const mockUseSwUpdate = vi.mocked(useSwUpdate);

describe('SwUpdatePrompt', () => {
  const applyUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing when no update is available', () => {
    mockUseSwUpdate.mockReturnValue({ updateAvailable: false, applyUpdate });
    const { container } = render(<SwUpdatePrompt />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the update banner when an update is available', () => {
    mockUseSwUpdate.mockReturnValue({ updateAvailable: true, applyUpdate });
    render(<SwUpdatePrompt />);
    expect(screen.getByRole('region', { name: /app update available/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument();
  });

  it('calls applyUpdate when the Reload button is clicked', () => {
    mockUseSwUpdate.mockReturnValue({ updateAvailable: true, applyUpdate });
    render(<SwUpdatePrompt />);
    fireEvent.click(screen.getByRole('button', { name: /reload/i }));
    expect(applyUpdate).toHaveBeenCalledOnce();
  });

  it('shows explanatory text about the update', () => {
    mockUseSwUpdate.mockReturnValue({ updateAvailable: true, applyUpdate });
    render(<SwUpdatePrompt />);
    expect(screen.getByText(/reload to get the latest version/i)).toBeInTheDocument();
  });
});
