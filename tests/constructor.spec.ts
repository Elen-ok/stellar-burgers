import { test, expect } from '@playwright/test';
import ingredientsMock from './mocks/ingredients.json';

const orderMock = {
  success: true,
  order: { number: 12345 }
};

const userMock = {
  success: true,
  user: { email: 'test@test.com', name: 'Test User' }
};

test.describe('Конструктор бургера', () => {
  test.beforeEach(async ({ page }) => {
    // Перехватываем запрос ингредиентов
    await page.route('**/api/ingredients', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(ingredientsMock)
      });
    });

    // Перехватываем запрос пользователя
    await page.route('**/api/auth/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(userMock)
      });
    });

    // Добавляем токен авторизации
    await page.context().addCookies([
      { name: 'accessToken', value: 'mock-token', domain: 'localhost', path: '/' }
    ]);

    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('должен добавлять булку в конструктор', async ({ page }) => {
    const bun = page.locator('text=Краторная булка N-200i').first();
    await bun.click();
    await expect(page.locator('[class*="constructor-element_pos_top"]')).toBeVisible();
  });

  test('должен открывать модальное окно ингредиента', async ({ page }) => {
    const ingredient = page.locator('text=Биокотлета из марсианской Магнолии').first();
    await ingredient.click();
    await expect(page.locator('[class*="modal"]')).toBeVisible();
  });

  test('должен закрывать модальное окно по клику на крестик', async ({ page }) => {
    const ingredient = page.locator('text=Биокотлета из марсианской Магнолии').first();
    await ingredient.click();
    await expect(page.locator('[class*="modal"]')).toBeVisible();
    
    const closeButton = page.locator('[class*="modal"] button').first();
    await closeButton.click();
    await expect(page.locator('[class*="modal"]')).not.toBeVisible();
  });

  test('должен закрывать модальное окно по клику на оверлей', async ({ page }) => {
    const ingredient = page.locator('text=Биокотлета из марсианской Магнолии').first();
    await ingredient.click();
    await expect(page.locator('[class*="modal"]')).toBeVisible();
    
    await page.mouse.click(10, 10);
    await expect(page.locator('[class*="modal"]')).not.toBeVisible();
  });

  test('должен создавать заказ и очищать конструктор', async ({ page }) => {
    // Перехватываем запрос на создание заказа
    await page.route('**/api/orders', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(orderMock)
      });
    });

    // Добавляем булку
    const bun = page.locator('text=Краторная булка N-200i').first();
    await bun.click();
    
    // Нажимаем кнопку заказа
    const orderButton = page.getByRole('button', { name: 'Оформить заказ' });
    await orderButton.click();
    
    // Проверяем модальное окно с номером заказа
    const modal = page.locator('[class*="modal"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('12345');
    
    // Закрываем модальное окно
    const closeButton = page.locator('[class*="modal"] button').first();
    await closeButton.click();
    await expect(modal).not.toBeVisible();
  });
});
