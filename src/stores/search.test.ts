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
    // 'first' timer was cancelled — advancing original delay should not propagate 'first'
    vi.advanceTimersByTime(DEBOUNCE_MS - 1)
    expect(useSearchStore.getState().debouncedSearchTerm).toBe('')
    // Full delay from the second call does propagate 'second'
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
