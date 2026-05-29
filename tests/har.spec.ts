import { test, expect } from '@playwright/test';

test.describe('Тесты с HAR файлом (модальное окно и заказ)', () => {
  
  test('Открытие и закрытие модального окна ингредиента', async ({ page }) => {
    // Используем HAR файл для всех запросов
    await page.routeFromHAR('./tests/hars/session.har', {
      update: false,
    });
    
    await page.goto('http://localhost:4000');
    await page.waitForSelector('button:has-text("Добавить")');
    
    // Открываем модальное окно
    const bunCard = page.locator('li').filter({ hasText: 'Краторная булка' }).first();
    await bunCard.click();
    
    const modal = page.locator('#modals');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(modal).toContainText('Краторная булка N-200i');
    console.log('✅ Модальное окно открылось');
    
    // Закрытие по крестику
    await modal.locator('button').first().click();
    await expect(modal).toBeHidden();
    console.log('✅ Закрытие по крестику');
    
    // Снова открываем
    await bunCard.click();
    await expect(modal).toBeVisible();
    
    // Закрытие по оверлей
    await page.mouse.click(10, 10);
    await expect(modal).toBeHidden();
    console.log('✅ Закрытие по оверлей');
  });

  test('Создание заказа и очистка конструктора', async ({ page }) => {
    await page.routeFromHAR('./tests/hars/session.har', {
      update: false,
    });
    
    await page.goto('http://localhost:4000');
    await page.waitForSelector('button:has-text("Добавить")');
    
    // Собираем бургер
    await page.locator('button:has-text("Добавить")').first().click();
    await page.locator('li').filter({ hasText: '424' }).first()
      .locator('button:has-text("Добавить")').click();
    
    // Оформляем заказ
    await page.click('button:has-text("Оформить заказ")');
    
    const modal = page.locator('#modals');
    await expect(modal).toBeVisible({ timeout: 10000 });
    console.log('✅ Модальное окно заказа открылось');
    
    const orderNumber = modal.locator('text=/\\d+/').first();
    await expect(orderNumber).toBeVisible();
    console.log(`✅ Номер заказа: ${await orderNumber.textContent()}`);
    
    // Закрываем
    await modal.locator('button').first().click();
    await expect(modal).toBeHidden();
    console.log('✅ Модальное окно закрыто');
    
    // Проверяем очистку конструктора
    await page.waitForTimeout(500);
    const constructorElements = page.locator('.constructor-element');
    await expect(constructorElements).toHaveCount(0);
    console.log('✅ Конструктор очищен');
  });
});
