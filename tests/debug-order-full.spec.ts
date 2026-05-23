import { test } from '@playwright/test';

test('Полная проверка создания заказа', async ({ page }) => {
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

  await page.route('**/api/auth/user', async (route) => {
    await route.fulfill({ json: { success: true, user: { email: 'test@test.com', name: 'Test' } } });
  });

  let orderCreated = false;
  await page.route('**/api/orders', async (route) => {
    if (route.request().method() === 'POST') {
      orderCreated = true;
      console.log('✅ Запрос на создание заказа получен');
      await route.fulfill({ json: { success: true, order: { number: 12345 } } });
    } else {
      await route.continue();
    }
  });

  await page.goto('http://localhost:4000');
  await page.waitForTimeout(2000);

  // Добавляем булку
  const bunAddButton = page.locator('button:has-text("Добавить")').first();
  await bunAddButton.waitFor({ state: 'visible', timeout: 10000 });
  await bunAddButton.locator('..').dragTo(page.locator('section').last());

  // Добавляем начинку
  const mainAddButton = page.locator('button:has-text("Добавить")').nth(1);
  await mainAddButton.locator('..').dragTo(page.locator('section').last());

  console.log('Конструктор собран, нажимаем "Оформить заказ"...');
  await page.click('button:has-text("Оформить заказ")');
  
  // Ждём возможного появления элементов
  await page.waitForTimeout(3000);
  
  // Проверяем все возможные селекторы модального окна заказа
  const selectors = [
    '#modals',
    '.modal',
    '[class*="Modal"]',
    '[class*="OrderDetails"]',
    '[class*="order-details"]',
  ];
  
  for (const selector of selectors) {
    const count = await page.locator(selector).count();
    console.log(`Селектор "${selector}": ${count} элементов`);
  }
  
  // Ищем любой текст, связанный с заказом
  const bodyText = await page.locator('body').textContent();
  if (bodyText) {
    if (bodyText.includes('идентификатор')) console.log('✅ Найден текст "идентификатор"');
    if (bodyText.includes('заказ')) console.log('✅ Найден текст "заказ"');
    if (bodyText.includes('12345')) console.log('✅ Найден номер 12345');
  }
  
  // Делаем скриншот всей страницы
  await page.screenshot({ path: 'tests/full-order-page.png', fullPage: true });
  console.log('Скриншот сохранён в tests/full-order-page.png');
  console.log('Запрос на создание заказа был отправлен:', orderCreated);
});
