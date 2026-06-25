'use client'

import { create } from 'zustand'

export type ConnectionQuality = 'good' | 'slow' | 'unknown'

interface ConnectivityState {
  isOnline: boolean
  connectionQuality: ConnectionQuality
  setIsOnline: (isOnline: boolean) => void
  setConnectionQuality: (quality: ConnectionQuality) => void
}

export const useConnectivityStore = create<ConnectivityState>()((set) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  connectionQuality: 'unknown',
  setIsOnline: (isOnline) => set({ isOnline }),
  setConnectionQuality: (connectionQuality) => set({ connectionQuality }),
}))

/**
 * Registers online/offline event listeners and syncs them to the store.
 * Call this from a root-level useEffect; the returned function removes listeners.
 */
export function initConnectivity(): () => void {
  const handleOnline = () => useConnectivityStore.setState({ isOnline: true })
  const handleOffline = () => useConnectivityStore.setState({ isOnline: false })
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}
