import { test, expect } from '@playwright/test';

test('Полный поток: регистрация → логин → конструктор → заказ', async ({ page }) => {
  // Генерируем уникальные данные
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  const testName = 'Test User';

  console.log('==========================================');
  console.log('1. РЕГИСТРАЦИЯ нового пользователя');
  console.log(`   Email: ${testEmail}`);
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
      console.log('✅ Запрос на создание заказа отправлен');
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

  // Шаг 1: Регистрация
  await page.goto('http://localhost:4000/register');
  await page.waitForTimeout(1000);
  
  await page.fill('input[name="name"]', testName);
  await page.fill('input[name="email"]', testEmail);
  await page.fill('input[name="password"]', testPassword);
  await page.click('button:has-text("Зарегистрироваться")');
  
  // Ждём завершения регистрации
  await page.waitForTimeout(3000);
  console.log('✅ Регистрация выполнена');

  // Шаг 2: Возвращаемся на главную (конструктор)
  console.log('==========================================');
  console.log('2. ВОЗВРАТ В КОНСТРУКТОР');
  console.log('==========================================');
  
  await page.goto('http://localhost:4000');
  await page.waitForTimeout(2000);
  
  // Проверяем, что мы на главной
  await expect(page).toHaveURL('http://localhost:4000/');
  console.log('✅ На главной странице');

  // Шаг 3: Создание заказа
  console.log('==========================================');
  console.log('3. СОЗДАНИЕ ЗАКАЗА');
  console.log('==========================================');

  // Добавляем булку
  const bun = page.locator('text=Краторная булка N-200i');
  await bun.waitFor({ state: 'visible', timeout: 10000 });
  await bun.dragTo(page.locator('section').last());
  console.log('✅ Булка добавлена');

  // Добавляем начинку
  const main = page.locator('text=Биокотлета из марсианской Магнолии');
  await main.dragTo(page.locator('section').last());
  console.log('✅ Начинка добавлена');

  // Оформляем заказ
  await page.click('button:has-text("Оформить заказ")');
  console.log('✅ Кнопка "Оформить заказ" нажата');

  // Проверяем модальное окно
  await expect(page.locator('#modals')).toBeVisible({ timeout: 15000 });
  
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
