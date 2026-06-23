import { describe, it, expect } from 'vitest'
import { PeakListSchema, PeakSchema, UserProgressSchema } from './schemas'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const validPeakList = {
  id: 'pl-1',
  slug: 'wainwrights',
  name: 'Wainwrights',
  description: '214 fells in the Lake District',
  peakCount: 214,
}

const validPeak = {
  id: 'pk-1',
  peakListSlug: 'wainwrights',
  slug: 'scafell-pike',
  name: 'Scafell Pike',
  region: 'Southern Fells',
  heightMetres: 978,
  heightFeet: 3209,
  latitude: 54.4541,
  longitude: -3.2114,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

const validUserProgress = {
  userId: 'user_abc123',
  completedPeakIds: ['pk-1', 'pk-2'],
  updatedAt: '2024-06-01T12:00:00.000Z',
  version: 3,
}

// ---------------------------------------------------------------------------
// PeakListSchema
// ---------------------------------------------------------------------------

describe('PeakListSchema', () => {
  it('accepts a valid peak list', () => {
    expect(PeakListSchema.safeParse(validPeakList).success).toBe(true)
  })

  it('accepts a peak list without description', () => {
    const { description: _description, ...withoutDesc } = validPeakList
    expect(PeakListSchema.safeParse(withoutDesc).success).toBe(true)
  })

  it('rejects an empty slug', () => {
    const result = PeakListSchema.safeParse({ ...validPeakList, slug: '' })
    expect(result.success).toBe(false)
  })

  it('rejects an empty name', () => {
    const result = PeakListSchema.safeParse({ ...validPeakList, name: '' })
    expect(result.success).toBe(false)
  })

  it('rejects a negative peakCount', () => {
    const result = PeakListSchema.safeParse({ ...validPeakList, peakCount: -1 })
    expect(result.success).toBe(false)
  })

  it('rejects a fractional peakCount', () => {
    const result = PeakListSchema.safeParse({ ...validPeakList, peakCount: 214.5 })
    expect(result.success).toBe(false)
  })

  it('rejects a missing id', () => {
    const { id: _id, ...withoutId } = validPeakList
    const result = PeakListSchema.safeParse(withoutId)
    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// PeakSchema
// ---------------------------------------------------------------------------

describe('PeakSchema', () => {
  it('accepts a valid peak', () => {
    expect(PeakSchema.safeParse(validPeak).success).toBe(true)
  })

  it('rejects latitude above 90', () => {
    const result = PeakSchema.safeParse({ ...validPeak, latitude: 90.1 })
    expect(result.success).toBe(false)
  })

  it('rejects latitude below -90', () => {
    const result = PeakSchema.safeParse({ ...validPeak, latitude: -90.1 })
    expect(result.success).toBe(false)
  })

  it('accepts latitude at boundary values (-90, 90)', () => {
    expect(PeakSchema.safeParse({ ...validPeak, latitude: 90 }).success).toBe(true)
    expect(PeakSchema.safeParse({ ...validPeak, latitude: -90 }).success).toBe(true)
  })

  it('rejects longitude above 180', () => {
    const result = PeakSchema.safeParse({ ...validPeak, longitude: 180.1 })
    expect(result.success).toBe(false)
  })

  it('rejects longitude below -180', () => {
    const result = PeakSchema.safeParse({ ...validPeak, longitude: -180.1 })
    expect(result.success).toBe(false)
  })

  it('accepts longitude at boundary values (-180, 180)', () => {
    expect(PeakSchema.safeParse({ ...validPeak, longitude: 180 }).success).toBe(true)
    expect(PeakSchema.safeParse({ ...validPeak, longitude: -180 }).success).toBe(true)
  })

  it('rejects zero or negative heightMetres', () => {
    expect(PeakSchema.safeParse({ ...validPeak, heightMetres: 0 }).success).toBe(false)
    expect(PeakSchema.safeParse({ ...validPeak, heightMetres: -1 }).success).toBe(false)
  })

  it('rejects zero or negative heightFeet', () => {
    expect(PeakSchema.safeParse({ ...validPeak, heightFeet: 0 }).success).toBe(false)
    expect(PeakSchema.safeParse({ ...validPeak, heightFeet: -1 }).success).toBe(false)
  })

  it('rejects a missing latitude', () => {
    const { latitude: _latitude, ...withoutLat } = validPeak
    expect(PeakSchema.safeParse(withoutLat).success).toBe(false)
  })

  it('rejects a missing longitude', () => {
    const { longitude: _longitude, ...withoutLon } = validPeak
    expect(PeakSchema.safeParse(withoutLon).success).toBe(false)
  })

  it('rejects an invalid datetime string for createdAt', () => {
    const result = PeakSchema.safeParse({ ...validPeak, createdAt: '2024-01-01' })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid datetime string for updatedAt', () => {
    const result = PeakSchema.safeParse({ ...validPeak, updatedAt: 'not-a-date' })
    expect(result.success).toBe(false)
  })

  it('rejects an empty region', () => {
    const result = PeakSchema.safeParse({ ...validPeak, region: '' })
    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// UserProgressSchema
// ---------------------------------------------------------------------------

describe('UserProgressSchema', () => {
  it('accepts valid user progress', () => {
    expect(UserProgressSchema.safeParse(validUserProgress).success).toBe(true)
  })

  it('accepts an empty completedPeakIds array', () => {
    const result = UserProgressSchema.safeParse({ ...validUserProgress, completedPeakIds: [] })
    expect(result.success).toBe(true)
  })

  it('rejects an empty userId', () => {
    const result = UserProgressSchema.safeParse({ ...validUserProgress, userId: '' })
    expect(result.success).toBe(false)
  })

  it('rejects a negative version', () => {
    const result = UserProgressSchema.safeParse({ ...validUserProgress, version: -1 })
    expect(result.success).toBe(false)
  })

  it('rejects a fractional version', () => {
    const result = UserProgressSchema.safeParse({ ...validUserProgress, version: 1.5 })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid updatedAt datetime', () => {
    const result = UserProgressSchema.safeParse({ ...validUserProgress, updatedAt: '2024-01-01' })
    expect(result.success).toBe(false)
  })

  it('strips the dirty field — it is client-only and must not reach MongoDB', () => {
    const result = UserProgressSchema.safeParse({ ...validUserProgress, dirty: true })
    expect(result.success).toBe(true)
    if (result.success) {
      expect('dirty' in result.data).toBe(false)
    }
  })

  it('rejects a missing userId', () => {
    const { userId: _userId, ...withoutUserId } = validUserProgress
    expect(UserProgressSchema.safeParse(withoutUserId).success).toBe(false)
  })
})
