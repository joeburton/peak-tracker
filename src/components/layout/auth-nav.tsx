'use client';

import Link from 'next/link';
import { useAuth, UserButton } from '@clerk/nextjs';

export function AuthNav() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;

  if (isSignedIn) {
    return <UserButton />;
  }

  return (
    <Link
      href="/sign-in"
      className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
    >
      Sign in
    </Link>
  );
}
