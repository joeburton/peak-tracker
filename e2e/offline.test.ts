import { test, expect } from '@playwright/test';

// The offline page is tested by navigating directly to /offline.
// Full offline-mode testing (service worker intercepting uncached requests)
// is deferred to Milestone 8 — PWA.
test.describe('Offline fallback page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/offline');
    await page.waitForURL(/localhost:3000/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
  });

  test('displays offline heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /you are offline/i })).toBeVisible();
  });

  test('displays explanatory message', async ({ page }) => {
    await expect(page.getByText(/check your internet connection/i)).toBeVisible();
  });

  test('has a link back to the home page', async ({ page }) => {
    const homeLink = page.getByRole('link', { name: /return to home/i });
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveAttribute('href', '/');
  });

  test('renders within the standard site layout', async ({ page }) => {
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
  });
});
