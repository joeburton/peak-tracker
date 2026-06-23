import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPeakListRepository } from './peak-list-repository'
import type { Db } from 'mongodb'

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

const doc1 = { _id: 'aaa', slug: 'wainwrights', name: 'Wainwrights', peakCount: 214 }
const doc2 = { _id: 'bbb', slug: 'munros', name: 'Munros', description: 'Scottish peaks', peakCount: 282 }

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
})

describe('PeakListRepository.findBySlug', () => {
  it('returns the matching peak list when found', async () => {
    mockFindOne.mockResolvedValue(doc2)
    const repo = createPeakListRepository(mockDb)

    const result = await repo.findBySlug('munros')

    expect(mockFindOne).toHaveBeenCalledWith({ slug: 'munros' })
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
})
