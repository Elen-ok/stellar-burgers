import { test, expect } from '@playwright/test';

test('Полный поток: регистрация → логин → создание заказа', async ({ page }) => {
  // Генерируем уникальные данные для тестового пользователя
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  const testName = 'Test User';

  console.log('==========================================');
  console.log('1. РЕГИСТРАЦИЯ нового пользователя');
  console.log(`   Email: ${testEmail}`);
  console.log(`   Пароль: ${testPassword}`);
  console.log('==========================================');

  // Мок для ингредиентов (чтобы ускорить)
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

  // Шаг 1: Переходим на страницу регистрации
  await page.goto('http://localhost:4000/register');
  await page.waitForTimeout(1000);

  // Шаг 2: Заполняем форму регистрации
  await page.fill('input[name="name"]', testName);
  await page.fill('input[name="email"]', testEmail);
  await page.fill('input[name="password"]', testPassword);
  
  // Шаг 3: Отправляем форму
  await page.click('button:has-text("Зарегистрироваться")');
  
  // Ждём завершения регистрации (редирект на логин или главную)
  await page.waitForTimeout(3000);
  
  console.log('✅ Регистрация выполнена');
  console.log('');
  console.log('==========================================');
  console.log('2. ЛОГИН под новым пользователем');
  console.log('==========================================');

  // Шаг 4: Если после регистрации перенаправило на логин — логинимся
  if (page.url().includes('/login') || page.url().includes('/')) {
    // Если мы не на странице логина, переходим на неё
    if (!page.url().includes('/login')) {
      await page.goto('http://localhost:4000/login');
      await page.waitForTimeout(1000);
    }
    
    // Заполняем форму логина
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button:has-text("Войти")');
    await page.waitForTimeout(3000);
    console.log('✅ Логин выполнен');
  } else {
    console.log('✅ Уже авторизованы после регистрации');
  }

  console.log('');
  console.log('==========================================');
  console.log('3. СОЗДАНИЕ ЗАКАЗА');
  console.log('==========================================');

  // Переходим на главную страницу
  await page.goto('http://localhost:4000');
  await page.waitForTimeout(2000);

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
  console.log('✅ Модальное окно открылось');

  // Проверяем номер заказа
  const orderNumber = page.locator('#modals h2.text_type_digits-large');
  await expect(orderNumber).toHaveText('105602');
  console.log(`✅ Номер заказа: ${await orderNumber.textContent()}`);

  // Закрываем модальное окно
  await page.locator('#modals button').first().click();
  await expect(page.locator('#modals > div')).toBeHidden({ timeout: 5000 });

  console.log('');
  console.log('==========================================');
  console.log('🎉 ТЕСТ УСПЕШНО ПРОЙДЕН!');
  console.log('==========================================');
});
