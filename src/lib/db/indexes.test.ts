import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Db } from 'mongodb'

vi.mock('@/lib/db/mongodb', () => ({
  getDb: vi.fn(),
}))

import { createIndexes } from './indexes'
import { getDb } from '@/lib/db/mongodb'
import { COLLECTIONS } from '@/lib/db/collections'

const peakListsCreateIndexes = vi.fn().mockResolvedValue([])
const peaksCreateIndexes = vi.fn().mockResolvedValue([])
const progressCreateIndexes = vi.fn().mockResolvedValue([])

const mockCollection = vi.fn((name: string) => {
  if (name === COLLECTIONS.peakLists) return { createIndexes: peakListsCreateIndexes }
  if (name === COLLECTIONS.peaks) return { createIndexes: peaksCreateIndexes }
  return { createIndexes: progressCreateIndexes }
})

const mockDb = { collection: mockCollection } as unknown as Db

beforeEach(() => {
  vi.mocked(getDb).mockResolvedValue(mockDb)
  peakListsCreateIndexes.mockReset().mockResolvedValue([])
  peaksCreateIndexes.mockReset().mockResolvedValue([])
  progressCreateIndexes.mockReset().mockResolvedValue([])
  mockCollection.mockClear()
})

describe('createIndexes', () => {
  it('creates indexes on all three collections', async () => {
    await createIndexes()

    expect(mockCollection).toHaveBeenCalledWith(COLLECTIONS.peakLists)
    expect(mockCollection).toHaveBeenCalledWith(COLLECTIONS.peaks)
    expect(mockCollection).toHaveBeenCalledWith(COLLECTIONS.progress)
    expect(peakListsCreateIndexes).toHaveBeenCalledTimes(1)
    expect(peaksCreateIndexes).toHaveBeenCalledTimes(1)
    expect(progressCreateIndexes).toHaveBeenCalledTimes(1)
  })

  it('creates a unique slug index on peakLists', async () => {
    await createIndexes()

    const [peakListIndexes] = peakListsCreateIndexes.mock.calls[0]!
    expect(peakListIndexes).toContainEqual(
      expect.objectContaining({ key: { slug: 1 }, unique: true }),
    )
  })

  it('creates a unique slug index on peaks', async () => {
    await createIndexes()

    const [peakIndexes] = peaksCreateIndexes.mock.calls[0]!
    expect(peakIndexes).toContainEqual(
      expect.objectContaining({ key: { slug: 1 }, unique: true }),
    )
  })

  it('creates peakListSlug, region, and heightMetres indexes on peaks', async () => {
    await createIndexes()

    const [peakIndexes] = peaksCreateIndexes.mock.calls[0]!
    expect(peakIndexes).toContainEqual(expect.objectContaining({ key: { peakListSlug: 1 } }))
    expect(peakIndexes).toContainEqual(expect.objectContaining({ key: { region: 1 } }))
    expect(peakIndexes).toContainEqual(expect.objectContaining({ key: { heightMetres: 1 } }))
  })

  it('creates a userId index on progress', async () => {
    await createIndexes()

    const [progressIndexes] = progressCreateIndexes.mock.calls[0]!
    expect(progressIndexes).toContainEqual(expect.objectContaining({ key: { userId: 1 } }))
    expect(progressIndexes).not.toContainEqual(
      expect.objectContaining({ key: { userId: 1 }, unique: true }),
    )
  })

  it('does not throw when called twice with the mock', async () => {
    await createIndexes()
    await createIndexes()

    // Verifies the function itself has no state that prevents repeated calls.
    // Real MongoDB idempotency (no IndexOptionsConflict) requires an integration test.
    expect(peakListsCreateIndexes).toHaveBeenCalledTimes(2)
    expect(peaksCreateIndexes).toHaveBeenCalledTimes(2)
    expect(progressCreateIndexes).toHaveBeenCalledTimes(2)
  })
})
