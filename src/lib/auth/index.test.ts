import { describe, it, expect, vi, beforeEach } from 'vitest'
import { requireAuth, unauthorizedResponse, getServerUserId } from './index'

const mockAuth = vi.fn()

vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
}))

beforeEach(() => {
  mockAuth.mockReset()
})

describe('requireAuth', () => {
  it('returns userId when session is authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_test_123' })

    const result = await requireAuth()

    expect(result.userId).toBe('user_test_123')
    expect(result.error).toBeNull()
  })

  it('returns a 401 response when session has no userId', async () => {
    mockAuth.mockResolvedValue({ userId: null })

    const result = await requireAuth()

    expect(result.userId).toBeNull()
    expect(result.error).not.toBeNull()
    expect(result.error!.status).toBe(401)
  })

  it('401 response body contains error message', async () => {
    mockAuth.mockResolvedValue({ userId: null })

    const result = await requireAuth()

    expect(result.error).not.toBeNull()
    const body = await result.error!.json()
    expect(body).toEqual({ error: 'Unauthorized' })
  })

  it('returns a 500 response when auth() throws', async () => {
    mockAuth.mockRejectedValue(new Error('Missing CLERK_SECRET_KEY'))

    const result = await requireAuth()

    expect(result.userId).toBeNull()
    expect(result.error).not.toBeNull()
    expect(result.error!.status).toBe(500)
  })

  it('userId is typed as string after null-checking error', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_abc' })

    const result = await requireAuth()
    if (result.error) return

    const userId: string = result.userId
    expect(userId).toBe('user_abc')
  })

  it('unauthorizedResponse produces a 401 with the expected body', async () => {
    const response = unauthorizedResponse()
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body).toEqual({ error: 'Unauthorized' })
  })
})

describe('getServerUserId', () => {
  it('returns userId as a string for an authenticated session', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_server_123' })

    const userId = await getServerUserId()

    expect(userId).toBe('user_server_123')
  })

  it('throws when called without an authenticated session', async () => {
    mockAuth.mockResolvedValue({ userId: null })

    await expect(getServerUserId()).rejects.toThrow(
      'getServerUserId() called without an authenticated session. ' +
        'Ensure the route is protected by proxy.ts before calling this utility.'
    )
  })

  it('throws a clean error when auth() itself throws, preserving the cause', async () => {
    const cause = new Error('Missing CLERK_SECRET_KEY')
    mockAuth.mockRejectedValue(cause)

    const err = await getServerUserId().catch((e: unknown) => e)

    expect(err).toBeInstanceOf(Error)
    expect((err as Error).message).toBe('Authentication service unavailable.')
    expect((err as Error).cause).toBe(cause)
  })
})
