// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for ESS PWA cross-browser testing (Task 62).
 *
 * Run:
 *   npm run test:pw           — all browsers
 *   npm run test:pw:webkit    — WebKit (Safari) only
 *   npm run test:pw:chrome    — Chromium only
 *
 * The tests live under tests/e2e-webkit/ and are scoped to PWA / offline
 * behaviours that differ across browsers (especially Safari / iOS).
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e-webkit',
  testMatch: '**/*.spec.js',

  /* Run tests in parallel */
  fullyParallel: false, // keep sequential to avoid race conditions on shared dev server

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,

  /* Reporter to use */
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never', outputFolder: 'playwright-report' }]]
    : 'list',

  /* Shared settings for all projects */
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        // Safari blocks SW in non-secure contexts on some versions
        // Use the --unsafely-treat-insecure-origin-as-secure flag for localhost
        launchOptions: {
          args: [],
        },
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    /* Mobile viewports */
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
  ],

  /* Run the dev server before tests — skip in CI (server started by workflow) */
  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
