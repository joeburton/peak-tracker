'use client';

import { RefreshCw } from 'lucide-react';

import { useSwUpdate } from '@/hooks/use-sw-update';

import { Button } from '@/components/ui/button';

export function SwUpdatePrompt() {
  const { updateAvailable, applyUpdate } = useSwUpdate();

  if (!updateAvailable) return null;

  return (
    <div
      role="region"
      aria-label="App update available"
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-4 shadow-lg sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-sm sm:rounded-lg sm:border"
    >
      <div className="flex items-start gap-3">
        <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium leading-none">Update available</p>
          <p className="text-sm text-muted-foreground">Reload to get the latest version.</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={applyUpdate} className="flex-1">
          Reload
        </Button>
      </div>
    </div>
  );
}
