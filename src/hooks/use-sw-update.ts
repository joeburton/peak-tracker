'use client';

import { useCallback, useEffect, useState } from 'react';

export interface UseSwUpdateResult {
  updateAvailable: boolean;
  applyUpdate: () => void;
}

export function useSwUpdate(): UseSwUpdateResult {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready.then((registration) => {
      // Pick up a waiting worker that arrived before this effect ran
      if (registration.waiting && registration.active) {
        setWaitingWorker(registration.waiting);
      }

      registration.addEventListener('updatefound', () => {
        const installing = registration.installing;
        if (!installing) return;

        installing.addEventListener('statechange', () => {
          // 'installed' + active SW = update is waiting for user action
          if (installing.state === 'installed' && registration.active) {
            setWaitingWorker(installing);
          }
        });
      });
    });
  }, []);

  const applyUpdate = useCallback(() => {
    if (!waitingWorker) return;
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    navigator.serviceWorker.addEventListener(
      'controllerchange',
      () => window.location.reload(),
      { once: true }
    );
  }, [waitingWorker]);

  return {
    updateAvailable: waitingWorker !== null,
    applyUpdate,
  };
}
