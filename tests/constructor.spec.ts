import { test, expect } from '@playwright/test';

test.describe('Конструктор бургера', () => {
  
  test.beforeEach(async ({ page, context }) => {
    // Моки авторизации
    await context.addCookies([
      { name: 'accessToken', value: 'Bearer mock-token', domain: 'localhost', path: '/' }
    ]);
    await page.addInitScript(() => {
      localStorage.setItem('refreshToken', 'mock-refresh');
      localStorage.setItem('accessToken', 'Bearer mock-token');
    });

    // Моки API
    await page.route('**/api/auth/user', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, user: { email: 'test@example.com', name: 'TestUser' } })
      });
    });
    
    await page.route('**/api/ingredients', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: [
            { _id: "1", name: "Краторная булка N-200i", type: "bun", price: 1255 },
            { _id: "2", name: "Биокотлета", type: "main", price: 424 }
          ]
        })
      });
    });
    
    await page.route('**/api/orders', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ success: true, order: { number: 12345 } })
        });
      }
    });
    
    await page.goto('http://localhost:4000');
    await page.waitForSelector('button:has-text("Добавить")', { timeout: 15000 });
  });

  test('1. Добавление булки в конструктор', async ({ page }) => {
    await page.locator('button:has-text("Добавить")').first().click();
    console.log('✅ Булка добавлена');
  });

  test('2. Добавление начинки в конструктор', async ({ page }) => {
    const ingredientCard = page.locator('li').filter({ hasText: '424' }).first();
    await ingredientCard.locator('button:has-text("Добавить")').click();
    console.log('✅ Начинка добавлена');
  });

  test('3. Открытие страницы ингредиента', async ({ page }) => {
    const firstImage = page.locator('img').first();
    await firstImage.click();
    
    await expect(page).toHaveURL(/\/ingredients\/\d+/, { timeout: 5000 });
    await expect(page.locator('text=Краторная булка N-200i').first()).toBeVisible();
    console.log('✅ Страница ингредиента открыта');
    
    await page.goBack();
  });

  test('4. Создание заказа и очистка конструктора', async ({ page }) => {
    await page.locator('button:has-text("Добавить")').first().click();
    const ingredientCard = page.locator('li').filter({ hasText: '424' }).first();
    await ingredientCard.locator('button:has-text("Добавить")').click();
    
    await page.waitForTimeout(500);
    await page.click('button:has-text("Оформить заказ")');
    
    await expect(page.locator('text=12345')).toBeVisible({ timeout: 10000 });
    console.log('✅ Номер заказа 12345 отображается');
    
    const closeButton = page.locator('#modals button').first();
    await closeButton.click();
    console.log('✅ Модальное окно закрыто');
    
    await page.waitForTimeout(500);
    const constructorElements = page.locator('.constructor-element');
    await expect(constructorElements).toHaveCount(0);
    console.log('✅ Конструктор очищен');
  });
});
