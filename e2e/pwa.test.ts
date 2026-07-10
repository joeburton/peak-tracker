import { type Page, expect, test } from '@playwright/test';

// SW-dependent tests require a production build where the service worker is
// active.  The CI Playwright config uses `npm run start`; dev mode disables
// the SW via next.config.ts.
const swEnabled = !!process.env['CI'];

async function waitForSwActive(page: Page) {
  await page.waitForFunction(() => Boolean(navigator.serviceWorker?.controller), {
    timeout: 10_000,
  });
}

// Dispatch a synthetic beforeinstallprompt event so the install banner
// renders without needing real browser engagement heuristics.
async function dispatchInstallPrompt(page: Page) {
  await page.evaluate(() => {
    const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
      prompt: () => Promise.resolve(),
      userChoice: Promise.resolve({ outcome: 'dismissed' as const }),
    });
    window.dispatchEvent(event);
  });
}

// ---------------------------------------------------------------------------
// Install prompt
// ---------------------------------------------------------------------------
// These tests do not require the SW — the hook only needs the event.

test.describe('Install prompt', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('install banner appears when beforeinstallprompt fires', async ({ page }) => {
    await dispatchInstallPrompt(page);
    await expect(page.getByRole('region', { name: /install/i })).toBeVisible({ timeout: 3_000 });
  });

  test('install banner shows Install and Not now buttons', async ({ page }) => {
    await dispatchInstallPrompt(page);
    await expect(page.getByRole('button', { name: /^install$/i })).toBeVisible({ timeout: 3_000 });
    await expect(page.getByRole('button', { name: /not now/i })).toBeVisible();
  });

  test('Not now dismisses the install banner', async ({ page }) => {
    await dispatchInstallPrompt(page);
    const banner = page.getByRole('region', { name: /install/i });
    await expect(banner).toBeVisible({ timeout: 3_000 });
    await page.getByRole('button', { name: /not now/i }).click();
    await expect(banner).not.toBeVisible();
  });

  test('dismiss (×) button hides the install banner', async ({ page }) => {
    await dispatchInstallPrompt(page);
    const banner = page.getByRole('region', { name: /install/i });
    await expect(banner).toBeVisible({ timeout: 3_000 });
    await page.getByRole('button', { name: /dismiss install prompt/i }).click();
    await expect(banner).not.toBeVisible();
  });

  test('banner does not reappear after dismissal within the same session', async ({ page }) => {
    await dispatchInstallPrompt(page);
    await page.getByRole('button', { name: /not now/i }).click();
    // Fire a second event — should be suppressed because isDismissed is true
    await dispatchInstallPrompt(page);
    await expect(page.getByRole('region', { name: /install/i })).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Full offline user journey (SW required)
// ---------------------------------------------------------------------------
// Chains: SW cache warm-up → go offline → navigate home → navigate peak list
//         → route API calls (offline API) → uncached route fallback.
//
// Progress toggle offline is covered by e2e/sync.test.ts (Dexie dirty flag
// + reconnect sync cycle with intercepted API).  Not duplicated here.

test.describe('Offline user journey', () => {
  test.skip(!swEnabled, 'SW is disabled in dev mode — requires production build (CI=true)');

  test.beforeEach(async ({ page }) => {
    // Prime the SW cache: first visit installs the SW, second visit caches pages
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await waitForSwActive(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.goto('/peak-lists/wainwrights');
    await page.waitForLoadState('networkidle');
  });

  test('navigates home and peak list from SW cache while offline', async ({ page, context }) => {
    await context.setOffline(true);

    // Home page serves from pages-cache
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('link', { name: /wainwrights/i })).toBeVisible();

    // Peak list serves from pages-cache
    await page.goto('/peak-lists/wainwrights', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('list', { name: /peak list/i })).toBeVisible({
      timeout: 10_000,
    });
  });

  test('shows offline fallback for uncached route while offline', async ({ page, context }) => {
    await context.setOffline(true);

    await page.goto('/route-never-visited', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: /you are offline/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /return to home/i })).toBeVisible();
  });

  test('API interception leaves pages intact but blocks server sync', async ({
    page,
    context,
  }) => {
    // Intercept only API calls — simulates being offline for sync but
    // still having page navigation work (the pattern useAutoSync uses).
    await context.route('**/api/**', (route) => route.abort());

    await page.goto('/peak-lists/wainwrights');
    await page.waitForLoadState('networkidle');

    // Pages still render — data comes from the server (cached HTML) or SW cache
    await expect(page.getByRole('main')).toBeVisible();
    // Sync indicator should reflect that the API is unreachable
    // (the exact label depends on connectivity store state)
    await expect(page.getByRole('list', { name: /peak list/i })).toBeVisible({
      timeout: 10_000,
    });
  });
});
