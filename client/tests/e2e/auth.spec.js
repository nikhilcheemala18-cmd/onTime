import { expect, test } from '@playwright/test'
import { API_URL, makeUser, registerViaApi } from './helpers.js'

test('protected routes require authentication', async ({ page }) => {
  await page.goto('/app')
  await expect(page).toHaveURL(/\/login$/)
})

test('registers a unique user and reaches the application', async ({ page }) => {
  const user = makeUser('register')

  await page.goto('/register')
  await page.getByLabel('Name').fill(user.name)
  await page.getByLabel('Email').fill(user.email)
  await page.getByLabel('Password').fill(user.password)
  await page.getByRole('button', { name: /create account/i }).click()

  await expect(page).toHaveURL(/\/app$/)
  await expect(page.getByRole('heading', { name: 'Choose a workspace' })).toBeVisible()
})

test('rejects invalid credentials', async ({ page, request }) => {
  const user = makeUser('invalid-login')
  await registerViaApi(request, user)

  await page.goto('/login')
  await page.getByLabel('Email').fill(user.email)
  await page.getByLabel('Password').fill('WrongPass123!')
  await page.getByRole('button', { name: /^sign in$/i }).click()

  await expect(page.getByText('Could not sign in')).toBeVisible()
})

test('login, persisted session after reload, and logout work', async ({ page, request }) => {
  const user = makeUser('login')
  await registerViaApi(request, user)

  await page.goto('/login')
  await page.getByLabel('Email').fill(user.email)
  await page.getByLabel('Password').fill(user.password)
  await page.getByRole('button', { name: /^sign in$/i }).click()

  await expect(page).toHaveURL(/\/app$/)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Choose a workspace' })).toBeVisible()

  await page.getByRole('button', { name: 'Log out' }).click()
  await expect(page).toHaveURL(/\/login$/)

  const response = await request.post(`${API_URL}/api/auth/login`, {
    data: { email: user.email, password: 'bad-password' },
  })
  expect(response.status()).toBe(401)
})
