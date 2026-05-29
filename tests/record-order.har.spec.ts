import { test } from '@playwright/test';

test('Запись HAR для заказа', async ({ page }) => {
  await page.routeFromHAR('./tests/hars/order.har', { update: true, updateContent: 'embed' });
  
  await page.goto('http://localhost:4000');
  await page.waitForSelector('button:has-text("Добавить")');
  
  await page.locator('button:has-text("Добавить")').first().click();
  await page.locator('li').filter({ hasText: '424' }).first()
    .locator('button:has-text("Добавить")').click();
  await page.click('button:has-text("Оформить заказ")');
  await page.waitForTimeout(2000);
});
