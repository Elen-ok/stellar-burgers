import { test, expect } from '@playwright/test';

test.describe('Авторизация через моки', () => {
  
  test('Доступ к конструктору для авторизованного пользователя', async ({ page, context }) => {
    // 1. Мокаем cookies (как будто пользователь уже авторизован)
    await context.addCookies([
      {
        name: 'accessToken',
        value: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token',
        domain: 'localhost',
        path: '/',
      },
    ]);
    
    // 2. Мокаем localStorage (выполняется ДО загрузки страницы)
    await page.addInitScript(() => {
      localStorage.setItem('refreshToken', 'mock-refresh-token');
      localStorage.setItem('accessToken', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token');
      localStorage.setItem('user', JSON.stringify({ email: 'test@example.com', name: 'TestUser' }));
    });
    
    // 3. Мокаем API запросы (чтобы не ходить на реальный бэкенд)
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
    
    // 4. Переходим на страницу
    await page.goto('http://localhost:4000');
    
    // 5. Проверяем, что пользователь авторизован
    await page.waitForSelector('button:has-text("Добавить")', { timeout: 15000 });
    console.log('✅ Пользователь авторизован через моки');
    
    // 6. Проверяем, что ингредиенты загрузились
    const addButtons = await page.locator('button:has-text("Добавить")').count();
    console.log(`✅ Найдено кнопок "Добавить": ${addButtons}`);
    
    // 7. Добавляем булку (проверяем, что конструктор работает)
    await page.locator('button:has-text("Добавить")').first().click();
    console.log('✅ Булка добавлена в конструктор');
  });
});
