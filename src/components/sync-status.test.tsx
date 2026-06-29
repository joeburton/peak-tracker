import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { formatRelativeTime, SyncStatus } from './sync-status'

// formatRelativeTime — pure function, no mocks needed
describe('formatRelativeTime', () => {
  const BASE = '2026-06-29T10:00:00.000Z'
  const baseMs = new Date(BASE).getTime()

  it('returns "just now" when less than 1 minute ago', () => {
    expect(formatRelativeTime(BASE, baseMs + 30_000)).toBe('just now')
  })

  it('returns minutes when less than 1 hour ago', () => {
    expect(formatRelativeTime(BASE, baseMs + 5 * 60_000)).toBe('5m ago')
  })

  it('returns hours when less than 24 hours ago', () => {
    expect(formatRelativeTime(BASE, baseMs + 3 * 60 * 60_000)).toBe('3h ago')
  })

  it('returns days when 24 or more hours ago', () => {
    expect(formatRelativeTime(BASE, baseMs + 2 * 24 * 60 * 60_000)).toBe('2d ago')
  })
})

// SyncStatus component
const { mockUseAuth, mockUseSyncStore } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockUseSyncStore: vi.fn(),
}))

vi.mock('@clerk/nextjs', () => ({ useAuth: mockUseAuth }))
vi.mock('@/stores/sync', () => ({ useSyncStore: mockUseSyncStore }))

function setupStore(state: {
  isSyncing: boolean
  lastSyncedAt: string | null
  syncError: string | null
}) {
  mockUseSyncStore.mockImplementation((selector: (s: typeof state) => unknown) =>
    selector(state),
  )
}

describe('SyncStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({ userId: null })
    setupStore({ isSyncing: false, lastSyncedAt: null, syncError: null })
    const { container } = render(<SyncStatus />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when authenticated but no sync has occurred', () => {
    mockUseAuth.mockReturnValue({ userId: 'user_123' })
    setupStore({ isSyncing: false, lastSyncedAt: null, syncError: null })
    const { container } = render(<SyncStatus />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows "Syncing…" when isSyncing is true', () => {
    mockUseAuth.mockReturnValue({ userId: 'user_123' })
    setupStore({ isSyncing: true, lastSyncedAt: null, syncError: null })
    render(<SyncStatus />)
    expect(screen.getByText('Syncing…')).toBeInTheDocument()
  })

  it('shows "Sync failed" when syncError is set', () => {
    mockUseAuth.mockReturnValue({ userId: 'user_123' })
    setupStore({ isSyncing: false, lastSyncedAt: null, syncError: 'Push failed with status 500' })
    render(<SyncStatus />)
    expect(screen.getByText('Sync failed')).toBeInTheDocument()
  })

  it('includes the error detail in the title attribute', () => {
    mockUseAuth.mockReturnValue({ userId: 'user_123' })
    setupStore({ isSyncing: false, lastSyncedAt: null, syncError: 'Push failed with status 500' })
    render(<SyncStatus />)
    expect(screen.getByTitle('Push failed with status 500')).toBeInTheDocument()
  })

  it('shows relative sync time when lastSyncedAt is set', () => {
    mockUseAuth.mockReturnValue({ userId: 'user_123' })
    const twoMinutesAgo = new Date(Date.now() - 2 * 60_000).toISOString()
    setupStore({ isSyncing: false, lastSyncedAt: twoMinutesAgo, syncError: null })
    render(<SyncStatus />)
    expect(screen.getByText('Synced 2m ago')).toBeInTheDocument()
  })

  it('isSyncing takes priority over lastSyncedAt', () => {
    mockUseAuth.mockReturnValue({ userId: 'user_123' })
    const recentSync = new Date(Date.now() - 60_000).toISOString()
    setupStore({ isSyncing: true, lastSyncedAt: recentSync, syncError: null })
    render(<SyncStatus />)
    expect(screen.getByText('Syncing…')).toBeInTheDocument()
    expect(screen.queryByText(/Synced/)).not.toBeInTheDocument()
  })

  it('has aria-live="polite" for screen reader announcements', () => {
    mockUseAuth.mockReturnValue({ userId: 'user_123' })
    setupStore({ isSyncing: true, lastSyncedAt: null, syncError: null })
    render(<SyncStatus />)
    expect(screen.getByText('Syncing…')).toHaveAttribute('aria-live', 'polite')
  })
})
