import { test, expect } from '@playwright/test';

test('Проверка что происходит после заказа', async ({ page, context }) => {
  // Моки авторизации
  await context.addCookies([
    { name: 'accessToken', value: 'Bearer mock-token', domain: 'localhost', path: '/' }
  ]);
  await page.addInitScript(() => {
    localStorage.setItem('refreshToken', 'mock-refresh');
    localStorage.setItem('accessToken', 'Bearer mock-token');
  });
  
  // Моки API
  await page.route('**/api/auth/user', async route => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({ success: true, user: { email: 'test@example.com', name: 'TestUser' } })
    });
  });
  
  await page.route('**/api/ingredients', async route => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        success: true,
        data: [
          { _id: "1", name: "Краторная булка N-200i", type: "bun", price: 1255 },
          { _id: "2", name: "Биокотлета", type: "main", price: 424 }
        ]
      })
    });
  });
  
  await page.route('**/api/orders', async route => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({ success: true, order: { number: 12345 } })
    });
  });
  
  await page.goto('http://localhost:4000');
  await page.waitForSelector('button:has-text("Добавить")', { timeout: 15000 });
  
  // Собираем бургер
  await page.locator('button:has-text("Добавить")').first().click();
  const ingredientCard = page.locator('li').filter({ hasText: '424' }).first();
  await ingredientCard.locator('button:has-text("Добавить")').click();
  
  await page.click('button:has-text("Оформить заказ")');
  
  // Ждем и смотрим URL
  await page.waitForTimeout(3000);
  console.log('URL после заказа:', page.url());
  
  // Ищем номер заказа на странице
  const pageText = await page.locator('body').textContent();
  console.log('Текст на странице:', pageText?.substring(0, 500));
  
  await page.screenshot({ path: 'after-order.png' });
  console.log('Скриншот: after-order.png');
});
