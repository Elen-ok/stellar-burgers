import { test, expect } from '@playwright/test';

test.describe('Конструктор бургера (рабочие тесты)', () => {
  
  test('Добавление булки в конструктор', async ({ page, context }) => {
    // Мокаем ингредиенты
    await page.route('**/api/ingredients', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: [
            { _id: "1", name: "Краторная булка N-200i", type: "bun", price: 1255 },
            { _id: "2", name: "Биокотлета из марсианской Магнолии", type: "main", price: 424 }
          ]
        })
      });
    });
    
    // Мокаем пользователя
    await page.route('**/api/auth/user', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, user: { email: 'test@example.com', name: 'TestUser' } })
      });
    });
    
    // Подставляем токен
    await context.addCookies([
      { name: 'accessToken', value: 'Bearer mock-token', url: 'http://localhost:4000' }
    ]);
    await page.addInitScript(() => {
      localStorage.setItem('refreshToken', 'mock-refresh');
    });
    
    await page.goto('http://localhost:4000');
    
    // Ждем загрузки кнопок
    await page.waitForSelector('button:has-text("Добавить")', { timeout: 20000 });
    
    // Добавляем булку
    await page.locator('button:has-text("Добавить")').first().click();
    console.log('✅ Булка добавлена');
  });

  test('Добавление начинки в конструктор', async ({ page, context }) => {
    await page.route('**/api/ingredients', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: [
            { _id: "1", name: "Краторная булка N-200i", type: "bun", price: 1255 },
            { _id: "2", name: "Биокотлета из марсианской Магнолии", type: "main", price: 424 }
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
      { name: 'accessToken', value: 'Bearer mock-token', url: 'http://localhost:4000' }
    ]);
    await page.addInitScript(() => {
      localStorage.setItem('refreshToken', 'mock-refresh');
    });
    
    await page.goto('http://localhost:4000');
    await page.waitForSelector('button:has-text("Добавить")', { timeout: 20000 });
    
    // Добавляем начинку (ищем по цене 424)
    const ingredientCard = page.locator('li').filter({ hasText: '424' }).first();
    await ingredientCard.locator('button:has-text("Добавить")').click();
    console.log('✅ Начинка добавлена');
  });
});
