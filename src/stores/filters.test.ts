import { describe, it, expect, beforeEach } from 'vitest'
import type { CompletionFilter } from '@/lib/types/domain'
import { useFiltersStore } from './filters'

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

  it('normalises empty string to null', () => {
    useFiltersStore.getState().setRegionFilter('Eastern Fells')
    useFiltersStore.getState().setRegionFilter('')
    expect(useFiltersStore.getState().regionFilter).toBeNull()
  })

  it('normalises whitespace-only string to null', () => {
    useFiltersStore.getState().setRegionFilter('Eastern Fells')
    useFiltersStore.getState().setRegionFilter('   ')
    expect(useFiltersStore.getState().regionFilter).toBeNull()
  })

  it('trims leading and trailing whitespace from valid region strings', () => {
    useFiltersStore.getState().setRegionFilter('  Eastern Fells  ')
    expect(useFiltersStore.getState().regionFilter).toBe('Eastern Fells')
  })

  it('does not affect completionFilter', () => {
    useFiltersStore.getState().setCompletionFilter('incomplete')
    useFiltersStore.getState().setRegionFilter('Eastern Fells')
    expect(useFiltersStore.getState().completionFilter).toBe('incomplete')
  })
})

// ── initCompletionFilterFromUrl() ────────────────────────────────────────────

describe('initCompletionFilterFromUrl()', () => {
  it.each<string>(['all', 'complete', 'incomplete'])(
    'sets completionFilter to "%s" when the URL value is valid',
    (value) => {
      useFiltersStore.getState().initCompletionFilterFromUrl(value)
      expect(useFiltersStore.getState().completionFilter).toBe(value)
    },
  )

  it('falls back to "all" when the URL value is invalid', () => {
    useFiltersStore.getState().setCompletionFilter('complete')
    useFiltersStore.getState().initCompletionFilterFromUrl('bogus')
    expect(useFiltersStore.getState().completionFilter).toBe('all')
  })

  it('falls back to "all" when the URL value is null (param absent)', () => {
    useFiltersStore.getState().setCompletionFilter('incomplete')
    useFiltersStore.getState().initCompletionFilterFromUrl(null)
    expect(useFiltersStore.getState().completionFilter).toBe('all')
  })

  it('falls back to "all" when the URL value is empty string', () => {
    useFiltersStore.getState().setCompletionFilter('incomplete')
    useFiltersStore.getState().initCompletionFilterFromUrl('')
    expect(useFiltersStore.getState().completionFilter).toBe('all')
  })

  it('does not affect regionFilter', () => {
    useFiltersStore.getState().setRegionFilter('Eastern Fells')
    useFiltersStore.getState().initCompletionFilterFromUrl('complete')
    expect(useFiltersStore.getState().regionFilter).toBe('Eastern Fells')
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
