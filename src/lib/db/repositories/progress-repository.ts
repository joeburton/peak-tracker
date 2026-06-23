import type { Collection, Db, ObjectId } from 'mongodb'
import type { UserProgress } from '@/lib/types/domain'
import { COLLECTIONS } from '@/lib/db/collections'

interface ProgressDocument {
  _id: ObjectId | string
  userId: string
  completedPeakIds: string[]
  updatedAt: Date
  version: number
  // dirty is intentionally absent — it is a client-only Dexie concern
  // and must never be stored in MongoDB (CLAUDE.md Known Assumptions §2)
}

export interface ProgressUpdate {
  completedPeakIds: string[]
  updatedAt: string
}

// _id excluded — userId is the public identifier for progress records
const PROJECTION = {
  _id: 0,
  userId: 1,
  completedPeakIds: 1,
  updatedAt: 1,
  version: 1,
} as const

function toModel(doc: ProgressDocument): UserProgress {
  return {
    userId: doc.userId,
    completedPeakIds: doc.completedPeakIds,
    updatedAt: doc.updatedAt.toISOString(),
    dirty: false, // server data is always clean — dirty lives in Dexie only
    version: doc.version,
  }
}

export interface IProgressRepository {
  findByUserId(userId: string): Promise<UserProgress | null>
  upsert(userId: string, data: ProgressUpdate): Promise<UserProgress>
}

export function createProgressRepository(db: Db): IProgressRepository {
  const col: Collection<ProgressDocument> = db.collection(COLLECTIONS.progress)

  return {
    async findByUserId(userId: string): Promise<UserProgress | null> {
      const doc = await col.findOne({ userId }, { projection: PROJECTION })
      return doc ? toModel(doc) : null
    },

    async upsert(userId: string, data: ProgressUpdate): Promise<UserProgress> {
      const doc = await col.findOneAndUpdate(
        { userId },
        {
          $set: {
            completedPeakIds: data.completedPeakIds,
            updatedAt: new Date(data.updatedAt),
          },
          $inc: { version: 1 },
        },
        { upsert: true, returnDocument: 'after', projection: PROJECTION },
      )
      if (!doc) throw new Error(`Failed to upsert progress for userId: ${userId}`)
      return toModel(doc)
    },
  }
}
