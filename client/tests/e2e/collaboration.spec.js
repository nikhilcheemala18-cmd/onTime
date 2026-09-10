import { expect, test } from '@playwright/test'
import {
  API_URL,
  authenticatedPage,
  authHeaders,
  createWorkspaceViaApi,
  makeUser,
  registerViaApi,
} from './helpers.js'

test('workspace owner manages members, roles, and non-member access is denied', async ({ browser, page, request }) => {
  const owner = makeUser('owner')
  const member = makeUser('member')
  const outsider = makeUser('outsider')
  const ownerSession = await registerViaApi(request, owner)
  const memberSession = await registerViaApi(request, member)
  const outsiderSession = await registerViaApi(request, outsider)
  const workspace = await createWorkspaceViaApi(request, ownerSession, { name: `Collab Workspace ${Date.now()}` })

  await authenticatedPage(page, ownerSession, `/workspaces/${workspace.data._id}`)
  await page.getByRole('button', { name: /^add$/i }).click()
  await page.getByLabel('User ID').fill(memberSession.data.user._id)
  await page.getByLabel('Role').selectOption('member')
  await page.getByRole('button', { name: /add member/i }).click()

  await expect(page.getByTestId('member-row').filter({ hasText: owner.email })).toBeVisible()
  await expect(page.getByTestId('member-row').filter({ hasText: member.email })).toBeVisible()

  await page.getByTestId('member-row').filter({ hasText: member.email }).getByRole('combobox').selectOption('admin')
  await expect(page.getByTestId('member-row').filter({ hasText: member.email }).getByRole('combobox')).toHaveValue('admin')

  const memberContext = await browser.newContext()
  const memberPage = await memberContext.newPage()
  await authenticatedPage(memberPage, memberSession, `/workspaces/${workspace.data._id}`)
  await expect(memberPage.getByRole('heading', { name: workspace.data.name })).toBeVisible()
  await memberContext.close()

  const outsiderResponse = await request.get(`${API_URL}/api/workspaces/${workspace.data._id}`, {
    headers: await authHeaders(outsiderSession),
  })
  expect(outsiderResponse.status()).toBe(403)

  const ownerMembershipRow = page.getByTestId('member-row').filter({ hasText: owner.email })
  await expect(ownerMembershipRow.getByText(/^owner$/)).toBeVisible()

  page.once('dialog', (dialog) => dialog.accept())
  await page.getByTestId('member-row').filter({ hasText: member.email }).getByRole('button', { name: 'Remove member' }).click()
  await expect(page.getByTestId('member-row').filter({ hasText: member.email })).toHaveCount(0)

  const removedMemberResponse = await request.get(`${API_URL}/api/workspaces/${workspace.data._id}`, {
    headers: await authHeaders(memberSession),
  })
  expect(removedMemberResponse.status()).toBe(403)
})
