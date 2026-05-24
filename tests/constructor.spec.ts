import { test, expect } from '@playwright/test';

test.describe('Страница конструктора бургера', () => {
  test('1. Добавление ингредиента из списка в конструктор', async ({ page }) => {
    // Мок для ингредиентов
    await page.route('**/api/ingredients', async (route) => {
      await route.fulfill({
        json: {
          success: true,
          data: [
            { _id: 'bun1', name: 'Краторная булка N-200i', type: 'bun', price: 1255 },
            { _id: 'main1', name: 'Биокотлета из марсианской Магнолии', type: 'main', price: 424 },
          ],
        },
      });
    });

    await page.goto('http://localhost:4000');
    await page.waitForTimeout(2000);
    
    const ingredientName = await page.locator('h3').first().textContent();
    await page.locator('button:has-text("Добавить")').first().click();
    await page.waitForTimeout(500);
    
    const constructorItem = page.locator('.constructor-element').first();
    await expect(constructorItem).toBeVisible();
    await expect(constructorItem).toContainText(ingredientName?.replace('Булки', '') || '');
    console.log('✅ Ингредиент добавлен');
  });

  test('2. Создание заказа с реальной регистрацией', async ({ page }) => {
    const testEmail = `testuser_${Date.now()}@example.com`;
    const testPassword = 'Password123!';
    const testName = 'Test User';

    await page.goto('http://localhost:4000/register');
    await page.fill('input[name="name"]', testName);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button:has-text("Зарегистрироваться")');
    await page.waitForTimeout(3000);
    
    if (page.url().includes('/login')) {
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', testPassword);
      await page.click('button:has-text("Войти")');
      await page.waitForTimeout(3000);
    }
    
    await page.goto('http://localhost:4000');
    await page.waitForTimeout(2000);
    
    await page.locator('button:has-text("Добавить")').first().click();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Добавить")').nth(3).click();
    await page.waitForTimeout(500);
    
    await page.click('text=Оформить заказ');
    await page.waitForSelector('text=идентификатор заказа', { timeout: 30000 });
    
    const orderNumber = page.locator('h2.text_type_digits-large');
    const orderText = await orderNumber.textContent();
    console.log(`✅ ЗАКАЗ СОЗДАН! Номер: ${orderText}`);
    expect(Number(orderText)).toBeGreaterThan(0);
    
    await page.locator('#modals button').first().click();
    await expect(page.locator('#modals > div')).toBeHidden();
    await expect(page.locator('.constructor-element')).toHaveCount(0);
  });
});
