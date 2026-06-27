import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useConnectivityStore } from '@/stores/connectivity'

const { mockRunSyncCycle } = vi.hoisted(() => ({
  mockRunSyncCycle: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/sync/cycle', () => ({ runSyncCycle: mockRunSyncCycle }))
vi.mock('@/db/dexie', () => ({ db: {} }))
vi.mock('@/db/repositories/local-progress-repository', () => ({
  createLocalProgressRepository: vi.fn().mockReturnValue({}),
}))
vi.mock('@/stores/sync', () => ({
  useSyncStore: vi.fn((selector: (s: object) => unknown) =>
    selector({ setSyncing: vi.fn(), setSyncComplete: vi.fn(), setSyncError: vi.fn() }),
  ),
}))
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: vi.fn().mockReturnValue({ invalidateQueries: vi.fn() }),
}))

import { useAutoSync } from './use-auto-sync'

describe('useAutoSync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useConnectivityStore.setState({ isOnline: true, connectionQuality: 'unknown' })
  })

  it('does not trigger sync on initial mount even when already online', () => {
    useConnectivityStore.setState({ isOnline: true })
    renderHook(() => useAutoSync('user_123'))
    expect(mockRunSyncCycle).not.toHaveBeenCalled()
  })

  it('does not trigger sync on initial mount when offline', () => {
    useConnectivityStore.setState({ isOnline: false })
    renderHook(() => useAutoSync('user_123'))
    expect(mockRunSyncCycle).not.toHaveBeenCalled()
  })

  it('triggers sync when transitioning from offline to online', () => {
    useConnectivityStore.setState({ isOnline: false })
    renderHook(() => useAutoSync('user_123'))

    act(() => {
      useConnectivityStore.setState({ isOnline: true })
    })

    expect(mockRunSyncCycle).toHaveBeenCalledWith(
      'user_123',
      expect.any(Object),
      expect.objectContaining({ setSyncing: expect.any(Function) }),
      expect.any(Object),
    )
  })

  it('does not trigger sync when transitioning online→offline→online is not detected', () => {
    useConnectivityStore.setState({ isOnline: true })
    renderHook(() => useAutoSync('user_123'))

    // Going offline then back online should trigger sync
    act(() => { useConnectivityStore.setState({ isOnline: false }) })
    act(() => { useConnectivityStore.setState({ isOnline: true }) })

    expect(mockRunSyncCycle).toHaveBeenCalledOnce()
  })

  it('does not trigger sync when userId is null', () => {
    useConnectivityStore.setState({ isOnline: false })
    renderHook(() => useAutoSync(null))

    act(() => {
      useConnectivityStore.setState({ isOnline: true })
    })

    expect(mockRunSyncCycle).not.toHaveBeenCalled()
  })
})
