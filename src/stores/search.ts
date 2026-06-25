'use client'

import { create } from 'zustand'

export const DEBOUNCE_MS = 300

interface SearchState {
  searchTerm: string
  debouncedSearchTerm: string
  // Call when user types in the search input — starts debounce timer
  onSearchInput: (term: string) => void
  // Call on URL-driven mount — sets both fields directly, cancels any orphaned timer
  initFromUrl: (term: string) => void
  reset: () => void
}

export const useSearchStore = create<SearchState>((set) => {
  let timer: ReturnType<typeof setTimeout> | null = null

  return {
    searchTerm: '',
    debouncedSearchTerm: '',

    onSearchInput: (term) => {
      set({ searchTerm: term })
      if (timer !== null) clearTimeout(timer)
      timer = setTimeout(() => {
        // Trim before querying — raw searchTerm is kept unmodified for the input
        set({ debouncedSearchTerm: term.trim() })
        timer = null
      }, DEBOUNCE_MS)
    },

    initFromUrl: (term) => {
      if (timer !== null) { clearTimeout(timer); timer = null }
      const trimmed = term.trim()
      set({ searchTerm: trimmed, debouncedSearchTerm: trimmed })
    },

    reset: () => {
      if (timer !== null) { clearTimeout(timer); timer = null }
      set({ searchTerm: '', debouncedSearchTerm: '' })
    },
  }
})
