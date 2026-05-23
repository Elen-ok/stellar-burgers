import { test, expect } from '@playwright/test';

test('Создание заказа с полной отладкой', async ({ page }) => {
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  const testName = 'Test User';

  // Перехватываем ВСЕ запросы к API
  await page.route('**/api/**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    
    console.log(`📡 ${method} ${url}`);
    
    // Мок для ингредиентов
    if (url.includes('/ingredients')) {
      console.log('  → Возвращаем мок ингредиентов');
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
    
    // Мок для создания заказа
    if (url.includes('/orders') && method === 'POST') {
      console.log('  ✅🔴 ЭТО НАШ ЗАКАЗ! Возвращаем номер 105602');
      await route.fulfill({
        json: {
          success: true,
          order: { number: 105602 }
        }
      });
      return;
    }
    
    // Все остальные запросы пропускаем
    await route.continue();
  });

  console.log('==========================================');
  console.log('1. РЕГИСТРАЦИЯ');
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
  console.log('2. ДОБАВЛЕНИЕ ИНГРЕДИЕНТОВ');
  console.log('==========================================');

  // Переходим на главную
  await page.goto('http://localhost:4000');
  await page.waitForTimeout(2000);

  // Добавляем булку через кнопку "Добавить"
  console.log('Добавляем булку (клик по первой кнопке "Добавить")...');
  const addButtons = page.locator('button:has-text("Добавить")');
  const count = await addButtons.count();
  console.log(`Найдено кнопок "Добавить": ${count}`);
  
  if (count > 0) {
    await addButtons.first().click();
    console.log('✅ Кликнули на первую кнопку "Добавить"');
  }
  await page.waitForTimeout(500);
  
  // Добавляем начинку (вторая кнопка)
  if (count > 1) {
    await addButtons.nth(1).click();
    console.log('✅ Кликнули на вторую кнопку "Добавить"');
  }
  await page.waitForTimeout(500);

  // Проверяем конструктор
  const constructorItems = await page.locator('.constructor-element').count();
  console.log(`Элементов в конструкторе: ${constructorItems}`);

  console.log('==========================================');
  console.log('3. ОФОРМЛЕНИЕ ЗАКАЗА');
  console.log('==========================================');

  // Нажимаем "Оформить заказ"
  console.log('Нажимаем "Оформить заказ"...');
  await page.click('button:has-text("Оформить заказ")');
  
  // Ждём ответа
  await page.waitForTimeout(5000);
  
  // Проверяем модальное окно
  const modal = page.locator('#modals');
  const isVisible = await modal.isVisible({ timeout: 5000 }).catch(() => false);
  console.log(`Модальное окно видно? ${isVisible}`);
  
  if (isVisible) {
    const modalText = await modal.textContent();
    console.log('Содержимое модалки:', modalText);
    
    const orderNumber = page.locator('#modals h2.text_type_digits-large');
    if (await orderNumber.count() > 0) {
      console.log(`Номер заказа: ${await orderNumber.textContent()}`);
    }
  } else {
    console.log('❌ Модальное окно не появилось');
    // Делаем скриншот
    await page.screenshot({ path: 'tests/no-modal.png', fullPage: true });
    console.log('Скриншот сохранён в tests/no-modal.png');
  }
});
