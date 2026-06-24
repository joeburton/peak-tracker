import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useSearchStore, DEBOUNCE_MS } from './search'

beforeEach(() => {
  vi.useFakeTimers()
  useSearchStore.getState().reset()
})

afterEach(() => {
  vi.useRealTimers()
})

// ── setSearchTerm() ────────────────────────────────────────────────────────────

describe('setSearchTerm()', () => {
  it('updates searchTerm immediately', () => {
    useSearchStore.getState().setSearchTerm('wainwright')
    expect(useSearchStore.getState().searchTerm).toBe('wainwright')
  })

  it('does not update debouncedSearchTerm before the debounce delay', () => {
    useSearchStore.getState().setSearchTerm('wainwright')
    vi.advanceTimersByTime(DEBOUNCE_MS - 1)
    expect(useSearchStore.getState().debouncedSearchTerm).toBe('')
  })

  it('updates debouncedSearchTerm after the debounce delay', () => {
    useSearchStore.getState().setSearchTerm('wainwright')
    vi.advanceTimersByTime(DEBOUNCE_MS)
    expect(useSearchStore.getState().debouncedSearchTerm).toBe('wainwright')
  })

  it('debounces rapid calls — only the last value is propagated', () => {
    useSearchStore.getState().setSearchTerm('w')
    useSearchStore.getState().setSearchTerm('wa')
    useSearchStore.getState().setSearchTerm('wai')
    vi.advanceTimersByTime(DEBOUNCE_MS)
    expect(useSearchStore.getState().debouncedSearchTerm).toBe('wai')
  })

  it('resets the debounce window when called again within the delay', () => {
    useSearchStore.getState().setSearchTerm('first')
    vi.advanceTimersByTime(DEBOUNCE_MS - 1)
    useSearchStore.getState().setSearchTerm('second')
    vi.advanceTimersByTime(DEBOUNCE_MS - 1)
    expect(useSearchStore.getState().debouncedSearchTerm).toBe('')
    vi.advanceTimersByTime(1)
    expect(useSearchStore.getState().debouncedSearchTerm).toBe('second')
  })

  it('propagates an empty string when cleared', () => {
    useSearchStore.getState().setSearchTerm('wainwright')
    vi.advanceTimersByTime(DEBOUNCE_MS)
    useSearchStore.getState().setSearchTerm('')
    vi.advanceTimersByTime(DEBOUNCE_MS)
    expect(useSearchStore.getState().debouncedSearchTerm).toBe('')
  })

  it('preserves raw searchTerm including leading/trailing spaces', () => {
    useSearchStore.getState().setSearchTerm('  wainwright  ')
    expect(useSearchStore.getState().searchTerm).toBe('  wainwright  ')
  })

  it('trims debouncedSearchTerm — whitespace-only input resolves to empty string', () => {
    useSearchStore.getState().setSearchTerm('   ')
    vi.advanceTimersByTime(DEBOUNCE_MS)
    expect(useSearchStore.getState().debouncedSearchTerm).toBe('')
  })

  it('trims leading and trailing whitespace from debouncedSearchTerm', () => {
    useSearchStore.getState().setSearchTerm('  wainwright  ')
    vi.advanceTimersByTime(DEBOUNCE_MS)
    expect(useSearchStore.getState().debouncedSearchTerm).toBe('wainwright')
  })
})

// ── reset() ───────────────────────────────────────────────────────────────────

describe('reset()', () => {
  it('clears both searchTerm and debouncedSearchTerm', () => {
    useSearchStore.getState().setSearchTerm('wainwright')
    vi.advanceTimersByTime(DEBOUNCE_MS)
    useSearchStore.getState().reset()
    expect(useSearchStore.getState().searchTerm).toBe('')
    expect(useSearchStore.getState().debouncedSearchTerm).toBe('')
  })

  it('cancels a pending debounce — debouncedSearchTerm stays empty after reset', () => {
    useSearchStore.getState().setSearchTerm('wainwright')
    useSearchStore.getState().reset()
    vi.advanceTimersByTime(DEBOUNCE_MS)
    expect(useSearchStore.getState().debouncedSearchTerm).toBe('')
  })
})
