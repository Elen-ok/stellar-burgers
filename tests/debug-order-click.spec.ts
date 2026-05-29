import { test, expect } from '@playwright/test';

test('Отладка клика на Оформить заказ', async ({ page }) => {
  // Реальная регистрация
  await page.goto('http://localhost:4000/register');
  const testEmail = `test${Date.now()}@example.com`;
  
  await page.fill('input[name="name"]', 'TestUser');
  await page.fill('input[name="email"]', testEmail);
  await page.fill('input[name="password"]', 'password123');
  await page.click('button:has-text("Зарегистрироваться")');
  
  await page.waitForURL('http://localhost:4000/');
  await page.waitForSelector('button:has-text("Добавить")', { timeout: 15000 });
  console.log('✅ Авторизованы');
  
  // Мокаем ингредиенты
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
  
  await page.reload();
  await page.waitForSelector('button:has-text("Добавить")', { timeout: 15000 });
  
  // Добавляем ингредиенты
  await page.locator('button:has-text("Добавить")').first().click();
  const ingredientCard = page.locator('li').filter({ hasText: '424' }).first();
  await ingredientCard.locator('button:has-text("Добавить")').click();
  
  console.log('Кликаем на Оформить заказ...');
  await page.click('button:has-text("Оформить заказ")');
  
  await page.waitForTimeout(3000);
  
  // Проверяем URL
  console.log('URL после клика:', page.url());
  
  // Проверяем модальное окно
  const modal = page.locator('#modals');
  console.log('Модальное окно видимо:', await modal.isVisible());
  
  // Проверяем содержимое модалки
  const modalHTML = await modal.innerHTML();
  console.log('Содержимое модалки:', modalHTML.substring(0, 300));
  
  // Делаем скриншот
  await page.screenshot({ path: 'order-debug.png' });
  console.log('Скриншот: order-debug.png');
});
