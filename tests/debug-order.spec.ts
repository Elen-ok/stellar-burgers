import { test, expect } from '@playwright/test';

test('Проверка создания заказа', async ({ page }) => {
  const FAKE_ACCESS_TOKEN = 'fake-token';
  
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

  await page.route('**/api/orders', async (route) => {
    if (route.request().method() === 'POST') {
      console.log('Запрос на создание заказа получен');
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
  
  // Нажимаем кнопку заказа
  await page.click('button:has-text("Оформить заказ")');
  await page.waitForTimeout(2000);

  // Проверяем содержимое #modals
  const modalContent = await page.locator('#modals').innerHTML();
  console.log('Содержимое #modals после заказа:', modalContent.slice(0, 500));
  
  // Проверяем, есть ли элемент с заказом
  const hasOrderModal = await page.locator('#modals:has-text("заказ")').count();
  console.log('Есть текст "заказ":', hasOrderModal > 0);
  
  // Делаем скриншот
  await page.screenshot({ path: 'tests/order-modal.png', fullPage: true });
  console.log('Скриншот сохранён в tests/order-modal.png');
});
