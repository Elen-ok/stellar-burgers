import { test, expect } from '@playwright/test';

test.describe('Конструктор бургера', () => {
  
  // ТЕСТ 1: Добавление булки
  test('Добавление булки в конструктор', async ({ page, context }) => {
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
    
    await page.route('**/api/auth/user', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, user: { email: 'test@example.com', name: 'TestUser' } })
      });
    });
    
    await context.addCookies([
      { name: 'accessToken', value: 'Bearer mock', url: 'http://localhost:4000' }
    ]);
    
    await page.goto('http://localhost:4000');
    await page.waitForSelector('button:has-text("Добавить")', { timeout: 20000 });
    await page.locator('button:has-text("Добавить")').first().click();
    console.log('✅ Булка добавлена');
  });

  // ТЕСТ 2: Добавление начинки
  test('Добавление начинки в конструктор', async ({ page, context }) => {
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
    
    await page.route('**/api/auth/user', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, user: { email: 'test@example.com', name: 'TestUser' } })
      });
    });
    
    await context.addCookies([
      { name: 'accessToken', value: 'Bearer mock', url: 'http://localhost:4000' }
    ]);
    
    await page.goto('http://localhost:4000');
    await page.waitForSelector('button:has-text("Добавить")', { timeout: 20000 });
    
    const ingredientCard = page.locator('li').filter({ hasText: '424' }).first();
    await ingredientCard.locator('button:has-text("Добавить")').click();
    console.log('✅ Начинка добавлена');
  });

  // ТЕСТ 3: Страница ингредиента
  test('Открытие страницы ингредиента при клике на картинку', async ({ page }) => {
    await page.goto('http://localhost:4000');
    await page.waitForSelector('button:has-text("Добавить")', { timeout: 15000 });

    const firstImage = page.locator('img').first();
    await firstImage.click();

    await expect(page).toHaveURL(/\/ingredients\/\d+/, { timeout: 5000 });
    await expect(page.locator('text=Краторная булка N-200i').first()).toBeVisible();
    await expect(page.locator('text=420').first()).toBeVisible();
    await expect(page.locator('text=80').first()).toBeVisible();
    await expect(page.locator('text=24').first()).toBeVisible();
    await expect(page.locator('text=53').first()).toBeVisible();
    console.log('✅ Страница ингредиента открыта');
    
    await page.goBack();
    await expect(page).toHaveURL('http://localhost:4000/');
    console.log('✅ Возврат на главную');
  });
});
