import type { PeakTrackerDb } from '../dexie'
import type { LocalSyncMetadata } from '../schema'

const SINGLETON_KEY = 'singleton' as const

export interface ISyncMetadataRepository {
  get(): Promise<LocalSyncMetadata | undefined>
  setLastSynced(timestamp: string): Promise<void>
}

export function createSyncMetadataRepository(db: PeakTrackerDb): ISyncMetadataRepository {
  return {
    async get() {
      return db.syncMetadata.get(SINGLETON_KEY)
    },

    async setLastSynced(timestamp) {
      await db.syncMetadata.put({
        id: SINGLETON_KEY,
        lastSyncedAt: timestamp,
        updatedAt: new Date().toISOString(),
      })
    },
  }
}
