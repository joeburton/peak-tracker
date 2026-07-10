import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSwUpdate } from './use-sw-update';

function makeWorker(state: ServiceWorkerState = 'installed'): ServiceWorker {
  const worker = {
    state,
    postMessage: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as ServiceWorker;
  return worker;
}

function makeRegistration(overrides: Partial<ServiceWorkerRegistration> = {}): ServiceWorkerRegistration {
  const listeners: Record<string, EventListenerOrEventListenerObject[]> = {};
  return {
    waiting: null,
    installing: null,
    active: makeWorker('activated'),
    addEventListener: vi.fn((type: string, handler: EventListenerOrEventListenerObject) => {
      listeners[type] ??= [];
      listeners[type].push(handler);
    }),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    _listeners: listeners,
    ...overrides,
  } as unknown as ServiceWorkerRegistration;
}

describe('useSwUpdate', () => {
  let readyResolve!: (reg: ServiceWorkerRegistration) => void;
  const swListeners: Record<string, EventListenerOrEventListenerObject[]> = {};

  beforeEach(() => {
    const readyPromise = new Promise<ServiceWorkerRegistration>((res) => {
      readyResolve = res;
    });

    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        ready: readyPromise,
        addEventListener: vi.fn((type: string, handler: EventListenerOrEventListenerObject) => {
          swListeners[type] ??= [];
          swListeners[type].push(handler);
        }),
        removeEventListener: vi.fn(),
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    for (const key of Object.keys(swListeners)) delete swListeners[key];
  });

  it('returns updateAvailable false initially', () => {
    const { result } = renderHook(() => useSwUpdate());
    expect(result.current.updateAvailable).toBe(false);
  });

  it('returns updateAvailable true when a waiting worker is already present', async () => {
    const waiting = makeWorker('installed');
    const registration = makeRegistration({ waiting });

    const { result } = renderHook(() => useSwUpdate());

    await act(async () => {
      readyResolve(registration);
    });

    expect(result.current.updateAvailable).toBe(true);
  });

  it('returns updateAvailable true when a new worker reaches installed state', async () => {
    const registration = makeRegistration();
    const { result } = renderHook(() => useSwUpdate());

    await act(async () => {
      readyResolve(registration);
    });

    // Simulate updatefound + statechange to 'installed'
    const installing = makeWorker('installing');
    let stateChangeHandler: (() => void) | undefined;
    (installing.addEventListener as ReturnType<typeof vi.fn>).mockImplementation(
      (type: string, handler: () => void) => {
        if (type === 'statechange') stateChangeHandler = handler;
      }
    );

    await act(async () => {
      const reg = registration as unknown as Record<string, unknown>;
      reg.installing = installing;
      const updateFoundListeners = (registration as unknown as { _listeners: Record<string, EventListenerOrEventListenerObject[]> })._listeners['updatefound'] ?? [];
      for (const listener of updateFoundListeners) {
        (listener as EventListener)(new Event('updatefound'));
      }
    });

    await act(async () => {
      (installing as unknown as Record<string, unknown>).state = 'installed';
      stateChangeHandler?.();
    });

    expect(result.current.updateAvailable).toBe(true);
  });

  it('does not set updateAvailable on initial install (no active worker)', async () => {
    const waiting = makeWorker('installed');
    // No active worker = first install, not an update
    const registration = makeRegistration({ waiting, active: null as unknown as ServiceWorker });

    const { result } = renderHook(() => useSwUpdate());

    await act(async () => {
      readyResolve(registration);
    });

    expect(result.current.updateAvailable).toBe(false);
  });

  it('applyUpdate posts SKIP_WAITING and listens for controllerchange', async () => {
    const waiting = makeWorker('installed');
    const registration = makeRegistration({ waiting });

    const { result } = renderHook(() => useSwUpdate());

    await act(async () => {
      readyResolve(registration);
    });

    const reloadSpy = vi.fn();
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, reload: reloadSpy },
    });

    act(() => {
      result.current.applyUpdate();
    });

    expect(waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
    expect(swListeners['controllerchange']).toHaveLength(1);

    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
  });
});
