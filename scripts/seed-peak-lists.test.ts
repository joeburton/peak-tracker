// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PeakListSchema } from '../src/lib/validation/schemas'

// ── MongoDB module mock ───────────────────────────────────────────────────────

const updateOne = vi.fn()
const mockCollection = vi.fn().mockReturnValue({ updateOne })
const mockDb = { collection: mockCollection }

vi.mock('../src/lib/db/mongodb', () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
  disconnect: vi.fn().mockResolvedValue(undefined),
}))

// ── Import after mock is in place ─────────────────────────────────────────────

const { main, PEAK_LISTS } = await import('./seed-peak-lists')

// ── Schema validation ─────────────────────────────────────────────────────────

describe('seed-peak-lists data', () => {
  it('every list validates against PeakListSchema', () => {
    const failures = PEAK_LISTS
      .map((list) => ({ list, result: PeakListSchema.safeParse({ id: list.slug, ...list }) }))
      .filter(({ result }) => !result.success)
      .map(({ list, result }) => ({
        slug: list.slug,
        errors: (result as { success: false; error: { issues: unknown } }).error.issues,
      }))
    expect(failures).toEqual([])
  })

  it('wainwrights peakCount matches the data file', () => {
    const wainwrights = PEAK_LISTS.find((l) => l.slug === 'wainwrights')
    expect(wainwrights?.peakCount).toBe(214)
  })

  it('munros peakCount matches the data file', () => {
    const munros = PEAK_LISTS.find((l) => l.slug === 'munros')
    expect(munros?.peakCount).toBe(282)
  })

  it('all slugs are unique', () => {
    const slugs = PEAK_LISTS.map((l) => l.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('all descriptions are non-empty', () => {
    const empty = PEAK_LISTS.filter((l) => !l.description || l.description.length === 0)
    expect(empty).toHaveLength(0)
  })
})

// ── main() behaviour ──────────────────────────────────────────────────────────

describe('main()', () => {
  beforeEach(() => {
    updateOne.mockReset()
    updateOne.mockResolvedValue({ upsertedCount: 0, modifiedCount: 1 })
  })

  it('calls updateOne once per peak list with upsert:true', async () => {
    await main()
    expect(updateOne).toHaveBeenCalledTimes(PEAK_LISTS.length)
    for (const call of updateOne.mock.calls) {
      expect(call[2]).toEqual({ upsert: true })
    }
  })

  it('filters by slug and sets the correct fields', async () => {
    await main()

    const wCall = updateOne.mock.calls.find((c) => c[0]?.slug === 'wainwrights')
    expect(wCall).toBeDefined()
    expect(wCall![1]).toMatchObject({
      $set: expect.objectContaining({ name: 'Wainwrights', peakCount: 214, updatedAt: expect.any(Date) }),
      $setOnInsert: expect.objectContaining({ createdAt: expect.any(Date) }),
    })

    const mCall = updateOne.mock.calls.find((c) => c[0]?.slug === 'munros')
    expect(mCall).toBeDefined()
    expect(mCall![1]).toMatchObject({
      $set: expect.objectContaining({ name: 'Munros', peakCount: 282, updatedAt: expect.any(Date) }),
      $setOnInsert: expect.objectContaining({ createdAt: expect.any(Date) }),
    })
  })

  it('is idempotent: second call upserts again without error', async () => {
    await main()
    await main()
    expect(updateOne).toHaveBeenCalledTimes(PEAK_LISTS.length * 2)
  })

  it('resolves without throwing when all upserts succeed', async () => {
    await expect(main()).resolves.toBeUndefined()
  })
})
