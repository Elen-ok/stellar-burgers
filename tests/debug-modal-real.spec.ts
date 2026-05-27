import { test, expect } from '@playwright/test';

test('Отладка открытия модального окна с реальной авторизацией', async ({ page }) => {
  // Регистрация пользователя
  await page.goto('http://localhost:4000/register');
  
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'password123';
  
  console.log(`Регистрируем: ${testEmail}`);
  
  await page.fill('input[name="name"]', 'TestUser');
  await page.fill('input[name="email"]', testEmail);
  await page.fill('input[name="password"]', testPassword);
  await page.click('button:has-text("Зарегистрироваться")');
  
  await page.waitForURL('http://localhost:4000/');
  await page.waitForSelector('button:has-text("Добавить")', { timeout: 15000 });
  console.log('✅ Авторизованы');
  
  // Проверяем URL после клика на ингредиент
  const bunCard = page.locator('li').filter({ hasText: 'Краторная булка' }).first();
  console.log('Кликаем на булку...');
  await bunCard.click();
  
  // Ждем и смотрим, что произошло
  await page.waitForTimeout(2000);
  console.log('Текущий URL:', page.url());
  
  // Проверяем модальное окно
  const modal = page.locator('#modals');
  const isVisible = await modal.isVisible();
  console.log('Модальное окно видимо:', isVisible);
  
  // Делаем скриншот
  await page.screenshot({ path: 'debug-modal-real.png' });
  console.log('Скриншот: debug-modal-real.png');
});
