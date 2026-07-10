import { type Page, expect, test } from '@playwright/test';

// SW-dependent tests require a production build (npm run start) where the
// service worker is active.  In dev mode (npm run dev) the SW is disabled
// via next.config.ts and pages cannot be served from cache.
//
// The CI Playwright config uses `npm run start`, so these tests run
// automatically on every PR.  To run locally: build (`npm run build`),
// start (`npm run start`), then set CI=true when invoking Playwright.
const swEnabled = !!process.env['CI'];

async function waitForSwActive(page: Page) {
  await page.waitForFunction(() => Boolean(navigator.serviceWorker?.controller), {
    timeout: 10_000,
  });
}

// ---------------------------------------------------------------------------
// SW-cached page loading
// ---------------------------------------------------------------------------

test.describe('SW-cached page loading', () => {
  test.skip(!swEnabled, 'SW is disabled in dev mode — requires production build (CI=true)');

  test.beforeEach(async ({ page }) => {
    // First visit: SW installs and activates via clientsClaim, but the
    // navigation response itself is not yet intercepted by the SW.
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await waitForSwActive(page);
    // Second visit: SW is now the controller and intercepts this navigation,
    // fetching and caching the HTML response in 'pages-cache'.
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('home page loads from SW cache when offline', async ({ page, context }) => {
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('link', { name: /wainwrights/i })).toBeVisible();
  });

  test('peak list page loads from SW cache when offline', async ({ page, context }) => {
    // SW is active from beforeEach — this navigation is intercepted and cached
    await page.goto('/peak-lists/wainwrights');
    await page.waitForLoadState('networkidle');

    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('list', { name: /peak list/i })).toBeVisible({
      timeout: 10_000,
    });
  });
});

// ---------------------------------------------------------------------------
// SW offline navigation fallback
// ---------------------------------------------------------------------------

test.describe('SW offline navigation fallback', () => {
  test.skip(!swEnabled, 'SW is disabled in dev mode — requires production build (CI=true)');

  test.beforeEach(async ({ page }) => {
    // Ensure SW is installed and active before the test navigates offline
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await waitForSwActive(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('navigating to an uncached route offline shows the offline fallback page', async ({
    page,
    context,
  }) => {
    await context.setOffline(true);

    // Navigate to a route the SW has not cached — SW fallback serves /offline
    await page.goto('/this-route-does-not-exist', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: /you are offline/i })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Offline fallback page (no SW required)
// ---------------------------------------------------------------------------
// The full offline → Dexie dirty → reconnect → sync → clean cycle is
// covered by e2e/sync.test.ts.  No duplication here.

test.describe('Offline fallback page (direct navigation)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/offline');
    await page.waitForLoadState('networkidle');
  });

  test('offline page is reachable and displays the correct heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /you are offline/i })).toBeVisible();
  });

  test('offline page has a link back to the home page', async ({ page }) => {
    await expect(page.getByRole('link', { name: /return to home/i })).toHaveAttribute('href', '/');
  });
});
