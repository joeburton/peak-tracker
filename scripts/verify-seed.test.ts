// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { COLLECTIONS } from '../src/lib/db/collections'

// ── MongoDB module mock ───────────────────────────────────────────────────────

const countDocuments = vi.fn()
const distinct = vi.fn()
const mockCollection = vi.fn().mockReturnValue({ countDocuments, distinct })
const mockDb = { collection: mockCollection }

vi.mock('../src/lib/db/mongodb', () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
  disconnect: vi.fn().mockResolvedValue(undefined),
}))

const {
  verify,
  EXPECTED_WAINWRIGHTS,
  EXPECTED_MUNROS,
  EXPECTED_TOTAL,
  UK_LAT,
  UK_LNG,
} = await import('./verify-seed')

// ── Mock helpers ──────────────────────────────────────────────────────────────

// countDocuments is called in this fixed order by verify():
//  0. { peakListSlug: 'wainwrights' }
//  1. { peakListSlug: 'munros' }
//  2. (no filter) — total count
//  3. invalid heightMetres
//  4. invalid heightFeet
//  5. invalid latitude
//  6. invalid longitude
//  7. missing required fields
const HAPPY_COUNTS = [EXPECTED_WAINWRIGHTS, EXPECTED_MUNROS, EXPECTED_TOTAL, 0, 0, 0, 0, 0]

function setupSuccessMocks(
  countOverrides: Partial<Record<number, number>> = {},
  distinctCount = EXPECTED_TOTAL,
) {
  countDocuments.mockReset()
  distinct.mockReset()
  HAPPY_COUNTS.forEach((value, i) => {
    countDocuments.mockResolvedValueOnce(countOverrides[i] ?? value)
  })
  distinct.mockResolvedValueOnce(Array.from({ length: distinctCount }, (_, i) => `slug-${i}`))
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('verify()', () => {
  beforeEach(() => setupSuccessMocks())

  it('returns [] when all checks pass', async () => {
    const failures = await verify()
    expect(failures).toEqual([])
  })

  it('writes to the peaks collection', async () => {
    await verify()
    expect(mockCollection).toHaveBeenCalledWith(COLLECTIONS.peaks)
  })

  it('reports wrong Wainwright count', async () => {
    setupSuccessMocks({ 0: 200 })
    const failures = await verify()
    const f = failures.find((x) => x.check === 'wainwright-count')
    expect(f).toBeDefined()
    expect(f?.message).toContain('200')
  })

  it('reports wrong Munro count', async () => {
    setupSuccessMocks({ 1: 260 })
    const failures = await verify()
    const f = failures.find((x) => x.check === 'munro-count')
    expect(f).toBeDefined()
    expect(f?.message).toContain('260')
  })

  it('reports duplicate slugs when distinct count is less than total', async () => {
    // total = 496, distinct = 494 → 2 duplicates
    setupSuccessMocks({ 2: 496 }, 494)
    const failures = await verify()
    const f = failures.find((x) => x.check === 'slug-uniqueness')
    expect(f).toBeDefined()
    expect(f?.message).toContain('2 duplicate')
  })

  it('reports invalid heightMetres', async () => {
    setupSuccessMocks({ 3: 5 })
    const failures = await verify()
    const f = failures.find((x) => x.check === 'height-metres')
    expect(f).toBeDefined()
    expect(f?.message).toContain('5 record')
  })

  it('reports invalid heightFeet', async () => {
    setupSuccessMocks({ 4: 3 })
    const failures = await verify()
    expect(failures.some((x) => x.check === 'height-feet')).toBe(true)
  })

  it('reports out-of-range latitude with valid range in message', async () => {
    setupSuccessMocks({ 5: 2 })
    const failures = await verify()
    const f = failures.find((x) => x.check === 'latitude')
    expect(f).toBeDefined()
    expect(f?.message).toContain(String(UK_LAT.min))
    expect(f?.message).toContain(String(UK_LAT.max))
  })

  it('reports out-of-range longitude with valid range in message', async () => {
    setupSuccessMocks({ 6: 1 })
    const failures = await verify()
    const f = failures.find((x) => x.check === 'longitude')
    expect(f).toBeDefined()
    expect(f?.message).toContain(String(UK_LNG.min))
    expect(f?.message).toContain(String(UK_LNG.max))
  })

  it('reports missing required fields', async () => {
    setupSuccessMocks({ 7: 10 })
    const failures = await verify()
    const f = failures.find((x) => x.check === 'required-fields')
    expect(f).toBeDefined()
    expect(f?.message).toContain('10 record')
  })

  it('collects all failures without short-circuiting', async () => {
    setupSuccessMocks({ 0: 0, 1: 0, 3: 5, 4: 5, 5: 5, 6: 5, 7: 5 }, 0)
    const failures = await verify()
    expect(failures.length).toBeGreaterThan(1)
  })
})

// ── Exported constants ────────────────────────────────────────────────────────

describe('exported constants', () => {
  it('EXPECTED_WAINWRIGHTS is 214', () => expect(EXPECTED_WAINWRIGHTS).toBe(214))
  it('EXPECTED_MUNROS is 282', () => expect(EXPECTED_MUNROS).toBe(282))
  it('EXPECTED_TOTAL is the sum', () => expect(EXPECTED_TOTAL).toBe(EXPECTED_WAINWRIGHTS + EXPECTED_MUNROS))
  it('UK latitude range covers the Lake District and Scottish Highlands', () => {
    expect(UK_LAT.min).toBeLessThanOrEqual(54)
    expect(UK_LAT.max).toBeGreaterThanOrEqual(58)
  })
  it('UK longitude range covers west coast of Scotland and east of England', () => {
    expect(UK_LNG.min).toBeLessThanOrEqual(-5)
    expect(UK_LNG.max).toBeGreaterThanOrEqual(0)
  })
})
