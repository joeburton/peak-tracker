import { test, expect, type Page } from '@playwright/test';

const VIEWPORTS = [
  { label: 'mobile 375px', width: 375, height: 667 },
  { label: 'tablet 768px', width: 768, height: 1024 },
  { label: 'desktop 1280px', width: 1280, height: 800 },
] as const;

// Clerk's dev-browser handshake is a JS-based redirect (not HTTP), so
// waitUntil: 'networkidle' on goto alone is not sufficient — the goto resolves
// when Clerk's external page is idle, before the JS redirect back fires.
// Explicitly waiting for our domain after goto handles this correctly.
const goto = async (page: Page, url: string) => {
  await page.goto(url);
  await page.waitForURL(/localhost:3000/, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
};

const checkOverflow = (page: Page) =>
  page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );

for (const vp of VIEWPORTS) {
  test.describe(`${vp.label}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test('home page — no horizontal overflow', async ({ page }) => {
      await goto(page, '/');
      await expect(page.getByRole('main')).toBeVisible();
      expect(await checkOverflow(page)).toBe(false);
    });

    test('home page — header and footer visible', async ({ page }) => {
      await goto(page, '/');
      await expect(page.getByRole('banner')).toBeVisible();
      await expect(page.getByRole('link', { name: /peak tracker uk home/i })).toBeVisible();
      await expect(page.getByRole('contentinfo')).toBeVisible();
    });

    test('home page — main navigation visible', async ({ page }) => {
      await goto(page, '/');
      await expect(page.getByRole('navigation', { name: /main navigation/i })).toBeVisible();
    });

    test('offline page — no horizontal overflow', async ({ page }) => {
      await goto(page, '/offline');
      // Check a concrete element on the offline page rather than the generic
      // <main> landmark, which is provided by the layout but can be missed when
      // Clerk's handshake redirect is still in flight.
      await expect(page.getByRole('heading', { name: /you are offline/i })).toBeVisible();
      expect(await checkOverflow(page)).toBe(false);
    });
  });
}

// Viewport-specific layout assertions run on chromium only — Mobile Chrome
// device emulation (Pixel 5 deviceScaleFactor/isMobile) interferes with how
// the browser interprets explicit viewport overrides and Tailwind breakpoints.
test.describe('mobile 375px — layout specifics', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('header fits within viewport width without overflow', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Device emulation interferes with explicit viewport override');
    await goto(page, '/');
    const header = page.getByRole('banner');
    await expect(header).toBeVisible();
    const box = await header.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(375);
  });

  test('home page cards stack in a single column', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Device emulation interferes with explicit viewport override');
    await goto(page, '/');
    // Scope to <main> to exclude header nav list items
    const listItems = page.getByRole('main').getByRole('listitem');
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

  test('home page cards appear in a multi-column grid', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Device emulation interferes with explicit viewport override');
    await goto(page, '/');
    // Scope to <main> to exclude header nav list items
    const listItems = page.getByRole('main').getByRole('listitem');
    const count = await listItems.count();
    if (count < 2) return; // skip if no data seeded

    const first = await listItems.nth(0).boundingBox();
    const second = await listItems.nth(1).boundingBox();
    if (!first || !second) return;

    // On tablet (sm:grid-cols-2), second card should be beside the first
    expect(second.y).toBeCloseTo(first.y, -1);
  });
});
