import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { unauthorizedResponse } from '@/lib/auth'

const isPublicRoute = createRouteMatcher([
  '/',
  '/offline',
  '/smoke-test',
  '/peak-lists',      // bare index — must be listed separately from the wildcard below
  '/peak-lists/(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    const { userId } = await auth()
    if (!userId) {
      // API routes return 401 JSON — fetch clients cannot follow an HTML redirect
      if (request.nextUrl.pathname.startsWith('/api')) {
        return unauthorizedResponse()
      }
      // Page routes redirect to sign-in, preserving the return destination
      const signInUrl = new URL('/sign-in', request.url)
      signInUrl.searchParams.set('redirect_url', request.nextUrl.pathname + request.nextUrl.search)
      return NextResponse.redirect(signInUrl)
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/api(.*)',
  ],
}
