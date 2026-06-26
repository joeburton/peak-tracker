'use client'

import { create } from 'zustand'

interface ProgressState {
  pendingCompletions: Set<string>
  pendingRemovals: Set<string>
  addCompletion: (peakId: string) => void
  removeCompletion: (peakId: string) => void
  addRemoval: (peakId: string) => void
  removeRemoval: (peakId: string) => void
  clearPending: () => void
}

export const useProgressStore = create<ProgressState>()((set) => ({
  pendingCompletions: new Set(),
  pendingRemovals: new Set(),

  addCompletion: (peakId) =>
    set((state) => ({ pendingCompletions: new Set(state.pendingCompletions).add(peakId) })),

  removeCompletion: (peakId) =>
    set((state) => {
      const next = new Set(state.pendingCompletions)
      next.delete(peakId)
      return { pendingCompletions: next }
    }),

  addRemoval: (peakId) =>
    set((state) => ({ pendingRemovals: new Set(state.pendingRemovals).add(peakId) })),

  removeRemoval: (peakId) =>
    set((state) => {
      const next = new Set(state.pendingRemovals)
      next.delete(peakId)
      return { pendingRemovals: next }
    }),

  clearPending: () =>
    set({ pendingCompletions: new Set(), pendingRemovals: new Set() }),
}))
