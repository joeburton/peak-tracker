import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('WCAG 2.1 AA — home page', () => {
  test('zero axe violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL(/localhost:3000/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('main')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});


test.describe('WCAG 2.1 AA — offline page', () => {
  test('zero axe violations', async ({ page }) => {
    await page.goto('/offline');
    await page.waitForURL(/localhost:3000/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /you are offline/i })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
