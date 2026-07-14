import { test, expect } from '@playwright/test';
import { clerk, setupClerkTestingToken } from '@clerk/testing/playwright';

// Clerk's dev-browser handshake is a JS redirect — goto resolves on Clerk's
// external domain before the redirect back fires. waitForURL ensures we are
// back on localhost before any assertions run.
test('sign-in page renders Clerk component', async ({ page }) => {
  await page.goto('/sign-in');
  await page.waitForURL(/localhost:3000\/sign-in/, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('main')).toBeVisible();
  // Clerk renders an identifier/email input once the component mounts
  await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 10000 });
});

test('sign-up page renders Clerk component', async ({ page }) => {
  await page.goto('/sign-up');
  await page.waitForURL(/localhost:3000\/sign-up/, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('main')).toBeVisible();
  // Clerk renders an identifier/email input once the component mounts
  await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 10000 });
});

test.describe('Sign in and sign out', () => {
  // Skip if no test credentials are configured.
  // To enable: create a test user in Clerk and set E2E_CLERK_TEST_EMAIL.
  test.skip(
    !process.env['E2E_CLERK_TEST_EMAIL'],
    'E2E_CLERK_TEST_EMAIL not set — create a Clerk test user and set the env var'
  );

  test.beforeEach(async ({ context }) => {
    await setupClerkTestingToken({ context });
  });

  test('signing in reveals the account menu; signing out reverts to the sign-in link', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Signed out: header shows a Sign in link, no account button
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();

    await clerk.signIn({ page, emailAddress: process.env['E2E_CLERK_TEST_EMAIL']! });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Signed in: account button replaces the sign-in link
    await expect(page.getByRole('button', { name: /open user menu/i })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByRole('link', { name: /sign in/i })).not.toBeVisible();

    await clerk.signOut({ page });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Signed out again: sign-in link is back, account button is gone
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /open user menu/i })).not.toBeVisible();
  });
});
