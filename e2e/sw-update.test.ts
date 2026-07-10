import { expect, test } from '@playwright/test';

// The SW is disabled in development (NODE_ENV=development), so we can only
// verify the banner is absent by default. Full update simulation (register
// SW v1, deploy v2, detect waiting state) runs in production mode and is
// deferred to the offline/PWA E2E suite in #80.
test.describe('SW update prompt', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('update banner is not visible on initial load', async ({ page }) => {
    await expect(
      page.getByRole('region', { name: /app update available/i })
    ).not.toBeVisible();
  });

  test('reload button is absent when no update is waiting', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^reload$/i })).not.toBeVisible();
  });
});
