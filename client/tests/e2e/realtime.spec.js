import { expect, test } from '@playwright/test'
import {
  API_URL,
  addMemberViaApi,
  authenticatedPage,
  authHeaders,
  createListViaApi,
  createWorkspaceViaApi,
  makeUser,
  registerViaApi,
} from './helpers.js'

test('workspace room updates board, list, card, comment, and notification UI without refresh', async ({ browser, page, request }) => {
  const owner = makeUser('rt-owner')
  const member = makeUser('rt-member')
  const ownerSession = await registerViaApi(request, owner)
  const memberSession = await registerViaApi(request, member)
  const workspace = await createWorkspaceViaApi(request, ownerSession, { name: `Realtime Workspace ${Date.now()}` })
  const membership = await addMemberViaApi(request, ownerSession, workspace.data._id, memberSession.data.user._id)
  const memberContext = await browser.newContext()
  const memberPage = await memberContext.newPage()

  await authenticatedPage(memberPage, memberSession, `/workspaces/${workspace.data._id}`)
  await expect(memberPage.getByRole('heading', { name: workspace.data.name })).toBeVisible()

  await authenticatedPage(page, ownerSession, `/workspaces/${workspace.data._id}`)
  const boardTitle = `Realtime Board ${Date.now()}`
  await page.getByRole('button', { name: /new board/i }).click()
  await page.getByLabel('Title').fill(boardTitle)
  await page.getByRole('button', { name: /^create$/i }).click()

  await expect(memberPage.getByTestId('board-card').filter({ hasText: boardTitle })).toBeVisible()
  const board = await request.get(`${API_URL}/api/boards?workspaceId=${workspace.data._id}`, {
    headers: await authHeaders(ownerSession),
  })
  const boardJson = await board.json()
  const createdBoard = boardJson.data.find((item) => item.title === boardTitle)

  await memberPage.goto(`/workspaces/${workspace.data._id}/boards/${createdBoard._id}`)
  const listName = `Realtime List ${Date.now()}`
  await createListViaApi(request, ownerSession, createdBoard._id, listName)
  await expect(memberPage.getByTestId('list-column').filter({ hasText: listName })).toBeVisible()

  const listResponse = await request.get(`${API_URL}/api/lists?boardId=${createdBoard._id}`, {
    headers: await authHeaders(ownerSession),
  })
  const lists = await listResponse.json()
  const list = lists.data.find((item) => item.name === listName)
  const cardTitle = `Realtime Card ${Date.now()}`
  const cardResponse = await request.post(`${API_URL}/api/cards`, {
    headers: await authHeaders(ownerSession),
    data: { listId: list._id, title: cardTitle },
  })
  expect(cardResponse.ok()).toBeTruthy()
  await expect(memberPage.getByTestId('card-item').filter({ hasText: cardTitle })).toBeVisible()

  const cardJson = await cardResponse.json()
  const commentText = `Realtime comment ${Date.now()}`
  const commentResponse = await request.post(`${API_URL}/api/comments`, {
    headers: await authHeaders(ownerSession),
    data: { cardId: cardJson.data._id, content: commentText },
  })
  expect(commentResponse.ok()).toBeTruthy()

  await memberPage.getByTestId('card-item').filter({ hasText: cardTitle }).click()
  await expect(memberPage.getByTestId('comment-row').filter({ hasText: commentText })).toBeVisible()

  await request.patch(`${API_URL}/api/workspaces/${workspace.data._id}/members/${membership.data._id}`, {
    headers: await authHeaders(ownerSession),
    data: { role: 'admin' },
  })
  await expect(memberPage.getByTestId('notifications-button').locator('span')).toHaveText(/[1-9]/)

  await memberContext.close()
})
