# Clerk + Next.js 16 Integration Notes

> Produced for ticket #11 — `[Auth] Verify Clerk + Next.js 16 proxy.ts compatibility`
> Reviewed: June 2026

---

## Verdict: Compatible ✓

`clerkMiddleware()` from `@clerk/nextjs/server` v7.x works with Next.js 16's `proxy.ts`. The auth logic is identical to the Next.js ≤15 `middleware.ts` pattern — only the filename and export name change (see table below).

---

## What Changed in Next.js 16

| | Next.js ≤15 | Next.js 16 |
|---|---|---|
| File name | `src/middleware.ts` | `src/proxy.ts` |
| Runtime | Edge | Node.js (only option) |
| Export name | `middleware` (named) | `proxy` (named) or default |
| Clerk SDK usage | identical | identical |

`middleware.ts` is deprecated in Next.js 16 in favour of `proxy.ts`. The project already has `src/proxy.ts` as a placeholder.

**Export name note:** Next.js 16 accepts either a named `proxy` export or a default export from `proxy.ts`. The existing placeholder uses a named `export function proxy(...)`. The integration pattern below uses `export default clerkMiddleware(...)` — a default export — which is the convention in Clerk's own quickstart. The named export placeholder is replaced, not supplemented, by this default export.

---

## SDK Version

Use `@clerk/nextjs@^7.5.7` (latest stable as of June 2026). Install with:

```bash
npm install @clerk/nextjs
```

> **Note:** The known `auth.protect()` redirect bug (issue #8302, see below) is still open as of v7.5.7. The workaround documented here is required until Clerk ships a fix.

---

## Integration Pattern

### `src/proxy.ts`

The recommended pattern passes `signInUrl` explicitly in the `clerkMiddleware` config (fixing the root cause of issue #8302) **and** uses an explicit `NextResponse.redirect()` as a second layer of defence for the proxy runtime.

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
}, { signInUrl: '/sign-in' })

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api)(.*)',
  ],
}
```

**Why two layers?**

- Passing `signInUrl` in config fixes the root cause — `auth.protect()` no longer relies on `process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL` being available in the proxy runtime.
- The explicit `NextResponse.redirect()` is a defence-in-depth: it does not depend on Clerk's internal URL resolution at all, so it is safe regardless of how the bug manifests.

**Note on `auth` inside `clerkMiddleware`:** The `auth` parameter in the callback is a request-scoped helper provided by Clerk for that specific request. It is distinct from the standalone `auth()` import from `@clerk/nextjs/server` used in Server Components and Route Handlers. Do not import the top-level `auth()` inside the proxy callback.

### `src/app/layout.tsx`

Add `ClerkProvider` inside `<body>`, wrapping the existing `ThemeProvider`. The font variables, `suppressHydrationWarning`, and `ThemeProvider` props must be preserved:

```tsx
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Peak Tracker UK',
  description: 'Track your progress across UK hill and mountain lists — Wainwrights, Munros, and more.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
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
**Affected:** `@clerk/nextjs` v7.0.8–v7.5.7 (still open — see workaround below)

> **When #8302 is resolved:** verify whether passing `signInUrl` in the config alone is sufficient, and whether the explicit `NextResponse.redirect()` in the proxy callback can be simplified to `await auth.protect()`. Update this document after any Clerk release that closes the issue.

### What goes wrong

When using `auth.protect()` inside `clerkMiddleware` in a Next.js 16 proxy, unauthenticated users can be redirected to the **current page URL** instead of the sign-in page. Route protection is silently bypassed.

**Root cause:** Clerk resolves the sign-in redirect URL from `process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL` at proxy startup. In standalone apps running `next dev`, this works because Next.js loads `.env.local` directly before starting the proxy. However, in **monorepo setups** (pnpm workspaces + Turbo), and in some **CI/CD and production environments** (Docker, Vercel) where `NEXT_PUBLIC_*` variables are not explicitly injected as runtime env vars, `process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL` is undefined in the proxy runtime. Clerk then falls back to `signInUrl = ""`, and `new URL("", "https://example.com/dashboard")` resolves to the current page — so the user is silently never redirected.

**Note:** `NEXT_PUBLIC_*` variables are inlined into client-side bundles at build time but must be present in `process.env` at server/proxy runtime. These are two separate mechanisms; the bug is a runtime env availability issue, not a build-time bundling issue.

### Scope

The bug is most reliably triggered in monorepo setups. This project is a standalone Next.js app, so local development is safe. **However, the workaround is still required** — CI environments and platform deployments (Vercel, Docker) may not populate `process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL` in the Node.js proxy runtime in the same way `next dev` does from `.env.local`. Use the two-layer pattern above regardless of deployment target.

### Workaround

The proxy.ts pattern above already applies both fixes. See the proxy.ts snippet above — do not revert to `auth.protect()` alone for the redirect in the proxy until issue #8302 is confirmed closed.

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

All Clerk keys are already present in `.env.example` with empty values. Note that `.env.example` also contains `MONGODB_URI` with a non-empty local default — review all keys before provisioning production.

---

## `userId` in Server Context

Use `auth()` from `@clerk/nextjs/server` (async in v7) to extract `userId`. This is distinct from the request-scoped `auth` helper inside the proxy callback.

**Server Component:**

```tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  // pass userId to repository layer — never source from props or params
}
```

**Route Handler:**

```ts
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return new Response(null, { status: 401 })
  // pass userId to repository layer
}
```

**Important:** `auth.protect()` throws a `NEXT_REDIRECT` that must be `await`ed in both Server Components and Route Handlers — omitting `await` silently swallows the redirect and the protected content renders normally. Use the explicit `auth()` + `redirect()`/`return 401` pattern above to avoid this footgun.

The `userId` must **never** be sourced from request body or query params — always from the server-side Clerk session.

---

## Sources

- [Next.js 16 — proxy.ts file convention](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
- [Clerk Next.js Quickstart (App Router)](https://clerk.com/docs/nextjs/getting-started/quickstart)
- [clerkMiddleware() API Reference](https://clerk.com/docs/reference/nextjs/clerk-middleware)
- [Clerk GitHub issue #8302 — auth.protect() redirect bug in Next.js 16](https://github.com/clerk/javascript/issues/8302)
- [clerk-nextjs-app-quickstart — official Clerk repo (proxy.ts example)](https://github.com/clerk/clerk-nextjs-app-quickstart/blob/main/proxy.ts)
