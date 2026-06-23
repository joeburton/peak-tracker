import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockDb = vi.fn()
const mockConnect = vi.fn()

vi.mock('mongodb', () => ({
  MongoClient: vi.fn().mockImplementation(() => ({
    connect: mockConnect,
    db: mockDb,
  })),
}))

beforeEach(() => {
  mockConnect.mockReset()
  mockDb.mockReset()
  vi.resetModules()
  global._mongoClientPromise = undefined
})

afterEach(() => {
  delete process.env.MONGODB_URI
})

describe('mongodb singleton', () => {
  it('throws when MONGODB_URI is not defined', async () => {
    delete process.env.MONGODB_URI

    await expect(import('./mongodb')).rejects.toThrow(
      'MONGODB_URI environment variable is not defined'
    )
  })

  it('getDb returns a Db scoped to the peakTracker database', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017'
    const mockDbInstance = { name: 'peakTracker' }
    mockConnect.mockResolvedValue({ db: mockDb })
    mockDb.mockReturnValue(mockDbInstance)

    const { getDb } = await import('./mongodb')
    const db = await getDb()

    expect(mockDb).toHaveBeenCalledWith('peakTracker')
    expect(db).toBe(mockDbInstance)
  })

  it('reuses the same connection across multiple getDb calls', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017'
    mockConnect.mockResolvedValue({ db: mockDb })
    mockDb.mockReturnValue({})

    const { getDb } = await import('./mongodb')
    await getDb()
    await getDb()

    // connect() called once — client promise is reused, not re-created
    expect(mockConnect).toHaveBeenCalledTimes(1)
  })
})
