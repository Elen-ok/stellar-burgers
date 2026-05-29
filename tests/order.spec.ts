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
    
    // МОК СОЗДАНИЯ ЗАКАЗА
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
    
    // Проверяем модальное окно заказа
    const modal = page.locator('#modals');
    await expect(modal).toBeVisible({ timeout: 10000 });
    console.log('✅ Модальное окно заказа открылось');
    
    // Проверяем номер заказа
    const orderNumber = modal.locator('text=/\\d+/').first();
    await expect(orderNumber).toBeVisible();
    const orderNumberText = await orderNumber.textContent();
    console.log(`✅ Номер заказа: ${orderNumberText}`);
    expect(orderNumberText).toBe('12345');
    
    // Закрываем модальное окно
    await modal.locator('button').first().click();
    await expect(modal).toBeHidden();
    console.log('✅ Модальное окно закрыто');
    
    // Проверяем, что конструктор пуст
    await page.waitForTimeout(500);
    const constructorElements = page.locator('.constructor-element');
    await expect(constructorElements).toHaveCount(0);
    console.log('✅ Конструктор очищен');
  });
});
