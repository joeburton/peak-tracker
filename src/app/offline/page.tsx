import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-3 text-2xl font-semibold tracking-tight">You are offline</h1>
      <p className="mb-6 text-muted-foreground">
        Please check your internet connection and try again.
      </p>
      <Link
        href="/"
        className="text-sm font-medium underline underline-offset-4 hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
      >
        Return to home
      </Link>
    </div>
  );
}
