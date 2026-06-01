import { test, expect } from '@playwright/test';

test.describe('Конструктор бургера (изоляция через HAR)', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR('./tests/hars/full.har', {
      url: '*/**/api/**',
      notFound: 'abort',
      update: false,
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('1. Добавление булки - проверка конкретного ингредиента', async ({ page }) => {
    const bunCard = page.locator('li').filter({ hasText: /булка/i }).first();
    const bunName = await bunCard.locator('p').first().textContent();
    await bunCard.getByRole('button', { name: 'Добавить' }).click();
    
    const bunInConstructor = page.locator('.constructor-element_pos_top, .constructor-element_pos_bottom');
    await expect(bunInConstructor).toHaveCount(2);
    
    const bunText = await bunInConstructor.first().locator('.constructor-element__text').textContent();
    expect(bunText?.toLowerCase()).toContain(bunName?.toLowerCase().replace(/\d+/g, '').trim());
  });

  test('2. Добавление начинки - проверка конкретного ингредиента', async ({ page }) => {
    const ingredientCard = page.locator('li').filter({ hasNotText: /булка/i }).first();
    const ingredientName = await ingredientCard.locator('p').first().textContent();
    await ingredientCard.getByRole('button', { name: 'Добавить' }).click();
    
    const ingredientInConstructor = page.locator('.constructor-element:not(.constructor-element_pos_top):not(.constructor-element_pos_bottom)');
    await expect(ingredientInConstructor).toHaveCount(1);
    
    const ingredientText = await ingredientInConstructor.locator('.constructor-element__text').textContent();
    expect(ingredientText?.toLowerCase()).toContain(ingredientName?.toLowerCase().replace(/\d+/g, '').trim());
  });

  test('3. Создание заказа и очистка конструктора', async ({ page }) => {
    // Добавляем булку и начинку
    await page.locator('li').filter({ hasText: /булка/i }).first()
      .getByRole('button', { name: 'Добавить' }).click();
    await page.locator('li').filter({ hasNotText: /булка/i }).first()
      .getByRole('button', { name: 'Добавить' }).click();
    
    await expect(page.locator('.constructor-element')).toHaveCount(3);
    
    // Оформляем заказ
    await page.getByRole('button', { name: 'Оформить заказ' }).click();
    await page.waitForTimeout(2000);
    
    // Закрываем модалку заказа по оверлею
    await page.mouse.click(10, 10);
    await page.waitForTimeout(500);
    
    // Проверяем, что конструктор очистился
    await expect(page.locator('.constructor-element')).toHaveCount(0);
  });
});
