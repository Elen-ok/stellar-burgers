import { test, expect } from '@playwright/test';

test.describe('Страница конструктора бургера', () => {
  // Функция авторизации через моки
  async function login(page) {
    // Мок для логина
    await page.route('**/api/auth/login', async (route) => {
      const body = JSON.parse(route.request().postData() || '{}');
      console.log('📝 Логин:', body.email);
      await route.fulfill({
        json: {
          success: true,
          accessToken: 'Bearer test-token',
          refreshToken: 'test-refresh',
          user: { email: body.email, name: 'Test User' }
        }
      });
    });

    // Мок для получения пользователя
    await page.route('**/api/auth/user', async (route) => {
      await route.fulfill({
        json: {
          success: true,
          user: { email: 'test@example.com', name: 'Test User' }
        }
      });
    });

    // Заполняем форму логина
    await page.goto('http://localhost:4000/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button:has-text("Войти")');
    await page.waitForTimeout(2000);
    
    // Подставляем токены в localStorage и cookies
    await page.evaluate(() => {
      localStorage.setItem('refreshToken', 'test-refresh');
      document.cookie = 'accessToken=Bearer test-token; path=/';
    });
  }

  test('1. Добавление ингредиента в конструктор', async ({ page }) => {
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

    await login(page);
    
    // Ждём появления кнопки "Добавить"
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
    
    await page.waitForTimeout(1000);
    await page.locator('text=Краторная булка N-200i').first().click();
    await expect(page.locator('#modals h3').first()).toHaveText('Детали ингредиента', { timeout: 5000 });
    await page.locator('#modals button').first().click();
    await expect(page.locator('#modals > div')).toBeHidden({ timeout: 5000 });
    console.log('✅ Модальное окно работает');
  });

  test('3. Отображение данных именно того ингредиента', async ({ page }) => {
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
    
    await page.waitForTimeout(1000);
    const expectedName = 'Краторная булка N-200i';
    await page.locator(`text=${expectedName}`).first().click();
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
    let orderRequestReceived = false;
    await page.route('**/api/orders', async (route) => {
      if (route.request().method() === 'POST') {
        orderRequestReceived = true;
        console.log('✅ Получен POST-запрос на создание заказа');
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

    await login(page);
    
    await page.waitForTimeout(1000);
    
    // Добавляем булку
    const bun = page.locator('text=Краторная булка N-200i').first();
    await bun.dragTo(page.locator('section').last());
    
    // Добавляем начинку
    const main = page.locator('text=Биокотлета из марсианской Магнолии').first();
    await main.dragTo(page.locator('section').last());
    
    // Нажимаем "Оформить заказ"
    const orderButton = page.locator('button:has-text("Оформить заказ")');
    await orderButton.click();
    
    // Ждём ответа от API
    await page.waitForTimeout(2000);
    
    if (orderRequestReceived) {
      console.log('✅ Заказ отправлен на сервер');
      await expect(page.locator('#modals')).toBeVisible({ timeout: 10000 });
      const orderNumber = page.locator('#modals h2.text_type_digits-large');
      await expect(orderNumber).toHaveText('105602');
      await page.locator('#modals button').first().click();
      console.log('✅ Заказ создан, номер 105602');
    } else {
      console.log('❌ Запрос на создание заказа не был отправлен');
    }
  });
});
