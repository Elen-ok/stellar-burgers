import { test, expect } from '@playwright/test';

test.describe('Страница конструктора бургера', () => {
  // Функция реального логина через UI
  async function realLogin(page) {
    // Переходим на страницу логина
    await page.goto('http://localhost:4000/login');
    
    // Заполняем форму (используй реальные данные существующего пользователя)
    await page.fill('input[name="email"]', 'tanyazhuk.2002@mail.ru'); // твой реальный email
    await page.fill('input[name="password"]', 'Tanya21072002'); // твой реальный пароль
    
    // Нажимаем кнопку входа
    await page.click('button:has-text("Войти")');
    
    // Ждём перехода на главную
    await page.waitForURL('http://localhost:4000/', { timeout: 10000 });
    await page.waitForTimeout(2000);
  }

  test('4. Создание заказа авторизованным пользователем', async ({ page }) => {
    // Мок для ингредиентов (чтобы не ждать реальный API)
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

    // Реально логинимся
    await realLogin(page);
    
    // Добавляем булку
    const bun = page.locator('text=Краторная булка N-200i').first();
    await bun.dragTo(page.locator('section').last());
    
    // Добавляем начинку
    const main = page.locator('text=Биокотлета из марсианской Магнолии').first();
    await main.dragTo(page.locator('section').last());
    
    // Нажимаем "Оформить заказ"
    await page.click('button:has-text("Оформить заказ")');
    
    // Ждём модальное окно
    await expect(page.locator('#modals')).toBeVisible({ timeout: 15000 });
    
    // Проверяем, что номер заказа появился (не важно какой, главное что есть)
    const orderNumber = page.locator('#modals h2.text_type_digits-large');
    await expect(orderNumber).toBeVisible();
    
    const orderNumberText = await orderNumber.textContent();
    console.log(`✅ Заказ создан, номер: ${orderNumberText}`);
    
    // Закрываем модальное окно
    await page.locator('#modals button').first().click();
    await expect(page.locator('#modals > div')).toBeHidden({ timeout: 5000 });
  });
});
