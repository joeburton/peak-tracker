import { fileURLToPath } from 'node:url'
import { disconnect } from '../src/lib/db/mongodb'
import { PeakSchema } from '../src/lib/validation/schemas'
import { seedPeaks } from './lib/seed-peaks'
import rawData from './data/munros.json'

// Validate the imported JSON against PeakSchema at load time
export const PEAKS = rawData.map((record) => PeakSchema.parse(record))

export async function main(): Promise<void> {
  await seedPeaks(PEAKS, 'Munros')
}

// Only execute when run directly — not when imported in tests
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let exitCode = 0
  main()
    .catch((err: unknown) => {
      console.error('Failed to seed Munros:', err)
      exitCode = 1
    })
    .finally(async () => {
      await disconnect().catch((e: unknown) => console.error('disconnect error:', e))
      process.exit(exitCode)
    })
}
