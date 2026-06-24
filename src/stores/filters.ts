'use client'

import { create } from 'zustand'
import type { CompletionFilter } from '@/lib/types/domain'

export type { CompletionFilter }

interface FiltersState {
  completionFilter: CompletionFilter
  regionFilter: string | null
  setCompletionFilter: (filter: CompletionFilter) => void
  setRegionFilter: (region: string | null) => void
  resetFilters: () => void
}

const DEFAULT_STATE: Pick<FiltersState, 'completionFilter' | 'regionFilter'> = {
  completionFilter: 'all',
  regionFilter: null,
}

export const useFiltersStore = create<FiltersState>((set) => ({
  ...DEFAULT_STATE,

  setCompletionFilter: (filter) => set({ completionFilter: filter }),

  // Trim and coerce to null — whitespace-only and empty strings are not valid filter values
  setRegionFilter: (region) => set({ regionFilter: region?.trim() || null }),

  resetFilters: () => set(DEFAULT_STATE),
}))
