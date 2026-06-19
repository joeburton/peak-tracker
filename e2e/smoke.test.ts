import { test, expect } from '@playwright/test';

test('home page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Peak Tracker/i);
  await expect(page.getByRole('main')).toBeVisible();
});
