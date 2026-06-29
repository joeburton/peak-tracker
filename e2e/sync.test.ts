import { test, expect, type Page } from '@playwright/test'
import { setupClerkTestingToken } from '@clerk/testing/playwright'
import path from 'path'

const AUTH_FILE = path.join(__dirname, '.auth/user.json')

// Helper: read the Dexie progress record for a userId via raw IndexedDB.
// Avoids importing Dexie modules into the test file.
async function readDexieProgress(page: Page, userId: string): Promise<Record<string, unknown> | null> {
  return page.evaluate(
    async ([uid]: [string]) => {
      return new Promise<Record<string, unknown> | null>((resolve) => {
        const req = indexedDB.open('peakTracker')
        req.onsuccess = () => {
          const db = req.result
          if (!db.objectStoreNames.contains('progress')) {
            resolve(null)
            return
          }
          const tx = db.transaction('progress', 'readonly')
          const store = tx.objectStore('progress')
          const get = store.get(uid)
          get.onsuccess = () => resolve((get.result as Record<string, unknown>) ?? null)
          get.onerror = () => resolve(null)
        }
        req.onerror = () => resolve(null)
      })
    },
    [userId] as [string],
  )
}

// Helper: get the current Clerk userId from window.Clerk (available after ClerkProvider mounts)
async function getClerkUserId(page: Page): Promise<string | null> {
  return page.evaluate((): string | null => {
    const w = window as unknown as Record<string, unknown>
    const clerk = w['Clerk'] as { user?: { id: string } } | undefined
    return clerk?.user?.id ?? null
  })
}

test.describe('Offline sync round trip', () => {
  // Skip the whole suite if no test credentials are configured.
  // To enable: create a test user in Clerk and set E2E_CLERK_TEST_EMAIL.
  test.skip(
    !process.env['E2E_CLERK_TEST_EMAIL'],
    'E2E_CLERK_TEST_EMAIL not set — create a Clerk test user and set the env var',
  )

  // Use the saved auth state produced by global-setup.ts
  test.use({ storageState: AUTH_FILE })

  test.beforeEach(async ({ context }) => {
    // Adds a context-level route handler that injects the Clerk testing token
    // into every FAPI request, bypassing bot protection during tests.
    await setupClerkTestingToken({ context })
  })

  test('toggles a peak offline, marks dirty, syncs on reconnect, marks clean', async ({
    page,
    context,
  }) => {
    let capturedPutBody: Record<string, unknown> | null = null

    // Intercept the progress API so the test is isolated from MongoDB.
    // GET 404 = server has no existing progress (first sync for this session).
    // PUT = acknowledge the push; return the record with a server-bumped version.
    await page.route('**/api/progress', async (route) => {
      const method = route.request().method()

      if (method === 'GET') {
        await route.fulfill({ status: 404 })
        return
      }

      if (method === 'PUT') {
        const body = JSON.parse(route.request().postData() ?? '{}') as Record<string, unknown>
        capturedPutBody = body
        await route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({
            ...body,
            updatedAt: new Date().toISOString(),
            version: ((body['version'] as number) ?? 0) + 1,
          }),
        })
        return
      }

      await route.continue()
    })

    // Navigate to a peak list — the page is public but ClerkProvider gives us userId
    await page.goto('/peak-lists/wainwrights')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('list', { name: /peak list/i })).toBeVisible({ timeout: 10_000 })

    // Confirm we are authenticated — userId must be available for sync to work
    const userId = await getClerkUserId(page)
    expect(userId).not.toBeNull()

    // --- OFFLINE PHASE ---
    await context.setOffline(true)

    // Toggle the first incomplete peak — fires useToggleProgress → Dexie upsert + markDirty
    const firstToggle = page.getByRole('button', { name: /mark .* as complete/i }).first()
    await expect(firstToggle).toBeVisible({ timeout: 5_000 })
    await firstToggle.click()

    // Give the async Dexie write a moment to settle
    await page.waitForTimeout(200)

    // Verify Dexie has the toggle recorded with dirty: true
    const dirtyRecord = await readDexieProgress(page, userId!)
    expect(dirtyRecord, 'Dexie record should exist after toggling offline').not.toBeNull()
    expect(dirtyRecord?.['dirty'], 'dirty flag must be true while offline').toBe(true)
    const completedAfterToggle = dirtyRecord?.['completedPeakIds'] as string[]
    expect(completedAfterToggle.length, 'at least one peak must be marked complete').toBeGreaterThan(0)

    // --- RECONNECT PHASE ---
    // Restoring connectivity fires the browser 'online' event.
    // useAutoSync detects the offline→online transition and calls runSyncCycle.
    // runSyncCycle sees dirty:true → pushProgress → PUT /api/progress → markClean.
    await context.setOffline(false)

    // Wait for SyncStatus to show "Synced X ago" — confirms the full cycle completed
    await expect(page.getByText(/Synced/), 'SyncStatus must update after a successful sync').toBeVisible(
      { timeout: 15_000 },
    )

    // --- POST-SYNC VERIFICATION ---

    // Dexie must be clean
    const cleanRecord = await readDexieProgress(page, userId!)
    expect(cleanRecord?.['dirty'], 'dirty flag must be false after sync').toBe(false)
    expect(cleanRecord?.['lastSyncedAt'], 'lastSyncedAt must be set after sync').toBeTruthy()

    // The PUT body must match what was in Dexie (no dirty, no extra fields)
    expect(capturedPutBody, 'PUT request must have been made').not.toBeNull()
    expect(capturedPutBody?.['dirty'], 'dirty must NOT be sent to the server').toBeUndefined()
    expect(
      capturedPutBody?.['completedPeakIds'],
      'PUT body must contain the toggled peak IDs',
    ).toEqual(completedAfterToggle)
  })
})
