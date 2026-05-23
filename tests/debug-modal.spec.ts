import { test } from '@playwright/test';

test('Проверка модального окна', async ({ page }) => {
  // Мокируем запросы
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

  await page.goto('http://localhost:4000');
  await page.waitForTimeout(3000);

  // Проверяем, есть ли элемент с классом modal
  const modalExists = await page.locator('.modal, [class*="Modal"], [class*="modal"]').count();
  console.log('Элементы с классом modal:', modalExists);
  
  // Кликаем по первому ингредиенту (по тексту названия)
  console.log('Кликаем по ингредиенту...');
  await page.locator('text=Краторная булка N-200i').click();
  await page.waitForTimeout(2000);
  
  // Проверяем, появилось ли модальное окно после клика
  const modalAfterClick = await page.locator('.modal, [class*="Modal"], [class*="modal"]').count();
  console.log('Модальных окон после клика:', modalAfterClick);
  
  // Проверяем, есть ли элемент с id="modals"
  const modalsDiv = await page.locator('#modals').count();
  console.log('Элемент #modals:', modalsDiv);
  
  // Смотрим, есть ли дочерние элементы в #modals
  if (modalsDiv > 0) {
    const children = await page.locator('#modals > *').count();
    console.log('Дочерних элементов в #modals:', children);
    if (children > 0) {
      const innerHtml = await page.locator('#modals').innerHTML();
      console.log('Содержимое #modals:', innerHtml.slice(0, 500));
    }
  }
  
  // Делаем скриншот
  await page.screenshot({ path: 'tests/modal-debug.png', fullPage: true });
  console.log('Скриншот сохранён в tests/modal-debug.png');
});
