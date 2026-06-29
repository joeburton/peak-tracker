import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useConnectivityStore } from '@/stores/connectivity'

const { mockRunSyncCycle, mockGet } = vi.hoisted(() => ({
  mockRunSyncCycle: vi.fn().mockResolvedValue(undefined),
  mockGet: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/sync/cycle', () => ({ runSyncCycle: mockRunSyncCycle }))
vi.mock('@/db/dexie', () => ({ db: {} }))
vi.mock('@/db/repositories/local-progress-repository', () => ({
  createLocalProgressRepository: vi.fn().mockReturnValue({ get: mockGet }),
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
    mockGet.mockResolvedValue(undefined) // clean by default — no dirty records
    useConnectivityStore.setState({ isOnline: true, connectionQuality: 'unknown' })
  })

  it('does not trigger sync on mount when records are clean', async () => {
    mockGet.mockResolvedValue({ dirty: false })
    useConnectivityStore.setState({ isOnline: true })
    renderHook(() => useAutoSync('user_123'))
    await vi.waitFor(() => expect(mockGet).toHaveBeenCalled())
    expect(mockRunSyncCycle).not.toHaveBeenCalled()
  })

  it('does not trigger sync on mount when offline', async () => {
    useConnectivityStore.setState({ isOnline: false })
    renderHook(() => useAutoSync('user_123'))
    // get() should not be called at all — guard bails before the Dexie lookup
    await new Promise((r) => setTimeout(r, 50))
    expect(mockRunSyncCycle).not.toHaveBeenCalled()
  })

  it('syncs on mount when online and dirty records exist', async () => {
    mockGet.mockResolvedValue({ dirty: true })
    useConnectivityStore.setState({ isOnline: true })
    renderHook(() => useAutoSync('user_123'))
    await vi.waitFor(() => expect(mockRunSyncCycle).toHaveBeenCalled())
  })

  it('does not trigger the mount sync twice for the same userId', async () => {
    mockGet.mockResolvedValue({ dirty: true })
    useConnectivityStore.setState({ isOnline: true })
    const { rerender } = renderHook(() => useAutoSync('user_123'))
    await vi.waitFor(() => expect(mockRunSyncCycle).toHaveBeenCalledOnce())
    rerender()
    expect(mockRunSyncCycle).toHaveBeenCalledOnce()
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

  it('triggers sync exactly once when transitioning online→offline→online', () => {
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
