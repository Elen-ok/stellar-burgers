import { test, expect } from '@playwright/test';

test.describe('Конструктор бургера', () => {
  
  test('Добавление булки', async ({ page, context }) => {
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
    
    await context.addCookies([
      { name: 'accessToken', value: 'Bearer mock', url: 'http://localhost:4000' }
    ]);
    
    await page.goto('http://localhost:4000');
    await page.waitForSelector('button:has-text("Добавить")', { timeout: 20000 });
    await page.locator('button:has-text("Добавить")').first().click();
    console.log('✅ Булка добавлена');
  });

  test('Добавление начинки', async ({ page, context }) => {
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
    
    await context.addCookies([
      { name: 'accessToken', value: 'Bearer mock', url: 'http://localhost:4000' }
    ]);
    
    await page.goto('http://localhost:4000');
    await page.waitForSelector('button:has-text("Добавить")', { timeout: 20000 });
    
    const ingredientCard = page.locator('li').filter({ hasText: '424' }).first();
    await ingredientCard.locator('button:has-text("Добавить")').click();
    console.log('✅ Начинка добавлена');
  });
});
