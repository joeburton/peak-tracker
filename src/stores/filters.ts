import { useEffect } from 'react'
import { create } from 'zustand'

export type CompletionFilter = 'all' | 'complete' | 'incomplete'

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

  // Normalise '' to null — the canonical "no filter" sentinel is null
  setRegionFilter: (region) => set({ regionFilter: region === '' ? null : region }),

  resetFilters: () => set(DEFAULT_STATE),
}))

// Use in every page that renders filter controls. Resets the singleton store on
// mount only — clears filters left from a previous page. No cleanup return:
// StrictMode's mount→cleanup→remount cycle would wipe programmatically-set
// filters (e.g. from URL params) if cleanup also called resetFilters().
export function useResetFiltersOnMount() {
  const resetFilters = useFiltersStore((s) => s.resetFilters)
  useEffect(() => {
    resetFilters()
  }, [resetFilters])
}
