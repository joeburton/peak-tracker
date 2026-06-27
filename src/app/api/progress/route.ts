import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getDb } from '@/lib/db/mongodb'
import { createProgressRepository } from '@/lib/db/repositories/progress-repository'

export const dynamic = 'force-dynamic'

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
