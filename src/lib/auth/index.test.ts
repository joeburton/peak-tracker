import { describe, it, expect, vi, beforeEach } from 'vitest'
import { requireAuth } from './index'

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
    const body = await result.error!.json()

    expect(body).toEqual({ error: 'Unauthorized' })
  })

  it('userId is typed as string after null-checking error', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_abc' })

    const result = await requireAuth()
    if (result.error) return

    // TypeScript narrows userId to string here — compile-time guarantee
    const userId: string = result.userId
    expect(userId).toBe('user_abc')
  })
})
