import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

type AuthSuccess = { userId: string; error: null }
type AuthFailure = { userId: null; error: NextResponse }

/**
 * Call at the top of every progress route handler.
 * Pattern:
 *   const { userId, error } = await requireAuth()
 *   if (error) return error
 *   // userId is string from here
 */
export async function requireAuth(): Promise<AuthSuccess | AuthFailure> {
  const { userId } = await auth()
  if (!userId) {
    return {
      userId: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }
  return { userId, error: null }
}
