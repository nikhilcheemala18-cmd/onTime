import { expect, test } from '@playwright/test'
import {
  API_URL,
  addMemberViaApi,
  authenticatedPage,
  authHeaders,
  createWorkspaceViaApi,
  makeUser,
  registerViaApi,
} from './helpers.js'

test('member notifications list, unread count, read, and read-all behavior work', async ({ page, request }) => {
  const owner = makeUser('notify-owner')
  const member = makeUser('notify-member')
  const ownerSession = await registerViaApi(request, owner)
  const memberSession = await registerViaApi(request, member)
  const workspace = await createWorkspaceViaApi(request, ownerSession, { name: `Notify Workspace ${Date.now()}` })
  const added = await addMemberViaApi(request, ownerSession, workspace.data._id, memberSession.data.user._id)

  await request.patch(`${API_URL}/api/workspaces/${workspace.data._id}/members/${added.data._id}`, {
    headers: await authHeaders(ownerSession),
    data: { role: 'admin' },
  })

  await authenticatedPage(page, memberSession)
  await expect(page.getByTestId('notifications-button').locator('span')).toHaveText(/[1-9]/)
  await page.getByTestId('notifications-button').click()
  await expect(page.getByTestId('notifications-panel')).toContainText(`You were added to ${workspace.data.name}`)
  await expect(page.getByTestId('notifications-panel')).toContainText('changed to admin')

  await page.getByTestId('notifications-panel').getByText(/changed to admin/i).click()
  await expect(page.getByTestId('notifications-button').locator('span')).toHaveText(/[1-9]/)

  await page.getByRole('button', { name: /read all/i }).click()
  await expect(page.getByTestId('notifications-button').locator('span')).toHaveCount(0)
})
