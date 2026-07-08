import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InstallPrompt } from './install-prompt';

vi.mock('@/hooks/use-install-prompt', () => ({
  useInstallPrompt: vi.fn(),
}));

import { useInstallPrompt } from '@/hooks/use-install-prompt';

const mockUseInstallPrompt = vi.mocked(useInstallPrompt);

describe('InstallPrompt', () => {
  const install = vi.fn();
  const dismiss = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_APP_NAME', 'Peak Tracker UK');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('renders nothing when canInstall is false', () => {
    mockUseInstallPrompt.mockReturnValue({ canInstall: false, install, dismiss });
    const { container } = render(<InstallPrompt />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the install banner when canInstall is true', () => {
    mockUseInstallPrompt.mockReturnValue({ canInstall: true, install, dismiss });
    render(<InstallPrompt />);
    expect(screen.getByRole('region', { name: /install peak tracker/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^install$/i })).toBeInTheDocument();
  });

  it('calls install when the Install button is clicked', () => {
    mockUseInstallPrompt.mockReturnValue({ canInstall: true, install, dismiss });
    render(<InstallPrompt />);
    fireEvent.click(screen.getByRole('button', { name: /^install$/i }));
    expect(install).toHaveBeenCalledOnce();
  });

  it('calls dismiss when the dismiss button is clicked', () => {
    mockUseInstallPrompt.mockReturnValue({ canInstall: true, install, dismiss });
    render(<InstallPrompt />);
    fireEvent.click(screen.getByRole('button', { name: /dismiss install prompt/i }));
    expect(dismiss).toHaveBeenCalledOnce();
  });

  it('calls dismiss when the Not now button is clicked', () => {
    mockUseInstallPrompt.mockReturnValue({ canInstall: true, install, dismiss });
    render(<InstallPrompt />);
    fireEvent.click(screen.getByRole('button', { name: /not now/i }));
    expect(dismiss).toHaveBeenCalledOnce();
  });
});
