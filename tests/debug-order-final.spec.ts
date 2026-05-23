import { test, expect } from '@playwright/test';

test('Диагностика создания заказа', async ({ page }) => {
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  const testName = 'Test User';

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

  // Логируем все запросы к API
  let orderRequestSent = false;
  await page.route('**/api/orders', async (route) => {
    console.log(`🔍 Перехвачен запрос: ${route.request().method()} ${route.request().url()}`);
    if (route.request().method() === 'POST') {
      orderRequestSent = true;
      console.log('🎯 Это запрос на создание заказа!');
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

  // Регистрация
  console.log('1. Регистрируем пользователя...');
  await page.goto('http://localhost:4000/register');
  await page.fill('input[name="name"]', testName);
  await page.fill('input[name="email"]', testEmail);
  await page.fill('input[name="password"]', testPassword);
  await page.click('button:has-text("Зарегистрироваться")');
  await page.waitForTimeout(3000);
  console.log('✅ Регистрация выполнена');

  // Возврат на главную
  await page.goto('http://localhost:4000');
  await page.waitForTimeout(2000);

  // Добавляем ингредиенты
  await page.locator('text=Краторная булка N-200i').first().dragTo(page.locator('section').last());
  await page.locator('text=Биокотлета из марсианской Магнолии').first().dragTo(page.locator('section').last());
  console.log('✅ Ингредиенты добавлены');

  // Нажимаем "Оформить заказ"
  console.log('2. Нажимаем "Оформить заказ"...');
  await page.click('button:has-text("Оформить заказ")');
  
  // Ждём немного
  await page.waitForTimeout(3000);
  
  console.log(`Запрос к /api/orders был отправлен? ${orderRequestSent}`);
  
  // Делаем скриншот
  await page.screenshot({ path: 'tests/order-debug.png', fullPage: true });
  console.log('Скриншот сохранён в tests/order-debug.png');
  
  if (!orderRequestSent) {
    console.log('❌ Запрос не был отправлен. Возможно, кнопка неактивна или другая проблема.');
  }
});
