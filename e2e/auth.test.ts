import { test, expect } from '@playwright/test'

test('sign-in page renders Clerk component', async ({ page }) => {
  await page.goto('/sign-in')
  await expect(page).toHaveURL(/\/sign-in/)
  await expect(page.getByRole('main')).toBeVisible()
  // Clerk renders an identifier/email input once the component mounts
  await expect(page.locator('input').first()).toBeVisible({ timeout: 10000 })
})

test('sign-up page renders Clerk component', async ({ page }) => {
  await page.goto('/sign-up')
  await expect(page).toHaveURL(/\/sign-up/)
  await expect(page.getByRole('main')).toBeVisible()
  // Clerk renders an identifier/email input once the component mounts
  await expect(page.locator('input').first()).toBeVisible({ timeout: 10000 })
})
