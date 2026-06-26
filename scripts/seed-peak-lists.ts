import { fileURLToPath } from 'node:url'
import { getDb, disconnect } from '../src/lib/db/mongodb'
import { COLLECTIONS } from '../src/lib/db/collections'
import { PeakListSchema } from '../src/lib/validation/schemas'

interface SeedPeakList {
  slug: string
  name: string
  description: string
  peakCount: number
}

export const PEAK_LISTS: SeedPeakList[] = [
  {
    slug: 'wainwrights',
    name: 'Wainwrights',
    description:
      "Alfred Wainwright's 214 hand-picked fells in the English Lake District, as described in his Pictorial Guides (1955–1966).",
    peakCount: 214,
  },
  {
    slug: 'munros',
    name: 'Munros',
    description:
      'The 282 Scottish mountains over 3,000 feet (914.4m), as defined by the Scottish Mountaineering Club and first listed by Sir Hugh Munro in 1891.',
    peakCount: 282,
  },
]

export async function main(): Promise<void> {
  // Validate all records before opening a connection — prevents partial writes
  for (const list of PEAK_LISTS) {
    PeakListSchema.parse({ id: list.slug, ...list })
  }

  const db = await getDb()
  const col = db.collection(COLLECTIONS.peakLists)
  const now = new Date()

  console.log(`Seeding ${PEAK_LISTS.length} peak lists...`)

  for (const list of PEAK_LISTS) {
    const result = await col.updateOne(
      { slug: list.slug },
      {
        $set: {
          name: list.name,
          description: list.description,
          peakCount: list.peakCount,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    )

    const action = result.upsertedCount > 0 ? 'inserted' : 'updated'
    console.log(`  ${action}: ${list.name} (${list.peakCount} peaks)`)
  }

  console.log('Peak lists seeded successfully.')
}

// Only execute when run directly — not when imported in tests
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let exitCode = 0
  main()
    .catch((err: unknown) => {
      console.error('Failed to seed peak lists:', err)
      exitCode = 1
    })
    .finally(async () => {
      await disconnect().catch((e: unknown) => console.error('disconnect error:', e))
      process.exit(exitCode)
    })
}
