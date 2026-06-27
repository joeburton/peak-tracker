import { type NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getDb } from '@/lib/db/mongodb'
import { createProgressRepository } from '@/lib/db/repositories/progress-repository'
import { UserProgressSchema } from '@/lib/validation/schemas'

export const dynamic = 'force-dynamic'

// strict() causes Zod to reject unknown keys — ensures dirty and any other
// client-only fields are never silently accepted and persisted to MongoDB.
const PutBodySchema = UserProgressSchema.omit({ userId: true }).strict()

export async function GET(): Promise<NextResponse> {
  const { userId, error } = await requireAuth()
  if (error) return error

  const db = await getDb()
  const repo = createProgressRepository(db)
  const progress = await repo.findByUserId(userId)

  if (!progress) {
    return NextResponse.json({ error: 'No progress record found' }, { status: 404 })
  }

  return NextResponse.json(progress)
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const { userId, error } = await requireAuth()
  if (error) return error

  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = PutBodySchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 422 },
    )
  }

  const db = await getDb()
  const repo = createProgressRepository(db)

  // Last Write Wins — compare against existing server record before writing.
  // 409 when server is newer: client must pull first and re-evaluate.
  const existing = await repo.findByUserId(userId)
  if (existing) {
    const incomingMs = new Date(parsed.data.updatedAt).getTime()
    const existingMs = new Date(existing.updatedAt).getTime()

    const serverIsNewer =
      incomingMs < existingMs ||
      (incomingMs === existingMs && parsed.data.version <= existing.version)

    if (serverIsNewer) {
      return NextResponse.json(
        {
          error: 'Conflict — server record is newer',
          serverUpdatedAt: existing.updatedAt,
          serverVersion: existing.version,
        },
        { status: 409 },
      )
    }
  }

  // restore() trusts the client-supplied version — the client increments before
  // each local write, so the server must not auto-increment again via upsert().
  const saved = await repo.restore({ userId, ...parsed.data })
  return NextResponse.json(saved)
}
