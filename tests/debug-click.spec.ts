import { test, expect } from '@playwright/test';

test('Что происходит при клике на картинку', async ({ page }) => {
  await page.goto('http://localhost:4000');
  await page.waitForSelector('button:has-text("Добавить")', { timeout: 15000 });
  
  // Получаем первую картинку
  const firstImage = page.locator('img').first();
  const imageSrc = await firstImage.getAttribute('src');
  console.log('Картинка:', imageSrc);
  
  // Кликаем
  console.log('Кликаем на картинку...');
  await firstImage.click();
  
  // Ждем немного
  await page.waitForTimeout(2000);
  
  // Проверяем URL
  console.log('URL после клика:', page.url());
  
  // Проверяем модальное окно
  const modal = page.locator('#modals');
  const isVisible = await modal.isVisible();
  console.log('Модальное окно видимо:', isVisible);
  
  // Проверяем содержимое модального окна
  const modalContent = await modal.textContent();
  console.log('Содержимое модалки:', modalContent?.substring(0, 200));
  
  // Делаем скриншот
  await page.screenshot({ path: 'click-debug.png' });
  console.log('Скриншот: click-debug.png');
});
