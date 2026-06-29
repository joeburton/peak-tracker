'use client'

import { useCallback } from 'react'
import { db } from '@/db/dexie'
import { createLocalProgressRepository } from '@/db/repositories/local-progress-repository'
import { useProgressStore } from '@/stores/progress'
import { useConnectivityStore } from '@/stores/connectivity'
import { useSyncStore } from '@/stores/sync'
import { useQueryClient } from '@tanstack/react-query'
import { runSyncCycle } from '@/lib/sync/cycle'

export function useToggleProgress(userId: string | null) {
  const addCompletion = useProgressStore((s) => s.addCompletion)
  const removeCompletion = useProgressStore((s) => s.removeCompletion)
  const addRemoval = useProgressStore((s) => s.addRemoval)
  const removeRemoval = useProgressStore((s) => s.removeRemoval)
  const isOnline = useConnectivityStore((s) => s.isOnline)
  const setSyncing = useSyncStore((s) => s.setSyncing)
  const setSyncComplete = useSyncStore((s) => s.setSyncComplete)
  const setSyncError = useSyncStore((s) => s.setSyncError)
  const queryClient = useQueryClient()

  const toggle = useCallback(
    async (peakId: string, currentlyCompleted: boolean) => {
      if (!userId) return

      // Optimistic update — synchronous, so the UI responds immediately
      if (currentlyCompleted) {
        removeCompletion(peakId)
        addRemoval(peakId)
      } else {
        removeRemoval(peakId)
        addCompletion(peakId)
      }

      // Persist to Dexie
      const repo = createLocalProgressRepository(db)
      const existing = await repo.get(userId)
      const currentIds = existing?.completedPeakIds ?? []

      const newIds = currentlyCompleted
        ? currentIds.filter((id) => id !== peakId)
        : [...new Set([...currentIds, peakId])]

      await repo.upsert(userId, {
        completedPeakIds: newIds,
        updatedAt: new Date().toISOString(),
        version: (existing?.version ?? 0) + 1,
      })

      await repo.markDirty(userId)

      // If already online, push the change to the server immediately.
      // If offline, the dirty flag ensures it syncs when connectivity returns.
      if (isOnline) {
        void runSyncCycle(userId, repo, { setSyncing, setSyncComplete, setSyncError }, queryClient)
      }
    },
    [userId, isOnline, addCompletion, removeCompletion, addRemoval, removeRemoval, setSyncing, setSyncComplete, setSyncError, queryClient],
  )

  return { toggle }
}
