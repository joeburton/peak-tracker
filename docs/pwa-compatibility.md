# PWA Compatibility — Next.js 16 + Turbopack

**Issue:** #74  
**Date:** 2026-07-04  
**Decision:** Adopt Serwist — approved

---

## Summary

`next-pwa` is **incompatible** with Next.js 16 and Turbopack. Serwist is the recommended replacement, confirmed by the official Next.js documentation. Serwist also requires Webpack but coexists with Turbopack via a hybrid build configuration that is well-supported and low-risk.

**Decision: adopt Serwist with a Turbopack dev / Webpack build split.**

---

## Findings

### next-pwa

Not installed, and not viable for Next.js 16.

- Relies on Webpack's plugin system (`withPWA` wraps `next.config`)
- Turbopack does not support Webpack plugins
- Not updated for Turbopack compatibility
- **Verdict: incompatible. Do not use.**

### Serwist

The actively-maintained successor library for modern Next.js, and the library recommended by the [official Next.js PWA guide](https://nextjs.org/docs/app/guides/progressive-web-apps) for offline support.

- First-class Next.js App Router support via `@serwist/next` (v9.5.11, confirmed compatible with Next.js 16.2.x)
- Service worker authored in TypeScript, compiled at build time
- Requires Webpack for the production build and for local SW testing in development
- **Verdict: adopt.**

---

## Turbopack vs Webpack

Next.js 16 defaults to Turbopack for both `next dev` and `next build`. Turbopack does not support Webpack plugins. Serwist's `@serwist/next` uses a Webpack plugin to inject the service worker at build time.

The solution is a hybrid configuration:

| Command | Bundler | Rationale |
|---------|---------|-----------|
| `next dev --turbopack` | Turbopack | Fast HMR for regular development (SW not active) |
| `next dev --webpack` | Webpack | Required when testing service worker behaviour locally |
| `next build --webpack` | Webpack | Serwist service worker injection for production |
| `next start` | N/A | Serves built output unchanged |

When developing features unrelated to the service worker, use `--turbopack` for speed. Switch to `--webpack` only when you need to test offline/SW behaviour locally. Production builds always use `--webpack`.

Production builds are slower than Turbopack would be. This is an acceptable trade-off given the project size.

---

## Changes required in subsequent tickets

### Dependencies (`#75`)

```bash
npm install @serwist/next@9.5.11 serwist@9.5.11
```

### Build scripts — `package.json` (`#75`)

```diff
- "dev": "next dev",
- "build": "next build",
+ "dev": "next dev --turbopack",
+ "build": "next build --webpack",
```

### `next.config.ts` (`#75`)

Wrap the config with Serwist's plugin (replaces `withPWA` from next-pwa).

### Service worker entry point (`#75`)

`src/sw.ts` — authored in TypeScript, compiled by Serwist at build time. No manual `public/sw.js` required.

---

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Webpack build slower than Turbopack | Certain | Acceptable — project size is manageable |
| SW not active in dev mode | Expected | Test offline behaviour with `next build && next start` |
| Serwist API changes on upgrade | Low | Pin version; review release notes before upgrading |
