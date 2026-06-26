import { test, expect } from '@playwright/test'

// Clerk's dev-browser handshake is a JS redirect — goto resolves on Clerk's
// external domain before the redirect back fires. waitForURL ensures we are
// back on localhost before any assertions run.
test('sign-in page renders Clerk component', async ({ page }) => {
  await page.goto('/sign-in')
  await page.waitForURL(/localhost:3000\/sign-in/, { timeout: 15000 })
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('main')).toBeVisible()
  // Clerk renders an identifier/email input once the component mounts
  await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 10000 })
})

test('sign-up page renders Clerk component', async ({ page }) => {
  await page.goto('/sign-up')
  await page.waitForURL(/localhost:3000\/sign-up/, { timeout: 15000 })
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('main')).toBeVisible()
  // Clerk renders an identifier/email input once the component mounts
  await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 10000 })
})
