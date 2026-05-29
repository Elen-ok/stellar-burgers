import { test, expect } from '@playwright/test';

test.describe('Страница ингредиента', () => {

  test('Открытие страницы ингредиента при клике на картинку', async ({ page }) => {
    await page.goto('http://localhost:4000');
    await page.waitForSelector('button:has-text("Добавить")', { timeout: 15000 });

    // Кликаем на картинку первого ингредиента
    const firstImage = page.locator('img').first();
    await firstImage.click();

    // Проверяем, что произошел переход на страницу ингредиента
    await expect(page).toHaveURL(/\/ingredients\/\d+/, { timeout: 5000 });
    console.log('✅ Переход на страницу ингредиента');

    // Используем .first() для выбора первого элемента
    await expect(page.locator('text=Краторная булка N-200i').first()).toBeVisible();
    console.log('✅ Название ингредиента отображается');

    // Проверяем, что отображаются детали (калории, белки, жиры)
    await expect(page.locator('text=420').first()).toBeVisible();
    await expect(page.locator('text=80').first()).toBeVisible();
    await expect(page.locator('text=24').first()).toBeVisible();
    await expect(page.locator('text=53').first()).toBeVisible();
    console.log('✅ Детали ингредиента отображаются');

    // Закрытие - просто возвращаемся назад
    await page.goBack();
    await expect(page).toHaveURL('http://localhost:4000/');
    console.log('✅ Возврат на главную');
  });
});
