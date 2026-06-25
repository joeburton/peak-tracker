import type { Collection, Db, ObjectId } from 'mongodb'
import { PeakListSchema } from '@/lib/validation/schemas'
import type { PeakList } from '@/lib/types/domain'
import { COLLECTIONS } from '@/lib/db/collections'
import { logger } from '@/lib/logger'

interface PeakListDocument {
  _id: ObjectId | string
  slug: string
  name: string
  description?: string
  peakCount: number
  createdAt: Date
  updatedAt: Date
}

const PROJECTION = { _id: 1, slug: 1, name: 1, description: 1, peakCount: 1 } as const

function toModel(doc: PeakListDocument): PeakList | null {
  const result = PeakListSchema.safeParse({
    id: String(doc._id),
    slug: doc.slug,
    name: doc.name,
    description: doc.description,
    peakCount: doc.peakCount,
  })
  if (!result.success) {
    logger.error('PeakList document failed validation — skipping', {
      id: String(doc._id),
      issues: result.error.issues,
    })
    return null
  }
  return result.data
}

export interface IPeakListRepository {
  findAll(): Promise<PeakList[]>
  findBySlug(slug: string): Promise<PeakList | null>
}

export function createPeakListRepository(db: Db): IPeakListRepository {
  const col: Collection<PeakListDocument> = db.collection(COLLECTIONS.peakLists)

  return {
    async findAll(): Promise<PeakList[]> {
      const docs = await col.find({}, { projection: PROJECTION }).toArray()
      return docs.map(toModel).filter((x): x is PeakList => x !== null)
    },

    async findBySlug(slug: string): Promise<PeakList | null> {
      const doc = await col.findOne({ slug }, { projection: PROJECTION })
      return doc ? toModel(doc) : null
    },
  }
}
