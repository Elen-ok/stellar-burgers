import { test, expect } from '@playwright/test';

test.describe('Модальное окно ингредиента', () => {
  
  test('Открытие и закрытие модального окна', async ({ page }) => {
    // Реальная регистрация для авторизации
    await page.goto('http://localhost:4000/register');
    const testEmail = `test${Date.now()}@example.com`;
    
    await page.fill('input[name="name"]', 'TestUser');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'password123');
    await page.click('button:has-text("Зарегистрироваться")');
    
    await page.waitForURL('http://localhost:4000/');
    await page.waitForSelector('button:has-text("Добавить")', { timeout: 15000 });
    console.log('✅ Авторизованы');
    
    // Мокаем ингредиенты для скорости (но оставляем API для деталей)
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
              image: "https://code.s3.yandex.net/react/code/bun-02.png",
              image_large: "https://code.s3.yandex.net/react/code/bun-02-large.png"
            },
            { 
              _id: "2", 
              name: "Биокотлета", 
              type: "main", 
              price: 424,
              image: "https://code.s3.yandex.net/react/code/meat-01.png"
            }
          ]
        })
      });
    });
    
    // Обновляем страницу
    await page.reload();
    await page.waitForSelector('button:has-text("Добавить")', { timeout: 15000 });
    
    // Кликаем на картинку первого ингредиента
    const firstImage = page.locator('img').first();
    await firstImage.click();
    
    // Проверяем, что модальное окно открылось
    const modal = page.locator('#modals');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(modal).toContainText('Краторная булка N-200i');
    await expect(modal).toContainText('420'); // калории
    await expect(modal).toContainText('80');  // белки
    await expect(modal).toContainText('24');  // жиры
    await expect(modal).toContainText('53');  // углеводы
    console.log('✅ Модальное окно открылось и содержит данные');
    
    // Закрытие по крестику
    const closeButton = modal.locator('button').first();
    await closeButton.click();
    await expect(modal).toBeHidden({ timeout: 3000 });
    console.log('✅ Закрытие по крестику');
    
    // Открываем снова
    await firstImage.click();
    await expect(modal).toBeVisible({ timeout: 5000 });
    
    // Закрытие по оверлей (клик вне модального окна)
    await page.mouse.click(10, 10);
    await expect(modal).toBeHidden({ timeout: 3000 });
    console.log('✅ Закрытие по оверлей');
  });
});
