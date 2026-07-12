import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { SyncProvider } from './sync-provider';

const { mockUseAuth, mockInitConnectivity, mockUseAutoSync } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockInitConnectivity: vi.fn(),
  mockUseAutoSync: vi.fn(),
}));

vi.mock('@clerk/nextjs', () => ({ useAuth: mockUseAuth }));
vi.mock('@/stores/connectivity', () => ({ initConnectivity: mockInitConnectivity }));
vi.mock('@/hooks/use-auto-sync', () => ({ useAutoSync: mockUseAutoSync }));

describe('SyncProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInitConnectivity.mockReturnValue(vi.fn());
  });

  it('renders nothing', () => {
    mockUseAuth.mockReturnValue({ userId: null });
    const { container } = render(<SyncProvider />);
    expect(container).toBeEmptyDOMElement();
  });

  it('initializes connectivity listeners on mount', () => {
    mockUseAuth.mockReturnValue({ userId: null });
    render(<SyncProvider />);
    expect(mockInitConnectivity).toHaveBeenCalledOnce();
  });

  it('passes the authenticated userId to useAutoSync', () => {
    mockUseAuth.mockReturnValue({ userId: 'user_123' });
    render(<SyncProvider />);
    expect(mockUseAutoSync).toHaveBeenCalledWith('user_123');
  });

  it('passes null to useAutoSync when unauthenticated', () => {
    mockUseAuth.mockReturnValue({ userId: undefined });
    render(<SyncProvider />);
    expect(mockUseAutoSync).toHaveBeenCalledWith(null);
  });

  it('cleans up the connectivity listener on unmount', () => {
    const cleanup = vi.fn();
    mockInitConnectivity.mockReturnValue(cleanup);
    mockUseAuth.mockReturnValue({ userId: null });
    const { unmount } = render(<SyncProvider />);
    unmount();
    expect(cleanup).toHaveBeenCalledOnce();
  });
});
