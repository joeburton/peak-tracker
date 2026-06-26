import { fileURLToPath } from 'node:url'
import { getDb, disconnect } from '../src/lib/db/mongodb'
import { COLLECTIONS } from '../src/lib/db/collections'
import { createIndexes } from '../src/lib/db/indexes'
import { main as seedPeakLists } from './seed-peak-lists'
import { main as seedWainwrights } from './seed-wainwrights'
import { main as seedMunros } from './seed-munros'

const ATLAS_PATTERNS = ['atlas', 'mongodb.net']

export function isAtlasUri(uri: string): boolean {
  return ATLAS_PATTERNS.some((pattern) => uri.includes(pattern))
}

export async function reset(): Promise<void> {
  const uri = process.env.MONGODB_URI ?? ''
  if (isAtlasUri(uri)) {
    throw new Error(
      'reset-db refuses to run against an Atlas URI. Set MONGODB_URI to a local MongoDB instance.',
    )
  }

  const db = await getDb()

  console.log('Dropping collections...')
  for (const name of Object.values(COLLECTIONS)) {
    try {
      await db.collection(name).drop()
      console.log(`  dropped: ${name}`)
    } catch (err) {
      // code 26 = NamespaceNotFound — collection didn't exist yet, safe to skip
      if ((err as { code?: number }).code === 26) {
        console.log(`  skipped (not found): ${name}`)
      } else {
        throw err
      }
    }
  }

  console.log('Re-seeding...')
  await seedPeakLists()
  await Promise.all([seedWainwrights(), seedMunros()])
  await createIndexes()

  console.log('Reset complete.')
}

// Only execute when run directly — not when imported in tests
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let exitCode = 0
  reset()
    .catch((err: unknown) => {
      console.error('Failed to reset database:', err)
      exitCode = 1
    })
    .finally(async () => {
      await disconnect().catch((e: unknown) => console.error('disconnect error:', e))
      process.exit(exitCode)
    })
}
