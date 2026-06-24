import { create } from 'zustand'

export const DEBOUNCE_MS = 300

interface SearchState {
  searchTerm: string
  debouncedSearchTerm: string
  setSearchTerm: (term: string) => void
  // Call reset() on mount/unmount — singleton state persists across navigation without it
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
        set({ debouncedSearchTerm: term })
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
