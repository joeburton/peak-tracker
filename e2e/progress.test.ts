import { test, expect } from '@playwright/test';
import { setupClerkTestingToken } from '@clerk/testing/playwright';
import path from 'path';

const AUTH_FILE = path.join(__dirname, '.auth/user.json');

// Toggling progress and the resulting statistics update are covered here as a
// real end-to-end round trip (Dexie -> sync -> MongoDB -> server-rendered
// statistics on reload) rather than mocked, since Statistics is computed
// server-side per request (CLAUDE.md) and does not update client-side without
// a fresh render. The offline/dirty-flag mechanics of the sync itself are
// covered separately in sync.test.ts.
test.describe('Progress toggle updates statistics', () => {
  test.skip(
    !process.env['E2E_CLERK_TEST_EMAIL'],
    'E2E_CLERK_TEST_EMAIL not set — create a Clerk test user and set the env var'
  );

  test.use({ storageState: AUTH_FILE });

  test.beforeEach(async ({ context }) => {
    await setupClerkTestingToken({ context });
  });

  test('marking a peak complete increments the completed count; undoing it restores the count', async ({
    page,
  }) => {
    await page.goto('/peak-lists/wainwrights');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('list', { name: /peak list/i })).toBeVisible({ timeout: 10_000 });

    const completedStat = page
      .locator('section[aria-label="Wainwrights progress statistics"] div', {
        has: page.locator('dt', { hasText: /^completed$/ }),
      })
      .locator('dd');

    const initialCompleted = Number(await completedStat.innerText());

    const toggleButton = page.getByRole('button', { name: /mark .* as complete/i }).first();
    await expect(toggleButton).toBeVisible({ timeout: 10_000 });
    const ariaLabel = await toggleButton.getAttribute('aria-label');
    const peakName = ariaLabel!.replace(/^Mark /, '').replace(/ as complete$/, '');

    await toggleButton.click();
    await expect(page.getByText(/Synced/)).toBeVisible({ timeout: 15_000 });

    try {
      await page.reload();
      await page.waitForLoadState('networkidle');

      await expect(completedStat).toHaveText(String(initialCompleted + 1));
    } finally {
      // Undo — keep the test account's progress unchanged for future runs,
      // even if the assertion above failed.
      const undoButton = page.getByRole('button', { name: `Mark ${peakName} as incomplete` });
      await undoButton.click();
      await expect(page.getByText(/Synced/)).toBeVisible({ timeout: 15_000 });
    }

    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(completedStat).toHaveText(String(initialCompleted));
  });
});
