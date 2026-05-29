import { test, expect } from '@playwright/test';

test('Отладка модального окна', async ({ page }) => {
  // Реальная регистрация
  await page.goto('http://localhost:4000/register');
  const testEmail = `test${Date.now()}@example.com`;
  
  await page.fill('input[name="name"]', 'TestUser');
  await page.fill('input[name="email"]', testEmail);
  await page.fill('input[name="password"]', 'password123');
  await page.click('button:has-text("Зарегистрироваться")');
  
  await page.waitForURL('http://localhost:4000/');
  await page.waitForSelector('button:has-text("Добавить")', { timeout: 15000 });
  console.log('✅ Зарегистрировались');
  
  // Кликаем на картинку первого ингредиента
  const firstImage = page.locator('img').first();
  console.log('Кликаем на картинку...');
  await firstImage.click();
  
  await page.waitForTimeout(2000);
  
  // Проверяем URL
  console.log('Текущий URL:', page.url());
  
  // Проверяем модальное окно
  const modal = page.locator('#modals');
  const isVisible = await modal.isVisible();
  console.log('Модальное окно видимо:', isVisible);
  
  // Проверяем HTML модального окна
  const modalHTML = await modal.innerHTML();
  console.log('Содержимое модалки:', modalHTML.substring(0, 300));
  
  // Делаем скриншот
  await page.screenshot({ path: 'modal-debug.png' });
  console.log('Скриншот сохранен: modal-debug.png');
});
