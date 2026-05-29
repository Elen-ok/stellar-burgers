import { test, expect } from '@playwright/test';

test.describe('Модальное окно ингредиента', () => {
  
  test('Открытие и закрытие модального окна', async ({ page }) => {
    // Мокаем ингредиенты (включая детали для модального окна)
    await page.route('**/api/ingredients', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: [
            { 
              _id: "643d69a5c3f7b9001cfa093c", 
              name: "Краторная булка N-200i", 
              type: "bun", 
              price: 1255,
              proteins: 80,
              fat: 24,
              carbohydrates: 53,
              calories: 420,
              image: "https://code.s3.yandex.net/react/code/bun-02.png",
              image_large: "https://code.s3.yandex.net/react/code/bun-02-large.png"
            }
          ]
        })
      });
    });
    
    // Мокаем детальный запрос ингредиента (для модального окна)
    await page.route('**/api/ingredients/643d69a5c3f7b9001cfa093c', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          ingredient: {
            _id: "643d69a5c3f7b9001cfa093c",
            name: "Краторная булка N-200i",
            type: "bun",
            price: 1255,
            proteins: 80,
            fat: 24,
            carbohydrates: 53,
            calories: 420,
            image: "https://code.s3.yandex.net/react/code/bun-02.png",
            image_large: "https://code.s3.yandex.net/react/code/bun-02-large.png"
          }
        })
      });
    });
    
    await page.goto('http://localhost:4000');
    await page.waitForSelector('button:has-text("Добавить")', { timeout: 15000 });
    
    // Кликаем на картинку первого ингредиента
    const firstImage = page.locator('img').first();
    await firstImage.click();
    
    // Проверяем, что модальное окно открылось
    const modal = page.locator('#modals');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(modal).toContainText('Краторная булка N-200i');
    await expect(modal).toContainText('420');
    await expect(modal).toContainText('80');
    console.log('✅ Модальное окно открылось');
    
    // Закрытие по крестику
    const closeButton = modal.locator('button').first();
    await closeButton.click();
    await expect(modal).toBeHidden({ timeout: 3000 });
    console.log('✅ Закрытие по крестику');
    
    // Открываем снова
    await firstImage.click();
    await expect(modal).toBeVisible({ timeout: 5000 });
    
    // Закрытие по оверлей
    await page.mouse.click(10, 10);
    await expect(modal).toBeHidden({ timeout: 3000 });
    console.log('✅ Закрытие по оверлей');
  });
});
