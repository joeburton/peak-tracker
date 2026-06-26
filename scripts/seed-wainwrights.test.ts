// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { PEAKS } from './seed-wainwrights'

describe('seed-wainwrights PEAKS', () => {
  it('contains exactly 214 records', () => {
    expect(PEAKS).toHaveLength(214)
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
