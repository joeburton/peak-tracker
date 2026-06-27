'use client'

import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { initConnectivity } from '@/stores/connectivity'
import { useAutoSync } from '@/hooks/use-auto-sync'

/**
 * Initializes browser connectivity listeners and wires up auto-sync.
 * Must be rendered inside ClerkProvider and QueryProvider.
 * Renders nothing — exists purely for side effects.
 */
export function SyncProvider() {
  const { userId } = useAuth()

  useEffect(() => {
    return initConnectivity()
  }, [])

  useAutoSync(userId ?? null)

  return null
}
