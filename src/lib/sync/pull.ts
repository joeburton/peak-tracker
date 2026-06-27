import type { QueryClient } from '@tanstack/react-query'
import type { ILocalProgressRepository } from '@/db/repositories/local-progress-repository'
import type { UserProgress } from '@/lib/types/domain'
import { UserProgressSchema } from '@/lib/validation/schemas'
import { queryKeys } from '@/lib/queryKeys'
import type { SyncActions } from './push'

/**
 * Pulls the latest progress from the server and updates the local Dexie record
 * if the server version is newer (Last Write Wins on updatedAt + version).
 *
 * Callers supply syncActions from useSyncStore() and the QueryClient so this
 * function remains framework-agnostic and independently testable.
 */
export async function pullProgress(
  userId: string,
  localRepo: ILocalProgressRepository,
  syncActions: SyncActions,
  queryClient: QueryClient,
): Promise<void> {
  syncActions.setSyncing(true)

  let response: Response
  try {
    response = await fetch('/api/progress')
  } catch (err) {
    syncActions.setSyncError(err instanceof Error ? err.message : 'Network error')
    return
  }

  if (response.status === 404) {
    // No server record yet — nothing to pull
    syncActions.setSyncComplete(new Date().toISOString())
    return
  }

  if (!response.ok) {
    syncActions.setSyncError(`Pull failed with status ${response.status}`)
    return
  }

  let serverProgress: UserProgress
  try {
    serverProgress = UserProgressSchema.parse(await response.json())
  } catch {
    syncActions.setSyncError('Pull failed: invalid response from server')
    return
  }

  const local = await localRepo.get(userId)

  // Do not overwrite dirty local changes — push must complete before pull can
  // accept server state, otherwise unsynced local edits are silently discarded.
  if (local?.dirty) {
    syncActions.setSyncing(false)
    return
  }

  const serverMs = new Date(serverProgress.updatedAt).getTime()
  const localMs = local ? new Date(local.updatedAt).getTime() : -Infinity

  const serverIsNewer =
    serverMs > localMs ||
    (serverMs === localMs && serverProgress.version > (local?.version ?? -1))

  if (serverIsNewer) {
    await localRepo.upsert(userId, {
      completedPeakIds: serverProgress.completedPeakIds,
      updatedAt: serverProgress.updatedAt,
      version: serverProgress.version,
    })
    const now = new Date().toISOString()
    await localRepo.markClean(userId, now)
    await queryClient.invalidateQueries({ queryKey: queryKeys.progress.all() })
    syncActions.setSyncComplete(now)
  } else {
    // Local is same or newer — no update; push phase will handle sync completion
    syncActions.setSyncing(false)
  }
}
