import { test, expect } from '@playwright/test';

test('home page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Peak Tracker/i);
  await expect(page.getByRole('main')).toBeVisible();
});

test.describe('Home page — peak lists', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('all available peak lists are visible', async ({ page }) => {
    const list = page.getByRole('main').getByRole('list');
    await expect(list.getByRole('listitem')).toHaveCount(2);

    const wainwrights = page.getByRole('link', { name: /wainwrights/i });
    await expect(wainwrights).toBeVisible();
    await expect(wainwrights).toContainText('214 peaks');
    await expect(wainwrights).toHaveAttribute('href', '/peak-lists/wainwrights');

    const munros = page.getByRole('link', { name: /munros/i });
    await expect(munros).toBeVisible();
    await expect(munros).toContainText('282 peaks');
    await expect(munros).toHaveAttribute('href', '/peak-lists/munros');
  });
});
