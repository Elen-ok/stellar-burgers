import { test } from '@playwright/test';

test('Проверка кнопки оформления заказа', async ({ page }) => {
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

  await page.goto('http://localhost:4000');
  await page.waitForTimeout(2000);

  // Проверяем кнопку "Оформить заказ" до добавления ингредиентов
  const orderButton = page.locator('button:has-text("Оформить заказ")');
  console.log('Кнопка заказа до добавления - disabled?', await orderButton.isDisabled());
  
  // Добавляем булку
  const bunAddButton = page.locator('button:has-text("Добавить")').first();
  await bunAddButton.locator('..').dragTo(page.locator('section').last());
  await page.waitForTimeout(500);
  
  console.log('После добавления булки - disabled?', await orderButton.isDisabled());
  
  // Добавляем начинку
  const mainAddButton = page.locator('button:has-text("Добавить")').nth(1);
  await mainAddButton.locator('..').dragTo(page.locator('section').last());
  await page.waitForTimeout(500);
  
  console.log('После добавления начинки - disabled?', await orderButton.isDisabled());
  
  // Проверяем текст кнопки и её состояние
  const buttonText = await orderButton.textContent();
  console.log('Текст кнопки:', buttonText);
  console.log('Кнопка активна:', await orderButton.isEnabled());
  
  // Делаем скриншот
  await page.screenshot({ path: 'tests/button-state.png', fullPage: true });
  console.log('Скриншот сохранён');
});
