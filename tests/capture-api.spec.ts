import { test } from '@playwright/test';

test('Перехват всех API-запросов', async ({ page }) => {
  // Мок для ингредиентов
  await page.route('**/api/ingredients', async (route) => {
    await route.fulfill({
      json: {
        success: true,
        data: [
          { _id: '1', name: 'Краторная булка N-200i', type: 'bun', price: 1255 },
          { _id: '2', name: 'Биокотлета из марсианской Магнолии', type: 'main', price: 424 },
        ],
      },
    });
  });

  // Мок для логина
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      json: {
        success: true,
        accessToken: 'Bearer test-token',
        refreshToken: 'test-refresh',
        user: { email: 'test@example.com', name: 'Test User' }
      }
    });
  });

  // Логируем все запросы к API
  await page.route('**/api/**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    console.log(`🔍 API запрос: ${method} ${url}`);
    
    if (url.includes('/orders') && method === 'POST') {
      console.log('🎯 Это наш запрос на создание заказа!');
      console.log('📦 Тело запроса:', route.request().postData());
      await route.fulfill({ 
        json: { 
          success: true, 
          order: { number: 105602 } 
        } 
      });
    } else {
      await route.continue();
    }
  });

  // Выполняем авторизацию
  await page.goto('http://localhost:4000/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button:has-text("Войти")');
  await page.waitForTimeout(2000);
  
  // Добавляем ингредиенты
  await page.locator('text=Краторная булка N-200i').first().dragTo(page.locator('section').last());
  await page.locator('text=Биокотлета из марсианской Магнолии').first().dragTo(page.locator('section').last());
  
  // Нажимаем "Оформить заказ"
  await page.click('button:has-text("Оформить заказ")');
  await page.waitForTimeout(3000);
  
  console.log('Тест завершён');
});
