import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPeakListRepository } from './peak-list-repository'
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

// String _id — covers the string branch of ObjectId | string
const doc1 = { _id: 'aaa', slug: 'wainwrights', name: 'Wainwrights', peakCount: 214 }
const doc2 = { _id: 'bbb', slug: 'munros', name: 'Munros', description: 'Scottish peaks', peakCount: 282 }

// ObjectId-like _id — covers the ObjectId branch (String() calls .toString())
const mockObjectId = { toString: () => 'objectid-hex' } as unknown as ObjectId
const docWithObjectId = { _id: mockObjectId, slug: 'corbetts', name: 'Corbetts', peakCount: 222 }

describe('PeakListRepository', () => {
  it('uses the peakLists collection', () => {
    createPeakListRepository(mockDb)
    expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.peakLists)
  })
})

describe('PeakListRepository.findAll', () => {
  it('returns all peak lists mapped to PeakList models', async () => {
    mockToArray.mockResolvedValue([doc1, doc2])
    const repo = createPeakListRepository(mockDb)

    const result = await repo.findAll()

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ id: 'aaa', slug: 'wainwrights', name: 'Wainwrights', description: undefined, peakCount: 214 })
    expect(result[1]).toEqual({ id: 'bbb', slug: 'munros', name: 'Munros', description: 'Scottish peaks', peakCount: 282 })
  })

  it('returns an empty array when the collection is empty', async () => {
    mockToArray.mockResolvedValue([])
    const repo = createPeakListRepository(mockDb)

    const result = await repo.findAll()

    expect(result).toEqual([])
  })

  it('maps _id (ObjectId) to id string and excludes _id from the result', async () => {
    mockToArray.mockResolvedValue([doc1])
    const repo = createPeakListRepository(mockDb)

    const result = await repo.findAll()
    const item = result[0]!

    expect(item.id).toBe('aaa')
    expect(item).not.toHaveProperty('_id')
  })

  it('calls toString() on an ObjectId _id to produce the hex string', async () => {
    mockToArray.mockResolvedValue([docWithObjectId])
    const repo = createPeakListRepository(mockDb)

    const result = await repo.findAll()

    expect(result[0]!.id).toBe('objectid-hex')
  })

  it('passes a field projection to limit returned fields', async () => {
    mockToArray.mockResolvedValue([])
    const repo = createPeakListRepository(mockDb)

    await repo.findAll()

    expect(mockFind).toHaveBeenCalledWith(
      {},
      { projection: { _id: 1, slug: 1, name: 1, description: 1, peakCount: 1 } },
    )
  })
})

describe('PeakListRepository.findBySlug', () => {
  it('returns the matching peak list when found', async () => {
    mockFindOne.mockResolvedValue(doc2)
    const repo = createPeakListRepository(mockDb)

    const result = await repo.findBySlug('munros')

    expect(mockFindOne).toHaveBeenCalledWith(
      { slug: 'munros' },
      { projection: { _id: 1, slug: 1, name: 1, description: 1, peakCount: 1 } },
    )
    expect(result).toEqual({ id: 'bbb', slug: 'munros', name: 'Munros', description: 'Scottish peaks', peakCount: 282 })
  })

  it('returns null when no matching peak list is found', async () => {
    mockFindOne.mockResolvedValue(null)
    const repo = createPeakListRepository(mockDb)

    const result = await repo.findBySlug('corbetts')

    expect(result).toBeNull()
  })

  it('maps _id to id string and excludes _id from the result', async () => {
    mockFindOne.mockResolvedValue(doc1)
    const repo = createPeakListRepository(mockDb)

    const result = await repo.findBySlug('wainwrights')

    expect(result!.id).toBe('aaa')
    expect(result).not.toHaveProperty('_id')
  })

  it('calls toString() on an ObjectId _id to produce the hex string', async () => {
    mockFindOne.mockResolvedValue(docWithObjectId)
    const repo = createPeakListRepository(mockDb)

    const result = await repo.findBySlug('corbetts')

    expect(result!.id).toBe('objectid-hex')
  })
})
