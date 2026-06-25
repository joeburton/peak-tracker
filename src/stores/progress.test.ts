import { describe, it, expect, beforeEach } from 'vitest'
import { useProgressStore } from './progress'

beforeEach(() => {
  useProgressStore.setState({ pendingCompletions: new Set() })
})

describe('useProgressStore — initial state', () => {
  it('starts with an empty pendingCompletions set', () => {
    expect(useProgressStore.getState().pendingCompletions.size).toBe(0)
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

describe('useProgressStore — clearPending', () => {
  it('removes all peakIds from pendingCompletions', () => {
    useProgressStore.getState().addCompletion('peak-1')
    useProgressStore.getState().addCompletion('peak-2')
    useProgressStore.getState().addCompletion('peak-3')
    useProgressStore.getState().clearPending()
    expect(useProgressStore.getState().pendingCompletions.size).toBe(0)
  })

  it('is a no-op when the set is already empty', () => {
    useProgressStore.getState().clearPending()
    expect(useProgressStore.getState().pendingCompletions.size).toBe(0)
  })
})
