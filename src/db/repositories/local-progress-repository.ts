import type { PeakTrackerDb } from '../dexie'
import type { LocalProgress } from '../schema'

export interface LocalProgressData {
  completedPeakIds: string[]
  updatedAt: string
  version: number
}

export interface ILocalProgressRepository {
  get(userId: string): Promise<LocalProgress | undefined>
  upsert(userId: string, data: LocalProgressData): Promise<void>
  markDirty(userId: string): Promise<void>
  markClean(userId: string, lastSyncedAt: string): Promise<void>
}

export function createLocalProgressRepository(db: PeakTrackerDb): ILocalProgressRepository {
  return {
    async get(userId) {
      return db.progress.get(userId)
    },

    async upsert(userId, data) {
      // Preserve dirty and lastSyncedAt from any existing record —
      // upsert updates content fields only; dirty state is managed
      // exclusively by markDirty/markClean
      await db.transaction('rw', db.progress, async () => {
        const existing = await db.progress.get(userId)
        await db.progress.put({
          userId,
          completedPeakIds: data.completedPeakIds,
          updatedAt: data.updatedAt,
          version: data.version,
          dirty: existing?.dirty ?? false,
          lastSyncedAt: existing?.lastSyncedAt,
        })
      })
    },

    async markDirty(userId) {
      const count = await db.progress.update(userId, { dirty: true })
      if (count === 0) throw new Error(`No local progress found for userId: ${userId}`)
    },

    async markClean(userId, lastSyncedAt) {
      const count = await db.progress.update(userId, { dirty: false, lastSyncedAt })
      if (count === 0) throw new Error(`No local progress found for userId: ${userId}`)
    },
  }
}
