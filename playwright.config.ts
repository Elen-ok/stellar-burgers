import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Чтобы тесты не мешали друг другу
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1, // Один воркер для последовательного выполнения
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4000',
    reuseExistingServer: true,
  },
});
