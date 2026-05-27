import { test, expect } from '@playwright/test';

// Тест 1-2: С моками (уже работают)
test.describe('Тесты с моками', () => {
  
  test('Добавление булки', async ({ page }) => {
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
    
    await page.goto('http://localhost:4000');
    await page.waitForSelector('button:has-text("Добавить")');
    await page.locator('button:has-text("Добавить")').first().click();
    console.log('✅ Булка добавлена');
  });
});

// Тест 3-4: С HAR (для модалки и заказа)
test.describe('Тесты с HAR', () => {
  
  test('Модальное окно и заказ', async ({ page }) => {
    await page.routeFromHAR('./tests/hars/full-session.har', {
      update: false,
    });
    
    await page.goto('http://localhost:4000');
    await page.waitForSelector('button:has-text("Добавить")');
    
    // Открываем модалку
    await page.locator('li').filter({ hasText: 'Краторная булка' }).first().click();
    const modal = page.locator('#modals');
    await expect(modal).toBeVisible({ timeout: 5000 });
    console.log('✅ Модальное окно открылось');
    
    await modal.locator('button').first().click();
    await expect(modal).toBeHidden();
    console.log('✅ Закрыто по крестику');
    
    // Создаем заказ
    await page.locator('button:has-text("Добавить")').first().click();
    await page.locator('li').filter({ hasText: '424' }).first()
      .locator('button:has-text("Добавить")').click();
    await page.click('button:has-text("Оформить заказ")');
    
    const orderModal = page.locator('#modals');
    await expect(orderModal).toBeVisible({ timeout: 10000 });
    console.log('✅ Модальное окно заказа открылось');
    
    const orderNumber = orderModal.locator('text=/\\d+/').first();
    await expect(orderNumber).toBeVisible();
    console.log(`✅ Номер заказа: ${await orderNumber.textContent()}`);
  });
});
