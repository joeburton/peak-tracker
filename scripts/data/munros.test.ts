// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { PeakSchema } from '@/lib/validation/schemas'
import data from './munros.json'

describe('munros.json', () => {
  it('contains exactly 282 records', () => {
    expect(data).toHaveLength(282)
  })

  it('every record validates against PeakSchema', () => {
    const failures = data
      .map((peak) => ({ peak, result: PeakSchema.safeParse(peak) }))
      .filter(({ result }) => !result.success)
      .map(({ peak, result }) => ({
        name: peak.name,
        errors: (result as { success: false; error: { issues: unknown } }).error.issues,
      }))

    expect(failures).toEqual([])
  })

  it('all slugs are unique', () => {
    const slugs = data.map((p) => p.slug)
    const unique = new Set(slugs)
    expect(unique.size).toBe(data.length)
  })

  it('all peakListSlug values are "munros"', () => {
    const wrong = data.filter((p) => p.peakListSlug !== 'munros')
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

  it('covers all 40 Munro regions', () => {
    const regions = new Set(data.map((p) => p.region))
    expect(regions.size).toBe(40)
    // Verify the 6 disambiguated region names produced by custom cleaning logic
    expect(regions).toContain('Cairngorms (A)')
    expect(regions).toContain('Cairngorms (B)')
    expect(regions).toContain('Braemar to Montrose (A)')
    expect(regions).toContain('Braemar to Montrose (B)')
    expect(regions).toContain('Loch Ericht to Glen Tromie & Glen Garry (A)')
    expect(regions).toContain('Loch Ericht to Glen Tromie & Glen Garry (B)')
  })
})
