import type { Collection, Db, ObjectId } from 'mongodb'
import type { Peak } from '@/lib/types/domain'
import { COLLECTIONS } from '@/lib/db/collections'

type PeakDoc = Omit<Peak, 'id'> & { _id: ObjectId | string }

const PROJECTION = {
  _id: 1,
  peakListSlug: 1,
  slug: 1,
  name: 1,
  region: 1,
  heightMetres: 1,
  heightFeet: 1,
  latitude: 1,
  longitude: 1,
  createdAt: 1,
  updatedAt: 1,
} as const

function toModel(doc: PeakDoc): Peak {
  return {
    id: String(doc._id),
    peakListSlug: doc.peakListSlug,
    slug: doc.slug,
    name: doc.name,
    region: doc.region,
    heightMetres: doc.heightMetres,
    heightFeet: doc.heightFeet,
    latitude: doc.latitude,
    longitude: doc.longitude,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

export interface IPeakRepository {
  findByListSlug(peakListSlug: string): Promise<Peak[]>
  findBySlug(slug: string): Promise<Peak | null>
  findByRegion(peakListSlug: string, region: string): Promise<Peak[]>
}

export function createPeakRepository(db: Db): IPeakRepository {
  const col: Collection<PeakDoc> = db.collection(COLLECTIONS.peaks)

  return {
    async findByListSlug(peakListSlug: string): Promise<Peak[]> {
      const docs = await col.find({ peakListSlug }, { projection: PROJECTION }).toArray()
      return docs.map(toModel)
    },

    async findBySlug(slug: string): Promise<Peak | null> {
      const doc = await col.findOne({ slug }, { projection: PROJECTION })
      return doc ? toModel(doc) : null
    },

    async findByRegion(peakListSlug: string, region: string): Promise<Peak[]> {
      const docs = await col
        .find({ peakListSlug, region }, { projection: PROJECTION })
        .toArray()
      return docs.map(toModel)
    },
  }
}
