import { fileURLToPath } from 'node:url'
import { readFile } from 'node:fs/promises'
import { getDb, disconnect } from '../src/lib/db/mongodb'
import { UserProgressSchema } from '../src/lib/validation/schemas'
import { createProgressRepository } from '../src/lib/db/repositories/progress-repository'

export async function importProgress(userId: string, filePath: string): Promise<void> {
  if (!userId) throw new Error('userId argument is required')
  if (!filePath) throw new Error('filePath argument is required')

  const raw = await readFile(filePath, 'utf-8')
  const json = JSON.parse(raw) as unknown

  // Validate file contents — userId from CLI overrides any userId stored in the file,
  // allowing progress to be imported for a different user if needed
  const progress = UserProgressSchema.parse({ ...(json as object), userId })

  const db = await getDb()
  const repo = createProgressRepository(db)
  await repo.restore(progress)

  console.log(`Progress imported for userId: ${userId} (${progress.completedPeakIds.length} peaks)`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const userId = process.argv[2]
  const filePath = process.argv[3]
  if (!userId || !filePath) {
    console.error('Usage: tsx scripts/import-progress.ts <userId> <filePath>')
    process.exit(1)
  }

  let exitCode = 0
  importProgress(userId, filePath)
    .catch((err: unknown) => {
      console.error('Failed to import progress:', err)
      exitCode = 1
    })
    .finally(async () => {
      await disconnect().catch((e: unknown) => console.error('disconnect error:', e))
      process.exit(exitCode)
    })
}
