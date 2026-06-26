import type { Collection, Db, ObjectId } from 'mongodb'
import { PeakSchema } from '@/lib/validation/schemas'
import type { Peak } from '@/lib/types/domain'
import { COLLECTIONS } from '@/lib/db/collections'
import { logger } from '@/lib/logger'

interface PeakDocument {
  _id: ObjectId | string
  peakListSlug: string
  slug: string
  name: string
  region: string
  heightMetres: number
  heightFeet: number
  latitude: number
  longitude: number
  createdAt: Date
  updatedAt: Date
}

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

function toModel(doc: PeakDocument): Peak | null {
  const result = PeakSchema.safeParse({
    id: String(doc._id),
    peakListSlug: doc.peakListSlug,
    slug: doc.slug,
    name: doc.name,
    region: doc.region,
    heightMetres: doc.heightMetres,
    heightFeet: doc.heightFeet,
    latitude: doc.latitude,
    longitude: doc.longitude,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  })
  if (!result.success) {
    logger.error('Peak document failed validation — skipping', {
      id: String(doc._id),
      issues: result.error.issues,
    })
    return null
  }
  return result.data
}

export interface IPeakRepository {
  findByListSlug(peakListSlug: string): Promise<Peak[]>
  findBySlug(slug: string): Promise<Peak | null>
  findByRegion(peakListSlug: string, region: string): Promise<Peak[]>
}

export function createPeakRepository(db: Db): IPeakRepository {
  const col: Collection<PeakDocument> = db.collection(COLLECTIONS.peaks)

  return {
    async findByListSlug(peakListSlug: string): Promise<Peak[]> {
      const docs = await col.find({ peakListSlug }, { projection: PROJECTION }).toArray()
      return docs.map(toModel).filter((x): x is Peak => x !== null)
    },

    async findBySlug(slug: string): Promise<Peak | null> {
      const doc = await col.findOne({ slug }, { projection: PROJECTION })
      if (!doc) return null
      const model = toModel(doc)
      if (model === null) {
        throw new Error(
          `Peak document with slug "${slug}" exists but failed validation — check logs for details.`,
        )
      }
      return model
    },

    async findByRegion(peakListSlug: string, region: string): Promise<Peak[]> {
      const docs = await col
        .find({ peakListSlug, region }, { projection: PROJECTION })
        .toArray()
      return docs.map(toModel).filter((x): x is Peak => x !== null)
    },
  }
}
