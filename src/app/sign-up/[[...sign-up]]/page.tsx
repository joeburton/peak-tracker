import type { Metadata } from 'next'
import { SignUp } from '@clerk/nextjs'

export const metadata: Metadata = {
  title: 'Sign Up — Peak Tracker UK',
}

export default function SignUpPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <SignUp />
    </main>
  )
}
