'use client'

import { useEffect, useRef } from 'react'
import { useConnectivityStore } from '@/stores/connectivity'
import { useSyncStore } from '@/stores/sync'
import { useQueryClient } from '@tanstack/react-query'
import { db } from '@/db/dexie'
import { createLocalProgressRepository } from '@/db/repositories/local-progress-repository'
import { runSyncCycle } from '@/lib/sync/cycle'

/**
 * Triggers a sync cycle whenever the device transitions from offline to online.
 * No-ops on initial mount (even if already online) to avoid a sync on every
 * page load. Call this once in a root client component that has access to userId.
 */
export function useAutoSync(userId: string | null): void {
  const isOnline = useConnectivityStore((s) => s.isOnline)
  const setSyncing = useSyncStore((s) => s.setSyncing)
  const setSyncComplete = useSyncStore((s) => s.setSyncComplete)
  const setSyncError = useSyncStore((s) => s.setSyncError)
  const queryClient = useQueryClient()
  const prevOnlineRef = useRef(isOnline)

  useEffect(() => {
    const wasOffline = !prevOnlineRef.current
    prevOnlineRef.current = isOnline

    if (!isOnline || !wasOffline || !userId) return

    const localRepo = createLocalProgressRepository(db)
    void runSyncCycle(userId, localRepo, { setSyncing, setSyncComplete, setSyncError }, queryClient)
  }, [isOnline, userId, setSyncing, setSyncComplete, setSyncError, queryClient])
}
