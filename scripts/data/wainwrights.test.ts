// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { PeakSchema } from '@/lib/validation/schemas'
import data from './wainwrights.json'

describe('wainwrights.json', () => {
  it('contains exactly 214 records', () => {
    expect(data).toHaveLength(214)
  })

  it('every record validates against PeakSchema', () => {
    const failures = data
      .map((peak) => ({ peak, result: PeakSchema.safeParse(peak) }))
      .filter(({ result }) => !result.success)
      .map(({ peak, result }) => ({ name: peak.name, errors: (result as { success: false; error: { issues: unknown } }).error.issues }))

    expect(failures).toEqual([])
  })

  it('all slugs are unique', () => {
    const slugs = data.map((p) => p.slug)
    const unique = new Set(slugs)
    expect(unique.size).toBe(data.length)
  })

  it('all peakListSlug values are "wainwrights"', () => {
    const wrong = data.filter((p) => p.peakListSlug !== 'wainwrights')
    expect(wrong).toHaveLength(0)
  })

  it('all latitudes are within valid UK bounds (49–61)', () => {
    const invalid = data.filter((p) => p.latitude < 49 || p.latitude > 61)
    expect(invalid).toHaveLength(0)
  })

  it('all longitudes are within valid UK bounds (-9 to 2)', () => {
    const invalid = data.filter((p) => p.longitude < -9 || p.longitude > 2)
    expect(invalid).toHaveLength(0)
  })

  it('covers all 7 Wainwright regions', () => {
    const regions = new Set(data.map((p) => p.region))
    expect(regions).toContain('Central Fells')
    expect(regions).toContain('Eastern Fells')
    expect(regions).toContain('Far Eastern Fells')
    expect(regions).toContain('North Western Fells')
    expect(regions).toContain('Northern Fells')
    expect(regions).toContain('Southern Fells')
    expect(regions).toContain('Western Fells')
  })
})
