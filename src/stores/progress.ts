'use client'

import { create } from 'zustand'

interface ProgressState {
  pendingCompletions: Set<string>
  addCompletion: (peakId: string) => void
  removeCompletion: (peakId: string) => void
  clearPending: () => void
}

export const useProgressStore = create<ProgressState>()((set) => ({
  pendingCompletions: new Set(),
  addCompletion: (peakId) =>
    set((state) => ({ pendingCompletions: new Set(state.pendingCompletions).add(peakId) })),
  removeCompletion: (peakId) =>
    set((state) => {
      const next = new Set(state.pendingCompletions)
      next.delete(peakId)
      return { pendingCompletions: next }
    }),
  clearPending: () => set({ pendingCompletions: new Set() }),
}))
