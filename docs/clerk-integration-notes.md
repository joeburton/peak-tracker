# Clerk + Next.js 16 Integration Notes

> Produced for ticket #11 — `[Auth] Verify Clerk + Next.js 16 proxy.ts compatibility`
> Reviewed: June 2026

---

## Verdict: Compatible ✓

`clerkMiddleware()` from `@clerk/nextjs/server` v7.x works with Next.js 16's `proxy.ts`. Only the filename changes — the code is identical to the Next.js ≤15 `middleware.ts` pattern.

---

## What Changed in Next.js 16

| | Next.js ≤15 | Next.js 16 |
|---|---|---|
| File name | `src/middleware.ts` | `src/proxy.ts` |
| Runtime | Edge | Node.js (only option) |
| Export name | `middleware` | `proxy` or default |
| Clerk SDK usage | identical | identical |

`middleware.ts` is deprecated in Next.js 16 and will be removed in a future version. The project already has `src/proxy.ts` as a placeholder.

---

## SDK Version

Use `@clerk/nextjs@^7.5.7` (latest stable as of June 2026). Install with:

```bash
npm install @clerk/nextjs
```

---

## Integration Pattern

### `src/proxy.ts`

```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/peak-lists/(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

### `src/app/layout.tsx`

```tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}
```

---

## Known Issue — `auth.protect()` Redirect Bug

**Clerk GitHub issue:** [clerk/javascript#8302](https://github.com/clerk/javascript/issues/8302)
**Status:** Open (as of June 2026, assigned to Clerk team)
**Affected:** `@clerk/nextjs` v7.0.8–v7.5.x

### What goes wrong

When using `auth.protect()` inside `clerkMiddleware` in a Next.js 16 proxy, unauthenticated users can be redirected to the **current page URL** instead of the sign-in page. Route protection is silently bypassed.

**Root cause:** Clerk resolves the sign-in URL from `process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL`. In the Node.js proxy runtime, `NEXT_PUBLIC_*` variables are inlined into browser bundles at build time. In monorepo setups (pnpm workspaces + Turbo), this env var is not reliably populated in the proxy runtime, so `signInUrl` falls back to `""`. `new URL("", "https://example.com/dashboard")` resolves to the current page, and the redirect loop silently fails.

### Scope

This project is a **standalone Next.js app** (not a monorepo), so the issue is unlikely to affect local development where `next dev` loads `.env` files directly. However, the workaround below is the correct defensive pattern and should be used regardless.

### Workaround (already applied in pattern above)

Do not rely on `auth.protect()` for route-level redirect logic in `proxy.ts`. Instead, check `userId` directly and issue `NextResponse.redirect()` explicitly:

```ts
// Safe — explicit redirect, no env var dependency for the URL
export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }
  }
})
```

`auth.protect()` is still safe to use inside **Server Components and Route Handlers** — the bug is scoped to the proxy runtime only.

---

## Public vs Protected Routes

| Route | Auth required |
|---|---|
| `/` | No |
| `/peak-lists/[slug]` | No (read-only; progress toggle requires auth) |
| `/sign-in` | No |
| `/sign-up` | No |
| `/api/progress` | Yes |
| `/api/*` (any future progress routes) | Yes |

The home page and peak list pages are intentionally public — users can browse without signing in. Only progress-related API routes require a Clerk session.

---

## Environment Variables Required

Add to `.env.local` (values from Clerk dashboard):

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

All keys are already present in `.env.example` with empty values.

---

## `userId` in Server Context

Use `auth()` from `@clerk/nextjs/server` to extract `userId` in Server Components and Route Handlers. It is async in v7:

```ts
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return new Response(null, { status: 401 })
  // pass userId to repository layer
}
```

The `userId` must **never** be sourced from request body or query params — always from the server-side Clerk session.

---

## Sources

- [Next.js 16 — proxy.ts file convention](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
- [Clerk Next.js Quickstart (App Router)](https://clerk.com/docs/nextjs/getting-started/quickstart)
- [clerkMiddleware() API Reference](https://clerk.com/docs/reference/nextjs/clerk-middleware)
- [Clerk GitHub issue #8302 — auth.protect() redirect bug in Next.js 16](https://github.com/clerk/javascript/issues/8302)
- [clerk-nextjs-app-quickstart — official Clerk repo (proxy.ts example)](https://github.com/clerk/clerk-nextjs-app-quickstart/blob/main/proxy.ts)
