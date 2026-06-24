import { getDb } from '../../src/lib/db/mongodb'
import { COLLECTIONS } from '../../src/lib/db/collections'
import type { Peak } from '../../src/lib/validation/schemas'

export async function seedPeaks(peaks: Peak[], label: string): Promise<void> {
  const db = await getDb()
  const col = db.collection(COLLECTIONS.peaks)
  const now = new Date()

  console.log(`Seeding ${peaks.length} ${label}...`)

  const result = await col.bulkWrite(
    peaks.map((peak) => {
      // Exclude id (derived from _id by the repository), createdAt and updatedAt
      // (handled via $setOnInsert and $set respectively)
      const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = peak
      return {
        updateOne: {
          filter: { slug: peak.slug },
          update: {
            $set: { ...rest, updatedAt: now },
            $setOnInsert: { createdAt: now },
          },
          upsert: true,
        },
      }
    }),
    { ordered: false },
  )

  if (result.hasWriteErrors()) {
    const errs = result.getWriteErrors()
    throw new Error(
      `bulkWrite completed with ${errs.length} write error(s): ${errs.map((e) => e.errmsg).join('; ')}`,
    )
  }

  console.log(`  inserted: ${result.upsertedCount}, updated: ${result.modifiedCount}`)
  console.log(`${label} seeded successfully.`)
}
