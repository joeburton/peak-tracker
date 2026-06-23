import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPeakRepository } from './peak-repository'
import { COLLECTIONS } from '@/lib/db/collections'
import type { Db, ObjectId } from 'mongodb'

const mockToArray = vi.fn()
const mockFindOne = vi.fn()
const mockFind = vi.fn(() => ({ toArray: mockToArray }))

const mockDb = {
  collection: vi.fn(() => ({
    find: mockFind,
    findOne: mockFindOne,
  })),
} as unknown as Db

beforeEach(() => {
  mockToArray.mockReset()
  mockFindOne.mockReset()
  mockFind.mockClear()
})

const basePeak = {
  peakListSlug: 'wainwrights',
  slug: 'scafell-pike',
  name: 'Scafell Pike',
  region: 'Southern Fells',
  heightMetres: 978,
  heightFeet: 3209,
  latitude: 54.4541,
  longitude: -3.2112,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

const doc1 = { _id: 'aaa', ...basePeak }
const doc2 = {
  _id: 'bbb',
  ...basePeak,
  slug: 'helvellyn',
  name: 'Helvellyn',
  region: 'Eastern Fells',
  heightMetres: 950,
  heightFeet: 3117,
}

// ObjectId-like — confirms String() calls .toString() on the real driver type
const mockObjectId = { toString: () => 'objectid-hex' } as unknown as ObjectId
const docWithObjectId = { _id: mockObjectId, ...basePeak }

const EXPECTED_PROJECTION = {
  _id: 1,
  peakListSlug: 1,
  slug: 1,
  name: 1,
  region: 1,
  heightMetres: 1,
  heightFeet: 1,
  latitude: 1,
  longitude: 1,
  createdAt: 1,
  updatedAt: 1,
}

describe('PeakRepository', () => {
  it('uses the peaks collection', () => {
    createPeakRepository(mockDb)
    expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.peaks)
  })
})

describe('PeakRepository.findByListSlug', () => {
  it('returns all peaks for a list', async () => {
    mockToArray.mockResolvedValue([doc1, doc2])
    const repo = createPeakRepository(mockDb)

    const result = await repo.findByListSlug('wainwrights')

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ id: 'aaa', ...basePeak })
    expect(result[1]).toEqual({ id: 'bbb', ...basePeak, slug: 'helvellyn', name: 'Helvellyn', region: 'Eastern Fells', heightMetres: 950, heightFeet: 3117 })
  })

  it('returns an empty array when no peaks match the list slug', async () => {
    mockToArray.mockResolvedValue([])
    const repo = createPeakRepository(mockDb)

    const result = await repo.findByListSlug('corbetts')

    expect(result).toEqual([])
  })

  it('queries by peakListSlug with a field projection', async () => {
    mockToArray.mockResolvedValue([])
    const repo = createPeakRepository(mockDb)

    await repo.findByListSlug('wainwrights')

    expect(mockFind).toHaveBeenCalledWith(
      { peakListSlug: 'wainwrights' },
      { projection: EXPECTED_PROJECTION },
    )
  })

  it('calls toString() on an ObjectId _id', async () => {
    mockToArray.mockResolvedValue([docWithObjectId])
    const repo = createPeakRepository(mockDb)

    const result = await repo.findByListSlug('wainwrights')

    expect(result[0]!.id).toBe('objectid-hex')
    expect(result[0]).not.toHaveProperty('_id')
  })
})

describe('PeakRepository.findBySlug', () => {
  it('returns the matching peak when found', async () => {
    mockFindOne.mockResolvedValue(doc1)
    const repo = createPeakRepository(mockDb)

    const result = await repo.findBySlug('scafell-pike')

    expect(mockFindOne).toHaveBeenCalledWith(
      { slug: 'scafell-pike' },
      { projection: EXPECTED_PROJECTION },
    )
    expect(result).toEqual({ id: 'aaa', ...basePeak })
  })

  it('returns null when no peak matches the slug', async () => {
    mockFindOne.mockResolvedValue(null)
    const repo = createPeakRepository(mockDb)

    const result = await repo.findBySlug('unknown-peak')

    expect(result).toBeNull()
  })

  it('maps _id to id and excludes _id from the result', async () => {
    mockFindOne.mockResolvedValue(doc1)
    const repo = createPeakRepository(mockDb)

    const result = await repo.findBySlug('scafell-pike')

    expect(result!.id).toBe('aaa')
    expect(result).not.toHaveProperty('_id')
  })

  it('calls toString() on an ObjectId _id', async () => {
    mockFindOne.mockResolvedValue(docWithObjectId)
    const repo = createPeakRepository(mockDb)

    const result = await repo.findBySlug('scafell-pike')

    expect(result!.id).toBe('objectid-hex')
  })
})

describe('PeakRepository.findByRegion', () => {
  it('returns peaks matching both peakListSlug and region', async () => {
    mockToArray.mockResolvedValue([doc1])
    const repo = createPeakRepository(mockDb)

    const result = await repo.findByRegion('wainwrights', 'Southern Fells')

    expect(result).toHaveLength(1)
    expect(result[0]!.region).toBe('Southern Fells')
  })

  it('returns an empty array when no peaks match', async () => {
    mockToArray.mockResolvedValue([])
    const repo = createPeakRepository(mockDb)

    const result = await repo.findByRegion('wainwrights', 'Unknown Region')

    expect(result).toEqual([])
  })

  it('queries by both peakListSlug and region with a field projection', async () => {
    mockToArray.mockResolvedValue([])
    const repo = createPeakRepository(mockDb)

    await repo.findByRegion('wainwrights', 'Southern Fells')

    expect(mockFind).toHaveBeenCalledWith(
      { peakListSlug: 'wainwrights', region: 'Southern Fells' },
      { projection: EXPECTED_PROJECTION },
    )
  })

  it('does not return peaks from a different region', async () => {
    mockToArray.mockResolvedValue([doc2])
    const repo = createPeakRepository(mockDb)

    const result = await repo.findByRegion('wainwrights', 'Eastern Fells')

    expect(result[0]!.region).toBe('Eastern Fells')
    expect(result.some(p => p.region === 'Southern Fells')).toBe(false)
  })
})
