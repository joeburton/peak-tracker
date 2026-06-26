import { test, expect, type Page } from '@playwright/test';

const VIEWPORTS = [
  { label: 'mobile 375px', width: 375, height: 667 },
  { label: 'tablet 768px', width: 768, height: 1024 },
  { label: 'desktop 1280px', width: 1280, height: 800 },
] as const;

const checkOverflow = (page: Page) =>
  page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );

for (const vp of VIEWPORTS) {
  test.describe(`${vp.label}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test('home page — no horizontal overflow', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByRole('main')).toBeVisible();
      expect(await checkOverflow(page)).toBe(false);
    });

    test('home page — header and footer visible', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByRole('banner')).toBeVisible();
      await expect(page.getByRole('link', { name: /peak tracker uk home/i })).toBeVisible();
      await expect(page.getByRole('contentinfo')).toBeVisible();
    });

    test('home page — main navigation visible', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByRole('navigation', { name: /main navigation/i })).toBeVisible();
    });

    test('offline page — no horizontal overflow', async ({ page }) => {
      await page.goto('/offline');
      await expect(page.getByRole('main')).toBeVisible();
      expect(await checkOverflow(page)).toBe(false);
    });
  });
}

test.describe('mobile 375px — layout specifics', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('header fits within viewport width without overflow', async ({ page }) => {
    await page.goto('/');
    const header = page.getByRole('banner');
    await expect(header).toBeVisible();
    const box = await header.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(375);
  });

  test('home page cards stack in a single column', async ({ page }) => {
    await page.goto('/');
    const listItems = page.getByRole('listitem');
    const count = await listItems.count();
    if (count < 2) return; // skip if no data seeded

    const first = await listItems.nth(0).boundingBox();
    const second = await listItems.nth(1).boundingBox();
    if (!first || !second) return;

    // On mobile, second card should be below (not beside) the first
    expect(second.y).toBeGreaterThan(first.y + first.height - 1);
  });
});

test.describe('tablet 768px — layout specifics', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('home page cards appear in a multi-column grid', async ({ page }) => {
    await page.goto('/');
    const listItems = page.getByRole('listitem');
    const count = await listItems.count();
    if (count < 2) return; // skip if no data seeded

    const first = await listItems.nth(0).boundingBox();
    const second = await listItems.nth(1).boundingBox();
    if (!first || !second) return;

    // On tablet (sm:grid-cols-2), second card should be beside the first
    expect(second.y).toBeCloseTo(first.y, -1);
  });
});
