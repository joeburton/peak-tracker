import { useEffect } from 'react'
import { create } from 'zustand'

export type CompletionFilter = 'all' | 'complete' | 'incomplete'

interface FiltersState {
  completionFilter: CompletionFilter
  regionFilter: string | null
  setCompletionFilter: (filter: CompletionFilter) => void
  setRegionFilter: (region: string | null) => void
  // Call resetFilters() on mount/unmount — singleton state persists across navigation without it
  resetFilters: () => void
}

const DEFAULT_STATE = {
  completionFilter: 'all' as CompletionFilter,
  regionFilter: null,
}

export const useFiltersStore = create<FiltersState>((set) => ({
  ...DEFAULT_STATE,

  setCompletionFilter: (filter) => set({ completionFilter: filter }),

  setRegionFilter: (region) => set({ regionFilter: region }),

  resetFilters: () => set(DEFAULT_STATE),
}))

// Use in every page that renders filter controls. Resets the singleton store on
// mount (clears filters from a previous page) and on unmount (before navigation).
export function useResetFiltersOnMount() {
  const resetFilters = useFiltersStore((s) => s.resetFilters)
  useEffect(() => {
    resetFilters()
    return () => {
      resetFilters()
    }
  }, [resetFilters])
}
