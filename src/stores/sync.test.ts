import { describe, it, expect, beforeEach } from 'vitest'
import { useSyncStore } from './sync'

beforeEach(() => {
  useSyncStore.setState({ isSyncing: false, lastSyncedAt: null, syncError: null })
})

describe('useSyncStore — initial state', () => {
  it('defaults isSyncing to false', () => {
    expect(useSyncStore.getState().isSyncing).toBe(false)
  })

  it('defaults lastSyncedAt to null', () => {
    expect(useSyncStore.getState().lastSyncedAt).toBeNull()
  })

  it('defaults syncError to null', () => {
    expect(useSyncStore.getState().syncError).toBeNull()
  })
})

describe('useSyncStore — setSyncing', () => {
  it('sets isSyncing to true and clears any previous error', () => {
    useSyncStore.setState({ syncError: 'previous error' })
    useSyncStore.getState().setSyncing(true)
    expect(useSyncStore.getState().isSyncing).toBe(true)
    expect(useSyncStore.getState().syncError).toBeNull()
  })

  it('sets isSyncing to false', () => {
    useSyncStore.setState({ isSyncing: true })
    useSyncStore.getState().setSyncing(false)
    expect(useSyncStore.getState().isSyncing).toBe(false)
  })
})

describe('useSyncStore — setSyncComplete', () => {
  it('clears isSyncing, records lastSyncedAt, and clears any error', () => {
    useSyncStore.setState({ isSyncing: true, syncError: 'stale error' })
    useSyncStore.getState().setSyncComplete('2026-06-25T10:00:00.000Z')
    expect(useSyncStore.getState().isSyncing).toBe(false)
    expect(useSyncStore.getState().lastSyncedAt).toBe('2026-06-25T10:00:00.000Z')
    expect(useSyncStore.getState().syncError).toBeNull()
  })

  it('updates lastSyncedAt on a subsequent sync', () => {
    useSyncStore.getState().setSyncComplete('2026-06-25T10:00:00.000Z')
    useSyncStore.getState().setSyncComplete('2026-06-25T11:00:00.000Z')
    expect(useSyncStore.getState().lastSyncedAt).toBe('2026-06-25T11:00:00.000Z')
  })
})

describe('useSyncStore — setSyncError', () => {
  it('clears isSyncing and records the error message', () => {
    useSyncStore.setState({ isSyncing: true })
    useSyncStore.getState().setSyncError('Network unavailable')
    expect(useSyncStore.getState().isSyncing).toBe(false)
    expect(useSyncStore.getState().syncError).toBe('Network unavailable')
  })

  it('preserves lastSyncedAt when an error occurs', () => {
    useSyncStore.setState({ lastSyncedAt: '2026-06-25T10:00:00.000Z' })
    useSyncStore.getState().setSyncError('Timeout')
    expect(useSyncStore.getState().lastSyncedAt).toBe('2026-06-25T10:00:00.000Z')
  })
})

describe('useSyncStore — state machine transitions', () => {
  it('follows idle → syncing → complete', () => {
    expect(useSyncStore.getState().isSyncing).toBe(false)
    useSyncStore.getState().setSyncing(true)
    expect(useSyncStore.getState().isSyncing).toBe(true)
    useSyncStore.getState().setSyncComplete('2026-06-25T10:00:00.000Z')
    expect(useSyncStore.getState().isSyncing).toBe(false)
    expect(useSyncStore.getState().lastSyncedAt).toBe('2026-06-25T10:00:00.000Z')
  })

  it('follows idle → syncing → error', () => {
    useSyncStore.getState().setSyncing(true)
    useSyncStore.getState().setSyncError('Server error')
    expect(useSyncStore.getState().isSyncing).toBe(false)
    expect(useSyncStore.getState().syncError).toBe('Server error')
  })
})
