import { clerkSetup, clerk } from '@clerk/testing/playwright'
import { chromium, type FullConfig } from '@playwright/test'
import path from 'path'
import fs from 'fs'

export const AUTH_FILE = path.join(__dirname, '.auth/user.json')

export default async function globalSetup(config: FullConfig) {
  const email = process.env['E2E_CLERK_TEST_EMAIL']

  if (!email) {
    console.log(
      '[global-setup] E2E_CLERK_TEST_EMAIL not set — skipping Clerk auth setup. ' +
        'Sync E2E tests will be skipped.',
    )
    return
  }

  // Fetches a Clerk testing token from the Backend API and stores it in
  // process.env.CLERK_TESTING_TOKEN for use by setupClerkTestingToken in tests.
  await clerkSetup()

  const baseURL = (config.projects[0]?.use?.baseURL as string | undefined) ?? 'http://localhost:3000'
  const browser = await chromium.launch()
  const context = await browser.newContext({ baseURL })
  const page = await context.newPage()

  try {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Signs in via the Clerk Backend API (creates a short-lived sign-in token
    // for the given email address and completes auth without UI interaction).
    // Requires CLERK_SECRET_KEY and the user to exist in the Clerk instance.
    await clerk.signIn({ page, emailAddress: email })

    fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true })
    await context.storageState({ path: AUTH_FILE })

    console.log('[global-setup] Clerk auth state saved to', AUTH_FILE)
  } finally {
    await browser.close()
  }
}
