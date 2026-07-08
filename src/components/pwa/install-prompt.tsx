'use client';

import { Download, X } from 'lucide-react';

import { useInstallPrompt } from '@/hooks/use-install-prompt';

import { Button } from '@/components/ui/button';

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'Peak Tracker UK';

export function InstallPrompt() {
  const { canInstall, install, dismiss } = useInstallPrompt();

  if (!canInstall) return null;

  return (
    <div
      role="region"
      aria-label={`Install ${APP_NAME} app`}
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-4 shadow-lg sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-sm sm:rounded-lg sm:border"
    >
      <div className="flex items-start gap-3">
        <Download className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium leading-none">Install {APP_NAME}</p>
          <p className="text-sm text-muted-foreground">
            Add to your home screen for offline access.
          </p>
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="shrink-0 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={install} className="flex-1">
          Install
        </Button>
        <Button size="sm" variant="outline" onClick={dismiss} className="flex-1">
          Not now
        </Button>
      </div>
    </div>
  );
}
