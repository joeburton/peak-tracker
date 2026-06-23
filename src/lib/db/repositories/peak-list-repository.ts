import type { Collection, Db, ObjectId } from 'mongodb'
import type { PeakList } from '@/lib/types/domain'
import { COLLECTIONS } from '@/lib/db/collections'

type PeakListDoc = Omit<PeakList, 'id'> & { _id: ObjectId | string }

const PROJECTION = { _id: 1, slug: 1, name: 1, description: 1, peakCount: 1 } as const

function toModel(doc: PeakListDoc): PeakList {
  return {
    id: String(doc._id),
    slug: doc.slug,
    name: doc.name,
    description: doc.description,
    peakCount: doc.peakCount,
  }
}

export interface IPeakListRepository {
  findAll(): Promise<PeakList[]>
  findBySlug(slug: string): Promise<PeakList | null>
}

export function createPeakListRepository(db: Db): IPeakListRepository {
  const col: Collection<PeakListDoc> = db.collection(COLLECTIONS.peakLists)

  return {
    async findAll(): Promise<PeakList[]> {
      const docs = await col.find({}, { projection: PROJECTION }).toArray()
      return docs.map(toModel)
    },

    async findBySlug(slug: string): Promise<PeakList | null> {
      const doc = await col.findOne({ slug }, { projection: PROJECTION })
      return doc ? toModel(doc) : null
    },
  }
}
