export function Footer() {
  return (
    <footer role="contentinfo" className="border-t py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Peak Tracker UK
        </p>
      </div>
    </footer>
  );
}
