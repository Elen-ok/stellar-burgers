import { test } from '@playwright/test';

test('Посмотреть что на странице', async ({ page }) => {
  // Переходим на страницу
  await page.goto('http://localhost:4000');
  await page.waitForTimeout(5000);
  
  // Получаем заголовок страницы
  const title = await page.title();
  console.log('Заголовок страницы:', title);
  
  // Получаем весь текст страницы
  const bodyText = await page.locator('body').textContent();
  console.log('Текст страницы (первые 500 символов):', bodyText?.slice(0, 500));
  
  // Делаем скриншот
  await page.screenshot({ path: 'tests/page-screenshot.png', fullPage: true });
  console.log('Скриншот сохранён в tests/page-screenshot.png');
  
  // Смотрим, есть ли кнопка "Оформить заказ"
  const buttons = await page.locator('button').allTextContents();
  console.log('Все кнопки на странице:', buttons);
});
