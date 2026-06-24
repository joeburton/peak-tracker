import Dexie, { type EntityTable } from 'dexie'
import type { LocalProgress, LocalUserPreferences } from './schema'

export class PeakTrackerDb extends Dexie {
  progress!: EntityTable<LocalProgress, 'userId'>
  userPreferences!: EntityTable<LocalUserPreferences, 'userId'>

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
  }
}

// Singleton instance for use across the application.
// Repositories accept a PeakTrackerDb parameter for testability.
export const db = new PeakTrackerDb()
