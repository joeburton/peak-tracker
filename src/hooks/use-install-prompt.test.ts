import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useInstallPrompt } from './use-install-prompt';

const DISMISSED_KEY = 'pwa-install-dismissed';

function makePromptEvent(outcome: 'accepted' | 'dismissed' = 'accepted') {
  return Object.assign(new Event('beforeinstallprompt'), {
    prompt: vi.fn().mockResolvedValue(undefined),
    userChoice: Promise.resolve({ outcome }),
  });
}

describe('useInstallPrompt', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubEnv('NEXT_PUBLIC_ENABLE_PWA', 'true');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns canInstall false before beforeinstallprompt fires', () => {
    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.canInstall).toBe(false);
  });

  it('returns canInstall true when beforeinstallprompt fires', () => {
    const { result } = renderHook(() => useInstallPrompt());

    act(() => {
      window.dispatchEvent(makePromptEvent());
    });

    expect(result.current.canInstall).toBe(true);
  });

  it('calls prompt() and clears state when install() is called', async () => {
    const { result } = renderHook(() => useInstallPrompt());
    const event = makePromptEvent('accepted');

    act(() => {
      window.dispatchEvent(event);
    });

    await act(async () => {
      await result.current.install();
    });

    expect(event.prompt).toHaveBeenCalledOnce();
    expect(result.current.canInstall).toBe(false);
  });

  it('restores the prompt event when install() throws', async () => {
    const { result } = renderHook(() => useInstallPrompt());
    const event = makePromptEvent('accepted');
    event.prompt = vi.fn().mockRejectedValue(new Error('AbortError'));

    act(() => {
      window.dispatchEvent(event);
    });

    await act(async () => {
      await result.current.install();
    });

    expect(result.current.canInstall).toBe(true);
  });

  it('prevents concurrent install() calls', async () => {
    const { result } = renderHook(() => useInstallPrompt());
    let resolvePrompt!: () => void;
    const event = Object.assign(new Event('beforeinstallprompt'), {
      prompt: vi.fn().mockReturnValue(new Promise<void>((res) => { resolvePrompt = res; })),
      userChoice: Promise.resolve({ outcome: 'accepted' as const }),
    });

    act(() => {
      window.dispatchEvent(event);
    });

    await act(async () => {
      const p1 = result.current.install();
      const p2 = result.current.install();
      resolvePrompt();
      await Promise.all([p1, p2]);
    });

    expect(event.prompt).toHaveBeenCalledOnce();
  });

  it('sets dismissed flag and persists to localStorage when dismiss() is called', () => {
    const { result } = renderHook(() => useInstallPrompt());

    act(() => {
      window.dispatchEvent(makePromptEvent());
    });

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.canInstall).toBe(false);
    expect(localStorage.getItem(DISMISSED_KEY)).not.toBeNull();
  });

  it('does not show prompt if dismissed within 30 days', () => {
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    const { result } = renderHook(() => useInstallPrompt());

    act(() => {
      window.dispatchEvent(makePromptEvent());
    });

    expect(result.current.canInstall).toBe(false);
  });

  it('shows prompt if dismissal is older than 30 days', () => {
    const thirtyOneDaysAgo = Date.now() - 31 * 24 * 60 * 60 * 1000;
    localStorage.setItem(DISMISSED_KEY, thirtyOneDaysAgo.toString());
    const { result } = renderHook(() => useInstallPrompt());

    act(() => {
      window.dispatchEvent(makePromptEvent());
    });

    expect(result.current.canInstall).toBe(true);
  });

  it('returns canInstall false when NEXT_PUBLIC_ENABLE_PWA is false', () => {
    vi.stubEnv('NEXT_PUBLIC_ENABLE_PWA', 'false');
    const { result } = renderHook(() => useInstallPrompt());

    act(() => {
      window.dispatchEvent(makePromptEvent());
    });

    expect(result.current.canInstall).toBe(false);
  });
});
