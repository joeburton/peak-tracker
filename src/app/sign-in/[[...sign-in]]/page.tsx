import type { Metadata } from 'next'
import { SignIn } from '@clerk/nextjs'

export const metadata: Metadata = {
  title: 'Sign In — Peak Tracker UK',
}

export default function SignInPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <SignIn />
    </main>
  )
}
