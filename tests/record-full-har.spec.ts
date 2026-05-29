import { test } from '@playwright/test';

test('Полная запись HAR', async ({ page }) => {
  await page.routeFromHAR('./tests/hars/full.har', {
    update: true,
    updateContent: 'embed',
  });
  
  // РЕАЛЬНАЯ авторизация для записи
  await page.goto('http://localhost:4000/register');
  const email = `test${Date.now()}@example.com`;
  await page.fill('input[name="name"]', 'TestUser');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', 'password123');
  await page.click('button:has-text("Зарегистрироваться")');
  await page.waitForURL('http://localhost:4000/');
  await page.waitForSelector('button:has-text("Добавить")', { timeout: 15000 });
  
  // Записываем ВСЕ действия для тестов
  // 1. Добавление булки
  await page.locator('button:has-text("Добавить")').first().click();
  
  // 2. Добавление начинки
  await page.locator('li').filter({ hasText: '424' }).first()
    .locator('button:has-text("Добавить")').click();
  
  // 3. Открытие страницы ингредиента
  await page.locator('img').first().click();
  await page.waitForTimeout(1000);
  await page.goBack();
  
  // 4. Оформление заказа
  await page.click('button:has-text("Оформить заказ")');
  await page.waitForTimeout(2000);
  
  console.log('✅ Полный HAR файл записан');
});
