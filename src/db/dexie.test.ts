// @vitest-environment node
// Each Vitest file runs in its own module context, so fake-indexeddb/auto
// gives this file a fresh IDBFactory independent of other test files.
import 'fake-indexeddb/auto'
import Dexie, { type EntityTable } from 'dexie'
import { describe, it, expect, afterEach } from 'vitest'
import { PeakTrackerDb } from '@/db/dexie'
import type { LocalProgress, LocalUserPreferences } from './schema'

// ── v2 → v3 migration ─────────────────────────────────────────────────────────
//
// Simulates a user who has an existing v2 database (progress + userPreferences)
// upgrading to v3 (which adds syncMetadata). Verifies:
//   1. Existing progress data is preserved
//   2. Existing userPreferences data is preserved
//   3. The new syncMetadata table is present and empty

describe('v2 → v3 migration', () => {
  // Inline v2 schema — mirrors the state of dexie.ts before this ticket
  class PeakTrackerDbV2 extends Dexie {
    progress!: EntityTable<LocalProgress, 'userId'>
    userPreferences!: EntityTable<LocalUserPreferences, 'userId'>

    constructor() {
      super('peakTracker')
      this.version(1).stores({ progress: 'userId, dirty' })
      this.version(2).stores({ userPreferences: 'userId' })
    }
  }

  let v3db: PeakTrackerDb | null = null

  afterEach(async () => {
    await v3db?.delete()
    v3db = null
  })

  it('preserves progress and userPreferences data when upgrading from v2 to v3', async () => {
    // 1. Populate a v2 database
    const v2db = new PeakTrackerDbV2()
    await v2db.open()
    await v2db.progress.put({
      userId: 'user-migrate',
      completedPeakIds: ['peak-1', 'peak-2'],
      updatedAt: '2024-01-01T00:00:00.000Z',
      dirty: false,
      version: 3,
    })
    await v2db.userPreferences.put({ userId: 'user-migrate', units: 'imperial' })
    await v2db.close()

    // 2. Open the same database at v3 — Dexie runs the migration automatically
    v3db = new PeakTrackerDb()
    await v3db.open()

    // 3. Verify existing progress data is intact
    const progress = await v3db.progress.get('user-migrate')
    expect(progress?.completedPeakIds).toEqual(['peak-1', 'peak-2'])
    expect(progress?.version).toBe(3)
    expect(progress?.dirty).toBe(false)

    // 4. Verify existing userPreferences data is intact
    const prefs = await v3db.userPreferences.get('user-migrate')
    expect(prefs?.units).toBe('imperial')

    // 5. Verify the new syncMetadata table exists and starts empty
    expect(await v3db.syncMetadata.count()).toBe(0)
  })
})
