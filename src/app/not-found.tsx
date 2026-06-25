import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
      <p className="text-sm font-medium text-muted-foreground mb-2">404</p>
      <h1 className="text-3xl font-bold tracking-tight mb-4">Page not found</h1>
      <p className="text-muted-foreground mb-8">
        The peak list you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        Back to peak lists
      </Link>
    </div>
  );
}
