import { test, expect } from '@playwright/test';

test.describe('Создание заказа', () => {

  test('Создание заказа авторизованным пользователем', async ({ page, context }) => {
    // ===== МОКИ АВТОРИЗАЦИИ =====
    await context.addCookies([
      { name: 'accessToken', value: 'Bearer mock-token', domain: 'localhost', path: '/' }
    ]);
    await page.addInitScript(() => {
      localStorage.setItem('refreshToken', 'mock-refresh');
      localStorage.setItem('accessToken', 'Bearer mock-token');
    });

    // ===== МОКИ API =====
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
          body: JSON.stringify({
            success: true,
            order: { number: 12345 }
          })
        });
      }
    });
    
    await page.goto('http://localhost:4000');
    await page.waitForSelector('button:has-text("Добавить")', { timeout: 15000 });
    
    // Собираем бургер
    await page.locator('button:has-text("Добавить")').first().click();
    const ingredientCard = page.locator('li').filter({ hasText: '424' }).first();
    await ingredientCard.locator('button:has-text("Добавить")').click();
    
    await page.waitForTimeout(500);
    
    // Оформляем заказ
    await page.click('button:has-text("Оформить заказ")');
    
    // Ждем появления номера заказа
    await expect(page.locator('text=12345')).toBeVisible({ timeout: 10000 });
    console.log('✅ Номер заказа 12345 отображается');
    
    // Находим и закрываем модальное окно (клик на крестик)
    const closeButton = page.locator('#modals button').first();
    await closeButton.click();
    console.log('✅ Модальное окно закрыто');
    
    // Ждем, пока модальное окно закроется
    await page.waitForTimeout(1000);
    
    // Проверяем, что конструктор пуст
    const constructorElements = page.locator('.constructor-element');
    await expect(constructorElements).toHaveCount(0);
    console.log('✅ Конструктор очищен');
  });
});
