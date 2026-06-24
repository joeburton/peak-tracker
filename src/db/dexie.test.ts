// @vitest-environment node
// Each Vitest file runs in its own module context, so fake-indexeddb/auto
// gives this file a fresh IDBFactory independent of other test files.
import 'fake-indexeddb/auto'
import Dexie, { type EntityTable } from 'dexie'
import { describe, it, expect, afterEach } from 'vitest'
import { PeakTrackerDb } from '@/db/dexie'
import type { LocalProgress, LocalUserPreferences } from './schema'

// ── Inline legacy schema classes ───────────────────────────────────────────────
// These mirror the state of dexie.ts at each prior version and are used to
// populate databases at an older version before upgrading to the current one.

class PeakTrackerDbV1 extends Dexie {
  progress!: EntityTable<LocalProgress, 'userId'>

  constructor() {
    super('peakTracker')
    this.version(1).stores({ progress: 'userId, dirty' })
  }
}

class PeakTrackerDbV2 extends Dexie {
  progress!: EntityTable<LocalProgress, 'userId'>
  userPreferences!: EntityTable<LocalUserPreferences, 'userId'>

  constructor() {
    super('peakTracker')
    this.version(1).stores({ progress: 'userId, dirty' })
    this.version(2).stores({ userPreferences: 'userId' })
  }
}

// ── Shared fixtures ─────────────────────────────────────────────────────────────

const PROGRESS_RECORD: LocalProgress = {
  userId: 'user-migrate',
  completedPeakIds: ['peak-1', 'peak-2'],
  updatedAt: '2024-01-01T00:00:00.000Z',
  dirty: false,
  version: 2,
}

// ── v1 → v2 migration ─────────────────────────────────────────────────────────

describe('v1 → v2 migration', () => {
  let v2db: PeakTrackerDbV2 | null = null

  afterEach(async () => {
    await v2db?.delete()
    v2db = null
  })

  it('preserves progress data when upgrading from v1 to v2', async () => {
    // Populate at v1
    const v1db = new PeakTrackerDbV1()
    await v1db.open()
    await v1db.progress.put(PROGRESS_RECORD)
    await v1db.close()

    // Upgrade to v2
    v2db = new PeakTrackerDbV2()
    await v2db.open()

    const progress = await v2db.progress.get('user-migrate')
    expect(progress?.completedPeakIds).toEqual(['peak-1', 'peak-2'])
    expect(progress?.version).toBe(2)

    // New table exists and starts empty
    expect(await v2db.userPreferences.count()).toBe(0)
  })
})

// ── v2 → v3 migration ─────────────────────────────────────────────────────────

describe('v2 → v3 migration', () => {
  let v3db: PeakTrackerDb | null = null

  afterEach(async () => {
    await v3db?.delete()
    v3db = null
  })

  it('preserves progress and userPreferences data when upgrading from v2 to v3', async () => {
    // Populate at v2
    const v2db = new PeakTrackerDbV2()
    await v2db.open()
    await v2db.progress.put(PROGRESS_RECORD)
    await v2db.userPreferences.put({ userId: 'user-migrate', units: 'imperial' })
    await v2db.close()

    // Upgrade to v3
    v3db = new PeakTrackerDb()
    await v3db.open()

    const progress = await v3db.progress.get('user-migrate')
    expect(progress?.completedPeakIds).toEqual(['peak-1', 'peak-2'])

    const prefs = await v3db.userPreferences.get('user-migrate')
    expect(prefs?.units).toBe('imperial')

    // New table exists and starts empty
    expect(await v3db.syncMetadata.count()).toBe(0)
  })
})

// ── v1 → v3 (version jump) ────────────────────────────────────────────────────
// A user who has never updated will jump straight from v1 to v3. Dexie runs
// all intermediate upgrade() functions in sequence automatically.

describe('v1 → v3 version jump', () => {
  let v3db: PeakTrackerDb | null = null

  afterEach(async () => {
    await v3db?.delete()
    v3db = null
  })

  it('preserves progress data when jumping from v1 directly to v3', async () => {
    // Populate at v1
    const v1db = new PeakTrackerDbV1()
    await v1db.open()
    await v1db.progress.put(PROGRESS_RECORD)
    await v1db.close()

    // Upgrade directly to v3 — Dexie applies v1→v2 then v2→v3 automatically
    v3db = new PeakTrackerDb()
    await v3db.open()

    const progress = await v3db.progress.get('user-migrate')
    expect(progress?.completedPeakIds).toEqual(['peak-1', 'peak-2'])
    expect(progress?.dirty).toBe(false)

    // Both new tables exist and start empty
    expect(await v3db.userPreferences.count()).toBe(0)
    expect(await v3db.syncMetadata.count()).toBe(0)
  })
})
