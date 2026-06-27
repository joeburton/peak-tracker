import type { ILocalProgressRepository } from '@/db/repositories/local-progress-repository'

export interface SyncActions {
  setSyncing: (value: boolean) => void
  setSyncComplete: (timestamp: string) => void
  setSyncError: (error: string) => void
}

/**
 * Pushes the local progress record to the server if it is dirty.
 * On success: marks the record clean and updates lastSyncedAt.
 * On failure: leaves dirty: true and records the error in sync state.
 *
 * Callers must supply syncActions from useSyncStore() so this function
 * remains framework-agnostic and independently testable.
 */
export async function pushProgress(
  userId: string,
  localRepo: ILocalProgressRepository,
  syncActions: SyncActions,
): Promise<void> {
  const local = await localRepo.get(userId)
  if (!local?.dirty) return

  syncActions.setSyncing(true)

  let response: Response
  try {
    response = await fetch('/api/progress', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        completedPeakIds: local.completedPeakIds,
        updatedAt: local.updatedAt,
        version: local.version,
      }),
    })
  } catch (err) {
    syncActions.setSyncError(err instanceof Error ? err.message : 'Network error')
    return
  }

  if (!response.ok) {
    let message = `Push failed with status ${response.status}`
    try {
      const body = (await response.json()) as Record<string, unknown>
      if (typeof body.error === 'string') message = body.error
    } catch {
      // response body is not JSON — fall back to status message
    }
    syncActions.setSyncError(message)
    return
  }

  const now = new Date().toISOString()
  await localRepo.markClean(userId, now)
  syncActions.setSyncComplete(now)
}
