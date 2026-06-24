// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { PEAKS } from './seed-munros'

describe('seed-munros PEAKS', () => {
  it('contains exactly 282 records', () => {
    expect(PEAKS).toHaveLength(282)
  })

  it('all peakListSlug values are "munros"', () => {
    const wrong = PEAKS.filter((p) => p.peakListSlug !== 'munros')
    expect(wrong).toHaveLength(0)
  })

  it('all slugs are unique', () => {
    const slugs = PEAKS.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(PEAKS.length)
  })
})
