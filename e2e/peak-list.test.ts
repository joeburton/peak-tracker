import { test, expect } from '@playwright/test';

// Search, filter, and sort work for anonymous users — progress toggling and
// statistics are covered separately (progress.test.ts) since they require auth.
test.describe('Peak list — search, filter, sort', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/peak-lists/wainwrights');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('list', { name: /peak list/i })).toBeVisible({ timeout: 10_000 });
  });

  test('search narrows the list to matching peak names', async ({ page }) => {
    await page.getByRole('searchbox', { name: /search peaks by name/i }).fill('Scafell');

    await expect(page.getByText(/showing 2 of 214 peaks/i)).toBeVisible();
    const items = page.getByRole('list', { name: /peak list/i }).getByRole('listitem');
    await expect(items).toHaveCount(2);
    await expect(page.getByText('Scafell Pike')).toBeVisible();
  });

  test('shows the empty state when no peak matches the search', async ({ page }) => {
    await page.getByRole('searchbox', { name: /search peaks by name/i }).fill('Not A Real Peak');

    await expect(page.getByText(/no peaks match your current filters/i)).toBeVisible();
  });

  test('filtering by region narrows the list to that region', async ({ page }) => {
    await page.getByRole('combobox', { name: /filter by region/i }).click();
    await page.getByRole('option', { name: 'Northern Fells' }).click();

    await expect(page.getByText(/showing 24 of 214 peaks/i)).toBeVisible();
  });

  test('filtering to completed shows the empty state for a signed-out user', async ({ page }) => {
    await page.getByRole('combobox', { name: /filter by completion/i }).click();
    await page.getByRole('option', { name: 'Completed' }).click();

    await expect(page.getByText(/no peaks match your current filters/i)).toBeVisible();
  });

  test('sorting by height (high to low) orders the tallest peak first', async ({ page }) => {
    await page.getByRole('combobox', { name: /sort order/i }).click();
    await page.getByRole('option', { name: 'Height (high → low)' }).click();

    const firstItem = page
      .getByRole('list', { name: /peak list/i })
      .getByRole('listitem')
      .first();
    await expect(firstItem).toContainText('Scafell Pike');
  });

  test('sorting by name (Z to A) orders the last peak alphabetically first', async ({ page }) => {
    await page.getByRole('combobox', { name: /sort order/i }).click();
    await page.getByRole('option', { name: 'Name Z → A' }).click();

    const firstItem = page
      .getByRole('list', { name: /peak list/i })
      .getByRole('listitem')
      .first();
    await expect(firstItem).toContainText('Yoke');
  });
});
