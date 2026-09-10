import { expect, test } from '@playwright/test'
import { authenticatedPage, makeUser, registerViaApi } from './helpers.js'

test('creates, opens, refreshes, updates, and deletes a workspace', async ({ page, request }) => {
  const user = makeUser('workspace')
  const session = await registerViaApi(request, user)
  const workspaceName = `Workspace ${Date.now()}`
  const updatedName = `${workspaceName} Updated`

  await authenticatedPage(page, session)
  await page.getByRole('button', { name: /new workspace/i }).click()
  await page.getByLabel('Name').fill(workspaceName)
  await page.getByLabel('Description').fill('Workspace created from E2E')
  await page.getByRole('button', { name: /^create$/i }).click()

  await expect(page.getByRole('heading', { name: workspaceName })).toBeVisible()
  await page.goto('/app')
  await expect(page.getByTestId('workspace-card').filter({ hasText: workspaceName })).toBeVisible()

  await page.getByTestId('workspace-card').filter({ hasText: workspaceName }).click()
  await page.reload()
  await expect(page.getByRole('heading', { name: workspaceName })).toBeVisible()

  await page.getByRole('button', { name: /^edit$/i }).click()
  await page.getByLabel('Name').fill(updatedName)
  await page.getByRole('button', { name: /^save$/i }).click()
  await expect(page.getByRole('heading', { name: updatedName })).toBeVisible()

  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: /^delete$/i }).click()
  await expect(page).toHaveURL(/\/app$/)
  await expect(page.getByTestId('workspace-card').filter({ hasText: updatedName })).toHaveCount(0)
})
