import { test } from '@playwright/test';

test('Запись HAR файла с реальной сессией', async ({ page, context }) => {
  // Начинаем запись ВСЕХ запросов
  await page.routeFromHAR('./tests/hars/full-session.har', {
    update: true,
    updateContent: 'embed',
  });
  
  // Реальная регистрация
  await page.goto('http://localhost:4000/register');
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'password123';
  
  console.log(`📧 Email: ${testEmail}`);
  console.log(`🔑 Пароль: ${testPassword}`);
  
  await page.fill('input[name="name"]', 'TestUser');
  await page.fill('input[name="email"]', testEmail);
  await page.fill('input[name="password"]', testPassword);
  await page.click('button:has-text("Зарегистрироваться")');
  
  await page.waitForURL('http://localhost:4000/');
  await page.waitForSelector('button:has-text("Добавить")', { timeout: 15000 });
  
  // 1. Добавляем булку
  await page.locator('button:has-text("Добавить")').first().click();
  
  // 2. Добавляем начинку
  await page.locator('li').filter({ hasText: '424' }).first()
    .locator('button:has-text("Добавить")').click();
  
  // 3. Открываем модальное окно ингредиента (клик на картинку)
  await page.locator('li').filter({ hasText: 'Краторная булка' }).first().click();
  await page.waitForTimeout(1000);
  await page.locator('#modals button').first().click();
  
  // 4. Оформляем заказ
  await page.click('button:has-text("Оформить заказ")');
  await page.waitForTimeout(2000);
  await page.locator('#modals button').first().click();
  
  console.log('✅ HAR файл успешно записан!');
});
