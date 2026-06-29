'use client'

import { useEffect, useRef } from 'react'
import { useConnectivityStore } from '@/stores/connectivity'
import { useSyncStore } from '@/stores/sync'
import { useQueryClient } from '@tanstack/react-query'
import { db } from '@/db/dexie'
import { createLocalProgressRepository } from '@/db/repositories/local-progress-repository'
import { runSyncCycle } from '@/lib/sync/cycle'

/**
 * Triggers a sync cycle in two situations:
 * 1. On mount (or when userId first becomes available): if dirty records exist in
 *    Dexie and the device is online, sync immediately. Handles page reloads where
 *    a previous toggle never reached the server.
 * 2. When the device transitions from offline to online: sync regardless of dirty
 *    state to also pull the latest server changes.
 */
export function useAutoSync(userId: string | null): void {
  const isOnline = useConnectivityStore((s) => s.isOnline)
  const setSyncing = useSyncStore((s) => s.setSyncing)
  const setSyncComplete = useSyncStore((s) => s.setSyncComplete)
  const setSyncError = useSyncStore((s) => s.setSyncError)
  const queryClient = useQueryClient()
  const prevOnlineRef = useRef(isOnline)
  const mountSyncedForRef = useRef<string | null>(null)

  // Mount check: sync dirty records when auth first loads and the device is online
  useEffect(() => {
    if (!userId || !isOnline) return
    if (mountSyncedForRef.current === userId) return
    mountSyncedForRef.current = userId

    const localRepo = createLocalProgressRepository(db)
    void localRepo.get(userId).then((local) => {
      if (local?.dirty) {
        void runSyncCycle(userId, localRepo, { setSyncing, setSyncComplete, setSyncError }, queryClient)
      }
    })
  }, [isOnline, userId, setSyncing, setSyncComplete, setSyncError, queryClient])

  // Transition check: sync whenever the device comes back online
  useEffect(() => {
    const wasOffline = !prevOnlineRef.current
    prevOnlineRef.current = isOnline

    if (!isOnline || !wasOffline || !userId) return

    const localRepo = createLocalProgressRepository(db)
    void runSyncCycle(userId, localRepo, { setSyncing, setSyncComplete, setSyncError }, queryClient)
  }, [isOnline, userId, setSyncing, setSyncComplete, setSyncError, queryClient])
}
