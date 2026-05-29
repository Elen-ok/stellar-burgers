import { test, expect } from '@playwright/test';

test.describe('Конструктор бургера (все тесты с авторизацией)', () => {
  
  test.beforeEach(async ({ page, context }) => {
    // ===== МОКИ АВТОРИЗАЦИИ =====
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
    });
    
    // ===== МОКИ API =====
    await page.route('**/api/auth/user', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          user: { email: 'test@example.com', name: 'TestUser' }
        })
      });
    });
    
    await page.route('**/api/ingredients', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: [
            { _id: "1", name: "Краторная булка N-200i", type: "bun", price: 1255, proteins: 80, fat: 24, carbohydrates: 53, calories: 420 },
            { _id: "2", name: "Биокотлета", type: "main", price: 424, proteins: 420, fat: 142, carbohydrates: 242, calories: 4242 }
          ]
        })
      });
    });
    
    await page.route('**/api/ingredients/1', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          ingredient: { _id: "1", name: "Краторная булка N-200i", proteins: 80, fat: 24, carbohydrates: 53, calories: 420 }
        })
      });
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
    console.log('✅ Возврат на главную');
  });
});
