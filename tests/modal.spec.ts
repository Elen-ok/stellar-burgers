import { test, expect } from '@playwright/test';

test.describe('Модальное окно ингредиента', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR('./tests/hars/full.har', {
      url: '*/**/api/**',
      notFound: 'abort',
      update: false,
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Закрытие модального окна по оверлею', async ({ page }) => {
    // Открываем модалку
    await page.locator('li').first().click();
    await page.waitForTimeout(500);
    
    // Проверяем, что модалка открылась (появился текст "Детали ингредиента")
    const modalText = page.locator('text=Детали ингредиента');
    await expect(modalText).toBeVisible();
    
    // Закрываем по оверлею: кликаем в координаты, где точно нет модалки
    // (левый верхний угол страницы)
    await page.mouse.click(10, 10);
    await page.waitForTimeout(500);
    
    // ПРОВЕРЯЕМ, что текст "Детали ингредиента" исчез
    await expect(modalText).toBeHidden();
    console.log('✅ Модалка закрыта по оверлею');
  });
});
