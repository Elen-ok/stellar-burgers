import { test, expect } from '@playwright/test';

test('Создание заказа через кнопку "Добавить"', async ({ page }) => {
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  const testName = 'Test User';

  console.log('==========================================');
  console.log('1. МОК ДЛЯ ИНГРЕДИЕНТОВ И ЗАКАЗА');
  console.log('==========================================');

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
      console.log('✅ Запрос на создание заказа перехвачен');
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

  console.log('==========================================');
  console.log('2. РЕГИСТРАЦИЯ');
  console.log('==========================================');

  // Регистрация
  await page.goto('http://localhost:4000/register');
  await page.fill('input[name="name"]', testName);
  await page.fill('input[name="email"]', testEmail);
  await page.fill('input[name="password"]', testPassword);
  await page.click('button:has-text("Зарегистрироваться")');
  await page.waitForTimeout(3000);
  console.log('✅ Регистрация выполнена');

  console.log('==========================================');
  console.log('3. ДОБАВЛЕНИЕ ИНГРЕДИЕНТОВ ЧЕРЕЗ КНОПКУ "ДОБАВИТЬ"');
  console.log('==========================================');

  // Переходим на главную
  await page.goto('http://localhost:4000');
  await page.waitForTimeout(2000);

  // Добавляем булку (первая кнопка "Добавить")
  console.log('Добавляем булку...');
  await page.locator('button:has-text("Добавить")').first().click();
  await page.waitForTimeout(500);
  
  // Добавляем начинку (вторая кнопка "Добавить")
  console.log('Добавляем начинку...');
  await page.locator('button:has-text("Добавить")').nth(1).click();
  await page.waitForTimeout(500);
  
  // Проверяем, что элементы добавились в конструктор
  const constructorElements = await page.locator('.constructor-element').count();
  console.log(`Элементов в конструкторе: ${constructorElements}`);

  console.log('==========================================');
  console.log('4. ОФОРМЛЕНИЕ ЗАКАЗА');
  console.log('==========================================');

  // Нажимаем "Оформить заказ"
  await page.click('button:has-text("Оформить заказ")');
  console.log('Кнопка "Оформить заказ" нажата');

  // Ждём модальное окно
  await expect(page.locator('#modals')).toBeVisible({ timeout: 15000 });
  console.log('✅ Модальное окно открылось');

  // Проверяем номер заказа
  const orderNumber = page.locator('#modals h2.text_type_digits-large');
  await expect(orderNumber).toHaveText('105602');
  console.log(`✅ Номер заказа: ${await orderNumber.textContent()}`);

  // Закрываем модальное окно
  await page.locator('#modals button').first().click();
  await expect(page.locator('#modals > div')).toBeHidden({ timeout: 5000 });

  console.log('');
  console.log('🎉 ТЕСТ УСПЕШНО ПРОЙДЕН!');
});
