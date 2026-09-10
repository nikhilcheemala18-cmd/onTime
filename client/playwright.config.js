import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.E2E_BASE_URL || 'http://localhost:5173'
const apiURL = process.env.E2E_API_URL || 'http://localhost:5000'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: {
    timeout: 8_000,
  },
  fullyParallel: false,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  webServer: [
    {
      command: 'node src/server.js',
      cwd: '../server',
      url: `${apiURL}/api/health`,
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command: 'node node_modules/vite/bin/vite.js --host localhost',
      url: baseURL,
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})

