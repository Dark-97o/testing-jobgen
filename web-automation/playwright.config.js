// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests sequentially with 1 worker to prevent opening multiple browser windows simultaneously */
  fullyParallel: false,
  workers: 1,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. */
  use: {
    storageState: 'auth.json',
    trace: 'on-first-retry',
    slowMo: 500, // slow down each action by 500ms so you can watch tests run
  },

  /* Configure projects */
  projects: [
    {
      name: 'chromium',
      // Exclude the standalone crawler from the default suite
      testIgnore: ['**/crawl-and-click-audit.spec.js'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'crawler',
      testMatch: ['**/crawl-and-click-audit.spec.js'],
      use: {
        ...devices['Desktop Chrome'],
        slowMo: 0,           // disable global slowMo — crawler runs as fast as possible
        actionTimeout: 10000,
      },
    },
  ],
});
