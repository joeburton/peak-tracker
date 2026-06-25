'use client'

import { create } from 'zustand'
import { CompletionFilterSchema } from '@/lib/validation'
import type { CompletionFilter } from '@/lib/types/domain'

interface FiltersState {
  completionFilter: CompletionFilter
  regionFilter: string | null
  setCompletionFilter: (filter: CompletionFilter) => void
  // Safe to call on mount — normalises whitespace-only and empty strings to null
  setRegionFilter: (region: string | null) => void
  // Call on URL-driven mount — validates raw URL string, falls back to 'all' on invalid input
  initCompletionFilterFromUrl: (raw: string | null) => void
  resetFilters: () => void
}

const DEFAULT_STATE = {
  completionFilter: 'all' as CompletionFilter,
  regionFilter: null as string | null,
}

export const useFiltersStore = create<FiltersState>((set) => ({
  ...DEFAULT_STATE,

  setCompletionFilter: (filter) => set({ completionFilter: filter }),

  // Trim and coerce to null — whitespace-only and empty strings are not valid filter values
  setRegionFilter: (region) => set({ regionFilter: region?.trim() || null }),

  initCompletionFilterFromUrl: (raw) => {
    const result = CompletionFilterSchema.safeParse(raw)
    set({ completionFilter: result.success ? result.data : 'all' })
  },

  resetFilters: () => set(DEFAULT_STATE),
}))
