import { test, expect } from '@playwright/test';

test.describe('Тесты с HAR файлом', () => {
  
  test('Модальное окно и создание заказа через HAR', async ({ page }) => {
    // Используем HAR файл для всех запросов
    await page.routeFromHAR('./tests/hars/full-session.har', {
      update: false,
    });
    
    await page.goto('http://localhost:4000');
    await page.waitForSelector('button:has-text("Добавить")', { timeout: 15000 });
    
    // Добавляем булку
    await page.locator('button:has-text("Добавить")').first().click();
    console.log('✅ Булка добавлена');
    
    // Добавляем начинку
    const ingredientCard = page.locator('li').filter({ hasText: '424' }).first();
    await ingredientCard.locator('button:has-text("Добавить")').click();
    console.log('✅ Начинка добавлена');
    
    // Открываем модальное окно ингредиента
    const bunCard = page.locator('li').filter({ hasText: 'Краторная булка' }).first();
    await bunCard.click();
    
    const modal = page.locator('#modals');
    await expect(modal).toBeVisible({ timeout: 5000 });
    console.log('✅ Модальное окно ингредиента открылось');
    
    await modal.locator('button').first().click();
    await expect(modal).toBeHidden();
    console.log('✅ Закрытие по крестику');
    
    // Оформляем заказ
    await page.click('button:has-text("Оформить заказ")');
    
    const orderModal = page.locator('#modals');
    await expect(orderModal).toBeVisible({ timeout: 10000 });
    console.log('✅ Модальное окно заказа открылось');
    
    const orderNumber = orderModal.locator('text=/\\d+/').first();
    await expect(orderNumber).toBeVisible();
    console.log(`✅ Номер заказа: ${await orderNumber.textContent()}`);
    
    await orderModal.locator('button').first().click();
    await expect(orderModal).toBeHidden();
    console.log('✅ Модальное окно закрыто');
    
    // Проверяем очистку конструктора
    await page.waitForTimeout(500);
    const constructorElements = page.locator('.constructor-element');
    await expect(constructorElements).toHaveCount(0);
    console.log('✅ Конструктор очищен');
  });
});
