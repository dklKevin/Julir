import { defineConfig, devices } from '@playwright/test'

const PORT = 4180

// Browser layout checks that jsdom cannot do (it has no layout engine).
export default defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      // iPhone 16 Pro viewport, rendered with Chromium so CI only needs one browser
      name: 'iphone-16-pro',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 402, height: 874 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: `vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    // Stop Vite's server.open from launching a browser
    env: { BROWSER: 'none' },
  },
})
