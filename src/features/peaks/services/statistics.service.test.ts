import { describe, it, expect } from 'vitest'
import { computeStatistics, computeRegionalStatistics } from './statistics.service'
import type { Peak } from '@/lib/types/domain'

const makePeak = (overrides: Partial<Peak> & { id: string; region: string }): Peak => ({
  peakListSlug: 'wainwrights',
  slug: overrides.id,
  name: overrides.id,
  heightMetres: 700,
  heightFeet: 2297,
  latitude: 54.5,
  longitude: -3.0,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
})

const easternPeaks: Peak[] = [
  makePeak({ id: 'helvellyn', region: 'Eastern Fells' }),
  makePeak({ id: 'catstycam', region: 'Eastern Fells' }),
  makePeak({ id: 'birkhouse-moor', region: 'Eastern Fells' }),
]

const centralPeaks: Peak[] = [
  makePeak({ id: 'scafell-pike', region: 'Central Fells' }),
  makePeak({ id: 'great-gable', region: 'Central Fells' }),
]

const allPeaks = [...easternPeaks, ...centralPeaks]

// ── computeStatistics ─────────────────────────────────────────────────────────

describe('computeStatistics — empty peak list', () => {
  it('returns zeros and 0% for an empty list', () => {
    const result = computeStatistics([], [])
    expect(result).toEqual({ total: 0, completed: 0, remaining: 0, percentageComplete: 0, byRegion: [] })
  })
})

describe('computeStatistics — zero completed', () => {
  it('returns correct totals when nothing is completed', () => {
    const result = computeStatistics(allPeaks, [])
    expect(result.total).toBe(5)
    expect(result.completed).toBe(0)
    expect(result.remaining).toBe(5)
    expect(result.percentageComplete).toBe(0)
  })
})

describe('computeStatistics — some completed', () => {
  it('returns correct totals when 2 of 5 are completed', () => {
    const result = computeStatistics(allPeaks, ['helvellyn', 'scafell-pike'])
    expect(result.total).toBe(5)
    expect(result.completed).toBe(2)
    expect(result.remaining).toBe(3)
    expect(result.percentageComplete).toBe(40)
  })

  it('rounds percentageComplete to one decimal place', () => {
    const result = computeStatistics(allPeaks, ['helvellyn'])
    expect(result.percentageComplete).toBe(20)
    // 1/3 = 33.3%
    const result2 = computeStatistics(easternPeaks, ['helvellyn'])
    expect(result2.percentageComplete).toBe(33.3)
  })

  it('ignores completedPeakIds not in the peak list', () => {
    const result = computeStatistics(allPeaks, ['unknown-peak'])
    expect(result.completed).toBe(0)
    expect(result.remaining).toBe(5)
  })
})

describe('computeStatistics — all completed', () => {
  it('returns 100% when all peaks are completed', () => {
    const ids = allPeaks.map((p) => p.id)
    const result = computeStatistics(allPeaks, ids)
    expect(result.total).toBe(5)
    expect(result.completed).toBe(5)
    expect(result.remaining).toBe(0)
    expect(result.percentageComplete).toBe(100)
  })
})

describe('computeStatistics — regional breakdown', () => {
  it('derives regions dynamically from peak data', () => {
    const result = computeStatistics(allPeaks, [])
    const regionNames = result.byRegion.map((r) => r.region)
    expect(regionNames).toContain('Eastern Fells')
    expect(regionNames).toContain('Central Fells')
  })

  it('sorts regions alphabetically', () => {
    const result = computeStatistics(allPeaks, [])
    const regionNames = result.byRegion.map((r) => r.region)
    expect(regionNames).toEqual(['Central Fells', 'Eastern Fells'])
  })

  it('computes correct regional totals', () => {
    const result = computeStatistics(allPeaks, ['helvellyn', 'scafell-pike'])
    const eastern = result.byRegion.find((r) => r.region === 'Eastern Fells')
    const central = result.byRegion.find((r) => r.region === 'Central Fells')
    expect(eastern).toBeDefined()
    expect(central).toBeDefined()
    if (!eastern || !central) return
    expect(eastern.total).toBe(3)
    expect(eastern.completed).toBe(1)
    expect(eastern.remaining).toBe(2)
    expect(central.total).toBe(2)
    expect(central.completed).toBe(1)
    expect(central.remaining).toBe(1)
  })
})

// ── computeRegionalStatistics ─────────────────────────────────────────────────

describe('computeRegionalStatistics — empty list', () => {
  it('returns an empty record for an empty peak list', () => {
    expect(computeRegionalStatistics([], [])).toEqual({})
  })
})

describe('computeRegionalStatistics — keyed lookup', () => {
  it('keys results by region name', () => {
    const result = computeRegionalStatistics(allPeaks, [])
    expect(result['Eastern Fells']).toBeDefined()
    expect(result['Central Fells']).toBeDefined()
  })

  it('returns correct stats per region', () => {
    const result = computeRegionalStatistics(allPeaks, ['helvellyn', 'catstycam'])
    expect(result['Eastern Fells']).toEqual({
      region: 'Eastern Fells',
      total: 3,
      completed: 2,
      remaining: 1,
      percentageComplete: 66.7,
    })
    expect(result['Central Fells']).toEqual({
      region: 'Central Fells',
      total: 2,
      completed: 0,
      remaining: 2,
      percentageComplete: 0,
    })
  })
})
