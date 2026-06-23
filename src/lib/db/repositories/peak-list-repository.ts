import type { Collection, Db } from 'mongodb'
import type { PeakList } from '@/lib/types/domain'

type PeakListDoc = Omit<PeakList, 'id'> & { _id: unknown }

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
  const col: Collection<PeakListDoc> = db.collection('peakLists')

  return {
    async findAll(): Promise<PeakList[]> {
      const docs = await col.find({}).toArray()
      return docs.map(toModel)
    },

    async findBySlug(slug: string): Promise<PeakList | null> {
      const doc = await col.findOne({ slug })
      return doc ? toModel(doc) : null
    },
  }
}
