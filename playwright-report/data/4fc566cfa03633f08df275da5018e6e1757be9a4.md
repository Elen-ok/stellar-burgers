# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: constructor.spec.ts >> Конструктор бургера >> должен создавать заказ и очищать конструктор
- Location: tests\constructor.spec.ts:74:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[class*="modal"]')
Expected: visible
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('[class*="modal"]')

```

```yaml
- banner:
  - navigation:
    - link "Конструктор":
      - /url: /
      - img
      - paragraph: Конструктор
    - link "Лента заказов":
      - /url: /feed
      - img
      - paragraph: Лента заказов
    - img
    - link "Личный кабинет":
      - /url: /profile
      - img
      - paragraph: Личный кабинет
- main:
  - heading "Соберите бургер" [level=1]
  - navigation:
    - list: Булки Начинки Соусы
  - heading "Булки" [level=3]
  - list:
    - listitem:
      - link "картинка ингредиента. 1255 Краторная булка N-200i":
        - /url: /ingredients/643d69a5c3f7b9001cfa093c
        - img "картинка ингредиента."
        - paragraph: "1255"
        - img
        - paragraph: Краторная булка N-200i
      - button "Добавить":
        - img
        - text: Добавить
  - heading "Начинки" [level=3]
  - list:
    - listitem:
      - link "картинка ингредиента. 424 Биокотлета из марсианской Магнолии":
        - /url: /ingredients/643d69a5c3f7b9001cfa0941
        - img "картинка ингредиента."
        - paragraph: "424"
        - img
        - paragraph: Биокотлета из марсианской Магнолии
      - button "Добавить":
        - img
        - text: Добавить
  - heading "Соусы" [level=3]
  - list:
    - listitem:
      - link "картинка ингредиента. 90 Соус Spicy-X":
        - /url: /ingredients/643d69a5c3f7b9001cfa0942
        - img "картинка ингредиента."
        - paragraph: "90"
        - img
        - paragraph: Соус Spicy-X
      - button "Добавить":
        - img
        - text: Добавить
  - text: Выберите булки
  - list: Выберите начинку
  - text: Выберите булки
  - paragraph: "0"
  - img
  - button "Оформить заказ"
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import ingredientsMock from './mocks/ingredients.json';
  3   | 
  4   | const orderMock = {
  5   |   success: true,
  6   |   order: { number: 12345 }
  7   | };
  8   | 
  9   | const userMock = {
  10  |   success: true,
  11  |   user: { email: 'test@test.com', name: 'Test User' }
  12  | };
  13  | 
  14  | test.describe('Конструктор бургера', () => {
  15  |   test.beforeEach(async ({ page }) => {
  16  |     // Перехватываем запрос ингредиентов
  17  |     await page.route('**/api/ingredients', async (route) => {
  18  |       await route.fulfill({
  19  |         status: 200,
  20  |         contentType: 'application/json',
  21  |         body: JSON.stringify(ingredientsMock)
  22  |       });
  23  |     });
  24  | 
  25  |     // Перехватываем запрос пользователя
  26  |     await page.route('**/api/auth/user', async (route) => {
  27  |       await route.fulfill({
  28  |         status: 200,
  29  |         contentType: 'application/json',
  30  |         body: JSON.stringify(userMock)
  31  |       });
  32  |     });
  33  | 
  34  |     // Добавляем токен авторизации
  35  |     await page.context().addCookies([
  36  |       { name: 'accessToken', value: 'mock-token', domain: 'localhost', path: '/' }
  37  |     ]);
  38  | 
  39  |     await page.goto('/');
  40  |     await page.waitForLoadState('networkidle');
  41  |   });
  42  | 
  43  |   test('должен добавлять булку в конструктор', async ({ page }) => {
  44  |     const bun = page.locator('text=Краторная булка N-200i').first();
  45  |     await bun.click();
  46  |     await expect(page.locator('[class*="constructor-element_pos_top"]')).toBeVisible();
  47  |   });
  48  | 
  49  |   test('должен открывать модальное окно ингредиента', async ({ page }) => {
  50  |     const ingredient = page.locator('text=Биокотлета из марсианской Магнолии').first();
  51  |     await ingredient.click();
  52  |     await expect(page.locator('[class*="modal"]')).toBeVisible();
  53  |   });
  54  | 
  55  |   test('должен закрывать модальное окно по клику на крестик', async ({ page }) => {
  56  |     const ingredient = page.locator('text=Биокотлета из марсианской Магнолии').first();
  57  |     await ingredient.click();
  58  |     await expect(page.locator('[class*="modal"]')).toBeVisible();
  59  |     
  60  |     const closeButton = page.locator('[class*="modal"] button').first();
  61  |     await closeButton.click();
  62  |     await expect(page.locator('[class*="modal"]')).not.toBeVisible();
  63  |   });
  64  | 
  65  |   test('должен закрывать модальное окно по клику на оверлей', async ({ page }) => {
  66  |     const ingredient = page.locator('text=Биокотлета из марсианской Магнолии').first();
  67  |     await ingredient.click();
  68  |     await expect(page.locator('[class*="modal"]')).toBeVisible();
  69  |     
  70  |     await page.mouse.click(10, 10);
  71  |     await expect(page.locator('[class*="modal"]')).not.toBeVisible();
  72  |   });
  73  | 
  74  |   test('должен создавать заказ и очищать конструктор', async ({ page }) => {
  75  |     // Перехватываем запрос на создание заказа
  76  |     await page.route('**/api/orders', async (route) => {
  77  |       await route.fulfill({
  78  |         status: 200,
  79  |         contentType: 'application/json',
  80  |         body: JSON.stringify(orderMock)
  81  |       });
  82  |     });
  83  | 
  84  |     // Добавляем булку
  85  |     const bun = page.locator('text=Краторная булка N-200i').first();
  86  |     await bun.click();
  87  |     
  88  |     // Нажимаем кнопку заказа
  89  |     const orderButton = page.getByRole('button', { name: 'Оформить заказ' });
  90  |     await orderButton.click();
  91  |     
  92  |     // Проверяем модальное окно с номером заказа
  93  |     const modal = page.locator('[class*="modal"]');
> 94  |     await expect(modal).toBeVisible();
      |                         ^ Error: expect(locator).toBeVisible() failed
  95  |     await expect(modal).toContainText('12345');
  96  |     
  97  |     // Закрываем модальное окно
  98  |     const closeButton = page.locator('[class*="modal"] button').first();
  99  |     await closeButton.click();
  100 |     await expect(modal).not.toBeVisible();
  101 |   });
  102 | });
  103 | 
```