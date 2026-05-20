# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: constructor.spec.ts >> Конструктор бургера >> должен создавать заказ
- Location: tests\constructor.spec.ts:110:7

# Error details

```
Error: locator.click: Target page, context or browser has been closed
Call log:
  - waiting for locator('div').filter({ hasText: 'Краторная булка N-200i' }).first()

```

# Test source

```ts
  22  |   test.beforeEach(async ({ page }) => {
  23  |     // Мокаем запрос на получение ингредиентов
  24  |     await page.route('**/api/ingredients', async (route) => {
  25  |       await route.fulfill({
  26  |         status: 200,
  27  |         contentType: 'application/json',
  28  |         body: JSON.stringify(ingredientsMock),
  29  |       });
  30  |     });
  31  | 
  32  |     // Мокаем запрос на получение пользователя
  33  |     await page.route('**/api/auth/user', async (route) => {
  34  |       await route.fulfill({
  35  |         status: 200,
  36  |         contentType: 'application/json',
  37  |         body: JSON.stringify(userMock),
  38  |       });
  39  |     });
  40  | 
  41  |     // Добавляем моковый токен авторизации
  42  |     await page.context().addCookies([
  43  |       {
  44  |         name: 'accessToken',
  45  |         value: 'mock-access-token-12345',
  46  |         domain: 'localhost',
  47  |         path: '/',
  48  |       },
  49  |     ]);
  50  | 
  51  |     await page.goto('/');
  52  |     await page.waitForLoadState('networkidle');
  53  |   });
  54  | 
  55  |   test('должен добавлять булку в конструктор', async ({ page }) => {
  56  |     // Находим булку по тексту
  57  |     const bun = page.locator('div').filter({ hasText: 'Краторная булка N-200i' }).first();
  58  |     await bun.click();
  59  | 
  60  |     // Проверяем, что булка появилась в конструкторе
  61  |     const constructorElement = page.locator('[class*="constructor-element"]');
  62  |     await expect(constructorElement).toBeVisible();
  63  |   });
  64  | 
  65  |   test('должен открывать модальное окно ингредиента', async ({ page }) => {
  66  |     // Кликаем на ингредиент
  67  |     const ingredient = page.locator('div').filter({ hasText: 'Биокотлета из марсианской Магнолии' }).first();
  68  |     await ingredient.click();
  69  | 
  70  |     // Проверяем, что модальное окно открылось
  71  |     const modal = page.locator('[class*="modal"]');
  72  |     await expect(modal).toBeVisible();
  73  | 
  74  |     // Проверяем, что в модальном окне есть детали
  75  |     await expect(modal).toContainText('Калории');
  76  |     await expect(modal).toContainText('Белки');
  77  |   });
  78  | 
  79  |   test('должен закрывать модальное окно по клику на крестик', async ({ page }) => {
  80  |     // Открываем модальное окно
  81  |     const ingredient = page.locator('div').filter({ hasText: 'Биокотлета из марсианской Магнолии' }).first();
  82  |     await ingredient.click();
  83  | 
  84  |     const modal = page.locator('[class*="modal"]');
  85  |     await expect(modal).toBeVisible();
  86  | 
  87  |     // Кликаем на крестик
  88  |     const closeButton = page.locator('[class*="modal"] button').first();
  89  |     await closeButton.click();
  90  | 
  91  |     // Проверяем, что модальное окно закрылось
  92  |     await expect(modal).not.toBeVisible();
  93  |   });
  94  | 
  95  |   test('должен закрывать модальное окно по клику на оверлей', async ({ page }) => {
  96  |     // Открываем модальное окно
  97  |     const ingredient = page.locator('div').filter({ hasText: 'Биокотлета из марсианской Магнолии' }).first();
  98  |     await ingredient.click();
  99  | 
  100 |     const modal = page.locator('[class*="modal"]');
  101 |     await expect(modal).toBeVisible();
  102 | 
  103 |     // Кликаем на оверлей (область вне модального окна)
  104 |     await page.mouse.click(10, 10);
  105 | 
  106 |     // Проверяем, что модальное окно закрылось
  107 |     await expect(modal).not.toBeVisible();
  108 |   });
  109 | 
  110 |   test('должен создавать заказ', async ({ page }) => {
  111 |     // Мокаем запрос на создание заказа
  112 |     await page.route('**/api/orders', async (route) => {
  113 |       await route.fulfill({
  114 |         status: 200,
  115 |         contentType: 'application/json',
  116 |         body: JSON.stringify(orderMock),
  117 |       });
  118 |     });
  119 | 
  120 |     // Добавляем булку в конструктор
  121 |     const bun = page.locator('div').filter({ hasText: 'Краторная булка N-200i' }).first();
> 122 |     await bun.click();
      |               ^ Error: locator.click: Target page, context or browser has been closed
  123 | 
  124 |     await page.waitForTimeout(500);
  125 | 
  126 |     // Нажимаем кнопку оформления заказа
  127 |     const orderButton = page.getByText('Оформить заказ');
  128 |     await orderButton.click();
  129 | 
  130 |     // Ждём появления модального окна
  131 |     const modal = page.locator('[class*="modal"]');
  132 |     await expect(modal).toBeVisible();
  133 | 
  134 |     // Проверяем, что номер заказа отображается
  135 |     await expect(modal).toContainText('12345');
  136 |   });
  137 | 
  138 |   test('должен очищать конструктор после создания заказа', async ({ page }) => {
  139 |     // Мокаем запрос на создание заказа
  140 |     await page.route('**/api/orders', async (route) => {
  141 |       await route.fulfill({
  142 |         status: 200,
  143 |         contentType: 'application/json',
  144 |         body: JSON.stringify(orderMock),
  145 |       });
  146 |     });
  147 | 
  148 |     // Добавляем булку
  149 |     const bun = page.locator('div').filter({ hasText: 'Краторная булка N-200i' }).first();
  150 |     await bun.click();
  151 | 
  152 |     await page.waitForTimeout(500);
  153 | 
  154 |     // Оформляем заказ
  155 |     const orderButton = page.getByText('Оформить заказ');
  156 |     await orderButton.click();
  157 | 
  158 |     // Ждём модальное окно
  159 |     const modal = page.locator('[class*="modal"]');
  160 |     await expect(modal).toBeVisible();
  161 | 
  162 |     // Закрываем модальное окно
  163 |     const closeButton = page.locator('[class*="modal"] button').first();
  164 |     await closeButton.click();
  165 | 
  166 |     // Проверяем, что конструктор пуст (нет элементов)
  167 |     const constructorElements = page.locator('[class*="constructor-element"]');
  168 |     await expect(constructorElements).toHaveCount(0);
  169 |   });
  170 | });
  171 | 
```