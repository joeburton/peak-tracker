// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { COLLECTIONS } from '../src/lib/db/collections'

// ── MongoDB module mock ───────────────────────────────────────────────────────

const drop = vi.fn()
const mockCollection = vi.fn().mockReturnValue({ drop })
const mockDb = { collection: mockCollection }

vi.mock('../src/lib/db/mongodb', () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
  disconnect: vi.fn().mockResolvedValue(undefined),
}))

// ── Seed script mocks ─────────────────────────────────────────────────────────

const seedPeakListsMain = vi.fn().mockResolvedValue(undefined)
const seedWainwrightsMain = vi.fn().mockResolvedValue(undefined)
const seedMunrosMain = vi.fn().mockResolvedValue(undefined)
const createIndexesMock = vi.fn().mockResolvedValue(undefined)

vi.mock('./seed-peak-lists', () => ({ main: seedPeakListsMain }))
vi.mock('./seed-wainwrights', () => ({ main: seedWainwrightsMain }))
vi.mock('./seed-munros', () => ({ main: seedMunrosMain }))
vi.mock('../src/lib/db/indexes', () => ({ createIndexes: createIndexesMock }))

const { reset, isAtlasUri } = await import('./reset-db')

// ── Helpers ───────────────────────────────────────────────────────────────────

const LOCAL_URI = 'mongodb://localhost:27017/peakTracker'
const ATLAS_URI = 'mongodb+srv://user:pass@cluster.mongodb.net/peakTracker'

// ── isAtlasUri ────────────────────────────────────────────────────────────────

describe('isAtlasUri()', () => {
  it('returns false for a local URI', () => {
    expect(isAtlasUri(LOCAL_URI)).toBe(false)
  })

  it('returns true when URI contains "mongodb.net"', () => {
    expect(isAtlasUri(ATLAS_URI)).toBe(true)
  })

  it('returns true when URI contains "atlas"', () => {
    expect(isAtlasUri('mongodb+srv://user:pass@atlas.example.com/db')).toBe(true)
  })

  it('returns false for an empty string', () => {
    expect(isAtlasUri('')).toBe(false)
  })
})

// ── reset() ───────────────────────────────────────────────────────────────────

describe('reset()', () => {
  const originalUri = process.env.MONGODB_URI

  beforeEach(() => {
    process.env.MONGODB_URI = LOCAL_URI
    drop.mockReset()
    mockCollection.mockClear()
    seedPeakListsMain.mockClear()
    seedWainwrightsMain.mockClear()
    seedMunrosMain.mockClear()
    createIndexesMock.mockClear()
    drop.mockResolvedValue(true)
  })

  afterEach(() => {
    process.env.MONGODB_URI = originalUri
  })

  it('throws and does not call getDb when MONGODB_URI points to Atlas', async () => {
    const { getDb } = await import('../src/lib/db/mongodb')
    const getDbMock = vi.mocked(getDb)
    getDbMock.mockClear()

    process.env.MONGODB_URI = ATLAS_URI
    await expect(reset()).rejects.toThrow('refuses to run against an Atlas URI')
    expect(getDbMock).not.toHaveBeenCalled()
  })

  it('drops all three collections', async () => {
    await reset()
    expect(mockCollection).toHaveBeenCalledWith(COLLECTIONS.peakLists)
    expect(mockCollection).toHaveBeenCalledWith(COLLECTIONS.peaks)
    expect(mockCollection).toHaveBeenCalledWith(COLLECTIONS.progress)
  })

  it('calls all three seed scripts and createIndexes', async () => {
    await reset()
    expect(seedPeakListsMain).toHaveBeenCalledTimes(1)
    expect(seedWainwrightsMain).toHaveBeenCalledTimes(1)
    expect(seedMunrosMain).toHaveBeenCalledTimes(1)
    expect(createIndexesMock).toHaveBeenCalledTimes(1)
    // Peak lists must be seeded before peaks (foreign key: peakListSlug)
    const peakListsOrder = seedPeakListsMain.mock.invocationCallOrder[0]!
    const wainwrightsOrder = seedWainwrightsMain.mock.invocationCallOrder[0]!
    const munrosOrder = seedMunrosMain.mock.invocationCallOrder[0]!
    expect(peakListsOrder).toBeLessThan(wainwrightsOrder)
    expect(peakListsOrder).toBeLessThan(munrosOrder)
  })

  it('recreates indexes after dropping collections', async () => {
    await reset()
    // createIndexes must run after seeding, not before
    const seedOrder = seedWainwrightsMain.mock.invocationCallOrder[0]!
    const indexOrder = createIndexesMock.mock.invocationCallOrder[0]!
    expect(indexOrder).toBeGreaterThan(seedOrder)
  })

  it('skips drop gracefully when a collection does not exist (code 26)', async () => {
    drop.mockRejectedValueOnce(Object.assign(new Error('ns not found'), { code: 26 }))
    await expect(reset()).resolves.toBeUndefined()
  })

  it('rethrows drop errors that are not NamespaceNotFound', async () => {
    drop.mockRejectedValueOnce(Object.assign(new Error('auth failed'), { code: 13 }))
    await expect(reset()).rejects.toThrow('auth failed')
  })

  it('resolves without throwing on a clean local database', async () => {
    await expect(reset()).resolves.toBeUndefined()
  })
})
