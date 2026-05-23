import { test, expect } from '@playwright/test';

test.describe('Конструктор бургера', () => {
  test.beforeEach(async ({ page }) => {
    // Мокаем запрос ингредиентов
    await page.route('**/api/ingredients', async (route) => {
      await route.fulfill({ path: './e2e/mocks/ingredients.json' });
    });

    // Подставляем токен авторизации
    await page.addInitScript(() => {
      document.cookie = 'accessToken=test-token; path=/';
      localStorage.setItem('refreshToken', 'test-refresh-token');
    });

    await page.goto('/');
  });

  test('должен открыть главную страницу', async ({ page }) => {
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('должен добавить булку в конструктор', async ({ page }) => {
    // Находим булку по тексту и кликаем
    const bun = page.getByText('Краторная булка N-200i').first();
    await bun.click();

    // Проверяем, что булка добавилась (появилась в конструкторе)
    await expect(page.getByText('Краторная булка N-200i (верх)')).toBeVisible();
  });
});
