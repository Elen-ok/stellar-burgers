import { test } from '@playwright/test';

test('Проверка состояния конструктора', async ({ page }) => {
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'Password123!';

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

  // Регистрация
  await page.goto('http://localhost:4000/register');
  await page.fill('input[name="name"]', 'TestUser');
  await page.fill('input[name="email"]', testEmail);
  await page.fill('input[name="password"]', testPassword);
  await page.click('button:has-text("Зарегистрироваться")');
  await page.waitForTimeout(3000);

  // На главную
  await page.goto('http://localhost:4000');
  await page.waitForTimeout(2000);

  // Проверяем кнопку "Оформить заказ" ДО добавления
  const orderButton = page.locator('button:has-text("Оформить заказ")');
  console.log('До добавления: кнопка активна?', await orderButton.isEnabled());
  console.log('Текст кнопки:', await orderButton.textContent());

  // Добавляем булку через drag and drop
  console.log('Добавляем булку...');
  const bun = page.locator('text=Краторная булка N-200i');
  await bun.dragTo(page.locator('section').last());
  await page.waitForTimeout(500);
  
  console.log('После булки: кнопка активна?', await orderButton.isEnabled());

  // Добавляем начинку
  console.log('Добавляем начинку...');
  const main = page.locator('text=Биокотлета из марсианской Магнолии');
  await main.dragTo(page.locator('section').last());
  await page.waitForTimeout(500);
  
  console.log('После начинки: кнопка активна?', await orderButton.isEnabled());
  
  // Проверяем, есть ли элементы в конструкторе
  const constructorElements = await page.locator('.constructor-element').count();
  console.log('Элементов в конструкторе:', constructorElements);
  
  // Пробуем кликнуть принудительно
  if (await orderButton.isEnabled()) {
    console.log('Кнопка активна, кликаем...');
    await orderButton.click();
    await page.waitForTimeout(2000);
    console.log('После клика URL:', page.url());
  } else {
    console.log('Кнопка НЕ активна, возможно, нужно добавить булку другого типа');
  }
  
  await page.screenshot({ path: 'tests/constructor-state.png', fullPage: true });
  console.log('Скриншот сохранён');
});
