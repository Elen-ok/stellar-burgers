import { Page, BrowserContext } from '@playwright/test';

export async function mockAuth(page: Page, context: BrowserContext) {
  const FAKE_ACCESS_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
  const FAKE_REFRESH_TOKEN = 'fake-refresh-token-test';

  // Подставляем фейковые токены
  await context.addCookies([
    { name: 'accessToken', value: FAKE_ACCESS_TOKEN, domain: 'localhost', path: '/' },
  ]);
  await page.addInitScript((refreshToken) => {
    localStorage.setItem('refreshToken', refreshToken);
  }, FAKE_REFRESH_TOKEN);

  // Мок для проверки пользователя
  await page.route('**/api/auth/user', async (route) => {
    await route.fulfill({
      status: 200,
      json: {
        success: true,
        user: { email: 'test@example.com', name: 'Test User' },
      },
    });
  });

  // Мок для логина
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      json: {
        success: true,
        accessToken: FAKE_ACCESS_TOKEN,
        refreshToken: FAKE_REFRESH_TOKEN,
        user: { email: 'test@example.com', name: 'Test User' },
      },
    });
  });

  // Мок для регистрации
  await page.route('**/api/auth/register', async (route) => {
    await route.fulfill({
      status: 200,
      json: {
        success: true,
        accessToken: FAKE_ACCESS_TOKEN,
        refreshToken: FAKE_REFRESH_TOKEN,
        user: { email: 'test@example.com', name: 'Test User' },
      },
    });
  });

  // Мок для обновления токена
  await page.route('**/api/auth/token', async (route) => {
    await route.fulfill({
      status: 200,
      json: {
        success: true,
        accessToken: FAKE_ACCESS_TOKEN,
        refreshToken: FAKE_REFRESH_TOKEN,
      },
    });
  });
}
