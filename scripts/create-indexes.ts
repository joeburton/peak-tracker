import { createIndexes } from '../src/lib/db/indexes'
import { disconnect } from '../src/lib/db/mongodb'

async function main(): Promise<void> {
  console.log('Creating MongoDB indexes...')
  await createIndexes()
  console.log('Indexes created successfully.')
}

let exitCode = 0

main()
  .catch((err: unknown) => {
    console.error('Failed to create indexes:', err)
    exitCode = 1
  })
  .finally(async () => {
    await disconnect().catch((e: unknown) => console.error('disconnect error:', e))
    process.exit(exitCode)
  })
