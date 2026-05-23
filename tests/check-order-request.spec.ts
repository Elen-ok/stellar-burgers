import { test } from '@playwright/test';

test('Проверка отправки запроса на создание заказа', async ({ page }) => {
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
        refreshToken: 'test-refresh-token',
        user: { email: 'test@example.com', name: 'Test User' }
      }
    });
  });

  // Логируем все запросы к API
  let orderRequestSent = false;
  await page.route('**/api/orders', async (route) => {
    console.log('🔍 Перехвачен запрос к /api/orders');
    console.log('  Метод:', route.request().method());
    console.log('  Тело:', route.request().postData());
    orderRequestSent = true;
    
    if (route.request().method() === 'POST') {
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

  // Логинимся
  await page.goto('http://localhost:4000/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button:has-text("Войти")');
  await page.waitForTimeout(2000);
  
  // Добавляем ингредиенты
  console.log('Добавляем булку...');
  await page.locator('text=Краторная булка N-200i').dragTo(page.locator('section').last());
  await page.waitForTimeout(500);
  
  console.log('Добавляем начинку...');
  await page.locator('text=Биокотлета из марсианской Магнолии').dragTo(page.locator('section').last());
  await page.waitForTimeout(500);
  
  // Проверяем кнопку заказа
  const orderButton = page.locator('button:has-text("Оформить заказ")');
  console.log('Кнопка "Оформить заказ" активна?', await orderButton.isEnabled());
  
  // Нажимаем
  console.log('Нажимаем "Оформить заказ"...');
  await orderButton.click();
  
  await page.waitForTimeout(3000);
  
  console.log('Запрос к /api/orders был отправлен?', orderRequestSent);
  
  // Делаем скриншот
  await page.screenshot({ path: 'tests/order-request-state.png', fullPage: true });
  console.log('Скриншот сохранён');
});
