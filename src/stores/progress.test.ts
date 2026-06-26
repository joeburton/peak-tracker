import { describe, it, expect, beforeEach } from 'vitest'
import { useProgressStore } from './progress'

beforeEach(() => {
  useProgressStore.setState({ pendingCompletions: new Set(), pendingRemovals: new Set() })
})

describe('useProgressStore — initial state', () => {
  it('starts with empty pendingCompletions and pendingRemovals sets', () => {
    expect(useProgressStore.getState().pendingCompletions.size).toBe(0)
    expect(useProgressStore.getState().pendingRemovals.size).toBe(0)
  })
})

describe('useProgressStore — addCompletion', () => {
  it('adds a peakId to pendingCompletions', () => {
    useProgressStore.getState().addCompletion('peak-1')
    expect(useProgressStore.getState().pendingCompletions.has('peak-1')).toBe(true)
  })

  it('adds multiple peakIds independently', () => {
    useProgressStore.getState().addCompletion('peak-1')
    useProgressStore.getState().addCompletion('peak-2')
    const { pendingCompletions } = useProgressStore.getState()
    expect(pendingCompletions.has('peak-1')).toBe(true)
    expect(pendingCompletions.has('peak-2')).toBe(true)
    expect(pendingCompletions.size).toBe(2)
  })

  it('is idempotent — adding the same peakId twice does not create duplicates', () => {
    useProgressStore.getState().addCompletion('peak-1')
    useProgressStore.getState().addCompletion('peak-1')
    expect(useProgressStore.getState().pendingCompletions.size).toBe(1)
  })

  it('returns a new Set reference (immutable update)', () => {
    const before = useProgressStore.getState().pendingCompletions
    useProgressStore.getState().addCompletion('peak-1')
    const after = useProgressStore.getState().pendingCompletions
    expect(after).not.toBe(before)
  })
})

describe('useProgressStore — removeCompletion', () => {
  it('removes a peakId from pendingCompletions', () => {
    useProgressStore.getState().addCompletion('peak-1')
    useProgressStore.getState().removeCompletion('peak-1')
    expect(useProgressStore.getState().pendingCompletions.has('peak-1')).toBe(false)
  })

  it('does not affect other peakIds when removing one', () => {
    useProgressStore.getState().addCompletion('peak-1')
    useProgressStore.getState().addCompletion('peak-2')
    useProgressStore.getState().removeCompletion('peak-1')
    expect(useProgressStore.getState().pendingCompletions.has('peak-2')).toBe(true)
    expect(useProgressStore.getState().pendingCompletions.size).toBe(1)
  })

  it('is a no-op when removing a peakId that is not present', () => {
    useProgressStore.getState().removeCompletion('peak-not-present')
    expect(useProgressStore.getState().pendingCompletions.size).toBe(0)
  })

  it('returns a new Set reference (immutable update)', () => {
    useProgressStore.getState().addCompletion('peak-1')
    const before = useProgressStore.getState().pendingCompletions
    useProgressStore.getState().removeCompletion('peak-1')
    const after = useProgressStore.getState().pendingCompletions
    expect(after).not.toBe(before)
  })
})

describe('useProgressStore — addRemoval', () => {
  it('adds a peakId to pendingRemovals', () => {
    useProgressStore.getState().addRemoval('peak-1')
    expect(useProgressStore.getState().pendingRemovals.has('peak-1')).toBe(true)
  })

  it('is idempotent', () => {
    useProgressStore.getState().addRemoval('peak-1')
    useProgressStore.getState().addRemoval('peak-1')
    expect(useProgressStore.getState().pendingRemovals.size).toBe(1)
  })

  it('does not affect pendingCompletions', () => {
    useProgressStore.getState().addCompletion('peak-2')
    useProgressStore.getState().addRemoval('peak-1')
    expect(useProgressStore.getState().pendingCompletions.has('peak-2')).toBe(true)
  })

  it('returns a new Set reference (immutable update)', () => {
    const before = useProgressStore.getState().pendingRemovals
    useProgressStore.getState().addRemoval('peak-1')
    expect(useProgressStore.getState().pendingRemovals).not.toBe(before)
  })
})

describe('useProgressStore — removeRemoval', () => {
  it('removes a peakId from pendingRemovals', () => {
    useProgressStore.getState().addRemoval('peak-1')
    useProgressStore.getState().removeRemoval('peak-1')
    expect(useProgressStore.getState().pendingRemovals.has('peak-1')).toBe(false)
  })

  it('is a no-op when peakId is not present', () => {
    useProgressStore.getState().removeRemoval('peak-not-present')
    expect(useProgressStore.getState().pendingRemovals.size).toBe(0)
  })
})

describe('useProgressStore — clearPending', () => {
  it('clears both pendingCompletions and pendingRemovals', () => {
    useProgressStore.getState().addCompletion('peak-1')
    useProgressStore.getState().addRemoval('peak-2')
    useProgressStore.getState().clearPending()
    expect(useProgressStore.getState().pendingCompletions.size).toBe(0)
    expect(useProgressStore.getState().pendingRemovals.size).toBe(0)
  })

  it('is a no-op when both sets are already empty', () => {
    useProgressStore.getState().clearPending()
    expect(useProgressStore.getState().pendingCompletions.size).toBe(0)
    expect(useProgressStore.getState().pendingRemovals.size).toBe(0)
  })
})
