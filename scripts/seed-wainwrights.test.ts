// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { COLLECTIONS } from '../src/lib/db/collections'

// ── MongoDB module mock ───────────────────────────────────────────────────────

const bulkWrite = vi.fn()
const mockCollection = vi.fn().mockReturnValue({ bulkWrite })
const mockDb = { collection: mockCollection }

vi.mock('../src/lib/db/mongodb', () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
  disconnect: vi.fn().mockResolvedValue(undefined),
}))

const { main, PEAKS } = await import('./seed-wainwrights')

// ── Data integrity ────────────────────────────────────────────────────────────

describe('seed-wainwrights data', () => {
  it('contains exactly 214 records', () => {
    expect(PEAKS).toHaveLength(214)
  })

  it('all records are valid PeakSchema instances (validated at import)', () => {
    // PEAKS is the result of rawData.map(PeakSchema.parse) — if any record
    // failed validation the module would have thrown during import
    expect(PEAKS.length).toBeGreaterThan(0)
  })

  it('all peakListSlug values are "wainwrights"', () => {
    const wrong = PEAKS.filter((p) => p.peakListSlug !== 'wainwrights')
    expect(wrong).toHaveLength(0)
  })

  it('all slugs are unique', () => {
    const slugs = PEAKS.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(PEAKS.length)
  })
})

// ── main() behaviour ──────────────────────────────────────────────────────────

describe('main()', () => {
  beforeEach(() => {
    bulkWrite.mockReset()
    mockCollection.mockClear()
    bulkWrite.mockResolvedValue({
      upsertedCount: 214,
      modifiedCount: 0,
      hasWriteErrors: () => false,
      getWriteErrors: () => [],
    })
  })

  it('writes to the peaks collection', async () => {
    await main()
    expect(mockCollection).toHaveBeenCalledWith(COLLECTIONS.peaks)
  })

  it('calls bulkWrite once with one operation per peak', async () => {
    await main()
    expect(bulkWrite).toHaveBeenCalledTimes(1)
    const [ops] = bulkWrite.mock.calls[0] as [unknown[]]
    expect(ops).toHaveLength(214)
  })

  it('each operation is an upsert filtered by slug', async () => {
    await main()
    const [ops] = bulkWrite.mock.calls[0] as [Array<{ updateOne: { filter: { slug: string }; update: unknown; upsert: boolean } }>]
    for (const op of ops) {
      expect(op.updateOne.upsert).toBe(true)
      expect(typeof op.updateOne.filter.slug).toBe('string')
    }
  })

  it('each operation sets the required peak fields', async () => {
    await main()
    const [ops] = bulkWrite.mock.calls[0] as [Array<{ updateOne: { update: { $set: Record<string, unknown>; $setOnInsert: Record<string, unknown> } } }>]
    const first = ops[0]!
    expect(first.updateOne.update.$set).toMatchObject({
      peakListSlug: 'wainwrights',
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

  it('uses ordered:false so a single failure does not abort the batch', async () => {
    await main()
    const [, options] = bulkWrite.mock.calls[0] as [unknown, { ordered: boolean }]
    expect(options.ordered).toBe(false)
  })

  it('throws when bulkWrite reports write errors', async () => {
    bulkWrite.mockResolvedValue({
      upsertedCount: 200,
      modifiedCount: 0,
      hasWriteErrors: () => true,
      getWriteErrors: () => [{ errmsg: 'duplicate key error' }],
    })
    await expect(main()).rejects.toThrow('write error')
  })

  it('is idempotent: second call executes without error', async () => {
    bulkWrite.mockResolvedValue({ upsertedCount: 0, modifiedCount: 214, hasWriteErrors: () => false, getWriteErrors: () => [] })
    await main()
    await main()
    expect(bulkWrite).toHaveBeenCalledTimes(2)
  })

  it('resolves without throwing when bulkWrite succeeds', async () => {
    await expect(main()).resolves.toBeUndefined()
  })
})
