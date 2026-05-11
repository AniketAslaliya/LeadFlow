import { defineConfig, devices } from '@playwright/test'

/** Captures images under `docs/screenshots/` for the root README. Run: `npm run capture:screenshots` (dev server on :5173). */
export default defineConfig({
  testDir: 'e2e',
  testMatch: '**/readme-screenshots.spec.js',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5173',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
})
