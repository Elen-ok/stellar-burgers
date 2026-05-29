import { test, expect } from '@playwright/test';

test.describe('Создание заказа', () => {
  
  test('Создание заказа с реальной авторизацией', async ({ page }) => {
    // 1. Реальная регистрация пользователя
    await page.goto('http://localhost:4000/register');
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'password123';
    
    await page.fill('input[name="name"]', 'TestUser');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button:has-text("Зарегистрироваться")');
    
    await page.waitForURL('http://localhost:4000/');
    await page.waitForSelector('button:has-text("Добавить")', { timeout: 15000 });
    console.log('✅ Пользователь зарегистрирован и авторизован');
    
    // 2. Мокаем ингредиенты для скорости
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
    
    // Мокаем создание заказа (возвращаем фиксированный номер)
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
    
    await page.reload();
    await page.waitForSelector('button:has-text("Добавить")', { timeout: 15000 });
    
    // 3. Собираем бургер
    await page.locator('button:has-text("Добавить")').first().click();
    const ingredientCard = page.locator('li').filter({ hasText: '424' }).first();
    await ingredientCard.locator('button:has-text("Добавить")').click();
    
    await page.waitForTimeout(500);
    
    // 4. Оформляем заказ
    await page.click('button:has-text("Оформить заказ")');
    
    // 5. Проверяем модальное окно заказа
    const modal = page.locator('#modals');
    await expect(modal).toBeVisible({ timeout: 10000 });
    console.log('✅ Модальное окно заказа открылось');
    
    // 6. Проверяем номер заказа
    const orderNumber = modal.locator('text=/\\d+/').first();
    await expect(orderNumber).toBeVisible();
    const orderNumberText = await orderNumber.textContent();
    console.log(`✅ Номер заказа: ${orderNumberText}`);
    expect(orderNumberText).toBe('12345');
    
    // 7. Закрываем модальное окно (клик на крестик)
    await modal.locator('button').first().click();
    await expect(modal).toBeHidden({ timeout: 5000 });
    console.log('✅ Модальное окно закрыто по крестику');
    
    // 8. Проверяем, что конструктор пуст
    await page.waitForTimeout(500);
    const constructorElements = page.locator('.constructor-element');
    await expect(constructorElements).toHaveCount(0);
    console.log('✅ Конструктор очищен');
  });
});
