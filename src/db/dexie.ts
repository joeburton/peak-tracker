import Dexie, { type EntityTable } from 'dexie'
import type { LocalProgress, LocalSyncMetadata, LocalUserPreferences } from './schema'

export class PeakTrackerDb extends Dexie {
  progress!: EntityTable<LocalProgress, 'userId'>
  userPreferences!: EntityTable<LocalUserPreferences, 'userId'>
  syncMetadata!: EntityTable<LocalSyncMetadata, 'id'>

  constructor() {
    super('peakTracker')

    this.version(1).stores({
      // userId: primary key
      // dirty: indexed — enables efficient sync queries (find all unsynced records)
      progress: 'userId, dirty',
    })

    this.version(2).stores({
      // Non-destructive: only adds the userPreferences table; progress is unchanged
      userPreferences: 'userId',
    })

    this.version(3).stores({
      // Non-destructive: only adds the syncMetadata table; prior tables are unchanged
      syncMetadata: 'id',
    })
  }
}

// Singleton instance for use across the application.
// Repositories accept a PeakTrackerDb parameter for testability.
export const db = new PeakTrackerDb()
