import { getDb } from '@/lib/db/mongodb';
import { createProgressRepository } from '@/lib/db/repositories/progress-repository';

/**
 * Returns the server-persisted completed peak IDs for a given user.
 * Returns an empty array for unauthenticated users (userId = null).
 * Not cached — progress is user-specific and changes on every sync.
 */
export async function getProgress(userId: string | null): Promise<string[]> {
  if (!userId) return [];
  const db = await getDb();
  const repo = createProgressRepository(db);
  const progress = await repo.findByUserId(userId);
  return progress?.completedPeakIds ?? [];
}
