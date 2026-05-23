import { test } from '@playwright/test';

test('Поиск модального окна заказа', async ({ page }) => {
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

  // Мок для создания заказа
  await page.route('**/api/orders', async (route) => {
    if (route.request().method() === 'POST') {
      console.log('✅ Заказ создаётся на API');
      await route.fulfill({ 
        json: { 
          success: true, 
          order: { number: 105602 } 
        } 
      });
    }
  });

  // 1. Логинимся
  await page.goto('http://localhost:4000/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button:has-text("Войти")');
  await page.waitForTimeout(2000);
  
  // 2. Добавляем ингредиенты
  await page.locator('text=Краторная булка N-200i').dragTo(page.locator('section').last());
  await page.locator('text=Биокотлета из марсианской Магнолии').dragTo(page.locator('section').last());
  
  // 3. Нажимаем заказ
  await page.click('button:has-text("Оформить заказ")');
  await page.waitForTimeout(3000);
  
  // 4. Ищем все возможные контейнеры с номером заказа
  const selectors = [
    '#modals',
    '.modal',
    '[class*="Modal"]',
    '[class*="OrderDetails"]',
    '[class*="order-details"]',
    '[class*="order"]',
  ];
  
  for (const selector of selectors) {
    const count = await page.locator(selector).count();
    console.log(`Селектор "${selector}": ${count} элементов`);
    if (count > 0) {
      const isVisible = await page.locator(selector).first().isVisible();
      console.log(`  Видим? ${isVisible}`);
    }
  }
  
  // 5. Ищем текст "идентификатор заказа"
  const hasOrderText = await page.locator('text=идентификатор заказа').count();
  console.log('Текст "идентификатор заказа" найден:', hasOrderText > 0);
  
  // 6. Ищем любую большую цифру на странице
  const digits = await page.locator('h2.text_type_digits-large').count();
  console.log('Цифры в h2.text_type_digits-large:', digits);
  
  // 7. Скриншот всей страницы
  await page.screenshot({ path: 'tests/full-page-after-order.png', fullPage: true });
  console.log('Скриншот сохранён в tests/full-page-after-order.png');
});
