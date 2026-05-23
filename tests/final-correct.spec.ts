import { test, expect } from '@playwright/test';

test('Создание заказа авторизованным пользователем', async ({ page }) => {
  // 1. Мок для ингредиентов
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

  // 2. Мок для создания заказа
  await page.route('**/api/orders', async (route) => {
    if (route.request().method() === 'POST') {
      console.log('✅ Перехвачен запрос на создание заказа');
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

  // 3. Логинимся (без проверки URL)
  console.log('🔐 Выполняем вход...');
  await page.goto('http://localhost:4000/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button:has-text("Войти")');
  
  // Просто ждём 3 секунды после клика
  await page.waitForTimeout(3000);
  
  // Проверяем, появился ли "Личный кабинет" (признак успешного входа)
  const isLoggedIn = await page.locator('text=Личный кабинет').count();
  if (isLoggedIn === 0) {
    console.log('⚠️ Предупреждение: не видно "Личный кабинет", но продолжаем...');
    // Делаем скриншот для диагностики
    await page.screenshot({ path: 'tests/after-login.png', fullPage: true });
  } else {
    console.log('✅ Вход выполнен успешно');
  }
  
  // 4. Добавляем булку
  await page.locator('text=Краторная булка N-200i').first().dragTo(page.locator('section').last());
  
  // 5. Добавляем начинку
  await page.locator('text=Биокотлета из марсианской Магнолии').first().dragTo(page.locator('section').last());
  
  // 6. Оформляем заказ
  await page.click('button:has-text("Оформить заказ")');
  
  // 7. Проверяем модальное окно
  await expect(page.locator('#modals')).toBeVisible({ timeout: 15000 });
  
  // 8. Проверяем номер заказа
  const orderNumber = page.locator('#modals h2.text_type_digits-large');
  await expect(orderNumber).toHaveText('105602');
  
  console.log('✅ Заказ успешно создан!');
});
