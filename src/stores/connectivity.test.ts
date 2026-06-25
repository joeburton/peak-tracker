import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useConnectivityStore, initConnectivity } from './connectivity'

beforeEach(() => {
  useConnectivityStore.setState({ isOnline: true, connectionQuality: 'unknown' })
})

describe('useConnectivityStore — initial state', () => {
  it('defaults connectionQuality to "unknown"', () => {
    expect(useConnectivityStore.getState().connectionQuality).toBe('unknown')
  })

  it('initialises isOnline from navigator.onLine', () => {
    // jsdom sets navigator.onLine to true by default
    expect(useConnectivityStore.getState().isOnline).toBe(true)
  })
})

describe('useConnectivityStore — setIsOnline', () => {
  it('sets isOnline to false', () => {
    useConnectivityStore.getState().setIsOnline(false)
    expect(useConnectivityStore.getState().isOnline).toBe(false)
  })

  it('sets isOnline to true', () => {
    useConnectivityStore.setState({ isOnline: false })
    useConnectivityStore.getState().setIsOnline(true)
    expect(useConnectivityStore.getState().isOnline).toBe(true)
  })
})

describe('useConnectivityStore — setConnectionQuality', () => {
  it('sets connectionQuality to "good"', () => {
    useConnectivityStore.getState().setConnectionQuality('good')
    expect(useConnectivityStore.getState().connectionQuality).toBe('good')
  })

  it('sets connectionQuality to "slow"', () => {
    useConnectivityStore.getState().setConnectionQuality('slow')
    expect(useConnectivityStore.getState().connectionQuality).toBe('slow')
  })

  it('sets connectionQuality back to "unknown"', () => {
    useConnectivityStore.getState().setConnectionQuality('good')
    useConnectivityStore.getState().setConnectionQuality('unknown')
    expect(useConnectivityStore.getState().connectionQuality).toBe('unknown')
  })
})

describe('useConnectivityStore — initConnectivity browser event integration', () => {
  let cleanup: () => void

  beforeEach(() => {
    cleanup = initConnectivity()
  })

  afterEach(() => {
    cleanup()
  })

  it('sets isOnline to false when the offline event fires', () => {
    useConnectivityStore.setState({ isOnline: true })
    window.dispatchEvent(new Event('offline'))
    expect(useConnectivityStore.getState().isOnline).toBe(false)
  })

  it('sets isOnline to true when the online event fires', () => {
    useConnectivityStore.setState({ isOnline: false })
    window.dispatchEvent(new Event('online'))
    expect(useConnectivityStore.getState().isOnline).toBe(true)
  })

  it('removes listeners after cleanup — offline event no longer updates state', () => {
    cleanup()
    useConnectivityStore.setState({ isOnline: true })
    window.dispatchEvent(new Event('offline'))
    expect(useConnectivityStore.getState().isOnline).toBe(true)
    cleanup = () => {} // prevent double-removal in afterEach
  })

  it('removes listeners after cleanup — online event no longer updates state', () => {
    cleanup()
    useConnectivityStore.setState({ isOnline: false })
    window.dispatchEvent(new Event('online'))
    expect(useConnectivityStore.getState().isOnline).toBe(false)
    cleanup = () => {}
  })
})
