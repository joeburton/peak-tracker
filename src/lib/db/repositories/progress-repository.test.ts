import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createProgressRepository, type ProgressUpdate } from './progress-repository'
import { COLLECTIONS } from '@/lib/db/collections'
import type { Db } from 'mongodb'

const mockFindOne = vi.fn()
const mockFindOneAndUpdate = vi.fn()

const mockDb = {
  collection: vi.fn(() => ({
    findOne: mockFindOne,
    findOneAndUpdate: mockFindOneAndUpdate,
  })),
} as unknown as Db

beforeEach(() => {
  mockFindOne.mockReset()
  mockFindOneAndUpdate.mockReset()
})

// Document fixture — what MongoDB returns (Date for updatedAt, no dirty field)
const testDate = new Date('2024-06-01T12:00:00.000Z')
const testDateStr = testDate.toISOString()

const progressDoc = {
  userId: 'user-123',
  completedPeakIds: ['peak-1', 'peak-2'],
  updatedAt: testDate,
  version: 3,
}

// Model fixture — what toModel() returns (ISO string, no dirty — it is a client-only Dexie field)
const progressModel = {
  userId: 'user-123',
  completedPeakIds: ['peak-1', 'peak-2'],
  updatedAt: testDateStr,
  version: 3,
}

const update: ProgressUpdate = {
  completedPeakIds: ['peak-1', 'peak-2', 'peak-3'],
  updatedAt: testDateStr,
}

const EXPECTED_PROJECTION = { _id: 0, userId: 1, completedPeakIds: 1, updatedAt: 1, version: 1 }

describe('ProgressRepository', () => {
  it('uses the progress collection', () => {
    createProgressRepository(mockDb)
    expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.progress)
  })
})

describe('ProgressRepository.findByUserId', () => {
  it('returns the user progress when found', async () => {
    mockFindOne.mockResolvedValue(progressDoc)
    const repo = createProgressRepository(mockDb)

    const result = await repo.findByUserId('user-123')

    expect(result).toEqual(progressModel)
  })

  it('returns null when no progress record exists for the user', async () => {
    mockFindOne.mockResolvedValue(null)
    const repo = createProgressRepository(mockDb)

    const result = await repo.findByUserId('user-123')

    expect(result).toBeNull()
  })

  it('queries by userId with the correct projection', async () => {
    mockFindOne.mockResolvedValue(null)
    const repo = createProgressRepository(mockDb)

    await repo.findByUserId('user-123')

    expect(mockFindOne).toHaveBeenCalledWith({ userId: 'user-123' }, { projection: EXPECTED_PROJECTION })
  })

  it('converts the MongoDB Date to an ISO string', async () => {
    mockFindOne.mockResolvedValue(progressDoc)
    const repo = createProgressRepository(mockDb)

    const result = await repo.findByUserId('user-123')

    expect(result!.updatedAt).toBe(testDateStr)
  })

  it('defaults completedPeakIds to [] when the field is absent from the document', async () => {
    const docWithoutPeakIds = { userId: 'user-123', updatedAt: testDate, version: 1 }
    mockFindOne.mockResolvedValue(docWithoutPeakIds)
    const repo = createProgressRepository(mockDb)

    const result = await repo.findByUserId('user-123')

    expect(result!.completedPeakIds).toEqual([])
  })

  it('never includes dirty in the MongoDB projection', async () => {
    mockFindOne.mockResolvedValue(null)
    const repo = createProgressRepository(mockDb)

    await repo.findByUserId('user-123')

    const [, options] = mockFindOne.mock.calls[0]!
    expect(options.projection).not.toHaveProperty('dirty')
  })
})

describe('ProgressRepository.upsert', () => {
  it('returns the confirmed server state after upsert', async () => {
    const upsertedDoc = { ...progressDoc, completedPeakIds: update.completedPeakIds, version: 4 }
    mockFindOneAndUpdate.mockResolvedValue(upsertedDoc)
    const repo = createProgressRepository(mockDb)

    const result = await repo.upsert('user-123', update)

    expect(result).toEqual({ ...progressModel, completedPeakIds: update.completedPeakIds, version: 4 })
  })

  it('passes $inc: { version: 1 } so the server increments on every write', async () => {
    mockFindOneAndUpdate.mockResolvedValue(progressDoc)
    const repo = createProgressRepository(mockDb)

    await repo.upsert('user-123', update)

    const [, updateArg] = mockFindOneAndUpdate.mock.calls[0]!
    expect(updateArg.$inc).toEqual({ version: 1 })
  })

  it('converts the updatedAt ISO string to a Date before writing to MongoDB', async () => {
    mockFindOneAndUpdate.mockResolvedValue(progressDoc)
    const repo = createProgressRepository(mockDb)

    await repo.upsert('user-123', update)

    const [, updateArg] = mockFindOneAndUpdate.mock.calls[0]!
    expect(updateArg.$set.updatedAt).toBeInstanceOf(Date)
    expect(updateArg.$set.updatedAt.toISOString()).toBe(testDateStr)
  })

  it('never writes dirty to MongoDB', async () => {
    mockFindOneAndUpdate.mockResolvedValue(progressDoc)
    const repo = createProgressRepository(mockDb)

    await repo.upsert('user-123', update)

    const [, updateArg] = mockFindOneAndUpdate.mock.calls[0]!
    expect(updateArg.$set).not.toHaveProperty('dirty')
    expect(updateArg.$inc).not.toHaveProperty('dirty')
  })

  it('uses upsert: true and returnDocument: after', async () => {
    mockFindOneAndUpdate.mockResolvedValue(progressDoc)
    const repo = createProgressRepository(mockDb)

    await repo.upsert('user-123', update)

    const [, , options] = mockFindOneAndUpdate.mock.calls[0]!
    expect(options.upsert).toBe(true)
    expect(options.returnDocument).toBe('after')
  })

  it('throws if the operation returns no document', async () => {
    mockFindOneAndUpdate.mockResolvedValue(null)
    const repo = createProgressRepository(mockDb)

    await expect(repo.upsert('user-123', update)).rejects.toThrow(
      'Failed to upsert progress for userId: user-123',
    )
  })

  it('throws before writing to MongoDB when updatedAt is not a valid date string', async () => {
    const repo = createProgressRepository(mockDb)

    await expect(
      repo.upsert('user-123', { completedPeakIds: ['peak-1'], updatedAt: 'not-a-date' }),
    ).rejects.toThrow('Invalid updatedAt value: "not-a-date"')

    expect(mockFindOneAndUpdate).not.toHaveBeenCalled()
  })
})

describe('ProgressRepository.restore', () => {
  it('sets completedPeakIds, updatedAt, and version directly without $inc', async () => {
    mockFindOneAndUpdate.mockResolvedValue(progressDoc)
    const repo = createProgressRepository(mockDb)

    await repo.restore(progressModel)

    const [, updateArg] = mockFindOneAndUpdate.mock.calls[0]!
    expect(updateArg.$set.completedPeakIds).toEqual(progressModel.completedPeakIds)
    expect(updateArg.$set.updatedAt).toBeInstanceOf(Date)
    expect(updateArg.$set.version).toBe(progressModel.version)
    expect(updateArg).not.toHaveProperty('$inc')
  })

  it('uses upsert: true and returnDocument: after', async () => {
    mockFindOneAndUpdate.mockResolvedValue(progressDoc)
    const repo = createProgressRepository(mockDb)

    await repo.restore(progressModel)

    const [, , options] = mockFindOneAndUpdate.mock.calls[0]!
    expect(options.upsert).toBe(true)
    expect(options.returnDocument).toBe('after')
  })

  it('returns the restored progress model', async () => {
    mockFindOneAndUpdate.mockResolvedValue(progressDoc)
    const repo = createProgressRepository(mockDb)

    const result = await repo.restore(progressModel)

    expect(result).toEqual(progressModel)
  })

  it('throws if the operation returns no document', async () => {
    mockFindOneAndUpdate.mockResolvedValue(null)
    const repo = createProgressRepository(mockDb)

    await expect(repo.restore(progressModel)).rejects.toThrow(
      'Failed to restore progress for userId: user-123',
    )
  })

  it('throws before writing when updatedAt is not a valid date string', async () => {
    const repo = createProgressRepository(mockDb)
    const invalid = { ...progressModel, updatedAt: 'not-a-date' }

    await expect(repo.restore(invalid)).rejects.toThrow('Invalid updatedAt value: "not-a-date"')
    expect(mockFindOneAndUpdate).not.toHaveBeenCalled()
  })

  it('never writes dirty to MongoDB', async () => {
    mockFindOneAndUpdate.mockResolvedValue(progressDoc)
    const repo = createProgressRepository(mockDb)

    await repo.restore(progressModel)

    const [, updateArg] = mockFindOneAndUpdate.mock.calls[0]!
    expect(updateArg.$set).not.toHaveProperty('dirty')
  })
})
