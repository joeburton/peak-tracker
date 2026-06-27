import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { pullProgress } from './pull'
import type { ILocalProgressRepository } from '@/db/repositories/local-progress-repository'
import type { LocalProgress } from '@/db/schema'
import type { QueryClient } from '@tanstack/react-query'

const SERVER_PROGRESS = {
  userId: 'user_123',
  completedPeakIds: ['peak-slug-a', 'peak-slug-b'],
  updatedAt: '2026-06-25T12:00:00.000Z',
  version: 5,
}

const LOCAL_PROGRESS: LocalProgress = {
  userId: 'user_123',
  completedPeakIds: ['peak-slug-a'],
  updatedAt: '2026-06-25T10:00:00.000Z',
  version: 3,
  dirty: false,
}

function makeLocalRepo(overrides: Partial<ILocalProgressRepository> = {}): ILocalProgressRepository {
  return {
    get: vi.fn().mockResolvedValue(LOCAL_PROGRESS),
    upsert: vi.fn(),
    markDirty: vi.fn(),
    markClean: vi.fn(),
    ...overrides,
  }
}

function makeSyncActions() {
  return {
    setSyncing: vi.fn(),
    setSyncComplete: vi.fn(),
    setSyncError: vi.fn(),
  }
}

function makeQueryClient(): QueryClient {
  return { invalidateQueries: vi.fn().mockResolvedValue(undefined) } as unknown as QueryClient
}

function okResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 })
}

describe('pullProgress', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse(SERVER_PROGRESS)))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sets syncing true before the fetch', async () => {
    const syncActions = makeSyncActions()
    const localRepo = makeLocalRepo({ markClean: vi.fn() })

    await pullProgress('user_123', localRepo, syncActions, makeQueryClient())

    expect(syncActions.setSyncing).toHaveBeenCalledWith(true)
  })

  it('calls setSyncError on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Failed to fetch')))
    const syncActions = makeSyncActions()

    await pullProgress('user_123', makeLocalRepo(), syncActions, makeQueryClient())

    expect(syncActions.setSyncError).toHaveBeenCalledWith('Failed to fetch')
    expect(syncActions.setSyncComplete).not.toHaveBeenCalled()
  })

  it('calls setSyncComplete and does nothing else on 404 (new user)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{}', { status: 404 })),
    )
    const mockUpsert = vi.fn()
    const localRepo = makeLocalRepo({ upsert: mockUpsert })
    const syncActions = makeSyncActions()

    await pullProgress('user_123', localRepo, syncActions, makeQueryClient())

    expect(mockUpsert).not.toHaveBeenCalled()
    expect(syncActions.setSyncComplete).toHaveBeenCalledWith(expect.any(String))
  })

  it('calls setSyncError on non-ok non-404 response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{}', { status: 500 })),
    )
    const syncActions = makeSyncActions()

    await pullProgress('user_123', makeLocalRepo(), syncActions, makeQueryClient())

    expect(syncActions.setSyncError).toHaveBeenCalledWith('Pull failed with status 500')
    expect(syncActions.setSyncComplete).not.toHaveBeenCalled()
  })

  it('updates local and calls setSyncComplete when server is newer', async () => {
    const mockUpsert = vi.fn()
    const mockMarkClean = vi.fn()
    const localRepo = makeLocalRepo({ upsert: mockUpsert, markClean: mockMarkClean })
    const syncActions = makeSyncActions()
    const queryClient = makeQueryClient()

    await pullProgress('user_123', localRepo, syncActions, queryClient)

    expect(mockUpsert).toHaveBeenCalledWith('user_123', {
      completedPeakIds: SERVER_PROGRESS.completedPeakIds,
      updatedAt: SERVER_PROGRESS.updatedAt,
      version: SERVER_PROGRESS.version,
    })
    expect(mockMarkClean).toHaveBeenCalledWith('user_123', expect.any(String))
    expect(queryClient.invalidateQueries).toHaveBeenCalled()
    expect(syncActions.setSyncComplete).toHaveBeenCalledWith(expect.any(String))
  })

  it('does not update local when local is newer than server', async () => {
    const newerLocal: LocalProgress = {
      ...LOCAL_PROGRESS,
      updatedAt: '2026-06-25T14:00:00.000Z',
      version: 7,
    }
    const mockUpsert = vi.fn()
    const localRepo = makeLocalRepo({ get: vi.fn().mockResolvedValue(newerLocal), upsert: mockUpsert })
    const syncActions = makeSyncActions()

    await pullProgress('user_123', localRepo, syncActions, makeQueryClient())

    expect(mockUpsert).not.toHaveBeenCalled()
    expect(syncActions.setSyncComplete).not.toHaveBeenCalled()
    expect(syncActions.setSyncing).toHaveBeenCalledWith(false)
  })

  it('updates local when no local record exists', async () => {
    const mockUpsert = vi.fn()
    const mockMarkClean = vi.fn()
    const localRepo = makeLocalRepo({
      get: vi.fn().mockResolvedValue(undefined),
      upsert: mockUpsert,
      markClean: mockMarkClean,
    })

    await pullProgress('user_123', localRepo, makeSyncActions(), makeQueryClient())

    expect(mockUpsert).toHaveBeenCalled()
    expect(mockMarkClean).toHaveBeenCalled()
  })

  it('uses version as tiebreaker when updatedAt values are equal', async () => {
    const sameTimestamp = '2026-06-25T12:00:00.000Z'
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(okResponse({ ...SERVER_PROGRESS, updatedAt: sameTimestamp, version: 10 })),
    )
    const localAtSameTime: LocalProgress = { ...LOCAL_PROGRESS, updatedAt: sameTimestamp, version: 8 }
    const mockUpsert = vi.fn()
    const localRepo = makeLocalRepo({ get: vi.fn().mockResolvedValue(localAtSameTime), upsert: mockUpsert, markClean: vi.fn() })

    await pullProgress('user_123', localRepo, makeSyncActions(), makeQueryClient())

    // Server version (10) > local version (8) → server wins
    expect(mockUpsert).toHaveBeenCalled()
  })

  it('does not update local when updatedAt and version are equal', async () => {
    const sameTimestamp = '2026-06-25T12:00:00.000Z'
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(okResponse({ ...SERVER_PROGRESS, updatedAt: sameTimestamp, version: 5 })),
    )
    const localIdentical: LocalProgress = { ...LOCAL_PROGRESS, updatedAt: sameTimestamp, version: 5 }
    const mockUpsert = vi.fn()
    const localRepo = makeLocalRepo({ get: vi.fn().mockResolvedValue(localIdentical), upsert: mockUpsert })

    await pullProgress('user_123', localRepo, makeSyncActions(), makeQueryClient())

    expect(mockUpsert).not.toHaveBeenCalled()
  })

  it('does not overwrite a dirty local record — push must complete first', async () => {
    const dirtyLocal: LocalProgress = { ...LOCAL_PROGRESS, dirty: true }
    const mockUpsert = vi.fn()
    const localRepo = makeLocalRepo({ get: vi.fn().mockResolvedValue(dirtyLocal), upsert: mockUpsert })
    const syncActions = makeSyncActions()

    // Server is newer, but local is dirty — should bail without writing to Dexie
    await pullProgress('user_123', localRepo, syncActions, makeQueryClient())

    expect(mockUpsert).not.toHaveBeenCalled()
    expect(syncActions.setSyncComplete).not.toHaveBeenCalled()
    expect(syncActions.setSyncing).toHaveBeenCalledWith(false)
  })

  it('calls setSyncError when the server response fails Zod validation', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(okResponse({ userId: 'user_123', completedPeakIds: 'not-an-array' })),
    )
    const mockUpsert = vi.fn()
    const localRepo = makeLocalRepo({ upsert: mockUpsert })
    const syncActions = makeSyncActions()

    await pullProgress('user_123', localRepo, syncActions, makeQueryClient())

    expect(mockUpsert).not.toHaveBeenCalled()
    expect(syncActions.setSyncError).toHaveBeenCalledWith('Pull failed: invalid response from server')
  })
})
