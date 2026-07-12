import { describe, it, expect } from 'vitest';
import manifest from './manifest';

describe('manifest', () => {
  it('describes an installable standalone PWA', () => {
    const result = manifest();
    expect(result.name).toBe('Peak Tracker UK');
    expect(result.short_name).toBe('Peak Tracker');
    expect(result.display).toBe('standalone');
    expect(result.start_url).toBe('/');
  });

  it('includes 192x192 and maskable 512x512 icons', () => {
    const result = manifest();
    expect(result.icons).toEqual([
      { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ]);
  });
});
