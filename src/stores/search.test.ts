import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useSearchStore, DEBOUNCE_MS } from './search'

beforeEach(() => {
  vi.useFakeTimers()
  useSearchStore.getState().reset()
})

afterEach(() => {
  vi.useRealTimers()
})

// ── onSearchInput() ────────────────────────────────────────────────────────────

describe('onSearchInput()', () => {
  it('updates searchTerm immediately', () => {
    useSearchStore.getState().onSearchInput('wainwright')
    expect(useSearchStore.getState().searchTerm).toBe('wainwright')
  })

  it('does not update debouncedSearchTerm before the debounce delay', () => {
    useSearchStore.getState().onSearchInput('wainwright')
    vi.advanceTimersByTime(DEBOUNCE_MS - 1)
    expect(useSearchStore.getState().debouncedSearchTerm).toBe('')
  })

  it('updates debouncedSearchTerm after the debounce delay', () => {
    useSearchStore.getState().onSearchInput('wainwright')
    vi.advanceTimersByTime(DEBOUNCE_MS)
    expect(useSearchStore.getState().debouncedSearchTerm).toBe('wainwright')
  })

  it('debounces rapid calls — only the last value is propagated', () => {
    useSearchStore.getState().onSearchInput('w')
    useSearchStore.getState().onSearchInput('wa')
    useSearchStore.getState().onSearchInput('wai')
    vi.advanceTimersByTime(DEBOUNCE_MS)
    expect(useSearchStore.getState().debouncedSearchTerm).toBe('wai')
  })

  it('resets the debounce window when called again within the delay', () => {
    useSearchStore.getState().onSearchInput('first')
    vi.advanceTimersByTime(DEBOUNCE_MS - 1)
    useSearchStore.getState().onSearchInput('second')
    vi.advanceTimersByTime(DEBOUNCE_MS - 1)
    expect(useSearchStore.getState().debouncedSearchTerm).toBe('')
    vi.advanceTimersByTime(1)
    expect(useSearchStore.getState().debouncedSearchTerm).toBe('second')
  })

  it('propagates an empty string when cleared', () => {
    useSearchStore.getState().onSearchInput('wainwright')
    vi.advanceTimersByTime(DEBOUNCE_MS)
    useSearchStore.getState().onSearchInput('')
    vi.advanceTimersByTime(DEBOUNCE_MS)
    expect(useSearchStore.getState().debouncedSearchTerm).toBe('')
  })

  it('preserves raw searchTerm including leading/trailing spaces', () => {
    useSearchStore.getState().onSearchInput('  wainwright  ')
    expect(useSearchStore.getState().searchTerm).toBe('  wainwright  ')
  })

  it('trims debouncedSearchTerm — whitespace-only input resolves to empty string', () => {
    useSearchStore.getState().onSearchInput('   ')
    vi.advanceTimersByTime(DEBOUNCE_MS)
    expect(useSearchStore.getState().debouncedSearchTerm).toBe('')
  })

  it('trims leading and trailing whitespace from debouncedSearchTerm', () => {
    useSearchStore.getState().onSearchInput('  wainwright  ')
    vi.advanceTimersByTime(DEBOUNCE_MS)
    expect(useSearchStore.getState().debouncedSearchTerm).toBe('wainwright')
  })
})

// ── reset() ───────────────────────────────────────────────────────────────────

describe('reset()', () => {
  it('clears both searchTerm and debouncedSearchTerm', () => {
    useSearchStore.getState().onSearchInput('wainwright')
    vi.advanceTimersByTime(DEBOUNCE_MS)
    useSearchStore.getState().reset()
    expect(useSearchStore.getState().searchTerm).toBe('')
    expect(useSearchStore.getState().debouncedSearchTerm).toBe('')
  })

  it('cancels a pending debounce — debouncedSearchTerm stays empty after reset', () => {
    useSearchStore.getState().onSearchInput('wainwright')
    useSearchStore.getState().reset()
    vi.advanceTimersByTime(DEBOUNCE_MS)
    expect(useSearchStore.getState().debouncedSearchTerm).toBe('')
  })
})

// ── initFromUrl() ─────────────────────────────────────────────────────────────

describe('initFromUrl()', () => {
  it('sets both searchTerm and debouncedSearchTerm immediately', () => {
    useSearchStore.getState().initFromUrl('scafell')
    expect(useSearchStore.getState().searchTerm).toBe('scafell')
    expect(useSearchStore.getState().debouncedSearchTerm).toBe('scafell')
  })

  it('trims the value before setting both fields', () => {
    useSearchStore.getState().initFromUrl('  scafell  ')
    expect(useSearchStore.getState().searchTerm).toBe('scafell')
    expect(useSearchStore.getState().debouncedSearchTerm).toBe('scafell')
  })

  it('cancels any orphaned in-flight debounce from the previous page', () => {
    useSearchStore.getState().onSearchInput('stale')
    useSearchStore.getState().initFromUrl('scafell')
    vi.advanceTimersByTime(DEBOUNCE_MS)
    // Stale timer must not overwrite after initFromUrl
    expect(useSearchStore.getState().debouncedSearchTerm).toBe('scafell')
  })

  it('sets both fields to empty string when called with empty string', () => {
    useSearchStore.getState().onSearchInput('wainwright')
    vi.advanceTimersByTime(DEBOUNCE_MS)
    useSearchStore.getState().initFromUrl('')
    expect(useSearchStore.getState().searchTerm).toBe('')
    expect(useSearchStore.getState().debouncedSearchTerm).toBe('')
  })
})
