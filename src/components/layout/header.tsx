import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { SyncStatus } from '@/components/sync-status';
import { AuthNav } from './auth-nav';

export function Header() {
  return (
    <header
      role="banner"
      className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
            aria-label="Peak Tracker UK home"
          >
            Peak Tracker UK
          </Link>
          <nav aria-label="Main navigation">
            <ul className="flex items-center gap-4 text-sm" role="list">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                >
                  Peak Lists
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <SyncStatus />
          <ThemeToggle />
          <AuthNav />
        </div>
      </div>
    </header>
  );
}
