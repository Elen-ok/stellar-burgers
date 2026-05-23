import { test, expect } from '@playwright/test';

test.describe('Страница конструктора бургера', () => {
  // Функция реального логина через UI (без проверки URL)
  async function realLogin(page) {
    // Переходим на страницу логина
    await page.goto('http://localhost:4000/login');
    
    // Заполняем форму (замени на свои реальные данные)
    await page.fill('input[name="email"]', 'tanyazhuk.2002@mail.ru');
    await page.fill('input[name="password"]', 'Tanya21072002');
    
    // Нажимаем кнопку входа
    await page.click('button:has-text("Войти")');
    
    // Просто ждём 3 секунды, чтобы сайт успел обработать вход
    await page.waitForTimeout(3000);
    
    // Проверяем, что мы не на странице логина (нет формы входа)
    const isStillLogin = await page.locator('input[name="email"]').count();
    if (isStillLogin > 0) {
      console.log('❌ Ошибка: вход не выполнен. Проверь email и пароль');
      throw new Error('Не удалось войти');
    }
    console.log('✅ Успешный вход');
  }

  test('4. Создание заказа авторизованным пользователем', async ({ page }) => {
    // Мок для ингредиентов (ускоряем тест)
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

    // Мок для создания заказа (подменяем ответ, чтобы не ждать реальный сервер)
    await page.route('**/api/orders', async (route) => {
      if (route.request().method() === 'POST') {
        console.log('✅ Запрос на создание заказа перехвачен');
        await route.fulfill({ 
          json: { 
            success: true, 
            order: { number: 105602 } 
          } 
        });
      } else {
        await route.continue();
      }
    });

    // Выполняем вход
    await realLogin(page);
    
    // Добавляем булку
    const bun = page.locator('text=Краторная булка N-200i').first();
    await bun.dragTo(page.locator('section').last());
    
    // Добавляем начинку
    const main = page.locator('text=Биокотлета из марсианской Магнолии').first();
    await main.dragTo(page.locator('section').last());
    
    // Нажимаем "Оформить заказ"
    await page.click('button:has-text("Оформить заказ")');
    
    // Ждём появления модального окна с заказом
    await expect(page.locator('#modals')).toBeVisible({ timeout: 15000 });
    
    // Проверяем номер заказа (из мока должно быть 105602)
    const orderNumber = page.locator('#modals h2.text_type_digits-large');
    await expect(orderNumber).toHaveText('105602', { timeout: 5000 });
    
    // Закрываем модальное окно
    await page.locator('#modals button').first().click();
    await expect(page.locator('#modals > div')).toBeHidden({ timeout: 5000 });
    
    console.log('✅ Заказ успешно создан!');
  });
});
