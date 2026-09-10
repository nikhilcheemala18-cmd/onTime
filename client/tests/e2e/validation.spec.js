import { expect, test } from '@playwright/test'
import {
  API_URL,
  authHeaders,
  createWorkspaceViaApi,
  makeUser,
  registerViaApi,
} from './helpers.js'

test('important validation and authorization failures are surfaced', async ({ page, request }) => {
  const owner = makeUser('validation-owner')
  const outsider = makeUser('validation-outsider')
  const ownerSession = await registerViaApi(request, owner)
  const outsiderSession = await registerViaApi(request, outsider)
  const workspace = await createWorkspaceViaApi(request, ownerSession, { name: `Validation Workspace ${Date.now()}` })

  await page.goto('/register')
  await page.getByLabel('Email').fill('not-an-email')
  await page.getByRole('button', { name: /create account/i }).click()
  await expect(page.getByLabel('Email')).toHaveJSProperty('validity.valid', false)

  await page.getByLabel('Name').fill('A')
  await page.getByLabel('Email').fill(owner.email)
  await page.getByLabel('Password').fill('weak')
  await page.getByRole('button', { name: /create account/i }).click()
  await expect(page.getByText(/name must be at least/i)).toBeVisible()
  await expect(page.getByText(/upper, lower, number/i)).toBeVisible()

  const invalidQuery = await request.get(`${API_URL}/api/boards?workspaceId=not-an-id`, {
    headers: await authHeaders(ownerSession),
  })
  expect(invalidQuery.status()).toBe(400)

  const unauthenticated = await request.get(`${API_URL}/api/workspaces/${workspace.data._id}`)
  expect(unauthenticated.status()).toBe(401)

  const forbidden = await request.get(`${API_URL}/api/workspaces/${workspace.data._id}`, {
    headers: await authHeaders(outsiderSession),
  })
  expect(forbidden.status()).toBe(403)
})
