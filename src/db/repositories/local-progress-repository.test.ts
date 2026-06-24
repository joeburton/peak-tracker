// @vitest-environment node
// fake-indexeddb/auto sets up global.indexedDB before any Dexie instance is created
import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { PeakTrackerDb } from '@/db/dexie'
import {
  createLocalProgressRepository,
  type ILocalProgressRepository,
  type LocalProgressData,
} from './local-progress-repository'

let db: PeakTrackerDb
let repo: ILocalProgressRepository

const DATA: LocalProgressData = {
  completedPeakIds: ['peak-1', 'peak-2'],
  updatedAt: '2024-06-01T12:00:00.000Z',
  version: 1,
}

beforeEach(async () => {
  db = new PeakTrackerDb()
  await db.open()
  repo = createLocalProgressRepository(db)
})

afterEach(async () => {
  await db.delete()
})

// ── get() ──────────────────────────────────────────────────────────────────────

describe('get()', () => {
  it('returns undefined when no record exists', async () => {
    expect(await repo.get('user-123')).toBeUndefined()
  })

  it('returns the stored record', async () => {
    await repo.upsert('user-123', DATA)
    const result = await repo.get('user-123')
    expect(result?.userId).toBe('user-123')
    expect(result?.completedPeakIds).toEqual(DATA.completedPeakIds)
    expect(result?.version).toBe(DATA.version)
  })
})

// ── upsert() ──────────────────────────────────────────────────────────────────

describe('upsert()', () => {
  it('creates a new record with dirty: false when none exists', async () => {
    await repo.upsert('user-123', DATA)
    const result = await repo.get('user-123')
    expect(result?.dirty).toBe(false)
  })

  it('stores all provided fields', async () => {
    await repo.upsert('user-123', DATA)
    const result = await repo.get('user-123')
    expect(result?.completedPeakIds).toEqual(DATA.completedPeakIds)
    expect(result?.updatedAt).toBe(DATA.updatedAt)
    expect(result?.version).toBe(DATA.version)
  })

  it('preserves dirty: true when updating an existing dirty record', async () => {
    await repo.upsert('user-123', DATA)
    await repo.markDirty('user-123')

    const updated: LocalProgressData = { ...DATA, completedPeakIds: ['peak-1', 'peak-2', 'peak-3'] }
    await repo.upsert('user-123', updated)

    const result = await repo.get('user-123')
    expect(result?.dirty).toBe(true)
    expect(result?.completedPeakIds).toHaveLength(3)
  })

  it('preserves lastSyncedAt when updating an existing record', async () => {
    await repo.upsert('user-123', DATA)
    await repo.markClean('user-123', '2024-06-01T12:00:00.000Z')

    await repo.upsert('user-123', { ...DATA, version: 2 })

    const result = await repo.get('user-123')
    expect(result?.lastSyncedAt).toBe('2024-06-01T12:00:00.000Z')
  })

  it('is idempotent — second call with same data leaves the record unchanged', async () => {
    await repo.upsert('user-123', DATA)
    await repo.upsert('user-123', DATA)
    const result = await repo.get('user-123')
    expect(result?.version).toBe(DATA.version)
  })
})

// ── markDirty() ───────────────────────────────────────────────────────────────

describe('markDirty()', () => {
  it('sets dirty: true on an existing record', async () => {
    await repo.upsert('user-123', DATA)
    await repo.markDirty('user-123')
    expect((await repo.get('user-123'))?.dirty).toBe(true)
  })

  it('throws when the record does not exist', async () => {
    await expect(repo.markDirty('nonexistent')).rejects.toThrow(
      'No local progress found for userId: nonexistent',
    )
  })

  it('is idempotent — calling twice leaves dirty: true', async () => {
    await repo.upsert('user-123', DATA)
    await repo.markDirty('user-123')
    await repo.markDirty('user-123')
    expect((await repo.get('user-123'))?.dirty).toBe(true)
  })
})

// ── markClean() ───────────────────────────────────────────────────────────────

describe('markClean()', () => {
  it('sets dirty: false and updates lastSyncedAt', async () => {
    await repo.upsert('user-123', DATA)
    await repo.markDirty('user-123')
    await repo.markClean('user-123', '2024-06-02T08:00:00.000Z')

    const result = await repo.get('user-123')
    expect(result?.dirty).toBe(false)
    expect(result?.lastSyncedAt).toBe('2024-06-02T08:00:00.000Z')
  })

  it('throws when the record does not exist', async () => {
    await expect(repo.markClean('nonexistent', '2024-06-01T00:00:00.000Z')).rejects.toThrow(
      'No local progress found for userId: nonexistent',
    )
  })

  it('updates lastSyncedAt on a subsequent clean', async () => {
    await repo.upsert('user-123', DATA)
    await repo.markClean('user-123', '2024-06-01T12:00:00.000Z')
    await repo.markClean('user-123', '2024-06-02T12:00:00.000Z')

    expect((await repo.get('user-123'))?.lastSyncedAt).toBe('2024-06-02T12:00:00.000Z')
  })
})
