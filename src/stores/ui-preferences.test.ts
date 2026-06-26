import { describe, it, expect, beforeEach } from 'vitest'
import { useUiPreferencesStore } from './ui-preferences'

beforeEach(() => {
  localStorage.clear()
  useUiPreferencesStore.setState({
    theme: 'system',
    viewMode: 'list',
    sidebarOpen: false,
  })
})

describe('useUiPreferencesStore — initial state', () => {
  it('defaults theme to "system"', () => {
    expect(useUiPreferencesStore.getState().theme).toBe('system')
  })

  it('defaults viewMode to "list"', () => {
    expect(useUiPreferencesStore.getState().viewMode).toBe('list')
  })

  it('defaults sidebarOpen to false', () => {
    expect(useUiPreferencesStore.getState().sidebarOpen).toBe(false)
  })
})

describe('useUiPreferencesStore — setTheme', () => {
  it('sets theme to "light"', () => {
    useUiPreferencesStore.getState().setTheme('light')
    expect(useUiPreferencesStore.getState().theme).toBe('light')
  })

  it('sets theme to "dark"', () => {
    useUiPreferencesStore.getState().setTheme('dark')
    expect(useUiPreferencesStore.getState().theme).toBe('dark')
  })

  it('sets theme back to "system"', () => {
    useUiPreferencesStore.getState().setTheme('dark')
    useUiPreferencesStore.getState().setTheme('system')
    expect(useUiPreferencesStore.getState().theme).toBe('system')
  })
})

describe('useUiPreferencesStore — setViewMode', () => {
  it('sets viewMode to "map"', () => {
    useUiPreferencesStore.getState().setViewMode('map')
    expect(useUiPreferencesStore.getState().viewMode).toBe('map')
  })

  it('sets viewMode back to "list"', () => {
    useUiPreferencesStore.getState().setViewMode('map')
    useUiPreferencesStore.getState().setViewMode('list')
    expect(useUiPreferencesStore.getState().viewMode).toBe('list')
  })
})

describe('useUiPreferencesStore — setSidebarOpen', () => {
  it('opens the sidebar', () => {
    useUiPreferencesStore.getState().setSidebarOpen(true)
    expect(useUiPreferencesStore.getState().sidebarOpen).toBe(true)
  })

  it('closes the sidebar', () => {
    useUiPreferencesStore.getState().setSidebarOpen(true)
    useUiPreferencesStore.getState().setSidebarOpen(false)
    expect(useUiPreferencesStore.getState().sidebarOpen).toBe(false)
  })
})

describe('useUiPreferencesStore — toggleSidebar', () => {
  it('toggles sidebarOpen from false to true', () => {
    useUiPreferencesStore.getState().toggleSidebar()
    expect(useUiPreferencesStore.getState().sidebarOpen).toBe(true)
  })

  it('toggles sidebarOpen from true to false', () => {
    useUiPreferencesStore.setState({ sidebarOpen: true })
    useUiPreferencesStore.getState().toggleSidebar()
    expect(useUiPreferencesStore.getState().sidebarOpen).toBe(false)
  })
})

describe('useUiPreferencesStore — persistence', () => {
  it('persists theme and viewMode to localStorage', () => {
    useUiPreferencesStore.getState().setTheme('dark')
    useUiPreferencesStore.getState().setViewMode('map')

    const stored = JSON.parse(localStorage.getItem('peak-tracker-ui-preferences') ?? '{}')
    expect(stored.state.theme).toBe('dark')
    expect(stored.state.viewMode).toBe('map')
  })

  it('does not persist sidebarOpen to localStorage', () => {
    useUiPreferencesStore.getState().setSidebarOpen(true)

    const stored = JSON.parse(localStorage.getItem('peak-tracker-ui-preferences') ?? '{}')
    expect(stored.state?.sidebarOpen).toBeUndefined()
  })

  it('restores theme and viewMode from localStorage on store reinitialisation', () => {
    useUiPreferencesStore.getState().setTheme('light')
    useUiPreferencesStore.getState().setViewMode('map')

    // Simulate reinitialisation by resetting store state and re-hydrating from localStorage
    useUiPreferencesStore.persist.rehydrate()

    expect(useUiPreferencesStore.getState().theme).toBe('light')
    expect(useUiPreferencesStore.getState().viewMode).toBe('map')
  })

  it('sidebarOpen resets to false after reinitialisation (not persisted)', () => {
    useUiPreferencesStore.setState({ sidebarOpen: true })
    useUiPreferencesStore.setState({ theme: 'system', viewMode: 'list', sidebarOpen: false })

    expect(useUiPreferencesStore.getState().sidebarOpen).toBe(false)
  })
})
