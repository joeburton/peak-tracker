'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'
export type ViewMode = 'list' | 'map'

interface UiPreferencesState {
  theme: Theme
  viewMode: ViewMode
  sidebarOpen: boolean
  setTheme: (theme: Theme) => void
  setViewMode: (viewMode: ViewMode) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

export const useUiPreferencesStore = create<UiPreferencesState>()(
  persist(
    (set) => ({
      theme: 'system',
      viewMode: 'list',
      sidebarOpen: false,
      setTheme: (theme) => set({ theme }),
      setViewMode: (viewMode) => set({ viewMode }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: 'peak-tracker-ui-preferences',
      storage: createJSONStorage(() => localStorage),
      // sidebarOpen intentionally excluded — device-local, resets on page load
      partialize: (state) => ({
        theme: state.theme,
        viewMode: state.viewMode,
      }),
    },
  ),
)
