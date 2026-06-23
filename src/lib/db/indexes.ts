import { getDb } from '@/lib/db/mongodb'
import { COLLECTIONS } from '@/lib/db/collections'

export async function createIndexes(): Promise<void> {
  const db = await getDb()

  await db.collection(COLLECTIONS.peakLists).createIndexes([
    { key: { slug: 1 }, name: 'peakLists_slug_unique', unique: true },
  ])

  await db.collection(COLLECTIONS.peaks).createIndexes([
    { key: { slug: 1 }, name: 'peaks_slug_unique', unique: true },
    { key: { peakListSlug: 1 }, name: 'peaks_peakListSlug' },
    { key: { region: 1 }, name: 'peaks_region' },
    { key: { heightMetres: 1 }, name: 'peaks_heightMetres' },
  ])

  await db.collection(COLLECTIONS.progress).createIndexes([
    { key: { userId: 1 }, name: 'progress_userId_unique', unique: true },
  ])
}
