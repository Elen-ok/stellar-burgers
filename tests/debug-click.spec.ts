import { test } from '@playwright/test';

test('Проверка клика по ингредиенту', async ({ page }) => {
  // Перехват запросов
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
  await page.waitForTimeout(3000);

  // Кликаем по первому ингредиенту
  console.log('Кликаем по первому h3...');
  const h3 = page.locator('h3').first();
  console.log('Текст h3:', await h3.textContent());
  await h3.click();
  
  await page.waitForTimeout(2000);
  
  // Проверяем, что появилось модальное окно
  const modal = page.locator('#modals');
  const isVisible = await modal.isVisible();
  console.log('Модальное окно видно:', isVisible);
  
  // Смотрим HTML модалки
  if (isVisible) {
    const modalHtml = await modal.innerHTML();
    console.log('HTML модалки:', modalHtml.slice(0, 500));
  } else {
    console.log('Модальное окно не появилось');
  }
  
  // Делаем скриншот
  await page.screenshot({ path: 'tests/after-click.png', fullPage: true });
  console.log('Скриншот сохранён в tests/after-click.png');
});
