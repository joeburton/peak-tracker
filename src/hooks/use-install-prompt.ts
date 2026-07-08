'use client';

import { useCallback, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'pwa-install-dismissed';
const DISMISS_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export interface UseInstallPromptResult {
  canInstall: boolean;
  install: () => Promise<void>;
  dismiss: () => void;
}

export function useInstallPrompt(): UseInstallPromptResult {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    const dismissedAt = localStorage.getItem(DISMISSED_KEY);
    if (!dismissedAt) return false;
    return Date.now() - parseInt(dismissedAt, 10) < DISMISS_DURATION_MS;
  });

  const isEnabled = process.env.NEXT_PUBLIC_ENABLE_PWA !== 'false';

  useEffect(() => {
    if (!isEnabled || isDismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [isEnabled, isDismissed]);

  const install = useCallback(async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted' || outcome === 'dismissed') {
      setPromptEvent(null);
    }
  }, [promptEvent]);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    setIsDismissed(true);
    setPromptEvent(null);
  }, []);

  return {
    canInstall: isEnabled && !isDismissed && promptEvent !== null,
    install,
    dismiss,
  };
}
