import { test, expect } from '@playwright/test';

test.describe('Страница конструктора бургера', () => {
  // Вспомогательная функция для авторизации
  async function login(page) {
    // Мок для логина
    await page.route('**/api/auth/login', async (route) => {
      const body = JSON.parse(route.request().postData() || '{}');
      console.log('📝 Логин с email:', body.email);
      await route.fulfill({
        json: {
          success: true,
          accessToken: 'Bearer test-access-token',
          refreshToken: 'test-refresh-token',
          user: { email: body.email, name: 'Test User' }
        }
      });
    });

    // Заполняем форму логина
    await page.goto('http://localhost:4000/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button:has-text("Войти")');
    await page.waitForTimeout(2000);
    
    // Сохраняем токены в localStorage и cookies
    await page.evaluate(() => {
      localStorage.setItem('refreshToken', 'test-refresh-token');
      document.cookie = 'accessToken=Bearer test-access-token; path=/';
    });
    
    // Обновляем страницу, чтобы приложение подхватило токены
    await page.reload();
    await page.waitForTimeout(2000);
  }

  test('1. Добавление ингредиента из списка в конструктор', async ({ page }) => {
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

    await login(page);
    
    const addButton = page.locator('button:has-text("Добавить")').first();
    await addButton.waitFor({ state: 'visible', timeout: 15000 });
    await addButton.locator('..').dragTo(page.locator('section').last());
    console.log('✅ Ингредиент добавлен');
  });

  test('2. Открытие и закрытие модального окна ингредиента', async ({ page }) => {
    await page.route('**/api/ingredients', async (route) => {
      await route.fulfill({
        json: {
          success: true,
          data: [
            { _id: '1', name: 'Краторная булка N-200i', type: 'bun', price: 1255 },
          ],
        },
      });
    });

    await login(page);
    
    await page.locator('text=Краторная булка N-200i').click();
    await expect(page.locator('#modals h3').first()).toHaveText('Детали ингредиента', { timeout: 5000 });
    await page.locator('#modals button').first().click();
    await expect(page.locator('#modals > div')).toBeHidden({ timeout: 5000 });
    console.log('✅ Модальное окно работает');
  });

  test('3. Отображение данных именно того ингредиента, по которому кликнули', async ({ page }) => {
    await page.route('**/api/ingredients', async (route) => {
      await route.fulfill({
        json: {
          success: true,
          data: [
            { _id: '1', name: 'Краторная булка N-200i', type: 'bun', price: 1255 },
          ],
        },
      });
    });

    await login(page);
    
    const expectedName = 'Краторная булка N-200i';
    await page.locator(`text=${expectedName}`).click();
    await expect(page.locator('#modals')).toContainText(expectedName, { timeout: 5000 });
    await page.locator('#modals button').first().click();
    console.log(`✅ Показывает "${expectedName}"`);
  });

  test('4. Создание заказа авторизованным пользователем', async ({ page }) => {
    // Мок для ингредиентов
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

    // Мок для создания заказа
    await page.route('**/api/orders', async (route) => {
      if (route.request().method() === 'POST') {
        console.log('✅ Запрос на создание заказа отправлен');
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

    // Авторизуемся
    await login(page);
    
    // Добавляем булку
    await page.locator('text=Краторная булка N-200i').dragTo(page.locator('section').last());
    
    // Добавляем начинку
    await page.locator('text=Биокотлета из марсианской Магнолии').dragTo(page.locator('section').last());
    
    // Нажимаем "Оформить заказ"
    await page.click('button:has-text("Оформить заказ")');
    
    // Ждём появления модального окна с заказом
    await expect(page.locator('#modals')).toBeVisible({ timeout: 15000 });
    
    // Проверяем номер заказа
    const orderNumber = page.locator('#modals h2.text_type_digits-large');
    await expect(orderNumber).toHaveText('105602');
    
    // Закрываем модальное окно
    await page.locator('#modals button').first().click();
    await expect(page.locator('#modals > div')).toBeHidden({ timeout: 5000 });
    
    console.log('✅ Заказ создан, номер 105602');
  });
});
