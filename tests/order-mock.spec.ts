import { test, expect } from '@playwright/test';

test.describe('Создание заказа с моками', () => {
  
  test('Создание заказа авторизованным пользователем (полные моки)', async ({ page, context }) => {
    // ===== 1. МОКИ АВТОРИЗАЦИИ =====
    await context.addCookies([
      {
        name: 'accessToken',
        value: 'Bearer mock-token',
        domain: 'localhost',
        path: '/',
      },
    ]);
    
    await page.addInitScript(() => {
      localStorage.setItem('refreshToken', 'mock-refresh');
      localStorage.setItem('accessToken', 'Bearer mock-token');
      localStorage.setItem('user', JSON.stringify({ email: 'test@example.com', name: 'TestUser' }));
    });
    
    // ===== 2. МОКИ API =====
    // Мокаем проверку пользователя
    await page.route('**/api/auth/user', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          user: { email: 'test@example.com', name: 'TestUser' }
        })
      });
    });
    
    // Мокаем обновление токена
    await page.route('**/api/auth/token', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          accessToken: 'Bearer mock-token',
          refreshToken: 'mock-refresh'
        })
      });
    });
    
    // Мокаем ингредиенты
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
    
    // Мокаем создание заказа (ЭТО ГЛАВНОЕ!)
    await page.route('**/api/orders', async route => {
      console.log('🔵 Перехвачен запрос на создание заказа');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          order: { number: 12345 }
        })
      });
    });
    
    // ===== 3. ОТКРЫВАЕМ СТРАНИЦУ =====
    await page.goto('http://localhost:4000');
    await page.waitForSelector('button:has-text("Добавить")', { timeout: 15000 });
    console.log('✅ Страница загружена');
    
    // ===== 4. СОБИРАЕМ БУРГЕР =====
    await page.locator('button:has-text("Добавить")').first().click();
    console.log('✅ Булка добавлена');
    
    const ingredientCard = page.locator('li').filter({ hasText: '424' }).first();
    await ingredientCard.locator('button:has-text("Добавить")').click();
    console.log('✅ Начинка добавлена');
    
    await page.waitForTimeout(500);
    
    // ===== 5. ОФОРМЛЯЕМ ЗАКАЗ =====
    await page.click('button:has-text("Оформить заказ")');
    console.log('🔵 Клик на Оформить заказ');
    
    // ===== 6. ПРОВЕРЯЕМ МОДАЛЬНОЕ ОКНО ЗАКАЗА =====
    const modal = page.locator('#modals');
    await expect(modal).toBeVisible({ timeout: 10000 });
    console.log('✅ Модальное окно заказа открылось');
    
    // ===== 7. ПРОВЕРЯЕМ НОМЕР ЗАКАЗА =====
    const orderNumber = modal.locator('text=/\\d+/').first();
    await expect(orderNumber).toBeVisible();
    const orderNumberText = await orderNumber.textContent();
    console.log(`✅ Номер заказа: ${orderNumberText}`);
    expect(orderNumberText).toBe('12345');
    
    // ===== 8. ЗАКРЫВАЕМ МОДАЛЬНОЕ ОКНО =====
    const closeButton = modal.locator('button').first();
    await closeButton.click();
    await expect(modal).toBeHidden({ timeout: 5000 });
    console.log('✅ Модальное окно закрыто по крестику');
    
    // ===== 9. ПРОВЕРЯЕМ, ЧТО КОНСТРУКТОР ПУСТ =====
    await page.waitForTimeout(500);
    const constructorElements = page.locator('.constructor-element');
    await expect(constructorElements).toHaveCount(0);
    console.log('✅ Конструктор очищен');
  });
});
