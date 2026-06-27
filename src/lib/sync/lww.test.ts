import { describe, it, expect } from 'vitest'
import { isNewerThan } from './lww'

const BASE = { updatedAt: '2026-06-25T10:00:00.000Z', version: 3 }

describe('isNewerThan — updatedAt primary, version tiebreaker', () => {
  it('returns true when a has a later updatedAt', () => {
    const a = { updatedAt: '2026-06-25T12:00:00.000Z', version: 1 }
    const b = { updatedAt: '2026-06-25T10:00:00.000Z', version: 99 }
    expect(isNewerThan(a, b)).toBe(true)
  })

  it('returns false when a has an earlier updatedAt', () => {
    const a = { updatedAt: '2026-06-25T08:00:00.000Z', version: 99 }
    const b = { updatedAt: '2026-06-25T10:00:00.000Z', version: 1 }
    expect(isNewerThan(a, b)).toBe(false)
  })

  it('returns true when timestamps are equal and a has a higher version', () => {
    const a = { ...BASE, version: 5 }
    const b = { ...BASE, version: 3 }
    expect(isNewerThan(a, b)).toBe(true)
  })

  it('returns false when timestamps are equal and a has a lower version', () => {
    const a = { ...BASE, version: 2 }
    const b = { ...BASE, version: 3 }
    expect(isNewerThan(a, b)).toBe(false)
  })

  it('returns false when timestamps and versions are identical', () => {
    expect(isNewerThan(BASE, BASE)).toBe(false)
  })

  it('is not symmetric — a newer than b does not imply b newer than a', () => {
    const a = { updatedAt: '2026-06-25T12:00:00.000Z', version: 5 }
    const b = { updatedAt: '2026-06-25T10:00:00.000Z', version: 5 }
    expect(isNewerThan(a, b)).toBe(true)
    expect(isNewerThan(b, a)).toBe(false)
  })

  it('updatedAt wins regardless of version — later timestamp with lower version still wins', () => {
    const a = { updatedAt: '2026-06-25T12:00:00.000Z', version: 1 }
    const b = { updatedAt: '2026-06-25T10:00:00.000Z', version: 100 }
    expect(isNewerThan(a, b)).toBe(true)
  })

  it('version only matters when timestamps are identical', () => {
    const a = { ...BASE, version: 10 }
    const b = { ...BASE, version: 2 }
    expect(isNewerThan(a, b)).toBe(true)
    expect(isNewerThan(b, a)).toBe(false)
  })
})
