import { describe, it, expect, vi, beforeEach } from 'vitest'
import { runSyncCycle } from './cycle'
import type { ILocalProgressRepository } from '@/db/repositories/local-progress-repository'
import type { LocalProgress } from '@/db/schema'
import type { QueryClient } from '@tanstack/react-query'

const { mockPushProgress, mockPullProgress } = vi.hoisted(() => ({
  mockPushProgress: vi.fn().mockResolvedValue(undefined),
  mockPullProgress: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('./push', () => ({ pushProgress: mockPushProgress }))
vi.mock('./pull', () => ({ pullProgress: mockPullProgress }))

const DIRTY_PROGRESS: LocalProgress = {
  userId: 'user_123',
  completedPeakIds: ['peak-a'],
  updatedAt: '2026-06-25T10:00:00.000Z',
  version: 2,
  dirty: true,
}

const CLEAN_PROGRESS: LocalProgress = { ...DIRTY_PROGRESS, dirty: false }

function makeLocalRepo(progress: LocalProgress | undefined): ILocalProgressRepository {
  return {
    get: vi.fn().mockResolvedValue(progress),
    upsert: vi.fn(),
    markDirty: vi.fn(),
    markClean: vi.fn(),
  }
}

const syncActions = {
  setSyncing: vi.fn(),
  setSyncComplete: vi.fn(),
  setSyncError: vi.fn(),
}

const queryClient = { invalidateQueries: vi.fn() } as unknown as QueryClient

describe('runSyncCycle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('pushes then pulls when the local record is dirty', async () => {
    const localRepo = makeLocalRepo(DIRTY_PROGRESS)

    await runSyncCycle('user_123', localRepo, syncActions, queryClient)

    expect(mockPushProgress).toHaveBeenCalledWith('user_123', localRepo, syncActions)
    expect(mockPullProgress).toHaveBeenCalledWith('user_123', localRepo, syncActions, queryClient)
  })

  it('push is called before pull', async () => {
    const order: string[] = []
    mockPushProgress.mockImplementation(async () => { order.push('push') })
    mockPullProgress.mockImplementation(async () => { order.push('pull') })

    await runSyncCycle('user_123', makeLocalRepo(DIRTY_PROGRESS), syncActions, queryClient)

    expect(order).toEqual(['push', 'pull'])
  })

  it('skips push and only pulls when the local record is clean', async () => {
    await runSyncCycle('user_123', makeLocalRepo(CLEAN_PROGRESS), syncActions, queryClient)

    expect(mockPushProgress).not.toHaveBeenCalled()
    expect(mockPullProgress).toHaveBeenCalledOnce()
  })

  it('skips push and only pulls when no local record exists', async () => {
    await runSyncCycle('user_123', makeLocalRepo(undefined), syncActions, queryClient)

    expect(mockPushProgress).not.toHaveBeenCalled()
    expect(mockPullProgress).toHaveBeenCalledOnce()
  })
})
