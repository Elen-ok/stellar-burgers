import { test, expect } from '@playwright/test';

test.describe('Страница конструктора бургера', () => {
  // Вспомогательная функция для регистрации нового пользователя
  async function registerNewUser(page) {
    const testEmail = `testuser_${Date.now()}@example.com`;
    const testPassword = 'Password123!';
    const testName = 'Test User';

    await page.goto('http://localhost:4000/register');
    await page.fill('input[name="name"]', testName);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button:has-text("Зарегистрироваться")');
    await page.waitForTimeout(3000);

    return { email: testEmail, password: testPassword };
  }

  // Мок для ингредиентов
  async function mockIngredients(page) {
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
  }

  // Мок для создания заказа
  async function mockOrder(page) {
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
  }

  test('1. Добавление ингредиента из списка в конструктор', async ({ page }) => {
    await mockIngredients(page);
    await registerNewUser(page);
    
    await page.goto('http://localhost:4000');
    await page.waitForTimeout(2000);
    
    const addButtons = page.locator('button:has-text("Добавить")');
    await addButtons.first().click();
    await page.waitForTimeout(500);
    
    const constructorItems = await page.locator('.constructor-element').count();
    expect(constructorItems).toBeGreaterThan(0);
    console.log('✅ Ингредиент добавлен в конструктор');
  });

  test('2. Открытие и закрытие модального окна ингредиента', async ({ page }) => {
    await mockIngredients(page);
    await registerNewUser(page);
    
    await page.goto('http://localhost:4000');
    await page.waitForTimeout(2000);
    
    await page.locator('text=Краторная булка N-200i').first().click();
    await expect(page.locator('#modals h3').first()).toHaveText('Детали ингредиента', { timeout: 5000 });
    await page.locator('#modals button').first().click();
    await expect(page.locator('#modals > div')).toBeHidden({ timeout: 5000 });
    console.log('✅ Модальное окно открылось и закрылось');
  });

  test('3. Отображение данных именно того ингредиента, по которому кликнули', async ({ page }) => {
    await mockIngredients(page);
    await registerNewUser(page);
    
    await page.goto('http://localhost:4000');
    await page.waitForTimeout(2000);
    
    const expectedName = 'Краторная булка N-200i';
    await page.locator(`text=${expectedName}`).first().click();
    await expect(page.locator('#modals')).toContainText(expectedName, { timeout: 5000 });
    console.log(`✅ В модалке отображается "${expectedName}"`);
    await page.locator('#modals button').first().click();
  });

  test('4. Создание заказа авторизованным пользователем', async ({ page }) => {
    await mockIngredients(page);
    await mockOrder(page);  // ← ЭТО БЫЛО ПРОПУЩЕНО!
    await registerNewUser(page);
    
    await page.goto('http://localhost:4000');
    await page.waitForTimeout(2000);
    
    // Добавляем булку
    await page.locator('button:has-text("Добавить")').first().click();
    await page.waitForTimeout(500);
    
    // Добавляем начинку
    await page.locator('button:has-text("Добавить")').nth(1).click();
    await page.waitForTimeout(500);
    
    // Оформляем заказ
    await page.click('button:has-text("Оформить заказ")');
    
    // Ждём появления модального окна
    await page.waitForTimeout(2000);
    
    // Проверяем, что в модалке есть номер заказа (105602)
    const modalText = await page.locator('#modals').textContent();
    console.log('Содержимое модалки:', modalText);
    
    // Проверяем номер заказа (ищем цифры)
    const orderNumber = page.locator('#modals h2.text_type_digits-large');
    await expect(orderNumber).toHaveText('105602', { timeout: 10000 });
    
    console.log('✅ Заказ успешно создан, номер 105602');
  });
});
