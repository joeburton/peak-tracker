import { createIndexes } from '../src/lib/db/indexes'
import { disconnect } from '../src/lib/db/mongodb'

async function main(): Promise<void> {
  console.log('Creating MongoDB indexes...')
  await createIndexes()
  console.log('Indexes created successfully.')
}

main()
  .catch((err: unknown) => {
    console.error('Failed to create indexes:', err)
    process.exit(1)
  })
  .finally(() => {
    disconnect().catch(() => {})
  })
