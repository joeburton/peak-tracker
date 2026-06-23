import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Db } from 'mongodb'

vi.mock('@/lib/db/mongodb', () => ({
  getDb: vi.fn(),
}))

import { createIndexes } from './indexes'
import { getDb } from '@/lib/db/mongodb'
import { COLLECTIONS } from '@/lib/db/collections'

const mockCreateIndexesFn = vi.fn().mockResolvedValue([])
const mockCollection = vi.fn(() => ({ createIndexes: mockCreateIndexesFn }))
const mockDb = { collection: mockCollection } as unknown as Db

beforeEach(() => {
  vi.mocked(getDb).mockResolvedValue(mockDb)
  mockCreateIndexesFn.mockReset().mockResolvedValue([])
  mockCollection.mockClear()
})

// createIndexes() calls db.collection() three times in order:
// call 0 → peakLists, call 1 → peaks, call 2 → progress
// Each call to collection() returns the same mock — so createIndexesFn
// is invoked once per collection, in the same order.

describe('createIndexes', () => {
  it('creates indexes on all three collections', async () => {
    await createIndexes()

    expect(mockCollection).toHaveBeenCalledWith(COLLECTIONS.peakLists)
    expect(mockCollection).toHaveBeenCalledWith(COLLECTIONS.peaks)
    expect(mockCollection).toHaveBeenCalledWith(COLLECTIONS.progress)
    expect(mockCreateIndexesFn).toHaveBeenCalledTimes(3)
  })

  it('creates a unique slug index on peakLists', async () => {
    await createIndexes()

    const [peakListIndexes] = mockCreateIndexesFn.mock.calls[0]!
    expect(peakListIndexes).toContainEqual(
      expect.objectContaining({ key: { slug: 1 }, unique: true }),
    )
  })

  it('creates a unique slug index on peaks', async () => {
    await createIndexes()

    const [peakIndexes] = mockCreateIndexesFn.mock.calls[1]!
    expect(peakIndexes).toContainEqual(
      expect.objectContaining({ key: { slug: 1 }, unique: true }),
    )
  })

  it('creates peakListSlug, region, and heightMetres indexes on peaks', async () => {
    await createIndexes()

    const [peakIndexes] = mockCreateIndexesFn.mock.calls[1]!
    expect(peakIndexes).toContainEqual(expect.objectContaining({ key: { peakListSlug: 1 } }))
    expect(peakIndexes).toContainEqual(expect.objectContaining({ key: { region: 1 } }))
    expect(peakIndexes).toContainEqual(expect.objectContaining({ key: { heightMetres: 1 } }))
  })

  it('creates a unique userId index on progress', async () => {
    await createIndexes()

    const [progressIndexes] = mockCreateIndexesFn.mock.calls[2]!
    expect(progressIndexes).toContainEqual(
      expect.objectContaining({ key: { userId: 1 }, unique: true }),
    )
  })

  it('is idempotent — safe to call multiple times without error', async () => {
    await createIndexes()
    await createIndexes()

    // MongoDB createIndexes is idempotent by design — calling twice with the
    // same index spec is a no-op on a live database. The function itself
    // delegates entirely to the driver, so two calls must not throw.
    expect(mockCreateIndexesFn).toHaveBeenCalledTimes(6) // 3 collections × 2 runs
  })
})
