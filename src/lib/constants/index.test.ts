import { describe, it, expect, afterEach, vi } from 'vitest';

describe('APP_NAME', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('falls back to "Peak Tracker UK" when NEXT_PUBLIC_APP_NAME is unset', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_NAME', '');
    delete process.env['NEXT_PUBLIC_APP_NAME'];
    const { APP_NAME } = await import('./index');
    expect(APP_NAME).toBe('Peak Tracker UK');
  });

  it('uses NEXT_PUBLIC_APP_NAME when set', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_NAME', 'Custom Tracker');
    const { APP_NAME } = await import('./index');
    expect(APP_NAME).toBe('Custom Tracker');
  });
});
