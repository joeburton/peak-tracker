'use client'

import { useEffect, useRef } from 'react'
import { create } from 'zustand'
import type { CompletionFilter } from '@/lib/types/domain'

export type { CompletionFilter }

interface FiltersState {
  completionFilter: CompletionFilter
  regionFilter: string | null
  setCompletionFilter: (filter: CompletionFilter) => void
  setRegionFilter: (region: string | null) => void
  // Call resetFilters() on mount — singleton state persists across navigation without it
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

// Use in every page that renders filter controls. The useRef guard ensures
// resetFilters() fires exactly once per mount lifecycle — React StrictMode's
// mount→cleanup→remount cycle would otherwise call it twice, wiping any
// programmatically-set filters (e.g. from URL params) on the remount.
export function useResetFiltersOnMount() {
  const resetFilters = useFiltersStore((s) => s.resetFilters)
  const hasReset = useRef(false)
  useEffect(() => {
    if (!hasReset.current) {
      resetFilters()
      hasReset.current = true
    }
  }, [resetFilters])
}
