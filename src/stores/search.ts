import { useEffect } from 'react'
import { create } from 'zustand'

export const DEBOUNCE_MS = 300

interface SearchState {
  searchTerm: string
  debouncedSearchTerm: string
  setSearchTerm: (term: string) => void
  reset: () => void
}

export const useSearchStore = create<SearchState>((set) => {
  let timer: ReturnType<typeof setTimeout> | null = null

  return {
    searchTerm: '',
    debouncedSearchTerm: '',

    setSearchTerm: (term) => {
      set({ searchTerm: term })
      if (timer !== null) clearTimeout(timer)
      timer = setTimeout(() => {
        // Trim before querying — raw searchTerm is kept unmodified for the input
        set({ debouncedSearchTerm: term.trim() })
        timer = null
      }, DEBOUNCE_MS)
    },

    reset: () => {
      if (timer !== null) {
        clearTimeout(timer)
        timer = null
      }
      set({ searchTerm: '', debouncedSearchTerm: '' })
    },
  }
})

// Use in every page that renders a search input. Resets the singleton store on
// mount (clears state from a previous page) and on unmount (cancels any
// in-flight debounce timer before navigation completes).
export function useResetSearchOnMount() {
  const reset = useSearchStore((s) => s.reset)
  useEffect(() => {
    reset()
    return () => {
      reset()
    }
  }, [reset])
}
