// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
import { COLLECTIONS } from '../../src/lib/db/collections'

// ── MongoDB module mock ───────────────────────────────────────────────────────

const bulkWrite = vi.fn()
const mockCollection = vi.fn().mockReturnValue({ bulkWrite })
const mockDb = { collection: mockCollection }

vi.mock('../../src/lib/db/mongodb', () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
  disconnect: vi.fn().mockResolvedValue(undefined),
}))

vi.spyOn(console, 'log').mockImplementation(() => {})
afterAll(() => vi.restoreAllMocks())

const { seedPeaks } = await import('./seed-peaks')

// ── Fixture ───────────────────────────────────────────────────────────────────

const makePeak = (n: number) => ({
  id: `id-${n}`,
  peakListSlug: 'test-list',
  slug: `peak-${n}`,
  name: `Peak ${n}`,
  region: 'Test Region',
  heightMetres: 600 + n,
  heightFeet: Math.round((600 + n) * 3.28084),
  latitude: 54.0 + n * 0.01,
  longitude: -3.0 + n * 0.01,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
})

const TWO_PEAKS = [makePeak(1), makePeak(2)]

// ── seedPeaks() behaviour ─────────────────────────────────────────────────────

describe('seedPeaks()', () => {
  beforeEach(() => {
    bulkWrite.mockReset()
    mockCollection.mockClear()
    bulkWrite.mockResolvedValue({
      upsertedCount: TWO_PEAKS.length,
      modifiedCount: 0,
      hasWriteErrors: () => false,
      getWriteErrors: () => [],
    })
  })

  it('writes to the peaks collection', async () => {
    await seedPeaks(TWO_PEAKS, 'Test List')
    expect(mockCollection).toHaveBeenCalledWith(COLLECTIONS.peaks)
  })

  it('calls bulkWrite once with one operation per peak', async () => {
    await seedPeaks(TWO_PEAKS, 'Test List')
    expect(bulkWrite).toHaveBeenCalledTimes(1)
    const [ops] = bulkWrite.mock.calls[0] as [unknown[]]
    expect(ops).toHaveLength(TWO_PEAKS.length)
  })

  it('each operation is an upsert filtered by slug', async () => {
    await seedPeaks(TWO_PEAKS, 'Test List')
    const [ops] = bulkWrite.mock.calls[0] as [Array<{ updateOne: { filter: { slug: string }; update: unknown; upsert: boolean } }>]
    for (const op of ops) {
      expect(op.updateOne.upsert).toBe(true)
      expect(typeof op.updateOne.filter.slug).toBe('string')
    }
  })

  it('each operation sets the required peak fields', async () => {
    await seedPeaks(TWO_PEAKS, 'Test List')
    const [ops] = bulkWrite.mock.calls[0] as [Array<{ updateOne: { update: { $set: Record<string, unknown>; $setOnInsert: Record<string, unknown> } } }>]
    const first = ops[0]!
    expect(first.updateOne.update.$set).toMatchObject({
      slug: expect.any(String),
      peakListSlug: expect.any(String),
      name: expect.any(String),
      region: expect.any(String),
      heightMetres: expect.any(Number),
      heightFeet: expect.any(Number),
      latitude: expect.any(Number),
      longitude: expect.any(Number),
      updatedAt: expect.any(Date),
    })
    expect(first.updateOne.update.$setOnInsert).toMatchObject({
      createdAt: expect.any(Date),
    })
  })

  it('does not include id in $set', async () => {
    await seedPeaks(TWO_PEAKS, 'Test List')
    const [ops] = bulkWrite.mock.calls[0] as [Array<{ updateOne: { update: { $set: Record<string, unknown> } } }>]
    expect(ops[0]!.updateOne.update.$set).not.toHaveProperty('id')
  })

  it('uses ordered:false so a single failure does not abort the batch', async () => {
    await seedPeaks(TWO_PEAKS, 'Test List')
    const [, options] = bulkWrite.mock.calls[0] as [unknown, { ordered: boolean }]
    expect(options.ordered).toBe(false)
  })

  it('throws when bulkWrite reports write errors', async () => {
    bulkWrite.mockResolvedValue({
      upsertedCount: 1,
      modifiedCount: 0,
      hasWriteErrors: () => true,
      getWriteErrors: () => [{ errmsg: 'duplicate key error' }],
    })
    await expect(seedPeaks(TWO_PEAKS, 'Test List')).rejects.toThrow('write error')
  })

  it('is idempotent: second call executes without error', async () => {
    bulkWrite.mockResolvedValue({ upsertedCount: 0, modifiedCount: TWO_PEAKS.length, hasWriteErrors: () => false, getWriteErrors: () => [] })
    await seedPeaks(TWO_PEAKS, 'Test List')
    await seedPeaks(TWO_PEAKS, 'Test List')
    expect(bulkWrite).toHaveBeenCalledTimes(2)
  })

  it('resolves without throwing when bulkWrite succeeds', async () => {
    await expect(seedPeaks(TWO_PEAKS, 'Test List')).resolves.toBeUndefined()
  })
})
