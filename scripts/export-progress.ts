import { fileURLToPath } from 'node:url'
import { writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { getDb, disconnect } from '../src/lib/db/mongodb'
import { createProgressRepository } from '../src/lib/db/repositories/progress-repository'

export async function exportProgress(userId: string): Promise<string> {
  if (!userId) throw new Error('userId argument is required')

  const db = await getDb()
  const repo = createProgressRepository(db)
  const progress = await repo.findByUserId(userId)

  if (!progress) {
    throw new Error(`No progress record found for userId: ${userId}`)
  }

  const outputPath = join(
    dirname(fileURLToPath(import.meta.url)),
    'data',
    `progress-${userId}.json`,
  )
  await writeFile(outputPath, JSON.stringify(progress, null, 2), 'utf-8')

  return outputPath
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const userId = process.argv[2]
  if (!userId) {
    console.error('Usage: tsx scripts/export-progress.ts <userId>')
    process.exit(1)
  }

  let exitCode = 0
  exportProgress(userId)
    .then((outputPath) => {
      console.log(`Progress exported to: ${outputPath}`)
    })
    .catch((err: unknown) => {
      console.error('Failed to export progress:', err)
      exitCode = 1
    })
    .finally(async () => {
      await disconnect().catch((e: unknown) => console.error('disconnect error:', e))
      process.exit(exitCode)
    })
}
