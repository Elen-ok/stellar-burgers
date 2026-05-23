import { test, expect } from '@playwright/test';

test('Создание заказа с реальным пользователем', async ({ page }) => {
  // Используй данные, которые ты только что зарегистрировал(а)
  const EMAIL = 'test@example.com';     // ← замени на свой email
  const PASSWORD = 'password123';       // ← замени на свой пароль

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

  // Мок для создания заказа
  await page.route('**/api/orders', async (route) => {
    if (route.request().method() === 'POST') {
      console.log('✅ Заказ создаётся');
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

  // 1. Логинимся
  console.log('1. Логинимся с данными:', EMAIL);
  await page.goto('http://localhost:4000/login');
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button:has-text("Войти")');
  
  // Ждём перехода на главную
  await page.waitForURL('http://localhost:4000/', { timeout: 10000 });
  console.log('2. Успешный вход');
  
  // 2. Добавляем булку
  await page.locator('text=Краторная булка N-200i').first().dragTo(page.locator('section').last());
  
  // 3. Добавляем начинку
  await page.locator('text=Биокотлета из марсианской Магнолии').first().dragTo(page.locator('section').last());
  
  // 4. Оформляем заказ
  await page.click('button:has-text("Оформить заказ")');
  
  // 5. Проверяем модальное окно
  await expect(page.locator('#modals')).toBeVisible({ timeout: 10000 });
  const orderNumber = page.locator('#modals h2.text_type_digits-large');
  await expect(orderNumber).toHaveText('105602');
  
  console.log('✅ Заказ успешно создан!');
});
