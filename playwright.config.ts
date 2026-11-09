import { defineConfig } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  // The target is a shared, free public host that occasionally hiccups.
  // Retries in CI absorb infrastructure noise; real failures still fail every attempt.
  retries: isCI ? 2 : 0,
  // Be a polite client of a public service.
  workers: 4,
  timeout: 30_000,
  reporter: isCI
    ? [['github'], ['list'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://restful-booker.herokuapp.com',
    extraHTTPHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  },
  projects: [
    // Runs first. If the API is down, the main suite is skipped instead of
    // producing dozens of misleading failures.
    { name: 'health-check', testMatch: /health\.setup\.ts/ },
    { name: 'api', dependencies: ['health-check'] },
  ],
});
