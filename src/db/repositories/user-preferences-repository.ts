import type { PeakTrackerDb } from '../dexie'
import type { LocalUserPreferences } from '../schema'

export type UserPreferencesUpdate = Partial<Omit<LocalUserPreferences, 'userId'>>

export interface IUserPreferencesRepository {
  get(userId: string): Promise<LocalUserPreferences | undefined>
  upsert(userId: string, prefs: UserPreferencesUpdate): Promise<void>
}

export function createUserPreferencesRepository(db: PeakTrackerDb): IUserPreferencesRepository {
  return {
    async get(userId) {
      return db.userPreferences.get(userId)
    },

    async upsert(userId, prefs) {
      // Merge into any existing record so callers can update individual
      // preferences without knowing the full current state
      await db.transaction('rw', db.userPreferences, async () => {
        const existing = await db.userPreferences.get(userId)
        await db.userPreferences.put({
          units: 'metric', // sensible default for new records
          ...existing,
          ...prefs,
          userId,
        })
      })
    },
  }
}
