// @vitest-environment node
import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { PeakTrackerDb } from '@/db/dexie'
import {
  createSyncMetadataRepository,
  type ISyncMetadataRepository,
} from './sync-metadata-repository'

let db: PeakTrackerDb
let repo: ISyncMetadataRepository

beforeEach(async () => {
  db = new PeakTrackerDb()
  await db.open()
  repo = createSyncMetadataRepository(db)
})

afterEach(async () => {
  await db.delete()
})

// ── get() ──────────────────────────────────────────────────────────────────────

describe('get()', () => {
  it('returns undefined before any sync has occurred', async () => {
    expect(await repo.get()).toBeUndefined()
  })

  it('returns the record after setLastSynced is called', async () => {
    await repo.setLastSynced('2024-06-01T12:00:00.000Z')
    const result = await repo.get()
    expect(result?.id).toBe('singleton')
    expect(result?.lastSyncedAt).toBe('2024-06-01T12:00:00.000Z')
  })
})

// ── setLastSynced() ────────────────────────────────────────────────────────────

describe('setLastSynced()', () => {
  it('creates the singleton record on first call', async () => {
    await repo.setLastSynced('2024-06-01T12:00:00.000Z')
    expect(await db.syncMetadata.count()).toBe(1)
  })

  it('stores the provided timestamp as lastSyncedAt', async () => {
    await repo.setLastSynced('2024-06-01T12:00:00.000Z')
    expect((await repo.get())?.lastSyncedAt).toBe('2024-06-01T12:00:00.000Z')
  })

  it('overwrites the previous timestamp on subsequent calls', async () => {
    await repo.setLastSynced('2024-06-01T12:00:00.000Z')
    await repo.setLastSynced('2024-06-02T08:00:00.000Z')
    expect((await repo.get())?.lastSyncedAt).toBe('2024-06-02T08:00:00.000Z')
  })

  it('still results in exactly one record after multiple calls', async () => {
    await repo.setLastSynced('2024-06-01T12:00:00.000Z')
    await repo.setLastSynced('2024-06-02T08:00:00.000Z')
    expect(await db.syncMetadata.count()).toBe(1)
  })

  it('sets updatedAt to the current time', async () => {
    const before = Date.now()
    await repo.setLastSynced('2024-06-01T12:00:00.000Z')
    const after = Date.now()
    const updatedAt = new Date((await repo.get())!.updatedAt).getTime()
    expect(updatedAt).toBeGreaterThanOrEqual(before)
    expect(updatedAt).toBeLessThanOrEqual(after)
  })
})
