import { test, expect } from '@playwright/test';

test('Создание заказа с правильным моком', async ({ page }) => {
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  const testName = 'Test User';

  // Перехватываем ВСЕ запросы к API
  await page.route('**/api/**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    
    // Мок для ингредиентов
    if (url.includes('/ingredients')) {
      await route.fulfill({
        json: {
          success: true,
          data: [
            { _id: '1', name: 'Краторная булка N-200i', type: 'bun', price: 1255 },
            { _id: '2', name: 'Биокотлета из марсианской Магнолии', type: 'main', price: 424 },
          ],
        },
      });
      return;
    }
    
    // Мок для создания заказа — пробуем разные форматы
    if (url.includes('/orders') && method === 'POST') {
      console.log('✅ Заказ создаётся!');
      
      // Вариант 1: как обычно
      // await route.fulfill({
      //   json: { success: true, order: { number: 105602 } }
      // });
      
      // Вариант 2: прямой номер
      await route.fulfill({
        json: { success: true, number: 105602 }
      });
      
      // Вариант 3: как в реальном ответе (по твоему скриншоту)
      // await route.fulfill({
      //   json: { success: true, orders: [{ number: 105602 }] }
      // });
      
      return;
    }
    
    await route.continue();
  });

  // Регистрация
  await page.goto('http://localhost:4000/register');
  await page.fill('input[name="name"]', testName);
  await page.fill('input[name="email"]', testEmail);
  await page.fill('input[name="password"]', testPassword);
  await page.click('button:has-text("Зарегистрироваться")');
  await page.waitForTimeout(3000);

  // На главную
  await page.goto('http://localhost:4000');
  await page.waitForTimeout(2000);

  // Добавляем булку и начинку
  await page.locator('button:has-text("Добавить")').first().click();
  await page.locator('button:has-text("Добавить")').nth(1).click();
  await page.waitForTimeout(500);

  // Оформляем заказ
  await page.click('button:has-text("Оформить заказ")');
  
  // Ждём модальное окно
  await page.waitForTimeout(3000);
  
  // Проверяем, есть ли в #modals какие-то данные
  const modalContent = await page.locator('#modals').textContent();
  console.log('Содержимое #modals:', modalContent);
  
  // Проверяем, есть ли цифры в модалке
  const hasDigits = modalContent?.match(/\d+/);
  if (hasDigits) {
    console.log(`✅ Найден номер заказа: ${hasDigits[0]}`);
  }
  
  await page.screenshot({ path: 'tests/final-order-modal.png', fullPage: true });
});
