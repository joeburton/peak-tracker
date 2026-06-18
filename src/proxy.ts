/**
 * proxy.ts — Next.js 16 network boundary entry point.
 *
 * This file replaces middleware.ts (removed in Next.js 16).
 * Clerk authentication and route protection will be configured here in Milestone 2.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/proxy
 * @see CLAUDE.md — Milestone 2: Authentication
 */
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * Pass-through proxy — no auth rules yet.
 * Clerk integration will be added in Milestone 2 once Next.js 16 / proxy.ts
 * compatibility is verified against Clerk documentation.
 */
export function proxy(_request: NextRequest): NextResponse {
  return NextResponse.next()
}
