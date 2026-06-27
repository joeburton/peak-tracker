import type { QueryClient } from '@tanstack/react-query'
import type { ILocalProgressRepository } from '@/db/repositories/local-progress-repository'
import type { SyncActions } from './push'
import { pushProgress } from './push'
import { pullProgress } from './pull'

/**
 * Runs a full sync cycle: push dirty local changes first, then pull
 * the latest server state.
 *
 * pull.ts bails if the local record is still dirty after a failed push,
 * so a push failure naturally stops the pull phase without extra logic.
 */
export async function runSyncCycle(
  userId: string,
  localRepo: ILocalProgressRepository,
  syncActions: SyncActions,
  queryClient: QueryClient,
): Promise<void> {
  const local = await localRepo.get(userId)

  if (local?.dirty) {
    await pushProgress(userId, localRepo, syncActions)
  }

  await pullProgress(userId, localRepo, syncActions, queryClient)
}
