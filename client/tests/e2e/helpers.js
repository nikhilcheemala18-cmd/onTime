import fs from 'node:fs'
import { expect } from '@playwright/test'

export const API_URL = process.env.E2E_API_URL || 'http://localhost:5000'
export const SESSION_KEY = 'rtm.session'

export function uniqueEmail(prefix = 'user') {
  return `${prefix}.${Date.now()}.${Math.random().toString(16).slice(2)}@example.com`
}

export function makeUser(prefix = 'user') {
  return {
    name: `Test ${prefix}`,
    email: uniqueEmail(prefix),
    password: 'TestUser123!',
  }
}

export async function registerViaApi(request, user = makeUser()) {
  const response = await request.post(`${API_URL}/api/auth/register`, {
    data: user,
  })
  expect(response.ok()).toBeTruthy()
  return response.json()
}

export async function loginViaApi(request, credentials) {
  const response = await request.post(`${API_URL}/api/auth/login`, {
    data: {
      email: credentials.email,
      password: credentials.password,
    },
  })
  expect(response.ok()).toBeTruthy()
  return response.json()
}

export async function authHeaders(session) {
  return {
    Authorization: `Bearer ${session.data.token}`,
  }
}

export async function createWorkspaceViaApi(request, session, payload = {}) {
  const response = await request.post(`${API_URL}/api/workspaces`, {
    headers: await authHeaders(session),
    data: {
      name: payload.name || `Workspace ${Date.now()}`,
      description: payload.description || 'Created by Playwright',
    },
  })
  expect(response.ok()).toBeTruthy()
  return response.json()
}

export async function createBoardViaApi(request, session, workspaceId, payload = {}) {
  const response = await request.post(`${API_URL}/api/boards`, {
    headers: await authHeaders(session),
    data: {
      title: payload.title || `Board ${Date.now()}`,
      description: payload.description || 'Created by Playwright',
      workspaceId,
    },
  })
  expect(response.ok()).toBeTruthy()
  return response.json()
}

export async function createListViaApi(request, session, boardId, name = `List ${Date.now()}`) {
  const response = await request.post(`${API_URL}/api/lists`, {
    headers: await authHeaders(session),
    data: { boardId, name },
  })
  expect(response.ok()).toBeTruthy()
  return response.json()
}

export async function createCardViaApi(request, session, listId, payload = {}) {
  const response = await request.post(`${API_URL}/api/cards`, {
    headers: await authHeaders(session),
    data: {
      listId,
      title: payload.title || `Card ${Date.now()}`,
      description: payload.description || 'Created by Playwright',
    },
  })
  expect(response.ok()).toBeTruthy()
  return response.json()
}

export async function addMemberViaApi(request, session, workspaceId, userId, role = 'member') {
  const response = await request.post(`${API_URL}/api/workspaces/${workspaceId}/members`, {
    headers: await authHeaders(session),
    data: { userId, role },
  })
  expect(response.ok()).toBeTruthy()
  return response.json()
}

export async function deleteWorkspaceViaApi(request, session, workspaceId) {
  await request.delete(`${API_URL}/api/workspaces/${workspaceId}`, {
    headers: await authHeaders(session),
  })
}

export async function signInPage(page, session) {
  await page.addInitScript(
    ({ key, value }) => window.localStorage.setItem(key, JSON.stringify(value)),
    {
      key: SESSION_KEY,
      value: session.data,
    },
  )
}

export async function authenticatedPage(page, session, path = '/app') {
  await signInPage(page, session)
  await page.goto(path)
}

export async function createTextFixture(testInfo, name = 'attachment.txt', content = 'Playwright attachment fixture') {
  const filePath = testInfo.outputPath(name)
  fs.writeFileSync(filePath, content)
  return filePath
}
