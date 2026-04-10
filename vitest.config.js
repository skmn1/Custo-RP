import { defineConfig } from 'vitest/config';

/**
 * Vitest configuration for unit tests (Task 62).
 *
 * Runs in jsdom environment so Web APIs (Response, Headers, URL, etc.)
 * are available without requiring a real browser.
 *
 * Test file locations:
 *  - tests/**\/*.test.js    — unit tests (SW logic, utilities)
 *  - src/**\/*.test.jsx     — component unit tests (if any)
 */
export default defineConfig({
  test: {
    // 'node' avoids jsdom's CJS/ESM interop issues; our SW unit tests only
    // need Response/Headers/URL which are Node 18+ globals — no DOM needed.
    environment: 'node',
    include: ['tests/**/*.test.{js,ts}', 'src/**/*.test.{js,ts,jsx,tsx}'],
    exclude: ['tests/e2e-webkit/**', 'node_modules/**', 'dist/**'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/main.jsx', 'src/**/*.test.{js,jsx}'],
    },
  },
});
