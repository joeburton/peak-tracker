// @vitest-environment node
import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { PeakTrackerDb } from '@/db/dexie'
import {
  createUserPreferencesRepository,
  type IUserPreferencesRepository,
} from './user-preferences-repository'

let db: PeakTrackerDb
let repo: IUserPreferencesRepository

beforeEach(async () => {
  db = new PeakTrackerDb()
  await db.open()
  repo = createUserPreferencesRepository(db)
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
    await repo.upsert('user-123', { units: 'imperial' })
    const result = await repo.get('user-123')
    expect(result?.userId).toBe('user-123')
    expect(result?.units).toBe('imperial')
  })
})

// ── upsert() ──────────────────────────────────────────────────────────────────

describe('upsert()', () => {
  it('creates a new record with metric as the default unit', async () => {
    await repo.upsert('user-123', {})
    expect((await repo.get('user-123'))?.units).toBe('metric')
  })

  it('stores an explicitly provided unit value', async () => {
    await repo.upsert('user-123', { units: 'imperial' })
    expect((await repo.get('user-123'))?.units).toBe('imperial')
  })

  it('merges — updates only the specified field, preserving others', async () => {
    await repo.upsert('user-123', { units: 'imperial' })
    // Partial update: no units field — existing value must survive
    await repo.upsert('user-123', {})
    expect((await repo.get('user-123'))?.units).toBe('imperial')
  })

  it('overwrites an existing value when the field is provided', async () => {
    await repo.upsert('user-123', { units: 'imperial' })
    await repo.upsert('user-123', { units: 'metric' })
    expect((await repo.get('user-123'))?.units).toBe('metric')
  })

  it('is idempotent — calling twice with same data leaves the record unchanged', async () => {
    await repo.upsert('user-123', { units: 'imperial' })
    await repo.upsert('user-123', { units: 'imperial' })
    expect((await repo.get('user-123'))?.units).toBe('imperial')
  })

  it('stores records for different users independently', async () => {
    await repo.upsert('user-aaa', { units: 'metric' })
    await repo.upsert('user-bbb', { units: 'imperial' })
    expect((await repo.get('user-aaa'))?.units).toBe('metric')
    expect((await repo.get('user-bbb'))?.units).toBe('imperial')
  })
})
