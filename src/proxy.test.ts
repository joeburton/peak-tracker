import { describe, it, expect, vi, beforeAll } from 'vitest'
import { NextRequest } from 'next/server'

// The auth callback signature passed to clerkMiddleware
type AuthFn = () => Promise<{ userId: string | null }>
type ProxyHandler = (
  auth: AuthFn,
  request: NextRequest
) => Promise<Response | undefined>

// Capture the handler that proxy.ts passes to clerkMiddleware so we can
// invoke it directly in tests without a full Next.js / Clerk runtime.
let handler: ProxyHandler

vi.mock('@clerk/nextjs/server', () => ({
  clerkMiddleware: (fn: ProxyHandler) => {
    handler = fn
    return vi.fn()
  },
  // Minimal path-to-regexp approximation — sufficient for the patterns in proxy.ts:
  //   '/'                → exact match
  //   '/offline'         → exact match
  //   '/smoke-test'      → exact match
  //   '/peak-lists'      → exact match (bare index)
  //   '/peak-lists/(.*)' → /peak-lists/ + anything
  //   '/sign-in(.*)'     → /sign-in + anything (including bare /sign-in)
  //   '/sign-up(.*)'     → /sign-up + anything
  createRouteMatcher: (patterns: string[]) => {
    const regexes = patterns.map(
      (p) => new RegExp('^' + p.replace(/\(\.\*\)/g, '.*') + '$')
    )
    return (req: NextRequest) =>
      regexes.some((r) => r.test(req.nextUrl.pathname))
  },
}))

// Import proxy.ts after the mock is registered so clerkMiddleware is called
// with our mock and `handler` is captured before any test runs.
beforeAll(async () => {
  await import('./proxy')
  if (!handler) {
    throw new Error('proxy.ts did not call clerkMiddleware — handler was not captured')
  }
})

const req = (path: string) =>
  new NextRequest(new URL(path, 'https://example.com'))

const authed = (): Promise<{ userId: string }> =>
  Promise.resolve({ userId: 'user_test_123' })

const unauthed = (): Promise<{ userId: null }> =>
  Promise.resolve({ userId: null })

describe('proxy — protected routes', () => {
  it('returns 401 JSON for unauthenticated API requests', async () => {
    const res = await handler(unauthed, req('/api/progress'))
    expect(res).toBeDefined()
    expect(res!.status).toBe(401)
  })

  it('allows authenticated requests to /api/progress through', async () => {
    const res = await handler(authed, req('/api/progress'))
    expect(res).toBeUndefined()
  })

  it('redirects unauthenticated page requests to /sign-in with redirect_url', async () => {
    const res = await handler(unauthed, req('/dashboard'))
    expect(res).toBeDefined()
    expect(res!.status).toBe(307)
    const location = res!.headers.get('location')
    expect(location).not.toBeNull()
    const url = new URL(location!)
    expect(url.pathname).toBe('/sign-in')
    expect(url.searchParams.get('redirect_url')).toBe('/dashboard')
  })

  it('preserves query string in redirect_url', async () => {
    const res = await handler(unauthed, req('/dashboard?tab=stats&sort=height'))
    expect(res).toBeDefined()
    expect(res!.status).toBe(307)
    const location = res!.headers.get('location')
    expect(location).not.toBeNull()
    const url = new URL(location!)
    expect(url.pathname).toBe('/sign-in')
    expect(url.searchParams.get('redirect_url')).toBe('/dashboard?tab=stats&sort=height')
  })
})

describe('proxy — public routes', () => {
  it('allows unauthenticated requests to / through', async () => {
    const res = await handler(unauthed, req('/'))
    expect(res).toBeUndefined()
  })

  it('allows unauthenticated requests to /offline through', async () => {
    const res = await handler(unauthed, req('/offline'))
    expect(res).toBeUndefined()
  })

  it('allows unauthenticated requests to /smoke-test through', async () => {
    const res = await handler(unauthed, req('/smoke-test'))
    expect(res).toBeUndefined()
  })

  it('allows unauthenticated requests to /peak-lists through', async () => {
    const res = await handler(unauthed, req('/peak-lists'))
    expect(res).toBeUndefined()
  })

  it('allows unauthenticated requests to /peak-lists/wainwrights through', async () => {
    const res = await handler(unauthed, req('/peak-lists/wainwrights'))
    expect(res).toBeUndefined()
  })

  it('allows unauthenticated requests to /sign-in through', async () => {
    const res = await handler(unauthed, req('/sign-in'))
    expect(res).toBeUndefined()
  })

  it('allows unauthenticated requests to /sign-in/sso-callback through', async () => {
    const res = await handler(unauthed, req('/sign-in/sso-callback'))
    expect(res).toBeUndefined()
  })

  it('allows unauthenticated requests to /sign-up through', async () => {
    const res = await handler(unauthed, req('/sign-up'))
    expect(res).toBeUndefined()
  })
})
