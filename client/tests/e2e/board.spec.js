import { expect, test } from '@playwright/test'
import {
  authenticatedPage,
  createWorkspaceViaApi,
  deleteWorkspaceViaApi,
  makeUser,
  registerViaApi,
} from './helpers.js'

test('creates, opens, refreshes, updates, and deletes a board in the selected workspace', async ({ page, request }) => {
  const user = makeUser('board')
  const session = await registerViaApi(request, user)
  const workspace = await createWorkspaceViaApi(request, session, { name: `Board Workspace ${Date.now()}` })
  const boardTitle = `Roadmap ${Date.now()}`
  const updatedTitle = `${boardTitle} Updated`

  await authenticatedPage(page, session, `/workspaces/${workspace.data._id}`)
  await page.getByRole('button', { name: /new board/i }).click()
  await page.getByLabel('Title').fill(boardTitle)
  await page.getByLabel('Description').fill('Board created from E2E')
  await page.getByRole('button', { name: /^create$/i }).click()

  await expect(page.getByRole('heading', { name: boardTitle })).toBeVisible()
  await expect(page.locator('aside').getByRole('link', { name: boardTitle, exact: true })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { name: boardTitle })).toBeVisible()

  await page.getByRole('button', { name: /edit board/i }).click()
  await page.getByLabel('Title').fill(updatedTitle)
  await page.getByRole('button', { name: /^save$/i }).click()
  await expect(page.getByRole('heading', { name: updatedTitle })).toBeVisible()

  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: /^delete$/i }).click()
  await expect(page).toHaveURL(new RegExp(`/workspaces/${workspace.data._id}$`))
  await expect(page.getByTestId('board-card').filter({ hasText: updatedTitle })).toHaveCount(0)

  await deleteWorkspaceViaApi(request, session, workspace.data._id)
})
