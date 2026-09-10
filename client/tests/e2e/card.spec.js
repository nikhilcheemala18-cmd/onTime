import fs from 'node:fs'
import { expect, test } from '@playwright/test'
import {
  authenticatedPage,
  createBoardViaApi,
  createTextFixture,
  createWorkspaceViaApi,
  makeUser,
  registerViaApi,
} from './helpers.js'

test('manages lists, cards, comments, attachments, and activity', async ({ page, request }, testInfo) => {
  const user = makeUser('card')
  const session = await registerViaApi(request, user)
  const workspace = await createWorkspaceViaApi(request, session, { name: `Card Workspace ${Date.now()}` })
  const board = await createBoardViaApi(request, session, workspace.data._id, { title: `Kanban ${Date.now()}` })
  const firstList = `Todo ${Date.now()}`
  const secondList = `Done ${Date.now()}`
  const renamedList = `${firstList} Updated`
  const firstCard = `Card Alpha ${Date.now()}`
  const secondCard = `Card Beta ${Date.now()}`
  const updatedCard = `${firstCard} Updated`
  const commentText = `Initial comment ${Date.now()}`
  const updatedComment = `${commentText} edited`

  await authenticatedPage(page, session, `/workspaces/${workspace.data._id}/boards/${board.data._id}`)

  await page.getByRole('button', { name: /add list/i }).first().click()
  await page.getByLabel('List name').fill(firstList)
  await page.getByRole('button', { name: /^create$/i }).click()
  await expect(page.getByTestId('list-column').filter({ hasText: firstList })).toBeVisible()

  await page.getByRole('button', { name: /add list/i }).first().click()
  await page.getByLabel('List name').fill(secondList)
  await page.getByRole('button', { name: /^create$/i }).click()
  await expect(page.getByTestId('list-column').nth(0)).toContainText(firstList)
  await expect(page.getByTestId('list-column').nth(1)).toContainText(secondList)

  page.once('dialog', (dialog) => {
    expect(dialog.message()).toContain('List name')
    dialog.accept(renamedList)
  })
  await page.getByTestId('list-column').filter({ hasText: firstList }).getByRole('button', { name: firstList }).click()
  await expect(page.getByTestId('list-column').filter({ hasText: renamedList })).toBeVisible()

  const todo = page.getByTestId('list-column').filter({ hasText: renamedList })
  await todo.getByRole('button', { name: /add card/i }).click()
  await todo.getByPlaceholder('Card title').fill(firstCard)
  await todo.getByRole('button', { name: /^add$/i }).click()
  await expect(todo.getByTestId('card-item').filter({ hasText: firstCard })).toBeVisible()

  await todo.getByRole('button', { name: /add card/i }).click()
  await todo.getByPlaceholder('Card title').fill(secondCard)
  await todo.getByRole('button', { name: /^add$/i }).click()
  await expect(todo.getByTestId('card-item').nth(0)).toContainText(firstCard)
  await expect(todo.getByTestId('card-item').nth(1)).toContainText(secondCard)

  await page.reload()
  await expect(page.getByTestId('list-column').filter({ hasText: renamedList })).toBeVisible()
  await expect(page.getByTestId('card-item').filter({ hasText: firstCard })).toBeVisible()

  await page.getByTestId('card-item').filter({ hasText: firstCard }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: /^edit$/i }).click()
  await page.getByLabel('Title').fill(updatedCard)
  await page.getByLabel('Description').fill('Updated card description from E2E')
  await page.getByRole('button', { name: /save card/i }).click()
  await page.getByRole('button', { name: /^close$/i }).click()

  await page.reload()
  await expect(page.getByTestId('card-item').filter({ hasText: updatedCard })).toBeVisible()
  await page.getByTestId('card-item').filter({ hasText: updatedCard }).click()

  await page.getByLabel('Add comment').fill(commentText)
  await page.getByRole('button', { name: 'Post comment' }).click()
  await expect(page.getByTestId('comment-row').filter({ hasText: commentText })).toBeVisible()

  page.once('dialog', (dialog) => dialog.accept(updatedComment))
  await page.getByTestId('comment-row').filter({ hasText: commentText }).getByRole('button', { name: /^edit$/i }).click()
  await expect(page.getByTestId('comment-row').filter({ hasText: updatedComment })).toBeVisible()

  page.once('dialog', (dialog) => dialog.accept())
  await page.getByTestId('comment-row').filter({ hasText: updatedComment }).getByRole('button', { name: /^delete$/i }).click()
  await expect(page.getByTestId('comment-row').filter({ hasText: updatedComment })).toHaveCount(0)

  const fixture = await createTextFixture(testInfo, 'small-attachment.txt', 'small test attachment')
  await page.locator('input[type="file"]').setInputFiles(fixture)
  await expect(page.getByTestId('attachment-row').filter({ hasText: 'small-attachment.txt' })).toBeVisible()

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download attachment' }).click()
  const download = await downloadPromise
  const downloadedPath = await download.path()
  expect(downloadedPath).toBeTruthy()
  expect(fs.statSync(downloadedPath).size).toBeGreaterThan(0)

  await page.getByRole('button', { name: 'Delete attachment' }).click()
  await expect(page.getByTestId('attachment-row').filter({ hasText: 'small-attachment.txt' })).toHaveCount(0)

  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: /delete card/i }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByTestId('card-item').filter({ hasText: updatedCard })).toHaveCount(0)

  page.once('dialog', (dialog) => dialog.accept())
  await page.getByTestId('list-column').filter({ hasText: secondList }).getByRole('button', { name: 'Delete list' }).click()
  await expect(page.getByTestId('list-column').filter({ hasText: secondList })).toHaveCount(0)

  await page.goto(`/workspaces/${workspace.data._id}`)
  await expect(page.getByTestId('activity-feed')).toContainText(/card deleted|attachment uploaded|comment/i)
  await expect(page.getByTestId('activity-feed')).not.toContainText(user.password)
  await expect(page.getByTestId('activity-feed')).not.toContainText('Bearer ')
})
