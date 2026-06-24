import { fileURLToPath } from 'node:url'
import { getDb, disconnect } from '../src/lib/db/mongodb'
import { COLLECTIONS } from '../src/lib/db/collections'
import { PeakSchema } from '../src/lib/validation/schemas'
import rawData from './data/wainwrights.json'

// Validate the imported JSON against PeakSchema at load time
export const PEAKS = rawData.map((record) => PeakSchema.parse(record))

export async function main(): Promise<void> {
  const db = await getDb()
  const col = db.collection(COLLECTIONS.peaks)
  const now = new Date()

  console.log(`Seeding ${PEAKS.length} Wainwrights...`)

  const result = await col.bulkWrite(
    PEAKS.map((peak) => {
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

  console.log(
    `  inserted: ${result.upsertedCount}, updated: ${result.modifiedCount}`,
  )
  console.log('Wainwrights seeded successfully.')
}

// Only execute when run directly — not when imported in tests
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let exitCode = 0
  main()
    .catch((err: unknown) => {
      console.error('Failed to seed Wainwrights:', err)
      exitCode = 1
    })
    .finally(async () => {
      await disconnect().catch((e: unknown) => console.error('disconnect error:', e))
      process.exit(exitCode)
    })
}
