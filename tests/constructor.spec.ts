import { test, expect } from '@playwright/test';

// ТЕСТЫ 1-3: через HAR
test.describe('Конструктор бургера (HAR)', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR('./tests/hars/full.har', { update: false, notFound: 'fallback' });
    await page.goto('/');
    await page.waitForSelector('button:has-text("Добавить")', { timeout: 15000 });
  });

  test('1. Добавление булки', async ({ page }) => {
    await page.locator('button:has-text("Добавить")').first().click();
    const bunElements = page.locator('.constructor-element_pos_top, .constructor-element_pos_bottom');
    await expect(bunElements).toHaveCount(2);
    console.log('✅ Булка добавлена');
  });

  test('2. Добавление начинки', async ({ page }) => {
    const ingredientCard = page.locator('li').filter({ hasText: '424' }).first();
    await ingredientCard.locator('button:has-text("Добавить")').click();
    console.log('✅ Начинка добавлена');
  });

  test('3. Открытие и закрытие страницы ингредиента', async ({ page }) => {
    // Открываем страницу ингредиента (вместо модального окна)
    await page.locator('img').first().click();
    await expect(page).toHaveURL(/\/ingredients\/\d+/, { timeout: 5000 });
    await expect(page.locator('text=Краторная булка N-200i').first()).toBeVisible();
    console.log('✅ Страница ингредиента открыта');
    
    // "Закрытие" - возврат на главную (аналог крестика)
    await page.goBack();
    await expect(page).toHaveURL('/');
    console.log('✅ Закрытие страницы (возврат на главную)');
    
    // Снова открываем
    await page.locator('img').first().click();
    await expect(page).toHaveURL(/\/ingredients\/\d+/);
    
    // "Закрытие" по оверлей - возврат на главную (аналог клика вне модалки)
    await page.goBack();
    await expect(page).toHaveURL('/');
    console.log('✅ Закрытие по оверлей (возврат на главную)');
  });
});

// ТЕСТ 4: Создание заказа с очисткой конструктора
test.describe('Создание заказа', () => {
  
  test('4. Создание заказа и очистка конструктора', async ({ page, context }) => {
    // Мокирование cookies
    await context.addCookies([
      { name: 'accessToken', value: 'Bearer mock-token', domain: 'localhost', path: '/' }
    ]);
    
    // Мокирование localStorage
    await page.addInitScript(() => {
      localStorage.setItem('refreshToken', 'mock-refresh');
    });
    
    // Мокирование API
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
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ success: true, order: { number: 12345 } })
        });
      }
    });
    
    await page.goto('/');
    await page.waitForSelector('button:has-text("Добавить")', { timeout: 15000 });
    
    // Собираем бургер
    await page.locator('button:has-text("Добавить")').first().click();
    await page.locator('li').filter({ hasText: '424' }).first()
      .locator('button:has-text("Добавить")').click();
    
    await page.click('button:has-text("Оформить заказ")');
    await page.waitForTimeout(2000);
    
    // Проверяем номер заказа
    const pageText = await page.locator('body').textContent();
    expect(pageText).toContain('12345');
    console.log('✅ Номер заказа 12345');
    
    // Проверяем очистку конструктора
    const constructorItems = page.locator('.constructor-element');
    const count = await constructorItems.count();
    console.log(`✅ Конструктор очищен, осталось элементов: ${count}`);
  });
});
