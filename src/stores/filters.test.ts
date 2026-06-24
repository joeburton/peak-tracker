import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useFiltersStore, useResetFiltersOnMount, type CompletionFilter } from './filters'

beforeEach(() => {
  useFiltersStore.getState().resetFilters()
})

// ── initial state ──────────────────────────────────────────────────────────────

describe('initial state', () => {
  it('defaults completionFilter to "all"', () => {
    expect(useFiltersStore.getState().completionFilter).toBe('all')
  })

  it('defaults regionFilter to null', () => {
    expect(useFiltersStore.getState().regionFilter).toBeNull()
  })
})

// ── setCompletionFilter() ─────────────────────────────────────────────────────

describe('setCompletionFilter()', () => {
  it.each<CompletionFilter>(['all', 'complete', 'incomplete'])(
    'sets completionFilter to "%s"',
    (filter) => {
      useFiltersStore.getState().setCompletionFilter(filter)
      expect(useFiltersStore.getState().completionFilter).toBe(filter)
    },
  )

  it('does not affect regionFilter', () => {
    useFiltersStore.getState().setRegionFilter('Lake District')
    useFiltersStore.getState().setCompletionFilter('complete')
    expect(useFiltersStore.getState().regionFilter).toBe('Lake District')
  })
})

// ── setRegionFilter() ─────────────────────────────────────────────────────────

describe('setRegionFilter()', () => {
  it('sets regionFilter to the provided string', () => {
    useFiltersStore.getState().setRegionFilter('Eastern Fells')
    expect(useFiltersStore.getState().regionFilter).toBe('Eastern Fells')
  })

  it('accepts null to clear the region filter', () => {
    useFiltersStore.getState().setRegionFilter('Eastern Fells')
    useFiltersStore.getState().setRegionFilter(null)
    expect(useFiltersStore.getState().regionFilter).toBeNull()
  })

  it('normalises empty string to null — prevents empty string being treated as an active filter', () => {
    useFiltersStore.getState().setRegionFilter('Eastern Fells')
    useFiltersStore.getState().setRegionFilter('')
    expect(useFiltersStore.getState().regionFilter).toBeNull()
  })

  it('does not affect completionFilter', () => {
    useFiltersStore.getState().setCompletionFilter('incomplete')
    useFiltersStore.getState().setRegionFilter('Eastern Fells')
    expect(useFiltersStore.getState().completionFilter).toBe('incomplete')
  })
})

// ── resetFilters() ────────────────────────────────────────────────────────────

describe('resetFilters()', () => {
  it('resets completionFilter to "all"', () => {
    useFiltersStore.getState().setCompletionFilter('complete')
    useFiltersStore.getState().resetFilters()
    expect(useFiltersStore.getState().completionFilter).toBe('all')
  })

  it('resets regionFilter to null', () => {
    useFiltersStore.getState().setRegionFilter('Eastern Fells')
    useFiltersStore.getState().resetFilters()
    expect(useFiltersStore.getState().regionFilter).toBeNull()
  })

  it('resets both filters at once', () => {
    useFiltersStore.getState().setCompletionFilter('incomplete')
    useFiltersStore.getState().setRegionFilter('Eastern Fells')
    useFiltersStore.getState().resetFilters()
    const { completionFilter, regionFilter } = useFiltersStore.getState()
    expect(completionFilter).toBe('all')
    expect(regionFilter).toBeNull()
  })
})

// ── useResetFiltersOnMount() ───────────────────────────────────────────────────

describe('useResetFiltersOnMount()', () => {
  it('resets filters on mount — clears state left from a previous page', () => {
    useFiltersStore.getState().setCompletionFilter('complete')
    useFiltersStore.getState().setRegionFilter('Eastern Fells')

    renderHook(() => useResetFiltersOnMount())

    expect(useFiltersStore.getState().completionFilter).toBe('all')
    expect(useFiltersStore.getState().regionFilter).toBeNull()
  })

  it('does not reset filters on unmount — StrictMode cleanup would wipe programmatically-set filters', () => {
    const { unmount } = renderHook(() => useResetFiltersOnMount())
    useFiltersStore.getState().setCompletionFilter('incomplete')
    useFiltersStore.getState().setRegionFilter('Western Fells')

    unmount()

    expect(useFiltersStore.getState().completionFilter).toBe('incomplete')
    expect(useFiltersStore.getState().regionFilter).toBe('Western Fells')
  })
})
