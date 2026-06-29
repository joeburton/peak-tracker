import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useProgressStore } from '@/stores/progress'
import { useConnectivityStore } from '@/stores/connectivity'

const { mockGet, mockUpsert, mockMarkDirty, mockCreateRepo, mockRunSyncCycle } = vi.hoisted(() => {
  const mockGet = vi.fn()
  const mockUpsert = vi.fn()
  const mockMarkDirty = vi.fn()
  const mockCreateRepo = vi.fn(() => ({ get: mockGet, upsert: mockUpsert, markDirty: mockMarkDirty }))
  const mockRunSyncCycle = vi.fn().mockResolvedValue(undefined)
  return { mockGet, mockUpsert, mockMarkDirty, mockCreateRepo, mockRunSyncCycle }
})

vi.mock('@/db/dexie', () => ({ db: {} }))
vi.mock('@/db/repositories/local-progress-repository', () => ({
  createLocalProgressRepository: mockCreateRepo,
}))
vi.mock('@/lib/sync/cycle', () => ({ runSyncCycle: mockRunSyncCycle }))
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: vi.fn().mockReturnValue({}),
}))

import { useToggleProgress } from './use-toggle-progress'

const USER_ID = 'user-123'

const existingRecord = {
  userId: USER_ID,
  completedPeakIds: ['peak-existing'],
  updatedAt: '2024-01-01T00:00:00.000Z',
  dirty: false,
  version: 2,
}

beforeEach(() => {
  useProgressStore.setState({ pendingCompletions: new Set(), pendingRemovals: new Set() })
  useConnectivityStore.setState({ isOnline: true, connectionQuality: 'unknown' })
  mockGet.mockReset()
  mockUpsert.mockReset()
  mockMarkDirty.mockReset()
  mockRunSyncCycle.mockReset()
  mockGet.mockResolvedValue(existingRecord)
  mockUpsert.mockResolvedValue(undefined)
  mockMarkDirty.mockResolvedValue(undefined)
  mockRunSyncCycle.mockResolvedValue(undefined)
})

describe('useToggleProgress', () => {
  it('does nothing when userId is null', async () => {
    const { result } = renderHook(() => useToggleProgress(null))
    await act(() => result.current.toggle('peak-1', false))
    expect(mockUpsert).not.toHaveBeenCalled()
    expect(useProgressStore.getState().pendingCompletions.size).toBe(0)
  })

  describe('completing a peak', () => {
    it('adds peakId to pendingCompletions immediately (optimistic)', async () => {
      const { result } = renderHook(() => useToggleProgress(USER_ID))
      await act(() => result.current.toggle('peak-1', false))
      expect(useProgressStore.getState().pendingCompletions.has('peak-1')).toBe(true)
    })

    it('removes peakId from pendingRemovals if it was previously removed', async () => {
      useProgressStore.getState().addRemoval('peak-1')
      const { result } = renderHook(() => useToggleProgress(USER_ID))
      await act(() => result.current.toggle('peak-1', false))
      expect(useProgressStore.getState().pendingRemovals.has('peak-1')).toBe(false)
    })

    it('upserts Dexie with the peakId added to completedPeakIds', async () => {
      const { result } = renderHook(() => useToggleProgress(USER_ID))
      await act(() => result.current.toggle('peak-new', false))
      expect(mockUpsert).toHaveBeenCalledWith(USER_ID, expect.objectContaining({
        completedPeakIds: expect.arrayContaining(['peak-existing', 'peak-new']),
      }))
    })

    it('increments the version number on upsert', async () => {
      const { result } = renderHook(() => useToggleProgress(USER_ID))
      await act(() => result.current.toggle('peak-new', false))
      expect(mockUpsert).toHaveBeenCalledWith(USER_ID, expect.objectContaining({ version: 3 }))
    })

    it('marks the record dirty after upserting', async () => {
      const { result } = renderHook(() => useToggleProgress(USER_ID))
      await act(() => result.current.toggle('peak-new', false))
      expect(mockMarkDirty).toHaveBeenCalledWith(USER_ID)
    })
  })

  describe('un-completing a peak', () => {
    it('adds peakId to pendingRemovals immediately (optimistic)', async () => {
      const { result } = renderHook(() => useToggleProgress(USER_ID))
      await act(() => result.current.toggle('peak-existing', true))
      expect(useProgressStore.getState().pendingRemovals.has('peak-existing')).toBe(true)
    })

    it('removes peakId from pendingCompletions if it was a pending addition', async () => {
      useProgressStore.getState().addCompletion('peak-existing')
      const { result } = renderHook(() => useToggleProgress(USER_ID))
      await act(() => result.current.toggle('peak-existing', true))
      expect(useProgressStore.getState().pendingCompletions.has('peak-existing')).toBe(false)
    })

    it('upserts Dexie with the peakId removed from completedPeakIds', async () => {
      const { result } = renderHook(() => useToggleProgress(USER_ID))
      await act(() => result.current.toggle('peak-existing', true))
      expect(mockUpsert).toHaveBeenCalledWith(USER_ID, expect.objectContaining({
        completedPeakIds: [],
      }))
    })

    it('marks the record dirty after upserting', async () => {
      const { result } = renderHook(() => useToggleProgress(USER_ID))
      await act(() => result.current.toggle('peak-existing', true))
      expect(mockMarkDirty).toHaveBeenCalledWith(USER_ID)
    })
  })

  it('initialises completedPeakIds to [] when no existing Dexie record', async () => {
    mockGet.mockResolvedValue(undefined)
    const { result } = renderHook(() => useToggleProgress(USER_ID))
    await act(() => result.current.toggle('peak-new', false))
    expect(mockUpsert).toHaveBeenCalledWith(USER_ID, expect.objectContaining({
      completedPeakIds: ['peak-new'],
      version: 1,
    }))
  })

  describe('sync on toggle', () => {
    it('triggers runSyncCycle after toggle when online', async () => {
      useConnectivityStore.setState({ isOnline: true })
      const { result } = renderHook(() => useToggleProgress(USER_ID))
      await act(() => result.current.toggle('peak-new', false))
      expect(mockRunSyncCycle).toHaveBeenCalledWith(
        USER_ID,
        expect.any(Object),
        expect.objectContaining({ setSyncing: expect.any(Function) }),
        expect.any(Object),
      )
    })

    it('does not trigger runSyncCycle when offline', async () => {
      useConnectivityStore.setState({ isOnline: false })
      const { result } = renderHook(() => useToggleProgress(USER_ID))
      await act(() => result.current.toggle('peak-new', false))
      expect(mockRunSyncCycle).not.toHaveBeenCalled()
    })

    it('does not trigger runSyncCycle when userId is null', async () => {
      useConnectivityStore.setState({ isOnline: true })
      const { result } = renderHook(() => useToggleProgress(null))
      await act(() => result.current.toggle('peak-new', false))
      expect(mockRunSyncCycle).not.toHaveBeenCalled()
    })
  })
})
