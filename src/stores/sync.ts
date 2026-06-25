'use client'

import { create } from 'zustand'

interface SyncState {
  isSyncing: boolean
  lastSyncedAt: string | null
  syncError: string | null
  setSyncing: (isSyncing: boolean) => void
  setSyncComplete: (lastSyncedAt: string) => void
  setSyncError: (error: string) => void
}

export const useSyncStore = create<SyncState>()((set) => ({
  isSyncing: false,
  lastSyncedAt: null,
  syncError: null,
  setSyncing: (isSyncing) => set({ isSyncing, syncError: null }),
  setSyncComplete: (lastSyncedAt) => set({ isSyncing: false, lastSyncedAt, syncError: null }),
  setSyncError: (syncError) => set({ isSyncing: false, syncError }),
}))
