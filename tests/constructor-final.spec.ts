import { test, expect } from '@playwright/test';

test.describe('Страница конструктора бургера', () => {
  
  test.beforeEach(async ({ page }) => {
    // Используем записанный HAR файл
    await page.routeFromHAR('./tests/hars/full-session.har', {
      update: false,
    });
    
    await page.goto('http://localhost:4000');
    await page.waitForSelector('button:has-text("Добавить")', { timeout: 20000 });
  });

  test('1. Добавление булки', async ({ page }) => {
    await page.locator('button:has-text("Добавить")').first().click();
    console.log('✅ Булка добавлена');
  });

  test('2. Добавление начинки', async ({ page }) => {
    const ingredientCard = page.locator('li').filter({ hasText: '424' }).first();
    await ingredientCard.locator('button:has-text("Добавить")').click();
    console.log('✅ Начинка добавлена');
  });

  test('3. Открытие модального окна ингредиента', async ({ page }) => {
    const bunCard = page.locator('li').filter({ hasText: 'Краторная булка' }).first();
    await bunCard.click();
    
    const modal = page.locator('#modals');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(modal).toContainText('Краторная булка N-200i');
    console.log('✅ Модальное окно открылось');
    
    await modal.locator('button').first().click();
    await expect(modal).toBeHidden();
    console.log('✅ Закрыто по крестику');
  });

  test('4. Создание заказа', async ({ page }) => {
    await page.locator('button:has-text("Добавить")').first().click();
    
    const ingredientCard = page.locator('li').filter({ hasText: '424' }).first();
    await ingredientCard.locator('button:has-text("Добавить")').click();
    
    await page.click('button:has-text("Оформить заказ")');
    
    const modal = page.locator('#modals');
    await expect(modal).toBeVisible({ timeout: 10000 });
    console.log('✅ Модальное окно заказа открылось');
    
    const orderNumber = modal.locator('text=/\\d+/').first();
    await expect(orderNumber).toBeVisible();
    console.log(`✅ Номер заказа: ${await orderNumber.textContent()}`);
    
    await modal.locator('button').first().click();
    await expect(modal).toBeHidden();
    console.log('✅ Модальное окно закрыто');
    
    await page.waitForTimeout(500);
    const constructorElements = page.locator('.constructor-element');
    await expect(constructorElements).toHaveCount(0);
    console.log('✅ Конструктор очищен');
  });
});
