'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useSyncStore } from '@/stores/sync'

export function formatRelativeTime(isoString: string, now = Date.now()): string {
  const diffMs = now - new Date(isoString).getTime()
  const diffMinutes = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMinutes / 60)

  if (diffMinutes < 1) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${Math.floor(diffHours / 24)}d ago`
}

export function SyncStatus() {
  const { userId } = useAuth()
  const isSyncing = useSyncStore((s) => s.isSyncing)
  const lastSyncedAt = useSyncStore((s) => s.lastSyncedAt)
  const syncError = useSyncStore((s) => s.syncError)
  const [, setTick] = useState(0)

  // Re-render every minute so the relative timestamp stays current
  useEffect(() => {
    if (!lastSyncedAt) return
    const id = setInterval(() => setTick((t) => t + 1), 60_000)
    return () => clearInterval(id)
  }, [lastSyncedAt])

  if (!userId) return null

  if (isSyncing) {
    return (
      <span className="text-xs text-muted-foreground" aria-live="polite" aria-label="Syncing">
        Syncing…
      </span>
    )
  }

  if (syncError) {
    return (
      <span
        className="text-xs text-destructive"
        aria-live="polite"
        aria-label={`Sync failed: ${syncError}`}
        title={syncError}
      >
        Sync failed
      </span>
    )
  }

  if (lastSyncedAt) {
    return (
      <span
        className="text-xs text-muted-foreground"
        aria-live="polite"
        aria-label={`Last synced ${formatRelativeTime(lastSyncedAt)}`}
      >
        Synced {formatRelativeTime(lastSyncedAt)}
      </span>
    )
  }

  return null
}
